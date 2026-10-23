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
