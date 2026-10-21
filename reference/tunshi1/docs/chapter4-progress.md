# 2026-10-03 最新续接：主线台球与四波护送

仅 TEST，从发布 v67 / `6084dd47c19341d76d7d9df08c9800800539a3ce` 恢复。《夜生活》现在从后巷战进入八号台球厅二楼：老板从楼上看见追兵，认出平常来收钱的人；豚师陪他打球时，练练联系牌馆老板，下一站去拿收钱人留下的签字。新增 `c402-pool` 是主线必经的真实台球局，练练请台费，完成一局即可，进球多少不影响推进，放弃不算完成。主线共七任务 / 31 节点，必经设施小游戏增至六种。

沿实物外楼梯 `[-130,-457]` → `[-130,-443]` 上二楼，地面不能按 E 进门；打完沿原楼梯下去接西侧巷道，不返回酒吧。台球老板与练练在二楼中央通道对话，全程留场。当前版本未完局保存实际球位/速度/杆数，关面板、暂停、后台和刷新续玩不多收台费；麻将取证节点的剧情行情仍在原处触发。

《别在这打》主路改成学院街出口、黄兴南路、步行街回口、黄兴广场西口四波，每波 3–4 人。西侧绕行保留此前两波完成记录，再遇两波，总计也为四波；换路线不会清空进度或多打。两名追打田博的敌人、近战/掷瓶真实扣血、田博自主出拳、倒地失败、喘息恢复去重和当前路口重试保持。广场的独立决战保留。主页接田博前的护送测试按钮保持，前置进度按新增台球节点准备。

`node tests/run.mjs chapter4-story` 六脚本通过：完整 31 节点与真实上下楼/必经台球；全部节点刷新/死亡/重试；八杆零进球仍推进、放弃不推进、暂停/关闭/未完局刷新及当前 Worker 精确传输；人物/视角/街头与真实大屏；四处记录防守；实际主路四波与两波共用加两波西路、田博伤害/自主反击/倒地与重试。生产 Three、输入、物理和战斗参与检查，DOM/WebGL/媒体边界为受控替身，不声称真机/GPU/人工试玩已验收。保留 v67 原曲开局修复、提前落闸与对白，旧档兼容不开发、不测试，当前版保存仍支持。只发布 TEST，未动主站；最终提交/版本/URL 以 Sites 原生记录为准。下方记录为历史，波次和节点数以本节为准。

# 2026-10-03 历史修正：KTV 开局、地下提前落闸与全章对白

仅 TEST，从发布 v66 / `318292a5d5e4673cfa881c4bd2d66d5cdd893c17` 恢复最新源码。三首原创歌的挑战改为直接加载预制原曲片段，从片段零秒开唱；完整 MP3 不动，免费全曲试听保持。已复现旧定位事件晚到超过 50ms 时，音乐继续、谱面零秒一直冻结的问题；新局不再依赖开局定位，续局定位确认容许播放头已前进。加载无进展十秒给重试，不让玩家一直等。歌曲/费用/32拍/低分必经/一次结算保持。制作与验收见 [KTV 文档](chapter4-karaoke.md)。

地下检修闸开关移到货梯出口左前方 `[地下房间 ox+8,94]`，闸门仍在 `[ox,-40]`。控制台有沿顶部接到闸门的导线，入口导航先指开关；按 E 提前落闸，30 秒后自动升起，HUD 显示剩余秒数。实际入口、物理门挡人、玩家追到门前 E 截人、刷新保存计时、到期和局部 T 重试均须验收；只改位置不算完成。

全部第四章主线对白重写，保留人物留场/电话通道、幽默、校园与购物喘息。用店主被反复收钱、同一批人控制多家公司、完整名单今晚要被带走来解释调查；提前说明店主买过的大屏时间被挪用、愿意让海豚帮用来公开证据，目的在于让他们可以一起追问而非独自被威胁。仓库街机改为等练练找备用货梯钥匙时的一局，电箱/看守/必经打砖块保持，标牌和任务一致。任务、提示、论坛和大屏用语同步简化，必要公司关系仍在；稳定 ID/剧情行情节点、原曲、所有小游戏、护送波次和田博自主反击保持。不开发/测试旧档兼容，当前版本自动保存/刷新/重试保持。

验收已通过独立 KTV 专项及六个第四章脚本：完整 30 节点通关、所有节点刷新/死亡/重试、实际货梯入口落闸追人/低分必经小游戏/昼夜/行情/当前 Worker、人物留场/视角/街头与大屏、四处真实记录防守、田博八波主路/七波西路及自主出拳。地下专项保持全部任务敌人活动，无瞬移/直接扣血/回血，确实在闭合闸前截人；保存的临时闭闸计时也通过生成 Worker 精确传输。最终提交/发布版本以 Sites 原生记录为准；只改 TEST，未动主站。DOM/WebGL/媒体边界为受控替身，不代表真机播放、GPU/人工试玩已验收。

# 2026-10-03 最新续接：田博参与护送战斗

从本 TEST 发布 v65 / `b25cc2c379d0a6fa5b49990b8e97f40615f12700` 继续。田博现在在《别在这打》的路口拦截和黄兴广场决战中，会优先朝围攻自己的近身敌人出拳；有抬手、命中、收拳动作，使用正式伤害/击退/硬直路径，检查实际距离、朝向、楼面和墙体。守备正面能挡住他的拳头。他守住位置，不追远处的掷瓶手，学校安静段不动手；仍须玩家解围，放任围攻依然会失败。接应对白同步说明他会还手。

普通拳 18 伤害、正面守备 6、重型蓄力抗击时 12；0.64 秒动作在 0.3 秒结算，2.6 秒出拳间隔，不增加玩家连击或热血。当前版本存档保存出拳阶段、目标、锁定朝向和已命中标记，刷新不重复打出同一拳；保存时重新读取物理结束后的敌人/田博位置，广场也恢复实际站位。暂停、交易面板和后台冻结；T / 死亡重试重新开始当前一拨。旧档兼容仍不开发或验收。

