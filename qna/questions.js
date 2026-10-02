/**
 * Static Q&A Bank for Math Challenges with MD5 Hashed Answers
 * 35+ Precomputed Question & Hashed Answer entries
 */

const QUESTION_BANK = [
  {
    "question": "Solve for x: 7x - 45 = 172",
    "answerHash": "c16a5320fa475530d9583c34fd356ef5"
  },
  {
    "question": "Evaluate: (34 × 18) - (12 × 15)",
    "answerHash": "248e844336797ec98478f85e7626de4a"
  },
  {
    "question": "Calculate: 14² + (23 × 11) - 89",
    "answerHash": "e7b24b112a44fdd9ee93bdf998c6ca0e"
  },
  {
    "question": "Calculate: 45% of 600 + 135",
    "answerHash": "bbcbff5c1f1ded46c25d28119a85c6c2"
  },
  {
    "question": "Solve for x: 13x + 84 = 357",
    "answerHash": "3c59dc048e8850243be8079a5c74d079"
  },
  {
    "question": "Evaluate: (42 × 25) - (31 × 19)",
    "answerHash": "0353ab4cbed5beae847a7ff6e220b5cf"
  },
  {
    "question": "Calculate: 19² + (17 × 14) - 105",
    "answerHash": "1be3bc32e6564055d5ca3e5a354acbef"
  },
  {
    "question": "Calculate: 35% of 800 + 215",
    "answerHash": "35051070e572e47d2c26c241ab88307f"
  },
  {
    "question": "Solve for x: 9x + 63 = 225",
    "answerHash": "6f4922f45568161a8cdf4ad2299f6d23"
  },
  {
    "question": "Evaluate: (56 × 14) - (28 × 16)",
    "answerHash": "6855456e2fe46a9d49d3d3af4f57443d"
  },
  {
    "question": "Calculate: 16² + (32 × 12) - 140",
    "answerHash": "cee631121c2ec9232f3a2f028ad5c89b"
  },
  {
    "question": "Calculate: 25% of 920 + 180",
    "answerHash": "1068c6e4c8051cfd4e9ea8072e3189e2"
  },
  {
    "question": "Solve for x: 15x - 70 = 245",
    "answerHash": "3c59dc048e8850243be8079a5c74d079"
  },
  {
    "question": "Evaluate: (68 × 12) - (45 × 11)",
    "answerHash": "caf1a3dfb505ffed0d024130f58c5cfa"
  },
  {
    "question": "Calculate: 22² + (19 × 15) - 210",
    "answerHash": "3a0772443a0739141292a5429b952fe6"
  },
  {
    "question": "Calculate: 60% of 450 + 85",
    "answerHash": "82cec96096d4281b7c95cd7e74623496"
  },
  {
    "question": "Solve for x: 8x + 112 = 368",
    "answerHash": "6364d3f0f495b6ab9dcf8d3b5c6e0b01"
  },
  {
    "question": "Evaluate: (73 × 15) - (52 × 14)",
    "answerHash": "05049e90fa4f5039a8cadc6acbb4b2cc"
  },
  {
    "question": "Calculate: 18² + (26 × 13) - 162",
    "answerHash": "cee631121c2ec9232f3a2f028ad5c89b"
  },
  {
    "question": "Calculate: 75% of 640 - 120",
    "answerHash": "e7b24b112a44fdd9ee93bdf998c6ca0e"
  },
  {
    "question": "Solve for x: 11x - 95 = 268",
    "answerHash": "182be0c5cdcd5072bb1864cdee4d3d6e"
  },
  {
    "question": "Evaluate: (84 × 11) - (39 × 16)",
    "answerHash": "94f6d7e04a4d452035300f18b984988c"
  },
  {
    "question": "Calculate: 25² + (14 × 18) - 230",
    "answerHash": "303ed4c69846ab36c2904d3ba8573050"
  },
  {
    "question": "Calculate: 40% of 850 + 160",
    "answerHash": "cee631121c2ec9232f3a2f028ad5c89b"
  },
  {
    "question": "Solve for x: 14x + 98 = 420",
    "answerHash": "37693cfc748049e45d87b8c7d8b9aacd"
  },
  {
    "question": "Evaluate: (91 × 13) - (62 × 15)",
    "answerHash": "c24cd76e1ce41366a4bbe8a49b02a028"
  },
  {
    "question": "Calculate: 21² + (35 × 12) - 180",
    "answerHash": "1595af6435015c77a7149e92a551338e"
  },
  {
    "question": "Calculate: 30% of 950 + 215",
    "answerHash": "cee631121c2ec9232f3a2f028ad5c89b"
  },
  {
    "question": "Solve for x: 16x - 120 = 360",
    "answerHash": "34173cb38f07f89ddbebc2ac9128303f"
  },
  {
    "question": "Evaluate: (47 × 22) - (36 × 18)",
    "answerHash": "39461a19e9eddfb385ea76b26521ea48"
  },
  {
    "question": "Calculate: 27² + (16 × 14) - 250",
    "answerHash": "d6c651ddcd97183b2e40bc464231c962"
  },
  {
    "question": "Calculate: 85% of 400 + 160",
    "answerHash": "cee631121c2ec9232f3a2f028ad5c89b"
  },
  {
    "question": "Solve for x: 12x + 156 = 444",
    "answerHash": "1ff1de774005f8da13f42943881c655f"
  },
  {
    "question": "Evaluate: (63 × 17) - (48 × 15)",
    "answerHash": "efe937780e95574250dabe07151bdc23"
  },
  {
    "question": "Calculate: 24² + (28 × 11) - 184",
    "answerHash": "e5841df2166dd424a57127423d276bbe"
  }
];

if (typeof module !== undefined && module.exports) {
  module.exports = { QUESTION_BANK };
}
