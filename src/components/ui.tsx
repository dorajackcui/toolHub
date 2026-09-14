import type { ButtonHTMLAttributes, ReactNode } from "react";

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
      className={"button button--" + variant + " " + className}
      {...props}
    />
  );
}

export function EmptyState() {
  return (
    <div className="empty-state" aria-label="暂无结果">
      —
    </div>
  );
}

export function ToolHeader({
  name,
  children,
}: {
  name: string;
  children?: ReactNode;
}) {
  return (
    <header className="tool-header">
      <h1>{name}</h1>
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
          ["left", "原始文本", left, onLeft, descriptions[0]],
          ["right", "对照文本", right, onRight, descriptions[1]],
        ] as const
      ).map(([side, label, value, onChange, description]) => (
        <section className="input-panel" key={side}>
          <div className="input-heading">
            <label htmlFor={prefix + "-" + side}>{label}</label>
            <span className="input-count">
              {value ? value.split("\n").length : 0} 行 /{" "}
              {[...value].length.toLocaleString()} 字符
            </span>
          </div>
          {description && (
            <p className="input-description" title={description}>
              {description}
            </p>
          )}
          <textarea
            id={prefix + "-" + side}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            spellCheck={false}
          />
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
