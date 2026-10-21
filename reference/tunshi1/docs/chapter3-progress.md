# 2026-10-03 修正：到东麓后步行即完成

仅本 TEST，从发布 v61 / `d19d78e847bee8b97428070c8f3ab336f4f9484b` 继续。`c301-park` 保持目标 `[639,185]` / 12 米，改为人在正确地图的室外目标区、非驾车就自动完成；去掉黄线内停稳 1.5 秒、车辆高度/位置和 `parkedAt` / `carAt` 记录依赖。目标区原有停车保留，玩家可以从别处步行过来，无须先上那辆车。目标、导航、状态提示与听歌对白同步，后续进山战斗/别墅撞门等车辆任务不改。

本轮 7 项受影响脚本通过：`chapter-parking`、`chapter3-story`、`chapter3-recovery`、`chapter4-story-entry`、`chapter4-arrival`、`chapter4-story`、`chapter4-recovery`。专项先在旧代码复现第三章步行到达不能推进，再验证两章实际按键走入、目标区车辆保留、当前车留在别图、旧停车标记刷新、范围/地图/室内/暂停拦截、真实 E 下车和 T 重试及主存档隔离。第三章 23 节点、第四章 30 节点均通关及恢复，第四章入口脚本也验证生成 Worker 存档迁移。图形/DOM/媒体仍为替身；最终提交/发布版本看 Sites 原生记录。

# Chapter III continuation checkpoint

Updated 2026-10-01. Continue this existing test project; do not create another Site.

Latest continuation: Chapter IV TEST map development is now recorded in [chapter4-progress.md](chapter4-progress.md). Read that checkpoint for the tunnel, city/interior IDs, campus milk-ice room and scoped tests. The Chapter III content and verification notes below remain applicable.

## Site and scope

- TEST only: appgprj_6abb9f2f3738819198aa6b1aca2093f9
- Public: https://dolphin-city-chapter2-test.plllp8336.chatgpt.site
- v29 was the map-only baseline; v35 added the 1080p rendering cap. This source now includes the Chapter III gameplay rework; use Sites latest-version/deployment status for its exact published version.
- Production is appgprj_6ab9fb51932481919ee7b0c05f88e5de and must remain untouched.
- The game is static ESM plus the existing save-transfer Worker. Its supported preview configuration does not offer a real browser/GPU preview here. Tests use real Three.js, game inputs and physics with mocked rendering/DOM/audio. They are not screenshots or human playtests.
- Continue using scoped tests. Do not rerun earlier chapters or the five-minute mountain climb without a concrete concern affecting those paths.

## Playable implementation

Four missions / 23 objectives now connect naturally after Chapter II completion:

1. 此路不通: actual temporary road closures with shared car models and mutable colliders, two-actor dispatch fight before paper inspection, on-foot arrival in the east parking area, then a three-actor academy approach battle with usable stools.
2. 山那边: trail-map inspection, existing road/stone-step choices, manual trail gate, Aiwan platform and temple fights with intermediate checkpoints, summit battle and an F-breakable communication box that can prevent backup, telescope and west descent. Terrain/routes remain intact.
3. 梅溪湖是谁的: JC, physically moving stolen-file runner with E interception, walking or vehicle escort, two spatial interception battles, a physical cart to push with E or smash by driving, E wait/follow, protected-contact HP and timed verification. Enemies at the table pause the timer; the bridge gate blocks them and takes damage from real attacks. A bounded local combat path replaces full-map searches at the sealed gate.
4. 仙人府: wallet-only preparation supplies; court/garage battles, luxury-car glass impact with flying glass/frame fragments, dust, layered sound and camera shake; visible Q pickup then Q furniture smash without heat; main-hall chandelier release, kitchen wash valve, inner-court flanking reinforcements, 36-riser staircase, keeper's half-health backup and noncombat tea study. Current-version retries/refresh retain held/spent props, medicine and debris. Final completion withdraws road closures and records 牢东杰 / 南门口—黄兴广场—五一广场 as the Chapter IV lead.

仙人 is a friendly conversation contact, never an attacking actor or a gang recruit. His information goes in the existing contacts/save data.

### Modules and shared hooks

