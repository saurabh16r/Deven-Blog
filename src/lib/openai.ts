import OpenAI from 'openai';
import { uploadImage } from './cloudinary';

const apiKey = process.env.OPENAI_API_KEY;
const isConfigured = !!apiKey;

const openai = isConfigured ? new OpenAI({ apiKey }) : null;

/**
 * Generate a 5-bullet summary using GPT-4o-mini
 */
export async function generateSummary(title: string, htmlContent: string): Promise<string> {
  if (!isConfigured || !openai) {
    console.warn('OpenAI API key missing. Generating mock summary takeaways.');
    return [
      "Key Takeaways",
      `• FounderBrief delivers concise startup insights in 5 minutes based on "${title}".`,
      "• Consistently tracking user metrics helps modern businesses iterate rapidly.",
      "• Automation and AI integration are transforming content discovery for digital brands.",
      "• Establishing early newsletter relationships creates a defensible community moat.",
      "• Direct subscriber outreach improves product retention and boosts organic feedback loops."
    ].join('\n');
  }

  // Remove HTML tags for prompt safety and size
  const plainText = htmlContent.replace(/<[^>]*>/g, ' ').substring(0, 4000);

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an elite editorial AI assistant. Provide exactly 5 bullet points summarizing the text. Format exactly as: \nKey Takeaways\n• Bullet 1\n• Bullet 2\n• Bullet 3\n• Bullet 4\n• Bullet 5\nDo not add additional headers, intros, or summaries.'
        },
        {
          role: 'user',
          content: `Title: ${title}\nContent:\n${plainText}`
        }
      ],
      temperature: 0.5,
    });

    const resultText = response.choices[0]?.message?.content?.trim();
    if (!resultText) {
      throw new Error('Empty summary response');
    }
    return resultText;
  } catch (error) {
    console.error('OpenAI summary error:', error);
    throw error;
  }
}

/**
 * Generate Text-to-Speech audio and return the public URL (or mock URL)
 */
export async function generateSpeech(title: string, htmlContent: string): Promise<string> {
  const plainText = htmlContent.replace(/<[^>]*>/g, ' ').substring(0, 1200); // Limit to save quota
  const ttsText = `Listening to: ${title}. ${plainText}`;

  if (!isConfigured || !openai) {
    console.warn('OpenAI API key missing. Returning mock audio URL.');
    // Return a high quality public mock mp3
    return 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
  }

  try {
    const mp3Response = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'alloy',
      input: ttsText,
    });

    const buffer = Buffer.from(await mp3Response.arrayBuffer());
    
    // Cloudinary supports uploading raw buffer documents by prefixing base64
    const base64Audio = `data:audio/mp3;base64,${buffer.toString('base64')}`;
    
    // Upload base64 audio to Cloudinary
    const uploadResult = await uploadImage(base64Audio);
    return uploadResult;
  } catch (error) {
    console.error('OpenAI TTS error:', error);
    throw error;
  }
}
