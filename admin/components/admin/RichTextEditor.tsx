'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Bold, Italic, Underline, List, ListOrdered, 
  AlignLeft, AlignCenter, AlignRight,
  Link as LinkIcon, Type, Palette, Code, Eye, 
  Undo2, Redo2, RemoveFormatting, Heading1, Heading2, Heading3
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

const COLORS = [
  '#1A1A1A', '#B76E79', '#4A5568', '#2D3748', '#1C1C1C',
  '#E53E3E', '#DD6B20', '#D69E2E', '#38A169', '#3182CE',
  '#805AD5', '#D53F8C', '#718096', '#A0AEC0', '#E2E8F0',
];

export default function RichTextEditor({ value, onChange, placeholder, minHeight = '300px' }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<'visual' | 'html'>('visual');
  const [showColors, setShowColors] = useState(false);
  const [showHeadings, setShowHeadings] = useState(false);
  const [htmlSource, setHtmlSource] = useState(value);

  // Sync editor content when value prop changes externally
  useEffect(() => {
    if (mode === 'visual' && editorRef.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value;
      }
    }
    if (mode === 'html') {
      setHtmlSource(value);
    }
  }, [value, mode]);

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    // Sync changes
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    // Allow rich paste (preserves formatting from Word, Google Docs, etc.)
    // The browser handles this natively with contentEditable
    setTimeout(() => {
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
      }
    }, 0);
  }, [onChange]);

  const handleInsertLink = useCallback(() => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  }, [execCommand]);

  const handleHeading = useCallback((tag: string) => {
    execCommand('formatBlock', tag);
    setShowHeadings(false);
  }, [execCommand]);

  const switchToVisual = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = htmlSource;
      onChange(htmlSource);
    }
    setMode('visual');
  }, [htmlSource, onChange]);

  const switchToHtml = useCallback(() => {
    if (editorRef.current) {
      setHtmlSource(editorRef.current.innerHTML);
    }
    setMode('html');
  }, []);

  const handleHtmlChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHtmlSource(e.target.value);
    onChange(e.target.value);
  }, [onChange]);

  const ToolbarButton = ({ onClick, active, children, title }: { onClick: () => void; active?: boolean; children: React.ReactNode; title: string }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        active 
          ? 'bg-[#B76E79]/15 text-[#B76E79]' 
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
      }`}
    >
      {children}
    </button>
  );

  const Divider = () => <div className="w-px h-6 bg-gray-200 mx-1" />;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
      {/* Mode Tabs */}
      <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/80">
        <div className="flex">
          <button
            type="button"
            onClick={() => mode === 'html' ? switchToVisual() : null}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5 ${
              mode === 'visual' 
                ? 'text-[#B76E79] border-b-2 border-[#B76E79] bg-white' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Eye className="h-3.5 w-3.5" /> Visual
          </button>
          <button
            type="button"
            onClick={() => mode === 'visual' ? switchToHtml() : null}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5 ${
              mode === 'html' 
                ? 'text-[#B76E79] border-b-2 border-[#B76E79] bg-white' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Code className="h-3.5 w-3.5" /> HTML
          </button>
        </div>
        <span className="text-[10px] text-gray-400 pr-3 uppercase tracking-widest font-medium">Rich Editor</span>
      </div>

      {/* Toolbar (Visual mode only) */}
      {mode === 'visual' && (
        <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-100 bg-gray-50/50">
          {/* Undo / Redo */}
          <ToolbarButton onClick={() => execCommand('undo')} title="Undo (Ctrl+Z)">
            <Undo2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => execCommand('redo')} title="Redo (Ctrl+Y)">
            <Redo2 className="h-4 w-4" />
          </ToolbarButton>

          <Divider />

          {/* Headings Dropdown */}
          <div className="relative">
            <ToolbarButton onClick={() => { setShowHeadings(!showHeadings); setShowColors(false); }} title="Headings">
              <Type className="h-4 w-4" />
            </ToolbarButton>
            {showHeadings && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1 w-40">
                <button type="button" onClick={() => handleHeading('p')} className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50">Normal Text</button>
                <button type="button" onClick={() => handleHeading('h1')} className="w-full text-left px-3 py-1.5 text-xl font-bold hover:bg-gray-50">Heading 1</button>
                <button type="button" onClick={() => handleHeading('h2')} className="w-full text-left px-3 py-1.5 text-lg font-bold hover:bg-gray-50">Heading 2</button>
                <button type="button" onClick={() => handleHeading('h3')} className="w-full text-left px-3 py-1.5 text-base font-semibold hover:bg-gray-50">Heading 3</button>
                <button type="button" onClick={() => handleHeading('h4')} className="w-full text-left px-3 py-1.5 text-sm font-semibold hover:bg-gray-50">Heading 4</button>
              </div>
            )}
          </div>

          <Divider />

          {/* Text Formatting */}
          <ToolbarButton onClick={() => execCommand('bold')} title="Bold (Ctrl+B)">
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => execCommand('italic')} title="Italic (Ctrl+I)">
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => execCommand('underline')} title="Underline (Ctrl+U)">
            <Underline className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => execCommand('strikeThrough')} title="Strikethrough">
            <span className="text-sm font-medium line-through">S</span>
          </ToolbarButton>

          <Divider />

          {/* Text Color */}
          <div className="relative">
            <ToolbarButton onClick={() => { setShowColors(!showColors); setShowHeadings(false); }} title="Text Color">
              <Palette className="h-4 w-4" />
            </ToolbarButton>
            {showColors && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 p-2 grid grid-cols-5 gap-1 w-[140px]">
                {COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => { execCommand('foreColor', color); setShowColors(false); }}
                    className="w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            )}
          </div>

          <Divider />

          {/* Lists */}
          <ToolbarButton onClick={() => execCommand('insertUnorderedList')} title="Bullet List">
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => execCommand('insertOrderedList')} title="Numbered List">
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>

          <Divider />

          {/* Alignment */}
          <ToolbarButton onClick={() => execCommand('justifyLeft')} title="Align Left">
            <AlignLeft className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => execCommand('justifyCenter')} title="Align Center">
            <AlignCenter className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => execCommand('justifyRight')} title="Align Right">
            <AlignRight className="h-4 w-4" />
          </ToolbarButton>

          <Divider />

          {/* Link */}
          <ToolbarButton onClick={handleInsertLink} title="Insert Link">
            <LinkIcon className="h-4 w-4" />
          </ToolbarButton>

          {/* Clear Formatting */}
          <ToolbarButton onClick={() => execCommand('removeFormat')} title="Clear Formatting">
            <RemoveFormatting className="h-4 w-4" />
          </ToolbarButton>
        </div>
      )}

      {/* Editor Area */}
      {mode === 'visual' ? (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onPaste={handlePaste}
          onClick={() => { setShowColors(false); setShowHeadings(false); }}
          className="prose prose-sm max-w-none p-4 outline-none focus:ring-0 overflow-auto"
          style={{ 
            minHeight,
            fontFamily: "'Inter', sans-serif",
          }}
          data-placeholder={placeholder || 'Start typing or paste content here...'}
          dangerouslySetInnerHTML={{ __html: value }}
        />
      ) : (
        <textarea
          value={htmlSource}
          onChange={handleHtmlChange}
          className="w-full p-4 font-mono text-sm text-gray-700 bg-gray-50 outline-none resize-none border-0 focus:ring-0"
          style={{ minHeight }}
          placeholder="<h2>Your HTML content here...</h2>"
          spellCheck={false}
        />
      )}

      {/* Styles for the editor */}
      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #a0aec0;
          pointer-events: none;
          display: block;
        }
        [contenteditable] h1 { font-size: 1.875rem; font-weight: 700; margin-bottom: 0.75rem; color: #1A1A1A; }
        [contenteditable] h2 { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem; color: #1A1A1A; }
        [contenteditable] h3 { font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem; color: #2D3748; }
        [contenteditable] h4 { font-size: 1.1rem; font-weight: 600; margin-bottom: 0.375rem; color: #2D3748; }
        [contenteditable] p { margin-bottom: 0.5rem; line-height: 1.7; }
        [contenteditable] ul, [contenteditable] ol { padding-left: 1.5rem; margin-bottom: 0.75rem; }
        [contenteditable] li { margin-bottom: 0.25rem; }
        [contenteditable] a { color: #B76E79; text-decoration: underline; }
        [contenteditable] strong { font-weight: 700; }
        [contenteditable] blockquote {
          border-left: 3px solid #B76E79;
          padding-left: 1rem;
          margin-left: 0;
          color: #4A5568;
          font-style: italic;
        }
      `}</style>
    </div>
  );
}
