# 2026-10-21 / 最新0.4.6：撞击伤害与地面接缝

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
