import Prism from 'prismjs';

// Core languages
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-python';

import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-ruby';
import 'prismjs/components/prism-swift';
import 'prismjs/components/prism-kotlin';
import 'prismjs/components/prism-sql';

export const languageMap: Record<string, string> = {
  'javascript': 'javascript',
  'js': 'javascript',
  'typescript': 'typescript',
  'ts': 'typescript',
  'python': 'python',
  'py': 'python',
  'java': 'java',
  'cpp': 'cpp',
  'c++': 'cpp',
  'c': 'c',
  'go': 'go',
  'rust': 'rust',
  'ruby': 'ruby',
  'swift': 'swift',
  'kotlin': 'kotlin',
  'sql': 'sql',
  'csharp': 'csharp',
  'cs': 'csharp',
};

export const highlightCode = (code: string, language: string): string => {
  const prismLanguage = languageMap[language] || 'clike';
  
  if (Prism.languages[prismLanguage]) {
    return Prism.highlight(code, Prism.languages[prismLanguage], prismLanguage);
  } else {
    console.warn(`Prism language '${prismLanguage}' not loaded. Highlighting might not work.`);
    return code;
  }
};

export const initPrism = (): void => {
  Prism.manual = true;
};

export default Prism;