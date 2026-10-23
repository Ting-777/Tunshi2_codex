extends "res://scripts/prologue_hud.gd"

func _draw():
	if not world or not world.player or photo:return
	if world.talents and world.talents.menu:TalentHUD.draw(self);return
	if world.quests and world.quests.journal:LandmarkHUD.draw(self);return
	if map_open:_map();return
	if world.pause_menu:_menu();return
	if world.quests.photo_time>0:LandmarkHUD.photo(self);return
	if world.director.active():_cinema();return
	panel(Rect2(30,26,430,80));draw_rect(Rect2(30,26,6,80),ORANGE)
	txt("第一章 / 八个，一个都不少",Vector2(53,60),25);txt("陆家嘴 · J 任务 / T 天赋 / M 地图",Vector2(53,90),17,Color("#b6d8ce"))
	panel(Rect2(30,121,430,106));txt(world.objective(),Vector2(49,153),20)
	for i in range(_wrap_text(world.subobjective(),390,16).size()):txt(_wrap_text(world.subobjective(),390,16)[i],Vector2(49,181+i*24),16,Color("#b6d8ce"))
	panel(Rect2(30,243,235,70));txt("豚师  "+str(int(ceil(world.player.hp)))+" / "+str(int(world.player.max_hp)),Vector2(45,266),16)
	draw_rect(Rect2(45,277,203,8),Color("#4c5a73"));draw_rect(Rect2(45,277,203*world.player.hp/world.player.max_hp,8),Color("#62d7b5"))
	txt("热血",Vector2(45,302),14,ORANGE);draw_rect(Rect2(90,293,158,8),Color("#4c5a73"));draw_rect(Rect2(90,293,158*world.player.heat/100,8),ORANGE)
	_minimap()
	if world.quests.aim<0:_markers(world.navigation_targets())
	if world.race_active:
		panel(Rect2(1190,26,380,136));txt("天桥一圈",Vector2(1212,62),24,ORANGE)
		if world.race_countdown>0:txt(str(int(ceil(world.race_countdown))),Vector2(1325,125),54)
		else:
			txt("%.1f 秒"%world.race_elapsed,Vector2(1212,105),34)
			txt("老三已到终点" if world.runner.finished else "老三也在跑 · 路线可自选",Vector2(1212,143),17)
	elif world.stage==4:
		panel(Rect2(1150,26,420,190));txt("工作人员撤离",Vector2(1172,63),23,ORANGE)
		for i in range(world.staff.size()):
			var a=world.staff[i];var y=96+i*38
			txt(str(i+1)+("  已上车" if a.evacuated else "  体力 "+str(int(ceil(a.hp)))),Vector2(1172,y),17)
			draw_rect(Rect2(1340,y-12,207,9),Color("#4c5a73"));draw_rect(Rect2(1340,y-12,207*a.hp/a.max_hp,9),Color("#62d7b5") if a.hp>35 else Color("#f18972"))
		panel(Rect2(1150,228,420,46));txt("后勤门："+("有人挡门，暂缓关闭" if world.venue.gate.blocked else "开启" if world.venue.gate.requested_open else "关闭中" if world.venue.gate.opened>.03 else "已关闭"),Vector2(1172,259),18)
	elif world.stage in [1,2,3,5]:
		panel(Rect2(1250,26,320,87));txt("天桥最佳  "+("—" if world.race_best<=0 else "%.1f 秒"%world.race_best),Vector2(1270,61),20,ORANGE)
		txt("蛋糕评价  "+("待送达" if world.cake_best<0 else str(int(world.cake_best))+" / 100"),Vector2(1270,93),18)
	var car_y=640 if world.bark_text!="" else 670
	if world.stage==2:
		panel(Rect2(1135,car_y-90,435,73));txt("蛋糕完整度  "+str(int(ceil(world.cake_quality)))+"%",Vector2(1157,car_y-56),23,ORANGE)
		draw_rect(Rect2(1157,car_y-40,390,9),Color("#4c5a73"));draw_rect(Rect2(1157,car_y-40,390*world.cake_quality/100,9),Color("#e9b5b0"))
	if world.player.vehicle:
		var c=world.player.vehicle;panel(Rect2(1135,car_y,435,147));txt(str(int(absf(c.speed)*3.6))+" km/h",Vector2(1157,car_y+41),32,ORANGE)
		txt("车况 "+str(int(ceil(c.hp)))+" / "+str(int(c.max_hp))+"    豚师 "+str(int(ceil(world.player.hp))),Vector2(1157,car_y+76),19)
		txt("W/S 油门刹车 · A/D 转向",Vector2(1157,car_y+110),18);txt("空格 手刹 · E 停稳下车",Vector2(1157,car_y+135),17)
	elif not world.nearest_hotspot().is_empty():
		var h=world.nearest_hotspot();var text_value="E  "+h.label;var width=ToonKit.font().get_string_size(text_value,HORIZONTAL_ALIGNMENT_LEFT,-1,23).x+50
		panel(Rect2(800-width/2,744,width,53),ORANGE);txt(text_value,Vector2(825-width/2,779),23,INK)
	if is_instance_valid(target) and target_time>0 and target.hp>0:
		var label="冲撞手" if target.role=="charger" else "守备打手" if target.role=="shield" else "追击者" if target is ChapterFighter and target.assignment=="staff" else "街头打手"
		panel(Rect2(625,26,350,62));txt(label,Vector2(645,53),18);draw_rect(Rect2(645,66,310,8),Color("#4c5a73"));draw_rect(Rect2(645,66,310*target.hp/target.max_hp,8),ORANGE)
	if world.player.guard_flash>0:txt("格挡",Vector2(750,695),26,ORANGE)
	if Time.get_ticks_msec()<notice_until:
		var lines=_wrap_text(notice,570,18);panel(Rect2(490,120,620,26+lines.size()*25))
		for i in range(lines.size()):txt(lines[i],Vector2(512,148+i*25),18)
	if world.bark_text!="":
		var lines=_wrap_text(world.bark_text,1120,23);panel(Rect2(190,831-lines.size()*32,1220,62+lines.size()*32),Color("#253149"))
		txt(world.bark_speaker,Vector2(213,859-lines.size()*32),19,ORANGE)
		for i in range(lines.size()):txt(lines[i],Vector2(213,891-(lines.size()-i)*32),23)
	else:
		panel(Rect2(325,842,950,33));txt("左键 连击   R 重击   F 踢击   G 闪避   B 格挡   Q 热血   E 互动   M 地图   Esc 菜单",Vector2(345,865),16)
	if help:
		panel(Rect2(950,300,620,220));txt("操作与选择",Vector2(975,340),26,ORANGE)
		var lines=["WASD 移动 / 驾驶 · 鼠标视角 · 空格 跳跃/手刹","左键连击 · R重击 · F踢击 · G/右键闪避 · B格挡","1 回复体力 · Q 热血 · V 配音 · F5/F9 保存/读取","关后勤门会挡住通路，车辆也能堵门。","H 收起帮助 · Esc 可重试撤离或请炫神接应"]
		for i in range(lines.size()):txt(lines[i],Vector2(975,377+i*28),18)
	if world.failed_reason!="":
		draw_rect(Rect2(0,0,1600,900),Color(.03,.06,.1,.65));panel(Rect2(430,325,740,220));txt("这次没能护住",Vector2(620,380),34,ORANGE);txt(world.failed_reason,Vector2(476,433),24);txt("E / Enter 重试 · T 调整天赋 · 竞速送蛋糕保留",Vector2(505,495),22)

	LandmarkHUD.draw(self)

