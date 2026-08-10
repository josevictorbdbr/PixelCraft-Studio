import type { Command } from "./Command";

/**
 * Cada entrada guarda um snapshot completo da textura (antes + depois).
 * Em 16x16 isso e ~1KB, irrelevante. Em 1024x1024 sao ~4MB por entrada 
 * sem limite, uma sessao longa de edicao numa textura grande poderia 
 * acumular centenas de MB. 50 acoes de historico e bastante margem pra
 * desfazer/refazer sem deixar isso crescer sem controle.
 */
const MAX_HISTORY_ENTRIES = 50;

/** Pilha de undo/redo (command pattern). Empilhar uma acao nova limpa o redo. */
export class HistoryManager {
  private undoStack: Command[] = [];
  private redoStack: Command[] = [];

  push(command: Command): void {
    this.undoStack.push(command);
    if (this.undoStack.length > MAX_HISTORY_ENTRIES) {
      this.undoStack.shift(); // descarta a acao mais antiga
    }
    this.redoStack = [];
  }

  undo(): void {
    const command = this.undoStack.pop();
    if (!command) return;
    command.undo();
    this.redoStack.push(command);
  }

  redo(): void {
    const command = this.redoStack.pop();
    if (!command) return;
    command.redo();
    this.undoStack.push(command);
  }

  get canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  get canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }
}
