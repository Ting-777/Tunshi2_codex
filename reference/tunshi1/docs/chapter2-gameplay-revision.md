# Chapter II gameplay revision · test Site only

The current missions keep their stable save IDs and the original districts. They now use a shared Chapter II combat controller and scene-specific phases, instead of completing everything on proximity to a marker. Chapter I routes/dialogue are unchanged.

## Playable systems

- F / mouse: timed three-hit chain. Guarding opponents absorb frontal jabs; the third hit breaks guard. Flanking, interrupting a telegraphed attack and waiting for recovery are alternatives.
- G / mobile 闪: directional movement with a cooldown. A late evade earns heat and opens the attacker to a counter.
- H / mobile 重击: spend heat on a heavy attack or a nearby stool/bin/extinguisher. The selected mesh moves, its collider is removed, and the impact can break a guard. Heavy and foreman enemies resist ordinary stun during windup; the foreman accelerates below half HP.
- K / 经营装备: invest in repair tools, supplies, training, vehicle protection, demolition gloves or defence. No money option skips a mission. Earnings come from completed jobs, repair quality, store operations and repeatable orders available after reopening the shop, during the main story and after completion.
- Touch mission card: a compact “重来” button invokes the same current-objective reset as T, even before failure. It occupies the navigation row below the mini-map. After Chapter II completion, a separate 经营 / 装备 button remains under the mini-map outside the hidden mission card; it survives reload and clears on a new Chapter I. Optional-order prompts remain available without an active mission.

## Security and budget update

Garage/office guards have four/three patrols, light-dependent vision, suspicion, running-noise investigation and real wall occlusion. Detected guards take 2.8 seconds to call support; actual hits interrupt that call. A completed call or office export sends at most two two-person waves through actual exits, capped at six living opponents. Guard HP, wave counts and radio/search timers persist within the current objective. Breaking sight for 4.5 seconds starts a search around the last observed position; ten further unseen seconds restore patrol. Crouching behind an unaware/searching guard within reach enables E to subdue quietly, leaving a prone body which other patrols can discover. Garage switches remain usable after collecting their clue. Quiet garage extraction is possible; office copying stops while a guard sees the operator. Guards counter repeated blocked frontal jabs and ordinary hits no longer permit prolonged stun locking. Chargers now commit to a visible, locked-direction moving charge throughout their windup: straight running at the default speed can be caught, while lateral movement and touch dodge can escape. The indicator reads 冲锋. Search flanking, body discoveries and radio facing use the last observed/evidence position, never an unseen player coordinate.

Dina introduces the ¥10,300 registration/preservation/old-repair budget at the first paid workshop mission. Of the initial ¥20,002, ¥10,000 stays protected as working capital and ¥10,002 is committed to the budget. The player must earn the remaining ¥298 from this point, and still have it in the pocket at settlement. Repairs, mission rewards, collected business income and street loot use one income callback. The gate is at 不签, before the defence preparation timer; navigation points to the workbench while short, then to the actual Dina model when ready. E at Dina debits both contributions exactly once. Upgrades/supplies remain separate purchases; payment never removes enemies or skips the defence. Earnings and unfinished optional orders survive refresh and death. Older saves already defending or later are grandfathered without retroactive charges; if an older mid-chapter save has spent guild funds, the actual available contribution and displayed personal shortfall adjust without making funds negative.

The protagonist is excluded from cached outdoor scene visibility. Leaving an interior explicitly sets on-foot/driving model visibility, fixing the B1 car-entry → indoor dismount → Old Home disappearance. The player's current acquired story vehicle also remains boardable on the street outside its original vehicle mission.

## Scene actions

| Mission | Action and change within the scene |
| --- | --- |
| 旧锁 | Connected entry and power/evidence inspection introduce the old company. |
| 这里谁说了算 | Move an actual vehicle; catch the thief, then carry the cargo back while pursued; resolve the shopfront disturbance. Completed jobs pay once. |
| 地下四个名字 | Switch separate lighting circuits, hide behind garage geometry, open or smash a locker; leave through the actual northern ramp after obtaining records. |
| 谁还记得海豚 | Repair three customers' devices using timing/quality. Collectors interrupt the second order; defend the store before finishing work. |
| 茶子山夜班 | Identify the tagged vehicle, stop/hijack it, drive its loaded vehicle while pursued, then unload and fight in B1. No mandatory map lap. |
| 账不会骗人 | Obtain the B1 pass or smash the real gate. Copy two sources for different durations; movement/damage interrupts copying. Exporting triggers opposition, then leave using the staff stair/B1 route. |
| 旧家 | Read the marked photograph, follow the visible floor conduit, smash the actual kitchen partition, take the exposed box, then get out past an ambush. All 19 internal collider-backed partitions/furniture and the local clue objects can break. Visible outer walls/floor remain structural. |
| 不签 | Earn and settle the ¥10,300 budget with Dina, prepare the actual shutter/car position and optional equipment, then defend a file-carrying NPC against enemies with different roles. The final wave drives through the frontage; damage persists until an explicit shop repair. |
| 四个人 | Talk, fight alongside old members, then catch the runner early or intercept the receiving car. A teammate places a physical roadblock if the bag is transferred. The roadblock clears after recovery. |

Each clue, scene change and ending has new continuous dialogue. Speaker metadata remains separate from speech, and the existing audio-completion clock still owns automatic advance.

The public start menu also offers “第二章玩法试玩”, a separate test slot starting at the bridge after Chapter I. Main, boss-test and migrated saves remain intact.

## Compatibility and checks

Chapter II state revision 3 merges new fields into old v1 documents, retaining mission IDs, objective indices, money, earlier completions and destruction. Completed repairs and recovered originals survive death/retry; copied clues persist. Owned story vehicles have a stable save key and restore as controllable vehicles. Transfer endpoints and the v1 document format are retained.

Automated verification uses the real game, Three objects, input, movement, collision, missions and saves with mocked DOM/WebGL/audio. Position fixtures accelerate long travel. It is not a GPU screenshot or a human playtest. The dedicated tests exercise timed melee, dodge movement, thrown mesh/collision, all 19 demolition approaches, wall crossing, legacy checkpoints, jobs/upgrade effects, cargo restoration, death and postgame business. New checks cover detection/light/occlusion, radio interruption by a real punch, entrance-spawned backup, last-known search, quiet takedown/extraction, watched copying, budget thresholds/one-time payment/reserve/order recovery, the mobile retry handler, the actual B1 driving/indoor dismount/office-to-Old-Home sequence, actual running/sidestep/touch-dodge against a charge, hidden-target search/radio checks, and touch postgame business/open/close/order/reload/new-game cleanup.

## References used for the design direction

- SEGA, Like a Dragon Gaiden official battle overview: https://ryu-ga-gotoku.com/gaiden/asia_en/battle/ — environment-based combat and distinctive combat actions.
- Rockstar, GTA V Heists official announcement: https://media.rockstargames.com/broadcast/20150310/en_US_web.html — different actions and scenarios across a mission strand.

These inform the action variety; this update uses original game missions, characters, dialogue and interface.
