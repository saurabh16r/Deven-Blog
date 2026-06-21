import { clsx, type ClassValue } from 'clsx';

// We can define a simplified cn helper. Since tailwind-merge is not installed, we can just use clsx, or fallback.
// Let's implement a simple cn that works with standard clsx/Tailwind 4.
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function calculateReadingTime(text: string): number {
  if (!text) return 1;
  const wordsPerMinute = 225;
  // Clean html tags to count words accurately
  const cleanText = text.replace(/<[^>]*>/g, ' ');
  const wordCount = cleanText.trim().split(/\s+/).filter(w => w.length > 0).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

export function formatDate(date: string | Date): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')            // Replace spaces with -
    .replace(/[^\w\-]+/g, '')        // Remove all non-word chars
    .replace(/\-\-+/g, '-')          // Replace multiple - with single -
    .replace(/^-+/, '')              // Trim - from start
    .replace(/-+$/, '');             // Trim - from end
}
