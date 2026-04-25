// ============================================================
// SOCIAL STUDIES CH 8-9 — Study Entry Items
// Parker looks up answers in his textbook and types them in.
// ============================================================
const SOCIAL_CH89_STUDY = [
  // 20 vocab terms
  { id: 'v01', type: 'vocab', prompt: 'Minutemen' },
  { id: 'v02', type: 'vocab', prompt: 'Loyalist' },
  { id: 'v03', type: 'vocab', prompt: 'Patriot' },
  { id: 'v04', type: 'vocab', prompt: 'Petition' },
  { id: 'v05', type: 'vocab', prompt: 'Preamble' },
  { id: 'v06', type: 'vocab', prompt: 'Mercenary' },
  { id: 'v07', type: 'vocab', prompt: 'Blockade' },
  { id: 'v08', type: 'vocab', prompt: 'Inflation' },
  { id: 'v09', type: 'vocab', prompt: 'Revolution' },
  { id: 'v10', type: 'vocab', prompt: 'Desert (verb)' },
  { id: 'v11', type: 'vocab', prompt: 'Grievances' },
  { id: 'v12', type: 'vocab', prompt: 'Tyranny' },
  { id: 'v13', type: 'vocab', prompt: 'Independence' },
  { id: 'v14', type: 'vocab', prompt: 'Proclamation' },
  { id: 'v15', type: 'vocab', prompt: 'Delegate' },
  { id: 'v16', type: 'vocab', prompt: 'Congress' },
  { id: 'v17', type: 'vocab', prompt: 'Militia' },
  { id: 'v18', type: 'vocab', prompt: 'Neutral' },
  { id: 'v19', type: 'vocab', prompt: 'Quarter (verb)' },
  { id: 'v20', type: 'vocab', prompt: 'Repeal' },
  // 10 knowledge topics
  { id: 'k01', type: 'knowledge', prompt: 'Why the British marched to Lexington' },
  { id: 'k02', type: 'knowledge', prompt: 'Effect of British taxation on the colonies' },
  { id: 'k03', type: 'knowledge', prompt: 'The Intolerable Acts and what they did' },
  { id: 'k04', type: 'knowledge', prompt: 'How Washington forced the British out of Boston' },
  { id: 'k05', type: 'knowledge', prompt: 'Who Prince Hall was and what he was known for' },
  { id: 'k06', type: 'knowledge', prompt: 'The 2 goals of the Tea Act' },
  { id: 'k07', type: 'knowledge', prompt: 'How the Committee of Correspondence communicated' },
  { id: 'k08', type: 'knowledge', prompt: 'The Boston Massacre — what happened' },
  { id: 'k09', type: 'knowledge', prompt: 'Who wrote the Declaration of Independence' },
  { id: 'k10', type: 'knowledge', prompt: 'What King George III did with the Olive Branch Petition' },
  // 8 short-answer topics
  { id: 's01', type: 'short-answer', prompt: 'How did the Boston Tea Party express colonists\' views?' },
  { id: 's02', type: 'short-answer', prompt: 'How did the Daughters of Liberty support the boycott?' },
  { id: 's03', type: 'short-answer', prompt: 'What does the Declaration of Independence say about Britain?' },
  { id: 's04', type: 'short-answer', prompt: 'Why was signing the Declaration of Independence dangerous?' },
  { id: 's05', type: 'short-answer', prompt: 'What actions did the Sons of Liberty take against the Stamp Act?' },
  { id: 's06', type: 'short-answer', prompt: 'How was timing important in Washington\'s attack on Trenton?' },
  { id: 's07', type: 'short-answer', prompt: 'How did women keep the revolution alive?' },
  { id: 's08', type: 'short-answer', prompt: 'Mary Ludwig Hays and Deborah Sampson — what did they do?' }
];

