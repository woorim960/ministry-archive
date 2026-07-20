import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React from 'react';
import { youtubeId } from '@/lib/markdown';

const YoutubeComponent = ({ node, updateAttributes, editor }: any) => {
  const url = node.attrs.url || "";
  const caption = node.attrs.caption || "";
  const id = youtubeId(url);

  return (
    <NodeViewWrapper className="video-embed">
      {id ? (
        <figure style={{ margin: 0 }}>
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}`}
            title={caption || "YouTube 영상"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
          {caption && <figcaption>{caption}</figcaption>}
        </figure>
      ) : (
        <p className="embed-error">YouTube 링크를 확인해 주세요.</p>
      )}
    </NodeViewWrapper>
  );
};

export const Youtube = Node.create({
  name: 'youtube',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      url: { default: '' },
      caption: { default: '' },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="youtube"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'youtube' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(YoutubeComponent);
  },

  addStorage() {
    return {
      markdown: {
        serialize(state: any, node: any) {
          state.write(`@youtube[${node.attrs.caption}](${node.attrs.url})\n`);
        },
        parse: {
          setup(md: any) {
            md.block.ruler.before('paragraph', 'youtube', (state: any, startLine: number, endLine: number, silent: boolean) => {
              const pos = state.bMarks[startLine] + state.tShift[startLine];
              const max = state.eMarks[startLine];
              const line = state.src.slice(pos, max);
              const match = line.match(/^@youtube\\?\[(.*?)\\?\]\\?\((.*?)\\?\)$/);
              
              if (!match) return false;
              if (silent) return true;
              
              state.line = startLine + 1;
              
              const token = state.push('youtube', 'div', 0);
              token.attrs = [['data-type', 'youtube'], ['caption', match[1]], ['url', match[2]]];
              
              return true;
            });
          }
        }
      }
    };
  }
});
