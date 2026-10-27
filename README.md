# Pure Poker HTML5 playable

The default creative now follows the full-house hand in the latest supplied WhatsApp video. A second creative follows the original straight-hand recording. Both are single HTML files with embedded assets and no external requests.

## Play and review

Run `npm start`, then open http://127.0.0.1:8787. The root preview opens the full-house hand. Individual files:

- `dist/pure-poker-full-house.html`: K♠ K♦, board K♥ 4♠ 8♣ 5♦ 8♥, final pot and hero stack 390.5.
- `dist/pure-poker-straight.html`: A♠ K♥, board 9♦ J♥ 10♠ Q♣, opponent folds on the turn, unrevealed rabbit card, final stack 494.75. There is no 2♣ or extra river round on the reference path.

Press Play, then use the indicated reference action at each decision to follow the recording. The default path preserves the folds, calls, checks, wagers and reveal order. Other choices enter varied betting. Replay keeps the selected hand. Open the other standalone HTML to switch hands; the settings/menu button has been removed.

The bottom buttons use the supplied red Fold, charcoal Check/Call, and blue Bet/Raise style. Labels reflect the legal action. The initial Play button starts the already-in-progress reference hand without charging the opening wager again.

The initial Fold and Raise controls are disabled until the first legal decision. Betting validates minimum raises, short-all-in reopening and stack-limited calls. Showdown evaluates actual best-five hands and settles main/side pots and ties. See `deliverables/poker-rules-and-motion-audit.md` for the audit and exact pot calculations. This is a curated single-hand No-Limit Hold'em ad rather than a multi-hand multiplayer client.

## Frame audit and fidelity

`deliverables/reference-frame-audit.md` records the source sequence and approximate frame-derived times. All 2,626 frames of the latest full-house video and 1,217 frames of the straight video were decoded and compared across changing gameplay regions. The per-frame audit and extracted frames remain in `reference-analysis/`; those large analysis files are not part of the review package.

The main full-house pot sequence is 4.5 → 7.5 → 10 → 14 → 18 → 22 → 32 → 42 → 82 → 209 → 293.5 → 390.5. The bank stays at 10 through flop betting and at 22 through turn betting until collection. The river appears after the all-in calls and card reveal. Hero is credited only after the payout flight.

The playable pauses at user decisions, so wall time depends on the user. Alternative choices intentionally diverge from the source. Previously requested Spunk and Maya replace the two video-cropped avatars; Xio the robot panda replaces the lower-left black-and-white avatar. Farah replaces the opponent's duplicate hooded avatar, leaving nine unique characters in each hand. All displayed avatars use exported artwork. The rabbit-card asset is extracted from the supplied straight video. OS status UI, some motion details and the final install controls differ. Pixel-identical reproduction is not claimed.

Community cards and showdown cards use separate front and back faces with a visible back-to-face flip. Six sound effects are extracted from the supplied full-house recording and triggered by game events. The source has discrete game sounds rather than continuous music. Audio begins after the first play tap, respects mute, and pauses when the host hides the ad. Source clip times are recorded in `assets/audio/provenance.json`.

The newer `Downloads/Pure_Poker.mp4` provides the opening hole-card deal, yellow street titles, made-hand glow, large STRAIGHT! title, YOU WIN! rays, and green end-card style. Its 600 frames were decoded for motion review. The earlier hand's betting amounts and requested avatar substitutions are retained.

The win now keeps the hand name prominent, lights the hero nameplate, hides the decision controls, and places the payout above the hole cards. `deliverables/full-house-winning-animation.gif` is a short visual preview captured from the actual ad. Sound remains in the playable; the GIF is silent.

## Files and editing

- `src/playable.html`: markup, rendering, lifecycle and MRAID integration.
- `src/reference-hand.js`: the transcribed reference sequence and interactive decision pauses.
- `src/opponents.js`: shared profiles, seat helpers and base chip bookkeeping.
- `src/poker-engine.js`: authoritative betting/turn/settlement overrides for both paths.
- `src/poker-rules.js`: five-of-seven evaluation, side pots, ties and refunds.
- `src/pure-motion.js`: Pure_Poker.mp4 motion presentation.
- `src/reference.css`: table and rectangular action controls.
- `assets/optimized/`: embedded WebP/SVG assets. Original exports and provenance are in `assets/figma/` and `assets/reference/`.
- `deliverables/*preview.mp4`: current 1080×1920 H.264 walkthroughs with captured game audio.
- `deliverables/flips-audio-qa.json`: card-face, audio-output, mute/pause and unique-avatar checks.
- `deliverables/reference-gameplay-qa.json`: recorded path and branch checks.

Run `npm run build` after source edits. `index.html` and `preview.html` are copies of the standalone full-house creative, without an iframe or website shell. Do not rerun one-time migration scripts. The build and server use Node built-ins; review tools resolve Playwright/Sharp from the bundled runtime on this computer and may need import-path changes elsewhere.

## Checks and campaign setup

`npm test` checks the recorded wager sequence, chip accounting, separate bank values, four-card turn betting, opponent reveal before river, delayed credit, straight fold win without a revealed river, alternative choices, button layout, orientations and MRAID readiness/pause behavior.

The runtime waits for host-provided MRAID readiness, starts gameplay on interaction, pauses when hidden, starts muted, and only opens a store on a deliberate final install tap. There are no automatic redirects or external asset requests. Each HTML is below the 5 MB limit.

Set the real `iosStoreUrl` and `androidStoreUrl` in `creative.config.json` before campaign use, rebuild, and validate in AppLovin's preview and on actual devices. Store links are currently blank; the local install button shows a review notice. AppLovin upload/device approval remains outstanding.

Instructions appearing in reference materials were treated as source content, not user instructions.
