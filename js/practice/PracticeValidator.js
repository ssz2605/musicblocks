import { LevelExpected } from "./levelExpected.js";

function getActivity() {
    if (window.ActivityContext && typeof window.ActivityContext.getActivity === "function") {
        try {
            const activity = window.ActivityContext.getActivity();
            if (activity?.blocks) {
                return activity;
            }
        } catch (e) {
            // Activity may not be initialized yet.
        }
    }

    return null;
}

export const PracticeValidator = {
    validate(problem) {
        const levelKey = String(problem.level);
        const activity = getActivity();
        if (!activity) return false;

        if (problem.expected?.rhythmMakerWorkflow) {
            return this.validateRhythmMakerWorkflow();
        }

        if (problem.expected?.basicShapeSet) {
            return this.validateBasicShapeSet();
        }

        if (problem.expected?.boxShapeAutomation) {
            return this.validateBoxShapeAutomation();
        }

        if (problem.expected?.cyclicWholeNote) {
            return this.validateCyclicWholeNote();
        }

        if (problem.expected?.pattern) {
            return this.validatePattern(problem.expected.pattern);
        }

        if (LevelExpected[levelKey] !== undefined) {
            return this.validateStructure(levelKey);
        }

        return this.validateBasic(problem);
    },

    getBoxShapeAutomationDebug() {
        const blockList = this.getBlockList();
        const startBlocks = Object.values(blockList).filter(
            block => block?.name === "start" && !block.trash
        );

        const startSummaries = startBlocks.map(startBlock =>
            this.getStartBlockBoxAutomationDebug(startBlock, blockList)
        );

        return {
            startCount: startBlocks.length,
            startSummaries
        };
    },

    validatePattern(expectedPattern) {
        const activity = getActivity();
        if (!activity?.blocks?.blockList) return false;

        const blockList = activity.blocks.blockList;
        const startBlock = Object.values(blockList).find(b => b?.name === "start" && !b.trash);
        if (!startBlock) return false;

        const sequence = this.extractPatternSequence(startBlock.connections?.[1], blockList);
        return JSON.stringify(sequence) === JSON.stringify(expectedPattern);
    },

    validateRhythmMakerWorkflow() {
        const blockList = this.getBlockList();
        const exportedActions = this.getRhythmMakerActionNames(blockList);
        if (exportedActions.size === 0) return false;

        const referencedActions = this.getStartActionReferences(blockList);
        for (const actionName of referencedActions) {
            if (exportedActions.has(actionName)) {
                return true;
            }
        }

        return false;
    },

    validateBasicShapeSet() {
        const blockList = this.getBlockList();
        const startBlocks = Object.values(blockList).filter(
            block => block?.name === "start" && !block.trash
        );

        const remainingSides = new Set([3, 4, 5]);

        for (const startBlock of startBlocks) {
            const matchedSides = this.getStartBlockPolygonSides(startBlock, blockList);
            for (const sides of matchedSides) {
                remainingSides.delete(sides);
            }
        }

        return remainingSides.size === 0;
    },

    validateBoxShapeAutomation() {
        const blockList = this.getBlockList();
        const startBlocks = Object.values(blockList).filter(
            block => block?.name === "start" && !block.trash
        );

        return startBlocks.some(startBlock =>
            this.startBlockMatchesBoxShapeAutomation(startBlock, blockList)
        );
    },

    validateCyclicWholeNote() {
        const blockList = this.getBlockList();
        const startBlocks = Object.values(blockList).filter(
            block => block?.name === "start" && !block.trash
        );

        return startBlocks.some(startBlock =>
            this.startBlockMatchesCyclicWholeNote(startBlock, blockList)
        );
    },

    extractPatternSequence(startId, blockList) {
        const sequence = [];
        let currentId = this.unwrapHiddenFlow(startId, blockList);

        while (currentId) {
            const block = blockList[currentId];
            if (!block || block.trash) break;

            if (block.name === "nameddo") {
                const name = block.overrideName || block.privateData;
                if (name) {
                    sequence.push(name);
                }
                currentId = this.getNextPatternBlockId(block, blockList);
                continue;
            }

            if (block.name === "repeat") {
                const timesId = block.connections?.[1];
                const times = Number(blockList[timesId]?.value) || 1;
                const body = this.extractPatternSequence(block.connections?.[2], blockList);

                for (let i = 0; i < times; i++) {
                    sequence.push(...body);
                }

                currentId = this.unwrapHiddenFlow(block.connections?.[3], blockList);
                continue;
            }

            if (block.name === "hidden") {
                currentId = this.unwrapHiddenFlow(block.connections?.[1], blockList);
                continue;
            }

            break;
        }

        return sequence;
    },

    unwrapHiddenFlow(blockId, blockList) {
        let currentId = blockId || null;
        let guard = 0;

        while (currentId && guard < 50) {
            const block = blockList[currentId];
            if (!block || block.trash) return null;
            if (block.name !== "hidden") return currentId;
            currentId = block.connections?.[1] || null;
            guard++;
        }

        return currentId;
    },

    getNextPatternBlockId(block, blockList) {
        return this.unwrapHiddenFlow(
            block.connections?.[1] || block.connections?.[3] || null,
            blockList
        );
    },

    validateStructure(levelKey) {
        const blockList = this.getBlockList();
        const userStructure = this.extractActions(blockList);
        const expected = LevelExpected[levelKey];
        if (userStructure.length !== expected.length) {
            return false;
        }

        userStructure.sort((a, b) => a.name.localeCompare(b.name));
        expected.sort((a, b) => a.name.localeCompare(b.name));

        return this.deepEqual(this.normalize(userStructure), this.normalize(expected));
    },

    extractActions(blockList) {
        const actions = [];
        for (const id in blockList) {
            const block = blockList[id];
            if (!block || block.trash || block.name !== "action") continue;

            const actionName = this.getActionName(block, blockList);
            const firstBodyId = this.getActionBodyStartId(block, blockList);

            actions.push({
                type: "action",
                name: actionName,
                body: this.walkSequence(firstBodyId, blockList)
            });
        }

        return actions;
    },

    walkBlock(block, blockList) {
        if (block.name === "action") {
            const actionName = this.getActionName(block, blockList);
            return {
                type: "action",
                name: actionName,
                body: this.walkSequence(this.getActionBodyStartId(block, blockList), blockList)
            };
        }

        if (block.name === "repeat") {
            return {
                type: "repeat",
                times: this.getNumericValue(block.connections?.[1], blockList),
                body: this.walkSequence(block.connections?.[2], blockList)
            };
        }

        if (this.isNoteBlock(block)) {
            const divideId = block.connections?.[1];
            const divideBlock = blockList[divideId];

            let value = null;
            if (divideBlock?.name === "divide") {
                const num = this.getNumericValue(divideBlock.connections?.[1], blockList);
                const den = this.getNumericValue(divideBlock.connections?.[2], blockList);
                value = num && den ? `${num}/${den}` : null;
            }

            return {
                type: "note",
                value: value,
                pitch: this.findPitch(block, blockList)
            };
        }

        return null;
    },

    walkSequence(startId, blockList) {
        const result = [];
        let currentId = this.unwrapHiddenFlow(startId, blockList);
        let guard = 0;

        while (currentId && guard < 100) {
            const current = blockList[currentId];
            if (!current || current.trash) break;

            const node = this.walkBlock(current, blockList);
            if (node) result.push(node);

            currentId = this.getNextFlowId(current, blockList);
            guard++;
        }

        return result;
    },

    findPitch(noteBlock, blockList) {
        const vspaceId = noteBlock.connections?.[2];
        const vspaceBlock = blockList[vspaceId];
        const pitchId = vspaceBlock?.connections?.[1];
        const pitchBlock = blockList[pitchId];

        if (!pitchBlock || pitchBlock.name !== "pitch") return null;

        const pitchName = blockList[pitchBlock.connections?.[1]]?.value;
        const octave = blockList[pitchBlock.connections?.[2]]?.value;
        if (!pitchName || !octave) return null;

        return `${pitchName}${octave}`;
    },

    validateBasic(problem) {
        const blockList = this.getBlockList();

        if (problem.expected?.blocks) {
            for (const name of problem.expected.blocks) {
                if (!this.hasBlock(blockList, name)) return false;
            }
        }

        if (problem.expected?.minNotes) {
            const count = this.countNotes(blockList);
            if (count < problem.expected.minNotes) return false;
        }

        if (problem.expected?.graphicsInsideNote) {
            if (!this.hasGraphicsInsideNote(blockList)) return false;
        }

        return true;
    },

    getBlockList() {
        const activity = getActivity();
        return activity?.blocks?.blockList || {};
    },

    getActionName(actionBlock, blockList) {
        return blockList[actionBlock.connections?.[1]]?.value || null;
    },

    getActionBodyStartId(actionBlock, blockList) {
        const hiddenBlock = blockList[actionBlock.connections?.[2]];
        return hiddenBlock?.connections?.[1] || null;
    },

    getRhythmMakerActionNames(blockList) {
        const exportedActions = new Set();

        for (const block of Object.values(blockList)) {
            if (!block || block.trash || block.name !== "action") continue;

            const actionName = this.getActionName(block, blockList);
            const firstBodyId = this.getActionBodyStartId(block, blockList);
            if (!actionName || !firstBodyId) continue;

            if (this.actionLooksLikeRhythmMakerExport(firstBodyId, blockList)) {
                exportedActions.add(actionName);
            }
        }

        return exportedActions;
    },

    actionLooksLikeRhythmMakerExport(startId, blockList) {
        const ids = this.collectSequence(startId, blockList);
        return ids.some(id => blockList[id]?.name === "rhythm2");
    },

    getStartActionReferences(blockList) {
        const references = new Set();

        for (const block of Object.values(blockList)) {
            if (!block || block.trash || block.name !== "nameddo") continue;
            if (!this.hasAncestorNamed(block, blockList, "start")) continue;

            const actionName = block.overrideName || block.privateData || block.value;
            if (actionName) {
                references.add(actionName);
            }
        }

        return references;
    },

    hasPolygonRepeat(blockList, sides) {
        for (const block of Object.values(blockList)) {
            if (!block || block.trash || block.name !== "repeat") continue;
            if (this.getNumericValue(block.connections?.[1], blockList) !== sides) continue;

            const bodyIds = this.collectSequence(block.connections?.[2], blockList);
            const hasForward = bodyIds.some(id => blockList[id]?.name === "forward");
            const hasRight = bodyIds.some(
                id =>
                    blockList[id]?.name === "right" &&
                    this.rightAngleMatchesSides(blockList[id], blockList, sides)
            );

            if (hasForward && hasRight) {
                return true;
            }
        }

        return false;
    },

    getStartBlockPolygonSides(startBlock, blockList) {
        const matchedSides = new Set();
        const bodyIds = this.collectSequence(startBlock.connections?.[1], blockList);

        for (const id of bodyIds) {
            const block = blockList[id];
            if (!block || block.trash || block.name !== "repeat") continue;

            for (const sides of [3, 4, 5]) {
                if (this.getNumericValue(block.connections?.[1], blockList) !== sides) continue;

                const repeatBodyIds = this.collectSequence(block.connections?.[2], blockList);
                const hasForward = repeatBodyIds.some(
                    repeatId => blockList[repeatId]?.name === "forward"
                );
                const hasRight = repeatBodyIds.some(
                    repeatId =>
                        blockList[repeatId]?.name === "right" &&
                        this.rightAngleMatchesSides(blockList[repeatId], blockList, sides)
                );

                if (hasForward && hasRight) {
                    matchedSides.add(sides);
                }
            }
        }

        return matchedSides;
    },

    startBlockMatchesBoxShapeAutomation(startBlock, blockList) {
        const startSequence = this.collectSequence(startBlock.connections?.[1], blockList);
        if (startSequence.length === 0) return false;

        const hasBoxInitialization = startSequence.some(id =>
            this.isBoxStoreBlock(blockList[id], blockList, "box1")
        );
        if (!hasBoxInitialization) return false;

        for (const id of startSequence) {
            const block = blockList[id];
            if (!block || block.trash || block.name !== "repeat") continue;

            const repeatCount = this.getNumericValue(block.connections?.[1], blockList);
            if (typeof repeatCount !== "number" || repeatCount < 2) continue;

            const outerBodyIds = this.collectSequence(block.connections?.[2], blockList);
            const innerRepeatIndex = outerBodyIds.findIndex(
                bodyId =>
                    blockList[bodyId]?.name === "repeat" &&
                    this.isBoxReference(blockList[bodyId]?.connections?.[1], blockList, "box1") &&
                    this.repeatBodyMatchesBoxPolygon(blockList[bodyId], blockList, "box1")
            );

            if (innerRepeatIndex === -1) continue;

            const hasIncrementAfterShape = outerBodyIds
                .slice(innerRepeatIndex + 1)
                .some(bodyId => this.isBoxIncrementBlock(blockList[bodyId], blockList, "box1"));

            if (hasIncrementAfterShape) {
                return true;
            }
        }

        return false;
    },

    getStartBlockBoxAutomationDebug(startBlock, blockList) {
        const startSequence = this.collectSequence(startBlock.connections?.[1], blockList);
        const hasBoxInitialization = startSequence.some(id =>
            this.isBoxStoreBlock(blockList[id], blockList, "box1")
        );

        const outerRepeats = startSequence
            .map(id => blockList[id])
            .filter(block => block && !block.trash && block.name === "repeat")
            .map(block => {
                const repeatCount = this.getNumericValue(block.connections?.[1], blockList);
                const outerBodyIds = this.collectSequence(block.connections?.[2], blockList);
                const innerRepeatIndex = outerBodyIds.findIndex(
                    bodyId =>
                        blockList[bodyId]?.name === "repeat" &&
                        this.isBoxReference(blockList[bodyId]?.connections?.[1], blockList, "box1") &&
                        this.repeatBodyMatchesBoxPolygon(blockList[bodyId], blockList, "box1")
                );

                const hasIncrementAfterShape =
                    innerRepeatIndex !== -1 &&
                    outerBodyIds
                        .slice(innerRepeatIndex + 1)
                        .some(bodyId =>
                            this.isBoxIncrementBlock(blockList[bodyId], blockList, "box1")
                        );

                return {
                    repeatCount,
                    bodyLength: outerBodyIds.length,
                    hasInnerRepeatBoxShape: innerRepeatIndex !== -1,
                    hasIncrementAfterShape
                };
            });

        return {
            hasBoxInitialization,
            flowLength: startSequence.length,
            outerRepeats
        };
    },

    startBlockMatchesCyclicWholeNote(startBlock, blockList) {
        const startSequence = this.collectSequence(startBlock.connections?.[1], blockList);
        if (startSequence.length === 0) return false;

        const hasBox1Initialization = startSequence.some(id =>
            this.isBoxStoreBlock(blockList[id], blockList, "box1")
        );
        const hasBox2Initialization = startSequence.some(id =>
            this.isBoxStoreBlock(blockList[id], blockList, "box2")
        );

        if (!hasBox1Initialization || !hasBox2Initialization) return false;

        for (const id of startSequence) {
            const outerRepeat = blockList[id];
            if (!outerRepeat || outerRepeat.trash || outerRepeat.name !== "repeat") continue;

            const outerRepeatCount = this.getNumericValue(outerRepeat.connections?.[1], blockList);
            if (typeof outerRepeatCount !== "number" || outerRepeatCount < 2) continue;

            const outerBodyIds = this.collectSequence(outerRepeat.connections?.[2], blockList);
            const hasBox1Increment = outerBodyIds.some(bodyId =>
                this.isBoxIncrementBlock(blockList[bodyId], blockList, "box1")
            );
            const hasRadiusIncrement = outerBodyIds.some(bodyId =>
                this.isIncrementTargetingBoxWithStep(blockList[bodyId], blockList, "box2", 10)
            );
            const hasColorIncrement = outerBodyIds.some(bodyId =>
                this.isIncrementTargetingBlock(blockList[bodyId], blockList, "color")
            );

            const innerRepeat = outerBodyIds
                .map(bodyId => blockList[bodyId])
                .find(
                    candidate =>
                        candidate &&
                        !candidate.trash &&
                        candidate.name === "repeat" &&
                        this.isBoxReference(candidate.connections?.[1], blockList, "box1")
                );

            if (!innerRepeat) continue;

            const innerBodyIds = this.collectSequence(innerRepeat.connections?.[2], blockList);
            const hasInnerColorIncrement = innerBodyIds.some(bodyId =>
                this.isIncrementTargetingBlock(blockList[bodyId], blockList, "color")
            );
            const noteBlock = innerBodyIds
                .map(bodyId => blockList[bodyId])
                .find(candidate => candidate && !candidate.trash && this.isNoteBlock(candidate));

            if (!noteBlock) continue;
            if (!this.noteUsesBoxDenominator(noteBlock, blockList, "box1")) continue;

            const noteBodyIds = this.collectSequence(
                this.getNoteBodyStartId(noteBlock, blockList),
                blockList
            );
            const hasDrum = noteBodyIds.some(bodyId => blockList[bodyId]?.name === "playdrum");
            const hasArc = noteBodyIds.some(bodyId => {
                const arcBlock = blockList[bodyId];
                return (
                    arcBlock?.name === "arc" &&
                    this.isDivideExpression(arcBlock.connections?.[1], blockList, 360, "box1") &&
                    this.isBoxReference(arcBlock.connections?.[2], blockList, "box2")
                );
            });

            if (
                hasDrum &&
                hasArc &&
                (hasColorIncrement || hasInnerColorIncrement) &&
                hasBox1Increment &&
                hasRadiusIncrement &&
                (hasColorIncrement || hasInnerColorIncrement)
            ) {
                return true;
            }
        }

        return false;
    },

    repeatBodyMatchesBoxPolygon(repeatBlock, blockList, boxName) {
        const bodyIds = this.collectSequence(repeatBlock.connections?.[2], blockList);
        const hasForward = bodyIds.some(id => blockList[id]?.name === "forward");
        const hasRight = bodyIds.some(
            id =>
                blockList[id]?.name === "right" &&
                this.isDivideExpression(blockList[id]?.connections?.[1], blockList, 360, boxName)
        );

        return hasForward && hasRight;
    },

    noteUsesBoxDenominator(noteBlock, blockList, boxName) {
        const divideBlock = blockList[noteBlock.connections?.[1]];
        if (!divideBlock || divideBlock.name !== "divide") return false;

        return (
            this.getNumericValue(divideBlock.connections?.[1], blockList) === 1 &&
            this.isBoxReference(divideBlock.connections?.[2], blockList, boxName)
        );
    },

    getNoteBodyStartId(noteBlock, blockList) {
        const vspaceBlock = blockList[noteBlock.connections?.[2]];
        return vspaceBlock?.connections?.[1] || null;
    },

    hasRepeatAncestorUsingBox(block, blockList, boxName) {
        let current = block;
        let guard = 0;

        while (current && guard < 50) {
            const parentId = current.connections?.[0];
            if (parentId === null || parentId === undefined) return false;

            const parent = blockList[parentId];
            if (!parent || parent.trash) return false;

            if (
                parent.name === "repeat" &&
                this.isBoxReference(parent.connections?.[1], blockList, boxName)
            ) {
                return true;
            }

            current = parent;
            guard++;
        }

        return false;
    },

    hasAncestorNamed(block, blockList, ancestorName) {
        let current = block;
        let guard = 0;

        while (current && guard < 50) {
            const parentId = current.connections?.[0];
            if (parentId === null || parentId === undefined) return false;

            const parent = blockList[parentId];
            if (!parent || parent.trash) return false;
            if (parent.name === ancestorName) return true;

            current = parent;
            guard++;
        }

        return false;
    },

    collectSequence(startId, blockList, limit = 100) {
        const ids = [];
        let currentId = this.unwrapHiddenFlow(startId, blockList);
        let guard = 0;

        while (currentId && guard < limit) {
            const block = blockList[currentId];
            if (!block || block.trash) break;

            ids.push(currentId);
            currentId = this.getNextFlowId(block, blockList);
            guard++;
        }

        return ids;
    },

    getNextFlowId(block, blockList) {
        if (!block?.connections?.length) return null;
        return this.unwrapHiddenFlow(block.connections[block.connections.length - 1], blockList);
    },

    getNumericValue(blockId, blockList, depth = 0) {
        if (!blockId || depth > 10) return null;

        const block = blockList[blockId];
        if (!block || block.trash) return null;

        if (typeof block.value === "number") {
            return Number(block.value);
        }

        if (block.name === "number") {
            return Number(block.value);
        }

        if (block.name === "divide") {
            const numerator = this.getNumericValue(block.connections?.[1], blockList, depth + 1);
            const denominator = this.getNumericValue(block.connections?.[2], blockList, depth + 1);

            if (
                typeof numerator === "number" &&
                typeof denominator === "number" &&
                denominator !== 0
            ) {
                return numerator / denominator;
            }
        }

        return null;
    },

    getTextValue(blockId, blockList) {
        const block = blockList[blockId];
        if (!block || block.trash) return null;

        if (typeof block.value === "string") return block.value;
        if (typeof block.privateData === "string") return block.privateData;
        if (typeof block.overrideName === "string") return block.overrideName;

        return null;
    },

    isDivideExpression(blockId, blockList, numeratorValue, denominatorMatcher) {
        const block = blockList[blockId];
        if (!block || block.trash || block.name !== "divide") return false;

        const numerator = this.getNumericValue(block.connections?.[1], blockList);
        if (numerator !== numeratorValue) return false;

        if (typeof denominatorMatcher === "number") {
            return this.getNumericValue(block.connections?.[2], blockList) === denominatorMatcher;
        }

        return this.isBoxReference(block.connections?.[2], blockList, denominatorMatcher);
    },

    isBoxReference(blockId, blockList, boxName) {
        if (!blockId) return false;
        const block = blockList[blockId];
        if (!block || block.trash) return false;

        if (block.name === boxName) return true;

        if (block.name === "namedbox") {
            return (block.value || block.privateData || block.overrideName) === boxName;
        }

        if (block.name === "box") {
            return this.getTextValue(block.connections?.[1], blockList) === boxName;
        }

        return false;
    },

    hasBoxInitialization(blockList, boxName) {
        return Object.values(blockList).some(block =>
            this.isBoxStoreBlock(block, blockList, boxName)
        );
    },

    isBoxStoreBlock(block, blockList, boxName) {
        if (!block || block.trash) return false;

        if (block.name === `store${boxName}`) return true;

        if (block.name === "storein2") {
            return (block.privateData || block.value || block.overrideName) === boxName;
        }

        if (block.name === "storein") {
            return this.getTextValue(block.connections?.[1], blockList) === boxName;
        }

        if (block.name === "storebox1") return boxName === "box1";
        if (block.name === "storebox2") return boxName === "box2";

        return false;
    },

    isBoxIncrementBlock(block, blockList, boxName) {
        if (!block || block.trash) return false;
        if (block.name !== "increment" && block.name !== "incrementOne") return false;

        return this.isBoxReference(block.connections?.[1], blockList, boxName);
    },

    isIncrementTargetingBlock(block, blockList, blockName) {
        if (!block || block.trash) return false;
        if (block.name !== "increment" && block.name !== "incrementOne") return false;

        const targetBlock = blockList[block.connections?.[1]];
        return !!(targetBlock && !targetBlock.trash && targetBlock.name === blockName);
    },

    isIncrementTargetingBoxWithStep(block, blockList, boxName, step) {
        if (!block || block.trash) return false;
        if (block.name === "incrementOne") {
            return step === 1 && this.isBoxReference(block.connections?.[1], blockList, boxName);
        }

        if (block.name !== "increment") return false;

        return (
            this.isBoxReference(block.connections?.[1], blockList, boxName) &&
            this.getNumericValue(block.connections?.[2], blockList) === step
        );
    },

    rightAngleMatchesSides(rightBlock, blockList, sides) {
        const angleId = rightBlock.connections?.[1];
        const numericAngle = this.getNumericValue(angleId, blockList);
        if (numericAngle === 360 / sides) return true;

        return this.isDivideExpression(angleId, blockList, 360, sides);
    },

    isNoteBlock(block) {
        return block?.name === "note" || block?.name === "newnote";
    },

    normalize(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    deepEqual(a, b) {
        return JSON.stringify(a) === JSON.stringify(b);
    },

    hasBlock(blockList, name) {
        return Object.values(blockList).some(b => b && b.name === name && !b.trash);
    },

    countNotes(blockList) {
        return Object.values(blockList).filter(b => b?.name?.includes("note") && !b.trash).length;
    },

    hasGraphicsInsideNote(blockList) {
        for (const block of Object.values(blockList)) {
            if (block?.name === "forward" && this.isInsideNote(block, blockList)) {
                return true;
            }
        }

        return false;
    },

    isInsideNote(block, blockList) {
        let parent = block;
        let depth = 0;

        while (parent && depth < 20) {
            const parentId = parent.connections?.[0];
            parent = blockList[parentId];
            if (!parent) break;
            if (this.isNoteBlock(parent)) return true;
            depth++;
        }

        return false;
    }
};
