#!/usr/bin/env node

/**
 * Generate chapter notes for The Way of Kings
 * Usage: node generate-twok-chapters.js <chapterType> <chapterNumber>
 * Example: node generate-twok-chapters.js prologue
 * Example: node generate-twok-chapters.js chapter 1
 */

const fs = require('fs');
const path = require('path');
const { generateContent } = require('./llm-client');
const { getChapterNotesPrompt } = require('./prompts');
const { normalizeBookTitle } = require('../utils/rag-loader');

// Chapter data with summaries
const CHAPTER_DATA = {
  prologue: {
    title: 'To Kill',
    pov: 'Szeth',
    text: `Prologue: To Kill

Characters

Szeth (point of view)

Dalinar Kholin

Elhokar Kholin

Torol Sadeas

Gavilar Kholin

Jasnah Kholin (mentioned only)

Jezrien (mentioned only)

Ishar (mentioned only)

Kalak (mentioned only)

Talenel (mentioned only)

Shalash (mentioned only)

Thaidakar (mentioned only)

Restares (mentioned only)

Plot summary

4500 years later, Szeth, a Truthless Shin assassin, waits quietly in a large room, watching the Alethi celebrate the signing of a peace treaty with the Parshendi. He leaves the room, noting that his Parshendi masters will soon withdraw. Szeth wears white under the orders of the Parshendi to follow their traditions so that King Gavilar could see him coming.

When he reaches the area just outside the King's quarters, Szeth uses his abilities as a Surgebinder to fight his way past the guards. As he reaches the king's quarters, he is confronted by a Shardbearer as the King flees.

Szeth fights his way past the Shardbearer but soon realizes that the Shardbearer, not the man he is chasing, is King Gavilar. He returns and fights him, eventually defeating him by causing the balcony he is standing on to collapse, mortally wounding him. Szeth is nearly killed in the fight. When Szeth tells Gavilar the Parshendi sent him, Gavilar is confused and says, "The Parshendi? That makes no sense."

Gavilar then gives Szeth a strange black sphere and tells him, "You must take this. They must not get it." He then instructs Szeth to tell Gavilar's brother Dalinar that he must "find the most important words a man can say."

As a Shin, Szeth considers a dying wish to be sacred, so he leaves a note for Dalinar written in Gavilar's blood. He takes the sphere and flees.`
  },
  1: {
    title: 'Stormblessed',
    pov: 'Cenn',
    timeContext: 'Five years later',
    text: `Chapter 1: Stormblessed

Characters

Cenn (point of view)

Dallet

Kaladin

Cyn

Korater

Veden Shardbearer

Meridas Amaram (mentioned only)

Gare (mentioned only)

Torol Sadeas (mentioned only)

Gavilar Kholin (mentioned only)

Kusiri (mentioned only)

Hallaw (mentioned only)

Plot summary

Cenn, a new recruit in Brightlord Meridas Amaram's army, is terrified. He is about to face his first battle and has no real idea of what to expect. Cenn is pulled into a new squad, that of Kaladin Stormblessed, at the last minute for reasons he doesn't understand.

Dallet, a sergeant, picks Cenn up and returns him to the squad. They are soon joined by Kaladin, who asks Dallet to take care of Cenn during the battle as he won't know the group's signals. They then fall to discussing tactics.

The opposing force arrives and the battle begins. Kaladin's squad does not lose a single man. At one point, Kaladin singlehandedly fights off six enemy spearmen to save Cenn. When an enemy Brightlord appears, Kaladin and his squad attempt to defeat him. They are hindered, however, by the arrival of an enemy Shardbearer. Cenn blacks out from blood loss, and the scene cuts out.`
  },
  2: {
    title: 'Honor is Dead',
    pov: 'Kaladin',
    timeContext: 'Eight Months Later',
    text: `Chapter 2: Honor is Dead

Characters

Kaladin (point of view)

Tvlakv

Bluth

Syl

Taran

Lirin (mentioned only)

Cenn (mentioned only)

Dallet (mentioned only)

Tukks (mentioned only)

Tien (mentioned only)

Plot summary

Kaladin is now a slave in a caravan, waiting to be sold and struggling to retain his ability to not think like a slave.

When approached by another slave about escaping, Kaladin gruffly tells him that he has no plans to escape because it will never work. A second slave approaches Kaladin and asks how he came to be a slave. When Kaladin doesn't respond, the other men tell their stories. It eventually comes out that Kaladin killed a man, but the one he did not kill is the reason he's a slave.

Kaladin idly toys with a leaf of blackbane, contemplating using it to poison Tvlakv, his slave trader. A windspren in the form of a slender young woman only a handspan tall speaks to Kaladin and wants to know what the blackbane is. Kaladin is surprised that she knows his name. As they converse, he observes that she is much more intelligent than a typical spren. When she asks why he doesn't fight anymore, he says that he has failed.

Kaladin sees Tvlakv going to inspect a sick slave. Kaladin tells him that the man has the grinding coughs and will survive if given extra water. Tvlakv removes the man from the rest of the slaves, and Kaladin thinks he is going to give him water. Instead, Bluth brutally murders the man. Kaladin is upset over his failure to save him.

In his anger at the other slave's murder, he crushed the blackbane against the bars of the wagon, losing most of it.`
  },
  3: {
    title: 'City of Bells',
    pov: 'Shallan Davar',
    text: `Chapter 3: City of Bells

Characters

Shallan Davar (point of view)

Tozbek

Ashlv

Yalb

Jasnah Kholin (mentioned only)

Elhokar Kholin (mentioned only)

Lin Davar (mentioned only)

Valam (mentioned only)

Plot summary

Shallan Davar has just arrived in Kharbranth, the City of Bells. She experiences a culture-shock, amazed at the number and variety of people in the city.

After a short conversation with Captain Tozbek of the Wind's Pleasure, the boat she arrived on, she gets word that Jasnah Kholin, the woman she has been chasing for several months, is still in the city.

Shallan and one of Captain Tozbek's sailors, Yalb, make the trip up to the palace so Shallan can speak to Jasnah. When they arrive, she asks Yalb to wait for her outside the palace. It is revealed that Shallan had requested to be Jasnah's ward, and that Jasnah told her to meet her in Dumadari. Shallan has been chasing her from city to city ever since.

Shallan is very nervous as her house's finances are in ruins since the death of her father, and if she doesn't find some source of income or other means of controlling their rival political houses, her house won't last long. She also reveals that her request to be Jasnah's ward is somehow related to resolving her house's crisis, though she does not make clear how.

The chapter ends with Shallan turning a corner and seeing Jasnah.`
  },
  4: {
    title: 'The Shattered Plains',
    pov: 'Kaladin',
    text: `Chapter 4: The Shattered Plains

Characters

Kaladin (point of view)

Sylphrena

Tvlakv

Bluth

Tag

Meridas Amaram (mentioned only)

Elhokar Kholin (mentioned only)

Roshone (mentioned only)

Katarotam (mentioned only)

Plot summary

Kaladin is sitting in the slave wagon, waiting for the caravan to stop for lunch and noting that it's well after the time the caravan usually stops. After a few minutes, he realizes that it is because Tvlakv is lost. Tvlakv remembers that Kaladin was once an Alethi soldier and might have knowledge of the lands. When he asks Kaladin to help them find the way out, Kaladin tears his map to pieces and tells Tvlakv that he doesn't know the way out.

In the conversation that follows, Tvlakv says that he is only comfortable with the idea of Kaladin escaping because he knows that he wants revenge on Brightlord Amaram more than he does on Tvlakv. Kaladin realizes that if Tvlakv knows about Amaram, then he also knows that Kaladin isn't actually a deserter, in contrast to the official story given when he was sold. Tvlakv acknowledges this but says that it's the story they will stick to because men who are guilty of high crimes are difficult to sell at a good price.

A short time later, the windspren comes back. She had apparently left during the recent highstorm, but now tells Kaladin that there is a large group of people not far away. A few minutes later, Kaladin realizes that it's an Alethi war camp, and that their destination is the Shattered Plains.

The other slaves express hope that they will be treated fairly in the warcamps. Kaladin has his doubts, thinking of the many lighteyes who have proven to be corrupt in the past. His one remaining hope is that he will be allowed to fight again.`
  },
  5: {
    title: 'Heretic',
    pov: 'Shallan Davar',
    text: `Chapter 5: Heretic

Characters

Shallan Davar (point of view)

Jasnah Kholin

Taravangian

Taravangian's granddaughter

Elhokar Kholin (mentioned only)

Tormas (mentioned only)

Nashan (mentioned only)

Niali the Just (mentioned only)

Nohadon (mentioned only)

Placini (mentioned only)

Gabrathin (mentioned only)

Yustara (mentioned only)

Manaline (mentioned only)

Syasikk (mentioned only)

Shauka-daughter-Hasweth (mentioned only)

Barlesha Lhan (mentioned only)

Fabrisan (mentioned only)

Malise Gevelmar (mentioned only)

Plot summary

As Shallan meets Jasnah Kholin for the first time, she admires Jasnah as the ideal beauty – tall, Alethi tan skin, long dark hair. She is talking to a man who Shallan later identifies as King Taravangian of Kharbranth.

Jasnah and Taravangian seem to be negotiating over something, though Shallan can't tell what. As they begin to walk, Jasnah beckons for Shallan to follow. After a preliminary conversation, Jasnah mentions that because Shallan was so persistent in seeking her out, she will hear her petition to be her ward. Shallan is shocked, as she had believed that she had already been accepted as Jasnah's ward.

A lengthy conversation about Shallan's level of education ensues, in which it is decided that Shallan has passing skill in most subjects, is very good in the sciences, excels at drawing and writing (the feminine arts), and is sadly lacking in history and philosophy.

They arrive at the entrance to a room which has been blocked off by a large, fallen stone. Shallan realizes that the king's granddaughter is trapped in the room, and Jasnah is planning to use her Soulcaster to remove the stone in exchange for access to the Palanaeum.

Jasnah Soulcasts the stone, transforming it into smoke. The king retrieves his granddaughter and, when asked, agrees to take Jasnah to the Palanaeum.

Jasnah rejects Shallan as her ward because of her lack of education in history and philosophy. Shallan is frustrated, but decides to persevere. It is then that Shallan reveals that she wishes to become Jasnah's ward not out of scholarly pursuit, but in order to steal her Soulcaster to help her family's finances recover.`
  },
  6: {
    title: 'Bridge Four',
    pov: 'Kaladin',
    text: `Chapter 6: Bridge Four

Characters

Kaladin (point of view)

Tvlakv

Bluth

Tag

Hashal

Gaz

Sylphrena

Gavilar Kholin (mentioned only)

Laral (mentioned only)

Meridas Amaram (mentioned only)

Lamaril (mentioned only)

Torol Sadeas (mentioned only)

Dalinar Kholin (mentioned only)

Plot summary

Kaladin and the rest of the slave caravan have arrived at the Shattered Plains, specifically at the warcamp of Highprince Sadeas. They are taken to a woman who is to decide whether she can use any of the slaves or not. When Kaladin tries to convince her to let him fight, Tvlakv tells her that Kaladin is a deserter, dashing his hopes.

The woman decides that Kaladin and his companions are to be made members of the bridge crews. Kaladin and his new immediate superior, Gaz, take an instant dislike to each other, and as a result, Kaladin is placed in one of the worst locations on the bridge when they are called on a bridge run, without the benefit of shoes or vest for protection.

After several hours of agony carrying the bridge, they arrive at the chasm where the enemy Parshendi are waiting on the other side. They take volleys of arrows while placing their bridge. Kaladin is the only survivor in the front row.

He wakes up hours later when the windspren who's been following him shocks him with some sort of energy. Kaladin realizes that if he doesn't hurry, he will be left behind. The spren tells him that her name is Sylphrena, or Syl.

Though he is exhausted, Kaladin takes a spot on the bridge and begins the long way back to camp.`
  },
  7: {
    title: 'Anything Reasonable',
    pov: 'Shallan Davar',
    text: `Chapter 7: Anything Reasonable

Characters

Shallan Davar (point of view)

Kabsal

Jasnah Kholin

Lin Davar (mentioned only)

Luesh (mentioned only)

Balat Davar (mentioned only)

Yalb (mentioned only)

Taravangian (mentioned only)

the Almighty (mentioned only)

Lhanin (mentioned only)

Dandos Heraldin (mentioned only)

Plot summary

Shallan is en route to the Palanaeum, hoping to convince Jasnah that she is worthy to be her ward. She believes that it is critical that she find a way to do so, as without her father, her family can no longer Soulcast its way into wealth or manipulate others into doing as they want.

She is allowed to wait for Jasnah in her reading alcove, though she is denied access to the Palanaeum itself. While she waits, she sketches several Memories from the past few hours, then writes a letter to Jasnah containing arguments for her reconsideration. She is interrupted by an ardent introducing himself as Kabsal. He asks to wait for Jasnah with Shallan and praises her sketches highly.

Kabsal tells Shallan that he is trying to convert Jasnah, an avowed atheist, to Vorinism. He leaves, asking her to let Jasnah know that he had come by to speak with her. She agrees, and begins to lacquer her drawings. She realizes that she's been there for quite a while and begins to gather her things, leaving the letter for Jasnah. Before she can leave, however, Jasnah appears in the doorway, looking displeased.`
  },
  8: {
    title: 'Nearer the Flame',
    pov: 'Shallan Davar',
    text: `Chapter 8: Nearer the Flame

Characters

Shallan Davar (point of view)

Jasnah Kholin

Yalb

Artmyrn

Kabsal (mentioned only)

Lin Davar (mentioned only)

Balat Davar (mentioned only)

Wikim Davar (mentioned only)

Jushu Davar (mentioned only)

Helaran Davar (mentioned only)

Tozbek (mentioned only)

Placini (mentioned only)

Gabrathin (mentioned only)

Yustara (mentioned only)

Manaline (mentioned only)

Shauka-daughter-Hasweth (mentioned only)

Rencalt (mentioned only)

Szeth (mentioned only)

Barmest (mentioned only)

Plot summary

Jasnah scolds Shallan, telling her that she had already made her decision. Shallan is embarrassed that she disturbed Jasnah again and leaves. After only a few moments, however, Jasnah calls her back and apologizes to her and gives her Shallan's money pouch that she had left behind.

Shallan asks Jasnah to read the letter she had written for her earlier. Jasnah is impressed that she is self-taught and agrees to accept Shallan as her ward once she has adequately learned philosophy and history. Shallan is pleased by this, but worries that she cannot learn fast enough to save her house.

Shallan leaves the Conclave and meets up with Yalb, who has been gambling with some guards. Yalb insists that she is talented enough to be accepted if she would just be more persistent, so she decides to buy a bunch of books on history and philosophy and return to start studying right away, planning to impress Jasnah with her rapid learning just before Jasnah leaves Kharbranth. Before long, however, she is interrupted by Jasnah, who had paid the servants to tell her if Shallan returned to the Palanaeum.

Jasnah asks to see Shallan's satchel. When she comes across Shallan's sketches with notes on biology, she asks why she made them, to which Shallan replies that she wanted to. It is ultimately the fact that Shallan pursues scholarship in her free time, along with her persistence, that convince Jasnah to accept her as her ward.

Shallan reflects that now she's completed the first phase of her plan, but now needs to discover how to accomplish the rest of it without being caught.`
  },
  9: {
    title: 'Damnation',
    pov: 'Kaladin',
    text: `Chapter 9: Damnation

Characters

Kaladin (point of view)

Sylphrena

Gaz

Laresh

Torol Sadeas (mentioned only)

Lirin (mentioned only)

Tien (mentioned only)

Cenn (mentioned only)

Plot Summary

Kaladin has now been a member of the bridge crews for somewhere between two to four weeks. Of the twenty five who survived his first bridge run, only one other man is still alive.

A few new arrivals are brought in, and Kaladin sees a young boy who reminds him of his younger brother Tien. In general, Kaladin is handling the transition to life as a bridge crew member poorly, snapping at Syl and becoming despondent. Syl leaves, unable to continue watching him in his current state.

The bridge crews are called on another run, and the boy who reminded him of Tien is killed, as well as the only remaining man from Kaladin's first bridge run. Kaladin thinks to himself that he is dead inside, then proceeds to cry.`
  },
  10: {
    title: 'Stories of Surgeons',
    pov: 'Kaladin',
    timeContext: 'Nine Years Ago',
    text: `Chapter 10: Stories of Surgeons

Characters

Kaladin (point of view)

Lirin

Sani

Hesina (mentioned only)

Hammie (mentioned only)

Tien (mentioned only)

Jam (mentioned only)

Meridas Amaram (mentioned only)

Wistiow (mentioned only)

Gavilar Kholin (mentioned only)

Vathe (mentioned only)

Plot Summary

Kal (his nickname as a boy) helps his father, Lirin, treat a young woman, Sani. He reflects over the course of the surgery on how his family is treated so differently because of his father's career.

When they finish amputating Sani's middle finger, Lirin asks Kaladin why he was late to arrive, and Kaladin replies that he was with a boy named Jam learning to use a quarterstaff. This sparks a debate between Kaladin and Lirin about the relative merits of being a soldier or a surgeon. Lirin meets Kaladin's claim that it's possible to save lives by killing others with the assertion that doing so is like "trying to stop a storm by blowing harder." Eventually, Kaladin simply stops arguing and goes back to cleaning up the room.

Lirin quizzes him on various things a surgeon should know, then tells him that he plans to send him to Kharbranth to train under the surgeons there if he can find a way to do so. Lirin also tells him that he's incredibly gifted when it comes to surgery, and he shouldn't waste himself on soldiering.`
  },
  11: {
    title: 'Droplets',
    pov: 'Kaladin',
    text: `Chapter 11: Droplets

Characters

Kaladin (point of view)

Gaz

Sylphrena

Teft

Lirin (mentioned only)

Tien (mentioned only)

Meridas Amaram (mentioned only)

Plot Summary

Kaladin is outside just after a highstorm, going to the Honor Chasm to commit suicide. Gaz stops him, accusing him of trying to steal spheres left out in the Highstorm from others, but Kaladin simply ignores him and goes.

Just as Kaladin is about to step into the chasm, Syl reappears, carrying a single blackbane leaf which she had brought hoping to make Kaladin happy. When Kaladin expresses his frustrations at his previous failures to protect people, Syl convinces him to try again, arguing that the bridgemen are going to die anyway, so his efforts cannot hurt.

Kaladin returns to the camp and attacks Gaz, throwing him to the ground. He demands that Gaz make him bridgeleader of Bridge Four, and that he give Kaladin full control of it. In return, Gaz receives one fifth of Kaladin's wages.

Kaladin then goes inside the barracks and begins asking the other bridgemen's names, noticing for the first time how pathetic they all are.`
  }
};

