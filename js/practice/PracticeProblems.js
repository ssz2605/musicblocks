export const PracticeProblems = [
  {
    level: 1,
    title: "Hot Cross Buns – Part A",
    description: `
        To explore structure, we will recreate the first part of the melody
        <strong>Hot Cross Buns</strong>.

        Your task:
        • Observe the block structure shown
        • Use only the blocks already on the screen
        • Recreate the same musical structure
        • Do not add extra blocks
    `,
    image: "images/practice/Level1.png",
    expected: {
      blocks: ["start", "note", "pitch"],
      minNotes: 3
    },
    badgeGroup: "melody_basics"
  },

  {
    level: 2,
    title: "Hot Cross Buns – Complete Form",
    description: `
Now extend the melody by repeating patterns.

Your task:
• Use repetition to organize the melody
• The tune should sound structured
• Observe how musical form emerges
    `,
    image: "images/practice/hot_cross_buns_full.png",
    expected: {
      blocks: ["repeat"],
      minNotes: 6
    },
    badgeGroup: "melody_basics"
  },

  {
    level: 3,
    title: "Music + Motion",
    description: `
Music Blocks allows music and motion together.

Your task:
• Add a motion block inside a musical note
• Music and drawing should happen together
    `,
    image: "images/practice/music_and_motion.png",
    expected: {
      graphicsInsideNote: true
    },
    badgeGroup: "music_and_motion"
  }
];
