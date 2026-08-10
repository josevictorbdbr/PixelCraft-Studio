import { Modal } from "../common/Modal";
import { Select } from "../common/Select";
import { useSettingsStore } from "../../store/useSettingsStore";
import { useTranslation } from "../../i18n/useTranslation";
import type { Language } from "../../types/settings";

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

  return (
    <Modal title={t.settings.title} onClose={closeSettings}>
      <label className="block text-body text-muted mb-2">{t.settings.languageLabel}</label>
      <Select
        options={LANGUAGE_OPTIONS}
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
      />
    </Modal>
  );
}
