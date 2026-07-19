import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import React, { useState, useEffect } from 'react';

const ToggleComponent = ({ node, updateAttributes }: any) => {
  const [open, setOpen] = useState(true);
  const [title, setTitle] = useState(node.attrs.title || "");

  useEffect(() => {
    setTitle(node.attrs.title || "");
  }, [node.attrs.title]);

  const handleBlur = () => {
    if (title !== node.attrs.title) updateAttributes({ title });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      (e.currentTarget as HTMLInputElement).blur();
    }
  };

  return (
    <NodeViewWrapper className={`document-toggle editor-toggle ${open ? 'open' : ''}`} data-open={open ? "true" : undefined}>
      <summary className="toggle-summary-editor" onClick={() => setOpen(!open)}>
        <input
          className="toggle-title-input"
          type="text"
          placeholder="펼쳐볼 제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
        />
        <i aria-hidden="true" style={{ transform: open ? 'rotate(225deg) translate(-2px, -2px)' : 'rotate(45deg) translateY(-2px)' }} />
      </summary>
      <div className="toggle-content-editor" style={{ display: open ? 'block' : 'none' }}>
        <NodeViewContent as="div" />
      </div>
    </NodeViewWrapper>
  );
};

export const Toggle = Node.create({
  name: 'toggle',
  group: 'block',
  content: 'block+',
  defining: true,
  isolating: true,

  addAttributes() {
    return {
      title: {
        default: '펼쳐보기',
      }
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="toggle"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'toggle' }), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ToggleComponent);
  },

  addStorage() {
    return {
      markdown: {
        serialize(state: any, node: any) {
          state.write(`:::toggle ${node.attrs.title}\n`);
          state.renderContent(node);
          state.write('\n:::\n\n');
        },
        parse: {
          setup(md: any) {
            md.block.ruler.before('paragraph', 'toggle', (state: any, startLine: number, endLine: number, silent: boolean) => {
              const pos = state.bMarks[startLine] + state.tShift[startLine];
              const max = state.eMarks[startLine];
              const line = state.src.slice(pos, max);
              const match = line.match(/^:::toggle\s*(.*)$/i);
              
              if (!match) return false;
              if (silent) return true;
              
              let nextLine = startLine + 1;
              let found = false;
              while (nextLine < endLine) {
                const nextPos = state.bMarks[nextLine] + state.tShift[nextLine];
                const nextMax = state.eMarks[nextLine];
                const nLine = state.src.slice(nextPos, nextMax);
                if (nLine.trim() === ':::') {
                  found = true;
                  break;
                }
                nextLine++;
              }
              
              if (!found) return false;
              
              state.line = nextLine + 1;
              
              const tokenOpen = state.push('toggle_open', 'div', 1);
              tokenOpen.attrs = [['data-type', 'toggle'], ['title', match[1] || '펼쳐보기']];
              
              state.md.block.tokenize(state, startLine + 1, nextLine);
              
              state.push('toggle_close', 'div', -1);
              return true;
            });
          }
        }
      }
    };
  }
});
