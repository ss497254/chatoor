import {
  DragDropContext,
  Draggable,
  Droppable,
  OnDragEndResponder,
} from "@hello-pangea/dnd";
import { useState } from "react";
import { ROLES } from "src/api-client/api";
import chatStyle from "src/components/Chat/chat.module.scss";
import { ChatMessage, createMessage } from "src/store";
import { IconButton, Input, Select } from "src/ui";

import AddIcon from "src/icons/add.svg";
import DeleteIcon from "src/icons/delete.svg";
import DragIcon from "src/icons/drag.svg";

// drag and drop helper function
function reorder<T>(list: T[], startIndex: number, endIndex: number): T[] {
  const result = [...list];
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

function ContextPromptItem(props: {
  index: number;
  prompt: ChatMessage;
  update: (prompt: ChatMessage) => void;
  remove: () => void;
}) {
  const [focusingInput, setFocusingInput] = useState(false);

  return (
    <div className={chatStyle["context-prompt-row"]}>
      {!focusingInput && (
        <>
          <div className={chatStyle["context-drag"]}>
            <DragIcon />
          </div>
          <Select
            value={props.prompt.role}
            className={chatStyle["context-role"]}
            onChange={(e) =>
              props.update({
                ...props.prompt,
                role: e.target.value as any,
              })
            }
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>
        </>
      )}
      <Input
        value={props.prompt.content}
        type="text"
        className={chatStyle["context-content"]}
        rows={focusingInput ? 5 : 1}
        onFocus={() => setFocusingInput(true)}
        onBlur={() => {
          setFocusingInput(false);
          window?.getSelection()?.removeAllRanges();
        }}
        onInput={(e) =>
          props.update({
            ...props.prompt,
            content: e.currentTarget.value as any,
          })
        }
      />
      {!focusingInput && (
        <IconButton
          icon={<DeleteIcon />}
          className={chatStyle["context-delete-button"]}
          onClick={() => props.remove()}
          bordered
        />
      )}
    </div>
  );
}

export function ContextPrompts(props: {
  context: ChatMessage[];
  updateContext: (updater: (context: ChatMessage[]) => void) => void;
}) {
  const context = props.context;

  const addContextPrompt = (prompt: ChatMessage, i: number) => {
    props.updateContext((context) => context.splice(i, 0, prompt));
  };

  const removeContextPrompt = (i: number) => {
    props.updateContext((context) => context.splice(i, 1));
  };

  const updateContextPrompt = (i: number, prompt: ChatMessage) => {
    props.updateContext((context) => (context[i] = prompt));
  };

  const onDragEnd: OnDragEndResponder = (result) => {
    if (!result.destination) {
      return;
    }
    const newContext = reorder(
      context,
      result.source.index,
      result.destination.index,
    );
    props.updateContext((context) => {
      context.splice(0, context.length, ...newContext);
    });
  };

  return (
    <>
      <div className={chatStyle["context-prompt"]} style={{ marginBottom: 20 }}>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="context-prompt-list">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {context.map((c, i) => (
                  <Draggable
                    draggableId={c.id || i.toString()}
                    index={i}
                    key={c.id}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <ContextPromptItem
                          index={i}
                          prompt={c}
                          update={(prompt) => updateContextPrompt(i, prompt)}
                          remove={() => removeContextPrompt(i)}
                        />
                        <div
                          className={chatStyle["context-prompt-insert"]}
                          onClick={() => {
                            addContextPrompt(
                              createMessage({
                                role: "user",
                                content: "",
                                date: new Date().toLocaleString(),
                              }),
                              i + 1,
                            );
                          }}
                        >
                          <AddIcon />
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {props.context.length === 0 && (
          <div className={chatStyle["context-prompt-row"]}>
            <IconButton
              icon={<AddIcon />}
              text="Add a Prompt"
              bordered
              className={chatStyle["context-prompt-button"]}
              onClick={() =>
                addContextPrompt(
                  createMessage({
                    role: "user",
                    content: "",
                    date: "",
                  }),
                  props.context.length,
                )
              }
            />
          </div>
        )}
      </div>
    </>
  );
}
