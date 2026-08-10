/**
 * Observa edicoes e agenda um salvamento um tempo depois da ultima, cancelando e
 * reagendando a cada nova edicao.
 */
export class AutosaveService {
  private timer: ReturnType<typeof setTimeout> | null = null;
  private delayMs: number;

  constructor(delayMs: number) {
    this.delayMs = delayMs;
  }

  /** Agenda (ou reagenda, cancelando a anterior) o salvamento. */
  schedule(save: () => void): void {
    this.cancel();
    this.timer = setTimeout(() => {
      this.timer = null;
      save();
    }, this.delayMs);
  }

  /** Cancela o agendamento pendente, se houver (sem salvar). */
  cancel(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  get isPending(): boolean {
    return this.timer !== null;
  }
}