func _cinema():
	var d=world.director;draw_rect(Rect2(0,0,1600,65),Color("#111b29"));draw_rect(Rect2(0,835,1600,65),Color("#111b29"))
	panel(Rect2(44,87,450,43));txt(d.caption,Vector2(64,117),23,ORANGE)
	if d.subtitle!="":
		var lines=_wrap_text(d.subtitle,1200,27);panel(Rect2(145,670,1310,143));txt(d.speaker,Vector2(180,708),23,ORANGE)
		for i in range(lines.size()):txt(lines[i],Vector2(180,750+i*36),27)
	txt("E / Enter 跳过 · Esc 暂停 · V 配音",Vector2(1210,874),16)
	if d.dark>0:draw_rect(Rect2(0,0,1600,900),Color(0,0,0,d.dark))

func _map():
	super._map()
	var origin=Vector2(840,590);var scale_value=1.45
	if world.talents.has("utility1"):
		for key in ["pearl","jinmao","luo"]:
			var p=LandmarkSet.DATA[key].entry;var point=origin+Vector2(p.x,p.z)*scale_value;draw_circle(point,10,ORANGE);txt("✓" if world.quests.states[key]==2 else "支",point+Vector2(-5,6),14,INK)
	for target in world.navigation_targets():
		var p=origin+Vector2(target.p.x,target.p.z)*scale_value;draw_circle(p,10,ORANGE);draw_circle(p,4,INK)
	txt(world.objective(),Vector2(370,145),22,ORANGE)
	if world.stage==2:txt("路线自选：西侧沿江道或世纪大道转西路",Vector2(365,840),17)
	if world.race_active:txt("天桥上的点才算数；南侧上、北侧下，任选半圈",Vector2(365,840),17)

