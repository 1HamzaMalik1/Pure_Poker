# Poker rules and Pure Poker motion audit

Reviewed 27 October 2026. The earlier reference-sequence QA confirmed amounts and timings; it did **not** establish that every alternative choice followed complete poker settlement rules. This review found and corrected that gap.

## What was corrected

- Showdown evaluates the best five cards from the board and each live player's hole cards. The result no longer assumes the hero wins.
- Separate main and side pots award chips only to eligible players. Folded contributions remain in the pot, and folded players cannot win.
- Equal-ranked hands split their eligible pot; an odd hundredth goes clockwise from the dealer. Uncalled excess is returned.
- Calls are limited to the player's remaining stack. Minimum raises use the last full bet/raise size. A short all-in does not automatically reopen raising for a player who already acted; cumulative full-raise exposure can reopen it.
- Betting continues in seat order until outstanding calls have been answered. New streets reset betting rights. All-in players skip further decisions.
- The opening is an already-in-progress preflop snapshot. Only Play starts it; Raise and Fold are disabled there because the hero has already placed the recorded bet.

The default hand remains transcribed from the recordings. Other choices use varied opponent decisions with the same betting and settlement accounts.

## Recorded hand calculations

Full house final contributions: hero **144**, xotiicpoker **101.5**, Asianchad **144**, folded givengo440 **1**. The total is **390.5**. Main pot **305.5** is contested by all three live players; side pot **85** is contested by hero and Asianchad.

With K♥ 4♠ 8♣ 5♦ 8♥ on the board:

| Player | Hole cards | Best hand | Award |
|---|---|---|---:|
| Hero | K♠ K♦ | Kings full of eights | 390.5 |
| xotiicpoker | 7♦ 6♦ | Eight-high straight | 0 |
| Asianchad | 4♥ 4♣ | Fours full of eights | 0 |

In the straight reference, the displayed 16.5 transfer consists of an **11.5 contested pot plus return of the uncalled 5**. The recorded hero stack still ends at **494.75**. No river is revealed on that reference path.

## Pure_Poker.mp4 presentation

The newer file in Downloads is 20.03 seconds, 1080×1920, 30 fps. All 600 video frames were decoded; the contact sheet and transition frames were inspected. It supplies motion/style guidance, while the earlier hand's amounts, characters and interactive decision pauses remain deliberate adaptations.

Implemented: opening hole-card flight and back-to-face flip, yellow PRE-FLOP/FLOP/TURN/RIVER titles, glowing best-card outlines and sparkles, large STRAIGHT! made-hand effect, faded folded seats, YOU WIN! payout rays, and a green end card with fanned cards and PLAY NOW. Existing source game effects, mute and host-visibility pause remain enabled. Exact frame/pixel parity and the newer video's complete soundtrack are not claimed.

## Validation

- `exhaustive-hand-qa.json`: all **2,598,960** five-card combinations match the nine standard hand-category counts.
- `poker-rules-unit-qa.json`: **16** cases, including ace-low straights, kickers, two-trip full houses, different side-pot winners, folded eligibility, ties, odd chips, short raises and recorded pots.
- `rule-branch-qa.json`: **16** deterministic alternative play-throughs with legal UI actions, nonnegative stacks and exact chip conservation.
- `reference-gameplay-qa.json`: **11** recorded-path, branch, viewport and MRAID checks.
- `flips-audio-qa.json`: card backs/faces, decoded sound output, mute, host pause and nine unique avatars.
- `pure-motion-qa.json`: captures of the new motion milestones.

This remains a single-hand, scripted No-Limit Texas Hold'em ad: cards are curated, opponent decisions are simulated, and Fold ends the player's ad attempt. A full poker client with shuffled multi-hand dealing, rake, table changes and multiplayer operation is outside this playable's scope. Source opponent cards that are never shown are assigned unique demo cards for evaluating alternative branches.

Reference rule pages for independent review: [Poker TDA](https://www.pokertda.com/view-poker-tda-rules/) and [PokerStars Hold'em](https://www.pokerstars.com/poker/games/texas-holdem/). Online retrieval was unavailable during this audit; the report does not claim a live external certification.
