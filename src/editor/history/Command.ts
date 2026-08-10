export interface Command {
  undo(): void;
  redo(): void;
}

/**
 * Snapshot completo de "antes"/"depois" de uma acao (ex: um traco inteiro
 * do lapis, do pointerDown ate o pointerUp). Em 16x16 (o mais comum) um
 * snapshot completo por acao e baratissimo em memoria - sem necessidade
 * de diffs complexos. Com resolucoes maiores cada snapshot pesa mais
 * por isso o HistoryManager limita quantas acoes ficam guardadas.
 */
export class SnapshotCommand implements Command {
  private readonly restore: (data: ImageData) => void;
  private readonly before: ImageData;
  private readonly after: ImageData;
  private readonly onChange: () => void;

  constructor(
    restore: (data: ImageData) => void,
    before: ImageData,
    after: ImageData,
    onChange: () => void,
  ) {
    this.restore = restore;
    this.before = before;
    this.after = after;
    this.onChange = onChange;
  }

  undo(): void {
    this.restore(this.before);
    this.onChange();
  }

  redo(): void {
    this.restore(this.after);
    this.onChange();
  }
}
