// Types for ../components.js, the no-build behavior script shipped with the HTML components.
export {}

declare global {
  interface Window {
    DS: {
      enhance: (root?: ParentNode) => void
      toast: (
        title: string,
        options?: { description?: string; variant?: "destructive"; duration?: number }
      ) => HTMLElement
    }
  }
}
