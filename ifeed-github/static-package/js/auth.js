import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged,
  signOut, setPersistence, browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { firebaseConfig, firebaseConfigurado } from "./firebase-config.js";

const isLogin = location.pathname.endsWith("login.html") || location.pathname.endsWith("/");
const isApp = location.pathname.endsWith("app.html");
const loginButton = document.querySelector("#google-login");
const loading = document.querySelector("#login-loading");
const errorBox = document.querySelector("#login-error");
const roleParam = new URLSearchParams(location.search).get("perfil");

if (roleParam === "doador" || roleParam === "recebedor") {
  sessionStorage.setItem("ifeed_perfil_sugerido", roleParam);
  const suggestion = document.querySelector("#perfil-sugerido");
  if (suggestion) {
    suggestion.textContent = `Perfil sugerido: ${roleParam === "doador" ? "Quero doar" : "Quero receber"}. Você poderá confirmar após entrar.`;
    suggestion.classList.remove("hidden");
  }
}

function friendlyError(error) {
  const messages = {
    "auth/popup-closed-by-user": "O acesso foi cancelado antes de terminar. Tente novamente quando quiser.",
    "auth/popup-blocked": "O navegador bloqueou a janela do Google. Permita popups para este endereço e tente novamente.",
    "auth/network-request-failed": "Não foi possível conectar ao Google. Verifique sua internet e tente novamente.",
    "auth/unauthorized-domain": "Este endereço ainda não foi autorizado no Firebase. Adicione localhost em Authentication > Settings > Authorized domains.",
    "auth/operation-not-allowed": "O provedor Google ainda não foi ativado no Firebase Authentication.",
  };
  return messages[error?.code] || "Não foi possível entrar agora. Revise a configuração do Firebase e tente novamente.";
}

function showError(message) {
  if (!errorBox) return;
  errorBox.textContent = message;
  errorBox.focus?.();
}

if (!firebaseConfigurado) {
  if (loginButton) loginButton.addEventListener("click", () => showError("O Firebase ainda não foi configurado. Abra js/firebase-config.js, cole a configuração pública do seu aplicativo Web e recarregue esta página."));
  if (isApp) location.replace("login.html?erro=configuracao");
} else {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  await setPersistence(auth, browserLocalPersistence);

  if (isLogin) {
    onAuthStateChanged(auth, user => { if (user) location.replace("app.html#painel"); });
    loginButton?.addEventListener("click", async () => {
      loginButton.disabled = true; loading?.classList.remove("hidden"); showError("");
      try { await signInWithPopup(auth, provider); location.replace("app.html#painel"); }
      catch (error) { showError(friendlyError(error)); }
      finally { loginButton.disabled = false; loading?.classList.add("hidden"); }
    });
  }

  if (isApp) {
    onAuthStateChanged(auth, user => {
      if (!user) { location.replace("login.html?erro=sessao"); return; }
      window.dispatchEvent(new CustomEvent("ifeed-auth-ready", { detail: { uid:user.uid, name:user.displayName || "Usuário iFeed", email:user.email || "", photo:user.photoURL || "" } }));
    });
  }

  window.ifeedLogout = async () => { await signOut(auth); location.replace("login.html"); };
}
