# 0.8.0 剧情通读与章底战 / 2026-10-23

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

# 2026-10-23 / 0.6.0 第一章：Gameplay 优先

从main c3a6ffd继续，新增可连续完成的第一章《八个，一个都不少》。天桥真实竞速与东/西半圈选择、十座可驾驶全家车与蛋糕状态、完整滨江生日场地、目标真实受伤/失败/重试的撤离战、实际可控制的后勤门、护送/守备/冲撞敌人机制及家庭收束。37条新语音，总计102条。原版角色JSON不变，旧序章与漫游独立保留；章节状态/受伤/车损/门/敌我/破坏保存。

本地实际输入跑过桥坡和半圈、开车加速/制动/撞墙受伤；33项检查初轮32过1失败，失败来自验证驾驶员在树/长椅前转弯的路线。调整验证路线后4段驾驶均通过并送达stage3，未改场景碰撞迎合测试；之前移走放在路口中央的摆设车是实际通行改进。撤离战已实际保护工作人员、击败院内敌人并进入章末、存读档通过。未重复本地全套107/61；最终完整验证交Windows main CI一次完成。

原生Xvfb/Mesa实看竞速、全家车、会客厅、院落和暂停菜单。修复院外灯光泛白、工作人员终点落入车身碰撞、院门阻挡状态读档、剧情后残留敌人、HUD挡路面与车辆后窗。引擎循环声退出需主动停止释放；最终原生文字日志干净。截图只在ignored builds内部，未输出或提交。[v0.6.0 Windows运行包](https://github.com/Ting-777/Tunshi2_codex/releases/tag/v0.6.0)已发布。游戏提交b994694ecd6ad6f5660a106b5d2a473d0138da8f，main运行[39898301779](https://github.com/Ting-777/Tunshi2_codex/actions/runs/39898301779)成功：独立PCK完整107/107、序章61/61、第一章33/33；解压EXE序章61/61、第一章33/33，退出0且自动发现同目录PCK。ZIP 51,387,125字节，SHA256 bd24e5d5cc672343affde9e1cddec15a209814967ecba9c1b83774be312757e5，与GitHub资产摘要一致，附独立校验文件。文字证据见verification/v060/release.json、windows-main-ci.txt及chapter-final-results.json。本轮没有额外下载公开ZIP重复检查，无Windows GPU硬件验收结论。

发布前修订：自动--test-chapter1入口必须从独立测试槽的新章状态开始，不读取前一次PCK/EXE检查留下的进度。普通玩家继续读档规则不变。main工作流改为只保留最新提交在跑，避免过期构建抢先发布。

首次Windows运行39896659591完整107/107、序章61/61通过；章节验证驾驶员到会场外才转弯，碰上实体围墙，后续继续索引未生成的撤离人员而超时，未发包。已提前停车转弯点（按实际导航从较南位置驶向停车处），并让关键阶段失败立刻生成失败结果退出，不再空等超时；原始日志first-windows-chapter.log保留。

最新本地完整第一章验证33/33，退出0，37条章节语音全部随包可加载，4段驾驶、正常演出到战斗、实际作战/撤离/读档全链路通过。见chapter-final.log和chapter-final-results.json；日志无SCRIPT ERROR/ERROR，进程退出仍有ObjectDB警告，未删除。正常原生场景释放日志native-polish.log干净，不将其等同于全面内存验收。

---

# 2026-10-23 / 0.5.4 结局衔接演出

从main00b7bd0恢复。新增LegacyOpening/LegacySet：问天台晨光、蓝衣朋友归队、两句正式宣告、回家日常和八子计划，最后接原医院起身。11条新中文TTS（新增193,536字节），总65条；原版豚师和现有角色五官不改。约一分钟连续原生分镜、动作、淡入淡出及原创合成环境声/轻音乐。标题独立重看、跳过、暂停和V配音；version1旧档兼容，重看不动进度。

最终原生OpenGL完整演出实看及新增10项集成检查通过，日志与结果见verification/v054。初检修复家中镜头插值偏移、天空资源切换泄漏，标题改为江景上排字；修正后无脚本/渲染错误。捕获只在ignored builds内部使用，遵守默认不输出截图要求。不重复本地全套回归；[v0.5.4 Windows Release](https://github.com/Ting-777/Tunshi2_codex/releases/tag/v0.5.4)已发布。游戏提交aebd090c0f7c5b85112e53052b95387e6c1fd151，main运行[39888885000](https://github.com/Ting-777/Tunshi2_codex/actions/runs/39888885000)成功：完整107/107、序章61/61、解压EXE61/61，退出0且自动寻找同目录PCK。ZIP为50,550,162字节，SHA256 f9e305c43ea2d38d4f5cb45cde4b5e6c03227679c94d1ea4a3ddebd32d6df6c7，与GitHub资产摘要一致；附独立SHA256文件。证据见verification/v054/release.json与windows-main-ci.txt。CI实际解压并运行EXE，本轮未额外下载公开ZIP重复检查；没有Windows GPU实机结论。

---

# 2026-10-22 / 0.5.3 圆润卡通眼睛

从mainff036af恢复，用户反馈三位老朋友尖杏眼吓人。仅调整StoryFace眼睛/眉毛和听歌镜框：圆润椭圆轮廓、大虹膜/瞳孔、适量眼白、柔和高光，无尖眼角和上挑斜度。眼睛各层映射到真实头部曲面，侧转仍完整；新闭眼宽度和镜框纵向圆角匹配。脸型、鼻嘴、身体、服装、原版豚师/家族与玩法不改。

本地Godot实际医院近景、侧面、闭眼和正常游玩距离复查通过；日志见verification/v053，捕获只在ignored builds/内部使用，未输出图集或上传截图。未重复本地全套回归；游戏提交8bc7f8f8439489b60696195c651a84f659bc1a73，main Windows完整107/107、序章51/51、解压EXE51/51。版本[v0.5.3](https://github.com/Ting-777/Tunshi2_codex/releases/tag/v0.5.3)已发布，资源摘要与CI记录一致。未额外下载ZIP复测，没有本版Windows显卡实机结论。

---

# 2026-10-22 / 0.5.2 人物面部重制

从main055ddc7恢复，用户指出角色简笔画不应直接照搬为豆豆眼和椭圆嘴。新增StoryFace替换听歌、攀哥、炫神头脸：不同下颌比例、眼白/虹膜/眼睑、眉形、立体鼻部、完整唇形、镜框/耳机头梁及发型适配。保留人物衣着和配件识别、原版豚师/家族模型与现有剧情。眨眼时序错开，闭眼没有白线残留；说话多口型切换，超过对白时长收口；暂停冻结人物与面部动作。

实际医院内近景/侧面/正常距离复查完成，临时检查验证暂停、对白结束和说话口型，日志在verification/v052。捕获留ignored builds/cast-faces，仅内部复查，遵守用户默认不输出截图要求。没有生成新图集、上传截图或跑重复的本地全套回归。游戏提交efd76b47c675f55394785e0a6ab2105598c9c3ad，main Windows完整107/107、序章51/51、解压EXE51/51；[v0.5.2](https://github.com/Ting-777/Tunshi2_codex/releases/tag/v0.5.2)已发布并重新下载校验。此版没有Windows显卡实机结论。

---

# 2026-10-22 / 0.5.1 室内、引导、配音与演出

从main038bb2e恢复，先读交接及第一部资料并恢复官方Noto字体。按用户四项反馈补齐医院与家中实体屋顶、灯具、分区和家具；医院/儿童房自动玻璃门与玄关旋转木门有真实碰撞。任务显示世界位置、距离和屏幕外方向，跨室内外先引导经过门。54段中文TTS随包离线播放，V开关、C自动对白。开场起身、出院、集合、挥手合照/快门、成长蒙太奇和全家出发有镜头及角色动作，支持跳过与暂停，禁止保存半截转场。原版豚师JSON字节不变，原陆家嘴与0.5.0序章检查点保留。

源码序章51/51，最终独立PCK原生OpenGL序章51/51（PCK SHA256 d55ab01c1b77ea9511c36a9ce280279cd61c33d9b572d9c93b2ac12180eb6683）。54个MP3全部完成解码与非静音检查。Windows PR CI完整107/107、序章51/51、解压EXE51/51，通过后PR #3合并main135db900b8099550faf27efbf25d8d2676dc6dc9。main同样全部通过并发布[v0.5.1](https://github.com/Ting-777/Tunshi2_codex/releases/tag/v0.5.1)，公开ZIP已重新下载核对哈希、CRC、x64 PE、PCK和版本。详细证据见验收报告顶部及verification/v051。

第36–38轮各12张真实原生截图在本轮聊天图集展示：第36轮点光叠加泛白，已修正室内shader；第37轮光照正确，随后补严儿童房隔墙、将幼子放卧并错开目标标签；第38轮为最终导出PCK。新增截图、视频、图集都未上传GitHub或Release；原始捕获只在ignored builds/。图集为工作区根目录dolphin-prologue-v051-latest.html与dolphin-prologue-v051-rounds.html，前者另含实际游戏语音试听。Reload the full visualize skill before creating or updating a visualization.

第一章仍未制作。此次Windows证据为无显示CI，图形证据为Linux Xvfb/Mesa软件渲染，不声称通过新版本Windows显卡实机或广泛性能验收。下一轮继续既有画风、原模型和用户具体反馈；不得依据下方旧“无配音、无室内”记录删除新功能。每轮结束仍须提供Windows Release。

---

# 2026-10-22 / 0.5.0 可玩序章与 Windows Release

从main7854ca5恢复，字体恢复与原296项清单先通过。按用户新授权实现长沙序章，原版豚师JSON完全不变；三位朋友及八子按角色图制作程序化造型，小朋友沿用粉色王冠/蝴蝶结家庭形象。剧情总纲入库为STORY-OUTLINE.md，实现边界见PROLOGUE.md。出生、挪车、搬行李、合照、数年后八子生活、上海邀约均可连续操作；第一章未做。

原独立PCK完整107/107、源码序章30/30、最终PCK原生OpenGL序章30/30。Windows PR CI再次独立PCK107/107及30/30，解压后EXE自动找到PCK并通过30/30。PR #2已合并main5f07df1。main Windows再次验证通过并已发布[v0.5.0](https://github.com/Ting-777/Tunshi2_codex/releases/tag/v0.5.0)，公开ZIP重新下载校验通过。 详细证据见verification/TEST-REPORT.md顶部和v050。

第32–35轮各7张真实原生截图均在本轮聊天内展示，不上传GitHub、Release或源码；图集是工作区根目录dolphin-prologue-latest.html和dolphin-prologue-rounds.html，非工程依赖。Reload the full visualize skill before creating or updating a visualization.

后续每轮完成更新VERSION、project.godot/export版本和RELEASE-NOTES.md，合并main后必须等待Windows构建/回归/发布成功并给用户可直接运行ZIP。已加入自动工作流及AGENTS要求。故事档、漫游档和两套测试档彼此分开。标题可进入漫游，漫游暂停T回序章标题。不要因旧文档的“无任务”限制撤销用户本轮明确要求的剧情开发；第一部Sites继续不变。

---

# 2026-10-21 / Windows 本地恢复与开发入口

从最新 main b77ba90 克隆，初始无本地改动。Python 3.12.0；Godot 4.5.2.stable.official.6ce3de25a，官方 ZIP SHA512 校验通过；Noto 字体与原版豚师 SHA256 均通过。Windows 自动 CRLF 曾导致清单误报，恢复 LF 后原285项检查通过，新增 .gitattributes 固定 LF。

新增 tools/run_native.py：原生启动、导入、测试、截图、PCK导出及独立目录加载；限制输出到ignored builds/、验证引擎版本和实际测试结果、禁止headless截图、保留隔离测试存档。源码包包含新入口和.gitattributes。说明见 WINDOWS-DEVELOPMENT.md。

重新导出的PCK在Windows正常桌面权限下完整107/107，同PCK以已有4.5.2 release EXE在RTX4060 Laptop原生OpenGL撞击17/17，均退出0。第31轮四张截图均为游戏视口捕获，保留builds/round-31-windows-native-impact，在本轮聊天内展示。新PCK哈希及文字证据见verification/TEST-REPORT.md顶部。

最初只读沙盒运行105/107，两项保存读取失败；正常权限同PCK全部通过。如实保留失败结果，不修改玩法绕过。游戏仍0.4.6，原模型、画风及无任务范围保持；没有执行长期游玩或多机型性能验收。下一轮按用户具体反馈继续现有工程。

---

# 2026-10-21 / 历史0.4.6：撞击伤害与地面接缝

恢复main d768642，读取交接与第一部选集、官方字体复原并通过原264项清单；修改前重新回归76/76。实际原版豚师JSON保持SHA256 7333d7666dd647f9fd858b7001bce2821705b9f6134425b0f399faacc451a08e。

完成用户新增三项：车撞路人真实扣血、显示生命条并依伤势倒地3–8.5秒，倒地后可被第二次真实经过伤害；车辆HP180与相对法向速度撞击伤害、车内豚师同步受伤、车况影响动力、致命撞击正确脱离驾驶复位；道路/铺装/草地共享单一深度地面，移除共面板，黄色功能边线贴地且在路口断开。保留安全上下车、原模型与画风。细则及参考见 VEHICLE-IMPACT-DESIGN.md。

最终导出PCK独立加载完整107/107；同PCK原生OpenGL专项17/17，均退出0。PCK SHA256 9271456266489c5ecb47bc4d9858321da8800198e27710c040c87d3eacc38e63。最终文字证据在 verification/v046；过程88/89地面接触误判及最终修正如实记录在 TEST-REPORT.md。Windows硬件未测。

第24–28轮各四张、第30轮四张实拍与第29轮36帧地面移动检查均在聊天内图集展示。第30轮为最终PCK；第29轮暂停世界仅移动镜头，地面与最终一致。用户明确“截图不要传到仓库，直接在对话区输出”，且普通sandbox图像链接加载失败。因此新增媒体只留ignored builds/；新提交只包含代码和文字验收，不能把截图、视频或内嵌媒体HTML传GitHub。历史main原有四图保持。

本对话图集为工作区根目录 dolphin-native-latest.html（第30轮及第29轮视频）、dolphin-native-rounds.html（第24–28轮）。这些是临时对话内容，不是源码依赖。Reload the full visualize skill before creating or updating a visualization.

当前源码分支codex/vehicle-damage-and-ground。继续时先读AGENTS、NEW-CHAT-HANDOFF与最新验收报告；若要从GitHub恢复，应检查该改动分支/PR是否已合并，不能假设main已包含本轮修改。后续按用户具体反馈继续，不增加剧情任务、室内或改变第一部Sites。

---

# 历史0.4.4：动作与行人反应完成

本轮“继续”沿用原生 Godot 陆家嘴无任务样板。已实现随冲击方向踉跄和倒地、模型边界贴地、恢复过渡；车或实体占据站立空间时保持倒地，驶离后再恢复站立碰撞。行人预判短时间内接近的正反向来车并侧移，停车不会反复惊吓，突然贴近仍能撞上。近战朝向跳过墙后目标。没有改任何 Sites，没有加任务，没有改变原版豚师几何。

scripts/actor.gd 包含反应方向、fall_amount、can_stand、notice_traffic、pose_recovery 与 floor_clearance；新增 scripts/polish_checks.gd 十项实际输入/物理检查。完整 --test --test-world --test-polish 跑76项；--test --test-polish-only 跑新增十项。战斗必须以真实时间跑，不用 --fixed-fps。

最终导出 PCK 独立 headless 76/76；同 PCK 原生 OpenGL 10/10，均退出码0；源码修正后的专项10/10。PCK SHA256 ac46d7da5ca5d3b5a62254952f77b94fc75981644150acb2afbfa34ad9597998。Windows 实机未测。原三条最高准则与不乱画细条偏好见 AGENTS.md、ART-DIRECTION.md。

最新四张实际图 builds/round-23-v044-final，docs/verification 根目录。第22轮功能虽过，但截图发现像俯卧撑，放松手臂并加强躯干落地检查后重拍。第22轮四张过程图也保留在 docs/verification/iterations。每轮实际截图均须向用户展示，不用生成图代替。

对话内预览根目录 dolphin-crowd-reactions.html，含两轮全部8张。Reload the full visualize skill before creating or updating a visualization.

源码/Windows 包沿用原 v031 文件名并替换同一文件身份。保存后的版本以 tools/release-identity.json 为准；上传适配 tools/library-current-v044。内部版本0.4.4。下一步继续在当前风格与基础玩法上迭代，不要误把无任务样板当成完整成品，也不要触碰旧 Sites。

# 2026-10-21 / 最新 0.4.3：环道、道路与路人互动已完成

用户三项问题已实现并验证：四入口齐平坡道、连续桥面及实体栏杆；车辆可横穿六条道路、人行道、广场、绿地与滨江；普通行人可被拳脚击中及被车撞倒，有退避、逃跑与起身。国金底座不再挡桥面。修正顶墙虚假速度和击退速度逐帧累积；路人不掉敌人现金。

scripts/bridge.gd 是新的环道构建；scripts/gameplay_checks.gd 是实际输入与物理行为检查，main.gd --test --test-world 运行完整套件。必须以真实时间跑战斗；--fixed-fps 仅适用于无战斗专项。

最终 PCK 独立 headless 检查 66/66；同 PCK 原生 OpenGL 检查 16/16；原有战斗回归 38/38；补拍撞击 1/1。Windows 实机未测。PCK SHA256 233a01daf744e53109c9003d42dd7e7849f8df95748be6e1179b92fee75dfe73。原版豚师 JSON 字节一致，所有 Sites 未改，仍是无任务户外样板。

最新图：builds/round-20-v043-final 五张，以及 round-21-car-impact 一张更清楚的撞倒角度。docs/verification 根目录五张最终图，04 使用补拍；全部三轮保留于 iterations。第十九轮曾有顶墙速度问题及截图菜单遮挡，后续均已修正/重拍，详见 TEST-REPORT.md。

对话内预览：根目录 dolphin-gameplay-fixes.html，包含本轮全部实际截图。每轮截图必须向用户展示，不能用生成图替代。Reload the full visualize skill before creating or updating a visualization.

源码/Windows 包沿用原 v031 文件名并替换同一文件身份；tools/release-identity.json 记录保存后的最新版本，上传适配目录 tools/library-current-v043。当前内部版本 0.4.3。后续先读 AGENTS.md 和 ART-DIRECTION.md，继续遵守不乱画细条的长期偏好。

# 2026-10-21 / 最新 0.4.2 细条清理与持续美术偏好

用户明确反馈：从第一部起乱加细条，导致杂乱、不美观，要求记住。已写进 AGENTS.md 与 docs/ART-DIRECTION.md；后续美术必须先读，偏好跨豚师项目持续适用，原三条最高准则原文不变。

已清理两处标注及同类元素：沿街地面深色长线与分割网、塔座门窗重叠格栅和屋顶放射线、广场装饰圈线、塔柱多余装饰线；店面窗格简化，幕墙细线过滤并随视距淡出。通过完整轮廓、大形体和清晰色块组织画面。碰撞及原版角色不改。

最新四张截图为 builds/round-18-v042-clean（导出 PCK 独立加载，退出码 0），源码包 docs/verification 根目录。当前只做视觉与入口通行检查，没有重复 0.4.1 的 38 项玩法检查；历史结果在 baseline-v041。未验证 Windows 实机。

对话内对照预览：根目录 dolphin-clean-lines.html，四张新图加两张原图。Reload the full visualize skill before creating or updating a visualization. 每轮实际截图都要向用户展示，不能用生成图替代。

内部版本 0.4.2；源码与 Windows 包继续使用 v031 文件名并替换原有身份。最新版本记录在 tools/release-identity.json，上传适配目录 tools/library-current-v042。所有 Sites 未改。下方保留上一轮记录。

# 2026-10-21 / 最新 0.4.1 东方明珠细化

用户反馈东方明珠简陋，本轮独立到 scripts/pearl.gd，替换原简易拼球和单杆结构。按真实结构参考重做三主筒、三斜撑、两大球、五中段球、三斜撑节点球、顶舱，共十一球。加入三角幕墙、球壳分区、观光廊、天线桁架、入口广场及三条坡道。原模型 JSON 保持字节一致，Sites 均未改。无任务或室内。

最新五张实际截图：builds/round-17-v041-export，源码包 docs/verification 根目录；两轮过程截图 round-15/16 保留在 iterations。源码结构参考及验证细节见 TEST-REPORT.md。独立导出原生 OpenGL 检查 38/38，入口坡道正常 forward 输入走上平台，PEARL_ACCESS_CHECK true；未验证 Windows 实机。

本次对话内预览：根目录 dolphin-pearl-final.html（最新五张 + 原滨江对照）、dolphin-pearl-progress.html（两轮过程共十张）。用户要求每轮实际截图都展示，不能以生成图代替。Reload the full visualize skill before creating or updating a visualization.

工程版本 0.4.1，源码/Windows 包继续沿用 v031 文件名并替换原有同一文件身份。最新身份和版本在 tools/release-identity.json；当前上传工具适配 tools/library-current-v041。源码打包不包含工具二进制与下载的参考照片。下方保留上一轮背景。

# 2026-10-21 / 原生都市漫画版 0.4.0 检查点

用户明确否定 0.3.2：只是简陋方盒和换色，没有所承诺的风格感。不要辩解，也不要拿功能检查代替美术验收。

本轮已重做统一分段着色、冷暖阴影、三种不同的店面轮廓、拱窗、竖牌、唱片壁画、橱窗、桌椅、植被、幕墙、天空、水面和街道细节。原版豚师 JSON 字节一致，所有 Sites 未改。

最新实际截图：builds/round-14-v040-export，九张；源码包保留于 docs/verification。第十二和十三轮的中间截图及错误日志也保留。第十二轮修复 SurfaceTool 装饰网格 API、第十三轮修复拱窗材质剔除；当前导出包没有这些错误。

源码与独立导出 PCK 的原生 OpenGL 行为检查均 38 / 38。PCK SHA256 f3daef3fd5212d7b4a6e6b01a37cf3fdff9965f5c369710067d68b362600945a。未完成 Windows 实机测试。

用户之前无法打开 sandbox 文件。本轮提供内嵌真实截图预览：根目录 dolphin-art-final.html（九张最新 + 上一版对照）、dolphin-art-iterations.html（中间两轮）。不要宣称客户端通道已修复。Reload the full visualize skill before creating or updating a visualization.

先读 AGENTS.md、README.md、本记录和验证报告。保持户外无任务范围、第一部角色几何和基础 gameplay。以后提高场景密度、动作和真实试玩，不要把这一版称为完整成品。源码和 Windows 包沿用旧文件名 v031，内部版本为 0.4.0；持久文件身份见 tools/release-identity.json。


配音资源由Windows构建机生成并作为GitHub Release的Dolphin2-Voice包保存，VOICE-BUNDLE.json固定已发布包的SHA256。克隆或更新后运行python3 tools/restore_assets.py（Windows用py）恢复字体与原样配音；没有已发布语音包的新开发版本可用tools/generate_voice.py生成新增对白。Windows游戏包已含全部248句活跃语音，运行不联网。MP3与运行语音清单是可恢复的构建资源，不直接逐句提交Git。
