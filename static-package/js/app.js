import "./auth.js";

/* ========================================================================== 
   1. ELEMENTOS DA INTERFACE E CONFIGURAÇÕES GERAIS
   ========================================================================== */

const content = document.querySelector("#conteudo-interno");
const sidebar = document.querySelector("#sidebar");
const menuTrigger = document.querySelector("#menu-trigger");
const modalBackdrop = document.querySelector("#modal-backdrop");
const modalContent = document.querySelector("#modal-content");
const modalTitle = document.querySelector("#modal-title");
const toastRegion = document.querySelector("#toast-region");
const profileMenu = document.querySelector("#profile-menu");
const routes = [
  "painel",
  "doacoes",
  "coletas",
  "minhas-doacoes",
  "impacto",
  "reconhecimentos",
  "perfil",
];

const labels = {
  painel: "Painel",
  doacoes: "Doações disponíveis",
  coletas: "Minhas coletas",
  "minhas-doacoes": "Minhas doações",
  impacto: "Impacto",
  reconhecimentos: "Reconhecimentos",
  perfil: "Perfil",
};

const DATA_KEY = "ifeed_dados_v2";
const PROFILE_PREFIX = "ifeed_perfil_";
let user = null;
let data = null;
let profile = null;
let previousFocus = null;

const today = new Date();
const future = days => { const date = new Date(); date.setDate(date.getDate() + days); return date.toISOString().slice(0, 10); };

/* ========================================================================== 
   2. DADOS DEMONSTRATIVOS DO PROTÓTIPO
   Troque estes objetos quando quiser alterar os exemplos exibidos.
   ========================================================================== */

const seed = {
  available: [
    {id:"a1",name:"Pães variados",category:"Pães",amount:50,unit:"unidades",expires:future(3),company:"Padaria Boa Massa",distance:"900 m",storage:"Temperatura ambiente",time:"14h às 18h",status:"Disponível",address:"Centro — São Paulo, SP",description:"Pães frescos do dia, embalados e próprios para consumo.",views:31},
    {id:"a2",name:"Frutas variadas",category:"Frutas",amount:15,unit:"kg",expires:future(2),company:"Hortifruti Central",distance:"1,2 km",storage:"Refrigerado",time:"16h às 19h",status:"Disponível",address:"Bela Vista — São Paulo, SP",description:"Frutas maduras selecionadas para consumo imediato.",views:24},
    {id:"a3",name:"Marmitas prontas",category:"Refeições prontas",amount:30,unit:"porções",expires:future(1),company:"Restaurante Sabor do Dia",distance:"1,8 km",storage:"Refrigerado",time:"18h às 20h",status:"Disponível",address:"Consolação — São Paulo, SP",description:"Refeições completas preparadas hoje.",views:46},
    {id:"a4",name:"Verduras variadas",category:"Verduras",amount:10,unit:"kg",expires:future(4),company:"Supermercado Bom Preço",distance:"2,4 km",storage:"Refrigerado",time:"10h às 13h",status:"Disponível",address:"Liberdade — São Paulo, SP",description:"Folhas e legumes selecionados.",views:19}
  ],
  mine: [
    {id:"m1",name:"Cestas de hortaliças",category:"Verduras",amount:22,unit:"kg",expires:future(5),company:"Minha organização",distance:"—",storage:"Refrigerado",time:"15h às 18h",status:"Disponível",address:"São Paulo, SP",description:"Seleção de folhas e legumes.",views:38},
    {id:"m2",name:"Pães integrais",category:"Pães",amount:35,unit:"unidades",expires:future(2),company:"Minha organização",distance:"—",storage:"Temperatura ambiente",time:"17h às 19h",status:"Reservada",address:"São Paulo, SP",description:"Produção excedente do dia.",views:61}
  ],
  collections: [],
  activities: [
    {id:"h1",text:"Doação “Pães integrais” foi reservada",date:"Hoje, 10:32"},
    {id:"h2",text:"Seu impacto mensal foi atualizado",date:"Ontem, 16:18"},
    {id:"h3",text:"Você alcançou 72% do selo Prata",date:"25 jul, 09:10"}
  ]
};

/* ========================================================================== 
   3. UTILITÁRIOS, SEGURANÇA DE TEXTO E PERSISTÊNCIA LOCAL
   ========================================================================== */

