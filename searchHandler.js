const fs = require('fs');
const path = require('path');

// Try to load natural NLP library, with fallback if not available
let natural;
try {
  natural = require('natural');
} catch (error) {
  console.warn('Natural NLP library not available, using fallback search');
  natural = null;
}

class SearchHandler {
  constructor(resourcesPath) {
    this.resourcesPath = resourcesPath;
    this.suggestions = [];
    this.initialized = false;
    this.init();
  }

  async init() {
    try {
      await this.loadSuggestions();
      this.initialized = true;
      console.log('✅ SearchHandler initialized with', this.suggestions.length, 'suggestions');
    } catch (error) {
      console.error('❌ Error initializing SearchHandler:', error);
      this.createDefaultSuggestions();
      this.initialized = true;
    }
  }

  async loadSuggestions() {
    try {
      if (!fs.existsSync(this.resourcesPath)) {
        console.log('📁 Resources directory not found, creating default');
        this.createDefaultResources();
        return;
      }

      const files = fs.readdirSync(this.resourcesPath)
        .filter(file => file.endsWith('.json'));

      this.suggestions = [];

      for (const file of files) {
        const filePath = path.join(this.resourcesPath, file);
        try {
          const data = fs.readFileSync(filePath, 'utf8');
          const jsonData = JSON.parse(data);
          
          if (Array.isArray(jsonData)) {
            this.suggestions = this.suggestions.concat(jsonData);
          } else if (typeof jsonData === 'object') {
            this.suggestions.push(jsonData);
          }
        } catch (error) {
          console.error(`❌ Error reading file ${file}:`, error);
        }
      }

      console.log(`📚 Loaded ${this.suggestions.length} suggestions from ${files.length} files`);
    } catch (error) {
      console.error('❌ Error loading suggestions:', error);
      throw error;
    }
  }

  createDefaultResources() {
    if (!fs.existsSync(this.resourcesPath)) {
      fs.mkdirSync(this.resourcesPath, { recursive: true });
    }

    const jbotCommands = [
      {
        "title": "For Loop",
        "description": "A standard for loop to iterate over a range of values",
        "code": "for (let i = 0; i < array.length; i++) {\n  // Your code here\n}",
        "icon": "🔁"
      },
      {
        "title": "Function Definition",
        "description": "Define a new function with parameters",
        "code": "function functionName(param1, param2) {\n  // Function body\n  return result;\n}",
        "icon": "ƒ"
      }
    ];

    const codeSnippets = [
      {
        "title": "Try-Catch Block",
        "description": "Handle errors gracefully with try-catch",
        "code": "try {\n  // Code that might throw an error\n} catch (error) {\n  // Handle the error\n}",
        "icon": "⚠️"
      }
    ];

    fs.writeFileSync(
      path.join(this.resourcesPath, 'jbot_commands.json'),
      JSON.stringify(jbotCommands, null, 2)
    );

    fs.writeFileSync(
      path.join(this.resourcesPath, 'code_snippets.json'),
      JSON.stringify(codeSnippets, null, 2)
    );

    this.suggestions = jbotCommands.concat(codeSnippets);
  }

  createDefaultSuggestions() {
    this.suggestions = [
      {
        title: "For Loop",
        description: "A standard for loop to iterate over a range of values",
        code: "for (let i = 0; i < array.length; i++) {\n  // Your code here\n}",
        icon: "🔁"
      },
      {
        title: "Function Definition",
        description: "Define a new function with parameters",
        code: "function functionName(param1, param2) {\n  // Function body\n  return result;\n}",
        icon: "ƒ"
      }
    ];
  }

  // Simple Levenshtein distance implementation as fallback
  levenshteinDistance(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];