// Interlude data
const INTERLUDE_DATA = {
  1: {
    title: 'Ishikk',
    pov: 'Ishikk',
    text: `Interlude I-1: Ishikk

Characters

Ishikk (point of view)

Thaspic

Maib

Blunt

Grump

Thinker

Hoid (mentioned only)

Plot summary

Ishikk, a fisherman in the Purelake, is just returning home after a long day of fishing. After pausing to talk to Thaspic he meets with Maib, a local woman who has been attempting to get him to marry her for years by trying to keep him in her debt, mostly by giving him food. Ishikk tries to counterbalance her efforts by bringing her fish that cure her aches in her joints.

Following a brief conversation with Maib, Ishikk goes to meet with a group of foreigners. They ask him about whether he has any new information for them, and Ishikk tells them that he has been to many villages in the area and none of them know anything about the man the foreigners are looking for, revealed to be Hoid. The foreigners (all worldhoppers, namely Demoux from Scadrial, Galladon from Sel and Baon from Taldain) argue amongst themselves for a while, then leave Ishikk to his thoughts.`
  },
  2: {
    title: 'Nan Balat',
    pov: 'Balat Davar',
    text: `Interlude I-2: Nan Balat

Characters

Balat Davar (point of view)

Scrak

Wikim Davar

Eylita (mentioned only)

Shallan Davar (mentioned only)

Lin Davar (mentioned only)

Helaran Davar (mentioned only)

Jushu Davar (mentioned only)

Plot summary

Balat Davar, Shallan's brother, is torturing various small animals in the gardens of their family's estate. He reflects on how Shallan is doing most of the work to save their family and tries to convince himself that he isn't a coward for remaining at home to manage the estate. He admits to some resentment of Shallan because of all of their siblings, she was the only one their father never truly got angry at, but is shortly interrupted in his thoughts by Wikim, another brother, coming to find him with the announcement that they have a big problem.`
  },
  3: {
    title: 'The Glory of Ignorance',
    pov: 'Szeth',
    text: `Interlude I-3: The Glory of Ignorance

Characters

Szeth (point of view)

Took

Ton

Amark

Avado (mentioned only)

Gavilar Kholin (mentioned only)

the Nightwatcher (mentioned only)

Plot summary

Szeth is now serving a man named Took, who uses him to gain the admiration of mine workers (and free drinks) in the small towns they pass through. As a demonstration of Szeth's total obedience, he has him do various things, such as jump up and down and cut his own arm. When he orders Szeth to kill himself, Szeth informs him that he cannot be ordered to kill himself, and returns to his own thoughts. The others are shocked at how refined his speech is and are slightly discomfited, associating him with the lighteyes. Szeth reflects that his speech and mannerisms may well be part of the reason that his masters never keep him for long, since his masters know that he is capable of so much more than they are using him for, and that in many ways, he is much more refined and intelligent than they are. Szeth revels in his common labor, though, as it means that he is not being used to spill more blood.

As the night passes on and it becomes apparent that the townsfolk are no longer really listening to Took's stories, Took and Szeth leave. However, on the way out of town, Took is killed by a group of thugs, who consider selling Szeth to the slavers. Then one of them picks up Szeth's Oathstone, and he informs them of his obligation to serve them as long as they hold it. When asked for clarification, Szeth tells him that he must obey any order except to kill himself, and thinks to himself that he can't be asked to give up his Shardblade either, but the man need not know that. The man muses for a moment on the possibilities he has with such a servant.`
  }
};