const escapeHTML = value => String(value ?? "").replace(/[&<>'"]/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#039;",'"':"&quot;"}[char]));
const formatDate = value => new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR");
const save = () => localStorage.setItem(DATA_KEY, JSON.stringify(data));
const saveProfile = () => localStorage.setItem(PROFILE_PREFIX + user.uid, JSON.stringify(profile));
const addActivity = text => { data.activities.unshift({id:crypto.randomUUID(), text, date:"Agora"}); data.activities = data.activities.slice(0, 10); };
const metricCard = (icon, value, label) => `<article class="metric-card"><span class="metric-symbol">${icon}</span><strong>${value}</strong><small>${label}</small></article>`;
const header = (kicker, title, subtitle, action="") => `<header class="view-header"><div><span class="internal-kicker">${kicker}</span><h1>${title}</h1><p>${subtitle}</p></div>${action}</header>`;
const statusPill = status => `<span class="status-pill">${escapeHTML(status)}</span>`;
const empty = (text, action, label) => `<div class="empty-state"><div><h2>Nada por aqui ainda</h2><p>${escapeHTML(text)}</p><button class="primary-action" data-action="${action}">${escapeHTML(label)}</button></div></div>`;
const img = category => {
  const colors = {"Pães":"#dba75c","Frutas":"#f4a62a","Verduras":"#4caf50","Refeições prontas":"#f0c75e"};
  const color = colors[category] || "#16a34a";
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="260" height="180"><rect width="260" height="180" rx="24" fill="#eef7f0"/><circle cx="130" cy="82" r="55" fill="${color}" opacity=".22"/><path d="M73 112c29-67 88-67 114 0-27 29-87 31-114 0Z" fill="${color}"/><path d="M130 39c10 9 16 22 16 36-11-5-22-5-33 0 1-15 7-27 17-36Z" fill="#0b3b2e"/></svg>`)}`;
};

function toast(message, type="info") {
  const item = document.createElement("div"); item.className = "toast"; item.textContent = message; item.dataset.type = type;
  toastRegion.append(item); setTimeout(() => item.remove(), 3800);
}

function loadState() {
  const stored = localStorage.getItem(DATA_KEY);
  if (stored) { try { data = JSON.parse(stored); } catch { data = structuredClone(seed); } }
  else { data = structuredClone(seed); save(); }
  const storedProfile = localStorage.getItem(PROFILE_PREFIX + user.uid);
  if (storedProfile) profile = JSON.parse(storedProfile);
  else profile = { role:null, organization:"", document:"", phone:"", cep:"", address:"", city:"", state:"", description:"", notifications:true, publicImpact:true };
}

/* ========================================================================== 
   4. CÁLCULOS E TELAS DA ÁREA INTERNA
   Cada função abaixo renderiza uma opção do menu lateral.
   ========================================================================== */

function metrics() {
  const delivered = data.mine.filter(item => item.status === "Entregue");
  const kg = Math.round(delivered.reduce((sum,item) => sum + (item.unit === "kg" ? item.amount : item.amount * .35), 0) + 1250);
  return { kg, meals:kg*2, waste:Math.round(kg*.68), done:delivered.length+18, active:data.collections.filter(item=>item.status==="Reservada").length, institutions:12 };
}

function dashboard() {
  const m = metrics(); const first = escapeHTML(user.name.split(" ")[0]);
  const mainAction = profile.role === "recebedor" ? `<button class="primary-action" data-route="doacoes">⌖ Encontrar doações</button>` : `<button class="primary-action" data-action="new-donation">＋ Cadastrar nova doação</button>`;
  content.innerHTML = `${header("Visão geral",`Olá, ${first}!`,profile.role==="recebedor"?"Encontre alimentos e acompanhe as coletas da sua instituição.":"Veja o impacto que suas doações estão gerando na comunidade.",mainAction)}
  <div class="notice">Dados, distâncias, endereços e indicadores desta área são demonstrativos e ficam somente neste navegador.</div>
  <div class="metric-cards">${metricCard("♧",`${m.kg.toLocaleString("pt-BR")} kg`,"Alimentos doados*")}${metricCard("♨",m.meals.toLocaleString("pt-BR"),"Refeições estimadas*")}${metricCard("↗",`${m.waste.toLocaleString("pt-BR")} kg`,"Desperdício evitado*")}${metricCard("✓",m.done,"Doações realizadas*")}</div>
  <div class="dashboard-grid"><section class="content-card"><div class="card-head"><h2>Doações disponíveis próximas</h2><button class="text-action" data-route="doacoes">Ver todas →</button></div><div class="nearby-list">${data.available.slice(0,3).map(d=>`<div class="nearby-item"><img class="list-thumb" src="${img(d.category)}" alt=""><span class="list-copy"><strong>${escapeHTML(d.name)}</strong><small>${escapeHTML(d.company)} • ${d.distance}</small></span>${statusPill(d.status)}</div>`).join("")}</div></section>
  <aside class="content-card"><div class="card-head"><h2>Seu selo atual</h2><span>★</span></div><h3>Bronze · Primeiro impacto</h3><p>Continue participando para alcançar o selo Prata.</p><div class="progress-track"><span style="width:72%"></span></div><div class="progress-copy"><span>72% concluído</span><span>Próxima meta</span></div></aside></div>
  <div class="dashboard-grid"><section class="content-card"><div class="card-head"><h2>Evolução das doações</h2><small>kg demonstrativos</small></div><div class="mini-chart" role="img" aria-label="Março 35, abril 48, maio 64, junho 58, julho 82 e agosto 91 quilos"><span style="height:35%"></span><span style="height:48%"></span><span style="height:64%"></span><span style="height:58%"></span><span style="height:82%"></span><span style="height:91%"></span></div><div class="chart-labels"><span>Mar</span><span>Abr</span><span>Mai</span><span>Jun</span><span>Jul</span><span>Ago</span></div></section>
  <section class="content-card"><div class="card-head"><h2>Atividades recentes</h2></div><div class="activity-list">${data.activities.slice(0,4).map(a=>`<div class="activity-item"><span class="metric-symbol">✓</span><span class="list-copy"><strong>${escapeHTML(a.text)}</strong><small>${escapeHTML(a.date)} · demonstrativo</small></span></div>`).join("")}</div></section></div>`;
}

function donations() {
  content.innerHTML = `${header("Rede iFeed","Doações disponíveis","Encontre alimentos próprios para consumo perto da sua localização.")}
  <div class="toolbar"><input id="donation-search" placeholder="Buscar por alimento ou estabelecimento" aria-label="Buscar doações"><select id="category-filter" aria-label="Filtrar categoria"><option>Todas</option>${["Pães","Frutas","Verduras","Refeições prontas","Laticínios","Mercearia","Outros"].map(c=>`<option>${c}</option>`).join("")}</select><select id="sort-filter" aria-label="Ordenar"><option value="distance">Mais próximas</option><option value="expires">Validade mais próxima</option></select></div>
  <div class="donations-layout"><div><div class="donation-list" id="available-list"></div><div class="pagination"><button class="active">1</button><button disabled>2</button><button disabled>3</button></div></div><aside class="map-placeholder"><div class="map-pin"><span>⌖</span></div><h2>Mapa inteligente em evolução</h2><p>Mapa interativo será integrado com OpenStreetMap em uma próxima etapa.</p><small>A lista e os filtros funcionam normalmente.</small></aside></div>`;
  renderAvailable();
}

function renderAvailable() {
  const list = document.querySelector("#available-list"); if (!list) return;
  const query = document.querySelector("#donation-search")?.value.toLowerCase() || "";
  const category = document.querySelector("#category-filter")?.value || "Todas";
  const sort = document.querySelector("#sort-filter")?.value;
  let items = data.available.filter(d => (category === "Todas" || d.category === category) && `${d.name} ${d.company}`.toLowerCase().includes(query));
  if (sort === "expires") items.sort((a,b)=>a.expires.localeCompare(b.expires));
  list.innerHTML = items.length ? items.map(d=>`<article class="donation-card"><img src="${img(d.category)}" alt="Ilustração de ${escapeHTML(d.name)}"><div class="donation-info">${statusPill(d.status)}<h3>${escapeHTML(d.name)}</h3><div class="donation-meta"><span>${d.amount} ${d.unit}</span><span>Validade ${formatDate(d.expires)}</span><span>${escapeHTML(d.company)}</span><span>${d.distance}</span><span>${d.storage}</span><span>${d.time}</span></div><div class="donation-actions"><button class="secondary-action" data-action="details" data-id="${d.id}">Ver detalhes</button><button class="primary-action" data-action="reserve" data-id="${d.id}" ${d.status!=="Disponível"?"disabled":""}>${d.status==="Disponível"?"Reservar doação":d.status}</button></div></div></article>`).join("") : empty("Nenhuma doação encontrada com estes filtros.","clear-filters","Limpar filtros");
}

function collections(filter="Todas") {
  const items = data.collections.filter(item=>filter==="Todas"||item.status===filter);
  content.innerHTML = `${header("Acompanhamento","Minhas coletas","Acompanhe reservas e atualize cada etapa até a entrega.",`<button class="secondary-action" data-route="doacoes">⌖ Encontrar doações</button>`)}
  <div class="tabs">${["Todas","Reservada","Coletada","Entregue","Cancelada"].map(x=>`<button class="tab ${filter===x?"active":""}" data-action="collection-filter" data-filter="${x}">${x}</button>`).join("")}</div><div class="table-cards">${items.length?items.map(collectionCard).join(""):empty("Você ainda não possui coletas nesta categoria.","find-donations","Encontrar doações")}</div>`;
}

function collectionCard(c) {
  const order=["Reservada","Coletada","Entregue"], index=order.indexOf(c.status);
  return `<article class="collection-card"><div>${statusPill(c.status)}<h3>${escapeHTML(c.name)}</h3><p>${escapeHTML(c.amount)} · ${escapeHTML(c.company)}</p><p>${escapeHTML(c.address)} · ${escapeHTML(c.time)}</p><p>Responsável: ${escapeHTML(c.responsible)}</p></div><div class="timeline" aria-label="Status atual: ${c.status}">${order.map((x,i)=>`<span class="${i<=index?"done":""}">${x}</span>`).join("")}</div><div class="donation-actions">${c.status==="Reservada"?`<button class="primary-action" data-action="collection-next" data-next="Coletada" data-id="${c.id}">Confirmar coleta</button>`:""}${c.status==="Coletada"?`<button class="primary-action" data-action="collection-next" data-next="Entregue" data-id="${c.id}">Marcar entregue</button>`:""}${!["Entregue","Cancelada"].includes(c.status)?`<button class="danger-action" data-action="collection-next" data-next="Cancelada" data-id="${c.id}">Cancelar</button>`:""}</div></article>`;
}

function myDonations() {
  content.innerHTML = `${header("Gestão do doador","Minhas doações","Cadastre e acompanhe os alimentos que sua organização disponibiliza.",`<button class="primary-action" data-action="new-donation">＋ Cadastrar nova doação</button>`)}<div class="notice">Doações deste protótipo são demonstrativas e não representam oferta real de alimentos.</div><div class="my-donations">${data.mine.length?data.mine.map(d=>`<article class="content-card my-donation"><div class="my-donation-top"><div>${statusPill(d.status)}<h3>${escapeHTML(d.name)}</h3></div><strong>${d.amount} ${d.unit}</strong></div><p>Validade: ${formatDate(d.expires)} · ${d.storage}</p><p>${d.views} visualizações demonstrativas · ${d.status==="Reservada"?"1 reserva":"0 reservas"}</p><div class="donation-actions"><button class="secondary-action" data-action="edit-donation" data-id="${d.id}">Editar</button><button class="secondary-action" data-action="toggle-donation" data-id="${d.id}">${d.status==="Pausada"?"Ativar":"Pausar"}</button><button class="danger-action" data-action="delete-donation" data-id="${d.id}">Excluir</button></div></article>`).join(""):empty("Nenhuma doação cadastrada.","new-donation","Cadastrar agora")}</div>`;
}

function impact() {
  const m=metrics(); content.innerHTML=`${header("Transformação mensurável","Impacto social","Acompanhe resultados estimados gerados pela rede iFeed.")}<div class="tabs"><button class="tab active">Este mês</button><button class="tab">Últimos 3 meses</button><button class="tab">Este ano</button><button class="tab">Todo o período</button></div><div class="notice">Todos os indicadores são demonstrativos. Estimativa usada: aproximadamente 2 refeições por quilo de alimento aproveitado.</div><div class="metric-cards">${metricCard("♧",`${m.kg} kg`,"Alimentos doados")}${metricCard("♨",m.meals,"Refeições estimadas")}${metricCard("↗",`${m.waste} kg`,"Desperdício evitado")}${metricCard("⌂",m.institutions,"Instituições atendidas")}</div><div class="dashboard-grid"><section class="content-card"><div class="card-head"><h2>Evolução mensal</h2><strong>+18% vs. período anterior*</strong></div><div class="mini-chart" role="img" aria-label="Doações: março 35, abril 48, maio 64, junho 58, julho 82, agosto 91 quilos"><span style="height:35%"></span><span style="height:48%"></span><span style="height:64%"></span><span style="height:58%"></span><span style="height:82%"></span><span style="height:91%"></span></div><p>Alternativa textual: o volume cresceu de 35 kg em março para 91 kg em agosto, com pequena queda em junho.</p></section><section class="content-card"><div class="card-head"><h2>Distribuição por categoria</h2></div>${[["Pães",38],["Verduras",27],["Frutas",21],["Refeições",14]].map(([n,v])=>`<div class="impact-category"><div class="progress-copy"><span>${n}</span><strong>${v}%</strong></div><div class="progress-track"><span style="width:${v}%"></span></div></div>`).join("")}</section></div>`;
}

function recognitions() {
  const medal=(cls,name,text,detail,locked=false)=>`<article class="recognition-card ${locked?"locked":""}"><div class="medal ${cls}">${locked?"⌁":"★"}</div><h3>${name}</h3><strong>${text}</strong><p>${detail}</p><div class="progress-track"><span style="width:${locked&&name==="Prata"?72:locked?0:100}%"></span></div></article>`;
  content.innerHTML=`${header("Reconhecimento","Selos e certificados","Celebre cada etapa da sua jornada de impacto social.")}<div class="tabs"><button class="tab active">Selos</button><button class="tab">Certificados</button></div><div class="recognition-grid">${medal("bronze","Bronze","Primeiro impacto","Conquistado em 18/07/2026")}${medal("silver","Prata","Participação recorrente","72% da meta concluída",true)}${medal("gold","Ouro","Referência em solidariedade","Complete o selo Prata",true)}</div><section class="certificate-card content-card-spaced"><div><span class="internal-kicker">Certificado digital</span><h2>Empresa parceira no combate ao desperdício</h2><p>A geração oficial será implementada futuramente. Esta visualização não possui validade jurídica.</p><div class="donation-actions"><button class="secondary-action" data-action="certificate-view">Visualizar certificado</button><button class="secondary-action" data-action="certificate-download">Baixar (demonstração)</button></div></div><div class="certificate-preview">iFeed<br>Impacto</div></section>`;
}

function profileView() {
  content.innerHTML=`${header("Sua conta","Perfil","Mantenha seus dados e preferências atualizados.")}<div class="profile-hero"><span class="avatar">${user.photo?`<img src="${escapeHTML(user.photo)}" alt="Foto Google">`:escapeHTML(user.name[0])}</span><div><h2>${escapeHTML(user.name)}</h2><p>${escapeHTML(user.email)} · ${profile.role==="recebedor"?"Perfil recebedor":"Perfil doador"}</p></div></div><form class="content-card" id="profile-form"><div class="form-grid"><label class="field"><span>E-mail Google</span><input value="${escapeHTML(user.email)}" readonly></label><label class="field"><span>Tipo de participação</span><select name="role"><option value="doador" ${profile.role==="doador"?"selected":""}>Quero doar</option><option value="recebedor" ${profile.role==="recebedor"?"selected":""}>Quero receber</option></select></label>${field("organization","Nome da organização",profile.organization)}${field("document","CPF ou CNPJ (opcional e demonstrativo)",profile.document)}${field("phone","Telefone",profile.phone)}${field("cep","CEP",profile.cep,"inputmode=\"numeric\" maxlength=\"9\"")}${field("address","Endereço",profile.address)}${field("city","Cidade",profile.city)}${field("state","Estado",profile.state,"maxlength=\"2\"")}<label class="field full"><span>Descrição e áreas de atuação</span><textarea name="description">${escapeHTML(profile.description)}</textarea></label><label class="field full"><span><input name="notifications" type="checkbox" ${profile.notifications?"checked":""}> Receber notificações sobre reservas e coletas</span></label><label class="field full"><span><input name="publicImpact" type="checkbox" ${profile.publicImpact?"checked":""}> Tornar meu perfil de impacto visível</span></label></div><div class="form-actions"><button class="secondary-action" type="button" data-action="profile-cancel">Cancelar</button><button class="primary-action" type="submit">Salvar alterações</button></div></form><section class="content-card content-card-spaced"><h2>Privacidade e dados</h2><p>Este protótipo armazena preferências apenas no seu navegador. Não informe dados sensíveis ou reais. Em produção, dados e permissões precisarão de backend seguro.</p></section>`;
}

function field(name,label,value,attrs="") { return `<label class="field"><span>${label}</span><input name="${name}" value="${escapeHTML(value)}" ${attrs}></label>`; }
function donationForm(item={}) {
  const option=(value,current)=>`<option ${value===current?"selected":""}>${value}</option>`;
  const times = String(item.time || "").match(/(\d{2})[:h](\d{2})?.*?(\d{2})[:h](\d{2})?/);
  const startValue = times ? `${times[1]}:${times[2] || "00"}` : "14:00";
  const endValue = times ? `${times[3]}:${times[4] || "00"}` : "18:00";
  return `<form id="donation-form" data-id="${item.id||""}"><div class="form-grid">${field("name","Nome do alimento *",item.name||"","required")}
  <label class="field"><span>Categoria *</span><select name="category">${["Pães","Frutas","Verduras","Refeições prontas","Laticínios","Mercearia","Outros"].map(x=>option(x,item.category)).join("")}</select></label>
  ${field("amount","Quantidade *",item.amount||"","required type=\"number\" min=\"0.1\" step=\"0.1\"")}<label class="field"><span>Unidade *</span><select name="unit">${["kg","g","unidades","litros","caixas","porções"].map(x=>option(x,item.unit)).join("")}</select></label>
  ${field("expires","Data de validade *",item.expires||"",`required type="date" min="${today.toISOString().slice(0,10)}"`)}<label class="field"><span>Foto (até 2 MB)</span><input name="photo" type="file" accept="image/*"><small id="photo-help">Somente imagens JPEG, PNG ou WebP.</small></label>
  <label class="field"><span>Armazenamento *</span><select name="storage">${["Temperatura ambiente","Refrigerado","Congelado"].map(x=>option(x,item.storage)).join("")}</select></label>${field("cep","CEP *","","required inputmode=\"numeric\" maxlength=\"9\"")}
  ${field("start","Retirada — início *",startValue,"required type=\"time\"")}${field("end","Retirada — fim *",endValue,"required type=\"time\"")}${field("street","Logradouro *",item.address?.split(",")[0]||"","required")}${field("number","Número *","","required")}${field("complement","Complemento","")}${field("district","Bairro *","","required")}${field("city","Cidade *","São Paulo","required")}${field("state","Estado *","SP","required maxlength=\"2\"")}
  <label class="field full"><span>Descrição</span><textarea name="description">${escapeHTML(item.description||"")}</textarea></label><label class="field full"><span><input name="safe" type="checkbox" ${item.id?"checked":""} required> Confirmo que o alimento está próprio para consumo *</span><small>A responsabilidade pela verificação permanece com doador e recebedor.</small></label><div id="form-error" class="validation-message field full" role="alert"></div></div><div class="form-actions"><button class="secondary-action" type="button" data-action="close-modal">Cancelar</button><button class="primary-action" type="submit">Salvar doação</button></div></form>`;
}

/* ========================================================================== 
   5. ROTEAMENTO POR HASH E JANELAS MODAIS
   ========================================================================== */

function render() {
  if (!user) return; const route = routes.includes(location.hash.slice(1)) ? location.hash.slice(1) : "painel";
  document.title = `${labels[route]} | iFeed`; document.querySelectorAll("[data-route]").forEach(el=>el.classList.toggle("active",el.dataset.route===route));
  ({painel:dashboard,doacoes:donations,coletas:()=>collections(),"minhas-doacoes":myDonations,impacto,recogncimentos:recognitions,reconhecimentos:recognitions,perfil:profileView}[route] || dashboard)();
  content.focus({preventScroll:true}); sidebar.classList.remove("open"); menuTrigger.setAttribute("aria-expanded","false");
}

function openModal(title, html) { previousFocus=document.activeElement; modalTitle.textContent=title; modalContent.innerHTML=html; modalBackdrop.classList.remove("hidden"); document.body.style.overflow="hidden"; requestAnimationFrame(()=>modalBackdrop.querySelector("button,input,select")?.focus()); }
function closeModal() { modalBackdrop.classList.add("hidden"); modalContent.innerHTML=""; document.body.style.overflow=""; previousFocus?.focus(); }
function confirmModal(message, confirmLabel, callback) { openModal("Confirmação",`<p>${escapeHTML(message)}</p><div class="form-actions"><button class="secondary-action" data-action="close-modal">Cancelar</button><button class="danger-action" id="confirm-action">${escapeHTML(confirmLabel)}</button></div>`); document.querySelector("#confirm-action").addEventListener("click",()=>{closeModal();callback();}); }

function reserve(id) {
  const donation=data.available.find(item=>item.id===id); if(!donation||donation.status!=="Disponível"){toast("Esta doação não está mais disponível.","error");return;}
  confirmModal(`Deseja reservar “${donation.name}”?`,"Confirmar reserva",()=>{ donation.status="Reservada"; data.collections.unshift({id:crypto.randomUUID(),donationId:id,name:donation.name,amount:`${donation.amount} ${donation.unit}`,company:donation.company,address:donation.address,time:donation.time,responsible:profile.organization||user.name,status:"Reservada"}); addActivity(`Você reservou “${donation.name}”`); save(); toast("Doação reservada e adicionada às suas coletas.","success"); render(); });
}

async function lookupCep(input, form) {
  const clean=input.value.replace(/\D/g,""); if(clean.length!==8){toast("Digite um CEP com oito números.","error");return;}
  input.disabled=true; toast("Buscando endereço pelo ViaCEP…");
  try { const response=await fetch(`https://viacep.com.br/ws/${clean}/json/`); const address=await response.json(); if(address.erro)throw new Error(); [["street",address.logradouro],["district",address.bairro],["city",address.localidade],["state",address.uf]].forEach(([name,value])=>{const field=form.elements[name];if(field&&value)field.value=value;}); toast("Endereço preenchido. Você pode corrigir manualmente.","success"); }
  catch { toast("Não foi possível consultar o CEP agora. Preencha manualmente.","error"); } finally { input.disabled=false; }
}

/* ========================================================================== 
   6. FORMULÁRIOS E AÇÕES DE NEGÓCIO DO PROTÓTIPO
   ========================================================================== */

function handleDonationSubmit(form) {
  const fd=new FormData(form), amount=Number(fd.get("amount")), expires=String(fd.get("expires")), start=String(fd.get("start")), end=String(fd.get("end")), file=fd.get("photo");
  const error=document.querySelector("#form-error"); let message="";
  if(!amount||amount<=0)message="Informe uma quantidade maior que zero."; else if(new Date(`${expires}T23:59:59`)<today)message="A validade não pode estar no passado."; else if(end<=start)message="O horário final deve ser posterior ao inicial."; else if(String(fd.get("cep")).replace(/\D/g,"").length!==8)message="O CEP deve possuir oito números."; else if(file?.size>2*1024*1024)message="A imagem deve ter no máximo 2 MB."; else if(file?.size&& !file.type.startsWith("image/"))message="O arquivo selecionado precisa ser uma imagem."; else if(!fd.get("safe"))message="Confirme que o alimento está próprio para consumo.";
  if(message){error.textContent=message;error.focus();return;}
  const id=form.dataset.id||crypto.randomUUID(), previous=data.mine.find(item=>item.id===id);
  const item={id,name:escapeHTML(fd.get("name")),category:String(fd.get("category")),amount,unit:String(fd.get("unit")),expires,company:profile.organization||"Minha organização",distance:"—",storage:String(fd.get("storage")),time:`${start} às ${end}`,status:previous?.status||"Disponível",address:escapeHTML(`${fd.get("street")}, ${fd.get("number")} — ${fd.get("city")}, ${fd.get("state")}`),description:escapeHTML(fd.get("description")),views:previous?.views||0};
  data.mine=previous?data.mine.map(current=>current.id===id?item:current):[item,...data.mine]; addActivity(`Doação “${item.name}” foi salva`); save(); closeModal(); toast("Doação salva no protótipo.","success"); myDonations();
}

/* ========================================================================== 
   7. EVENTOS GLOBAIS DA INTERFACE
   ========================================================================== */

document.addEventListener("click", event => {
  const button=event.target.closest("button,[data-route]"); if(!button)return;
  if(button.dataset.route){location.hash=button.dataset.route;profileMenu.classList.add("hidden");return;}
  const action=button.dataset.action,id=button.dataset.id;
  if(action==="logout")confirmModal("Deseja realmente sair da sua conta?","Sair",async()=>{try{await window.ifeedLogout();}catch{toast("Não foi possível sair agora.","error");}});
  if(action==="notifications")toast("Você tem 3 notificações demonstrativas.");
  if(action==="details"){const d=data.available.find(x=>x.id===id);openModal(d.name,`<img class="modal-donation-image" src="${img(d.category)}" alt="Ilustração da doação"><h3>${d.amount} ${d.unit} · ${escapeHTML(d.company)}</h3><p>${escapeHTML(d.description)}</p><p><strong>Retirada:</strong> ${d.time}<br><strong>Armazenamento:</strong> ${d.storage}<br><strong>Endereço aproximado:</strong> ${escapeHTML(d.address)}</p><div class="notice">Leve identificação e recipiente adequado. Confirme as condições do alimento na coleta.</div><button class="primary-action" data-action="reserve" data-id="${d.id}" ${d.status!=="Disponível"?"disabled":""}>${d.status==="Disponível"?"Reservar doação":d.status}</button>`);}
  if(action==="reserve"){closeModal();reserve(id);}
  if(action==="new-donation")openModal("Cadastrar nova doação",donationForm());
  if(action==="edit-donation"){const item=data.mine.find(x=>x.id===id);openModal("Editar doação",donationForm(item));}
  if(action==="toggle-donation"){const item=data.mine.find(x=>x.id===id);item.status=item.status==="Pausada"?"Disponível":"Pausada";save();toast("Status atualizado.","success");myDonations();}
  if(action==="delete-donation")confirmModal("Excluir esta doação? Essa ação não pode ser desfeita no protótipo.","Excluir",()=>{data.mine=data.mine.filter(x=>x.id!==id);save();toast("Doação excluída.");myDonations();});
  if(action==="collection-filter")collections(button.dataset.filter);
  if(action==="collection-next")confirmModal(`Atualizar a coleta para “${button.dataset.next}”?`,"Confirmar",()=>{const item=data.collections.find(x=>x.id===id);item.status=button.dataset.next;const donation=data.available.find(x=>x.id===item.donationId);if(donation)donation.status=item.status;addActivity(`Coleta atualizada para “${item.status}”`);save();toast("Status da coleta atualizado.","success");collections();});
  if(action==="find-donations"){location.hash="doacoes";}
  if(action==="clear-filters"){document.querySelector("#donation-search").value="";document.querySelector("#category-filter").value="Todas";renderAvailable();}
  if(action==="close-modal")closeModal();
  if(action==="profile-cancel"){profile=JSON.parse(localStorage.getItem(PROFILE_PREFIX+user.uid));profileView();toast("Alterações descartadas.");}
  if(action==="certificate-view")toast("Visualização demonstrativa; sem validade jurídica.");
  if(action==="certificate-download")toast("A geração oficial será implementada futuramente.");
});

document.addEventListener("input", event => { if(["donation-search","category-filter","sort-filter"].includes(event.target.id))renderAvailable(); });
document.addEventListener("change", event => { if(["category-filter","sort-filter"].includes(event.target.id))renderAvailable(); });
document.addEventListener("blur", event => { if(event.target.name==="cep"){const form=event.target.closest("form");lookupCep(event.target,form);}},true);
document.addEventListener("submit", event => {
  event.preventDefault();
  if(event.target.id==="donation-form")handleDonationSubmit(event.target);
  if(event.target.id==="profile-form"){const fd=new FormData(event.target);profile={role:String(fd.get("role")),organization:escapeHTML(fd.get("organization")),document:escapeHTML(fd.get("document")),phone:escapeHTML(fd.get("phone")),cep:escapeHTML(fd.get("cep")),address:escapeHTML(fd.get("address")),city:escapeHTML(fd.get("city")),state:escapeHTML(fd.get("state")),description:escapeHTML(fd.get("description")),notifications:Boolean(fd.get("notifications")),publicImpact:Boolean(fd.get("publicImpact"))};saveProfile();toast("Perfil salvo com sucesso.","success");updateUserUI();}
});

menuTrigger.addEventListener("click",()=>{const open=sidebar.classList.toggle("open");menuTrigger.setAttribute("aria-expanded",String(open));});
document.querySelector("#user-chip").addEventListener("click",()=>{profileMenu.classList.toggle("hidden");});
document.querySelector("#modal-close").addEventListener("click",closeModal);
modalBackdrop.addEventListener("mousedown",event=>{if(event.target===modalBackdrop)closeModal();});
document.querySelector("#location-field").addEventListener("keydown",event=>{if(event.key==="Enter"){event.preventDefault();toast("Localização demonstrativa atualizada.");}});
document.addEventListener("keydown",event=>{
  if(event.key==="Escape"){if(!modalBackdrop.classList.contains("hidden"))closeModal();else sidebar.classList.remove("open");}
  if(event.key==="Tab"&&!modalBackdrop.classList.contains("hidden")){const focusable=[...modalBackdrop.querySelectorAll("button,input,select,textarea,a[href]")].filter(el=>!el.disabled);const first=focusable[0],last=focusable.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}
});
window.addEventListener("hashchange",render);

/* ========================================================================== 
   8. USUÁRIO AUTENTICADO E INICIALIZAÇÃO
   ========================================================================== */

function updateUserUI(){document.querySelector("#top-name").textContent=user.name;document.querySelector("#top-role").textContent=profile.role||"novo perfil";const avatar=document.querySelector("#top-avatar");avatar.innerHTML=user.photo?`<img src="${escapeHTML(user.photo)}" alt="Foto Google">`:escapeHTML(user.name[0]);}
function askRole(){const suggested=sessionStorage.getItem("ifeed_perfil_sugerido")||"doador";openModal("Como você quer participar da rede iFeed?",`<div class="role-options"><button class="role-option ${suggested==="doador"?"selected":""}" data-role="doador"><strong>Quero doar</strong><small>Restaurante, padaria, mercado, hortifruti, lanchonete ou pessoa física.</small></button><button class="role-option ${suggested==="recebedor"?"selected":""}" data-role="recebedor"><strong>Quero receber</strong><small>ONG, banco de alimentos, projeto social, instituição ou voluntário.</small></button></div><p class="privacy-note">Você poderá alterar esta escolha na página Perfil.</p>`);document.querySelectorAll("[data-role]").forEach(button=>button.addEventListener("click",()=>{profile.role=button.dataset.role;saveProfile();closeModal();updateUserUI();render();toast("Perfil configurado com sucesso.","success");}));}

window.addEventListener("ifeed-auth-ready", event => { user=event.detail;loadState();updateUserUI();if(!profile.role)askRole();render(); });
