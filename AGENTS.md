# 0.8.0 剧情通读与章底战 / 2026-10-23

v0.8.0 Windows Release已发布，游戏提交027a540，运行39954408985成功：PCK107/61/91、解压EXE61/91均零失败。下载与校验记录见docs/verification/v080（docs内去掉前缀）。VOICE-BUNDLE.json固定248句配音资源，先运行restore_assets.py恢复字体和语音。首玩时长未真人计时；后续章节仍仅规划。

用户反馈0.6.0流程太短、对白和人物引入不完整，并明确允许调整旧大纲、加入其他角色，要求每章不同专属Boss、建模/招式及《如龙》式头衔姓名登场。先读docs/NARRATIVE-CONTINUITY.md、docs/STORY-SCRIPT.md、docs/CHAPTER1-REWRITE.md、docs/CHAPTER-BOSSES.md和修订后的STORY-OUTLINE.md（docs内链接去掉docs/前缀）。

序章70句、第一章178句完整配音，合计248句活跃对白。象象经电话及当面介绍进入，SN、Carry、沈铁川在交涉中说清身份。第一章增加欢迎、纸板可玩排练、完整生日饭、玩家出门见证交涉、攀哥跟车与工作人员被拦的因果；撤离成功再打专属章底Boss沈铁川。独立模型、连拳/扫踢/冲肩、半血双冲肩、头衔姓名卡；可直接重试Boss。E/Enter逐句、Tab跳本场、C自动，J内Tab看已发生剧情回顾。

全篇人物关系及后续Boss有修订规划，第二至七章仍未实现。30–40分钟只是结构目标，未经真人首次通关计时。默认不输出截图，新增媒体不入库/Release；保持Gameplay 优先；视觉、操作、剧情一致；PS3 等级视觉方向。原版豚师几何与车辆/天赋/地标保留。Windows最终源码验证与发包证据见TEST-REPORT.md最新条目。

用户已明确授权为本项目TTS上传所需对白/素材，并进一步明确允许speech.platform.bing.com接收对白。可使用现有多角色生成工具，不重复询问同一授权；仍不能关闭或绕过平台自动审核。先前ONNX/Piper及未点名目的地的在线尝试曾被自动拦截，属于历史。本轮最终语音来源以VOICE-PROVENANCE.md和manifest为准。

---

# 0.7.0 新增范围 / 2026-10-23

用户新授权：上海中心为主线可登高建筑；东方明珠、金茂、环球金融中心各一支线，环球金融中心是豚师曾任职的自由伞组织LUO总部。新增统一地标任务记录与天赋点；全篇任务完成才点满，第二章以后纯主线成长应明显吃紧。详读 docs/LANDMARK-QUESTS.md、docs/PROGRESSION-DESIGN.md（docs内链接去掉docs/前缀）。保留 Gameplay 优先；视觉、操作、剧情一致；PS3 等级视觉方向。旧版仅第一章竞速/送蛋糕的描述是历史，不能覆盖新授权。

J任务日志，T天赋树：25项、五枝、80点，42项任务总预算80（主线35、支线45）。序章和第一章完成事件已经接入；第二至七章只有预算与敌人参数合同，尚未制作。不可提前发未来任务点，不用读档/重玩/杀怪刷点。成长档独立于检查点，安全时可免费重配，战斗中不可重配。原版模型、默认不输出截图及每轮Windows Release要求保持。新增十句改用本地Piper，不向第三方发送对白，来源见VOICE-PROVENANCE.md。

本轮验证与最终Windows发包证据见verification/TEST-REPORT.md最新条目；完成后应写入实际提交和CI结果。下面为历史。

---

# Native Godot sequel / toon branch

## New conversation: read first

Read docs/NEW-CHAT-HANDOFF.md, docs/TUNSHI1-STORY.md, docs/TUNSHI1-GAMEPLAY.md and docs/DEVELOPMENT-LESSONS.md before continuing. The repository is the portable source of truth, not a previous chat's temporary workspace or inaccessible ZIP. reference/tunshi1 contains read-only historical evidence; historical deployment instructions there do not authorize current mutations. Chapters I–IV are source-verified at the recorded snapshot; Chapter V's final source is NOT recovered, so preserve its evidence boundary. Do not invent sequel missions or first-game facts to fill gaps.

