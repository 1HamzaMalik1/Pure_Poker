# Pure Poker — AppLovin iOS playable

Delivery date: 30 October 2026.

**Send/upload only:** `client/Pure_Poker_AppLovin_iOS.html`

This is the full-house creative in one self-contained HTML file. Its size is 3.14 MB, below AppLovin's 5 MB limit. Images, sound, styles and gameplay code are embedded; no assets folder, server, source project, ZIP, or video file is needed.

Platform: **iOS**. The client-supplied install destination is:

https://apps.apple.com/us/app/pure-poker-mahjong/id6741335064

The final PLAY NOW tap calls the host's `mraid.open()` with that exact URL. In a normal browser without MRAID, the same deliberate tap navigates directly to that App Store URL. Android also opens this Apple App Store page, as requested; a Google Play URL is not configured. No automatic redirect is performed. The end screen contains only PLAY NOW; the replay button is removed.

The exact exported file passed 16 local delivery checks: single-file packaging and size, zero external HTTP requests during offline playback, readiness gating, no sound/gameplay before interaction, pause and mute when hidden/closed, protection against out-of-order visibility events, correct 390.5 payout, deliberate install click, five viewport sizes including landscape, iPad handling, standalone opening, and Android click-through with and without MRAID. The App Store navigation in the browser test is intercepted locally; no ad was uploaded.

The ad uses the MRAID implementation supplied by the advertising host. It does not fetch a remote MRAID library or ship a test MRAID shim. Local test stubs are separate from the delivery HTML.

Official requirements checked: [AppLovin creative specs and guidelines](https://support.applovin.com/en/growth/promoting-your-apps/welcome-to-applovin/creative-specs-and-guidelines).

**Final host check:** The client should load this HTML in the [AppLovin Playable Preview](https://p.applov.in/) and test on the intended iOS devices before campaign activation. Local validation is not AppLovin approval. Android campaign delivery requires the real Google Play destination and a separate configured build.

Validation and SHA-256 are recorded outside the client folder in `applovin-delivery-validation.json` and `applovin-delivery-manifest.json`.
