#!/usr/bin/env node

/**
 * Generate Prelude notes for The Way of Kings
 * Usage: node generate-prelude-twok.js
 */

const fs = require('fs');
const path = require('path');
const { generateContent } = require('./llm-client');
const { getChapterNotesPrompt } = require('./prompts');
const { normalizeBookTitle } = require('../utils/rag-loader');

async function generatePreludeNotes() {
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
    chaptersDir = path.join(seriesBookPath, 'chapters');
  }
  
  // Fallback to legacy structure
  if (!chaptersDir || !fs.existsSync(path.dirname(chaptersDir))) {
    chaptersDir = path.join(__dirname, '..', 'rag', 'books', bookSlug, 'chapters');
  }
  
  // Ensure directory exists
  if (!fs.existsSync(chaptersDir)) {
    fs.mkdirSync(chaptersDir, { recursive: true });
  }

  const outputFile = path.join(chaptersDir, 'prelude.md');

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
      process.exit(0);
    }
  }

  // The prelude text provided by the user
  const preludeText = `Prelude to the Stormlight Archive

Characters

Kalak (point of view)

Jezrien

Talenel (mentioned only)

Ishar (mentioned only)

Plot Summary

Kalak, one of the ten Heralds, wanders through a torn landscape littered with dead humans, thunderclasts, and other beasts. He is traveling to the Heralds' preordained meeting place (a rocky spire) for those who survived the Desolation.

Upon arrival, he finds only their leader, Jezrien, waiting for him. At first, Kalak assumes that the other eight must have died, for the battle was "furious". However, he notices seven Honorblades driven point-first into the ground at the base of the spire. Jezrien then informs Kalak that the other Heralds have departed, abandoning the Oathpact. Kalak then admits to Jezrien that he can't return to "the place of nightmares", the waiting place of the Heralds between Desolations. Jezrien then tells Kalak to relinquish his blade as well, for "...it is time for the Oathpact to end." This effectively leaves Talenel (Taln), the only Herald who died in the battle, alone to uphold the Oathpact and the sole sufferer of the pain and torture in the waiting realm.

Kalak shows horror and disgust that both Jezrien and himself have been broken by the cycle of Desolations and that they are too weak to face their suffering. They plan to lie and tell the people that they finally won against the "enemy", saying it might even turn out to be true. Their abandonment of mankind is somewhat diluted by the fact that Ishar, another Herald, believes that "...so long as there is one of us still bound to the Oathpact (Talenel), it may be enough. There is a chance we might end the cycle of Desolations." Jezrien points out that mankind also has the Radiants.

Finally, both Jezrien and Kalak summon their Blades and slam them into the ground, along with the other seven. They depart in opposite directions along the barren landscape, vowing to go their own ways and to not seek one another or any of the other Heralds. As Kalak is leaving the ring of swords, he looks back and notices a single open spot, "The place where the tenth sword should have gone." Kalak feels deep sorrow and shame for Taln's exclusion, thinking to himself, "Forgive us..." as he walks away.`;

  console.log(`\n📚 Generating prelude notes for ${bookTitle}...\n`);
  console.log(`✅ Using provided prelude text (${preludeText.length} characters)`);
  console.log('\n🤖 Generating formatted notes with AI... (this may take 30-60 seconds)\n');

  // Generate prompt with the prelude text
  // Use "Prelude" as the chapter identifier
  const prompt = getChapterNotesPrompt(bookTitle, 'Prelude', preludeText);
  
  // Generate formatted notes
  let formattedNotes;
  try {
    formattedNotes = await generateContent(prompt, {
      model: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 4000
    });
  } catch (error) {
    console.error('❌ Failed to generate prelude notes:', error.message);
    process.exit(1);
  }

  // Save formatted notes
  fs.writeFileSync(outputFile, formattedNotes, 'utf-8');
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✨ DONE!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`✅ Formatted prelude notes saved to:`);
  console.log(`   ${outputFile}\n`);
  console.log(`📝 The notes are ready to use with Rowan!\n`);
}

// Run it
generatePreludeNotes().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});