`node tests/run.mjs chapter4-story` 的六个受影响脚本全通过：整章 30 节点、所有节点恢复、系统/必经低分小游戏/昼夜/行情、人物/视角/街头与大屏、四处真实记录防守、护送专项。新增专项检查真实自主出拳/伤害/硬直、守备正面防御、闭合卷闸遮挡、出拳前后刷新去重、暂停/交易/后台冻结；主路八波及广场、西路七波、真实田博倒地与局部重试保持。七类当前版本存档通过生成 Worker 精确传输，非法拳击目标拒绝。DOM/WebGL/媒体为替身，不声称 GPU/真机试玩。保留主页 **《别在这打》护送测试 · 接田博前**，只发布 TEST；最终版本/源提交看 Sites 原生记录。

# 2026-10-03 最新续接：连续护送战与任务前测试按钮

仅本 TEST，从发布 v63 / `f75402c388bd46cb4a8195fa54e22cf281547a38` 继续，可恢复草稿 v64 / `d7dd1ab8074f6d293d0233be0ab17680e3cbd0d1`。草稿未部署；最终验收包含其后平衡/重试修正，恢复时取最新远端 HEAD。详见 [护送战与测试入口](chapter4-escort-defense.md)。

《别在这打》主路八波、西侧绕行七波，每波 3–4 人、两人追打田博，其余牵制豚师，近战/冲锋/掷瓶真实扣血。田博遇阻停步，打散后才走；显示保护目标与生命，波次间少量恢复只结算一次，初到广场携带剩余生命，失败可从当前路口重试。生成点必须实际连通、不能在围栏后堵住；保持局部寻路/演员预算和当前版本的实际损伤。学校安静段、小游戏、行情、大屏和此前修改保持。

主页新增 **《别在这打》护送测试 · 接田博前**，独立 `chapter4escort` 槽，从长郡门外接应对话前开始。已有鞋/蓝衬衫/证券账户/前三次剧情估值按此前进度准备，钱包 ¥821；本任务奖励和奶冰均未提前获得。其他存档不覆盖；刷新可继续。

已通过完整 30 节点通关与八波主路、全部目标恢复、系统/昼夜/低分小游戏/Worker、大屏/人物/视角重做、四处记录防守，以及护送专项的实际八波/七波战斗、田博近战/酒瓶伤害/倒地/重试、部分损伤刷新、五类当前版本存档的精确迁移。新版护送通关不使用探针回血或奶冰；负面伤亡探针仅给玩家回血，隔离田博倒地，所有剧情敌人保持在场。另有既有 startup / render-performance 检查通过，60 FPS 上限和后台休眠保持。图形/DOM/媒体仍为替身，不声称人工/GPU/真机验收。只发布 TEST，最终版本/提交以 Sites 原生记录为准。

用户最新要求：测试站不考虑旧存档兼容；已撤掉本轮新增的旧档处理和测试。旧档兼容只针对今后获授权的主站工作，本轮不改主站。测试使用新按钮的当前版本存档，仍保留同版自动保存/刷新续玩/失败重试。

# 2026-10-03 最新界面修正：移除右侧无效状态文字

从 TEST 发布 v62 / `ae42dff5287417b3e06bd1622516bd2d2936ecf4` 继续，仅移除钱包下方 `#mood` 的“豚师 · 摸鱼自由人”显示，以及新开游戏、死亡、重生的三处文字更新。余额、生命、增益、死亡画面与存档保持。源码/语法检查、既有 `startup` 和 `mobile-retry-hero`（新开/恢复/实际上下车/读档/死亡重试）通过；没有为此重跑全章。图形/DOM仍为替身，最终发布版本看 Sites 原生记录。

# 2026-10-03 最新修正：第三/四章到达区域并步行即完成

仅本 TEST，从发布 v61 / `d19d78e847bee8b97428070c8f3ab336f4f9484b` 继续。第三章 `c301-park` `[639,185]` / 12 米与第四章 `c401-park` `[-324,556]` / 20 米统一按玩家室外步行到达判定；去掉第三章车辆停稳/位置记录、第四章当前车区域/距离和隧道到访依赖。开车经过仍不完成；提前下车再走进来、在目标区用原 E 下车都可以。目标区原有车保留，无须上它再下车。目标/导航/HUD与两段到达对白同步，不影响原七任务、天豚之靴领取或其他车辆战斗。

本轮 7 项受影响脚本通过：`chapter-parking`、`chapter3-story`、`chapter3-recovery`、`chapter4-story-entry`、`chapter4-arrival`、`chapter4-story`、`chapter4-recovery`。新增专项保留两处停车和剧情实物，验证实际键盘移动、远处/别图当前车、旧存档刷新、旧停车标记不越界、地图/室内/暂停条件、E 下车/T 重试以及主存档隔离；先在旧代码复现第三章步行不推进。第三章 23 节点、第四章 30 节点均通关及恢复，入口脚本还验证天豚之靴和生成 Worker 存档迁移。最终提交/版本以 Sites 原生结果为准，只有 TEST 可发布；DOM/WebGL/媒体仍为替身。

# 2026-10-03 最新续接：长郡校区与学生公寓二楼

从 TEST 发布 v60 / `c3235e42c22b17444488908ceb851a5bab9120a8` 继续。校园按五张用户参考重建，忽略示意图蓝色方框；长方形围墙内加入院士路十座豚师头部铜像、白/蓝科学馆、澄池弧形石拱门/亭/桥、蓝色八道跑道足球场、教学楼与两片篮球场。详见 [校园重建](chapter4-campus-rebuild.md)。

教师子弟之家仍为 `c4_classroom_home`，改到右下角学生公寓二楼，入口 `[-167,387]` / 4 米；楼梯前 `[-176,404]` → 平台转角 `[-176,385.5]` → 二楼门口，上下楼导航与实物扶手一致，不能地面按 E 进入。室内所有物件/人物同步抬高，旧室内存档补正确楼面，旧校园落地存档若与新墙冲突移到邻近安全点，不改钱包/鞋/奶冰/目标。校园内不生成或保留随机追兵，门外护送与城市战斗保持。

本轮 15 项受影响脚本通过：`chapter4-campus`、`chapter4-route`、`chapter4-interiors`、`chapter4-visuals`、`chapter4-milk-ice`、`chapter4-walking`、`chapter4-arrival`，完整 `chapter4-story` / `chapter4-recovery` / `chapter4-story-systems` / `chapter4-rework` / `chapter4-evidence-defense`，以及 `player-falls`、`lake-layout`、`render-performance`。校园专项还验证真实导航到放学点，以及夜生活已解锁后北侧校内不刷街头敌人、旧追兵存档恢复进校后清除。原七任务/30节点、四处记录真实扣血与损毁、昼夜/行情/小游戏/演员/大屏演出/迁移均保持。后续恢复远端最新 HEAD，最终发布提交与版本以 Sites 原生记录为准。只改 TEST，不改主站。图形/媒体仍为替身，离线网格视点不是真机画面。

