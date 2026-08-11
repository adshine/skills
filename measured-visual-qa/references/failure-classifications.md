# Visual Failure Classifications

| Classification | Evidence | Owning fix |
|---|---|---|
| Parent gap | Child boxes align, but repeated painted intervals include extra empty space | Change parent grouping, `gap`, or layout structure |
| Parent padding | All children shift together from a container edge | Change container padding or shared spacing token |
| Sibling margin | One interval differs and computed margins explain the delta | Normalize sibling margin or use one spacing owner |
| Font metrics | DOM centers match while painted glyph bounds drift consistently | Adjust line height, font, or documented optical offset |
| Pseudo-element baseline | Text `+`, `-`, or icon drifts despite centered grid/flex item | Use a fixed geometric icon or explicit box |
| Box model mismatch | Declared size differs from rendered border box | Correct `box-sizing`, padding, or border assumptions |
| Grid/flex distribution | Free space is added by alignment or track sizing | Correct track definitions or content distribution |
| Transform | Painted position differs from normal-flow geometry | Remove or account for transform and transform origin |
| Subpixel rounding | Repeated deltas alternate around fractions of a pixel | Use tolerance or dimensions that divide consistently |
| Overflow clipping | Painted bounds stop at a parent edge | Correct overflow, mask, clip path, or container size |
| Sticky/fixed overlap | Target is geometrically correct but obscured at a scroll state | Account for fixed chrome and scroll padding |
| Responsive wrap | A state passes at one width but changes line or track count at another | Fix breakpoint, minimum size, or wrapping policy |
| Stale deployment | Local geometry passes while deployed asset fingerprint is old | Cache-bust, redeploy, and verify loaded assets |

Classify only after viewing both computed geometry and the annotated screenshot. More than one classification may apply, but name the highest-level spacing owner first.
