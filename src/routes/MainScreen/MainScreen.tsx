import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Plus, Upload, Search, Settings, Loader2 } from "lucide-react";
import { useUIStore } from "../../store/useUIStore";
import { useProjectStore } from "../../store/useProjectStore";
import { useEditorStore } from "../../store/useEditorStore";
import { useSettingsStore } from "../../store/useSettingsStore";
import { useTranslation } from "../../i18n/useTranslation";
import { translateError } from "../../i18n/errors";
import { Button } from "../../components/common/Button";
import { IconButton } from "../../components/common/IconButton";
import { CategorySidebar } from "../../components/texture/CategorySidebar";
import { CategorySection } from "../../components/texture/CategorySection";
import { NewTextureDialog } from "../../components/texture/NewTextureDialog";
import { ImportTextureDialog } from "../../components/texture/ImportTextureDialog";
import { CATEGORIES, type CategoryId, type TextureSummary } from "../../types/texture";
import {
  createTexture,
  deleteTexture,
  importTexture,
  listTextures,
} from "../../services/textureService";

export function MainScreen() {
  const t = useTranslation();
  const goTo = useUIStore((s) => s.goTo);
  const activeProject = useProjectStore((s) => s.activeProject);
  const clearActiveProject = useProjectStore((s) => s.clearActiveProject);
  const openTextureInEditor = useEditorStore((s) => s.openTexture);
  const openSettings = useSettingsStore((s) => s.openSettings);

  const [textures, setTextures] = useState<TextureSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [pendingScroll, setPendingScroll] = useState<CategoryId | null>(null);
  const sectionRefs = useRef<Partial<Record<CategoryId, HTMLDivElement | null>>>({});

  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);

  // Sem projeto ativo (ex.: usuario chegou aqui sem passar pela HomeScreen),
  // nao ha o que mostrar - volta para a lista de projetos.
  useEffect(() => {
    if (!activeProject) goTo("home");
  }, [activeProject, goTo]);

  // Carrega as texturas reais do projeto ao abrir a tela.
  useEffect(() => {
    if (!activeProject) return;
    let cancelled = false;

    listTextures(activeProject.id)
      .then((result) => {
        if (!cancelled) setTextures(result);
      })
      .catch((err) => {
        if (!cancelled) setListError(translateError(t, err));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeProject]);

  // Roda depois que a busca e limpa (e a secao volta a existir no DOM).
  useEffect(() => {
    if (pendingScroll && sectionRefs.current[pendingScroll]) {
      sectionRefs.current[pendingScroll]?.scrollIntoView({ behavior: "smooth", block: "start" });
      setPendingScroll(null);
    }
  }, [pendingScroll, searchQuery]);

  if (!activeProject) return null;

  const handleBack = () => {
    clearActiveProject();
    goTo("home");
  };

  const handleSelectCategory = (categoryId: CategoryId) => {
    if (searchQuery) {
      // A secao pode estar oculta pela busca - limpa e agenda o scroll.
      setSearchQuery("");
      setPendingScroll(categoryId);
    } else {
      sectionRefs.current[categoryId]?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleOpenTexture = (texture: TextureSummary) => {
    openTextureInEditor(texture);
    goTo("editor");
  };

  const handleDeleteTexture = async (texture: TextureSummary) => {
    setListError(null);
    try {
      await deleteTexture(activeProject.id, texture.category, texture.name);
      setTextures((prev) =>
        prev.filter((t) => !(t.category === texture.category && t.name === texture.name)),
      );
    } catch (err) {
      setListError(translateError(t, err));
    }
  };

  const handleCreateTexture = async (name: string, category: CategoryId) => {
    setIsSubmitting(true);
    setDialogError(null);
    try {
      const created = await createTexture(activeProject.id, category, name);
      setTextures((prev) => [...prev, created]);
      setShowNewDialog(false);
    } catch (err) {
      setDialogError(translateError(t, err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImportTexture = async (category: CategoryId, sourcePath: string) => {
    setIsSubmitting(true);
    setDialogError(null);
    try {
      const imported = await importTexture(activeProject.id, category, sourcePath);
      setTextures((prev) => [...prev, imported]);
      setShowImportDialog(false);
    } catch (err) {
      setDialogError(translateError(t, err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const query = searchQuery.trim().toLowerCase();
  const isSearching = query.length > 0;

  const visibleCategories = CATEGORIES.map((category) => {
    const allInCategory = textures.filter((t) => t.category === category.id);
    const filtered = isSearching
      ? allInCategory.filter((t) => t.name.toLowerCase().includes(query))
      : allInCategory;
    return { category, textures: filtered };
  }).filter(({ textures: t }) => !isSearching || t.length > 0);

  return (
    <div className="h-screen flex flex-col bg-canvas">
      {/* Topo */}
      <header className="flex items-center justify-between gap-4 px-panel h-14 border-b border-line shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <IconButton icon={<ArrowLeft size={18} />} label={t.main.backToProjects} onClick={handleBack} />
          <h1 className="text-section-title text-ink truncate">{activeProject.name}</h1>
        </div>

        <div className="flex items-center gap-button-gap shrink-0">
          <Button
            variant="outline"
            onClick={() => {
              setDialogError(null);
              setShowNewDialog(true);
            }}
          >
            <Plus size={16} />
            {t.main.newTextureButton}
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setDialogError(null);
              setShowImportDialog(true);
            }}
          >
            <Upload size={16} />
            {t.main.importButton}
          </Button>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.main.searchPlaceholder}
              className="h-[34px] w-40 pl-9 pr-3 rounded-sm bg-panel border border-line text-ink text-body outline-none focus:border-accent"
            />
          </div>
          <IconButton icon={<Settings size={18} />} label={t.settings.buttonLabel} onClick={openSettings} />
        </div>
      </header>

      {/* Corpo: sidebar de categorias + area principal */}
      <div className="flex-1 flex min-h-0">
        <CategorySidebar onSelect={handleSelectCategory} />

        <div className="flex-1 overflow-y-auto p-panel bg-panel">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 text-muted text-body py-12">
              <Loader2 size={16} className="animate-spin" />
              {t.main.loadingTextures}
            </div>
          ) : listError ? (
            <p className="text-body text-red-400">{listError}</p>
          ) : isSearching && visibleCategories.length === 0 ? (
            <p className="text-body text-muted">{t.main.noResultsFor(searchQuery)}</p>
          ) : (
            <div className="flex flex-col gap-8">
              {visibleCategories.map(({ category, textures: categoryTextures }) => (
                <CategorySection
                  key={category.id}
                  ref={(el) => {
                    sectionRefs.current[category.id] = el;
                  }}
                  label={t.categories[category.id]}
                  textures={categoryTextures}
                  onOpenTexture={handleOpenTexture}
                  onDeleteTexture={handleDeleteTexture}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showNewDialog && (
        <NewTextureDialog
          defaultCategory="blocks"
          onConfirm={handleCreateTexture}
          onCancel={() => setShowNewDialog(false)}
          isSubmitting={isSubmitting}
          error={dialogError}
        />
      )}
      {showImportDialog && (
        <ImportTextureDialog
          defaultCategory="blocks"
          onConfirm={handleImportTexture}
          onCancel={() => setShowImportDialog(false)}
          isSubmitting={isSubmitting}
          error={dialogError}
        />
      )}
    </div>
  );
}
