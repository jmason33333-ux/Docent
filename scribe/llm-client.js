const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Generate content using OpenAI
 * @param {string} prompt - The prompt to send to the LLM
 * @param {Object} options - Generation options
 * @returns {Promise<string>} - Generated content
 */
async function generateContent(prompt, options = {}) {
  const {
    model = 'gpt-4o', // Use GPT-4o for higher quality content generation
    temperature = 0.7,
    maxTokens = 4000
  } = options;

  try {
    console.log(`🤖 Generating content with ${model}...`);
    
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are an expert literary analyst creating detailed, accurate notes for a fantasy reading companion app. You must be extremely careful about spoilers and only include information up to the specified chapter.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature,
      max_tokens: maxTokens
    });

    const content = completion.choices[0].message.content;
    const tokensUsed = completion.usage?.total_tokens || 0;
    
    console.log(`✅ Generated content (${tokensUsed} tokens)`);
    
    return content;
  } catch (error) {
    console.error('❌ Error generating content:', error.message);
    throw error;
  }
}

module.exports = { generateContent };


