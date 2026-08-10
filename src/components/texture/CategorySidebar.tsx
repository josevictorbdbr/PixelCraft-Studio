import { CATEGORIES, type CategoryId } from "../../types/texture";
import { useTranslation } from "../../i18n/useTranslation";

interface CategorySidebarProps {
  onSelect: (categoryId: CategoryId) => void;
}

/** Barra lateral fixa de categorias - clique rola ate a secao (ancoragem, nao filtro). */
export function CategorySidebar({ onSelect }: CategorySidebarProps) {
  const t = useTranslation();

  return (
    <nav className="w-40 shrink-0 border-r border-line py-4">
      <ul>
        {CATEGORIES.map((category) => (
          <li key={category.id}>
            <button
              type="button"
              onClick={() => onSelect(category.id)}
              className="w-full text-left px-4 py-2 text-body text-muted hover:text-ink hover:bg-panel/50 transition-colors cursor-pointer"
            >
              {t.categories[category.id]}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