// ============================================================
// SOCIAL CH8-9 — Vocabulary (20 terms)
// Source: studyguides/social/social-ch8-9-answers.md
// ============================================================
const SOCIAL_CH89_VOCAB = [
  { term: "Minutemen", definition: "Colonial soldiers who could be ready to fight in a minute" },
  { term: "Loyalist", definition: "A colonist who stayed loyal to Britain during the American Revolution" },
  { term: "Patriot", definition: "A colonist who wanted the American colonies to be independent from Britain" },
  { term: "Petition", definition: "A written request signed by many people to ask for a change" },
  { term: "Preamble", definition: "The introduction to a document that explains its purpose" },
  { term: "Mercenary", definition: "A soldier who is paid to fight for a country other than their own" },
  { term: "Blockade", definition: "When ships or soldiers stop people or supplies from coming in or out of a place" },
  { term: "Inflation", definition: "When prices go up and money buys less than it did before" },
  { term: "Revolution", definition: "A major change, often the overthrow of one government to create a new one" },
  { term: "Desert (verb)", definition: "To leave the army without permission and not come back" },
  { term: "Grievances", definition: "Complaints or reasons people are unhappy and want things to change" },
  { term: "Tyranny", definition: "Cruel or unfair control by a ruler or government" },
  { term: "Independence", definition: "Freedom from control by another country or ruler" },
  { term: "Proclamation", definition: "An official public announcement" },
  { term: "Delegate", definition: "A person chosen to represent others at a meeting or assembly" },
  { term: "Congress", definition: "A group of representatives who meet to make laws or decisions" },
  { term: "Militia", definition: "A group of ordinary people who train to fight in emergencies" },
  { term: "Neutral", definition: "Not taking sides in a conflict or argument" },
  { term: "Quarter (verb)", definition: "To provide soldiers with a place to stay and food" },
  { term: "Repeal", definition: "To cancel or take back a law" }
];