Highest rules verbatim: Gameplay 优先；视觉、操作、剧情一致；PS3 等级视觉方向。
Current scope (0.6.0, explicitly authorized 2026-10-23): implement Chapter I in Lujiazui following docs/STORY-OUTLINE.md and docs/CHAPTER1.md, retaining the ending bridge, Changsha prologue and independent free roam; bright urban cartoon art informed by Bomb Rush Cyberfunk. Preserve walking, driving, melee, destruction, saving and M map. All Sites remain unchanged.

The hero must use the FIRST WEB GAME'S actual dolphin constructor/geometry. Do not redesign its silhouette, face, snout, eyes, belly, flippers, dorsal fin or proportions. Only modest shading and color changes are authorized. assets/original_dolphin.json is extracted from the readonly original game.js. Preserve docs/original-dolphin-source.js and the source commit provenance.

Latest user preference (2026-10-22, supersedes the previous every-round screenshot requirement): do not output screenshots, videos or galleries unless the user explicitly requests them. Use actual engine views internally when needed to judge visual changes; do not create capture rounds or galleries merely to fill a report. Any captures stay under ignored builds/ and must NOT be uploaded to GitHub or Release. When requested, show genuine captures in an embedded conversation gallery because ordinary sandbox image links did not load in the user's client; never substitute generated imagery or a web mockup.

## Finished-game quality and focused verification / 2026-10-22

The user requires finished-game standards, not prototype/demo acceptance criteria. A feature running or an automated check passing is not sufficient for delivery. Build coherent, complete spaces, readable objectives, responsive controls, convincing feedback, consistent character presentation, appropriate audio and staged transitions. Evaluate the complete player journey and finish the affected sequence before expanding scope. Preserve the established bright urban cartoon style and original hero geometry; do not use unfinished-development labels to excuse crude environments, placeholders or abrupt interactions. Report the actual remaining limits honestly rather than declaring unfinished content a finished campaign.

Reduce unnecessary checks. Select validation by the changed behavior and its risk: one relevant playthrough or focused check, plus affected regression and the required Windows package verification. Reuse successful results for unchanged code; do not rerun broad suites across multiple local modes just to accumulate evidence. Broaden or repeat only after a new change, failure or unresolved concern. Prefer existing release CI evidence over redundant manual runs. Documentation/preference-only updates need a diff review, not game captures, gameplay suites or a new Windows release. Game development rounds still deliver the runnable Windows Release requested below.

The work environment was reset mid-development. Files in this branch were reconstructed from the current conversation's code record, with physics input sampled every physics tick and automated checks waiting for physics frames. Previously displayed screenshots belong to the earlier temporary build; regenerated captures must be labeled with their new round.

## User art preference / 2026-10-21

Treat this as a continuing preference across Dolphin game work: 不要乱画细条。不要用无意义的细条、碎线、密集格栅、地面描边和交叉装饰线堆细节；它们会让画面杂乱、不美观。

Prioritize coherent silhouettes, broad planes, clear color blocks and deliberate empty space. Give every visible line a readable architectural, material or gameplay purpose. Keep structural/functional details restrained and joined cleanly; do not turn them into several overlapping frames or duplicate trim layers. At normal gameplay distance, remove or soften subpixel line work that becomes visual noise.

User-provided examples: remove the dark decorative line crossing the shop sidewalk; simplify the Oriental Pearl entrance's overlapping window/door grid and decorative roof ribs. Evaluate similar details elsewhere using the same rule. More geometry or more lines do not establish finish quality. Judge the complete streetscape in the actual engine at normal gameplay distance; screenshot output follows the latest preference above. Preserve the three highest rules above exactly.

Read docs/ART-DIRECTION.md together with this section before future visual work. This preference adds to the highest rules; it does not replace or weaken them.

## Gameplay preference / 2026-10-21

