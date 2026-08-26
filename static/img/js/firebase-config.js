// CONFIGURAÇÃO PÚBLICA DO SEU APLICATIVO WEB FIREBASE.
// Substitua os placeholders pelos dados exibidos em Configurações do projeto > Seus apps.
// Esta configuração não é uma senha, mas regras de segurança continuam indispensáveis em produção.
export const firebaseConfig = {
  apiKey: "COLE_SUA_API_KEY",
  authDomain: "SEU_PROJETO.firebaseapp.com",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_PROJETO.appspot.com",
  messagingSenderId: "SEU_MESSAGING_SENDER_ID",
  appId: "SEU_APP_ID"
};

export const firebaseConfigurado = !Object.values(firebaseConfig).some(valor => valor.includes("COLE_") || valor.includes("SEU_"));
