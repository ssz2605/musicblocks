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

        if (problem.expected?.rhythmMakerWorkflow || levelKey === "3") {
            return this.validateRhythmMakerWorkflow();
        }

        if (problem.expected?.pattern) {
            return this.validatePattern(problem.expected.pattern);
        }
        if (LevelExpected[levelKey] !== undefined) {
            return this.validateStructure(levelKey);
        }

        // fallback for simple levels
        return this.validateBasic(problem);
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

        while (currentId && guard < 20) {
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

    validateRhythmMakerWorkflow() {
        const activity = getActivity();
        if (!activity?.blocks?.blockList) return false;

        const blockList = activity.blocks.blockList;
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

    getActionName(actionBlock, blockList) {
        const textId = actionBlock.connections?.[1];
        return blockList[textId]?.value || null;
    },

    getActionBodyStartId(actionBlock, blockList) {
        const hiddenId = actionBlock.connections?.[2];
        const hiddenBlock = blockList[hiddenId];
        return hiddenBlock?.connections?.[1] || null;
    },

    actionLooksLikeRhythmMakerExport(startId, blockList) {
        let currentId = this.unwrapHiddenFlow(startId, blockList);
        let guard = 0;

        while (currentId && guard < 100) {
            const block = blockList[currentId];
            if (!block || block.trash) return false;

            if (block.name === "rhythm2") {
                return true;
            }

            currentId = this.unwrapHiddenFlow(block.connections?.[3], blockList);
            guard++;
        }

        return false;
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

    validateStructure(levelKey) {
        const activity = getActivity();
        if (!activity) {
            return false;
        }
        if (!activity.blocks?.blockList) {
            return false;
        }

        const blockList = activity.blocks.blockList;
        const userStructure = this.extractActions(blockList);
        const expected = LevelExpected[levelKey];
        if (userStructure.length !== expected.length) {
            return false;
        }

        userStructure.sort((a, b) => a.name.localeCompare(b.name));
        expected.sort((a, b) => a.name.localeCompare(b.name));

        const result = this.deepEqual(this.normalize(userStructure), this.normalize(expected));
        return result;
    },

    extractActions(blockList) {
        const actions = [];
        for (const id in blockList) {
            const block = blockList[id];
            if (!block || block.trash) continue;

            if (block.name === "action") {
                const textId = block.connections?.[1];
                const textBlock = blockList[textId];
                const actionName = textBlock?.value || null;

                // STEP 1: get hidden clamp block
                const hiddenId = block.connections?.[2];
                const hiddenBlock = blockList[hiddenId];

                // STEP 2: hidden block connection[1] is first body block
                const firstBodyId = hiddenBlock?.connections?.[1];

                actions.push({
                    type: "action",
                    name: actionName,
                    body: this.walkSequence(firstBodyId, blockList)
                });
            }
        }
        return actions;
    },

    walkBlock(block, blockList) {
        if (block.name === "action") {
            const textId = block.connections?.[1];
            const textBlock = blockList[textId];
            const actionName = textBlock?.value || null;
            const firstBodyId = block.connections?.[3];

            return {
                type: "action",
                name: actionName,
                body: this.walkSequence(firstBodyId, blockList)
            };
        }

        if (block.name === "repeat") {
            const timesId = block.connections?.[1];
            const times = blockList[timesId]?.value ?? null;

            const firstBodyId = block.connections?.[2];

            return {
                type: "repeat",
                times: times,
                body: this.walkSequence(firstBodyId, blockList)
            };
        }

        if (block.name === "note" || block.name === "newnote") {
            const divideId = block.connections?.[1];
            const divideBlock = blockList[divideId];

            let value = null;

            if (divideBlock?.name === "divide") {
                const num = blockList[divideBlock.connections?.[1]]?.value;
                const den = blockList[divideBlock.connections?.[2]]?.value;
                value = `${num}/${den}`;
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
        let currentId = startId;

        while (currentId) {
            const current = blockList[currentId];
            if (!current || current.trash) break;
            const node = this.walkBlock(current, blockList);
            if (node) result.push(node);

            const nextId = current.connections?.[3];
            const nextBlock = blockList[nextId];

            if (!nextBlock) {
                currentId = null;
            }
            // 🔥 If next block is hidden → unwrap (ACTION case)
            else if (nextBlock.name === "hidden") {
                currentId = nextBlock.connections?.[1] || null;
            }
            // 🔥 Otherwise → direct sibling (REPEAT case)
            else {
                currentId = nextId;
            }
        }

        return result;
    },

    findPitch(noteBlock, blockList) {
        // newnote connection[2] → vspace
        const vspaceId = noteBlock.connections?.[2];
        const vspaceBlock = blockList[vspaceId];

        if (!vspaceBlock) return null;

        console.log("🎯 Pitch wrapper:", vspaceBlock.name);

        // vspace connection[1] → pitch block
        const pitchId = vspaceBlock.connections?.[1];
        const pitchBlock = blockList[pitchId];

        if (!pitchBlock || pitchBlock.name !== "pitch") {
            console.log("⚠️ Pitch block not found");
            return null;
        }

        const nameId = pitchBlock.connections?.[1];
        const octaveId = pitchBlock.connections?.[2];

        const pitchName = blockList[nameId]?.value;
        const octave = blockList[octaveId]?.value;

        console.log("🎼 Extracted:", pitchName, octave);

        if (!pitchName || !octave) return null;

        return `${pitchName}${octave}`;
    },

    normalize(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    deepEqual(a, b) {
        return JSON.stringify(a) === JSON.stringify(b);
    },

    validateBasic(problem) {
        const activity = getActivity();
        if (!activity) return false;

        const blockList = activity.blocks.blockList || {};

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

        while (parent && depth < 10) {
            const parentId = parent.connections?.[0];
            parent = blockList[parentId];
            if (!parent) break;
            if (parent.name === "note" || parent.name === "newnote") return true;
            depth++;
        }
        return false;
    }
};
