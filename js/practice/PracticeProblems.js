export const PracticeProblems = [
    {
        level: 1,
        title: "Hot Cross Buns - Discover the Form",
        description: `
      <p><b>Hot Cross Buns</b> has a simple musical form.</p>

      <p>Two musical chunks are already on the screen:</p>

      <ul>
        <li><b>A = HCB</b></li>
        <li><b>B = Penny</b></li>
      </ul>

      <p><b>Your task:</b></p>

      <ol>
        <li>Arrange the blocks under the <b>Start</b> block to recreate the melody.</li>
        <li>The melody structure is <b>A A B A</b>.</li>
        <li>You can use the <b>repeat block</b> to help build the pattern.</li>
        <li>Press <b>Play</b> to hear your melody.</li>
      </ol>

      <p><b>Once you recreate the correct pattern, explore further:</b></p>

      <ul>
        <li>Change octaves</li>
        <li>Change pitches</li>
        <li>Try <b>invert</b> or <b>transpose</b> blocks</li>
        <li>Make your own variations</li>
      </ul>
    `,
        expected: {
            pattern: ["A", "A", "B", "A"]
        },
        badgeGroup: "melody_basics"
    },

    {
        level: 2,
        title: "Sakura Sakura",
        description: `
      <p><b>Sakura Sakura - Discover the Melody</b></p>

      <p>
      "Sakura Sakura" is a famous traditional song from <b>Japan</b>.
      In this activity, you will recreate the melody using musical blocks.
      </p>

      <p><b>Following musical chunks are already on the screen:</b></p>

      <ul>
        <li><b>Sakura</b></li>
        <li><b>yayoi</b></li>
        <li><b>miwatasu</b></li>
        <li><b>miniyukan</b></li>
      </ul>

      <p><b>Your task:</b></p>

      <ol>
        <li>Arrange the blocks under the <b>Start</b> block.</li>
        <li>The melody structure is <b>Sakura yayoi miwatasu yayoi miwatasu Sakura miniyukan</b>, and repeat this melody 4 times.</li>
        <li>You may use the <b>repeat block</b> to help build the pattern.</li>
        <li>Press <b>Play</b> to hear your melody.</li>
      </ol>

      <p><b>After you complete the pattern, explore further:</b></p>

      <ul>
        <li>Change pitches</li>
        <li>Try different octaves</li>
        <li>Create your own variation of the melody</li>
      </ul>
    `,
        expected: {
            pattern: [
                "Sakura",
                "yayoi",
                "miwatasu",
                "yayoi",
                "miwatasu",
                "Sakura",
                "miniyukan",
                "Sakura",
                "yayoi",
                "miwatasu",
                "yayoi",
                "miwatasu",
                "Sakura",
                "miniyukan",
                "Sakura",
                "yayoi",
                "miwatasu",
                "yayoi",
                "miwatasu",
                "Sakura",
                "miniyukan",
                "Sakura",
                "yayoi",
                "miwatasu",
                "yayoi",
                "miwatasu",
                "Sakura",
                "miniyukan"
            ]
        },
        badgeGroup: "melody_basics"
    },

    {
        level: 3,
        title: "Beat and Rhythm with Rhythm Maker",
        description: `
      <p><b>Beat</b> is the steady pulse of music. <b>Rhythm</b> is the pattern of long and short sounds played on that beat.</p>

      <p>This level helps you move from arranging ready-made blocks to creating your own rhythm in Music Blocks.</p>

      <p><b>Your task:</b></p>

      <ol>
        <li>Open <b>Rhythm Maker</b>.</li>
        <li>Create a steady beat and try a few rhythm variations.</li>
        <li>Click <b>Save rhythms</b> to export your rhythm as an <b>action block</b>.</li>
        <li> Open the action palette and find your exported rhythm block under the <b>Actions</b> section.</li>
        <li>Use the exported action block under the <b>Start</b> block to make your composition.</li>
        <li>Press <b>Play</b> and listen to your result.</li>
      </ol>

      <p><b>Think about:</b></p>

      <ul>
        <li>Which part feels like the steady beat?</li>
        <li>Which part shows rhythm changes?</li>
        <li>How does the sound change when notes become shorter or longer?</li>
      </ul>
    `,
        expected: {
            rhythmMakerWorkflow: true
        },
        badgeGroup: "rhythm_basics"
    }
];
