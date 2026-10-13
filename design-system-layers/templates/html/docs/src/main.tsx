import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import "./docs/docs.css"
// Same behavior script client sites include with a <script> tag.
import "@ds/components.js"
import App from "./App.tsx"
import { ThemeProvider } from "@/theme-provider.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
)
