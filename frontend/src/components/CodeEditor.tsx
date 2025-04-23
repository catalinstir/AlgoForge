import React, { useEffect, useRef } from "react";
import Prism from "prismjs";
// Import necessary languages for Prism
import "prismjs/components/prism-clike";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-java";
import "prismjs/components/prism-python";
// Import a Prism theme CSS (e.g., Okaidia) - requires separate CSS import
// import 'prismjs/themes/prism-okaidia.css'; // Or your preferred theme
// import "../styles/CodeEditor.css"; // Your custom styles

interface CodeEditorProps {
  code: string;
  language: string;
  onChange: (newCode: string) => void;
}

const CodeEditor = ({ code, language, onChange }: CodeEditorProps) => {
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLPreElement>(null);

  // Map language prop to Prism language class
  const languageMap: Record<string, string> = {
    cpp: "cpp",
    java: "java",
    python: "python",
    c: "c",
    // Add more language mappings as needed
  };
  const prismLanguage = languageMap[language] || "clike"; // Default to clike

  // Highlight code when code or language changes
  useEffect(() => {
    if (previewRef.current) {
      // Ensure Prism has the language component loaded
      if (Prism.languages[prismLanguage]) {
        Prism.highlightElement(previewRef.current);
      } else {
        console.warn(
          `Prism language '${prismLanguage}' not loaded. Highlighting might not work.`
        );
        // Attempt to load dynamically (might require configuration)
        // import(`prismjs/components/prism-${prismLanguage}`).then(() => {
        //    if (previewRef.current) Prism.highlightElement(previewRef.current);
        // }).catch(err => console.error(`Failed to load Prism language: ${prismLanguage}`, err));
      }
    }
  }, [code, prismLanguage]); // Depend on prismLanguage

  // Handle text area changes
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  // Synchronize scrolling between textarea and preview
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (previewRef.current && editorRef.current) {
      previewRef.current.scrollTop = editorRef.current.scrollTop;
      previewRef.current.scrollLeft = editorRef.current.scrollLeft;
    }
  };

  // Handle Tab key for indentation and bracket pairing
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const { key } = e;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;

    // --- Tab Key Handling (Indent/Outdent) ---
    if (key === "Tab") {
      e.preventDefault(); // Prevent default tab behavior (changing focus)
      const tab = "  "; // Use 2 spaces for indentation

      // If text is selected
      if (start !== end) {
        const selectedLines = value.substring(start, end).split("\n");
        let newStart = start; // Track selection start adjustment

        // Shift+Tab: Outdent selected lines
        if (e.shiftKey) {
          let changed = false;
          const outdentedLines = selectedLines.map((line) => {
            if (line.startsWith(tab)) {
              changed = true;
              return line.substring(tab.length);
            } else if (line.startsWith(" ")) {
              // Handle single space removal if tab isn't present
              changed = true;
              return line.substring(1);
            }
            return line;
          });

          if (changed) {
            const newValue =
              value.substring(0, start) +
              outdentedLines.join("\n") +
              value.substring(end);
            textarea.value = newValue;
            onChange(newValue);
            // Adjust selection (tricky, might need refinement)
            textarea.selectionStart = newStart;
            textarea.selectionEnd = start + outdentedLines.join("\n").length;
          }
        }
        // Tab: Indent selected lines
        else {
          const indentedLines = selectedLines.map((line) => tab + line);
          const newValue =
            value.substring(0, start) +
            indentedLines.join("\n") +
            value.substring(end);
          textarea.value = newValue;
          onChange(newValue);
          textarea.selectionStart = start; // Keep start the same
          textarea.selectionEnd = start + indentedLines.join("\n").length; // Adjust end based on added tabs
        }
      }
      // No text selected: Insert tab at cursor position
      else {
        const newValue = value.substring(0, start) + tab + value.substring(end);
        textarea.value = newValue;
        onChange(newValue);
        textarea.selectionStart = textarea.selectionEnd = start + tab.length; // Move cursor after tab
      }
    }

    // --- Auto Closing Brackets/Quotes ---
    const pairs: { [key: string]: string } = {
      "{": "}",
      "(": ")",
      "[": "]",
      '"': '"',
      "'": "'",
      "`": "`", // Add backticks if needed
    };

    if (pairs[key]) {
      e.preventDefault(); // Prevent default character insertion initially

      // If text is selected, wrap it
      if (start !== end) {
        const selectedText = value.substring(start, end);
        const newText = key + selectedText + pairs[key];
        const newValue =
          value.substring(0, start) + newText + value.substring(end);
        textarea.value = newValue;
        onChange(newValue);
        // Keep selection around the original text
        textarea.selectionStart = start + 1;
        textarea.selectionEnd = end + 1;
      }
      // No text selected, insert pair and place cursor in between
      else {
        const newValue =
          value.substring(0, start) + key + pairs[key] + value.substring(end);
        textarea.value = newValue;
        onChange(newValue);
        // Move cursor between the pair
        textarea.selectionStart = textarea.selectionEnd = start + 1;
      }
    }

    // --- Auto Closing for Closing Brackets ---
    // If user types a closing bracket/quote and the next char matches, just move cursor
    const nextChar = value.substring(end, end + 1);
    if (
      (key === "}" && nextChar === "}") ||
      (key === ")" && nextChar === ")") ||
      (key === "]" && nextChar === "]") ||
      (key === '"' && nextChar === '"') ||
      (key === "'" && nextChar === "'") ||
      (key === "`" && nextChar === "`")
    ) {
      if (start === end) {
        // Only if no selection
        e.preventDefault();
        textarea.selectionStart = textarea.selectionEnd = start + 1; // Move cursor forward
      }
    }

    // --- Enter Key: Auto-indent ---
    if (key === "Enter") {
      e.preventDefault();
      const currentLineStart = value.lastIndexOf("\n", start - 1) + 1;
      const currentLine = value.substring(currentLineStart, start);
      const indentationMatch = currentLine.match(/^\s*/);
      const indentation = indentationMatch ? indentationMatch[0] : "";

      // Basic check if the previous line ended with an opening brace/paren/bracket
      let extraIndent = "";
      const prevChar = value.substring(start - 1, start);
      if (["{", "(", "["].includes(prevChar)) {
        extraIndent = "  "; // Add extra indent level
      }

      const newValue =
        value.substring(0, start) +
        "\n" +
        indentation +
        extraIndent +
        value.substring(end);
      textarea.value = newValue;
      onChange(newValue);
      textarea.selectionStart = textarea.selectionEnd =
        start + 1 + indentation.length + extraIndent.length;
    }

    // --- Backspace: Handle paired brackets/quotes ---
    if (key === "Backspace" && start === end) {
      // Only if no selection
      const charBefore = value.substring(start - 1, start);
      const charAfter = value.substring(end, end + 1);

      if (
        (charBefore === "{" && charAfter === "}") ||
        (charBefore === "(" && charAfter === ")") ||
        (charBefore === "[" && charAfter === "]") ||
        (charBefore === '"' && charAfter === '"') ||
        (charBefore === "'" && charAfter === "'") ||
        (charBefore === "`" && charAfter === "`")
      ) {
        e.preventDefault();
        const newValue =
          value.substring(0, start - 1) + value.substring(end + 1);
        textarea.value = newValue;
        onChange(newValue);
        textarea.selectionStart = textarea.selectionEnd = start - 1; // Move cursor back
      }
    }
  };

  return (
    // Ensure the container allows the editor and preview to overlap correctly
    <div className="code-editor">
      <textarea
        ref={editorRef}
        value={code}
        onChange={handleChange}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        className="editor-textarea"
        spellCheck="false"
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        aria-label="Code Editor"
      />
      {/* Use aria-hidden as the preview is decorative for sighted users */}
      <pre ref={previewRef} className="editor-preview" aria-hidden="true">
        {/* Add a newline at the end of the code for Prism to handle last line correctly */}
        <code className={`language-${prismLanguage}`}>{code + "\n"}</code>
      </pre>
    </div>
  );
};

export default CodeEditor;
