# iFeed — protótipo front-end organizado

O iFeed é uma plataforma de impacto social que aproxima doadores de alimentos de ONGs, bancos de alimentos, projetos sociais e voluntários. Este pacote contém a versão front-end do projeto, organizada para estudo, apresentação e evolução posterior para Django.

## Estado atual

- Home e três páginas públicas interligadas.
- Login Google preparado com Firebase Authentication.
- Área interna responsiva com Painel, Doações disponíveis, Minhas coletas, Minhas doações, Impacto, Reconhecimentos e Perfil.
- Consulta de endereço com ViaCEP.
- Dados demonstrativos salvos no `localStorage` do navegador.
- HTML, CSS e JavaScript separados e comentados por responsabilidade.

> Importante: este pacote ainda não contém um projeto Django. Não existem `manage.py`, `settings.py`, models, views nem banco de dados. O documento `docs/TRANSICAO-PARA-DJANGO.md` mostra o caminho recomendado para essa etapa.

## Como executar

1. Abra esta pasta no VS Code.
2. Instale a extensão **Live Server**.
3. Abra `index.html` com **Open with Live Server**.
4. Não execute com `file://`, pois os módulos JavaScript e o Firebase precisam de um servidor HTTP.

Também é possível usar:

```bash
python -m http.server 8000
```

Depois, acesse `http://localhost:8000`.

## Estrutura

```text
IFEED-SUPREMO-ORGANIZADO-E-DOCUMENTADO/
├── index.html                    # Home
├── como-funciona.html            # Jornada da doação
├── impacto.html                  # Impacto social e ambiental
├── quem-somos.html               # Propósito, missão, visão e valores
├── login.html                    # Entrada com Google
├── app.html                      # Estrutura da área interna
├── assets/img/                   # Logo, imagens e avatar
├── css/
│   ├── home.css                  # Estilos exclusivos da Home
│   ├── paginas-publicas.css      # Estilos das três páginas editoriais
│   └── interno.css               # Login e área interna
├── js/
│   ├── paginas-publicas.js       # Menu móvel e animações públicas
│   ├── auth.js                   # Login, sessão e logout
│   ├── firebase-config.js        # Configuração pública do Firebase
│   ├── firebase-config.example.js
│   └── app.js                    # Rotas e funcionalidades do protótipo
└── docs/
    ├── GUIA-DE-ALTERACOES.md
    ├── RELATORIO-DA-ORGANIZACAO.md
    ├── TEXTOS-PAGINAS-PUBLICAS.md
    └── TRANSICAO-PARA-DJANGO.md
```

## Antes de editar

- Consulte `docs/GUIA-DE-ALTERACOES.md` para saber o arquivo e a classe corretos.
- Não remova atributos como `id`, `data-route`, `data-action`, `name` ou `aria-*` sem verificar o JavaScript.
- Valores de impacto, doações, endereços e selos são exemplos, não resultados reais.
- Não coloque senhas, chaves de serviço ou credenciais privadas no repositório.

## Configurar o Firebase

1. Crie um aplicativo Web no Console do Firebase.
2. Ative **Authentication > Sign-in method > Google**.
3. Confirme `localhost` em **Authorized domains**.
4. Copie somente o objeto público `firebaseConfig`.
5. Substitua os placeholders de `js/firebase-config.js`.

As chaves do aplicativo Web identificam o projeto, mas não substituem regras de segurança. Produção exige validação no servidor e autorização por usuário.

## Teste rápido

- Navegue entre Home, Como funciona, Impacto e Quem somos.
- Teste o menu móvel em largura pequena.
- Configure o Firebase e entre com Google.
- Abra cada item do menu interno.
- Filtre e reserve uma doação.
- Cadastre e edite uma doação.
- Consulte um CEP válido.
- Atualize o perfil e recarregue a página.
- Saia da conta.

## Limitações do protótipo

O `localStorage` é apenas uma simulação. Banco de dados, permissões, upload seguro, auditoria, certificados, mapas, notificações, validações sanitárias e conformidade com a LGPD deverão ser tratados no backend Django.