    // Increment along the first column of each row
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    // Increment each column in the first row
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    // Fill in the rest of the matrix
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }

  // Simple soundex implementation as fallback
  soundex(word) {
    if (!word) return '';
    
    let s = [];
    const mapping = {
      'b': '1', 'f': '1', 'p': '1', 'v': '1',
      'c': '2', 'g': '2', 'j': '2', 'k': '2', 'q': '2', 's': '2', 'x': '2', 'z': '2',
      'd': '3', 't': '3',
      'l': '4',
      'm': '5', 'n': '5',
      'r': '6'
    };

    // Convert to lowercase and keep only letters
    word = word.toLowerCase().replace(/[^a-z]/g, '');

    if (word.length === 0) return '';

    // Keep the first letter
    s.push(word[0].toUpperCase());

    // Process the rest of the word
    for (let i = 1; i < word.length; i++) {
      const c = word[i];
      if (mapping[c] && mapping[c] !== mapping[word[i - 1]]) {
        s.push(mapping[c]);
      }
    }

    // Remove duplicates and ensure length of 4
    let result = s.join('');
    result = result.replace(/(.)\1+/g, '$1'); // Remove consecutive duplicates
    result = (result + '0000').substring(0, 4); // Pad with zeros

    return result;
  }

  async search(query) {
    if (!this.initialized) {
      await new Promise(resolve => setTimeout(resolve, 100));
      if (!this.initialized) {
        return [];
      }
    }

    if (!query || query.trim() === '') {
      return this.suggestions;
    }
    
    const queryLower = query.toLowerCase();
    const scoredResults = [];
    
    // Score each suggestion based on multiple criteria
    for (const suggestion of this.suggestions) {
      let score = 0;
      
      // Exact matches
      if (suggestion.title.toLowerCase() === queryLower) score += 100;
      if (suggestion.description.toLowerCase() === queryLower) score += 80;
      if (suggestion.code.toLowerCase().includes(queryLower)) score += 60;
      
      // Partial matches
      if (suggestion.title.toLowerCase().includes(queryLower)) score += 40;
      if (suggestion.description.toLowerCase().includes(queryLower)) score += 20;
      
      // Use NLP if available, otherwise use fallback
      if (natural) {
        // Tokenize and compare using natural's algorithms
        const tokenizer = new natural.WordTokenizer();
        const titleTokens = tokenizer.tokenize(suggestion.title.toLowerCase());
        const descTokens = tokenizer.tokenize(suggestion.description.toLowerCase());
        const queryTokens = tokenizer.tokenize(queryLower);
        
        // Check for token matches
        for (const qt of queryTokens) {
          if (titleTokens.includes(qt)) score += 15;
          if (descTokens.includes(qt)) score += 10;
        }
        
        // Soundex comparison
        try {
          const soundex = natural.SoundEx;
          const querySoundex = soundex.process(queryLower);
          
          for (const token of titleTokens) {
            if (soundex.process(token) === querySoundex) score += 5;
          }
          
          for (const token of descTokens) {
            if (soundex.process(token) === querySoundex) score += 3;
          }
        } catch (e) {
          console.warn('Soundex comparison failed', e);
        }
      } else {
        // Fallback: simple string similarity
        const titleSimilarity = 1 - (this.levenshteinDistance(queryLower, suggestion.title.toLowerCase()) / 
                                  Math.max(queryLower.length, suggestion.title.length));
        const descSimilarity = 1 - (this.levenshteinDistance(queryLower, suggestion.description.toLowerCase()) / 
                                 Math.max(queryLower.length, suggestion.description.length));
        
        score += titleSimilarity * 10;
        score += descSimilarity * 5;
        
        // Fallback soundex
        const querySoundex = this.soundex(queryLower);
        const titleSoundex = this.soundex(suggestion.title);
        
        if (querySoundex === titleSoundex) score += 5;
      }
      
      if (score > 0) {
        scoredResults.push({ suggestion, score });
      }
    }
    
    // Sort by score (descending) and return only suggestions
    return scoredResults
      .sort((a, b) => b.score - a.score)
      .map(item => item.suggestion);
  }
}

module.exports = SearchHandler;