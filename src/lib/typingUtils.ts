export interface GenerateOptions {
  wordCount: number;
  punctuation: boolean;
  numbers: boolean;
}

export const generateText = (options: GenerateOptions | number): string => {
  const count = typeof options === 'number' ? options : options.wordCount;
  const usePunctuation = typeof options === 'number' ? false : options.punctuation;
  const useNumbers = typeof options === 'number' ? false : options.numbers;

  const wordsList = [
    "the", "be", "to", "of", "and", "a", "in", "that", "have", "I",
    "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
    "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
    "or", "an", "will", "my", "one", "all", "would", "there", "their", "what",
    "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
    "when", "make", "can", "like", "time", "no", "just", "him", "know", "take",
    "people", "into", "year", "your", "good", "some", "could", "them", "see", "other",
    "than", "then", "now", "look", "only", "come", "its", "over", "think", "also",
    "back", "after", "use", "two", "how", "our", "work", "first", "well", "way",
    "even", "new", "want", "because", "any", "these", "give", "day", "most", "us"
  ];
  
  const punctuations = [".", ",", "?", "!", ";", ":"];
  
  let res = [];
  for (let i = 0; i < count; i++) {
    let word = wordsList[Math.floor(Math.random() * wordsList.length)];
    
    if (useNumbers && Math.random() < 0.1) {
      word = Math.floor(Math.random() * 100).toString();
    }
    
    if (usePunctuation && Math.random() < 0.2 && i !== 0) {
      const p = punctuations[Math.floor(Math.random() * punctuations.length)];
      if (Math.random() < 0.5) {
        word = word + p;
      } else {
        word = '"' + word + '"';
      }
    }
    
    res.push(word);
  }
  return res.join(" ");
};
