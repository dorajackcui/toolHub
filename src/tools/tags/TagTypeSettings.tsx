import { useRef } from "react";
import { Settings2, X } from "lucide-react";
import { Button } from "../../components/ui";
import { ALL_TAG_TYPES, TAG_TYPE_DEFINITIONS, type TagType } from "./rules";

const labels = ["尖括号", "花括号", "转义换行符", "竖线", "井号包裹", "方括号"];

export default function TagTypeSettings({
  value,
  onChange,
}: {
  value: TagType[];
  onChange: (types: TagType[]) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  return (
    <>
      <Button
        variant="ghost"
        aria-label="配置标签类型"
        onClick={() => dialog.current?.showModal()}
      >
        <Settings2 size={15} />
        标签类型 <span className="count-badge">{value.length}/6</span>
      </Button>
      <dialog
        ref={dialog}
        className="settings-dialog"
        aria-labelledby="tag-settings-title"
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            const rect = event.currentTarget.getBoundingClientRect();
            if (
              event.clientX < rect.left ||
              event.clientX > rect.right ||
              event.clientY < rect.top ||
              event.clientY > rect.bottom
            )
              dialog.current?.close();
          }
        }}
      >
        <div className="dialog-heading">
          <div>
            <h2 id="tag-settings-title">标签类型</h2>
          </div>
          <Button
            variant="ghost"
            aria-label="关闭标签设置"
            onClick={() => dialog.current?.close()}
          >
            <X size={20} />
          </Button>
        </div>
        <div className="tag-type-list">
          {TAG_TYPE_DEFINITIONS.map((type, index) => (
            <label
              key={type.id}
              className={value.includes(type.id) ? "selected" : ""}
            >
              <input
                type="checkbox"
                checked={value.includes(type.id)}
                onChange={(event) =>
                  onChange(
                    ALL_TAG_TYPES.filter((id) =>
                      id === type.id
                        ? event.target.checked
                        : value.includes(id),
                    ),
                  )
                }
              />
              <span>
                <strong>{labels[index]}</strong>
                <code>{type.example}</code>
              </span>
            </label>
          ))}
        </div>
        <div className="dialog-footer">
          <Button
            variant="ghost"
            disabled={!value.length}
            onClick={() => onChange([])}
          >
            清除全选
          </Button>
          <Button
            variant="secondary"
            disabled={value.length === ALL_TAG_TYPES.length}
            onClick={() => onChange([...ALL_TAG_TYPES])}
          >
            全选
          </Button>
          <Button variant="primary" onClick={() => dialog.current?.close()}>
            完成
          </Button>
        </div>
      </dialog>
    </>
  );
}
