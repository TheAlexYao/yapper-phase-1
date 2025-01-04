export function normalizeSpanishText(text: string): string {
  // Remove multiple occurrences of 'y' and normalize spaces
  return text.replace(/\s+y\s+y\s+/g, ' y ').trim();
}

export function cleanupRecognitionResult(result: any): any {
  if (!result?.NBest?.[0]) return result;
  
  // Clean up Words array to remove duplicate 'y' entries
  const words = result.NBest[0].Words;
  if (!Array.isArray(words)) return result;
  
  let cleanedWords = [];
  let lastWasY = false;
  
  for (const word of words) {
    if (word.Word.toLowerCase() === 'y') {
      if (!lastWasY) {
        cleanedWords.push(word);
        lastWasY = true;
      }
    } else {
      cleanedWords.push(word);
      lastWasY = false;
    }
  }
  
  // Update the result with cleaned words
  result.NBest[0].Words = cleanedWords;
  
  return result;
}