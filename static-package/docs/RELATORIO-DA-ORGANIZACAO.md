# Relatório da organização realizada

## Problemas encontrados

- A Home misturava HTML, aproximadamente 400 linhas de CSS e JavaScript no mesmo arquivo.
- O final da Home continha scripts do exportador Vinext/RSC sem utilidade no projeto estático.
- Páginas públicas inteiras estavam comprimidas em aproximadamente 13 a 20 linhas.
- Os CSS compartilhados tinham várias regras minificadas na mesma linha.
- A área interna concentrava toda a lógica em um arquivo sem mapa de responsabilidades.
- O guia existente misturava execução, configuração, limitações e testes em um único texto.
- A Home ainda dizia que o login Google seria feito no futuro, embora a estrutura Firebase já existisse.

## O que foi alterado

- `index.html` passou a conter somente estrutura e conteúdo.
- O CSS da Home foi movido para `css/home.css`.
- A navegação passou a usar links reais diretamente no HTML.
- Resíduos Vinext/RSC e o remendo JavaScript de links foram removidos.
- Todas as páginas HTML foram indentadas e tornadas legíveis.
- Os CSS foram expandidos, agrupados e comentados por seção.
- `js/app.js` recebeu oito divisões claras de responsabilidade.
- Estilos fixos em linha foram substituídos por classes sempre que adequado; percentuais dinâmicos dos gráficos foram mantidos.
- Os textos sobre o acesso Google foram atualizados para o estado atual do protótipo.
- Foi criado um README principal e documentação separada por objetivo.

## O que foi preservado

- Identidade visual, cores, composição e responsividade.
- Logo e imagens existentes.
- Login Google com Firebase.
- Rotas internas por hash.
- Cadastro, edição, pausa e exclusão demonstrativa de doações.
- Filtros, reserva, coletas, impacto, reconhecimentos e perfil.
- ViaCEP e persistência local.
- Textos alternativos e atributos de acessibilidade.

## Validações executadas

- Sintaxe de todos os arquivos JavaScript com `node --check`.
- Existência dos destinos de links e arquivos estáticos.
- Ausência de IDs duplicados nas páginas estáticas.
- Presença de `lang`, `title`, `main` e texto alternativo nas imagens.
- Equilíbrio de blocos nos três arquivos CSS.
- Ausência de resíduos Vinext/RSC.
- Resposta HTTP 200 para páginas, CSS e JavaScript em servidor local.

`app.html` recebe o `h1` dinamicamente por `js/app.js`, por isso ele não aparece na estrutura HTML inicial.

## Observação arquitetural

Esta organização melhora o front-end existente, mas não transforma o protótipo em Django. A migração recomendada, incluindo templates, models, permissões e banco de dados, está documentada separadamente em `TRANSICAO-PARA-DJANGO.md`.