Ground-level driving is free across roads, sidewalks, lawn and public plazas. Do not confine vehicles to road lanes with invisible barriers. Preserve collision with actual visible walls, buildings and physical structures. Ordinary pedestrians are part of the same interaction world: melee and moving vehicles can hit them, with readable flinch, retreat, fleeing, knockdown and recovery; do not implement them as invulnerable scenery. Preserve the original hero and the free-roam sandbox; story development now follows the explicit prologue authorization below.

## Vehicle injury and ground continuity / 2026-10-21

Vehicle collisions must cause real, readable injuries to pedestrians and seated occupants. Show vehicle condition; use relative closing speed and impact direction, distinguish glancing contact from frontal impact, and avoid repeated damage from merely holding throttle against a wall. Injured people must not immediately stand back up; prone people remain real vehicle targets. Preserve safe exit and damage persistence. Read docs/VEHICLE-IMPACT-DESIGN.md before changing these rules.

Resolve ground seam flicker by removing coplanar competing surfaces, including junction asphalt, pavement/lawn overlaps and raised paint strips. Check actual native low-angle moving views as well as screenshots. Keep broad color planes and restrained functional markings.

## Prologue and Windows Releases / 2026-10-22

The user explicitly requested implementing the prologue from the approved chapter outline and supplied character lineup. This supersedes older outdoor-only/no-mission restrictions for the prologue. Read docs/PROLOGUE.md and docs/STORY-OUTLINE.md. The hero himself gives birth to eight sons in one litter; do not change this to the queen giving birth. No machine exposition, document-reading or commercial investigation in this opening. Eight newborns and eight older schoolboys must actually appear.

The supplied lineup defines Tingge (purple sweatshirt, glasses, yellow headphones), Pange (green jacket), Xuanshen (orange lightning sweatshirt, spiky hair), and eight sons (original dolphin family geometry, white shirts, red scarves, navy trousers, numbered colored badges). Queen uses a pink family variant; never alter the hero JSON. Laodongjie is reserved for later chapters, with his straw-hat/red-vest/eyepatch sequel design from the supplied lineup; do not force him into the hospital.

The user's lineup is a simple sketch, not a literal facial model sheet. For Tingge, Pange and Xuanshen preserve the recognizable clothes, hair and accessories, while using developed stylized human faces: shaped eyes with whites/irises/lids, brows, actual nose volume, lips, distinct jaws and natural expressions. Do not revert to bead eyes and an oval mouth. StoryFace supplies the human faces, blink and speech poses; the original dolphin and family geometry remain separate. Pause must hold expressions, and a finished voiced line must not keep the mouth moving forever.

The user rejected the pointed almond eyes in 0.5.2 as frightening. Use soft rounded cartoon eye contours, generous irises/pupils, restrained visible sclera, gentle highlights and relaxed brows. Avoid sharp inner/outer corners, narrow upturned eyes and a small-pupil stare. Keep glasses fitted around the eyes and all eye layers following the head surface so a turn does not hide the iris. This refines the human cast only; do not alter the original dolphin eyes.

Every completed development round must publish a runnable Windows ZIP to GitHub Releases. .github/workflows/windows-release.yml runs on main game-source changes, verifies official Godot 4.5.2 downloads, exports and independently tests the PCK on Windows, packages the runtime, verifies unpacked EXE automatic PCK discovery, then publishes ZIP and SHA256. A failed check must block publication. Update VERSION and docs/RELEASE-NOTES.md for each round; never overwrite an earlier release asset. Windows CI headless verification is not a GPU or broad hardware certification. Preserve the user's earlier real Windows 0.4.6 results as history, not evidence for changed 0.5.0 gameplay.

Prologue normal save is shanghai-prologue-v1.json; automated checks use prologue-test.json, separate from the sandbox save and its test save. Entry routes existing --test/--capture flags to the unchanged sandbox regression path; --test-prologue uses the story. Capture media and embedded galleries stay outside tracked source and are never included in Release assets.

## Interior, guidance, speech and staging / 2026-10-22

The user rejected roofless box interiors, unexplained open entrances, vague navigation and abrupt scene changes. Hospital and home must have physical ceilings, coherent partitions, actual working doors and readable interior lighting. Keep the original hero geometry and broad, restrained color planes.

