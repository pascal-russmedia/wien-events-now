
import { useEffect, useState, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value?: string;
  onChange?: (data: string) => void;
  placeholder?: string;
  maxLength?: number;
}

const RichTextEditor = ({ value, onChange, placeholder = "Enter details of the event.", maxLength = 2000 }: RichTextEditorProps) => {
  const [editorValue, setEditorValue] = useState(value || '');
  const quillRef = useRef<ReactQuill>(null);

  useEffect(() => {
    setEditorValue(value || '');
  }, [value]);

  const getTextLength = (html: string) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent?.length || 0;
  };

  const currentLength = getTextLength(editorValue);
  const isOverLimit = currentLength > maxLength;

  const handleChange = (content: string) => {
    setEditorValue(content);
    if (onChange) {
      onChange(content);
    }
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link']
    ],
  };

  const formats = [
    'header', 'bold', 'italic', 'underline',
    'list', 'bullet', 'link'
  ];

  useEffect(() => {
    // Set font-size to 14px for consistency and style placeholder
    const style = document.createElement('style');
    style.textContent = `
      .error-border .ql-toolbar {
        border-color: hsl(var(--destructive)) !important;
        border-top-left-radius: calc(var(--radius) - 2px) !important;
        border-top-right-radius: calc(var(--radius) - 2px) !important;
        border-bottom: none !important;
        background-color: hsl(var(--background)) !important;
      }
      .error-border .ql-container {
        border-color: hsl(var(--destructive)) !important;
        border-bottom-left-radius: calc(var(--radius) - 2px) !important;
        border-bottom-right-radius: calc(var(--radius) - 2px) !important;
        border-top: none !important;
        background-color: hsl(var(--background)) !important;
        overflow: hidden !important;
      }
      .ql-toolbar {
        border-color: hsl(var(--border)) !important;
        border-top-left-radius: calc(var(--radius) - 2px) !important;
        border-top-right-radius: calc(var(--radius) - 2px) !important;
        border-bottom: none !important;
        background-color: hsl(var(--background)) !important;
      }
      .ql-container {
        border-color: hsl(var(--border)) !important;
        border-bottom-left-radius: calc(var(--radius) - 2px) !important;
        border-bottom-right-radius: calc(var(--radius) - 2px) !important;
        border-top: none !important;
        background-color: hsl(var(--background)) !important;
        overflow: hidden !important;
      }
      .ql-editor {
        font-size: 14px !important;
        font-family: 'Inter', sans-serif !important;
        color: hsl(var(--foreground)) !important;
        background-color: hsl(var(--background)) !important;
        border-bottom-left-radius: calc(var(--radius) - 2px) !important;
        border-bottom-right-radius: calc(var(--radius) - 2px) !important;
      }
      .ql-editor input {
        font-size: 14px !important;
        font-family: 'Inter', sans-serif !important;
      }
      .ql-editor.ql-blank::before {
        font-style: normal !important;
        color: hsl(var(--muted-foreground)) !important;
        font-family: 'Inter', sans-serif !important;
        font-size: 14px !important;
      }
      .ql-toolbar .ql-stroke {
        fill: none !important;
        stroke: hsl(var(--foreground)) !important;
      }
      .ql-toolbar .ql-fill {
        fill: hsl(var(--foreground)) !important;
        stroke: none !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);


  return (
    <div className={`min-h-[80px] ${isOverLimit ? 'error-border' : ''}`}>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={editorValue}
        onChange={handleChange}
        placeholder={placeholder}
        modules={modules}
        formats={formats}
        style={{ minHeight: '80px' }}
      />
    </div>
  );
};

export default RichTextEditor;
