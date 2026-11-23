import { lazy, Suspense } from "react"
import "katex/dist/katex.min.css"

const BlockMath = lazy(() => import("react-katex").then(({ BlockMath }) => ({ default: BlockMath })))

export function MathFormula({ math }) {
  return (
    <div className="tooltip-formula max-w-full overflow-x-auto py-1 text-primary">
      <Suspense fallback={<div className="h-16" aria-hidden="true" />}>
        <BlockMath math={math} />
      </Suspense>
    </div>
  )
}
