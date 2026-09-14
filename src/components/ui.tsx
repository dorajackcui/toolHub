import type { ButtonHTMLAttributes, ReactNode } from "react";
import { FileSearch } from "lucide-react";

export function Button({
  className = "",
  variant = "secondary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
}) {
  return (
    <button
      type="button"
      className={`button button--${variant} ${className}`}
      {...props}
    />
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <FileSearch size={24} strokeWidth={1.5} />
      </div>
      <p>{children}</p>
      <span>输入两侧文本，结果会实时显示在这里</span>
    </div>
  );
}

export function ToolHeader({
  name,
  description,
  number,
  children,
}: {
  name: string;
  description: string;
  number: string;
  children?: ReactNode;
}) {
  return (
    <header className="tool-header">
      <div>
        <div className="eyebrow">
          <span /> WORKSPACE / {number}
        </div>
        <h1>{name}</h1>
        <p>{description}</p>
      </div>
      <div className="header-actions">{children}</div>
    </header>
  );
}

export function TextInputs({
  prefix,
  left,
  right,
  onLeft,
  onRight,
  descriptions,
}: {
  prefix: string;
  left: string;
  right: string;
  onLeft: (text: string) => void;
  onRight: (text: string) => void;
  descriptions: [string, string];
}) {
  return (
    <div className="text-inputs">
      {(
        [
          ["left", "原始文本", "SOURCE", left, onLeft, descriptions[0]],
          ["right", "对照文本", "TARGET", right, onRight, descriptions[1]],
        ] as const
      ).map(([side, label, caption, value, onChange, description]) => (
        <section className="input-panel" key={side}>
          <div className="input-heading">
            <label htmlFor={`${prefix}-${side}`}>
              <span className={`side-dot side-dot--${side}`} />
              {label}
              <span className="tiny-label">{caption}</span>
            </label>
            <span className="line-count">
              {value ? value.split("\n").length : 0} 行
            </span>
          </div>
          {description && (
            <p className="input-description" title={description}>
              {description}
            </p>
          )}
          <textarea
            id={`${prefix}-${side}`}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={
              side === "left"
                ? "在此粘贴原始文本，或从表格导入…"
                : "在此粘贴对照文本，或从表格导入…"
            }
            spellCheck={false}
          />
          <div className="input-footer">
            <span>支持多行文本</span>
            <span>{[...value].length.toLocaleString()} 字符</span>
          </div>
        </section>
      ))}
    </div>
  );
}

export function FilterTabs({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string; count?: number }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="filter-tabs" role="group" aria-label="结果筛选">
      {options.map((option) => (
        <button
          type="button"
          key={option.value}
          aria-pressed={value === option.value}
          className={value === option.value ? "active" : ""}
          onClick={() => onChange(option.value)}
        >
          {option.label}
          {option.count !== undefined && <span>{option.count}</span>}
        </button>
      ))}
    </div>
  );
}