# 2026-10-03 最新修正：守记录真实受击与天蝎电玩改名

仅本 TEST。改名源码先保存为未部署 v59 / `b7eb74c64fa93e877899fe4b2d6b08f3ff340e29`；用户随后发现守记录一直 220，故先修复再合并发布。线上基线为 v58，不将只含改名的草稿作为最终发布。下一轮恢复远端最新 HEAD，最终版本/提交以 Sites 原生记录为准。

已复现酒吧问题：负责砸记录的冲锋敌人在前摇中一直往前冲，越过固定攻击位置，结算时已超出拳击范围；呼叫者补来的同类攻击者也会如此。第四章冲锋只对固定保护目标限制前进距离，保留蓄力、朝向、距离、遮挡和高度命中校验；向玩家/田博的战斗与前章没有改动。攻击目标改为实际记录机坐标，四台保护终端移到柜台前可接近的空间，玩家原交互落脚点和机身之间保留距离。受击有撞击声和血条短闪，血条按 220 / 200 / 180 各自上限缩放，刷新保留实际损伤。

新增 `chapter4-evidence-defense` 先在旧代码中复现酒吧始终不扣血，再验证酒吧备份、天蝎电玩小票、办公室原始表、最终服务器四处：真实必经小游戏/碰杯后启动；保留所有剧情敌人和家具，真实移动/攻击阶段会扣血，放任攻击至损毁会失败；部分损伤/进度/钱包刷新保留；Esc 暂停与后台不扣血；T 可从当前目标重试。此专项仅持续给玩家回血，隔离玩家先倒下造成的重试，不直接调用记录扣血、不修改敌人坐标/血量/前摇。完整整章通关不使用这种探针回血。

`node tests/run.mjs chapter4-story` 的五个连续脚本通过：整章、30 节点恢复、系统/生成 Worker 迁移、人物/视角/演出重做、记录防守。小游戏仍必经，低分可过；改名涵盖招牌、导航、对白与仓库提示。图形/媒体/DOM 仍为替身，未声称真实 GPU/真机或人工通关验收。仅发布 TEST。

# 2026-10-03 同轮修正：天蝎电玩统一店名

从发布 v58 / `8531962eca5ac69536857dc4f0305dc8b24db151` 继续，仅本 TEST。原“星球游乐中心”统一更名“天蝎电玩”：室外门头/分类牌、地图与导航、室内招牌/设施标题、主线目标和对白、酒吧闲聊/论坛，以及后场仓库和连接出口提示全部同步。保留 `c4_arcade`、仓库/任务/小游戏 ID、路线、费用与存档，不调整股票公司名称。旧名检索、修改模块语法和构建检查通过；最终发布以 Sites 原生记录为准。

# 2026-10-03 最新修正：删除南湖隧道东口孤立长方形

从发布 v57 / `3b001fc4d22ab78944c3e58b85c1bd5ac90772ed` 继续，只改本 TEST。用户截图中的东口北侧长方形对应 `dist/chapter4/tunnel.js` 的斜向装饰路板：中心 `[230,-23]`、110×16 米、旋转 -0.35；它没有连上可通行路网或碰撞。删除该网格，保留正式车道、护栏、坡道和路牌，未调整区域切换、车辆或剧情存档。

已有 `tests/chapter4-route.mjs` 通过生产驾驶/步行的第三章→隧道→第四章完整往返，以及学校/设施通路、刷新和同一车辆 82 HP 保留；语法与 diff 检查通过。图形/音频为替身，不声称真实 GPU 验收。按本源码发布，仅 TEST，最终版本以 Sites 原生记录为准。

# 2026-10-03 上一轮：第四章 Gameplay、对白与街区大屏重做验收

仅更新 TEST 项目 `appgprj_6abb9f2f3738819198aa6b1aca2093f9`，主站未动。开发基线为发布 v55 / `11b12f96c5807be72b38186611ae6f3ae77cf2f7`，可恢复未发布草稿 v56 / `7071513f2bab53ffe20ff9a67d285df910fc3d40`，后续源码检查点 `43679e23984e19f28be2ffd3feaf481c4c1214f0`。最终验收源码在同一远端推送后发布，最终提交/版本/部署结果以 Sites 原生记录为准；下一轮恢复远端最新 HEAD，不回退旧草稿。流程详情见 [重做文档](chapter4-gameplay-rework.md)。

七任务现在共 **30 个目标**。赛车、碰杯、麻将、原创歌曲演唱、打砖块均为主线必经，完成即可、无需赢或盈利，放弃不能代替完成；小游戏分别嵌入守打印机/备份、夺凭证、KTV 后场突围和仓库接锁。战斗包括两处守店、办公室累积复制防守、离线资料争夺、田博实际受伤的护送与路口伏击、可截住目标的危险侧巷追逐、卷闸分隔交叉火力、地下限时截人、实际移动的停车场车辆围堵、四阶段服务器防守。新增有落点预警的掷瓶手、可拳击打断的呼叫者和有冷却/保存/甩脱规则的步行街随机敌人。校门和购物保留安静喘息，演员/瓶子池有上限，不新增帧循环。

整章对白重写并补足因果：店主原件、广告付款和签名排期成为接管播出的授权，总账让店主核对共同抽成、阻止空壳公司逐店否认。室内上传与开关不提前结章；必须沿真实地下出口回黄兴广场，按 E 进入约 40 秒的街面演出。8 块楼宇屏幕实际显示豚师/海豚帮广告、原始账目，再由牢东杰夺回最大主屏，其他屏继续联播；市场曝光事件只在街面证据出现时生效。通关可原地重看，不重复奖励或估值。主屏有安装框架，宽 41/43 米、高 14 米，五一副屏宽 53 米；画面使用缓存原创 LED 材质，没有逐帧重画。

