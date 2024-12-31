// Using wordcut-engine which is Deno compatible
import { WordcutEngine } from "https://esm.sh/wordcut-engine@1.1.1";

export interface SegmentationResult {
  segmentedText: string;
  wordMapping: {
    original: string;
    segmented: string;
    startIndex: number;
    endIndex: number;
  }[];
}

// Initialize the wordcut engine with default Thai dictionary
const engine = new WordcutEngine();

export function segmentThaiText(text: string): SegmentationResult {
  console.log('Segmenting Thai text:', text);
  
  // Remove existing spaces to ensure consistent segmentation
  const cleanText = text.replace(/\s+/g, '');
  
  // Get segmented words using the engine
  const words = engine.segment(cleanText);
  console.log('Segmented words:', words);
  
  // Create word mapping for tracking positions
  let currentIndex = 0;
  const wordMapping = words.map(word => {
    const mapping = {
      original: word,
      segmented: word,
      startIndex: currentIndex,
      endIndex: currentIndex + word.length
    };
    currentIndex += word.length;
    return mapping;
  });

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