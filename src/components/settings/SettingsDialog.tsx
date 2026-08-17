import { useState } from "react";
import { Modal } from "../common/Modal";
import { Select } from "../common/Select";
import { Button } from "../common/Button";
import { useSettingsStore } from "../../store/useSettingsStore";
import { useTranslation } from "../../i18n/useTranslation";
import type { Language } from "../../types/settings";
import { ManageTemplatesDialog } from "./ManageTemplatesDialog";

/** Nomes de cada idioma na sua propria lingua - nunca sao traduzidos. */
const LANGUAGE_OPTIONS: { value: Language; label: string }[] = [
  { value: "en", label: "English" },
  { value: "pt-br", label: "Português (Brasil)" },
  { value: "es", label: "Español" },
];

export function SettingsDialog() {
  const t = useTranslation();
  const language = useSettingsStore((s) => s.settings.language);
  const setLanguage = useSettingsStore((s) => s.setLanguage);
  const closeSettings = useSettingsStore((s) => s.closeSettings);
  const [isManageTemplatesOpen, setIsManageTemplatesOpen] = useState(false);

  return (
    <>
      <Modal title={t.settings.title} onClose={closeSettings} widthClassName="w-96">
        <label className="block text-body text-muted mb-2">{t.settings.languageLabel}</label>
        <Select
          options={LANGUAGE_OPTIONS}
          value={language}
          onChange={(e) => setLanguage(e.target.value as Language)}
        />

        <div className="mt-6 pt-6 border-t border-line">
          <Button
            variant="secondary"
            className="w-full justify-center"
            onClick={() => setIsManageTemplatesOpen(true)}
          >
            {t.settings.manageTemplatesButton}
          </Button>
        </div>
      </Modal>

      {isManageTemplatesOpen && <ManageTemplatesDialog onClose={() => setIsManageTemplatesOpen(false)} />}
    </>
  );
}
