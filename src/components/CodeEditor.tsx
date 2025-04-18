import { useEffect, useRef } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-java";
import "prismjs/components/prism-python";
import "../styles/CodeEditor.css";

interface CodeEditorProps {
  code: string;
  language: string;
  onChange: (newCode: string) => void;
}

const CodeEditor = ({ code, language, onChange }: CodeEditorProps) => {
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLPreElement>(null);

  const languageMap: Record<string, string> = {
    cpp: "cpp",
    java: "java",
    python: "python",
  };

  useEffect(() => {
    if (previewRef.current) {
      Prism.highlightElement(previewRef.current);
    }
  }, [code, language]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    onChange(value);
  };

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (previewRef.current && editorRef.current) {
      previewRef.current.scrollTop = editorRef.current.scrollTop;
      previewRef.current.scrollLeft = editorRef.current.scrollLeft;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const { key, shiftKey, ctrlKey, metaKey } = e;
    const textarea = editorRef.current;

    if (key === "Tab" && !shiftKey && !ctrlKey && !metaKey && textarea) {
      e.preventDefault();

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;

      if (start === end) {
        const newValue =
          value.substring(0, start) + "    " + value.substring(end);
        textarea.value = newValue;
        onChange(newValue);

        textarea.selectionStart = textarea.selectionEnd = start + 4;
      } else {
        const selectedText = value.substring(start, end);
        const lines = selectedText.split("\n");

        if (lines.length > 1) {
          const indentedText = lines.map((line) => "    " + line).join("\n");
          const newValue =
            value.substring(0, start) + indentedText + value.substring(end);

          textarea.value = newValue;
          onChange(newValue);

          textarea.selectionStart = start;
          textarea.selectionEnd = start + indentedText.length;
        } else {
          const newValue =
            value.substring(0, start) +
            "    " +
            value.substring(start, end) +
            value.substring(end);

          textarea.value = newValue;
          onChange(newValue);

          textarea.selectionStart = start + 4;
          textarea.selectionEnd = end + 4;
        }
      }
    }

    const pairs: { [key: string]: string } = {
      "{": "}",
      "(": ")",
      "[": "]",
      '"': '"',
      "'": "'",
    };

    if (pairs[key] && textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      if (start !== end) {
        e.preventDefault();
        const selectedText = textarea.value.substring(start, end);
        const newText = key + selectedText + pairs[key];
        const newValue =
          textarea.value.substring(0, start) +
          newText +
          textarea.value.substring(end);

        textarea.value = newValue;
        onChange(newValue);

        textarea.selectionStart = start + 1;
        textarea.selectionEnd = end + 1;
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
      />
      <pre ref={previewRef} className="editor-preview" aria-hidden="true">
        <code className={`language-${languageMap[language] || "clike"}`}>
          {code}
        </code>
      </pre>
    </div>
  );
};

export default CodeEditor;
