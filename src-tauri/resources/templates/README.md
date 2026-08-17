Cada template embutido = um PNG nesta pasta + uma entrada em `manifest.json`:

```json
[
  { "id": "grass_block_base", "file": "grass_block_base.png" },
  { "id": "sword_base", "file": "sword_base.png" }
]
```

- `id`: usada como chave nos comandos (`get_template_pixels`, etc) e, no
  frontend, como chave de traducao (`i18n` -> `templates.<id>`, a ser
  criado na Etapa 2).
- `file`: nome do PNG nesta mesma pasta.

Resolucao de cada template = a dimensao real do PNG (nao precisa declarar
no manifest, o backend le direto do arquivo).
