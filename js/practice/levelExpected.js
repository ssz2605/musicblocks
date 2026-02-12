export const LevelExpected = {
  1: [
    {
      type: "action",
      name: "HCB",
      body: [
        { type: "note", value: "1/4", pitch: "ti4" },
        { type: "note", value: "1/4", pitch: "la4" },
        { type: "note", value: "1/2", pitch: "sol4" }
      ]
    },
    {
      type: "action",
      name: "Penny",
      body: [
        {
          type: "repeat",
          times: 4,
          body: [{ type: "note", value: "1/8", pitch: "sol4" }]
        },
        {
          type: "repeat",
          times: 4,
          body: [{ type: "note", value: "1/8", pitch: "la4" }]
        }
      ]
    }
  ]

};
