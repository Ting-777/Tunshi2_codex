# 当前入口 / 2026-10-22 / 0.5.1 室内、配音与演出

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
