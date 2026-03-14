export const PracticeProblems = [
  {
    level: 1,
    title: "Hot Cross Buns – Discover the Form",
    description: `
      Hot Cross Buns has a simple musical form.

      Two musical chunks are already on the screen:

      A = HCB  
      B = Penny  

      Your task:

      1. Arrange the blocks under the Start block to recreate the melody.
      2. The melody structure is **A A B A**.
      3. You can use the **repeat block** to help build the pattern.
      4. Press Play to hear your melody.

      Once you recreate the correct pattern, explore further:

      • Change octaves  
      • Change pitches  
      • Try invert or transpose blocks  
      • Make your own variations
      `,
    expected: {
      pattern: ["A", "A", "B", "A"]
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