// ============================================================
// SOCIAL CH8-9 — Multiple Choice (28 questions)
// Source: studyguides/social/social-ch8-9-answers.md
// ============================================================
const SOCIAL_CH89_MC = [
  // --- Vocab-based MC ---
  {
    question: "What were colonists who supported independence from Britain called?",
    choices: ["Loyalists", "Mercenaries", "Patriots", "Delegates"],
    correct: 2
  },
  {
    question: "What is a mercenary?",
    choices: ["A colonist who stayed loyal to Britain", "A soldier paid to fight for a country other than their own", "A person who signs petitions", "A member of the militia"],
    correct: 1
  },
  {
    question: "What does it mean to 'quarter' soldiers?",
    choices: ["To divide them into four groups", "To pay them one quarter of their wages", "To provide them with a place to stay and food", "To send them away from the colony"],
    correct: 2
  },
  {
    question: "What is tyranny?",
    choices: ["A type of government where people vote", "Cruel or unfair control by a ruler or government", "A written request signed by many people", "Freedom from another country"],
    correct: 1
  },
  {
    question: "What does 'repeal' mean?",
    choices: ["To create a new law", "To enforce a law more strictly", "To cancel or take back a law", "To vote on a law in Congress"],
    correct: 2
  },
  {
    question: "What is a blockade?",
    choices: ["A type of colonial building", "When ships or soldiers stop people or supplies from coming in or out", "A meeting of delegates", "A written complaint to the king"],
    correct: 1
  },
  {
    question: "What is the preamble of a document?",
    choices: ["The list of signatures at the end", "The introduction that explains its purpose", "The section listing complaints", "The date it was written"],
    correct: 1
  },
  {
    question: "What does it mean to 'desert' in a military sense?",
    choices: ["To march through a sandy area", "To leave the army without permission and not come back", "To set up camp in the wilderness", "To surrender to the enemy"],
    correct: 1
  },
  // --- Knowledge-based MC ---
  {
    question: "Why did the British march to Lexington in April 1775?",
    choices: ["To collect taxes from colonial merchants", "To arrest Samuel Adams and John Hancock and seize weapons in Concord", "To deliver a peace treaty to the colonists", "To set up a new British fort"],
    correct: 1
  },
  {
    question: "What was the main reason colonists were angry about British taxes?",
    choices: ["The taxes were too expensive for anyone to pay", "They had no representation in Parliament — 'no taxation without representation'", "The taxes only applied to farmers", "Britain refused to let colonists trade with France"],
    correct: 1
  },
  {
    question: "How did the colonists protest during the Boston Tea Party?",
    choices: ["They refused to drink any beverages for a month", "They dressed as Native Americans and threw 342 chests of tea into Boston Harbor", "They burned down the governor's mansion", "They sent a petition to King George III"],
    correct: 1
  },
  {
    question: "How did the Daughters of Liberty support the boycott of British goods?",
    choices: ["They organized protests outside Parliament", "They smuggled weapons from France", "They made homespun cloth and other goods so colonists wouldn't need British products", "They wrote the Declaration of Independence"],
    correct: 2
  },
  {
    question: "What did the Declaration of Independence say about King George III?",
    choices: ["It praised him for being a fair ruler", "It asked him to lower taxes on tea", "It listed many grievances — unfair taxes, taking away rights, and keeping soldiers in colonies", "It offered him land in the colonies"],
    correct: 2
  },
  {
    question: "What were the Intolerable Acts?",
    choices: ["Laws that gave colonists more freedom", "Strict laws to punish Boston — closing the harbor, forcing quartering, and removing self-government", "Trade agreements between Britain and France", "Rules for how colonial militias should train"],
    correct: 1
  },
  {
    question: "How did George Washington force the British out of Boston?",
    choices: ["He blocked the harbor with colonial ships", "He placed cannons from Fort Ticonderoga on Dorchester Heights overlooking Boston", "He set fire to the city so the British had to leave", "He negotiated a peace deal with the British general"],
    correct: 1
  },
  {
    question: "Who was Prince Hall?",
    choices: ["A British general who surrendered at Boston", "A free Black man who petitioned for African American rights and founded the first African American Masonic Lodge", "A colonial governor of Massachusetts", "A French soldier who helped the Americans"],
    correct: 1
  },
  {
    question: "Why was signing the Declaration of Independence a dangerous act?",
    choices: ["The ink was poisonous", "The signers were committing treason and could be imprisoned or executed", "King George promised to burn their homes", "The document had to be delivered through enemy territory"],
    correct: 1
  },
  {
    question: "What actions did the Sons of Liberty take against the Stamp Act?",
    choices: ["They asked the king politely to change the law", "They organized protests, burned stamps, destroyed tax collectors' property, and led boycotts", "They left the colonies and moved to France", "They agreed to pay the taxes if they were lowered"],
    correct: 1
  },
  {
    question: "What happened during the Boston Massacre?",
    choices: ["Colonists attacked a British fort and captured it", "British soldiers fired into a crowd of colonists, killing five including Crispus Attucks", "A British ship was sunk in Boston Harbor", "Colonists and soldiers had a friendly meeting that turned violent"],
    correct: 1
  },
  {
    question: "How did the Committees of Correspondence help the colonies?",
    choices: ["They collected taxes for the colonial government", "They trained soldiers for the militia", "They wrote and sent letters between colonies to share information and organize a united response", "They printed newspapers with British propaganda"],
    correct: 2
  },
  {
    question: "What were the two goals of the Tea Act?",
    choices: ["To ban all tea and to punish Boston", "To help the British East India Company sell extra tea and to get colonists to accept Parliament's right to tax them", "To lower tea prices and to make colonists happy", "To open new tea shops and to create jobs in the colonies"],
    correct: 1
  },
  {
    question: "Why was the timing of Washington's attack on Trenton so important?",
    choices: ["The attack happened during a snowstorm so the British couldn't see", "Washington crossed the Delaware on Christmas night when Hessian soldiers were tired and not expecting a fight", "The attack was at dawn when the British were just waking up from a normal night", "Washington waited until the British ran out of food"],
    correct: 1
  },
  {
    question: "How did women contribute to the American Revolution?",
    choices: ["They served as generals in the Continental Army", "They made uniforms, cared for wounded, ran farms, spread news, and raised money for the army", "They only prayed for the soldiers' safety", "They moved to France to get help from the French king"],
    correct: 1
  },
  {
    question: "What did Mary Ludwig Hays ('Molly Pitcher') do during battle?",
    choices: ["She spied on the British and reported their plans", "She brought water to soldiers and took over firing her husband's cannon when he was wounded", "She sewed the first American flag", "She wrote letters to King George asking for peace"],
    correct: 1
  },
  {
    question: "How did Deborah Sampson serve in the Revolution?",
    choices: ["She was a nurse at a military hospital", "She disguised herself as a man named 'Robert Shurtleff' and fought as a soldier", "She organized boycotts of British tea", "She served as a messenger between colonial leaders"],
    correct: 1
  },
  {
    question: "What did King George III do with the Olive Branch Petition?",
    choices: ["He signed it and agreed to peace", "He refused to read it and declared the colonies in open rebellion", "He sent it back with his own list of demands", "He shared it with Parliament for a vote"],
    correct: 1
  },
  {
    question: "Who was the main author of the Declaration of Independence?",
    choices: ["Benjamin Franklin", "George Washington", "Samuel Adams", "Thomas Jefferson"],
    correct: 3
  },
  {
    question: "Which committee members helped Thomas Jefferson revise the Declaration of Independence?",
    choices: ["George Washington and Samuel Adams", "John Adams and Benjamin Franklin", "Patrick Henry and Thomas Paine", "John Hancock and Paul Revere"],
    correct: 1
  }
];

