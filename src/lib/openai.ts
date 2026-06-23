import OpenAI from 'openai';
import { uploadImage } from './cloudinary';

const apiKey = process.env.OPENAI_API_KEY;
const isConfigured = !!apiKey;

const openai = isConfigured ? new OpenAI({ apiKey }) : null;

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
