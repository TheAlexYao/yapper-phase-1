import wordcut from 'wordcut';

// Initialize wordcut with default dictionary
wordcut.init();

export interface SegmentationResult {
  segmentedText: string;
  wordMapping: {
    original: string;
    segmented: string;
    startIndex: number;
    endIndex: number;
  }[];
}

export function segmentThaiText(text: string): SegmentationResult {
  // Remove existing spaces to ensure consistent segmentation
  const cleanText = text.replace(/\s+/g, '');
  
  // Segment the text and join with spaces
  const segmented = wordcut.cut(cleanText);
  const words = segmented.split('|').filter(word => word.trim());
  
  // Create word mapping for tracking
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

  return {
    ...segmentedResults,
    NBest: [{
      ...nBest,
      Words: mappedWords
    }]
  };
}