对白未结束时延迟换场，旧说话人/学生和队列位置保存、刷新重建；同伴在实际场景留场，远处人物明确电话交流。王冠海豚话题仅实际进入优衣库之后出现，练练不谈性别。鼠标锁定可无限水平旋转；锁定失败时左右画布边缘续转，中间/离开/暂停停止，保留右键/G 与触控输入。校训改为“朴实沉毅”。

外层存档仍 v1，第四章内部 revision 2；旧最终目标映射到新增联播开关，旧通关仍可重看。钱包、收费在途局、衣服、原曲、股票/五个剧情事件、天豚之靴、永久奶冰防御、独立剧情/到河东/地图/main 槽都保留。生成 Worker 同步演员、压力状态、8 人任务池和 30 目标布局。

本轮 **18 项独立脚本通过**：完整 `chapter4-story`、30 节点死亡/刷新/重试 `chapter4-recovery`、`chapter4-story-systems`、`chapter4-rework`；以及 `chapter4-karaoke`、`chapter4-leisure-games`、`chapter4-leisure`、`chapter4-leisure-transfer`、`chapter4-stocks`、`chapter4-market-model`、`chapter4-milk-ice`、`chapter4-arrival`、`chapter4-story-entry`、`render-performance`、`bgm`、`save-transfer`、`chapter2-combat`、`keybindings`。覆盖真实按键/物理战斗和路程、低分必经小游戏、追逐失败与局部重试、说话人中途刷新、完整多圈视角、实体大屏/镜头/演出刷新与重看，以及生成 Worker 新旧存档迁移。

自动化的 DOM、WebGL、媒体仍为受控替身；这些结果不代表真实浏览器听感、GPU 观感、手机横屏帧率或人工试玩。本轮按上述已验证源码发布 TEST，不声称达到 PS3 成品质量。

以下为此前原曲、入口和设施开发历史，旧流程/目标数以本节和重做文档为准。

# 2026-10-03 上一轮：KTV 使用三首豚师原创原曲

从发布 v54 / `fe4deda2369c072e20ea6a0f17c133b87c07ea75` 恢复远端源码，只更新同一 TEST。用户附件《吹风》《蓝脑壳儿》《念豚师》完整原字节存入 `dist/audio/ktv/`，逐一 SHA-256 对照上传文件相同，FFmpeg 完整解码通过；没有重编码、裁剪或替换成合成旋律。详情见 [KTV 音乐文档](chapter4-karaoke.md)。

选歌页提供免费全曲播放/暂停/继续，各曲有独立 32 拍短挑战，约 24 / 21 / 31 秒。谱面依据录音约 20 秒起的频谱攻击点，非旧固定节拍函数。实录音播放头驱动判定/倒计时；加载、缓冲、定位、拒绝播放和音频失败不会消耗音符，失败可点击重试。游戏总声音开关、P 暂停、切后台、返回选歌页、退出场所/重置都会同步处理音乐；仅一个播放器按选择加载，退出卸载，试听不增加连续 3D 渲染。

第六任务只需唱完挑战片段，免费剧情局、低分继续与高分帮助上传保持；任务/对白改为“一段”，与操作一致。街机霓虹节拍合成旋律保留。已付 KTV 局保存曲目、谱面、命中、时间和押金；刷新/迁入后续局从对应录音位置继续，不重复收费。老版无音乐字段的在途局保留原谱面/成绩/押金，续局对应新原曲。

本轮 9 项受影响脚本通过：`chapter4-leisure-games`、`chapter4-karaoke`、`chapter4-leisure`、`chapter4-leisure-transfer`、`chapter4-story`、`chapter4-story-systems`、`bgm`、`save-transfer`、`render-performance`。语法和 diff 检查通过。

最终提交/版本以本轮 Sites 原生保存/部署记录为准，下一轮恢复远端最新 HEAD；主站未动。自动化媒体、DOM、WebGL 仍为可控替身，未进行真实浏览器听感/触控/GPU 验收。

# 2026-10-03 最新续接：先领天豚之靴与河东直达入口

本轮恢复发布 v53 / `89e025653d8de8ac88daebeba661a2c1c884e94f`，只更新此 TEST。最新用户要求覆盖此前全体禁车区直接提速的规则：必须完成 `c401-school` 的田博送鞋交谈，持久 `world.boots === true` 才能在第四章室外禁车路段以 12.75 m/s 移动；领取前/地图试玩为原 7.5 m/s。道路、室内、隧道、其他章节、蹲行/攻击/闪避和驾驶不变。获得状态刷新/死亡/重试/迁移保留；缺失旧字段仅从已完成的送鞋目标推断，不提前赠送。

新增主页「第四章剧情试玩 · 刚到河东」，独立槽 `chapter4arrival`，在南湖隧道实际河东出口 `[-477,575]` 上车朝东、静止、15:30开始 `c401-park`。保留正常驾驶停车、学院街步行、到校见田博；鞋、账户、第四章目标/奖励均未提前解锁。首帧有《放学》/停车导航，自动抓取原车的重试检查点；旧第三章收尾 `chapter4story`、地图 `chapter4test`、main/迁入存档与继续入口保留。详情见 [剧情文档](chapter4-story-development.md)。

本轮 9 项受影响测试通过：`chapter4-walking`、`chapter4-arrival`、`chapter4-story-entry`、`chapter4-story`、`chapter4-recovery`、`chapter4-story-systems`、`save-transfer`、`startup`、`render-performance`。覆盖真实 E 获鞋前后速度/边界、直接入口实际驾驶停车/学院街、独立槽/刷新/重试、生成 Worker 新旧状态迁移、完整七任务/29 目标恢复与昼夜。已有随机股价、仓位按钮、一次性永久牛奶冰不变。图形/DOM/音频仍为 mock；只按自动化证据验收，不声称 GPU/人工体验。最终发布提交/版本以 Sites 原生记录为准；下一轮恢复远端最新 HEAD。

# 上一轮：2026-10-03 第三章最后一步与随机行情

本轮恢复发布 v52 / `6aadc96d94934d78d1e8e34aa17fc10f254a74b3`，只修改同一个 TEST 项目。最终发布版本和提交以本轮 Sites 原生保存/部署记录为准；下一轮仍恢复远端最新 HEAD。

