import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import React from 'react';

const CalloutComponent = ({ node, updateAttributes }: any) => {
  const tone = node.attrs.tone || "blue";

  return (
    <NodeViewWrapper className={`document-callout tone-${tone} editor-callout`}>
      <span>참고</span>
      <input
        className="callout-title-input"
        type="text"
        placeholder="참고 제목"
        value={node.attrs.title}
        onChange={(e) => updateAttributes({ title: e.target.value })}
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
        }
      }
    };
  }
});
