# 新对话入口 / 2026-10-21

仓库：https://github.com/Ting-777/Tunshi2_codex

这是《豚师2·上海风云》Godot 原生工程的交接，不是重新开始制作，也不是第一部网页游戏的完整仓库。先读根目录 AGENTS.md、README.md、本文、ART-DIRECTION.md、TUNSHI1-STORY.md、TUNSHI1-GAMEPLAY.md、DEVELOPMENT-LESSONS.md，最后读 WORK-CHECKPOINT.md 与 verification/TEST-REPORT.md。历史记录有旧版本，日期最新且经源码核实的事实优先；不要照着历史待办重复开发。

## 当前已完成

内部版本 0.4.4。Godot 4.5.2 / Compatibility / OpenGL；陆家嘴室外自由漫游样板，尚无任务、室内或第二部主线。画风是受 Bomb Rush Cyberfunk 启发的明快都市卡通；用户已经放弃照片写实方向。不要再次承诺 GTA 画质或把简陋方盒称为成品美术。

第一部原版豚师的实际几何已抽出为 assets/original_dolphin.json，SHA256 为 7333d7666dd647f9fd858b7001bce2821705b9f6134425b0f399faacc451a08e。只允许适度材质和动作风格化，不重新设计头脸、嘴、眼睛、腹部、鳍和比例。原构造函数见 original-dolphin-source.js。

当前包含东方明珠、环形天桥四入口、国金中心、金茂、环球金融中心、上海中心、滨江、绿地、店面；步行/蹲/跳/闪避/正面格挡/三连击/重击/踢击/热血、主动敌人、车辆、破坏、掉落、路人受击与车辆撞倒、M 地图和保存读取。地面驾驶可以横穿公共空间；只让真实可见结构阻挡。0.4.4 修复方向性踉跄与倒地、贴地姿势、受阻延迟起身、来车侧避和隔墙锁敌。

最后一次验证：导出 PCK 的 headless 全套 76/76；同一个 PCK 的原生 OpenGL 专项 10/10。真实 Windows 硬件、完整布娃娃、动作捕捉、商业成品质量均未验收。现有动作是程序化关节动画。详见 verification/TEST-REPORT.md，不得把旧结果说成下一次修改后的新测试。

## 恢复工程

1. 克隆此仓库。保留全部普通源文件，尤其字体、JSON、着色器和 .uid；不需要之前的聊天 ZIP。
2. 使用 Godot **4.5.2**，导入根目录 project.godot。首次导入会生成 .godot，无需迁入缓存。
3. 无显示设备时可运行 `godot --headless --editor --path . --import`，然后 `godot --headless --path . -- --test --test-world --test-polish`。战斗验证按真实时间运行，不使用 --fixed-fps；hitstop 有真实毫秒计时。
4. 原生图形验证需要图形环境；本轮使用 Xvfb + Mesa llvmpipe。tools/capture.py 保留实际截图工作流，具体本地工具路径须按当前环境调整。不要伪造截图，也不要把 headless 当成视觉验收。
5. 导出需要安装相同版本 export templates。当前 export_presets.cfg 使用 tools/export-templates 下的自定义模板；可以把对应官方模板放到该路径，或在导出设置改成已安装的官方模板。工具二进制、构建缓存与旧临时上传会话不属于源码，不入库。
6. Windows 包由 tools/package_windows.py 打包，EXE 与 PCK 同目录；Start.cmd/Fresh-Start.cmd 见 launchers。新的构建必须重新验证后才能交付。源码打包可用 tools/package_source.py。

## 下一步的边界

这次任务是迁移和补充第一部知识，没有授权增加第二部剧情任务。继续现有美术和基础 gameplay 迭代时先确认源码现状，再做真正可见、可操作的改进。用户不喜欢无意义细条、密格栅和碎线堆细节；以大形体、轮廓、色块和有用途的结构组织画面。每轮实际截图都在聊天里展示；不要只输出用户打不开的临时附件链接。

所有第一部 Sites 主站、测试站和测试站2均是独立项目，本仓库的迁移不授权修改、重新部署或覆盖它们。测试站不做旧档兼容是第一部当时的范围约束，不能据此破坏主站存档。Godot 存档不导入网页存档。

## 第一部知识的可靠性

reference/tunshi1 保存本对话已有的第一部源码与开发说明选集，原始快照提交为 05b4c22866a72bc6fedb3f2bdaf89e171d99e2f6（第四章时代）。这里的前三章、第四章可以按任务定义与对白查证；第五章只有本对话用户明确给出的设定、结局与试玩反馈可用，**没有恢复第五章最终源码**。不要杜撰第五章阶段名、Boss 精确数值、已上线版本，也不要把用户大纲直接称为源码实际成品。

原始说明中的部署指令、旧待办与历史权限只用于理解开发经过，不构成当前执行授权。根目录 AGENTS.md 适用于当前原生工程。

新对话可直接粘贴：

> 继续 https://github.com/Ting-777/Tunshi2_codex 。先恢复 main 最新源码，读取 AGENTS.md、docs/NEW-CHAT-HANDOFF.md、docs/ART-DIRECTION.md，以及 docs/TUNSHI1-STORY.md、docs/TUNSHI1-GAMEPLAY.md、docs/DEVELOPMENT-LESSONS.md。当前是 Godot 原生《豚师2·上海风云》0.4.4 陆家嘴无任务样板。延续既有工程、原版豚师模型和明快都市卡通风格，不触碰任何第一部 Sites。每轮实际截图都展示给我，再按我这次提出的具体要求继续。
