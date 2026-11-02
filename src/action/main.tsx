import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { SrRulesHelpContent } from "../components/SrRulesHelp";
import { PluginGate } from "../components/PluginGate";
import { PluginThemeProvider } from "../components/PluginThemeProvider";
import "../index.css";
import "./style.css";
import {
  broadcastRoundChangeEventMessage,
  handleSetRoundNumberMessage,
} from "../helpers/broadcastRoundImplementation";
import { updateRoundCount } from "../helpers/metadataHelpers";
import OBR from "@owlbear-rodeo/sdk";

const isHelpPage = new URLSearchParams(window.location.search).get("srHelp") === "1";
if (isHelpPage) document.documentElement.classList.add("sr-help-document");

if (!isHelpPage) OBR.onReady(() => {
  handleSetRoundNumberMessage((data) => {
    updateRoundCount(data.roundNumber, () => {});
    broadcastRoundChangeEventMessage(data.roundNumber);
  });
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <PluginGate>
      <PluginThemeProvider>
        {isHelpPage ? <SrRulesHelpContent /> : <App />}
      </PluginThemeProvider>
    </PluginGate>
  </React.StrictMode>,
);
