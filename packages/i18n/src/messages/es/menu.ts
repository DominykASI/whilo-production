import type { PartialTranslation } from "../../message";
import type { messages as source } from "../en/menu";

export const messages = {
  "menu.stopAllAgents": "Detener todos los agentes",
  "menu.checkForUpdates": "Buscar actualizaciones…",
  "menu.preferences": "Ajustes…",
  "menu.actualSize": "Tamaño real",
  "menu.zoomIn": "Ampliar",
  "menu.zoomOut": "Reducir",
  "menu.copyLink": "Copiar enlace",
  "menu.quit": "Salir de Whilo",
  "menu.quitConfirmTitle": "¿Salir de Whilo?",
  "menu.quitConfirmBody": "Los agentes y las rutinas se detienen hasta que vuelvas a abrir Whilo.",
  "menu.quitConfirm": "Salir",
  "menu.quitHint": "Mantén pulsado ⌘Q o púlsalo dos veces para salir",
  "menu.trayOpen": "Abrir Whilo",
  "menu.trayQuit": "Salir de Whilo",
  "menu.trayTooltip": "Whilo",
  "menu.undo": "Deshacer",
  "menu.redo": "Rehacer",
  "menu.cut": "Cortar",
  "menu.copy": "Copiar",
  "menu.paste": "Pegar",
  "menu.pasteAndMatchStyle": "Pegar y adaptar estilo",
  "menu.delete": "Eliminar",
  "menu.selectAll": "Seleccionar todo",
} as const satisfies PartialTranslation<typeof source>;
