import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
const isConfigured = !!apiKey;

const genAI = isConfigured ? new GoogleGenerativeAI(apiKey) : null;

/**
 * Helper to retry a promise-returning function with exponential backoff
 */
async function generateWithRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    console.warn(`Gemini API request failed. Retrying in ${delay}ms... (Attempts remaining: ${retries})`, error);
    await new Promise(resolve => setTimeout(resolve, delay));
    return generateWithRetry(fn, retries - 1, delay * 2);
  }
}

/**
 * Generate a 5-bullet summary using Google Gemini API
 */
export async function generateSummary(title: string, htmlContent: string): Promise<string> {
  if (!isConfigured || !genAI) {
    console.warn('GEMINI_API_KEY is missing. Generating mock summary takeaways.');
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
  const plainText = htmlContent.replace(/<[^>]*>/g, ' ').substring(0, 8000);

  const prompt = `You are an elite editorial AI assistant. Provide exactly 5 bullet points summarizing the text. 
Format exactly as: 
Key Takeaways
• Bullet 1
• Bullet 2
• Bullet 3
• Bullet 4
• Bullet 5

Do not add additional headers, intros, or summaries.

Title: ${title}
Content:
${plainText}`;

  try {
    return await generateWithRetry(async () => {
      // Use the latest gemini-2.5-flash model for fast and high-quality summarization
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const response = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
        }
      });
      const resultText = response.response.text()?.trim();
      if (!resultText) {
        throw new Error('Empty summary response from Google Gemini');
      }
      return resultText;
    });
  } catch (error) {
    console.error('Google Gemini summary error:', error);
    throw error;
  }
}