主页第四章剧情试玩仍使用 `chapter4story`，新起点停在仙人书房，只剩 `c304-leave`。喝茶和此前任务已完成，需实际从侧廊离开，正常发放章末线索/奖励、播放收尾对白/横幅，再进入第四章。仙人在刷新后的书房仍保留。原车停在别墅前门道路，可绕前阶和立柱上车，经环湖与城市连接路开往湘江隧道。已有试玩进度继续保存，普通/地图/迁入存档不变。

日常股价移除按报价序号重启随机数和固定 90 秒轮换消息，使用连续保存的随机流、公共市场/各公司冲击、随机阶段、方差记忆与不定时新闻。波动明显增大且不规则；面板每秒刷新、V/顶部交易、仓位按钮、剧情五个原子去重重估事件都保留。旧档保留报价/历史/钱包/持仓/成本，并稳定初始化缺失模型；新档保存随机流和波动状态，读档/迁移延续走势。详细字段和幅度见 [股市文档](chapter4-stock-market.md)。

本轮 11 项受影响测试通过：`chapter4-market-model`、`chapter4-stocks`、`chapter4-leisure`、`chapter4-leisure-transfer`、`chapter4-story-entry`、`chapter4-story`、`chapter4-recovery`、`chapter4-story-systems`、`save-transfer`、`render-performance`、`startup`。覆盖 144000 条行情样本、实际第三章最后一步和前院上车/环湖/隧道、完整七任务、29 目标刷新/死亡/重试、昼夜与生成 Worker 的新旧存档。所有图形/音频/DOM 测试仍为 mock，不声称 GPU 或人工体验验收。测试站发布已获授权，主站没有修改。

# 上一轮：2026-10-03 完整第四章剧情

最新用户授权七任务剧情，覆盖下文早期「不加入第四章主线」限制。只改同一个 TEST 项目，主站未修改。读取 AGENTS.md、[剧情实现与验收](chapter4-story-development.md) 和本文件后，恢复远端最新 HEAD；不要用 v45 或 v50 覆盖新剧情。

基线：发布 v50 / `266c63cce87c701821a290f7fba5d3bb6ca96ccb`。首个剧情恢复检查点：未发布 v51 / `3f3001c731a8af0b7761a798c0ae16d44559edf8`。后续包含验收修正与测试的提交均保存在同一远端仓库；最终发布版本以 Sites 原生记录为准。

已接入《放学》《夜生活》《穿这个去？》《涨停》《别在这打》《一晚上》《两块钱的公司》，共 29 个目标。第三章正常结束后自然进入；主页新增独立 `chapter4story` 试玩入口。三间新剧情室内连接实际地下商街/KTV/货梯/IFS 电梯；通关保持既有全区自由探索。

行情有五个持久剧情重估事件；面板每秒刷新，V/顶部交易及 1/4/半仓/全仓保留。禁车区步行 1.7 倍不叠加；牛奶绵绵冰仍只买一次并永久减伤 25%。主线控制下午/傍晚/深夜，通关后每 10 分钟有效第四章游玩交替昼夜，暂停/面板/隐藏/其他区域冻结，刷新保留计时。

恢复与验收重点：29 个目标逐一存档、死亡/R/T 重试；小游戏完成不要求获胜，剧情首次局由练练请客；混合战斗/两段 Q 家具、实际西侧追逐分支、6 秒物理检修闸、服务器真正被攻击、材料公开与主屏被反接。所有状态接入生成 Worker 的 v1 迁移文档。受影响回归使用 `node tests/run.mjs chapter4-walking`，完整剧情/恢复/状态测试放在该子集末尾。

验收完成：15 项第四章子集通过；增援/携带物/低分分支补查及共享启动、渲染、迁移、第三章流程和边界回归通过。细节和证据限制见剧情文档。

以下保留早期地图与设施开发历史，旧范围不再代表当前授权。

# 最新交接：2026-10-02 牛奶绵绵冰一次购买与永久防御

长郡中学流星雨教师子弟之家（`c4_classroom_home`）的牛奶绵绵冰改为每份存档只能购买一次，保留 ¥16、即时恢复 45 生命和吃碗动作。购买成功后永久减少角色受到的伤害 25%，满血也允许买；余额不足没有升级，已买按钮显示禁用，重复动作不扣钱、不回血、不叠加。随身补给面板显示永久减伤。

一次购买标记 `streetLife.milkIcePurchased` 与防御共用一个布尔状态，中央 `hurt` 在扣生命 / 伤害事件前乘 0.75，保留小数精度和原无敌时间。战斗、车祸和坠落等角色伤害一致生效，车辆 / 敌人耐久及玩家输出不变。其他食品继续原逻辑。刷新、死亡重生、区域切换和存档迁移保留；真正的新存档重置。旧版没有食品购买历史，缺失该标记的旧存档默认尚未购买，允许此后买一次。客户端和生成 Worker 迁移接受可选布尔字段，拒绝错误类型。

`chapter4-milk-ice` 专项通过，使用真实输入、柜台购买、中央伤害与落地物理，并检验生成 Worker 迁移 / 独立存储导入 / 实际刷新。受影响的 `street-life`、`chapter2-combat`、`player-falls` 和连续往返 `chapter4-route` 回归通过。DOM、WebGL、音频、R2 使用 mock；不能据此声称设备画质或人工试玩。发布记录以 Sites 原生保存 / 部署成功为准，仅 TEST；恢复仍读远端最新 HEAD。

# 此前交接：2026-10-02 股票仓位比例买卖

交易面板新增 1/4 仓 / 半仓 / 全仓，与 1 / 5 / 10 股并存。买入以当前钱包可买股数为基数、卖出以当前股票持仓为基数，向下取整；买入受单股 10000 股上限限制。按钮显示实际股数和金额，随行情更新，下单按最新价格和钱包/持仓重新算，零股不可交易。全仓尽量买满整数股，零钱留在钱包。

保留营业部开户、V / 顶部交易、每秒行情、均价成本、存档和剧情估价接口。迁移校验扩展到单次 10000 股，保留旧记录。`chapter4-stocks` 专项覆盖三个比例、奇数持仓、全仓零钱、低/高价格分币计算、报价改变后的动态数量、持仓上限和零股拒绝；`chapter4-leisure-transfer` 验证大额股数通过源与生成 Worker 迁移，原设施/股票回归继续通过。仅发布 TEST，不改主站或加入主线。

# 此前交接：2026-10-02 股票开户、随身交易与实时行情

