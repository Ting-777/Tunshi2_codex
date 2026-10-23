class_name LandmarkHUD
extends RefCounted

static func draw(h):
	var q=h.world.quests
	if q.journal and q.journal_page==1:recap(h);return
	if q.journal:
		h.draw_rect(Rect2(0,0,1600,900),Color(.03,.07,.12,.9));h.panel(Rect2(250,120,1100,660))
		h.txt("陆家嘴任务日志",Vector2(295,180),34,h.ORANGE)
		h.txt("可用天赋点 %d · T 打开天赋树"%h.world.talents.available(),Vector2(875,180),21,h.ORANGE)
		h.txt("W/S 选择 · Enter 追踪 · J / Esc 返回 · Tab 剧情回顾",Vector2(295,222),19)
		var details=["带八子登高，用观景镜辨认地标，然后拍全家合照。","帮听歌重现四拍节奏，让孩子们听见上海。","沿中庭八个平台送达包裹，记录自己的最好成绩。","豚师旧东家自由伞总部。重走访客安保训练，取回纪念章。"]
		for i in range(4):
			var key=q.KEYS[i];var y=252+i*112
			h.panel(Rect2(286,y,1028,98),Color("#426c76") if i==q.selection else Color("#283c53"))
			var state=["未开始","进行中","已完成"][q.states[key]]
			h.txt(LandmarkSet.DATA[key].title,Vector2(308,y+33),24,h.ORANGE if i==q.selection else h.PAPER)
			h.txt(state+(" · 当前追踪" if q.tracked==key else ""),Vector2(1030,y+33),18)
			h.txt(details[i]+("  1点" if i==0 else "  3点"),Vector2(308,y+68),18)
		var main_text="主线："
		for i in range(5):main_text+=["天桥","登高","送蛋糕","生日节目","撤离"][i]+(" ✓  " if "c1.m"+str(i+1) in h.world.talents.earned else " ·  ")
		h.txt(main_text,Vector2(300,720),18)
		h.txt("支线各奖励 200元 + 3天赋点；任务与奖励只结算一次。",Vector2(300,758),18)
		return
	if q.inside!="":
		h.panel(Rect2(520,26,575,62));h.txt(LandmarkSet.DATA[q.inside].name+" · 高层",Vector2(540,64),24,h.ORANGE)
		if q.running and q.inside=="jinmao":h.txt("中庭快递  %.1f 秒  ·  %d / 8"%[q.clock,q.checkpoint],Vector2(580,116),22)
		if q.inside=="luo" and q.running:h.txt("训练提示 %d 次 · %s"%[q.alarms,"返回入口" if q.returning else "等待灯灭 / X 蹲下"],Vector2(560,116),22)
	if q.aim>=0:
		# Real camera projection, no mocked photograph or pre-rendered skyline.
		var center=Vector2(800,450)
		h.draw_arc(center,65,0,TAU,60,h.ORANGE,3)
		h.draw_line(center-Vector2(90,0),center+Vector2(90,0),h.PAPER,2);h.draw_line(center-Vector2(0,90),center+Vector2(0,90),h.PAPER,2)
		var point=h.world.camera.unproject_position(q.VIEWS[q.aim])
		if not h.world.camera.is_position_behind(q.VIEWS[q.aim]):h.draw_rect(Rect2(point-Vector2(26,26),Vector2(52,52)),h.ORANGE,false,3)
		h.panel(Rect2(470,650,660,58));h.txt("鼠标瞄准 "+q.VIEW_NAMES[q.aim]+" · 左键拍摄 · E 返回",Vector2(490,687),22)
	if q.rhythm:
		h.panel(Rect2(470,320,660,240));h.txt("听歌的城市节拍",Vector2(650,365),28,h.ORANGE)
		h.txt("先看亮灯听四拍" if q.rhythm_time<3.2 else "轮到你了 · 按 1 / 2 / 3 / 4",Vector2(620,407),22)
		for i in range(4):
			var lit=q.rhythm_time<3.2 and q.pattern[mini(3,int(q.rhythm_time/.8))]==i
			h.panel(Rect2(525+i*145,440,115,75),h.ORANGE if lit else Color("#426079"));h.txt(str(i+1),Vector2(570+i*145,490),28,h.INK if lit else h.PAPER)
		h.txt("已重现 %d / 4 · E 返回"%q.notes.size(),Vector2(660,546),19)
	if q.travel>=0:
		var alpha=clampf(q.travel/.45,0,1) if q.travel<.65 else clampf((1.6-q.travel)/.45,0,1)
		h.draw_rect(Rect2(0,0,1600,900),Color(.03,.07,.11,alpha))
		if q.travel>.3 and q.travel<1.3:h.txt("观光电梯 · "+("返回大厅" if q.destination=="" else LandmarkSet.DATA[q.destination].name),Vector2(565,460),30,h.PAPER)
	if q.flash>0:h.draw_rect(Rect2(0,0,1600,900),Color(1,1,.93,q.flash*.6))

static func photo(h):
	h.draw_rect(Rect2(0,0,1600,65),Color("#152235"));h.draw_rect(Rect2(0,835,1600,65),Color("#152235"))
	h.txt("八个，一个都不少 · 上海中心",Vector2(56,44),25,h.ORANGE)
	if h.world.bark_text!="":
		h.panel(Rect2(190,720,1220,99));h.txt(h.world.bark_speaker,Vector2(215,751),20,h.ORANGE)
		h.txt(h.world.bark_text,Vector2(215,791),25)
	var q=h.world.quests
	if q.flash>0:h.draw_rect(Rect2(0,0,1600,900),Color(1,1,.93,q.flash*.6))

static func recap(h):
	h.draw_rect(Rect2(0,0,1600,900),Color(.03,.07,.12,.94));h.panel(Rect2(240,100,1120,700))
	h.txt("第一章 · 已经发生的事",Vector2(280,159),32,h.ORANGE);h.txt("Tab 返回任务 · J / Esc 继续游戏",Vector2(280,202),20)
	var y=250
	for record in h.world.story.recap():
		var lines=h._wrap_text(record,1010,19)
		for line in lines:h.txt(line,Vector2(280,y),19);y+=28
		y+=16
