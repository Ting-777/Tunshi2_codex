# Chapter IV road connections and traversal stutters

2026-10-02. Authorized scope: this existing public TEST Site only. No main Site changes, Chapter IV storyline or new full minigames.

## Traversal work

- City light anchors previously changed the number of visible point lights as the player entered each lamp's range. Nanhu's entrance also added/removed individual lights. Three.js uses light counts in shader program variants, so these transitions could compile new variants during play. Nighttime downtown now keeps three light slots; Nanhu keeps three. Unused lights have zero intensity. Downtown daytime retains zero point lights, preserving its daytime lighting workload. Both downtown lighting layouts are prepared at startup.
- `prewarmRegionMaterials` prepares the actual material/mesh shader layouts through the bundled Three.js `compileAsync` API, using cloned light/fog environments and light-free mesh representatives. It uploads unique, ready shared textures through `initTexture`, yielding between batches. City image loads settle before preparation, with the existing canvas fallback and a bounded timeout. Intro buttons stay disabled during preparation, and texture invalidations do not wake rendering early. This preparation does not render, reveal, reparent or dispose the real game roots.
- Downtown/tunnel population replenishment previously searched for every missing actor in one frame. These regions now place at most two actors and make at most four placement searches per frame, continuing on subsequent frames until filled. Pools, area/time crowd targets, moving actors and traffic limits remain the same. Regular stalled-traffic maintenance still runs on its original interval. Earlier chapters retain their original replenishment timing.
- The city/interior collider index now clips the camera with analytic oriented-box ray intersections and cached rotations, instead of checking each nearby wall at every 20 cm sample. Floor/stair and curved tunnel-ceiling checks remain. Disabled destruction colliders and raised walls are respected; thin barriers are no longer skipped between samples.
- Camera initialization uses the existing visible-only matrix update rather than forcing every hidden map and room to recompute its matrices on each transition. The 60 FPS ceiling, resolution options, pause/background sleep, shadows, materials and crowd budgets remain.

These changes address identifiable shader/resource and CPU workload spikes. No real GPU frame-time or temperature measurement is available in this execution environment.

## Drivable city and Beichen connection

- 学院街 continues east to the south entrance of the motor road at x=350. This road runs continuously north past Huangxing's east parking, 解放西, IFS/B1 and 五一 to the city's northeast edge.
- A second motor road at x=-462 connects the south/书院路 to 坡子街's west parking, 解放西 and 五一大道. Players can use either side of the walking district; both connect to the existing cross-town avenues.
- `c4_huangxing_parking` and `c4_pozi_parking` have actual asphalt bays, painted markings, roadside signs and map entries. Huangxing also has a paved on-foot approach. The central shopping spine, plaza and underground remain pedestrian spaces.
- The northeast road crosses northward into Beichen's southeast edge. The return uses the same road southward. `beichenLink` supplies the portal thresholds and arrivals; `beichenApproach` supplies the visible approach and map/traffic road samples. Vehicle identity, condition and speed use the existing cross-region travel/save path.
- Beichen's new approach follows `[385,455] → [385,390] → [331,390] → [331,330] → [378,327]`, around the west side of an existing building and into 平沙路. The first straight proposal intersected building `645602432` and was corrected before release. Existing buildings, Chapter I missions and dialogue are not moved or rewritten.
- New map IDs: `c4_beichen_exit`, `chapter4_exit`, `c4_huangxing_parking`, `c4_pozi_parking`. Existing region, facility, room and clothing IDs are retained.

## Securities wording

The facility is **湘城证券 · 五一营业部**; its interior display reads **湘城证券 · 行情大厅**. Visible captions no longer use “虚构”. The future service key is `stocks`; no real stock quotes, external market data or full trading game have been introduced.

## Verification

Checks execute production movement, interaction, collision and save logic against real Three.js geometry. DOM, WebGL and audio are mocked. They are automated input/geometry checks, not a human playthrough or rendered GPU test.

- `chapter4-road-network`: sample every downtown motor-road centreline and the Beichen approach for collision/driving access, then drive 学院街 → east perimeter → Huangxing parking → IFS/五一 → Beichen southeast/平沙路; save/reload; return through the road portal; drive the west perimeter/Pozi parking → south. The same vehicle retains 77 HP, its ID and crossing speed. Both parking areas also exercise actual E disembark/reboard and walking into the adjacent commercial area.
- `chapter4-stutter`: stable lighting layouts, thin/rotated/raised/disabled wall and terrain clipping, bounded replenishment searches/placements with full nightlife crowd, visible-only transition matrices, correct startup compile lighting/unique texture uploads, unchanged real roots and securities captions.
- Affected regressions: `chapter4-route`, `chapter4-interiors`, `chapter4-systems`, `street-population`, `crowned-tshirt`, `startup`, `render-performance`. These cover Nanhu's original bidirectional route, supported ramps/vault/camera, all storefront/mall/underground connections, population motion/time budgets, B1 vehicle persistence, transfer roundtrip, prior-chapter suspension, purchased clothing, and the rolling 60 FPS submission budget.
- Build the existing client and transfer Worker with `node scripts/build.mjs`, then publish only this TEST project's committed source/archive through native Sites hosting.

Real device shaders, shadows, audio and frame times still need device verification; passing mocked renderer checks cannot certify stutter-free GPU rendering.
