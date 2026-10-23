# 0.8.0 剧情通读与章底战 / 2026-10-23

本地 Codex 接手先完整阅读 [LOCAL-CODEX-HANDOFF.md](LOCAL-CODEX-HANDOFF.md)：项目知识、人物关系、源码地图、Windows运行、离线资源、验证和GitHub发布流程都在其中；本文件继续保留各轮历史与证据。

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

# 当前入口 / 2026-10-23 / 0.6.0 上海第一章

用户授权继续第一章，明确“始终记住gameplay第一，不要为了迎合剧情做出不好玩的游戏”。已写入AGENTS.md长期规则。本章仍按STORY-OUTLINE的陆家嘴大纲，但以可选择路线的天桥竞速、十座全家车送蛋糕、利用门与车辆的院内撤离战组织游玩。分数不封锁主线，失败只重试这场撤离。攀哥电话暗线用行进中的语音推进，生日与章末演出可跳过。

正常入口：标题“第一章 · 八个，一个都不少”，或完成序章后从玄关前往上海。scenes/chapter1.tscn与chapter1.gd独立管理进度；旧序章和漫游保留。新槽shanghai-chapter1-v1.json；检查用chapter1-test.json。eight sons、原版豚师、明快都市卡通、圆润人类眼型与默认不输出截图的要求保持。37段第一章新中文TTS，总计102段随包离线播放。

天桥竞速走真实坡道，左右半圈都能过，高度判定防止在地面穿点，老三使用真实物理跑动。中心绿地取货顺路经过高楼，驾驶不绑固定线路；碰撞/高速急转影响蛋糕，车况与乘员受伤规则沿用。滨江新会客厅有顶、自动门、家具/舞台/照明；后勤院落有实际车行门、南出口与单独工作人员接应车。工作人员会被攻击、会倒下，安全上车点在车身之外；关门实际挡住增援，门下有人/车则暂缓，存档保留未关上的位置。正面守备可破防，冲撞有地面预兆与反击窗口。

