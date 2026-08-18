# Guia simples de alterações — iFeed

Este guia mostra **onde editar** cada parte sem precisar procurar pelo projeto inteiro.

## Atalhos mais usados

| Quero alterar | Arquivo principal | O que procurar |
|---|---|---|
| Texto e seções da Home | `index.html` | `hero`, `impact-band`, `problem-section`, `steps-section` |
| Aparência da Home | `css/home.css` | comentários numerados de 1 a 13 |
| Como funciona | `como-funciona.html` | `public-hero`, `journey`, `network-story` |
| Impacto | `impacto.html` | `impact-ledger`, `impact-ribbon`, `calculation-flow` |
| Quem somos | `quem-somos.html` | `story-line`, `purpose-banner`, `identity-stack` |
| Aparência das páginas públicas | `css/paginas-publicas.css` | comentários numerados de 1 a 10 |
| Login e área interna | `login.html`, `app.html` | estruturas sem conteúdo dinâmico |
| Aparência interna | `css/interno.css` | comentários numerados de 1 a 8 |
| Dados de exemplo | `js/app.js` | seção `2. DADOS DEMONSTRATIVOS` e objeto `seed` |
| Telas internas | `js/app.js` | funções `dashboard`, `donations`, `collections`, `impact` etc. |
| Login Google | `js/auth.js` | seção `AUTENTICAÇÃO GOOGLE COM FIREBASE` |
| Configuração Firebase | `js/firebase-config.js` | objeto `firebaseConfig` |

## 1. Alterar logo e imagens

As imagens estão em `assets/img/`.

- Logo: `assets/img/logo-ifeed.png`
- Caixa de alimentos: `assets/img/caixa-alimentos.png`
- Avatar padrão: `assets/img/avatar-padrao.png`

Para trocar um arquivo sem editar o HTML, mantenha o mesmo nome e formato. Para usar outro nome, altere também o atributo `src` correspondente.

### Substituir um espaço reservado por fotografia

Nas páginas públicas, procure `media-placeholder`. Substitua o elemento `<figure>` completo por:

```html
<figure class="content-image">
  <img
    src="assets/img/nome-da-foto.jpg"
    alt="Descrição objetiva do que aparece na fotografia"
  >
  <figcaption>Legenda opcional e fonte da imagem.</figcaption>
</figure>
```

Evite colocar texto dentro da própria imagem. Use imagens comprimidas em WebP ou JPG e mantenha o texto alternativo.

## 2. Alterar cores, fontes e proporções

As cores da Home ficam no início de `css/home.css`, dentro de `:root`. As páginas públicas usam o `:root` de `css/paginas-publicas.css`. Login e área interna usam variáveis iniciadas por `--i-` em `css/interno.css`.

Exemplo:

```css
:root {
  --green: #16a34a;
  --green-dark: #0b3b2e;
  --yellow: #ffc83d;
  --blue: #123c95;
}
```

As fontes são importadas na primeira linha de cada CSS. Poppins é usada em títulos; Inter, nos textos e controles.

## 3. Alterar textos públicos

Edite o texto diretamente no HTML da página desejada. Para revisar o conteúdo sem navegar pelo código, use `docs/TEXTOS-PAGINAS-PUBLICAS.md` como roteiro editorial.

Ao modificar um título:

- preserve a hierarquia `h1`, `h2`, `h3`;
- mantenha apenas um `h1` por página;
- não remova o `id` quando ele estiver ligado por `aria-labelledby`;
- mantenha números demonstrativos acompanhados de aviso.

## 4. Alterar links e menu

Os links públicos usam caminhos relativos:

```text
index.html
como-funciona.html
impacto.html
quem-somos.html
login.html
```

O menu aparece no cabeçalho e no rodapé de cada página. Ao acrescentar uma página, atualize os dois locais e a navegação móvel.

## 5. Alterar a Home

Em `index.html`, as seções estão na seguinte ordem:

1. `hero` — frase principal e botões.
2. `impact-band` — indicadores demonstrativos.
3. `problem-section` — dor que o projeto resolve.
4. `steps-section` — resumo do funcionamento.
5. `features-section` — funcionalidades.
6. `audience-section` — doadores e recebedores.
7. `social-section` — transformação esperada.
8. `final-cta` — chamada para login.

O visual correspondente está em `css/home.css`, com a mesma ordem e comentários numerados.

## 6. Alterar as telas internas

`app.html` contém apenas a estrutura fixa: menu, topo, área de conteúdo, modal e notificações. As telas são renderizadas por funções de `js/app.js`:

| Menu | Função JavaScript |
|---|---|
| Painel | `dashboard()` |
| Doações disponíveis | `donations()` e `renderAvailable()` |
| Minhas coletas | `collections()` e `collectionCard()` |
| Minhas doações | `myDonations()` |
| Impacto | `impact()` |
| Reconhecimentos | `recognitions()` |
| Perfil | `profileView()` |

Para alterar somente um texto, procure a frase dentro da função correta. Para mudar a estrutura, edite o template HTML entre crases com cuidado.

Não renomeie `data-route` ou `data-action` sem atualizar os eventos no fim de `app.js`.

## 7. Alterar dados demonstrativos

No início de `js/app.js`, o objeto `seed` contém:

- `available`: doações disponíveis;
- `mine`: doações do usuário;
- `collections`: coletas;
- `activities`: histórico recente.

Depois de alterar o `seed`, limpe os dados antigos do navegador:

1. Abra as Ferramentas do Desenvolvedor.
2. Vá em **Application > Local Storage**.
3. Exclua `ifeed_dados_v2` e as chaves iniciadas por `ifeed_perfil_`.
4. Recarregue a página.

## 8. Alterar cálculos de impacto

A função `metrics()` de `js/app.js` calcula os indicadores demonstrativos. Atualmente ela usa valores iniciais de exemplo e aproximadamente duas refeições por quilo.

Quando o Django for integrado, esse cálculo deve sair do navegador e ser feito no servidor a partir de doações realmente entregues.

## 9. Login Google e Firebase

- `js/firebase-config.js`: valores públicos do aplicativo Web.
- `js/auth.js`: login, persistência da sessão, proteção de `app.html` e logout.

Nunca coloque no front-end:

- senha de usuário;
- chave privada;
- arquivo de conta de serviço;
- token administrativo;
- `client_secret`.

## 10. Regras para trabalho em equipe

Antes de começar:

```bash
git switch main
git pull origin main
git switch -c nome-da-pessoa/tarefa-curta
```

Depois de testar:

```bash
git add .
git commit -m "Organiza página de impacto"
git push -u origin nome-da-pessoa/tarefa-curta
```

Cada colega trabalha em uma branch e abre um Pull Request. Evitem editar o mesmo arquivo grande ao mesmo tempo, principalmente `js/app.js` e os CSS compartilhados.

