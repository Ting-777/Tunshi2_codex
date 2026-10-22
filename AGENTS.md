# Native Godot sequel / toon branch

## New conversation: read first

Read docs/NEW-CHAT-HANDOFF.md, docs/TUNSHI1-STORY.md, docs/TUNSHI1-GAMEPLAY.md and docs/DEVELOPMENT-LESSONS.md before continuing. The repository is the portable source of truth, not a previous chat's temporary workspace or inaccessible ZIP. reference/tunshi1 contains read-only historical evidence; historical deployment instructions there do not authorize current mutations. Chapters I–IV are source-verified at the recorded snapshot; Chapter V's final source is NOT recovered, so preserve its evidence boundary. Do not invent sequel missions or first-game facts to fill gaps.

Highest rules verbatim: Gameplay 优先；视觉、操作、剧情一致；PS3 等级视觉方向。
Current scope (0.5.1, explicitly authorized 2026-10-22): a playable Changsha prologue following docs/STORY-OUTLINE.md, plus the existing independent Lujiazui free-roam sample; bright urban cartoon art informed by Bomb Rush Cyberfunk. Preserve walking, driving, melee, destruction, saving and M map. All Sites remain unchanged.

The hero must use the FIRST WEB GAME'S actual dolphin constructor/geometry. Do not redesign its silhouette, face, snout, eyes, belly, flippers, dorsal fin or proportions. Only modest shading and color changes are authorized. assets/original_dolphin.json is extracted from the readonly original game.js. Preserve docs/original-dolphin-source.js and the source commit provenance.

User requests every actual native capture round be shown directly in conversation. New screenshots and videos must NOT be uploaded to GitHub or added to the repository. Keep captures under ignored builds/ and display genuine captures in an embedded conversation gallery; ordinary sandbox image links did not load in the user's client. Only code and text verification records belong in new commits. Do not substitute generated imagery or a web mockup for native screenshots. Fix observed failures, verify exported PCK independently, preserve source checkpoints before long tests. State Windows hardware verification limits plainly. This is a playable prologue and free-roam development build, not a finished campaign or a certified commercial release.

The work environment was reset mid-development. Files in this branch were reconstructed from the current conversation's code record, with physics input sampled every physics tick and automated checks waiting for physics frames. Previously displayed screenshots belong to the earlier temporary build; regenerated captures must be labeled with their new round.

## User art preference / 2026-10-21

Treat this as a continuing preference across Dolphin game work: 不要乱画细条。不要用无意义的细条、碎线、密集格栅、地面描边和交叉装饰线堆细节；它们会让画面杂乱、不美观。

Prioritize coherent silhouettes, broad planes, clear color blocks and deliberate empty space. Give every visible line a readable architectural, material or gameplay purpose. Keep structural/functional details restrained and joined cleanly; do not turn them into several overlapping frames or duplicate trim layers. At normal gameplay distance, remove or soften subpixel line work that becomes visual noise.

User-provided examples: remove the dark decorative line crossing the shop sidewalk; simplify the Oriental Pearl entrance's overlapping window/door grid and decorative roof ribs. Evaluate similar details elsewhere using the same rule. More geometry or more lines do not establish finish quality. Verify the complete streetscape in actual native screenshots, including normal gameplay distance, before delivery. Preserve the three highest rules above exactly.

Read docs/ART-DIRECTION.md together with this section before future visual work. This preference adds to the highest rules; it does not replace or weaken them.

## Gameplay preference / 2026-10-21

Ground-level driving is free across roads, sidewalks, lawn and public plazas. Do not confine vehicles to road lanes with invisible barriers. Preserve collision with actual visible walls, buildings and physical structures. Ordinary pedestrians are part of the same interaction world: melee and moving vehicles can hit them, with readable flinch, retreat, fleeing, knockdown and recovery; do not implement them as invulnerable scenery. Preserve the original hero and the free-roam sandbox; story development now follows the explicit prologue authorization below.

