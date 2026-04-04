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
    level: 4,
    title: "Chest, Snap, Clap – Build the Rhythm",
    description: `
    <p><b>Chest, Snap, Clap</b> is a fun rhythm you can perform on your own body no drums needed!</p>

    <p>You will transcribe and recreate this rhythm using Music Blocks' <b>Phrase Maker</b>.</p>

    <p><b>Your task:</b></p>

    <ol>
        <li>Open <b>Phrase Maker</b> and add drum blocks for <b>chest, snap, and clap</b> sounds.</li>
        <li>Transcribe the <b>first half</b> of the rhythm: use <b>8 eighth notes</b> in the Phrase Maker.</li>
        <li>Transcribe the <b>second half</b>: use <b>7 eighth notes and 2 sixteenth notes</b>.</li>
        <li>Export both halves as <b>Action blocks</b> from Phrase Maker.</li>
        <li>Place the Action blocks under the <b>Start</b> block.</li>
        <li>Use a <b>repeat block</b> to loop your rhythm.</li>
        <li>Press <b>Play</b> to hear your rhythm.</li>
    </ol>

    <p><b>Think about:</b></p>

    <ul>
        <li>What is the first sound? The second? The third?</li>
        <li>Are there any patterns in the first half? Does anything repeat?</li>
        <li>How does the first half differ from the second half?</li>
        <li>How do shorter notes (sixteenth notes) change the feel of the rhythm?</li>
    </ul>

    <p><b>Once you complete the rhythm, explore further:</b></p>

    <ul>
        <li>Change drum sounds by clicking the drum name to open the pie menu.</li>
        <li>Create your own rhythm variations.</li>
        <li>Try different note durations.</li>
    </ul>

    <p><b>Level check:</b> your project should express the two-part form using Action blocks from Phrase Maker, looped with a repeat block.</p>
    `,
    image: "images/practice/Level4.webp",
    expected: {
        blocks: ["repeat", "playdrum"],
        phraseMakerWorkflow: true,
        twoPartForm: true,
        minNotes: 6
    },
    badgeGroup: "rhythm_basics"
}
,

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
    },
    {
    level: 8,
    title: "Animated Polyrhythms",
    description: `
    <p><b>Polyrhythm</b> means playing two different rhythms together at the same time.</p>

    <p>In this activity, you will create polyrhythms and visualize them using animations.</p>

    <p><b>Your task:</b></p>

    <ol>
        <li>Open the <b>Rhythm Ruler</b> widget with two drum blocks.</li>
        <li>With one ruler, divide by <b>2 (duplets)</b>.</li>
        <li>With the other ruler, divide by <b>3 (triplets)</b>.</li>
        <li>Save out your drum machines.</li>
        <li>Play both rhythms together to hear the polyrhythm.</li>
        <li>Add an <b>Avatar block</b> inside your notes to create animation.</li>
        <li>Use <b>On-every-note-do</b> to animate each note.</li>
    </ol>

    <p><b>Explore further:</b></p>
    <ul>
        <li>Try using <b>pitches instead of drums</b> to create a melodic polyrhythm.</li>
        <li>Experiment with other divisors beyond 2 and 3.</li>
    </ul>

    <p><b>Think about:</b></p>

    <ul>
        <li>When do the two rhythms align?</li>
        <li>When do they go out of sync?</li>
        <li>How does the animation show <b>phase shifts</b> between the two rhythms?</li>
        <li>How does the animation help you understand rhythm?</li>
    </ul>

    <p><b>Level check:</b> your project should include two different rhythms (divisor 2 & 3) playing together, with animation using avatars and <b>On-every-note-do</b>.</p>
    `,
    expected: {
        polyrhythm: true,
        avatarAnimation: true,
        onEveryNoteDo: true,
        rhythmRuler: true
    },
    badgeGroup: "polyrhythm"
},
{
    level: 9,
    title: "Circular Rhythm Maker – Broadcast & Events",
    description: `
    <p><b>Broadcast</b> is a way for one part of a program to send a signal to another part. In music, think of it like a conductor calling out each beat and each drummer listening for their cue.</p>

    <p>In this activity, you will build a <b>Circular Rhythm Maker</b> using mice, events, and broadcast just like the conductor circle from the lesson.</p>

    <p><b>Your task:</b></p>

    <ol>
        <li>Create <b>12 drum mice</b> arranged in a circle using the <b>setxy</b> block.</li>
        <li>Use <b>box</b> blocks to store which drum sound each mouse plays (0 for clap, 1 for ride bell).</li>
        <li>Use the <b>plus (+) block</b> to create a unique event name for each drum mouse: <b>event0, event1, … event11</b>.</li>
        <li>Set up a <b>conductor mouse</b> that walks around the circle using the <b>arc</b> block, broadcasting each event in turn.</li>
        <li>Use <b>mod 12</b> to keep the conductor looping endlessly around the circle.</li>
        <li>Make each drum mouse respond to a <b>click</b> clicking it should toggle its drum sound using the <b>1 minus box</b> trick.</li>
        <li>Press <b>Play</b> and click on drum mice to change the rhythm live!</li>
    </ol>

    <p><b>Think about:</b></p>

    <ul>
        <li>What does broadcast mean in everyday life? In programming?</li>
        <li>How is the conductor mouse similar to the human conductor from the intro activity?</li>
        <li>How does <b>mod 12</b> keep the count from going past 11?</li>
        <li>What happens when you click several mice before the conductor reaches them?</li>
    </ul>

    <p><b>Explore further:</b></p>
    <ul>
        <li>Change the number of drum mice (try 8 or 16).</li>
        <li>Add more drum sounds beyond clap and ride bell.</li>
        <li>Create dances or animations for the drum mice using <b>Avatar</b> blocks.</li>
        <li>Use an <b>Input block</b> to let the player choose how many drums to place.</li>
    </ul>

    <p><b>Level check:</b> your project should have a conductor mouse broadcasting events to drum mice arranged in a circle, with clickable drums that toggle their sound using boxes and the <b>1 minus</b> trick.</p>
    `,
    expected: {
        broadcastEvents: true,
        conductorMouse: true,
        drumMiceCircle: true,
        modArithmetic: true,
        clickToggle: true
    },
    badgeGroup: "events_broadcast"
},

    {
        level: 10,
        title: "Pitch Over Time - Twinkle Twinkle with Phrase Maker",
        description: `
      <p>In this level, you will use <b>Phrase Maker</b> to explore <b>pitch over time</b>. That means you will think about how the melody moves up, down, or stays the same as time goes forward.</p>

      <p>Before you start, sing or hear the shape of <b>Twinkle Twinkle Little Star</b> in your mind.</p>

      <p><b>Reference tune in solfege:</b></p>

      <ul>
        <li><b>A1:</b> Do Do Sol Sol La La Sol</li>
        <li><b>A2:</b> Fa Fa Mi Mi Re Re Do</li>
        <li><b>B:</b> Sol Sol Fa Fa Mi Mi Re</li>
      </ul>

      <p><b>Whole song form:</b></p>

      <p><b>A1 A2 B B A1 A2</b></p>

      <p><b>You will already see these blocks on the screen:</b></p>

      <ul>
        <li><b>Start</b></li>
        <li><b>Phrase Maker</b></li>
      </ul>

      <p><b>Your task:</b></p>

      <ol>
        <li>Open <b>Phrase Maker</b>.</li>
        <li>Create the three melody parts of Twinkle Twinkle using the tune reference above.</li>
        <li>Export each part as an <b>action block</b>.</li>
        <li>Find the exported action blocks in the <b>Actions</b> palette.</li>
        <li>Arrange those action blocks under the <b>Start</b> block in the full song order: <b>A1 A2 B B A1 A2</b>.</li>
        <li>Press <b>Play</b> and check whether it sounds like Twinkle Twinkle Little Star.</li>
      </ol>

      <p><b>Hints:</b></p>

      <ul>
        <li>All the pitches can use octave <b>4</b>.</li>
        <li>You can rename your exported action blocks if that helps you remember the form.</li>
        <li>Think of the song like a sandwich: the <b>A</b> part is the bread on the outside, and the <b>B</b> part is in the middle.</li>
      </ul>

      <p><b>Level check:</b> the level will complete when your project shows Phrase Maker-generated action blocks for the Twinkle Twinkle melody parts and those exported actions are arranged under <b>Start</b> in the correct song form.</p>
    `,
        expected: {
            twinklePhraseMaker: true
        },
        badgeGroup: "melody_basics"
    }
,

];