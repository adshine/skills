import * as React from "react"
import { Link } from "react-router"

import { CopyButton } from "@/docs/blocks/CodeBlock"
import { Anatomy, Callout, DocTab, DocTabs, Marker, PropsTable, SectionGrid } from "@/docs/blocks/Doc"
import { Do, DoDont, Dont } from "@/docs/blocks/DoDont"
import { Example, Html } from "@/docs/blocks/Example"
import { RadiusScale, SpacingScale, TypeScale } from "@/docs/blocks/Scales"
import { ColorPairs, TokenTable } from "@/docs/blocks/TokenTable"

function textOf(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node)
  if (Array.isArray(node)) return node.map(textOf).join("")
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) return textOf(node.props.children)
  return ""
}

export const mdxComponents = {
  a: ({ href = "", ...props }: React.ComponentProps<"a">) =>
    href.startsWith("/") ? <Link to={href} {...props} /> : <a href={href} {...props} />,
  pre: (props: React.ComponentProps<"pre">) => (
    <div className="not-prose relative my-6 overflow-hidden rounded-xl border">
      <CopyButton text={textOf(props.children)} className="absolute top-2 right-2 z-10" />
      <pre {...props} className={`${props.className ?? ""} code-scroll`} />
    </div>
  ),
  Example,
  Html,
  Do,
  Dont,
  DoDont,
  TokenTable,
  ColorPairs,
  TypeScale,
  RadiusScale,
  SpacingScale,
  Callout,
  PropsTable,
  Anatomy,
  Marker,
  DocTabs,
  DocTab,
  SectionGrid,
}
