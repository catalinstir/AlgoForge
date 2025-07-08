import React, { useEffect, useRef } from "react";
import { languageMap, highlightCode } from "../utils/prism-config";
import "../styles/CodeEditor.css";

interface CodeEditorProps {
  code: string;
  language: string;
  onChange: (newCode: string) => void;
}

const CodeEditor = ({ code, language, onChange }: CodeEditorProps) => {
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLPreElement>(null);

  const prismLanguage = languageMap[language] || "clike";

  useEffect(() => {
    if (previewRef.current) {
      const codeElement = previewRef.current.querySelector("code");
      if (codeElement) {
        codeElement.innerHTML = highlightCode(code, language) + "\n";
      }
    }
  }, [code, language]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (previewRef.current && editorRef.current) {
      previewRef.current.scrollTop = editorRef.current.scrollTop;
      previewRef.current.scrollLeft = editorRef.current.scrollLeft;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const { key } = e;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;

    if (key === "Tab") {
      e.preventDefault();
      const tab = "  ";

      if (start !== end) {
        const selectedLines = value.substring(start, end).split("\n");
        let newStart = start;

        if (e.shiftKey) {
          let changed = false;
          const outdentedLines = selectedLines.map((line) => {
            if (line.startsWith(tab)) {
              changed = true;
              return line.substring(tab.length);
            } else if (line.startsWith(" ")) {
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
            textarea.selectionStart = newStart;
            textarea.selectionEnd = start + outdentedLines.join("\n").length;
          }
        } else {
          const indentedLines = selectedLines.map((line) => tab + line);
          const newValue =
            value.substring(0, start) +
            indentedLines.join("\n") +
            value.substring(end);
          textarea.value = newValue;
          onChange(newValue);
          textarea.selectionStart = start;
          textarea.selectionEnd = start + indentedLines.join("\n").length;
        }
      } else {
        const newValue = value.substring(0, start) + tab + value.substring(end);
        textarea.value = newValue;
        onChange(newValue);
        textarea.selectionStart = textarea.selectionEnd = start + tab.length;
      }
    }

    const pairs: { [key: string]: string } = {
      "{": "}",
      "(": ")",
      "[": "]",
      '"': '"',
      "'": "'",
      "`": "`",
    };

    if (pairs[key]) {
      e.preventDefault();

      if (start !== end) {
        const selectedText = value.substring(start, end);
        const newText = key + selectedText + pairs[key];
        const newValue =
          value.substring(0, start) + newText + value.substring(end);
        textarea.value = newValue;
        onChange(newValue);
        textarea.selectionStart = start + 1;
        textarea.selectionEnd = end + 1;
      } else {
        const newValue =
          value.substring(0, start) + key + pairs[key] + value.substring(end);
        textarea.value = newValue;
        onChange(newValue);
        textarea.selectionStart = textarea.selectionEnd = start + 1;
      }
    }

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
        e.preventDefault();
        textarea.selectionStart = textarea.selectionEnd = start + 1;
      }
    }

    if (key === "Enter") {
      e.preventDefault();
      const currentLineStart = value.lastIndexOf("\n", start - 1) + 1;
      const currentLine = value.substring(currentLineStart, start);
      const indentationMatch = currentLine.match(/^\s*/);
      const indentation = indentationMatch ? indentationMatch[0] : "";

      let extraIndent = "";
      const prevChar = value.substring(start - 1, start);
      if (["{", "(", "["].includes(prevChar)) {
        extraIndent = "  ";
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

    if (key === "Backspace" && start === end) {
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
        textarea.selectionStart = textarea.selectionEnd = start - 1;
      }
    }
  };

  return (
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
      <pre ref={previewRef} className="editor-preview" aria-hidden="true">
        <code className={`language-${prismLanguage}`}>{code}</code>
      </pre>
    </div>
  );
};

export default CodeEditor;
