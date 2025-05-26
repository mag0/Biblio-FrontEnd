export interface OcrPage {
  number: number;
  text: string;
  confidence: number;
  characters: number;
  words: number;
}

export interface OcrResponse {
  status: string;
  message: string;
  metadata: {
    fileName: string;
    fileSize: string;
    totalPages: number;
    processingTime: string;
    statistics: {
      totalCharacters: number;
      totalWords: number;
      averageCharactersPerPage: number;
      averageWordsPerPage: number;
      averageConfidence?: number;
    }
  };
  pages: OcrPage[];
}