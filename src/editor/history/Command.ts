import type { Layer } from "../layers/Layer";

export interface Command {
  undo(): void;
  redo(): void;
}

/**
 * Snapshot completo de "antes"/"depois" de um traco de pincel inteiro
 * (pointerDown ate pointerUp) NA CAMADA ATIVA. Em 16x16 (o mais comum)
 * um snapshot completo por acao e baratissimo em memoria - sem
 * necessidade de diffs complexos.
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

/**
 * Muda uma propriedade simples de uma camada (nome, visibilidade,
 * opacidade). Generico e reaproveitado pelas 3 - guarda so o valor
 * antigo/novo, nao uma copia da camada inteira.
 */
export class LayerPropertyCommand<T> implements Command {
  private readonly setValue: (value: T) => void;
  private readonly before: T;
  private readonly after: T;
  private readonly onChange: () => void;

  constructor(
    setValue: (value: T) => void,
    before: T,
    after: T,
    onChange: () => void,
  ) {
    this.setValue = setValue;
    this.before = before;
    this.after = after;
    this.onChange = onChange;
  }

  undo(): void {
    this.setValue(this.before);
    this.onChange();
  }

  redo(): void {
    this.setValue(this.after);
    this.onChange();
  }
}

/** Troca a ordem das camadas (mover para cima/baixo). Guarda so a lista de ids antes/depois. */
export class ReorderLayersCommand implements Command {
  private readonly applyOrder: (order: string[]) => void;
  private readonly before: string[];
  private readonly after: string[];
  private readonly onChange: () => void;

  constructor(
    applyOrder: (order: string[]) => void,
    before: string[],
    after: string[],
    onChange: () => void,
  ) {
    this.applyOrder = applyOrder;
    this.before = before;
    this.after = after;
    this.onChange = onChange;
  }

  undo(): void {
    this.applyOrder(this.before);
    this.onChange();
  }

  redo(): void {
    this.applyOrder(this.after);
    this.onChange();
  }
}

/**
 * Adicionar ou remover uma camada. Os dois casos sao o inverso um do
 * outro (undo de "add" = remover, undo de "delete" = reinserir), entao
 * um comando so cobre ambos via `wasAdd`. Guarda a REFERENCIA da Layer
 * (nao uma copia dos pixels) - remover da lista nao destroi o objeto,
 * entao reinserir no undo/redo e barato.
 */
export class AddRemoveLayerCommand implements Command {
  private readonly insert: (layer: Layer, index: number) => void;
  private readonly remove: (layerId: string) => void;
  private readonly setActiveId: (id: string) => void;
  private readonly layer: Layer;
  private readonly index: number;
  private readonly wasAdd: boolean;
  private readonly activeBefore: string;
  private readonly activeAfter: string;
  private readonly onChange: () => void;

  constructor(
    insert: (layer: Layer, index: number) => void,
    remove: (layerId: string) => void,
    setActiveId: (id: string) => void,
    layer: Layer,
    index: number,
    wasAdd: boolean,
    activeBefore: string,
    activeAfter: string,
    onChange: () => void,
  ) {
    this.insert = insert;
    this.remove = remove;
    this.setActiveId = setActiveId;
    this.layer = layer;
    this.index = index;
    this.wasAdd = wasAdd;
    this.activeBefore = activeBefore;
    this.activeAfter = activeAfter;
    this.onChange = onChange;
  }

  undo(): void {
    if (this.wasAdd) this.remove(this.layer.id);
    else this.insert(this.layer, this.index);
    this.setActiveId(this.activeBefore);
    this.onChange();
  }

  redo(): void {
    if (this.wasAdd) this.insert(this.layer, this.index);
    else this.remove(this.layer.id);
    this.setActiveId(this.activeAfter);
    this.onChange();
  }
}