- dist/chapter3/vending.js adds eight physical vending machines to the east parking area, Aiwan/temple/summit/west-foot rest areas and three lake-road shoulders. The casing, recessed window, stocked shelves, payment controls and collection slot are batched using shared geometry/materials. Body colliders, labels and terrain height agree; each front approach is reachable without blocking the existing routes.
- Vending uses StreetLife's existing water/bread/kit inventory (¥2/+12, ¥5/+30, ¥15/+65; nine per kind). E / mobile 互动 opens the existing landscape-friendly shop panel; B / the top 包 button uses saved consumables anywhere. Wallet-only payment, full-health preservation, capped healing and old-save/new-game behavior remain. Height/front/line-of-sight/on-foot/region/dialogue guards prevent remote or conflicting interactions. Map-only and campaign entries both support the machines without requiring a C3 mission.
- dist/chapter3/story/runtime.js, world.js, actions.js, outdoor-actions.js and villa-actions.js own C3 adaptation, actors/props and operations.
- missions.js and dialogues.js retain the four data-driven missions and chapter arc.
- sets.js adds switchable outdoor mission scenery. villa-interiors.js supplies four dressed connected rooms at origins 4000/4200/4400/4600; the courtyard ceiling is open and kitchen partitions have real usable openings.
- dist/story/runtime.js dispatches to third before second, serializes story.chapter3, handles navigation/death/retry, and preserves completed-C2 shop contacts, economy, workshop and scene destruction on return. Existing bought technique/armor/gloves upgrades carry into normal C3 continuation.
- During active C3 missions in 观沙岭, business/equipment uses the same #chapter2Plan entry as C2: on landscape phones the small 经营 button sits beside 重来 in the navigation row. #chapter2FreePlan is reserved for free exploration with the mission card hidden, so the two entries cannot cover the active task card.
- Shared ChapterCombat takes its region from the runtime and supports contact targets / height-aware hits. C3 opts into localCombatPath (55m range, 420-node cap, 1–2 second retries); C2's navigation remains unchanged. ThirdCombat handles visible two-step Q pickup/smash, including mobile 拿物/砸下 labels. game.js exposes the hero grip, facing and impact audio/shake hooks.
- Villa garage shutter is a mutable exterior mesh/collider. Glass impact requires the designated car, actual driving, the ram objective and at least 6 m/s normal impact; ordinary melee and wrong/slow cars do not open it. The physics contact opens the passage and starts 72 glass shards, eight frame fragments and 120 dust points from a fixed pool. Persistent glass rubble and bent framing remain, with no burst replay on refresh.
- Indoor navigation supports opt-in floor/vertical-overlap checks and limits individual height steps. Stair support and displayed riser heights agree; rail collider heights follow the stair slope.
- Save document remains v1, with nested story.chapter3, validated C3 mission IDs, four room IDs and updated server/client transfer descriptions.

### Independent entries

- 第三章玩法试玩 · 独立存档: #chapter3StoryStart / chapter3story / dolphin-city-save-chapter3story. Canonical fixture now starts exactly one objective before C2 completion: c209-return, on foot in the old shop beside 仙人, with the earlier objectives complete and ¥9,999. Press E for the final conversation; the ordinary C2 ending/dialogue/banner leads into C3. The car is parked outside the shop. Refresh resumes the selected slot; clicking this test entry again resets its checkpoint. It does not use or overwrite main progress.
- 第三章地图试玩: existing #chapter3TestStart / chapter3test / dolphin-city-save-chapter3test remains map-only; no C3 closures or story actors/room access. It preserves the separate story slot.
- Existing C1, C2, boss, atrium and transfer entries remain. Normal C2-complete saves start C3 automatically once pending dialogue/banner ends; an unfinished C2 objective still pauses during mountain exploration and resumes on return.

## Validation completed in this continuation

- node tests/chapter3-vending.mjs: actual production movement from each nearby route to all eight front approaches, physical bodies/support, three wallet purchases and healing effects, immediate reload/compatible document, full health/insufficient funds/carry cap, backside/height/intervening collider/driving/region/dialogue guards, real mobile/panel/backpack handlers, C3 objective continuity and isolated main/map slots. Scoped street-life.mjs and chapter3-systems.mjs regressions also pass. Rendering/DOM/audio are mocked; no browser/physical-phone visual QA or full hike was rerun.
- Compact business-entry fix: scoped production-handler checks cover C2-to-C3 handoff, immediate saved-game boot, opening/closing the existing menu, retry, both region directions and the actual final study exit/free-exploration fallback. Active guidance shows the existing C2 inline button and hides the independent free entry; the original touch CSS reserves navigation space beside 重来. Main save bytes remain unchanged. DOM/rendering are mocked; no physical-phone rendering claim.
- Test-entry checkpoint adjustment: scoped production-handler verification confirms c209-return is the only remaining C2 objective, the old-shop spawn is clear and within E interaction range, no automatic completion occurs before interaction, refresh works before/after the ending, the normal ending starts C3, and the main/map save bytes remain unchanged. The story suite's opening now follows this same handoff; the earlier campaigns were not replayed for this fixture change.
- node tests/chapter3-story.mjs: continuous 4-mission / 23-objective run through the new mountain/escort battles and villa reinforcements; real E actions, timed melee, moving chase, escort/cart/verification, physical ramp/room portals, actual luxury-car driving impact, kitchen valve, production-input stair climb, tea/ending/reload and reopened roads. Travel positions are accelerated and the long escort fixture maintains ally HP; this does not validate difficulty. Fixtures retain each objective's first capture.
- node tests/chapter3-recovery.mjs: every objective document/refresh, 11 death/retries, immediate partial-enemy HP and elevated actor visibility, mouse/mobile/heat controls, consumed-prop refresh, slow/wrong-car rejection and damaged-car retry, persistent debris/medicine, raised-floor recovery/navigation, actual contact injury/failure/retry, physical bridge-gate walking, vehicle passenger/refresh/island handoff, isolated map entry, natural C2-to-C3 start, old-shop access and real transfer endpoint/import.
- A scoped production-melee probe also confirmed old-region scene damage remains usable while C3 is active.
- Affected regressions passed: chapter2-combat.mjs, chapter2-entry.mjs, player-actions.mjs, mall-connections.mjs and keybindings.mjs. C2 combat/room fixtures were derived from the canonical checkpoint for this scoped check; earlier campaigns were not replayed.
- Final build uses scripts/build.mjs through the bundled Sites workflow. Fully read and compare every deployment archive file against the generated build before native save/deploy. Save the exact pushed SHA and publish only this test project.

