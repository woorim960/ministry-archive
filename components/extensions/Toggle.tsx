import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import React, { useState } from 'react';

const ToggleComponent = ({ node, updateAttributes }: any) => {
  const [open, setOpen] = useState(true);

  return (
    <NodeViewWrapper className="document-toggle editor-toggle">
      <div className="toggle-summary-editor">
        <input
          className="toggle-title-input"
          type="text"
          placeholder="펼쳐볼 제목"
          value={node.attrs.title}
          onChange={(e) => updateAttributes({ title: e.target.value })}
        />
        <button type="button" onClick={() => setOpen(!open)} className="toggle-icon-button">
          <i aria-hidden="true" style={{ transform: open ? 'rotate(225deg) translate(-2px, -2px)' : 'rotate(45deg) translateY(-2px)' }} />
        </button>
      </div>
      <div className="toggle-content-editor" style={{ display: open ? 'block' : 'none' }}>
        <NodeViewContent />
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
        }
      }
    };
  }
});