湘城证券营业部先免费开户，之后按 V / 顶部「交易」按钮，在室外、室内、开车或其他区域使用同一账户交易。已有持仓或交易记录的旧版本玩家兼容为已开户，未交易玩家仍需去营业部办理。交易按点击时的最新报价结算，保持个人钱包、加权成本和限额。

市场拥有独立存档时钟，盯盘每秒更新五家公司价格、曲线、市值/浮盈及买卖金额；不再依赖关闭面板。行情只更新已有文字节点和 2D 曲线，不重建控件，不推进街区/恢复 buff/角色/车辆，也不唤醒 3D 连续绘制；隐藏页面停止，返回后继续，无离线补跳。仍复用原 60 FPS 帧链，每五秒保存市场，交易/退出立即保存。

预留 `chapter.api.marketEvent(event)`，支持指定公司的即时价格冲击和持久估价倍率，可显著上涨/下跌。全事件校验后才写入，稳定事件 ID 防止刷新、重试和迁移重复生效；没有加入任何正式剧情事件。接口和存档约定见 `docs/chapter4-stock-market.md`。

验收 `chapter4-stocks`、既有设施/迁移、快捷键、旧存档迁移、60 FPS 和步行速度检查。GPU 与真实手机横屏仍沿用已有设备验收限制。仅发布本 TEST，主站不变。

# 此前交接：2026-10-02 第四章室外禁车区步行提速

普通移动在第四章室外且 `canDrive(x,z) === false` 时由 7.5 提升至 12.75 m/s（原速 1.7 倍），正常步态节奏同步提速。走进可驾驶道路、停车区、任意室内、南湖隧道或前几章立即采用原速；蹲行 2.2、攻击移动 1.5 m/s 和驾驶逻辑保持原样。速度按当前区域每帧判定，不写入存档，不叠加。仅更新本 TEST Site，没有第四章主线。

专项 `chapter4-walking` 通过实际输入位移验证五处禁车区、斜向速度、双向连续车道边界、道路/停车区/室内/其他区域、蹲行/攻击与刷新续玩；道路、设施及地下路线回归见 TESTING.md。测试运行器走到小于一帧位移的目标时缩短该步 dt，避免新速度在旧 40 ms 测试步长下反复越过目标，游戏没有接近目标减速。真实 GPU/设备限制沿用下方说明。

# 此前交接：2026-10-02 第四章室内与娱乐设施验收完成

本轮从 v45 开发草稿完成小游戏、八类设施、钱包/续局/迁移专项验收与修正，按验收源码仅发布 TEST。详情和恢复说明见 `docs/chapter4-facilities-handoff.md`。下一轮恢复远端最新 HEAD，不能以旧 v45 基线覆盖本轮修正。主站保持原样，没有第四章主线。

新增 `chapter4-leisure-games` / `chapter4-leisure` / `chapter4-leisure-transfer` 三项测试：八处连续实际输入通路、22 点位、真实短局操作、单次费用/结算、持仓与成本、buff/论坛/NPC、所有九类未结束局面生成 Worker 迁移及静止 3D / 原 60 FPS 链验收。相关道路、换装、键位、旧存档和性能回归通过。DOM/WebGL/音频为 mock；真实 GPU、手机横屏和音频延迟仍待支持设备验收。

本轮修正出口 E 优先级、足浴前台挡落脚区、酒吧后门整墙、键盘/多指输入相互覆盖、台球静止唤醒与停球保存、台球阻尼、放弃服务错误文案，以及小游戏拖动反复唤醒 3D。补规则/奖金/均价和 HUD 状态倒计时，保留照片参考外景、王冠 T 恤、南湖隧道、北辰和外围驾驶连接。

以下为此前地图/视觉阶段的历史记录；早期“未加入小游戏”描述不再代表当前设施版本。

# Chapter IV continuation checkpoint · 放学以后

Updated 2026-10-02. Continue this existing TEST project; do not create a new Site or modify the main Site.

## Scope and entry

- TEST project: `appgprj_6abb9f2f3738819198aa6b1aca2093f9`.
- URL: https://dolphin-city-chapter2-test.plllp8336.chatgpt.site
- This round builds the connected explorable map, commercial rooms and future facility interfaces. No formal Chapter IV missions, 牢东杰 / 田博 actors or complete minigames have been added.
- Read `AGENTS.md` and [landmark photograph references](chapter4-landmark-references.md) before changing geography or landmarks. Gameplay, recognizable objects/controls/story, and the PS3-era visual target remain the priorities. The target is not a quality certification.
- Home button **第四章地图试玩 · 开车穿湘江隧道** starts on the east-side Chapter III road in the yellow car. It uses `chapter4test` / `dolphin-city-save-chapter4test`; normal and earlier test saves remain separate. Clicking again resets the test checkpoint; refreshing resumes the selected slot.
- The ordinary Chapter III eastern road also reaches the tunnel physically. Entry is a road portal, not a chapter menu, and works in both directions with the adopted vehicle's identity, HP and motion preserved.

## Connected outdoor map

East is +x; north is -z. The real adjacency is compressed rather than reproduced at 1:1 scale. The route passes 潇湘大道 / 阜埠河, the descending Nanhu west ramp, two covered tunnel bores, the eastern ramp, 南湖路 / 书院路, 学院街, 长郡, 南门口, 黄兴南路, 黄兴广场, 解放西 / 坡子街 / 太平街, 五一, 平和堂 and IFS.

The tunnel has a genuinely longitudinal vaulted shell, separate traffic directions, visibly inclined supported ramps, cream panels, strip lights, red pipes and lane arrows. Daylight recedes below ground and returns on the open ramp. Camera clipping uses the actual local tunnel envelope. The covered driving length is 440 m.

The city spine is dense with street-level shops, side lanes and enterable facilities. 黄兴广场 has a bronze figure/plinth and directional street connections; 五一 has landscaped paths, large screens and a financial/commercial skyline. 解放西 remains an asphalt vehicle street with narrow back lanes and neon shops. 太平街 uses low pitched gray roofs and stepped firewalls. Facade placement checks all road footprints, including pedestrian cross-links, so decorative buildings do not plug an advertised connection.

Motor traffic stays on outer roads and 解放西 / 五一大道. 黄兴路, the plaza core and underground routes are protected pedestrian spaces. Bollards, road classification and height checks agree. Several junctions provide enough room to turn cars. Normal running speed remains 7.5 m/s; the main south-to-north spine is roughly three minutes before detours and interiors.

