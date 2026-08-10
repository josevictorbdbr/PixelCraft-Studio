import { useEffect } from "react";
import { useUIStore } from "./store/useUIStore";
import { useSettingsStore } from "./store/useSettingsStore";
import { SettingsDialog } from "./components/settings/SettingsDialog";
import { HomeScreen } from "./routes/HomeScreen/HomeScreen";
import { MainScreen } from "./routes/MainScreen/MainScreen";
import { EditorScreen } from "./routes/EditorScreen/EditorScreen";

/**
 * Roteamento simples por estado:
 * a navegacao do app e linear (Home -> Principal -> Editor), entao
 * a tela ativa controlada pelo useUIStore e suficiente.
 */
function renderScreen(activeScreen: ReturnType<typeof useUIStore.getState>["activeScreen"]) {
  switch (activeScreen) {
    case "home":
      return <HomeScreen />;
    case "main":
      return <MainScreen />;
    case "editor":
      return <EditorScreen />;
    default:
      return <HomeScreen />;
  }
}

function App() {
  const activeScreen = useUIStore((s) => s.activeScreen);
  const isSettingsOpen = useSettingsStore((s) => s.isSettingsOpen);
  const loadInitial = useSettingsStore((s) => s.loadInitial);

  // Carrega settings.json uma vez no boot - a tela de Configuracoes precisa
  // saber idioma salvo antes do usuario abrir a engrenagem.
  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  return (
    <>
      {renderScreen(activeScreen)}
      {isSettingsOpen && <SettingsDialog />}
    </>
  );
}

export default App;