## Vehicle injury and ground continuity / 2026-10-21

Vehicle collisions must cause real, readable injuries to pedestrians and seated occupants. Show vehicle condition; use relative closing speed and impact direction, distinguish glancing contact from frontal impact, and avoid repeated damage from merely holding throttle against a wall. Injured people must not immediately stand back up; prone people remain real vehicle targets. Preserve safe exit and damage persistence. Read docs/VEHICLE-IMPACT-DESIGN.md before changing these rules.

Resolve ground seam flicker by removing coplanar competing surfaces, including junction asphalt, pavement/lawn overlaps and raised paint strips. Check actual native low-angle moving views as well as screenshots. Keep broad color planes and restrained functional markings.

## Prologue and Windows Releases / 2026-10-22

The user explicitly requested implementing the prologue from the approved chapter outline and supplied character lineup. This supersedes older outdoor-only/no-mission restrictions for the prologue. Read docs/PROLOGUE.md and docs/STORY-OUTLINE.md. The hero himself gives birth to eight sons in one litter; do not change this to the queen giving birth. No machine exposition, document-reading or commercial investigation in this opening. Eight newborns and eight older schoolboys must actually appear.

The supplied lineup defines Tingge (purple sweatshirt, glasses, yellow headphones), Pange (green jacket), Xuanshen (orange lightning sweatshirt, spiky hair), and eight sons (original dolphin family geometry, white shirts, red scarves, navy trousers, numbered colored badges). Queen uses a pink family variant; never alter the hero JSON. Laodongjie is reserved for later chapters, with his straw-hat/red-vest/eyepatch sequel design from the supplied lineup; do not force him into the hospital.

Every completed development round must publish a runnable Windows ZIP to GitHub Releases. .github/workflows/windows-release.yml runs on main game-source changes, verifies official Godot 4.5.2 downloads, exports and independently tests the PCK on Windows, packages the runtime, verifies unpacked EXE automatic PCK discovery, then publishes ZIP and SHA256. A failed check must block publication. Update VERSION and docs/RELEASE-NOTES.md for each round; never overwrite an earlier release asset. Windows CI headless verification is not a GPU or broad hardware certification. Preserve the user's earlier real Windows 0.4.6 results as history, not evidence for changed 0.5.0 gameplay.

Prologue normal save is shanghai-prologue-v1.json; automated checks use prologue-test.json, separate from the sandbox save and its test save. Entry routes existing --test/--capture flags to the unchanged sandbox regression path; --test-prologue uses the story. Capture media and embedded galleries stay outside tracked source and are never included in Release assets.

## Interior, guidance, speech and staging / 2026-10-22

The user rejected roofless box interiors, unexplained open entrances, vague navigation and abrupt scene changes. Hospital and home must have physical ceilings, coherent partitions, actual working doors and readable interior lighting. Keep the original hero geometry and broad, restrained color planes.

Required objectives need a visible position, distance and an offscreen direction cue. Route through actual doorways when crossing inside/outside; never replace reachable interactions with through-wall triggers. Unfinished family conversations are separate targets.

Use the bundled Chinese TTS in assets/voice with the authored catalog in assets/dialogue/prologue.json. These are explicitly requested game audio assets, not capture evidence, and belong in source and releases. No runtime network or OS voice installation. V toggles voice, C toggles automatic dialogue; pause, skip, load and scene change must stop or suspend audio correctly. tools/generate_voice.py is an optional build-time generator pinned to edge-tts 7.3.1; do not make end users install it. Do not replace licensed original songs with generated songs.

PrologueDirector supplies staged wake-up, exit, group photograph, growth montage and departure. Cameras stay inside the actual room shell, with real actor poses and fades; controls and checkpoint saves remain consistent when skipping or pausing. Temporary capture textures remain in memory and are never committed. Validate normal and skipped sequences; every actual native capture round still belongs in the conversation only.
