import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import React, { useState, useEffect } from 'react';

const CalloutComponent = ({ node, updateAttributes }: any) => {
  const tone = node.attrs.tone || "blue";
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
    <NodeViewWrapper className={`document-callout tone-${tone} editor-callout`}>
      <span>참고</span>
      <input
        className="callout-title-input"
        type="text"
        placeholder="참고 제목"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      />
      <NodeViewContent className="callout-content" />
    </NodeViewWrapper>
  );
};

export const Callout = Node.create({
  name: 'callout',
  group: 'block',
  content: 'block+',
  defining: true,
  isolating: true,

  addAttributes() {
    return {
      tone: {
        default: 'blue',
      },
      title: {
        default: '참고',
      }
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="callout"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'callout' }), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CalloutComponent);
  },

  addStorage() {
    return {
      markdown: {
        serialize(state: any, node: any) {
          state.write(`:::note[${node.attrs.tone}] ${node.attrs.title}\n`);
          state.renderContent(node);
          state.write('\n:::\n\n');
        },
        parse: {
          setup(md: any) {
            md.block.ruler.before('paragraph', 'callout', (state: any, startLine: number, endLine: number, silent: boolean) => {
              const pos = state.bMarks[startLine] + state.tShift[startLine];
              const max = state.eMarks[startLine];
              const line = state.src.slice(pos, max);
              const match = line.match(/^:::note\[(.*?)\]\s*(.*)$/i);
              
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
              
              const tokenOpen = state.push('callout_open', 'div', 1);
              tokenOpen.attrs = [['data-type', 'callout'], ['tone', match[1]], ['title', match[2] || '참고']];
              
              state.md.block.tokenize(state, startLine + 1, nextLine);
              
              state.push('callout_close', 'div', -1);
              return true;
            });
          }
        }
      }
    };
  }
});