// ============================================================
// SOCIAL CH8-9 — Matching / Category Sort (18 items, 3 buckets)
// ============================================================
const SOCIAL_CH89_MATCHING = {
  instruction: "Sort each item into the correct category",
  buckets: [
    { id: "acts-taxes", label: "Acts & Taxes", emoji: "📜" },
    { id: "key-battles", label: "Key Battles & Events", emoji: "⚔️" },
    { id: "key-people", label: "Key People", emoji: "👤" }
  ],
  items: [
    { text: "Stamp Act — tax on printed materials", bucket: "acts-taxes" },
    { text: "Tea Act — helped British East India Company sell tea", bucket: "acts-taxes" },
    { text: "Intolerable Acts — punished Boston for the Tea Party", bucket: "acts-taxes" },
    { text: "Townshend Acts — taxes that angered colonists", bucket: "acts-taxes" },
    { text: "Quartering Act — colonists had to house British soldiers", bucket: "acts-taxes" },
    { text: "Olive Branch Petition — rejected by King George III", bucket: "acts-taxes" },
    { text: "Boston Tea Party — 342 chests of tea dumped in the harbor", bucket: "key-battles" },
    { text: "Boston Massacre — British soldiers killed five colonists", bucket: "key-battles" },
    { text: "Battle of Lexington — British marched to arrest colonial leaders", bucket: "key-battles" },
    { text: "Battle of Trenton — Washington's Christmas surprise attack", bucket: "key-battles" },
    { text: "Cannons on Dorchester Heights — forced British out of Boston", bucket: "key-battles" },
    { text: "Declaration of Independence — adopted July 4, 1776", bucket: "key-battles" },
    { text: "Thomas Jefferson — main author of the Declaration of Independence", bucket: "key-people" },
    { text: "Prince Hall — fought for African American rights", bucket: "key-people" },
    { text: "Crispus Attucks — killed in the Boston Massacre", bucket: "key-people" },
    { text: "Deborah Sampson — disguised herself as a man to fight", bucket: "key-people" },
    { text: "Mary Ludwig Hays — 'Molly Pitcher,' fired a cannon in battle", bucket: "key-people" },
    { text: "Samuel Adams & John Hancock — British tried to arrest them", bucket: "key-people" }
  ]
};