| Core area | Stable ID |
| --- | --- |
| 南湖路 / 书院路 | `c4_shuyuan` |
| 长郡 / 学院街 | `c4_changjun` |
| 南门口 | `c4_nanmenkou` |
| 黄兴南路 | `c4_huangxing_south` |
| 黄兴广场 | `c4_huangxing_square` |
| 解放西 / 坡子街 | `c4_jiefang_west` |
| 太平街 | `c4_taiping` |
| 五一广场 | `c4_wuyi` |
| 平和堂 / 优衣库 | `c4_heiwado` |
| IFS | `c4_ifs` |

## Campus, malls and other interiors

- 长郡 is a fictional accessible campus slice: the photograph-informed flat stone gate, walls, a playground, an alumni building and the **流星雨教师子弟之家**. It does not reproduce a real school internal/security plan. Room `c4_classroom_home` has a classroom board, tables/chairs, a freezer, a staffed counter and a modeled milk shaved-ice bowl with spoon. E at the counter buys **牛奶绵绵冰** for ¥16 and heals 45; wallet payment and the bowl-eating animation use the existing food system.
- `c4_heiwado_uniqlo` has the photographed three-floor glazed frontage, pale patterned upper facade, rounded glass corner and large red UNIQLO identity. The continuous room has two walkable escalators, 1F–3F balconies, racks/hangers/clothes, fitting booths, mannequins and a counter. Three basic tops can be bought, equipped and saved; buying an owned item does not charge again. It is a safe commercial space.
- `c4_ifs_atrium` has a twin-tower/stacked-podium exterior and a continuous three-floor oval gallery with nested ceiling rings, paired escalators and shop fronts. Rear access doors have open framed vestibules, not interaction points hidden inside walls or furniture. It connects to the underground and the B1 lift.
- `c4_ifs_parking` has parking bays, columns and a rear/vehicle entry. The same car can enter, be saved/reloaded and leave; passengers on foot can use the IFS lift.
- Street entrance IDs `c4_underground_hx` and `c4_underground_wuyi` have visible descending stairs and retaining walls. The ground mesh has matching open holes; floor heights track each actual tread. Room `c4_underground` is a furnished shortcut with paired mall connections and framed side passages between shops. Pedestrians vary with trading hours.
- `c4_billiards` uses real exterior stairs to a 4 m second-floor entrance, with a matching indoor floor and refresh position. `c4_bar` has a genuine rear door to the back lane.
- Other independently furnished enterable rooms: `c4_stationery`, `c4_nanmen_snacks`, `c4_convenience`, `c4_pharmacy`, `c4_tea`, `c4_net_cafe`, `c4_arcade`, `c4_mahjong`, `c4_bar`, `c4_ktv`, `c4_massage`, `c4_night_snacks`, `c4_securities`. Props distinguish computer stations, arcade cabinets, mahjong tiles, pool tables, KTV/bar seating and massage beds. `c4_securities` uses a fictional company and fictional display; future stocks are an interface only.

## Systems and source modules

- `dist/chapter4/layout.js`: canonical area, facility and underground entrance IDs; geography/road classes; regional density.
- `build-world.js`, `city-kit.js`, `tunnel.js`: original photo-informed outdoor geometry, shared material/instance batches, local spatial collision indexes, culled blocks and tunnel lighting/camera support.
- `interiors.js`: 18 facility rooms plus underground; services, wardrobe, floor slabs, stepped ramps, actual portal framing and bounded underground visitor pool.
- `test-checkpoint.js`: separate test slot at the Chapter III approach road.
- `dist/regions/manager.js`: bidirectional road portals and saved city time. Entering and returning do not advance or reset Chapter III objectives.
- `dist/game.js`: region/room floor support, scoped multilevel shallow-step traversal, local interior camera clipping, actual food prop and wardrobe appearance, local car delivery on motor roads only.
- `dist/sandbox/life.js` and `dist/sandbox/street-population.js`: store/food/wardrobe services and area/time budgets. The city walker pool is capped at 56, active traffic at 6; the tunnel uses a small vehicle pool without street walkers. Repeated rigid meshes/materials are shared. City labels share cached canvases capped at 1024×512 rather than allocating enormous storefront textures.
- Existing 1080p output cap / native-resolution toggle and landscape touch controls remain. `save-layout.js` supplies region/room IDs to both the client validator and generated transfer Worker. `scripts/build.mjs` inlines all three canonical layout/ID arrays into the Worker.
- Chapter III objectives, retry and death handlers stay suspended during free exploration in the new city/tunnel. Returning resumes the same prior objective. No old-to-new test-save migration is required; use current-version test refreshes.

## Completed validation

These are automated runs of production input, interaction and physics with real Three.js geometry. DOM, WebGL and audio are mocked; they are not a human playthrough or device/GPU performance test.

- `tests/chapter4-route.mjs`: a continuous actual-input drive from the Chapter III test road through the Nanhu tunnel to the city, **68.5 s total / 24.4 s covered**, then actual driving to 学院街 and walking through school, milk-ice purchase/heal, 南门口, 黄兴街/广场, 解放西/太平街, 五一, 平和堂 and IFS. The test uses normal E room transitions, saves/reloads, walks back to the parked car and physically drives the opposite bore back to Chapter III. The same car ID and **82 HP** survive both crossings and refresh. Ambient actors are disabled for deterministic route checks; their behavior is tested separately.
- `tests/chapter4-interiors.mjs`: all 18 storefront E entrances/exits, true exterior 2F stairs, both malls' actual escalator ascents/descents through 3F, 3F refresh, safe-zone attack guard, clothing payment/equip/refresh, clear visibly open rear portals, mesh-ray agreement on underground stairs, both street stair returns, a physical underground shortcut, both paired mall links and the IFS↔B1 lift.
- `tests/chapter4-systems.mjs`: real area/time population changes and motion, motor-only traffic, protected pedestrian/stair routes, chunk culling, bounded actors, tunnel vault/road/camera geometry, same-car B1 enter/refresh/exit, underground opening-hour visitors, lossless transfer endpoint roundtrip and suspended normal Chapter III retry/death/return. All C4 base canvas texture allocations measured **19.9 MiB** in this harness; this is not total GPU memory or a frame-rate measurement.
- A build-output probe POSTs and GETs a C4 underground/parking save through `dist/server/index.js`, confirming the packaged Worker's inline region/room IDs and lossless serialization. `node scripts/build.mjs` passes.
- Affected older checks passed: startup, rendering resolution, player actions, region vehicles, street life, street population, save transfer, Chapter III academy ground and Chapter III systems. Earlier full campaigns were not rerun because no further campaign behavior change was made.
- Offline exports of the actual meshes were inspected for gate, storefront, continuous mall and tunnel silhouettes. These software renders omit material/shadow/GPU/UI behavior and must not be called gameplay screenshots.