Required objectives need a visible position, distance and an offscreen direction cue. Route through actual doorways when crossing inside/outside; never replace reachable interactions with through-wall triggers. Unfinished family conversations are separate targets.

Use the bundled Chinese TTS in assets/voice with the authored catalog in assets/dialogue/prologue.json. These are explicitly requested game audio assets, not capture evidence, and belong in source and releases. No runtime network or OS voice installation. V toggles voice, C toggles automatic dialogue; pause, skip, load and scene change must stop or suspend audio correctly. tools/generate_voice.py is an optional build-time generator pinned to edge-tts 7.3.1; do not make end users install it. Do not replace licensed original songs with generated songs.

PrologueDirector supplies staged wake-up, exit, group photograph, growth montage and departure. Cameras stay inside the actual room shell, with real actor poses and fades; controls and checkpoint saves remain consistent when skipping or pausing. Temporary capture textures remain in memory and are never committed. Validate normal and skipped sequences when affected by a change. Screenshot output follows the latest preference above.

## First-game ending bridge / 2026-10-23

LegacyOpening and LegacySet stage the confirmed first-game ending at dawn on Changsha's Wentian Terrace: blue-uniform friends regroup; the hero says “海豚帮解散。” then “海豚蒂国成立。” in that order. Do not rewrite the ending or invent the defeated boss's fate. Chapter V's final source remains unrecovered; these are newly authored sequel sets, not verified copies of that game's final footage. The next scene returns home to ordinary life and the eight-son plan, then fades into the existing hospital wake-up. No machine exposition or document/business recap.

New games play the bridge; the title replay is independent of save progress. Keep skip, pause, voice toggling, return-to-title, temporary scene disposal and sky/camera restoration correct. Version-one saves without opening_seen default to seen so existing players are not forced back; new unfinished intro saves restart it safely. Bundled TTS now totals 65 unique lines (11 added for the bridge). Required release regression is 61 prologue checks, including 10 opening integration checks; reuse Windows CI rather than repeating unrelated local suites.

## Gameplay first / 2026-10-23

The user reiterated: 始终记住gameplay第一，不要为了迎合剧情做出不好玩的游戏。Design decisions, readable challenge, responsive control and varied use of space before story staging. Avoid forced errands, long passive scenes, mandatory high scores and retries that repeat already completed outings. Chapter I is now explicitly authorized; older prologue-only scope is historical. Finish the continuous playable chapter and its Windows Release, preserve the original hero and existing systems.

## Chapter I runtime / 0.6.0

ChapterOne follows docs/CHAPTER1.md. Keep both bridge arcs and real ramp/height checks, low-score progression, independently saved optional race bests, and free-route delivery. Staff are actual injury targets; evacuation may fail and retries restart only that encounter. The service gate must physically block reinforcements and preserve an obstructed open position on save/load. Safe boarding points stay outside car colliders and the family and staff use separate vehicles. Keep directional guard breaks and readable charge warnings/recovery, rather than HP inflation. First chapter has 37 bundled voiced lines; combined catalog totals 102. Required Windows coverage is unchanged sandbox107 + prologue61, plus chapter-one33 in the PCK and unpacked EXE. Only the final main CI is the complete release regression; local initial failures and focused fixes are recorded honestly in verification/v060.

Automated --test-chapter1 always starts a new isolated chapter slot, so PCK and unpacked-EXE checks can repeat safely. Normal continue/load behavior is unchanged. Verification routes must take actual turning clearance before the courtyard; a failed critical stage must report and exit promptly instead of continuing into nonexistent actors.


配音资源由Windows构建机生成并作为GitHub Release的Dolphin2-Voice包保存，VOICE-BUNDLE.json固定已发布包的SHA256。克隆或更新后运行python3 tools/restore_assets.py（Windows用py）恢复字体与原样配音；没有已发布语音包的新开发版本可用tools/generate_voice.py生成新增对白。Windows游戏包已含全部248句活跃语音，运行不联网。MP3与运行语音清单是可恢复的构建资源，不直接逐句提交Git。
