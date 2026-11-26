import { createRoot } from "react-dom/client";
import { datadogRum } from "@datadog/browser-rum";
import App from "./App.tsx";
import "./index.css";

// Datadog RUM: só inicializa quando as duas variáveis estão definidas.
const ddAppId = import.meta.env.VITE_DD_APP_ID;
const ddClientToken = import.meta.env.VITE_DD_CLIENT_TOKEN;
if (ddAppId && ddClientToken) {
  try {
  datadogRum.init({
    applicationId: ddAppId,
    clientToken: ddClientToken,
    site: "datadoghq.com",
    service: "ciclotech",
    sessionSampleRate: 100,
    trackUserInteractions: true,
    defaultPrivacyLevel: "mask-user-input",
  });
  } catch (e) {
    // Falha no monitoramento não pode impedir o site de abrir.
    console.error("Datadog:", e);
  }
}

createRoot(document.getElementById("root")!).render(<App />);