## Next development / limitations

The current environment has no supported real browser/GPU preview for this static-ESM-plus-Worker project. Landscape-phone readability, real shaders/shadows, audio and frame rate still need a supported device check. Keep those claims separate from the passing input/geometry/save tests. Before adding Chapter IV missions or full minigames, review the connected spaces and current user scope; this version remains a map/exploration build.

Publish this TEST project only, using its exact source/archive and current public audience. Use the native Sites deployment result for the published version number and URL.

## 2026-10-02 performance release

After the main Site's v25 deployment succeeded, this test Site received the same 60 FPS maximum, sleeping paused/background loop, visible-only renderer matrix update and conservative static batch partitioning. Existing resolution choices and all visual quality settings remain. Chapter IV's three full automated route/interior/system checks pass with the more faithful matrix-updating renderer mock; see `docs/render-performance.md` for checks and measurement limits. No Chapter IV world, facility, main-story or minigame content changed.


## 2026-10-02 Chapter IV visual rebuild

- The user requests a substantial photo-grounded visual rebuild on TEST only. Main remains at its existing published version. [Current visual notes](chapter4-visual-rebuild.md) and [eight inspected photo references](chapter4-visual-reference-dossier.md) describe the rebuilt geometry, original assets, checks and limits.
- The homepage now offers **第四章城区试玩 · 黄兴广场**: direct on-foot start at 16:00, in the existing isolated `chapter4test` slot. **第四章地图试玩 · 开车穿湘江隧道** still tests the complete physical connection. Both restart that Chapter IV test slot; normal progress is separate. Refresh resumes the selected checkpoint.
- The shopping spine has continuous, photograph-informed mid-rise shop walls with varied bay/ribbon/balcony frontage, recessed merchandise, mullions, awnings, projecting signs, side windows, drainpipes, air conditioners and roof coping. Placement uses actual rectangular footprints and reserves advertised roads, alley mouths, stair heads, facility approaches and the plaza.
- 黄兴广场 has a standing bronze overcoat silhouette, dark plinth and a roof pavilion on the corner block. Pozi adds an original red-column, green-eave Fire Palace facade. Taiping uses low sloped roofs with correctly joined ridges and stepped walls. Five-One park has curved planted islands and walkways rather than a grid of raised slabs.
- Heiwado has warm furnished three-floor windows on its front and sides, silver perforated-metal upper walls, rounded glazing and large red UNIQLO identities. IFS has articulated slabs, shadow reveals, real glazing, display stock, opaque upper office panels, finned unequal towers and frozen rooftop-art silhouettes. Mall doors remain visibly open.
- New shared material maps use world-scale UVs, retaining physical paving/brick scale on instanced geometry. Glass has a small shared environment texture. The original three generated PNGs are included; no reference photograph is copied into the game. City daylight/night/indoor light balance is scoped to Chapter IV.
- Clothing racks use modeled collars, sleeves, hangers and support feet; the store also has folded stock, curtain folds and mirrors. Indoor trim/fixtures and actual glass railings extend the original rooms. Full store, escalator, underground and garage gameplay stays connected.
- Opaque rigid components and repeated signs are grouped by spatial cell and shared material; per-instance colours preserve the original colours. Only Chapter IV uses this consolidation. Glass, people, movable props and room hierarchies remain independent. Existing 60 FPS maximum, resolution controls, pause/background sleep, shadows and actor budgets are preserved.
- Tests use production movement/interaction/collision plus actual Three meshes. Real browser shader compilation, final lighting, shadows, audio, phone usability and device frame rate remain unverified in this environment; mesh-only software views are not gameplay screenshots.

- Final visual-entry/route/interior/system checks pass. The new PNG-aware allocation check measures **56.6 MiB base 2D maps** and exact rigid packing measures **5,386→1,781 meshes** with all colours, transforms, UV hooks and instances preserved. Both figures exclude GPU timing and total driver memory. Shared startup, render-resolution, model-detail, 60 FPS/idle matrices and generic instance-culling checks pass.

## 2026-10-02 UNIQLO crowned dolphin T-shirt

Added the user-referenced white **像素王冠海豚 T恤**, personal-wallet ¥59, at an interactive 1F entrance-right display and the existing cashier. It has a transparent reference-derived chest print, fitted avatar cloth, collar/hem and arm-following sleeves. Buying equips it; owned garments re-equip free and restore from the stable wardrobe ID across refresh/travel. Existing plain shirts and outfit removal remain functional. [Asset, interaction and verification notes](crowned-dolphin-tshirt.md).

## 2026-10-02 Entry stutters, perimeter driving and Beichen

Downtown now has connected east/west perimeter motor roads from 学院街/书院路 to 黄兴、解放西、IFS and 五一, with marked Huangxing-east and Pozi-west parking and pedestrian approaches. The northeast road connects northward to Beichen's southeast edge and 平沙路, with a physical return route and preserved adopted-vehicle state. The Beichen approach bends around existing buildings; Chapter I routes/dialogue are unchanged.

Traversal optimizations prepare material/texture layouts during startup, stabilize tunnel/night-city light counts while retaining zero daytime city point lights, distribute population replenishment across frames, use analytic camera/wall intersections and avoid forced hidden-map matrix updates at entry. Full visual settings, crowd budgets and the 60 FPS cap remain. Securities signs read **湘城证券 · 五一营业部 / 行情大厅**, without immersion-breaking wording.

See [road, stutter and verification notes](chapter4-roads-performance.md). Automated driving, parking/foot approaches, reciprocal portals, refresh/vehicle identity/HP/speed, 60 FPS logic and affected exploration/wardrobe/population/startup checks pass with mocked WebGL/audio. Real device frame-time verification remains outstanding.
