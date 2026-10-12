import * as React from "react"
import { CheckIcon, CopyIcon } from "lucide-react"
import { cn } from "cn"

export function CopyButton({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = React.useState(false)
  return (
    <button
      type="button"
      aria-label={copied ? "Copied" : "Copy code"}
      onClick={async () => {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
        className
      )}
    >
      {copied ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
    </button>
  )
}

/** Runtime-highlighted code (used by Example). MDX code fences are highlighted at build time. */
export function CodeBlock({ code, lang = "tsx" }: { code: string; lang?: string }) {
  const [html, setHtml] = React.useState<string>("")
  const source = code.replace(/^\n+|\s+$/g, "")
  React.useEffect(() => {
    let alive = true
    import("shiki").then(({ codeToHtml }) =>
      codeToHtml(source, {
        lang,
        themes: { light: "github-light", dark: "github-dark" },
      }).then((h) => alive && setHtml(h))
    )
    return () => {
      alive = false
    }
  }, [source, lang])
  return (
    <div className="relative">
      <CopyButton text={source} className="absolute top-2 right-2 z-10" />
      {html ? (
        <div className="code-scroll" dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <pre className="code-scroll"><code>{source}</code></pre>
      )}
    </div>
  )
}
