import type { ProjectSummary } from "../../types/project";
import { formatDate } from "../../utils/formatDate";
import { useTranslation } from "../../i18n/useTranslation";

interface ProjectListItemProps {
  project: ProjectSummary;
  selected: boolean;
  onSelect: () => void;
  onOpen: () => void;
}

export function ProjectListItem({
  project,
  selected,
  onSelect,
  onOpen,
}: ProjectListItemProps) {
  const t = useTranslation();

  return (
    <button
      type="button"
      onClick={onSelect}
      onDoubleClick={onOpen}
      className={`w-full flex items-center justify-between px-4 py-3 text-left border-l-2 transition-colors cursor-pointer ${
        selected
          ? "border-accent bg-panel"
          : "border-transparent hover:bg-panel/50"
      }`}
    >
      <span className="text-body text-ink">{project.name}</span>
      <span className="text-caption text-muted">
        {t.project.modifiedOn(formatDate(project.updatedAt))}
      </span>
    </button>
  );
}
