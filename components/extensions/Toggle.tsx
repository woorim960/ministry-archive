import { Node, mergeAttributes, InputRule } from '@tiptap/core';
import { NodeSelection, Selection } from '@tiptap/pm/state';
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import React, { useState, useEffect } from 'react';

const ToggleComponent = ({ node, updateAttributes, editor, getPos }: any) => {
  const open = node.attrs.open !== false;
  const setOpen = (newOpen: boolean) => updateAttributes({ open: newOpen });
  const [title, setTitle] = useState(node.attrs.title || "");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const isComposing = React.useRef(false);

  useEffect(() => {
    setTitle(node.attrs.title || "");
  }, [node.attrs.title]);

  const hasFocused = React.useRef(false);

  useEffect(() => {
    if (node.attrs.autoFocus && editor?.isEditable && !hasFocused.current) {
      hasFocused.current = true;
      setTimeout(() => {
        const pos = getPos();
        if (typeof pos === 'number') {
          editor.commands.setNodeSelection(pos);
        }
        inputRef.current?.focus();
      }, 50);
    }
  }, [node.attrs.autoFocus, editor?.isEditable, getPos]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (!isComposing.current) {
      updateAttributes({ title: e.target.value });
    }
  };

  const handleCompositionStart = () => {
    isComposing.current = true;
  };

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    isComposing.current = false;
    updateAttributes({ title: e.currentTarget.value });
  };

  const handleBlur = () => {
    if (title !== node.attrs.title) updateAttributes({ title });
  };

  const lastFocusTime = React.useRef(0);

  const handleFocus = () => {
    lastFocusTime.current = Date.now();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      e.stopPropagation();
      const newOpen = !open;
      setOpen(newOpen);
      if (!newOpen) {
        const pos = getPos();
        const nodeSize = node.nodeSize;
        editor.chain().insertContentAt(pos + nodeSize, { type: 'paragraph' }).focus(pos + nodeSize + 1).run();
      }
      return;
    }

    if (e.key === 'Enter' && !isComposing.current && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      const pos = getPos();
      const nodeSize = node.nodeSize;
      editor.chain().insertContentAt(pos + nodeSize, { type: 'paragraph' }).focus(pos + nodeSize + 1).run();
      return;
    }

    if (e.key === 'ArrowDown') {
      if (open) {
        if (Date.now() - lastFocusTime.current < 150) {
          e.preventDefault();
          return;
        }
        e.preventDefault();
        editor.commands.focus(getPos() + 2);
      }
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const pos = getPos();
      if (typeof pos === 'number') {
        editor.commands.focus(Math.max(0, pos - 1));
      }
    }

    if (e.key === 'Backspace' && title === '' && (e.currentTarget as HTMLInputElement).selectionStart === 0) {
      e.preventDefault();
      editor.commands.deleteNode('toggle');
    }
  };

  return (
    <NodeViewWrapper className={`document-toggle editor-toggle ${open ? 'open' : ''}`} data-open={open ? "true" : undefined}>
      <summary className={editor?.isEditable ? "toggle-summary-editor" : ""} onClick={() => setOpen(!open)}>
        {editor?.isEditable ? (
          <input
            ref={inputRef}
            className="toggle-title-input"
            type="text"
            placeholder="펼쳐볼 제목"
            value={title}
            onChange={handleChange}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <strong>{title || "펼쳐보기"}</strong>
        )}
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
      },
      open: {
        default: true,
        parseHTML: element => element.getAttribute('data-open') === 'true',
        renderHTML: attributes => {
          return { 'data-open': attributes.open ? 'true' : 'false' };
        }
      },
      autoFocus: {
        default: false,
        parseHTML: () => false,
        renderHTML: () => null,
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
  addInputRules() {
    return [
      new InputRule({
        find: /^\s*>\s$/,
        handler: ({ state, range, chain }) => {
          chain()
            .deleteRange({ from: range.from, to: range.to })
            .wrapIn(this.name, { title: '', autoFocus: true })
            .command(({ tr }) => {
              const depth = tr.selection.$from.depth;
              if (depth >= 1) {
                const pos = tr.selection.$from.before(depth);
                tr.setSelection(NodeSelection.create(tr.doc, pos));
              }
              return true;
            })
            .run();
        },
      }),
    ];
  },

  addKeyboardShortcuts() {
    return {
      'ArrowUp': ({ editor }) => {
        const { state, view } = editor;
        const { selection } = state;
        const { $from, empty } = selection;

        if (!empty) return false;

        let togglePos = -1;
        let toggleDepth = -1;
        for (let d = $from.depth; d > 0; d--) {
          if ($from.node(d).type.name === this.name) {
            togglePos = $from.before(d);
            toggleDepth = d;
            break;
          }
        }

        if (togglePos !== -1) {
          if ($from.index(toggleDepth) === 0 && view.endOfTextblock('up')) {
            const dom = view.nodeDOM(togglePos) as HTMLElement;
            if (dom) {
              const input = dom.querySelector('.toggle-title-input') as HTMLInputElement;
              if (input) {
                input.focus();
                setTimeout(() => {
                  input.selectionStart = input.value.length;
                  input.selectionEnd = input.value.length;
                }, 0);
                return true;
              }
            }
          }
        }
        return false;
      },
      'ArrowDown': ({ editor }) => {
        const { state, view } = editor;
        const { selection } = state;
        const { $from, empty } = selection;

        if (!empty) return false;

        if (view.endOfTextblock('down')) {
          const nextSelection = Selection.findFrom($from, 1);
          if (nextSelection) {
            let togglePos = -1;
            let toggleNode = null;
            for (let d = nextSelection.$from.depth; d > 0; d--) {
              if (nextSelection.$from.node(d).type.name === this.name) {
                togglePos = nextSelection.$from.before(d);
                toggleNode = nextSelection.$from.node(d);
                break;
              }
            }
            if (togglePos !== -1 && toggleNode) {
              let currentTogglePos = -1;
              for (let d = $from.depth; d > 0; d--) {
                if ($from.node(d).type.name === this.name) {
                  currentTogglePos = $from.before(d);
                  break;
                }
              }
              
              if (currentTogglePos !== togglePos) {
                editor.commands.setNodeSelection(togglePos);
                setTimeout(() => {
                  const dom = view.nodeDOM(togglePos) as HTMLElement;
                  if (dom) {
                    const input = dom.querySelector('.toggle-title-input') as HTMLInputElement;
                    if (input) {
                      input.focus();
                      input.selectionStart = 0;
                      input.selectionEnd = 0;
                    }
                  }
                }, 10);
                return true;
              }
            }
          }
        }
        return false;
      },
      'Mod-Enter': ({ editor }) => {
        const { state } = editor;
        const { selection } = state;
        const { $from } = selection;

        let togglePos = -1;
        let toggleNode = null;
        for (let d = $from.depth; d > 0; d--) {
          if ($from.node(d).type.name === this.name) {
            togglePos = $from.before(d);
            toggleNode = $from.node(d);
            break;
          }
        }

        if (togglePos !== -1 && toggleNode) {
          const posToInsert = togglePos + toggleNode.nodeSize;
          editor.chain()
            .updateAttributes(this.name, { open: false })
            .insertContentAt(posToInsert, { type: 'paragraph' })
            .focus(posToInsert + 1)
            .run();
          return true;
        }
        return false;
      }
    };
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
