import type { ProjectSummary } from "../../types/project";
import { useTranslation } from "../../i18n/useTranslation";
import { ProjectListItem } from "./ProjectListItem";

interface ProjectListProps {
  projects: ProjectSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onOpen: (id: string) => void;
  newProjectButtonLabel: string;
}

export function ProjectList({
  projects,
  selectedId,
  onSelect,
  onOpen,
  newProjectButtonLabel,
}: ProjectListProps) {
  const t = useTranslation();

  if (projects.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted text-body">
        {t.project.emptyList(newProjectButtonLabel)}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto divide-y divide-line">
      {projects.map((project) => (
        <ProjectListItem
          key={project.id}
          project={project}
          selected={project.id === selectedId}
          onSelect={() => onSelect(project.id)}
          onOpen={() => onOpen(project.id)}
        />
      ))}
    </div>
  );
}
