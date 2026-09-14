import { useEffect, useRef, useState } from "react";
import { Button } from "./ui";

export default function CopyButton({
  text,
  label = "复制",
  disabled = false,
}: {
  text: string;
  label?: string;
  disabled?: boolean;
}) {
  const [status, setStatus] = useState("");
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const version = useRef(0);
  useEffect(() => {
    version.current++;
    setStatus("");
    return () => {
      version.current++;
      clearTimeout(timeout.current);
    };
  }, [text]);

  async function copy() {
    const current = version.current;
    try {
      await navigator.clipboard.writeText(text);
      if (current !== version.current) return;
      setStatus("已复制");
    } catch {
      if (current !== version.current) return;
      setStatus("复制失败，请手动复制");
    }
    clearTimeout(timeout.current);
    timeout.current = setTimeout(() => setStatus(""), 2500);
  }

  return (
    <span className="copy-action">
      <Button onClick={copy} disabled={disabled}>
        {label}
      </Button>
      <span className="copy-status" role="status">
        {status}
      </span>
    </span>
  );
}
