# AFKMAXX visual system

Absurd on the surface, exact underneath. Giant headlines can joke. Controls, consent, privacy, and payment copy must be literal.

## Foundations

Tokens are in `styles.css`, shared by `index.html` and `system.html`. Midnight #0B0D12 is the canvas; acid mint #C8FF3D signals permission and primary actions; electric cobalt #5876FF connects elements and marks keyboard focus; paper #F4F1E8 carries receipts and explanations. Muted text #A7AAA4 is for secondary copy on dark surfaces. Cobalt is decorative, not small text on dark backgrounds. Pair colored statuses with text and shape.

Spacing follows 8, 16, 24, 32, 48, 64, 96px tokens. Desktop content is capped at 1280px; gutters shrink to 20px on phones. Separate major sections with generous space and narrow rules. Panels use 4–7px radii; rounded app icons are an exception. Avoid making every section a card.

## Typography and licenses

Self-hosted files in `assets/fonts`:
- display.ttf: Barlow Condensed, weight 900. Headlines and the live-text wordmark. Source: https://github.com/google/fonts/tree/main/ofl/barlowcondensed
- mono.ttf: DM Mono, weight 400. Labels, receipts, metadata. Source: https://github.com/google/fonts/tree/main/ofl/dmmono
- body.ttf: DM Sans, weight 400. Body copy and controls. Source: https://github.com/google/fonts/tree/main/ofl/dmsans

All are distributed under SIL Open Font License 1.1; accompanying OFL files are bundled. Google Fonts supplied the static TrueType files. One weight per role limits transfer to about 181 KB uncompressed. Fonts load locally, use `font-display: swap`, and make no third-party font requests. Display is preloaded on the landing page. No faux condensed transformations. Headlines have 0.91 line height; normal copy has 1.6. Microtype is uppercase, tracked, and supplemental: essential explanations remain readable body copy.

## Assets

`mark.svg` uses lime pause bars and a cobalt connection. `mark-light.svg` changes the bars to midnight for light surfaces. `app-icon.svg` and `favicon.svg` contain the dark rounded container. The mark has no fine outlines and is demonstrated at 24px in the system page. Keep clear space of at least half a bar width. Do not recolor the cobalt connector, distort, or add shadows. The wordmark is live Barlow Condensed text paired with the mark. Original vector desk artwork lives in `assets/desk.svg`; the small process and region diagrams are HTML/CSS.

## Reusable primitives

## Descriptive illustrations

Use real `img` or `picture` elements, never SVG backgrounds layered behind existing diagrams. Each image owns its layout box with explicit dimensions and descriptive alt text. The three `.step-scene` illustrations share a 640×420 aspect ratio and stack above their text on mobile. Regional checks (`regions.svg`), the permission gate (`permission-gate.svg`), and the offchain-to-onchain record path (`record-path.svg`) carry the same thin outlines and restrained palette across the landing page. The record flow uses a dedicated vertical mobile SVG so its labels remain readable without horizontal scrolling. Keep captions outside the SVG when practical; retain plain-text explanations alongside each scene.

- `.button` with `.lime`, `.dark`, or `.outline`: clear action, tactile hover/press, visible keyboard focus. Use anchors for navigation and buttons for state changes.
- `.dashboard`, `.panel-top`, `.status-area`, `.controls`: a status shell with separate permission controls. `.checking` activates the signal pulse. Never use motion as the only status indication.
- Native labeled inputs, fieldsets, checkboxes, and ranges: preserve keyboard behavior. Explain disabled states nearby.
- `.receipt`, `.receipt-header`, `.receipt-stamp`: warm paper, dashed dividers, narrow mono metadata, one decisive headline. Always label sample records. Do not fabricate payout identifiers.
- `.screen-row`, `.specimen`, and semantic tables: secondary product screens. Empty states should say what is missing rather than showing invented activity.
- Native `details` and `summary`: FAQs and expandable records.

## Motion and accessibility

One staggered hero entrance, one-time scroll reveals, and a quiet signal pulse only while the user runs the demo. Reduced motion disables animations, transitions, and smooth scrolling. No decorative perpetual motion. Every input has a label, status changes are announced, and all controls are keyboard accessible. At 700px grids stack; navigation retains pilot access and a skip link. Use no fixed heights for text containers.

## Screen specimens

`system.html` includes participant onboarding, desktop status, approved destinations, check history, payout history, and a customer request. `desktop.html` and `mobile.html` are interactive product demos: status, destinations, history, payouts, and an illustrative `$AFK` bag. Consent and request preview interactions on those pages are local demonstrations. Never interpret demo controls as real authorization to run traffic, a token sale, or a Robinhood listing.

`app.html` is the web product. It may persist settings in `localStorage`. Live HTTPS checks require the unpacked extension in `extension/`. The extension may only GET allowlisted `https:` hosts, must honor pause and the daily cap, must not read browsing history, and must not offer an unrestricted proxy. Check results in the web app are unaudited until a verifier exists.

## Data and product boundaries

The landing page and demos still use no analytics, cookies, local storage, network checks, signup collection, wallet integration, or backend. Reload resets demo controls. The web app is the exception: it stores consent, destinations, and local requests, and talks to the extension. Live work still requires explicit consent, destination enforcement, metering, a published data policy, result verification, abuse prevention, and tested payout integration before a public pilot. Verification methodology, payment terms, eligibility, fees, and availability are deliberately unpromised.