// ============================================================
// SOCIAL CH8-9 — Jeopardy / Game Quiz (35 questions)
// 20 vocab-based + 15 knowledge-based
// ============================================================
const SOCIAL_CH89_JEOPARDY = [
  // ---- VOCAB-BASED (20): definition → pick the term ----
  { question: "Colonial soldiers who could be ready to fight in a minute",
    choices: ["Militia", "Minutemen", "Patriots", "Mercenaries"], correct: 1, category: "vocab" },
  { question: "A colonist who stayed loyal to Britain during the American Revolution",
    choices: ["Patriot", "Delegate", "Loyalist", "Neutral"], correct: 2, category: "vocab" },
  { question: "A colonist who wanted the American colonies to be independent from Britain",
    choices: ["Loyalist", "Mercenary", "Neutral", "Patriot"], correct: 3, category: "vocab" },
  { question: "A written request signed by many people to ask for a change",
    choices: ["Petition", "Proclamation", "Preamble", "Grievances"], correct: 0, category: "vocab" },
  { question: "The introduction to a document that explains its purpose",
    choices: ["Grievances", "Proclamation", "Preamble", "Petition"], correct: 2, category: "vocab" },
  { question: "A soldier who is paid to fight for a country other than their own",
    choices: ["Minutemen", "Militia", "Mercenary", "Delegate"], correct: 2, category: "vocab" },
  { question: "When ships or soldiers stop people or supplies from coming in or out of a place",
    choices: ["Revolution", "Blockade", "Tyranny", "Repeal"], correct: 1, category: "vocab" },
  { question: "When prices go up and money buys less than it did before",
    choices: ["Blockade", "Repeal", "Grievances", "Inflation"], correct: 3, category: "vocab" },
  { question: "A major change, often the overthrow of one government to create a new one",
    choices: ["Revolution", "Independence", "Tyranny", "Proclamation"], correct: 0, category: "vocab" },
  { question: "To leave the army without permission and not come back",
    choices: ["Quarter", "Repeal", "Desert", "Blockade"], correct: 2, category: "vocab" },
  { question: "Complaints or reasons people are unhappy and want things to change",
    choices: ["Tyranny", "Petition", "Preamble", "Grievances"], correct: 3, category: "vocab" },
  { question: "Cruel or unfair control by a ruler or government",
    choices: ["Tyranny", "Revolution", "Independence", "Blockade"], correct: 0, category: "vocab" },
  { question: "Freedom from control by another country or ruler",
    choices: ["Revolution", "Neutral", "Independence", "Proclamation"], correct: 2, category: "vocab" },
  { question: "An official public announcement",
    choices: ["Petition", "Preamble", "Grievances", "Proclamation"], correct: 3, category: "vocab" },
  { question: "A person chosen to represent others at a meeting or assembly",
    choices: ["Congress", "Delegate", "Patriot", "Militia"], correct: 1, category: "vocab" },
  { question: "A group of representatives who meet to make laws or decisions",
    choices: ["Militia", "Delegates", "Minutemen", "Congress"], correct: 3, category: "vocab" },
  { question: "A group of ordinary people who train to fight in emergencies",
    choices: ["Mercenaries", "Congress", "Militia", "Minutemen"], correct: 2, category: "vocab" },
  { question: "Not taking sides in a conflict or argument",
    choices: ["Neutral", "Loyalist", "Patriot", "Delegate"], correct: 0, category: "vocab" },
  { question: "To provide soldiers with a place to stay and food",
    choices: ["Desert", "Blockade", "Quarter", "Repeal"], correct: 2, category: "vocab" },
  { question: "To cancel or take back a law",
    choices: ["Proclamation", "Repeal", "Petition", "Preamble"], correct: 1, category: "vocab" },
  // ---- MC-BASED (15): knowledge description → pick the answer ----
  { question: "The British marched there to arrest Samuel Adams and John Hancock and seize weapons",
    choices: ["Boston", "Philadelphia", "Lexington and Concord", "Trenton"], correct: 2, category: "mc" },
  { question: "This leader refused to read the Olive Branch Petition and declared the colonies in rebellion",
    choices: ["Thomas Jefferson", "King George III", "Samuel Adams", "Benjamin Franklin"], correct: 1, category: "mc" },
  { question: "Colonists dumped 342 chests of tea into Boston Harbor to protest British taxes",
    choices: ["The Intolerable Acts", "The Stamp Act Protest", "The Boston Tea Party", "The Boston Massacre"], correct: 2, category: "mc" },
  { question: "Women who made homespun cloth so colonists wouldn't need to buy British products",
    choices: ["Committee of Correspondence", "Minutemen", "Sons of Liberty", "Daughters of Liberty"], correct: 3, category: "mc" },
  { question: "Strict laws that closed Boston Harbor, forced quartering, and removed self-government",
    choices: ["The Stamp Act", "The Tea Act", "The Intolerable Acts", "The Townshend Acts"], correct: 2, category: "mc" },
  { question: "Washington placed cannons from Fort Ticonderoga on this hill to force the British out of Boston",
    choices: ["Bunker Hill", "Dorchester Heights", "Valley Forge", "Lexington Green"], correct: 1, category: "mc" },
  { question: "A free Black man who petitioned for African American rights and founded the first African American Masonic Lodge",
    choices: ["Crispus Attucks", "Prince Hall", "Samuel Adams", "John Hancock"], correct: 1, category: "mc" },
  { question: "British soldiers fired into a crowd of colonists, killing five people including Crispus Attucks",
    choices: ["The Boston Tea Party", "The Battle of Trenton", "The Intolerable Acts", "The Boston Massacre"], correct: 3, category: "mc" },
  { question: "They wrote and sent letters between colonies to share information and organize a united response",
    choices: ["Sons of Liberty", "Daughters of Liberty", "Committees of Correspondence", "Continental Congress"], correct: 2, category: "mc" },
  { question: "Its two goals were to help the British East India Company and to get colonists to accept Parliament's right to tax them",
    choices: ["The Stamp Act", "The Tea Act", "The Intolerable Acts", "The Quartering Act"], correct: 1, category: "mc" },
  { question: "Washington crossed the Delaware River on Christmas night to surprise tired Hessian soldiers",
    choices: ["Battle of Boston", "Battle of Lexington", "Battle of Trenton", "Battle of Concord"], correct: 2, category: "mc" },
  { question: "She disguised herself as a man named 'Robert Shurtleff' and fought as a soldier",
    choices: ["Mary Ludwig Hays", "Deborah Sampson", "Martha Washington", "Abigail Adams"], correct: 1, category: "mc" },
  { question: "She brought water to soldiers and took over firing her husband's cannon when he was wounded",
    choices: ["Deborah Sampson", "Abigail Adams", "Mary Ludwig Hays", "Martha Washington"], correct: 2, category: "mc" },
  { question: "He was chosen by the Continental Congress to write the Declaration of Independence",
    choices: ["Benjamin Franklin", "John Adams", "George Washington", "Thomas Jefferson"], correct: 3, category: "mc" },
  { question: "They organized protests, burned stamps, and destroyed tax collectors' property to fight the Stamp Act",
    choices: ["Daughters of Liberty", "Sons of Liberty", "Committees of Correspondence", "Continental Congress"], correct: 1, category: "mc" }
];
