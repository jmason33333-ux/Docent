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
  }
};

async function generateChapterNotes(chapterType, chapterNumber = null) {
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
    console.error('Usage: node generate-twok-chapters.js <prologue|chapter> [chapterNumber]');
    console.error('Example: node generate-twok-chapters.js prologue');
    console.error('Example: node generate-twok-chapters.js chapter 1');
    process.exit(1);
  }

  const chapterType = args[0];
  const chapterNumber = args[1] ? parseInt(args[1], 10) : null;

  if (chapterType === 'chapter' && (!chapterNumber || isNaN(chapterNumber) || chapterNumber < 1)) {
    console.error('❌ Chapter number must be a positive integer');
    process.exit(1);
  }

  generateChapterNotes(chapterType, chapterNumber).catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
}

module.exports = { generateChapterNotes, CHAPTER_DATA };