本地按风险做原生视图与输入检查；33项第一章集成检查覆盖完整链路，迭代记录与边界见verification/TEST-REPORT.md。[v0.6.0 Windows运行包](https://github.com/Ting-777/Tunshi2_codex/releases/tag/v0.6.0)已发布。游戏提交b994694ecd6ad6f5660a106b5d2a473d0138da8f，main运行[39898301779](https://github.com/Ting-777/Tunshi2_codex/actions/runs/39898301779)成功：独立PCK完整107/107、序章61/61、第一章33/33；解压EXE序章61/61、第一章33/33，退出0且自动发现同目录PCK。ZIP 51,387,125字节，SHA256 bd24e5d5cc672343affde9e1cddec15a209814967ecba9c1b83774be312757e5，与GitHub资产摘要一致，附独立校验文件。文字证据见verification/v060/release.json、windows-main-ci.txt及chapter-final-results.json。本轮没有额外下载公开ZIP重复检查，无Windows GPU硬件验收结论。第二章及以后未制作，不把第一章称作整部游戏完成。继续按成品体验标准，Gameplay 优先；视觉、操作、剧情一致；PS3 等级视觉方向。截图仅内部复查，不上传仓库/Release，不默认展示。

---

# 当前入口 / 2026-10-23 / 0.5.4 衔接第一部的开场

新增《天亮以后》开场：问天台黎明，蓝衣朋友归队，豚师先宣布“海豚帮解散”，再宣布“海豚蒂国成立”；接朋友回家与家里的八子计划，再淡入原医院起身。11段新配音，总计65段离线中文TTS。新游戏自动播放，标题可独立“重看开场”，E跳过、Esc暂停、V配音；不改旧进度、原版豚师或圆润眼型。

LegacyOpening/LegacySet负责分镜、临时场景及环境恢复，正式结局依据TUNSHI1-STORY.md用户设定；第五章最终源码仍未恢复，不能宣称复制了原结局场景。旧version1档默认已看，新开场中退出可安全重新播放。正常与跳过、暂停、旧档、重看保护等10项原生检查通过；CI序章总数61。默认不输出截图，捕获只供内部复查。[v0.5.4 Windows Release](https://github.com/Ting-777/Tunshi2_codex/releases/tag/v0.5.4)已发布。游戏提交aebd090c0f7c5b85112e53052b95387e6c1fd151，main运行[39888885000](https://github.com/Ting-777/Tunshi2_codex/actions/runs/39888885000)成功：完整107/107、序章61/61、解压EXE61/61，退出0且自动寻找同目录PCK。ZIP为50,550,162字节，SHA256 f9e305c43ea2d38d4f5cb45cde4b5e6c03227679c94d1ea4a3ddebd32d6df6c7，与GitHub资产摘要一致；附独立SHA256文件。证据见verification/v054/release.json与windows-main-ci.txt。CI实际解压并运行EXE，本轮未额外下载公开ZIP重复检查；没有Windows GPU实机结论。

---

# 2026-10-22 / 0.5.3 圆润卡通眼型

用户指出0.5.2听歌、攀哥、炫神的眼型太吓人。已改为无尖角/上挑斜度的圆润椭圆眼睛，减小眼白占比、加大虹膜与瞳孔，柔化眉形、高光和听歌镜框。眼睛各层贴合头部曲面，保留正常转头和眨眼。其余五官、角色标志、豚师与家族模型不改。

本地只做实际医院近景/侧面/闭眼/正常距离复查；默认不输出截图，捕获只在ignored builds/内部使用。必要回归与解压EXE验证交给main Windows发布CI一次完成。继续按成品体验标准制作，不回退为豆豆眼或尖杏眼。

[Windows运行包v0.5.3](https://github.com/Ting-777/Tunshi2_codex/releases/tag/v0.5.3)已发布，游戏提交8bc7f8f8439489b60696195c651a84f659bc1a73。Windows完整107/107、序章51/51、解压EXE51/51；发布ZIP摘要与CI打包记录一致。本轮未重复本地全套或额外下载ZIP复测，文字证据见verification/v053和TEST-REPORT.md顶部。Windows GPU实机仍未测。

---

# 2026-10-22 / 0.5.2 三位老朋友面部重制

听歌、攀哥、炫神已改为StoryFace构建的完整卡通人脸，有不同下颌、眼白/虹膜/眼睑、眉形、立体鼻部和唇形，加入错时眨眼与多种说话口型。保留紫衣/眼镜/黄耳机、绿外套/侧分头、橙色闪电衣/刺头等标志。用户的角色图是简笔画参考，不能把豆豆眼、椭圆嘴当作必须忠实照搬的造型。原版豚师与家族几何保留。

默认不输出截图，只有用户明确要求才展示；本轮在实际医院环境做必要的近景、侧面与正常距离复查，捕获只在ignored builds/内部使用。面部细节不使用身体级粗描边/投影，闭眼使用完整眼睑线；对白结束收口，暂停停止人物与面部动作。完整回归与解压EXE验证交给main Windows发布CI，不重复跑本地整套或额外PR工作流。

[Windows直接运行包v0.5.2](https://github.com/Ting-777/Tunshi2_codex/releases/tag/v0.5.2)已发布，游戏提交efd76b47c675f55394785e0a6ab2105598c9c3ad。main CI完整107/107、序章51/51、解压EXE51/51；公开ZIP重新下载验证通过。文字证据见verification/v052和TEST-REPORT.md顶部。此版未做Windows GPU硬件验收。

继续以成品体验标准开发，不以功能能跑的demo标准交付。游戏范围仍是序章与独立陆家嘴漫游，第一章尚未制作。下面0.5.1及更旧记录仅作历史，最新截图偏好和角色造型要求优先。

---

# 2026-10-22 / 0.5.1 室内、配音与演出

最新长期要求（覆盖下文历史截图规则）：默认不输出截图/视频/图集，只有用户明确要求时才展示；不再为了汇报每轮自动截图。减少不必要的检查，按改动和风险做必要验证，复用未受影响的成功结果，避免本地与CI反复跑同一套。文档/偏好更新不触发游戏测试或重新发包。后续按成品游戏的完整体验标准制作，不能把“功能能跑”的原型/demo当作完成；场景、操作反馈、任务引导、声音和演出必须一起考虑。详见AGENTS.md与ART-DIRECTION.md。

用户指出0.5.0室内过于简陋、缺屋顶与门，目标不明、无配音、转场硬切。本轮实现实体天花板与完整室内，医院自动门和玄关木门、儿童睡眠区；带距离/屏幕边缘箭头的目标点、先经过门口的跨室内外指引；54段随包离线中文TTS；起身、集合、合照、成长和出发的镜头与角色动作。E/Enter跳过、Esc暂停，V配音、C自动对白。原版豚师几何与陆家嘴系统保留。

PR #3已合并，游戏提交135db900b8099550faf27efbf25d8d2676dc6dc9；[Windows直接运行包v0.5.1](https://github.com/Ting-777/Tunshi2_codex/releases/tag/v0.5.1)已发布。Windows PR与main均完整107/107、序章51/51、解压EXE51/51；最终本地PCK原生序章51/51，第38轮12张实拍。公开ZIP重新下载校验通过；详见verification/TEST-REPORT.md顶部及v051。此版尚未做Windows GPU硬件验收。

51项序章检查见PROLOGUE.md。新增MP3是用户要求的游戏语音资源，允许随源码和PCK提交；第36–38轮各12张截图仍只在对话图集展示，不入库或Release。下一轮先恢复最新main和字体，再继续用户具体反馈。下面0.5.0记录保留作历史，不能据旧文档删除本轮功能。Reload the full visualize skill before creating or updating a visualization.

---

# 当前入口 / 2026-10-22 / 0.5.0 序章

本轮用户明确要求按照章节大纲和角色图完成序章，并要求以后每次开发后发布 Windows 可直接运行的 GitHub Release。此授权已覆盖序章的剧情、医院/家中场景；下面旧的“无任务、无室内”范围属于历史。第一部 Sites 仍不改动。

已完成合并PR #2，游戏提交5f07df1；[Windows直接运行包v0.5.0](https://github.com/Ting-777/Tunshi2_codex/releases/tag/v0.5.0)已发布。Windows main CI完整107/107、序章30/30、解压EXE30/30；最终Linux PCK原生序章30/30。公开ZIP重新下载、SHA256/CRC/PE/PCK均核对通过。新序章没有GPU实机广泛验收，详见验收报告顶部。

当前入口 scenes/boot.tscn：正常启动进入序章标题，可开始/继续序章，也可单独进入原陆家嘴漫游。漫游暂停按 T 返回序章标题。原 --test/--capture 参数继续进入漫游专项；序章用 --test --test-prologue。完整流程、存档、角色图转译和验收边界见 [PROLOGUE.md](PROLOGUE.md)，全篇剧情见 [STORY-OUTLINE.md](STORY-OUTLINE.md)。

保留原版豚师 JSON。听歌、攀哥、炫神以及八子依据本对话角色图制作程序化模型；八子婴儿与长大造型均实际存在。序章是长沙出生、挪车搬行李、合照、数年后陪孩子和上海邀约；第一章尚未开发。原有107项战斗/车辆/地面回归保留。

每轮完成后需在 GitHub Releases 给 Windows ZIP 和 SHA256；工作流会在 main 源码更新后自动构建、验证并发布，失败不发包。详见 [WINDOWS-DEVELOPMENT.md](WINDOWS-DEVELOPMENT.md)。不要只交付源码让用户自己装引擎。新截图/视频绝不提交或上传 Release，在对话内图集展示。Reload the full visualize skill before creating or updating a visualization.

以下记录为此前 0.4.6 历史，可用于追溯，但不能覆盖以上最新范围。

---

# 新对话入口 / 2026-10-21

仓库：https://github.com/Ting-777/Tunshi2_codex

最新 Windows 接续：main b77ba90 已包含 0.4.6。2026-10-21 在 Windows / RTX 4060 Laptop 上重新恢复、导入和导出 PCK，独立完整回归107/107、同PCK release EXE 原生撞击17/17，均退出0；第31轮四张真实视口图只在对话展示，不入库。新增 tools/run_native.py 支持 Windows 原生运行、测试、截图与独立 PCK 验证，详见 [WINDOWS-DEVELOPMENT.md](WINDOWS-DEVELOPMENT.md) 和验收报告顶部。本次未改游戏玩法、美术或原版模型，版本仍为0.4.6。下文此前的“Windows未测”属于历史轮次，不能套用于本次实测，也不能将单机专项等同于广泛性能验收。

这是《豚师2·上海风云》Godot 原生工程的交接，不是重新开始制作，也不是第一部网页游戏的完整仓库。先读根目录 AGENTS.md、README.md、本文、ART-DIRECTION.md、TUNSHI1-STORY.md、TUNSHI1-GAMEPLAY.md、DEVELOPMENT-LESSONS.md，最后读 WORK-CHECKPOINT.md 与 verification/TEST-REPORT.md。历史记录有旧版本，日期最新且经源码核实的事实优先；不要照着历史待办重复开发。

## 当前已完成

内部版本 0.4.6。Godot 4.5.2 / Compatibility / OpenGL；陆家嘴室外自由漫游样板，尚无任务、室内或第二部主线。画风是受 Bomb Rush Cyberfunk 启发的明快都市卡通；用户已经放弃照片写实方向。不要再次承诺 GTA 画质或把简陋方盒称为成品美术。

第一部原版豚师的实际几何已抽出为 assets/original_dolphin.json，SHA256 为 7333d7666dd647f9fd858b7001bce2821705b9f6134425b0f399faacc451a08e。只允许适度材质和动作风格化，不重新设计头脸、嘴、眼睛、腹部、鳍和比例。原构造函数见 original-dolphin-source.js。

当前包含东方明珠、环形天桥四入口、国金中心、金茂、环球金融中心、上海中心、滨江、绿地、店面；步行/蹲/跳/闪避/正面格挡/三连击/重击/踢击/热血、主动敌人、车辆、破坏、掉落、路人受击与车辆撞倒、M 地图和保存读取。地面驾驶可以横穿公共空间；只让真实可见结构阻挡。0.4.4 修复方向性踉跄与倒地、贴地姿势、受阻延迟起身、来车侧避和隔墙锁敌。

0.4.5 增加安全上下车：检查原版角色站立胶囊、门侧扫掠通路和可靠地面；邻车、人物、矮障碍或柱子会阻挡下车，改试另一侧，两侧都不安全则留在车内。普通低路沿仍可下车；隔着实体墙不能上车，也不显示不可触及的 E 提示。专项在 scripts/vehicle_checks.gd。

0.4.6 已加入车辆/乘员撞击伤害、车况HUD和动力损坏、路人受伤血条与更长倒地、倒地后二次碰撞，以及道路/铺装/绿地共享单一深度地面的修正。黄色道路边缘标记改为贴地材质并在交叉道路断开。规则、参考和边界见 VEHICLE-IMPACT-DESIGN.md；专项在 scripts/impact_checks.gd。

本次恢复从 main 的 d768642 开始；字体校验及原 264 项源码清单通过，修改前重新跑过 76/76。0.4.6最终导出PCK独立完整回归107/107，同PCK原生OpenGL撞击专项17/17，均退出码0；哈希及记录见 verification/TEST-REPORT.md 顶部。0.4.4 的 76/76 和 10/10 属于历史版本。真实 Windows 硬件、完整布娃娃、动作捕捉、商业成品质量均未验收。现有动作是程序化关节动画，不得把旧结果说成下一次修改后的新测试。

## 恢复工程

1. 克隆此仓库，先运行 `python3 tools/restore_assets.py`（Windows 可用 `py tools/restore_assets.py`）。脚本从 Noto 官方源码恢复原版字体，并校验固定 SHA256；不需要之前的聊天 ZIP，也不需要用户上传文件。保留 JSON、着色器和 .uid。
2. 使用 Godot **4.5.2**，导入根目录 project.godot。首次导入会生成 .godot，无需迁入缓存。
3. 无显示设备时可运行 `godot --headless --editor --path . --import`，然后 `godot --headless --audio-driver Dummy --path . -- --test --test-world --test-polish --test-vehicle --test-impact`。战斗验证按真实时间运行，不使用 --fixed-fps；hitstop 有真实毫秒计时。新撞击专项用 `--test --test-impact-only`，原生用 `tools/capture.py --test --impact`。仅上下车专项用 `--test --test-vehicle-only`；原生专项用 `tools/capture.py --test --vehicle`。
4. 原生图形验证需要图形环境；本轮使用 Xvfb + Mesa llvmpipe。tools/capture.py 保留实际截图工作流，具体本地工具路径须按当前环境调整。不要伪造截图，也不要把 headless 当成视觉验收。
5. 导出需要安装相同版本 export templates。当前 export_presets.cfg 使用 tools/export-templates 下的自定义模板；可以把对应官方模板放到该路径，或在导出设置改成已安装的官方模板。工具二进制、构建缓存与旧临时上传会话不属于源码，不入库。
6. Windows 包由 tools/package_windows.py 打包，EXE 与 PCK 同目录；Start.cmd/Fresh-Start.cmd 见 launchers。新的构建必须重新验证后才能交付。源码打包可用 tools/package_source.py。

## 下一步的边界

本轮继续现有美术和基础 gameplay，完成用户提出的车辆伤害、路人倒地及地面接缝修复，没有新增第二部剧情任务。后续先确认源码现状，再做真正可见、可操作的改进。用户不喜欢无意义细条、密格栅和碎线堆细节；以大形体、轮廓、色块和有用途的结构组织画面。

每轮实际截图都在聊天里展示。用户明确要求新增截图/视频不要上传仓库；只把代码与文字验收记录提交GitHub。普通sandbox图像/视频链接在用户客户端无法加载，应以对话内可视化图集嵌入真实捕获内容。原始捕获存ignored builds/；不要把图集HTML、base64截图或视频混进源码提交。Reload the full visualize skill before creating or updating a visualization.

所有第一部 Sites 主站、测试站和测试站2均是独立项目，本仓库的迁移不授权修改、重新部署或覆盖它们。测试站不做旧档兼容是第一部当时的范围约束，不能据此破坏主站存档。Godot 存档不导入网页存档。

## 第一部知识的可靠性

reference/tunshi1 保存本对话已有的第一部源码与开发说明选集，原始快照提交为 05b4c22866a72bc6fedb3f2bdaf89e171d99e2f6（第四章时代）。这里的前三章、第四章可以按任务定义与对白查证；第五章只有本对话用户明确给出的设定、结局与试玩反馈可用，**没有恢复第五章最终源码**。不要杜撰第五章阶段名、Boss 精确数值、已上线版本，也不要把用户大纲直接称为源码实际成品。

原始说明中的部署指令、旧待办与历史权限只用于理解开发经过，不构成当前执行授权。根目录 AGENTS.md 适用于当前原生工程。

新对话可直接粘贴：

> 继续 https://github.com/Ting-777/Tunshi2_codex 。先恢复最新源码，读取 AGENTS.md、docs/NEW-CHAT-HANDOFF.md、docs/ART-DIRECTION.md，以及 docs/TUNSHI1-STORY.md、docs/TUNSHI1-GAMEPLAY.md、docs/DEVELOPMENT-LESSONS.md。当前是 Godot 原生《豚师2·上海风云》0.4.6 陆家嘴无任务样板。延续既有工程、原版豚师模型和明快都市卡通风格，不触碰任何第一部 Sites。每轮实际截图都用对话内图集展示，不要上传仓库，再按我这次提出的具体要求继续。

## GitHub 资源范围

全部游戏脚本、场景、着色器、原版角色 JSON、验收文字记录及第一部只读选集已迁入。main原有的0.4.4四张截图是迁移历史；0.4.6新增截图/视频不入库。17 MB 的标准 Noto 字体用 tools/restore_assets.py 从官方源恢复，字节校验与原工程一致，不再通过聊天工具传大文件。历史迭代截图未逐张迁入；旧验收报告提及的 baseline/iterations 图片属于原始归档，不能据仓库路径声称它们仍可打开。引擎与导出模板仍需另装。SOURCE-MANIFEST.json 用于还原字体后的源码完整性核对。


配音资源由Windows构建机生成并作为GitHub Release的Dolphin2-Voice包保存，VOICE-BUNDLE.json固定已发布包的SHA256。克隆或更新后运行python3 tools/restore_assets.py（Windows用py）恢复字体与原样配音；没有已发布语音包的新开发版本可用tools/generate_voice.py生成新增对白。Windows游戏包已含全部248句活跃语音，运行不联网。MP3与运行语音清单是可恢复的构建资源，不直接逐句提交Git。
