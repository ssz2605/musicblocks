import { LevelExpected } from "./levelExpected.js";

function getActivity() {
    if (typeof globalActivity !== "undefined" && globalActivity?.blocks) {
        return globalActivity;
    }

    if (window.activity?.blocks) {
        return window.activity;
    }

    return null;
}

export const PracticeValidator = {

    validate(problem) {
        console.log("🧪 validate called for level:", problem.level);
        console.log("📚 Available LevelExpected keys:", Object.keys(LevelExpected));

        const levelKey = String(problem.level);
        console.log("levelKey:", levelKey);
        console.log("LevelExpected[levelKey]:", LevelExpected[levelKey]);

        const activity = getActivity();
        if (!activity) return false;

        if (LevelExpected[levelKey] !== undefined) {
            console.log("🔥 Entering structure validation for level:", levelKey);
            return this.validateStructure(levelKey);
        }

        // fallback for simple levels
        return this.validateBasic(problem);
    },

    validateStructure(levelKey) {
        const activity = getActivity();
        if (!activity) {
            console.log("❌ No activity found");
            return false;
        }

        if (!activity.blocks?.blockList) {
            console.log("❌ No blockList found on activity");
            return false;
        }

        const blockList = activity.blocks.blockList;
        console.log("📦 Raw blockList:", blockList);

        const userStructure = this.extractActions(blockList);
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("🌳 USER STRUCTURE:");
        console.log(JSON.stringify(userStructure, null, 2));

        const expected = LevelExpected[levelKey];
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("📘 EXPECTED STRUCTURE:");
        console.log(JSON.stringify(expected, null, 2));
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━");

        if (userStructure.length !== expected.length) {
            console.log("❌ Action count mismatch");
            return false;
        }

        userStructure.sort((a, b) => a.name.localeCompare(b.name));
        expected.sort((a, b) => a.name.localeCompare(b.name));

        const result = this.deepEqual(
            this.normalize(userStructure),
            this.normalize(expected)
        );
        console.log("🆚 FINAL COMPARISON RESULT:", result);

        if (!result) {
            console.log("🔍 USER JSON:", JSON.stringify(userStructure, null, 2));
            console.log("🔍 EXPECTED JSON:", JSON.stringify(expected, null, 2));
        }

        return result;
    },

    extractActions(blockList) {
        const actions = [];
        console.log("🔍 Checking for note blocks in workspace:");

        for (const id in blockList) {
            const block = blockList[id];
            if (!block || block.trash) continue;
            if (
                block.name &&
                block.name.toLowerCase().includes("note") &&
                block.container?.visible !== false
            ) {
                console.log(
                    "🎵 Found NOTE block ID:",
                    id,
                    "name:",
                    block.name,
                    "connections:",
                    block.connections
                );
            }

            if (block.name === "action") {

                const textId = block.connections?.[1];
                const textBlock = blockList[textId];
                const actionName = textBlock?.value || null;

                // STEP 1: get hidden clamp block
                const hiddenId = block.connections?.[2];
                const hiddenBlock = blockList[hiddenId];

                console.log("🟣 Hidden block:", hiddenBlock?.connections);

                // STEP 2: hidden block connection[1] is first body block
                const firstBodyId = hiddenBlock?.connections?.[1];

                console.log("🟢 First body ID:", firstBodyId);

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
        console.log("➡️ Walking block:", block.name, "ID:", block.id);
        console.log("   connections:", block.connections);

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

        console.log("🧭 Starting walkSequence from ID:", startId);

        while (currentId) {
            const current = blockList[currentId];
            if (!current || current.trash) break;

            console.log("   🔁 Visiting:", currentId, current.name);

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
        return Object.values(blockList).some(
            b => b && b.name === name && !b.trash
        );
    },

    countNotes(blockList) {
        return Object.values(blockList).filter(
            b => b?.name?.includes("note") && !b.trash
        ).length;
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