async function generateChapterNotes(chapterType, chapterNumber = null, interludeNumber = null) {
  const bookTitle = 'The Way of Kings';
  const bookSlug = normalizeBookTitle(bookTitle);
  
  // Check for Series structure
  const seriesPath = path.join(__dirname, '..', 'rag', 'Series');
  const seriesMap = {
    'rhythm-of-war': 'The Stormlight Archive',
    'words-of-radiance': 'The Stormlight Archive',
    'the-way-of-kings': 'The Stormlight Archive',
    'oathbringer': 'The Stormlight Archive',
    'dawnshard': 'The Stormlight Archive'
  };
  
  let chaptersDir = null;
  
  // Try Series structure first
  if (seriesMap[bookSlug]) {
    const seriesName = seriesMap[bookSlug];
    const seriesBookPath = path.join(seriesPath, seriesName, 'books', bookSlug);
    
    if (chapterType === 'prologue') {
      chaptersDir = path.join(seriesBookPath, 'chapters');
    } else if (chapterType === 'chapter') {
      // Part 1 folder structure
      chaptersDir = path.join(seriesBookPath, 'chapters', 'Part 1');
      if (!fs.existsSync(chaptersDir)) {
        fs.mkdirSync(chaptersDir, { recursive: true });
      }
    } else if (chapterType === 'interlude') {
      // Interlude structure: interlude-1/interlude-i-1.md (same as Rhythm of War)
      const interludeDirName = `interlude-${interludeNumber}`;
      chaptersDir = path.join(seriesBookPath, 'chapters', interludeDirName);
      if (!fs.existsSync(chaptersDir)) {
        fs.mkdirSync(chaptersDir, { recursive: true });
      }
    }
  }
  
  // Fallback to legacy structure
  if (!chaptersDir || !fs.existsSync(path.dirname(chaptersDir))) {
    chaptersDir = path.join(__dirname, '..', 'rag', 'books', bookSlug, 'chapters');
  }
  
  // Ensure directory exists
  if (!fs.existsSync(chaptersDir)) {
    fs.mkdirSync(chaptersDir, { recursive: true });
  }

  // Get chapter data
  let chapterData;
  let chapterIdentifier;
  let outputFile;
  
  if (chapterType === 'prologue') {
    chapterData = CHAPTER_DATA.prologue;
    chapterIdentifier = 'Prologue';
    outputFile = path.join(chaptersDir, 'prologue.md');
  } else if (chapterType === 'chapter' && chapterNumber) {
    chapterData = CHAPTER_DATA[chapterNumber];
    if (!chapterData) {
      console.error(`❌ No data found for Chapter ${chapterNumber}`);
      process.exit(1);
    }
    chapterIdentifier = chapterNumber;
    outputFile = path.join(chaptersDir, `chapter-${String(chapterNumber).padStart(2, '0')}.md`);
  } else if (chapterType === 'interlude' && interludeNumber && chapterNumber) {
    // Interlude structure: interlude-i-1.md
    chapterData = INTERLUDE_DATA[chapterNumber];
    if (!chapterData) {
      console.error(`❌ No data found for Interlude I-${chapterNumber}`);
      process.exit(1);
    }
    chapterIdentifier = `Interlude I-${chapterNumber}`;
    outputFile = path.join(chaptersDir, `interlude-i-${chapterNumber}.md`);
  } else {
    console.error('❌ Invalid chapter type or number');
    process.exit(1);
  }

  // Check if file already exists
  if (fs.existsSync(outputFile)) {
    console.log(`⚠️  File already exists: ${outputFile}`);
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const answer = await new Promise(resolve => {
      readline.question('Overwrite? (y/n): ', resolve);
    });
    readline.close();
    
    if (answer.toLowerCase() !== 'y') {
      console.log('❌ Cancelled.');
      return;
    }
  }

  console.log(`\n📚 Generating notes for ${bookTitle}, ${chapterType === 'prologue' ? 'Prologue' : `Chapter ${chapterNumber}`}...\n`);
  console.log(`✅ Using provided text (${chapterData.text.length} characters)`);
  console.log('\n🤖 Generating formatted notes with AI... (this may take 30-60 seconds)\n');

  // Generate prompt with the chapter text
  const prompt = getChapterNotesPrompt(bookTitle, chapterIdentifier, chapterData.text);
  
  // Generate formatted notes
  let formattedNotes;
  try {
    formattedNotes = await generateContent(prompt, {
      model: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 4000
    });
  } catch (error) {
    console.error('❌ Failed to generate notes:', error.message);
    process.exit(1);
  }

  // Save formatted notes
  fs.writeFileSync(outputFile, formattedNotes, 'utf-8');
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✨ DONE!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`✅ Formatted notes saved to:`);
  console.log(`   ${outputFile}\n`);
  console.log(`📝 The notes are ready to use with Rowan!\n`);
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.error('Usage: node generate-twok-chapters.js <prologue|chapter|interlude> [chapterNumber] [interludeGroup]');
    console.error('Example: node generate-twok-chapters.js prologue');
    console.error('Example: node generate-twok-chapters.js chapter 1');
    console.error('Example: node generate-twok-chapters.js interlude 1 1  (for Interlude I-1, in interlude-1 folder)');
    process.exit(1);
  }

  const chapterType = args[0];
  const chapterNumber = args[1] ? parseInt(args[1], 10) : null;
  const interludeGroup = args[2] ? parseInt(args[2], 10) : null;

  if ((chapterType === 'chapter' || chapterType === 'interlude') && (!chapterNumber || isNaN(chapterNumber) || chapterNumber < 1)) {
    console.error('❌ Chapter/Interlude number must be a positive integer');
    process.exit(1);
  }

  if (chapterType === 'interlude' && (!interludeGroup || isNaN(interludeGroup) || interludeGroup < 1)) {
    console.error('❌ Interlude group number must be a positive integer');
    process.exit(1);
  }

  generateChapterNotes(chapterType, chapterNumber, interludeGroup).catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
}

module.exports = { generateChapterNotes, CHAPTER_DATA, INTERLUDE_DATA };

