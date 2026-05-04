import { createRoot } from "react-dom/client";
import "./plugins"; // Load WordPress-style plugins
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
