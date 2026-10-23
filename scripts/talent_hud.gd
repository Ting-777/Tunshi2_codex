class_name TalentHUD
extends RefCounted
const BRANCHES=["attack","defense","vitality","action","utility"]
const NAMES=["攻击","防御","体力","动作","其他"]
static func selected(t) -> String:return BRANCHES[t.column]+str(t.row+1)
static func key(w,code: int) -> bool:
	var t=w.talents
	if code==KEY_T:
		if w.director.active() or w.pause_menu or w.failed_reason!="" or w.quests.active() and (w.quests.travel>=0 or w.quests.photo_time>0):return true
		if not t.menu and w.stage==4:w.hud.say("先完成撤离，再调整天赋 · 战斗中保留当前配置");return true
		t.menu=not t.menu;w.quests.journal=false;w.hud.map_open=false;w.paused=t.menu;w.voice.set_paused(t.menu);w._clear_input();Input.mouse_mode=Input.MOUSE_MODE_VISIBLE if t.menu else Input.MOUSE_MODE_CAPTURED;return true
	if not t.menu:return false
	if code in [KEY_A,KEY_LEFT]:t.column=posmod(t.column-1,5)
	if code in [KEY_D,KEY_RIGHT]:t.column=posmod(t.column+1,5)
	if code in [KEY_W,KEY_UP]:t.row=posmod(t.row-1,5)
	if code in [KEY_S,KEY_DOWN]:t.row=posmod(t.row+1,5)
	if code in [KEY_E,KEY_ENTER]:
		if t.buy(selected(t)):t.sync_player(w.player)
	if code==KEY_R:t.respec();t.sync_player(w.player)
	if code==KEY_ESCAPE:t.menu=false;w.paused=false;w.voice.set_paused(false);Input.mouse_mode=Input.MOUSE_MODE_CAPTURED
	return true
static func draw(h):
	var t=h.world.talents
	h.draw_rect(Rect2(0,0,1600,900),Color(.03,.07,.12,.94));h.panel(Rect2(100,55,1400,790))
	h.txt("豚师的本事",Vector2(140,109),35,h.ORANGE);h.txt("可用 %d  /  已用 %d  /  已获 %d  /  全篇 80"%[t.available(),t.spent(),t.total()],Vector2(730,108),24,h.ORANGE)
	h.txt("WASD / 方向键选择 · Enter / E 学习 · R 免费重配 · T / Esc 返回",Vector2(140,149),19)
	for c in range(5):
		h.txt(NAMES[c],Vector2(190+c*260,193),26,h.PAPER)
		for r in range(5):
			var id=BRANCHES[c]+str(r+1);var n=t.node(id);var pos=Vector2(140+c*260,214+r*91)
			if r>0:h.draw_line(pos+Vector2(110,-17),pos+Vector2(110,0),Color("#678b9e"),3)
			var color=Color("#3c706a") if t.has(id) else Color("#344960")
			if t.column==c and t.row==r:color=Color("#b48c49")
			h.panel(Rect2(pos,Vector2(230,74)),color);h.txt(n.name,pos+Vector2(14,29),21)
			h.txt("已学会" if t.has(id) else "%d 点 · %s"%[n.cost,"可学习" if t.reason(id)=="" else "第%d章"%n.chapter if n.chapter>t.campaign_chapter else "需前置" if n.requires!="" and not t.has(n.requires) else "点数不足"],pos+Vector2(14,57),17,h.PAPER)
	var n=t.node(selected(t));h.txt(n.name+"："+n.description,Vector2(140,715),23,h.ORANGE)
	h.txt(t.notice if t.notice!="" else "主线与支线首次完成给点。重玩、击杀和金钱不产点。全部42项任务完成，刚好点满25项。",Vector2(140,756),19)
	h.txt("最大体力 %.0f · 常态近战 +%.0f%% · 常态减伤 %.0f%% · 后续章节尚未制作"%[t.health(),(t.damage("jab",100,100)-1)*100,(1-t.reduction(100,100))*100],Vector2(140,804),19,Color("#b6d8ce"))