## Next work

The gameplay rework is described in `chapter3-gameplay-rework.md`. Per the user's latest instruction, the test Site does not need migration between old and new save versions: start a fresh Chapter III story test to review the new sequence. Verify only current-version refresh/death/retry behavior. Next visual review needs a supported browser and landscape phone, especially combat pacing, furniture readability, glass spectacle, frame rate and stair camera. Mocked rendering is not visual QA or a human difficulty test.

For future edits, read AGENTS.md, this checkpoint and the relevant action module first. New real-landmark facade changes still require photograph/reference research. Save local Git checkpoints before long tests or publishing. Keep the chapter's four-mission arc, 仙人's noncombat role, the actual routes/props and the persistent ending consistent.

## 2026-10-01 第二章运货热修复

主站 v23 已先发布。测试站同步货物车换乘后重新上车及旧存档 T 重试恢复修复；检查点使用稳定车辆键，兼容旧车辆 ID。详见 `chapter2-delivery-hotfix.md`。第三章、测试入口、横屏经营按钮和自动售货机保持现有实现。

## 2026-10-01 渲染分辨率设置

测试站默认按实际输出像素限制 3D 画面：长边不超过 1920、短边不超过 1080，保持视口比例，不放大小屏原生像素。开始界面新增“渲染分辨率：1080p 上限 / 无上限”按钮，显示当前输出尺寸；无上限使用设备原生 DPR，移除旧 1.7 DPR 限制。偏好单独保存在本设备，不进入游戏存档。初始化及窗口/全屏尺寸变化统一调用 `dist/render-resolution.js`，CSS 画布与 HUD 保持全屏。

`tests/render-resolution.mjs` 已验证 4K、高 DPI、超宽屏、手机横屏、切换/偏好恢复、存储受限、真实开始按钮和 resize 接线及相机比例。DOM/WebGL 模拟，不作为实机性能或画面验证。主站不变。

## 2026-10-01 书院前地面支撑修复

书院可见铺石前庭中心在 z=318，原地面支撑却在 z=305，向前错位 13 米；石阶外的普通地面因此被当成约高半米的石台，形成隐形挡路边缘。支撑现在与实际前庭共用平台数据；书院石阶按实际宽度取高度，书院街末端仅按可见矩形人行道取高度，不再延伸成隐形圆形高台。补齐街道至石阶的小段可见石路和石阶至前庭的实际铺石连接，避免修正后出现断口。

`tests/chapter3-academy-ground.mjs` 用真实网格向下射线检查空地、石阶边缘、路端与前庭的高度一致，并用生产移动输入跨过原隐形边界、往返道路/石阶/前庭、上下真实台阶、跳跃落地及当前版本刷新。`chapter3-rework.mjs` 的山地战斗/检查点及其余定向检查通过。仅修改第三章测试站；DOM/WebGL 模拟，不作为实际手机画面或帧率验证。

## 2026-10-01 JC 核验增援与直达测试

核验改为首波三人（守备、普通、重型），之后每三秒两人轮换冲锋/守备/重型。增援时钟独立于核验进度，桌边有敌人导致核验暂停时仍会来人；同时最多九个活敌人，复用已被打倒的演员，避免持续核验时无限增加模型与寻路。仍用实际攻击减少门耐久，没有按时间强制开门。修正贴到门边的冲锋手不再攻击门的阈值；门损坏后不能再关闭，核验结束保持桥口开放以供离岛。允许在距核验桌 28 米的桥口范围内防守并继续计时。

开始界面新增“JC 核验守岛 · 直接测试”：使用 `chapter3dock` / `dolphin-city-save-chapter3dock` 独立存档，直接进入 c303-dock，角色在岛侧桥口，JC/门满生命，门已关闭，核验为零，前置任务已完成。点击按钮重置这个测试；刷新恢复此测试，不覆盖普通、整章或地图存档。正常通过后仍接第四个任务。

`chapter3-dock-pressure.mjs` 检查真实开始按钮/存档隔离、真实 AI 攻击破门（无人干预的模拟约 5.88 秒）、核验暂停时每三秒增援、九演员上限和回收、刷新后的下一波时刻、T 重来、生产近战守桥完成及实际步行离岛。守桥完成探针固定内侧站位并补回复生命，不作为人类难度验证。既有 rework 和 rework-edges 定向回归通过；旧存档衔接不在测试站范围。DOM/WebGL/音频模拟，未进行手机帧率验证。
