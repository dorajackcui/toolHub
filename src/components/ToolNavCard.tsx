type ToolNavCardProps = {
  isActive: boolean;
  name: string;
  onClick: () => void;
};

export default function ToolNavCard(props: ToolNavCardProps) {
  const { isActive, name, onClick } = props;

  return (
    <button
      type="button"
      className={isActive ? "tool-card tool-card--active" : "tool-card"}
      onClick={onClick}
    >
      <strong>{name}</strong>
    </button>
  );
}
