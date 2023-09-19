import Router from "next/router";
import { useState } from "react";
import { IconButton } from "src/components/button";
import { useMobileScreen } from "src/hooks/useMobileScreen";
import { useAppConfig } from "src/store";
import { getChannelStore } from "src/store/channel";
import { useDebouncedCallback } from "use-debounce";
import { ChatAction } from "./ChatAction";
import { MessagesContainer } from "./MessagesContainer";
import styles from "./chat.module.scss";

import { useScrollToBottom } from "src/hooks/useScrollToBottom";
import BottomIcon from "src/icons/bottom.svg";
import BreakIcon from "src/icons/break.svg";
import MaxIcon from "src/icons/max.svg";
import MinIcon from "src/icons/min.svg";
import ReturnIcon from "src/icons/return.svg";
import { MessageInputBar } from "./MessageInput";
import ResetIcon from "src/icons/reload.svg";

function ChatActions(props: {
  scrollToBottom: () => void;
  hitBottom: boolean;
}) {
  return (
    <div className="absolute bottom-[72px] left-3 bg-transparent">
      {!props.hitBottom && (
        <ChatAction
          onClick={props.scrollToBottom}
          text="To Latest"
          icon={<BottomIcon />}
        />
      )}

      <ChatAction
        text="Clear context"
        icon={<BreakIcon />}
        onClick={() => {}}
      />
    </div>
  );
}

export const ChannelChat = ({ channel }: { channel: string }) => {
  const totalMessages = getChannelStore(channel)(
    (state) => state.totalMessages,
  );
  const clearMessages = getChannelStore(channel)(
    (state) => state.clearMessages,
  );
  const config = useAppConfig();

  const { scrollRef, setAutoScroll, scrollDomToBottom } = useScrollToBottom();
  const [hitBottom, setHitBottom] = useState(true);
  const isMobileScreen = useMobileScreen();

  const showMaxIcon = !isMobileScreen;

  const onChatBodyScroll = useDebouncedCallback(
    (e: HTMLElement) => {
      const bottomHeight = e.scrollTop + e.clientHeight;

      const isHitBottom =
        bottomHeight >= e.scrollHeight - (isMobileScreen ? 0 : 10);

      setHitBottom(isHitBottom);
      setAutoScroll(isHitBottom);
    },
    100,
    {
      leading: true,
      trailing: true,
    },
  );

  return (
    <div className={styles.chat}>
      <div className="window-header">
        {isMobileScreen && (
          <div className="window-actions">
            <div className={"window-action-button"}>
              <IconButton
                icon={<ReturnIcon />}
                bordered
                title="Go To Chat List"
                onClick={() => Router.push("/")}
              />
            </div>
          </div>
        )}

        <div className={`window-header-title ${styles["chat-body-title"]}`}>
          <div
            className={`window-header-main-title ${styles["chat-body-main-title"]}`}
          >
            {channel}
          </div>
          <div className="window-header-sub-title">
            {totalMessages} messages
          </div>
        </div>
        <div className="window-actions">
          <div className="window-action-button">
            <IconButton bordered icon={<ResetIcon />} onClick={clearMessages} />
          </div>
          <div className="window-action-button">
            {showMaxIcon && (
              <IconButton
                bordered
                icon={config.tightBorder ? <MinIcon /> : <MaxIcon />}
                onClick={() => {
                  config.update(
                    (config) => (config.tightBorder = !config.tightBorder),
                  );
                }}
              />
            )}
          </div>
        </div>
      </div>

      <div
        className={styles["chat-body"]}
        ref={scrollRef}
        onScroll={(e) => onChatBodyScroll(e.currentTarget)}
      >
        <MessagesContainer channel={channel} />
      </div>

      <ChatActions scrollToBottom={scrollDomToBottom} hitBottom={hitBottom} />

      <MessageInputBar channel={channel} />
    </div>
  );
};
