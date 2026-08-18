# Transição recomendada para Django

O pacote atual é front-end estático. A evolução profissional deve manter HTML, CSS e JavaScript na interface e transferir identidade, dados, permissões e regras de negócio para Django.

## Estrutura sugerida

```text
ifeed/
├── manage.py
├── config/                  # settings, urls, wsgi/asgi
├── core/                    # Home e páginas públicas
├── accounts/                # Login, perfis e permissões
├── donations/               # Doações, reservas e coletas
├── impact/                  # Métricas, selos e certificados
├── templates/
│   ├── base.html
│   ├── public/
│   └── dashboard/
├── static/
│   ├── css/
│   ├── js/
│   └── img/
└── media/                   # uploads controlados pelo Django
```

## Conversão das páginas

| Atual | Django recomendado |
|---|---|
| `index.html` | `templates/public/home.html` |
| `como-funciona.html` | `templates/public/como_funciona.html` |
| `impacto.html` | `templates/public/impacto.html` |
| `quem-somos.html` | `templates/public/quem_somos.html` |
| `login.html` | `templates/accounts/login.html` |
| `app.html` | `templates/dashboard/base_dashboard.html` |
| `assets/`, `css/`, `js/` | pasta `static/` |

Crie `base.html` para cabeçalho, navegação e rodapé. As páginas públicas devem usar `{% extends "base.html" %}` e blocos de conteúdo. Isso elimina repetição e permite alterar o menu uma única vez.

## Models iniciais

- `Profile`: tipo de participação, organização, telefone, endereço e preferências.
- `Donation`: alimento, categoria, quantidade, unidade, validade, armazenamento, retirada, endereço, foto, status e doador.
- `Reservation`: doação, instituição/voluntário, status, horários e responsáveis.
- `CollectionEvent`: histórico das mudanças de status.
- `Recognition`: selo, critérios e data da conquista.

## Responsabilidades do backend

- Autenticar usuários e validar sessão.
- Autorizar doadores e recebedores por ação.
- Validar e gravar dados no banco.
- Impedir reserva duplicada com transação.
- Fazer upload seguro de imagens.
- Gerar métricas somente a partir de entregas concluídas.
- Manter histórico e auditoria.
- Proteger dados pessoais e aplicar regras de retenção.

## Google no Django

Escolha uma única estratégia:

1. Django gerencia autenticação social com pacote apropriado; ou
2. Firebase autentica no navegador e o Django valida o ID Token em cada sessão/API.

Não considere o usuário autenticado apenas porque o JavaScript recebeu dados do Google. O servidor deve validar o token e associá-lo a um usuário local.

## Ordem segura de implementação

1. Criar projeto Django e apps.
2. Migrar páginas públicas para templates.
3. Criar `base.html` e componentes compartilhados.
4. Configurar usuários e perfis.
5. Criar models e migrations de doações/reservas.
6. Substituir `localStorage` por views, forms e banco de dados.
7. Implementar upload e permissões.
8. Adicionar métricas, selos e certificados.
9. Integrar mapa e notificações.
10. Criar testes automatizados e revisar LGPD/segurança.

