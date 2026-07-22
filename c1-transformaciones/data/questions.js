// ─────────────────────────────────────────────
//  BANCO DE PREGUNTAS — añade aquí las nuevas
//  Formato: { tanda, original, keyword, before, after, solution }
// ─────────────────────────────────────────────
const ALL_QUESTIONS = [

  // ── Tanda 1 ──
  {
    tanda: 1,
    original: "Local volunteers deliver the newsletter every week.",
    keyword: "BASIS",
    before: "The newsletter",
    after: "by local volunteers.",
    solution: "is delivered on a weekly basis"
  },
  {
    tanda: 1,
    original: "Jo suggested making the exam longer.",
    keyword: "INCREASE",
    before: "Jo said it would be a good idea",
    after: "of the exam.",
    solution: "to increase the length"
  },
  {
    tanda: 1,
    original: "Sue was visiting her great-aunt for the first time.",
    keyword: "PAID",
    before: "Sue",
    after: "her great-aunt before.",
    solution: "had never paid a visit to"
  },
  {
    tanda: 1,
    original: "It's fine to borrow money occasionally.",
    keyword: "HARM",
    before: "There's",
    after: "a loan from time to time.",
    solution: "no harm in getting"
  },
  {
    tanda: 1,
    original: "People have fewer children than they did in the past.",
    keyword: "MANY",
    before: "People",
    after: "as they used to.",
    solution: "don't have as many children"
  },
  {
    tanda: 1,
    original: "He can't be allowed to continue to behave so badly.",
    keyword: "STOP",
    before: "We have",
    after: "to his bad behaviour.",
    solution: "to put a stop"
  },

  // ── Tanda 2 ──
  {
    tanda: 2,
    original: "Kate is both considerate and conscientious.",
    keyword: "ONLY",
    before: "Kate is",
    after: "also conscientious.",
    solution: "not only considerate but"
  },
  {
    tanda: 2,
    original: "Dan didn't go to the match with Paul because of their argument several days previously.",
    keyword: "OUT",
    before: "Dan didn't go to the match with Paul because they",
    after: "few days previously.",
    solution: "had fallen out a"
  },
  {
    tanda: 2,
    original: "My sister is far better organised than me.",
    keyword: "NEARLY",
    before: "I",
    after: "as my sister.",
    solution: "am not nearly as organised"
  },
  {
    tanda: 2,
    original: "Everyone considers me to be an expert on photography – but I'm not, really!",
    keyword: "LOOKS",
    before: "Everyone",
    after: "an expert on photography – but I'm not, really!",
    solution: "looks on me as"
  },
  {
    tanda: 2,
    original: "Being completely honest about your opinions isn't always advisable.",
    keyword: "IDEA",
    before: "It isn't",
    after: "completely honest about your opinions.",
    solution: "always a good idea to be"
  },
  {
    tanda: 2,
    original: "I often used to go walking through the forest with my parents when I was younger.",
    keyword: "WOULD",
    before: "My parents",
    after: "take walks through the forest when I was younger.",
    solution: "and I would often"
  },

  // ── Tanda 3 ──
  {
    tanda: 3,
    original: "I received some very useful advice from Gustavo.",
    keyword: "FOUND",
    before: "I",
    after: "me very useful.",
    solution: "found Gustavo's advice"
  },
  {
    tanda: 3,
    original: "Jason moved to Berlin in 2020.",
    keyword: "BEEN",
    before: "Jason",
    after: "since 2020.",
    solution: "has been living in Berlin"
  },
  {
    tanda: 3,
    original: "The first time Carla went skiing was last Monday.",
    keyword: "NEVER",
    before: "Carla",
    after: "last Monday.",
    solution: "had never been skiing until"
  },
  {
    tanda: 3,
    original: "We were all favourably impressed with Paola's lecture.",
    keyword: "FAVOURABLE",
    before: "The lecture",
    after: "on all of us.",
    solution: "made a favourable impression"
  },
  {
    tanda: 3,
    original: "Students don't spend their free time in the same way as they did fifty years ago.",
    keyword: "CHANGED",
    before: "The way students spend their free time",
    after: "fifty years.",
    solution: "has changed a lot in the last"
  },
  {
    tanda: 3,
    original: "I couldn't find my receipt and they wouldn't give me a refund.",
    keyword: "HAD",
    before: "They wouldn't give me a refund because",
    after: ".",
    solution: "I had lost my receipt"
  },
  // ── Tanda 4 ──
  {
    tanda: 4,
    original: "People think that the fire started in the basement.",
    keyword: "THOUGHT",
    before: "The fire",
    after: "in the basement.",
    solution: "is thought to have started"
  },
  {
    tanda: 4,
    original: "A professional decorator is painting our living room next week.",
    keyword: "HAVING",
    before: "We",
    after: "by a professional decorator next week.",
    solution: "are having our living room painted"
  },
  {
    tanda: 4,
    original: "Everyone expects that the inflation rate will drop next month.",
    keyword: "EXPECTED",
    before: "The inflation rate",
    after: "next month.",
    solution: "is expected to drop"
  },
  {
    tanda: 4,
    original: "They claim that he was driving at 150 km/h when the accident happened.",
    keyword: "BEEN",
    before: "He is claimed",
    after: "at 150 km/h when the accident happened.",
    solution: "to have been driving"
  },
  {
    tanda: 4,
    original: "Someone stole my bike from outside the library yesterday.",
    keyword: "HAD",
    before: "I",
    after: "from outside the library yesterday.",
    solution: "had my bike stolen"
  },
  // ── Tanda 5 ──
  {
    tanda: 5,
    original: "There isn't a single biscuit left in the tin.",
    keyword: "NO",
    before: "There",
    after: "left in the tin.",
    solution: "are no biscuits"
  },
  {
    tanda: 5,
    original: "I asked all my colleagues, but zero people wanted to help.",
    keyword: "NONE",
    before: "I asked all my colleagues, but",
    after: "to help.",
    solution: "none of them wanted"
  },
  // ── Tanda 6 ──
  {
    tanda: 6,
    original: "Madeleine felt sure that she would be offered the job.",
    keyword: "BOUND",
    before: "Madeleine felt she",
    after: "offered the job.",
    solution: "was bound to be"
  },
  {
    tanda: 6,
    original: "Boris is unlikely to win the prize.",
    keyword: "LIKELIHOOD",
    before: "There is little",
    after: "the prize.",
    solution: "likelihood of Boris winning"
  },
  {
    tanda: 6,
    original: "There's a good chance that Takesi has seen your message.",
    keyword: "WELL",
    before: "Takesi",
    after: "your message.",
    solution: "may well have seen"
  },
  {
    tanda: 6,
    original: "I'm sure you didn't remember to post the letter.",
    keyword: "MUST",
    before: "You",
    after: "post the letter.",
    solution: "must have forgotten to"
  },
  {
    tanda: 6,
    original: "If you arrive late, the teacher may well get angry with you.",
    keyword: "LIKELY",
    before: "The teacher",
    after: "his temper with you if you arrive late.",
    solution: "is likely to lose"
  },
  {
    tanda: 6,
    original: "Do you think you might be able to help me with the essay?",
    keyword: "CHANCE",
    before: "Is",
    after: "me with the essay?",
    solution: "there any chance of you helping"
  },
  // ── Tanda 7 ──
  {
    tanda: 7,
    original: "I am absolutely sure that they didn't see us because it was pitch black.",
    keyword: "HAVE",
    before: "They",
    after: "us because it was pitch black.",
    solution: "can't have seen"
  },
  {
    tanda: 7,
    original: "There is a strong probability that the flight will be cancelled.",
    keyword: "WELL",
    before: "The flight",
    after: "cancelled.",
    solution: "may well be",
    explanation: "El verbo 'cancel' termina en -ed (cancelled) no porque esté en pasado, sino porque es un participio pasado y la oración está en voz pasiva."
  },
  {
    tanda: 7,
    original: "It is certain that the new policy will cause controversy.",
    keyword: "BOUND",
    before: "The new policy",
    after: "controversy.",
    solution: "is bound to cause"
  },
  {
    tanda: 7,
    original: "There is very little chance that the team will qualify for the final.",
    keyword: "LIKELIHOOD",
    before: "There is",
    after: "the team qualifying for the final.",
    solution: "little likelihood of",
    explanation: "Cuidado con añadir 'a' antes de 'little'. En inglés, 'little' significa 'casi ninguno' (sentido negativo), mientras que 'a little' significa 'algo' (sentido positivo). Como la frase original dice 'very little chance', hay que mantener ese sentido negativo sin el 'a'."
  },
  {
    tanda: 7,
    original: "Perhaps she was working in the garden when we arrived.",
    keyword: "BEEN",
    before: "She",
    after: "in the garden when we arrived.",
    solution: "might have been working"
  },
  // ── Tanda 8 ──
  {
    tanda: 8,
    original: "Because I wanted to pass the test, I studied a lot.",
    keyword: "WANTING",
    before: "",
    after: "the test, I studied a lot.",
    solution: "Wanting to pass",
    explanation: "We use V-ing (Present Participle) to replace 'because' when the subject is the same."
  },
  {
    tanda: 8,
    original: "The person with whom I spoke yesterday was very helpful.",
    keyword: "WHO",
    before: "The person",
    after: "yesterday was very helpful.",
    solution: "who I spoke with",
    explanation: "In informal/standard English, we can use 'who' and put the preposition ('with/to') at the end of the relative clause."
  },
  {
    tanda: 8,
    original: "My brother lives in Paris and he is coming to visit.",
    keyword: "WHO",
    before: "My brother,",
    after: ", is coming to visit.",
    solution: "who lives in Paris",
    explanation: "This is a non-defining relative clause, which adds extra information and needs commas."
  },
  {
    tanda: 8,
    original: "After he had finished the project, he took a long holiday.",
    keyword: "HAVING",
    before: "",
    after: ", he took a long holiday.",
    solution: "Having finished the project",
    explanation: "'Having + V-ed' (Perfect Participle) emphasizes that the first action was completely finished before the second started."
  },
  {
    tanda: 8,
    original: "The building that was destroyed in the fire is being rebuilt.",
    keyword: "DESTROYED",
    before: "The building",
    after: "is being rebuilt.",
    solution: "destroyed in the fire",
    explanation: "We drop 'that was' and keep the V-ed (Past Participle) 'destroyed' because it has a passive meaning."
  },
  {
    tanda: 8,
    original: "If it is used correctly, this software can save a lot of time.",
    keyword: "USED",
    before: "",
    after: ", this software can save a lot of time.",
    solution: "Used correctly",
    explanation: "We use V-ed (Past Participle) to replace passive conditional clauses ('If it is used' -> 'Used')."
  },
  {
    tanda: 8,
    original: "While she was walking down the street, she found a wallet.",
    keyword: "WALKING",
    before: "",
    after: ", she found a wallet.",
    solution: "Walking down the street",
    explanation: "V-ing (Present Participle) can replace 'while' + continuous tenses for simultaneous actions."
  },
  {
    tanda: 8,
    original: "I noticed that Peter was cheating in the exam.",
    keyword: "CHEATING",
    before: "I noticed",
    after: "in the exam.",
    solution: "Peter cheating",
    explanation: "After verbs of perception (notice, see, hear), we use object + V-ing to describe an ongoing action."
  },
  {
    tanda: 8,
    original: "The hotel where we stayed was lovely.",
    keyword: "WHICH",
    before: "The hotel",
    after: "was lovely.",
    solution: "at which we stayed",
    explanation: "We can replace 'where' with preposition + 'which' (at which, in which)."
  },
  {
    tanda: 8,
    original: "Because she didn't have enough money, she couldn't buy the tickets.",
    keyword: "HAVING",
    before: "",
    after: ", she couldn't buy the tickets.",
    solution: "Not having enough money",
    explanation: "To make a participle clause negative, we put 'not' before the participle ('Not having')."
  },
  {
    tanda: 8,
    original: "My boss, who is a very strict woman, demanded the report by 5 PM.",
    keyword: "STRICT",
    before: "My boss,",
    after: ", demanded the report by 5 PM.",
    solution: "a very strict woman",
    explanation: "This is an apposition. We can remove 'who is' to simply rename the noun phrase."
  },
  {
    tanda: 8,
    original: "Anyone who wants to participate must sign the form.",
    keyword: "WANTING",
    before: "Anyone",
    after: "must sign the form.",
    solution: "wanting to participate",
    explanation: "We omit 'who' and change the active verb 'wants' to the V-ing form 'wanting'."
  },
  {
    tanda: 8,
    original: "I opened the letter and realized it was from the university.",
    keyword: "OPENING",
    before: "",
    after: ", I realized it was from the university.",
    solution: "Opening the letter",
    explanation: "For two short actions happening one right after the other, we can use V-ing (Present Participle) for the first action."
  },
  {
    tanda: 8,
    original: "The car that I bought yesterday is very fast.",
    keyword: "WHICH",
    before: "The car",
    after: "is very fast.",
    solution: "which I bought yesterday",
    explanation: "'Which' can be used instead of 'that' for things in defining relative clauses."
  },
  {
    tanda: 8,
    original: "The student whose bag was stolen reported it to the police.",
    keyword: "HAD",
    before: "The student",
    after: "reported it to the police.",
    solution: "who had their bag stolen",
    explanation: "Instead of 'whose bag was stolen', we can use 'who had their bag stolen' (causative structure)."
  },
  {
    tanda: 8,
    original: "The committee to whom we presented our proposal approved it.",
    keyword: "WHICH",
    before: "The committee,",
    after: ", approved it.",
    solution: "to which we presented our proposal",
    explanation: "When referring to a collective noun like 'committee' as a single entity, we can use 'to which' in formal contexts."
  },
  {
    tanda: 8,
    original: "Because I didn't know what to do, I called my mother.",
    keyword: "NOT",
    before: "",
    after: "what to do, I called my mother.",
    solution: "Not knowing",
    explanation: "A negative participle clause starts with 'Not' + V-ing."
  },
  {
    tanda: 8,
    original: "Madrid, which is the capital of Spain, is very populous.",
    keyword: "CAPITAL",
    before: "Madrid,",
    after: ", is very populous.",
    solution: "the capital of Spain",
    explanation: "Using apposition by removing 'which is' creates a more concise sentence."
  },
  {
    tanda: 8,
    original: "The athletes who failed the drug test were disqualified.",
    keyword: "FAILING",
    before: "The athletes",
    after: "were disqualified.",
    solution: "failing the drug test",
    explanation: "We can replace the defining relative clause with a present participle phrase if the verb is active."
  },
  {
    tanda: 8,
    original: "Avatar was great and it is my favourite film.",
    keyword: "WHICH",
    before: "Avatar,",
    after: ", was great.",
    solution: "which is my favourite film",
    explanation: "We use a non-defining relative clause (with commas) to add extra information about a specific noun."
  },
  // ── Tanda 9 ──
  {
    tanda: 9,
    original: "They will probably win the game tomorrow.",
    keyword: "LIKELY",
    before: "They",
    after: "the game tomorrow.",
    solution: "are likely to win"
  },
  {
    tanda: 9,
    original: "It is almost certain that he will complain about the noise.",
    keyword: "BOUND",
    before: "He",
    after: "about the noise.",
    solution: "is bound to complain"
  },
  {
    tanda: 9,
    original: "The train is expected to arrive at 8:30.",
    keyword: "DUE",
    before: "The train",
    after: "at 8:30.",
    solution: "is due to arrive"
  },
  {
    tanda: 9,
    original: "There is a strong possibility that she will pass the exam.",
    keyword: "LIKELIHOOD",
    before: "There is a",
    after: "pass the exam.",
    solution: "strong likelihood that she will"
  },
  {
    tanda: 9,
    original: "I'm sure it will rain later, so take an umbrella.",
    keyword: "WELL",
    before: "It",
    after: "later, so take an umbrella.",
    solution: "may well rain"
  },
  {
    tanda: 9,
    original: "I predict that technology will increasingly control our lives.",
    keyword: "LIKELIHOOD",
    before: "There is a",
    after: "increasingly control our lives.",
    solution: "strong likelihood that technology will"
  },
  {
    tanda: 9,
    original: "The concert is scheduled to start in five minutes.",
    keyword: "DUE",
    before: "The concert",
    after: "in five minutes.",
    solution: "is due to start"
  },
  {
    tanda: 9,
    original: "She will probably get the job because she is very qualified.",
    keyword: "WELL",
    before: "She",
    after: "the job because she is very qualified.",
    solution: "may well get"
  },
  {
    tanda: 9,
    original: "I am almost sure they'll face financial difficulties if they do that.",
    keyword: "BOUND",
    before: "They",
    after: "financial difficulties if they do that.",
    solution: "are bound to face"
  },
  {
    tanda: 9,
    original: "What are your plans for next weekend?",
    keyword: "GOING",
    before: "What",
    after: "do next weekend?",
    solution: "are you going to"
  },
  {
    tanda: 9,
    original: "My dentist appointment is tomorrow at 5 PM.",
    keyword: "SEEING",
    before: "I",
    after: "tomorrow at 5 PM.",
    solution: "am seeing the dentist"
  },
  {
    tanda: 9,
    original: "The President's formal visit to France is next week.",
    keyword: "IS",
    before: "The President",
    after: "France next week.",
    solution: "is to visit"
  },
  {
    tanda: 9,
    original: "I am absolutely sure he will fail the driving test.",
    keyword: "BOUND",
    before: "He",
    after: "the driving test.",
    solution: "is bound to fail"
  },
  {
    tanda: 9,
    original: "There is a small chance of him winning the competition.",
    keyword: "LIKELIHOOD",
    before: "There is a slight",
    after: "the competition.",
    solution: "likelihood of him winning"
  },
  {
    tanda: 9,
    original: "It is expected that the new law will be passed tomorrow.",
    keyword: "DUE",
    before: "The new law",
    after: "tomorrow.",
    solution: "is due to be passed"
  },
  {
    tanda: 9,
    original: "Do you want me to open the window for you?",
    keyword: "SHALL",
    before: "",
    after: "the window for you?",
    solution: "Shall I open"
  },
  {
    tanda: 9,
    original: "I think robots will do all the housework in the future.",
    keyword: "EXPECT",
    before: "I",
    after: "all the housework in the future.",
    solution: "expect robots will do"
  },
  {
    tanda: 9,
    original: "Look at those dark clouds; rain is imminent.",
    keyword: "GOING",
    before: "Look at those dark clouds; it",
    after: "rain.",
    solution: "is going to"
  },
  {
    tanda: 9,
    original: "We will probably see a rise in temperatures next month.",
    keyword: "LIKELY",
    before: "Temperatures",
    after: "rise next month.",
    solution: "are likely to"
  },
  {
    tanda: 9,
    original: "It is highly probable that he will arrive late.",
    keyword: "WELL",
    before: "He",
    after: "late.",
    solution: "may well arrive"
  },

  // ── Tanda 10 — Reported Speech ──
  {
    tanda: 10,
    original: "\"I will finish the report by tomorrow,\" he said.",
    keyword: "WOULD",
    before: "He said that",
    after: "the report by the following day.",
    solution: "he would finish"
  },
  {
    tanda: 10,
    original: "\"Are you going to the party tonight?\" she asked me.",
    keyword: "IF",
    before: "She asked me",
    after: "to the party that night.",
    solution: "if I was going"
  },
  {
    tanda: 10,
    original: "\"I have been working here for ten years,\" John told me.",
    keyword: "HAD",
    before: "John told me that",
    after: "there for ten years.",
    solution: "he had been working"
  },
  {
    tanda: 10,
    original: "\"Where did you put the keys?\" my mother asked.",
    keyword: "WHERE",
    before: "My mother asked me",
    after: "the keys.",
    solution: "where I had put"
  },
  {
    tanda: 10,
    original: "\"I can't swim very well,\" David said.",
    keyword: "COULD",
    before: "David said that",
    after: "very well.",
    solution: "he could not swim"
  },
  {
    tanda: 10,
    original: "\"You must leave immediately!\" the officer said to us.",
    keyword: "HAD",
    before: "The officer told us that",
    after: "immediately.",
    solution: "we had to leave"
  },
  {
    tanda: 10,
    original: "\"I bought this car yesterday,\" she said.",
    keyword: "PREVIOUS",
    before: "She said she had bought that car",
    after: ".",
    solution: "the previous day"
  },
  {
    tanda: 10,
    original: "\"What time does the train leave?\" the tourist asked.",
    keyword: "LEFT",
    before: "The tourist asked what time",
    after: ".",
    solution: "the train left"
  },
  {
    tanda: 10,
    original: "\"I may go to Paris next week,\" said Sarah.",
    keyword: "MIGHT",
    before: "Sarah said that",
    after: "to Paris the following week.",
    solution: "she might go"
  },
  {
    tanda: 10,
    original: "\"Don't touch that wire!\" the electrician told me.",
    keyword: "NOT",
    before: "The electrician warned",
    after: "that wire.",
    solution: "me not to touch"
  },
  {
    tanda: 10,
    original: "\"I was watching TV when the phone rang,\" he said.",
    keyword: "BEEN",
    before: "He said that",
    after: "TV when the phone had rung.",
    solution: "he had been watching"
  },
  {
    tanda: 10,
    original: "\"Will you help me with this box?\" she asked him.",
    keyword: "WHETHER",
    before: "She asked him",
    after: "help her with that box.",
    solution: "whether he would"
  },
  {
    tanda: 10,
    original: "\"I had never eaten sushi before,\" she told us.",
    keyword: "NEVER",
    before: "She told us that",
    after: "sushi before.",
    solution: "she had never eaten"
  },
  {
    tanda: 10,
    original: "\"Do you know the answer?\" the teacher asked the class.",
    keyword: "KNEW",
    before: "The teacher asked the class if",
    after: "the answer.",
    solution: "they knew"
  },
  {
    tanda: 10,
    original: "\"I will have finished by Friday,\" he promised.",
    keyword: "WOULD",
    before: "He promised that",
    after: "finished by Friday.",
    solution: "he would have"
  },
  {
    tanda: 10,
    original: "\"We are leaving now,\" they announced.",
    keyword: "THEN",
    before: "They announced that",
    after: ".",
    solution: "they were leaving then"
  },
  {
    tanda: 10,
    original: "\"How long have you lived here?\" he asked me.",
    keyword: "HAD",
    before: "He asked me how long",
    after: "there.",
    solution: "I had lived"
  },
  {
    tanda: 10,
    original: "\"You should see a doctor,\" my friend advised me.",
    keyword: "SEE",
    before: "My friend advised",
    after: "a doctor.",
    solution: "me to see"
  },
  {
    tanda: 10,
    original: "\"I couldn't find my wallet,\" he complained.",
    keyword: "NOT",
    before: "He complained that",
    after: "find his wallet.",
    solution: "he had not been able to"
  },
  {
    tanda: 10,
    original: "\"Did you see the news last night?\" she asked.",
    keyword: "BEFORE",
    before: "She asked if I had seen the news",
    after: ".",
    solution: "the night before"
  },

  // ── Tanda 11 — Reporting Verbs ──
  {
    tanda: 11,
    original: "\"I'm sorry I broke the vase,\" he said.",
    keyword: "APOLOGIZED",
    before: "He",
    after: "the vase.",
    solution: "apologized for breaking"
  },
  {
    tanda: 11,
    original: "\"Yes, I stole the money,\" the thief said.",
    keyword: "ADMITTED",
    before: "The thief",
    after: "the money.",
    solution: "admitted to stealing"
  },
  {
    tanda: 11,
    original: "\"No, I didn't cheat on the exam,\" she said.",
    keyword: "DENIED",
    before: "She",
    after: "on the exam.",
    solution: "denied cheating"
  },
  {
    tanda: 11,
    original: "\"You really must let me pay for dinner,\" he said.",
    keyword: "INSISTED",
    before: "He",
    after: "for dinner.",
    solution: "insisted on paying"
  },
  {
    tanda: 11,
    original: "\"I will not wear that ridiculous hat!\" she said.",
    keyword: "OBJECTED",
    before: "She",
    after: "that ridiculous hat.",
    solution: "objected to wearing"
  },
  {
    tanda: 11,
    original: "\"You stole my laptop!\" he said to her.",
    keyword: "ACCUSED",
    before: "He",
    after: "his laptop.",
    solution: "accused her of stealing"
  },
  {
    tanda: 11,
    original: "\"Don't forget to lock the door,\" she told him.",
    keyword: "REMINDED",
    before: "She",
    after: "the door.",
    solution: "reminded him to lock"
  },
  {
    tanda: 11,
    original: "\"If you do that again, I'll call the police,\" the man said.",
    keyword: "THREATENED",
    before: "The man",
    after: "the police if I did that again.",
    solution: "threatened to call"
  },
  {
    tanda: 11,
    original: "\"Why don't we go to the cinema?\" suggested Peter.",
    keyword: "GOING",
    before: "Peter",
    after: "to the cinema.",
    solution: "suggested going"
  },
  {
    tanda: 11,
    original: "\"I wish I hadn't spoken to him,\" she said.",
    keyword: "REGRETTED",
    before: "She",
    after: "to him.",
    solution: "regretted speaking"
  },
  {
    tanda: 11,
    original: "\"It's your fault the project failed,\" the boss told me.",
    keyword: "BLAMED",
    before: "The boss",
    after: "the project's failure.",
    solution: "blamed me for"
  },
  {
    tanda: 11,
    original: "\"Well done for passing the exam!\" she told him.",
    keyword: "CONGRATULATED",
    before: "She",
    after: "the exam.",
    solution: "congratulated him on passing"
  },
  {
    tanda: 11,
    original: "\"I really think you should apply for the job,\" she told me.",
    keyword: "URGED",
    before: "She",
    after: "for the job.",
    solution: "urged me to apply"
  },
  {
    tanda: 11,
    original: "\"I am the best player in the team,\" he said.",
    keyword: "BOASTED",
    before: "He",
    after: "the best player in the team.",
    solution: "boasted about being"
  },
  {
    tanda: 11,
    original: "\"I think it was John who broke the window,\" said Mary.",
    keyword: "SUSPECTED",
    before: "Mary",
    after: "the window.",
    solution: "suspected John of breaking"
  },
  {
    tanda: 11,
    original: "\"Please, please don't tell my parents,\" he said.",
    keyword: "BEGGED",
    before: "He",
    after: "tell his parents.",
    solution: "begged me not to"
  },
  {
    tanda: 11,
    original: "\"I think you shouldn't buy that car,\" he told me.",
    keyword: "ADVISED",
    before: "He",
    after: "that car.",
    solution: "advised me against buying"
  },
  {
    tanda: 11,
    original: "\"The heavy rain stopped us from playing tennis,\" she said.",
    keyword: "PREVENTED",
    before: "She said the heavy rain",
    after: "tennis.",
    solution: "prevented us from playing"
  },
  {
    tanda: 11,
    original: "\"You really ought to try the new restaurant,\" she said.",
    keyword: "RECOMMENDED",
    before: "She",
    after: "the new restaurant.",
    solution: "recommended trying"
  },
  {
    tanda: 11,
    original: "\"I promise I will pay you back tomorrow,\" he said.",
    keyword: "PROMISED",
    before: "He",
    after: "me back the following day.",
    solution: "promised to pay"
  },


];
