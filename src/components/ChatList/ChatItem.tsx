import { Mask } from "src/store";
import DeleteIcon from "src/icons/delete.svg";
import { IconButton } from "src/ui/IconButtonWithText";

export function ChatItem(props: {
  onClick?: () => void;
  onDelete?: () => void;
  title: string;
  count: number;
  time: string;
  selected: boolean;
  narrow?: boolean;
  mask?: Mask;
}) {
  return (
    <div
      title={`${props.title}\n${props.count} messages`}
      className={[
        "chat-item group relative",
        props.selected && "chat-item-selected",
      ].join(" ")}
      onClick={props.onClick}
    >
      <div className="chat-item-title">{props.title}</div>
      <div className="chat-item-info">
        {props.count && (
          <div className="chat-item-detail">{props.count} messages</div>
        )}
        <div className="chat-item-date">{props.time}</div>
      </div>
      {props.onDelete && (
        <IconButton
          className="absolute right-2 top-2 !hidden group-hover:!flex !p-2"
          icon={<DeleteIcon />}
          onClick={(e) => {
            e.stopPropagation();
            props.onDelete?.();
          }}
        />
      )}
    </div>
  );
}
