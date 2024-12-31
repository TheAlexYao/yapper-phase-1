// Simple Thai word segmentation implementation for Deno
// This uses a basic dictionary-based approach that works without external dependencies

export interface SegmentationResult {
  segmentedText: string;
  wordMapping: {
    original: string;
    segmented: string;
    startIndex: number;
    endIndex: number;
  }[];
}

// Basic Thai characters for word boundary detection
const thaiConsonants = 'กขฃคฅฆงจฉชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรลวศษสหฬอฮ';
const thaiVowels = 'ะัาำิีึืุูเแโใไๅ็่้๊๋์';
const thaiToneMarks = '่้๊๋';

function isThaiConsonant(char: string): boolean {
  return thaiConsonants.includes(char);
}

function isThaiVowel(char: string): boolean {
  return thaiVowels.includes(char);
}

function isThaiToneMark(char: string): boolean {
  return thaiToneMarks.includes(char);
}

export function segmentThaiText(text: string): SegmentationResult {
  console.log('Segmenting Thai text:', text);
  
  // Remove existing spaces to ensure consistent segmentation
  const cleanText = text.replace(/\s+/g, '');
  const words: string[] = [];
  let currentWord = '';
  let currentIndex = 0;
  const wordMapping: SegmentationResult['wordMapping'] = [];
  
  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    currentWord += char;
    
    // Check for word boundaries
    if (i < cleanText.length - 1) {
      const nextChar = cleanText[i + 1];
      
      // Basic rules for word boundaries:
      // 1. After a vowel followed by a consonant
      // 2. After certain final consonants
      // 3. Before certain initial consonants
      if (
        (isThaiVowel(char) && isThaiConsonant(nextChar)) ||
        (isThaiConsonant(char) && !isThaiVowel(nextChar) && !isThaiToneMark(nextChar)) ||
        i === cleanText.length - 1
      ) {
        if (currentWord) {
          words.push(currentWord);
          wordMapping.push({
            original: currentWord,
            segmented: currentWord,
            startIndex: currentIndex,
            endIndex: currentIndex + currentWord.length
          });
          currentIndex += currentWord.length;
          currentWord = '';
        }
      }
    }
  }
  
  // Add the last word if there is one
  if (currentWord) {
    words.push(currentWord);
    wordMapping.push({
      original: currentWord,
      segmented: currentWord,
      startIndex: currentIndex,
      endIndex: currentIndex + currentWord.length
    });
  }

  console.log('Segmented words:', words);
  console.log('Word mapping:', wordMapping);
  
  return {
    segmentedText: words.join(' '),
    wordMapping
  };
}

export function mapSegmentedResultsToOriginal(
  segmentedResults: any,
  wordMapping: SegmentationResult['wordMapping']
) {
  if (!segmentedResults.NBest?.[0]) return segmentedResults;

  console.log('Mapping segmented results to original:', {
    segmentedResults,
    wordMapping
  });

  const nBest = segmentedResults.NBest[0];
  const mappedWords = nBest.Words.map((word: any, index: number) => {
    const mapping = wordMapping[index];
    return {
      ...word,
      Word: mapping?.original || word.Word,
      OriginalOffset: mapping?.startIndex || word.Offset,
      OriginalDuration: (mapping?.endIndex || 0) - (mapping?.startIndex || 0)
    };
  });

  console.log('Mapped words:', mappedWords);

  return {
    ...segmentedResults,
    NBest: [{
      ...nBest,
      Words: mappedWords
    }]
  };
}