func menu_buttons() -> Array:
	var buttons=[["继续游戏","resume"],["读取第一章检查点","load"]]
	if world.stage==4:buttons.append(["重试本次撤离","retry"])
	elif world.stage==2:buttons.append(["请炫神接应车辆","rescue"])
	buttons.append(["从抵沪重玩本章","new"]);buttons.append(["返回标题","title"]);return buttons
func _menu():
	draw_rect(Rect2(0,0,1600,900),Color(.05,.10,.16,.78));panel(Rect2(480,210,640,500));txt("休息一下",Vector2(675,279),42,ORANGE)
	var buttons=menu_buttons()
	for i in range(buttons.size()):
		var r=_chapter_button_rect(i);panel(r,ORANGE if i==world.menu_selection else Color("#3e5366"));txt(buttons[i][0],r.position+Vector2(25,39),25,INK if i==world.menu_selection else PAPER)
	txt("W/S 选择 · Enter 确定 · V 配音",Vector2(570,672),18)
func menu_click(p: Vector2):
	for i in range(menu_buttons().size()):
		if _chapter_button_rect(i).has_point(p):world.menu_action(menu_buttons()[i][1]);return

func _chapter_button_rect(i: int) -> Rect2:
	return Rect2(530,320+i*(64 if menu_buttons().size()>4 else 78),540,52 if menu_buttons().size()>4 else 60)

func _markers(targets: Array):
	var labels=[]
	for i in range(targets.size()):
		var target=targets[i];var p3=target.p+Vector3.UP*2.6
		var point=world.camera.unproject_position(p3);var behind=world.camera.is_position_behind(p3)
		if behind:point=Vector2(800,450)-(point-Vector2(800,450))
		var off=behind or not Rect2(75,265,1450,385).has_point(point)
		point=Vector2(clampf(point.x,80,1520),clampf(point.y,270,625))
		if point.x<340:point.y=clampf(point.y,355,555)
		if world.player.vehicle and point.x>1000:point.y=minf(point.y,485)
		var color=Color("#77cff4") if i==0 else Color("#b3d6e3")
		var r=10.0 if i==0 else 7.0
		if off:
			var direction=(point-Vector2(800,450)).normalized();var side=Vector2(-direction.y,direction.x)
			draw_colored_polygon(PackedVector2Array([point+direction*14,point-direction*9+side*9,point-direction*9-side*9]),color)
		else:draw_colored_polygon(PackedVector2Array([point+Vector2(0,-r),point+Vector2(r,0),point+Vector2(0,r),point+Vector2(-r,0)]),color)
		var dist=world.player.position.distance_to(target.p)
		var label=target.label+" · "+str(int(ceil(dist)))+"m"
		var size_value=17 if i==0 else 15;var width=ToonKit.font().get_string_size(label,HORIZONTAL_ALIGNMENT_LEFT,-1,size_value).x+24
		var x=clampf(point.x-width/2,30,1570-width);var y=point.y+16
		for rect in labels:
			if Rect2(x,y,width,31).intersects(rect.grow(5)):y=rect.end.y+8
		if y>point.y+20:draw_line(point+Vector2(0,12),Vector2(x+width/2,y),color,1.5)
		labels.append(Rect2(x,y,width,31));panel(Rect2(x,y,width,31),Color("#253149"));txt(label,Vector2(x+12,y+22),size_value,color)
