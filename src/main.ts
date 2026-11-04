import "./styles/tokens.css";
import "./styles/global.css";
import "./styles/simulation.css";
import { mountApp } from "./app/app";

const root = document.querySelector<HTMLElement>("#app");

if (!root) {
  throw new Error("Elemen aplikasi #app tidak ditemukan.");
}

mountApp(root);
