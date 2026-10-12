import { createHashRouter, RouterProvider } from "react-router"

import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { DocPage } from "@/docs/layout/DocPage"
import { DocsLayout } from "@/docs/layout/DocsLayout"
import { Home } from "@/docs/layout/Home"

// Hash routing so the built site works on any static host with no server rules.
const router = createHashRouter([
  {
    element: <DocsLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "*", element: <DocPage /> },
    ],
  },
])

export function App() {
  return (
    <TooltipProvider>
      <RouterProvider router={router} />
      <Toaster />
    </TooltipProvider>
  )
}

export default App
