# Reference gameplay audit

Sources: `WhatsApp Video 2026-10-25 at 1.15.25 PM.mp4` (43.79 seconds, 2,626 decoded frames) and `IMG_3768.mp4` (20.30 seconds, 1,217 decoded frames).

Every decoded frame was compared with its predecessor across the pot, stacks, board, reveal area, and folding seats. Transition frames and the surrounding frames were inspected visually. Full frame inventories and per-frame numeric differences remain in `reference-analysis/whatsapp/` and `reference-analysis/straight-detailed/`. Times below are approximate frame-index / 60 values, rather than a claim of exact presentation timestamps.

## Full-house hand in the latest video

Initial: hero K♠ K♦, stack 141, pot 4.5. Socal8god is already folded.

| Approx. source time | Recorded action | Total pot | Hero stack |
|---|---|---:|---:|
| 1.28 s | tinyhiny folds | 4.5 | 141 |
| 2.82 s | rubo folds | 4.5 | 141 |
| 4.33 s | JamesB0nd folds | 4.5 | 141 |
| 5.88 s | PlutoPoker folds | 4.5 | 141 |
| 7.83 s | xotiicpoker calls 3 | 7.5 | 141 |
| 9.80 s | Asianchad calls 2.5 | 10 | 141 |
| 11.37 s | givengo440 folds | 10 | 141 |
| 11.60–12.03 s | Wagers collected into the central 10 bank | 10 | 141 |
| 12.10–12.47 s | Flop K♥ 4♠ 8♣ | 10 | 141 |
| ~13.58 s | Asianchad checks | 10 | 141 |
| 15.55 s | Hero bets 4 | 14 | 137 |
| 17.50 s | xotiicpoker calls 4 | 18 | 137 |
| 19.48 s | Asianchad calls 4 | 22 | 137 |
| 19.72–20.17 s | Wagers collected; bank becomes 22 | 22 | 137 |
| 20.43 s | Turn 5♦ | 22 | 137 |
| 21.72 s | Asianchad checks | 22 | 137 |
| 23.70 s | Hero bets 10 | 32 | 127 |
| 25.65 s | xotiicpoker calls 10 | 42 | 127 |
| 27.62 s | Asianchad raises to 40 | 82 | 127 |
| 29.58 s | Hero adds 127 all in (137 total this street) | 209 | 0 |
| 31.52 s | xotiicpoker calls remaining 84.5 all in | 293.5 | 0 |
| 33.50 s | Asianchad calls another 97 (137 this street) | 390.5 | 0 |
| 33.98–34.42 s | Wagers collected into the 390.5 bank | 390.5 | 0 |
| ~34.85 s | Opponent cards reveal; hero cards move above avatar | 390.5 | 0 |
| ~35.60 s | River 8♥ | 390.5 | 0 |
| 36.95–37.53 s | Full house evaluation and winning-card highlights | 390.5 | 0 |
| 38.47–39.07 s | Payout animation, then stack credit | 390.5 | 390.5 |

Opponent final stacks: xotiicpoker **0**, Asianchad **241**. Other stacks remain unchanged. Opponent cards: 7♦ 6♦ and 4♥ 4♣.

## Straight hand

Initial: hero A♠ K♥, stack 483.25, pot 7.5. Several seats are already folded in the opening frame.

The remaining folds proceed through Brinley, HandyManny, El_foolosopher, then sharkfish. AAinagas calls 4 at approximately 6.47 seconds, leaving a stack of 217 and a pot of 11.5. The flop is 9♦ J♥ 10♠. After checking, the turn is Q♣. Hero bets 5 at approximately 13.73 seconds and AAinagas folds at approximately 15.28 seconds. The displayed pot becomes 16.5 and the final hero stack is 494.75.

**There is no revealed river in this recording.** The fifth slot becomes an unrevealed rabbit card. The previous playable's 2♣ and extra river betting round were incorrect and have been removed from the reference path.

## Corrections and intentional adaptations

- Default play follows the recorded decisions and amounts, rather than choosing random calls and raises.
- Wagers remain in front of the seats and are collected between streets. The bank and the live total pot are separate.
- Existing community cards remain in place when the next card is dealt.
- The full-house river follows the all-in calls and opponent reveal, rather than appearing before the betting finishes.
- Fold / Check-or-Call / Bet-or-Raise controls use the supplied red, charcoal, and blue rounded-rectangle style.
- The latest video is the full-house hand, now the default preview. The straight hand remains available separately. Replay keeps the selected hand.
- The playable pauses for the user's decisions; elapsed wall time depends on the user. Alternative decisions enter varied scripted betting and intentionally diverge from the recording.
- Previously requested Spunk, Maya and Xio avatar substitutions remain. Farah replaces the duplicate hero avatar so all nine seats have unique characters. OS chrome, some visual motion details, and the ad's final install controls differ from the source replay. Pixel-identical reproduction is not claimed.

Validation: `reference-gameplay-qa.json` checks the recorded contribution sequence, pot and stack amounts, bank values, card order, reveal/payout order, alternative choices, orientations and MRAID pause behavior.

## Card motion and audio update

Community cards and showdown cards now show the original back before turning face-up. The top-left settings button is removed. Six effects extracted from the supplied full-house recording follow folds, checks, chip wagers/collection, card deals and the win. There is no continuous music between these effects in the source. Audio unlocks on the first play tap, respects mute, and pauses with host visibility. `flips-audio-qa.json` verifies the back/face animation, decoded sound output, mute, pause/resume and nine unique avatars.
