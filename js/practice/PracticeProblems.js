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
        <li>Open the action palette and find your exported rhythm block under the <b>Actions</b> section.</li>
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
    },

    {
        level: 5,
        title: "Geometry and Rhythm I - Build Basic Shapes",
        description: `
      <p>In this lesson, shapes help us understand rhythm. A circle is a whole turn of <b>360 degrees</b>, just like a whole note is one whole unit in rhythm.</p>

      <p>We will begin with simple shapes. Each shape uses the same idea:</p>

      <ul>
        <li>The <b>repeat</b> count tells how many sides the shape has.</li>
        <li>The turtle moves <b>forward</b> to draw each side.</li>
        <li>The turtle turns <b>right</b> by the correct angle each time.</li>
      </ul>

      <p><b>Your task:</b></p>

      <ol>
        <li>You will already see <b>Start</b>, <b>repeat</b>, <b>forward</b>, and <b>right</b> blocks on the screen for your first shape.</li>
        <li>Use them to make a <b>square</b>: repeat <b>4</b> times, go <b>forward 100</b>, and turn <b>right 90</b>.</li>
        <li>Now make a <b>triangle</b> by changing the square idea.</li>
        <li>Then make a <b>pentagon</b> too.</li>
        <li>Keep all three shape programs on the screen at the same time, each with its own <b>Start</b> block.</li>
      </ol>

      <p><b>Think about:</b></p>

      <ul>
        <li>If a square has 4 sides, what repeat number should a triangle use?</li>
        <li>What should happen to the turning angle when the number of sides changes?</li>
        <li>How can you use the same idea again for a pentagon?</li>
      </ul>

      <p><b>Hint:</b> if you want to make a new shape quickly, you can right-click the <b>Start</b> block for your square and choose <b>Duplicate</b>. Then change the numbers in the copied program.</p>

      <p><b>Level check:</b> your project should show three separate programs with three separate <b>Start</b> blocks: one for a square, one for a triangle, and one for a pentagon.</p>
    `,
        expected: {
            basicShapeSet: true
        },
        badgeGroup: "geometry_rhythm"
    },

    {
        level: 6,
        title: "Geometry and Rhythm II - Shapes with Box",
        description: `
      <p>Now we make the shape code more powerful. Instead of typing the same number again and again, we can store it in a <b>box</b>.</p>

      <p><b>What is box1?</b></p>

      <p><b>box1</b> is like a small number container. You put a number into it, and then other blocks can use that same number.</p>

      <p>For example, if <b>box1 = 4</b>:</p>

      <ul>
        <li>The <b>repeat</b> block can use <b>box1</b>, so the shape gets 4 sides.</li>
        <li>The turning angle can use <b>360 / box1</b>, which means <b>360 / 4 = 90</b>.</li>
        <li>If you change <b>box1</b> to 3, 5, or 8, the shape changes too.</li>
      </ul>

      <p><b>What is the divide block?</b></p>

      <p>The <b>divide</b> block helps us calculate the turning angle. When you connect <b>360</b> on top and <b>box1</b> below, the block works out the angle for the shape.</p>

      <p><b>You will already see these blocks on the screen:</b></p>

      <ul>
        <li><b>Start</b></li>
        <li><b>store in box1</b></li>
        <li><b>box1</b></li>
        <li><b>repeat</b></li>
        <li><b>forward</b></li>
        <li><b>right</b></li>
        <li><b>divide</b></li>
        <li><b>add 1 to box1</b></li>
      </ul>

      <p><b>Your task:</b></p>

      <ol>
        <li>Look at the starter code and find where <b>box1</b> is used.</li>
        <li>Connect <b>box1</b> to the <b>repeat</b> block so it controls how many sides the shape has.</li>
        <li>Connect the <b>divide</b> block to the <b>right</b> block so the turn becomes <b>360 / box1</b>.</li>
        <li>Play with the number stored in <b>box1</b> and see how the shape changes.</li>
        <li>Then build a bigger program that makes several shapes by changing <b>box1</b> after each shape.</li>
      </ol>

      <p><b>Hint:</b> first make one shape work with <b>box1</b>. After that, you can repeat the idea and change the value in <b>box1</b> to create many different shapes.</p>

      <p><b>Extra hint for one automatic shape generator:</b></p>

      <p>Use only <b>one Start block</b>. First store a starting value like <b>3</b> in <b>box1</b>. Then use an <b>outer repeat</b> with a normal number like <b>4</b> to decide how many shapes you want to draw. Inside that outer repeat, put your shape code with <b>repeat box1</b>, <b>forward 100</b>, and <b>right 360 / box1</b>. After the shape is finished, use <b>add 1 to box1</b> so the next shape has one more side.</p>

      <p><b>To complete this level, make this automatic generator pattern:</b></p>

      <ol>
        <li>One <b>Start</b> block.</li>
        <li>A block that stores a number in <b>box1</b>.</li>
        <li>An <b>outer repeat</b> with a normal number such as 4.</li>
        <li>Inside it, an <b>inner repeat box1</b> that draws the shape.</li>
        <li>After that shape, an <b>add 1 to box1</b> block.</li>
      </ol>

      <p><b>Level check:</b> the level will complete only when your project shows one automatic shape generator that changes <b>box1</b> by itself and makes different shapes.</p>
    `,
        expected: {
            boxShapeAutomation: true
        },
        badgeGroup: "geometry_rhythm"
    },

    {
        level: 7,
        title: "Geometry and Rhythm III - Whole Note Circle",
        description: `
      <p>Now connect your shape-generator idea to rhythm. Think of a <b>whole note</b> like a whole pizza or a whole circle. If you divide the whole note into equal parts, you can also divide the circle into equal parts.</p>

      <p>In this level, you will build a program that draws a circle <b>over time</b>. The same number should control:</p>

      <ul>
        <li>how many rhythm parts the whole note is divided into</li>
        <li>how many equal arc pieces the circle is divided into</li>
      </ul>

      <p><b>You will already see these blocks on the screen:</b></p>

      <ul>
        <li><b>Start</b></li>
        <li><b>store in box1</b> and <b>box1</b></li>
        <li><b>store in box2</b> and <b>box2</b></li>
        <li><b>repeat</b></li>
        <li><b>note value</b></li>
        <li><b>drum</b></li>
        <li><b>arc</b></li>
        <li><b>divide</b></li>
        <li><b>add 1 to box1</b></li>
        <li><b>add 10 to box2</b></li>
        <li><b>add 10 to color</b></li>
      </ul>

      <p><b>What should box1 and box2 do?</b></p>

      <ul>
        <li>Use <b>box1</b> to decide how many equal rhythm parts and arc parts you want.</li>
        <li>Use <b>box2</b> for the radius so each new circle can become bigger.</li>
      </ul>

      <p><b>Your task:</b></p>

      <ol>
        <li>Build one automatic circle generator with <b>one Start block</b>.</li>
        <li>Use an <b>outer repeat</b> with a normal number so your program makes several circles.</li>
        <li>Inside it, use <b>repeat box1</b> so each circle is divided into equal parts.</li>
        <li>Put a <b>note value</b> block inside the inner repeat.</li>
        <li>Make the note value use <b>1 / box1</b>.</li>
        <li>Inside the <b>note</b>, place a <b>drum</b> and an <b>arc</b>.</li>
        <li>Make the arc angle use <b>360 / box1</b>.</li>
        <li>Use <b>box2</b> as the radius.</li>
        <li>After one full circle, use <b>add 1 to box1</b> so the next circle has more slices.</li>
        <li>Use <b>add 10 to box2</b> so the next circle becomes clearly bigger.</li>
        <li>Use <b>add 10 to color</b> so the circles look different. You can place this either inside the inner repeat or after the inner repeat.</li>
      </ol>

      <p><b>Rough idea for how to connect the blocks:</b></p>

      <p><b>Start</b> -> store a number in <b>box1</b> -> store a number in <b>box2</b> -> <b>outer repeat</b> -> <b>inner repeat box1</b> -> <b>note value 1 / box1</b> -> inside that <b>note</b> put <b>drum</b> and <b>arc</b> -> make the arc use <b>360 / box1</b> and radius <b>box2</b> -> after one full circle, <b>add 1 to box1</b>, <b>add 10 to box2</b>, and use <b>add 10 to color</b>.</p>

      <p><b>Think about:</b></p>

      <ul>
        <li>How does changing <b>box1</b> change both the rhythm and the circle?</li>
        <li>Which note values feel faster? Which feel slower?</li>
        <li>How does changing <b>box2</b> change the drawing?</li>
        <li>What happens when the color changes after each repeat?</li>
      </ul>

      <p><b>Level check:</b> your project should show one automatic whole-note circle generator with an <b>outer repeat</b> for many circles and an <b>inner repeat box1</b> for dividing each circle. The <b>drum</b> and <b>arc</b> must be inside the <b>note</b>. It should use <b>box1</b> in both the note value and the arc angle, use <b>box2</b> for radius, then change <b>box1</b>, <b>box2</b>, and the color so the next circles have more slices, bigger radius, and different colors.</p>
    `,
        expected: {
            cyclicWholeNote: true
        },
        badgeGroup: "geometry_rhythm"
    }
];
