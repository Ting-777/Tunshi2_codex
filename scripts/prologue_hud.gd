extends StreetHUD

func _draw():
	if not world or not world.player or photo:return
	if menu or world.pause_menu:
		_menu();return
	if world.director.active():_cinema();return
	panel(Rect2(30,26,385,83));draw_rect(Rect2(30,26,6,83),ORANGE)
	txt("序章  /  一个都不少",Vector2(53,60),26)
	txt("长沙 · 晴川医院" if world.phase<3 else "几年后 · 长沙的家",Vector2(53,91),17,Color("#b6d8ce"))
	panel(Rect2(1115,26,455,83));txt("八子俱全",Vector2(1136,59),19,ORANGE)
	for i in range(8):
		var p=Vector2(1149+i*50,84);draw_circle(p,12,Color(StoryCast.BADGES[i]));txt(str(i+1),p+Vector2(-5,6),15,Color.WHITE)
	if world.dialogue.is_empty():
		panel(Rect2(30,126,530,110));txt(world.objective(),Vector2(49,157),21)
		txt(world.subobjective(),Vector2(49,185),16,Color("#b6d8ce"))
		var targets=world.navigation_targets()
		if not targets.is_empty():
			var target=targets[0];var distance=Vector2(world.player.position.x-target.p.x,world.player.position.z-target.p.z).length()
			txt("目标："+target.label+" · "+str(int(ceil(distance)))+" 米",Vector2(49,216),18,Color("#82ccef"))
		_markers(targets)
		var h=world.nearest_hotspot()
		if world.player.vehicle:
			panel(Rect2(1125,670,445,155));var car=world.player.vehicle
			txt(str(int(absf(car.speed)*3.6))+" km/h   车况 "+str(int(ceil(car.hp)))+"/180",Vector2(1144,710),24,ORANGE)
			txt("豚师体力  "+str(int(ceil(world.player.hp)))+"/100",Vector2(1144,742),18)
			txt("W/S 油门刹车 · A/D 转向",Vector2(1144,778),18);txt("空格 手刹 · E 下车 · R 请炫神挪车",Vector2(1144,807),17)
		elif not h.is_empty():
			var width=ToonKit.font().get_string_size("E  "+h.label,HORIZONTAL_ALIGNMENT_LEFT,-1,23).x+65
			panel(Rect2(800-width/2,733,width,57),ORANGE);txt("E  "+h.label,Vector2(826-width/2,771),23,INK)
		panel(Rect2(425,840,750,35));txt("WASD 移动   鼠标 视角   E 互动   空格 跳跃   F5 保存   Esc 菜单",Vector2(447,864),16)
	else:
		var line=world.dialogue[world.line_index]
		panel(Rect2(145,648,1310,186),Color("#253149"));draw_rect(Rect2(145,648,7,186),ORANGE)
		txt(line[0],Vector2(180,688),25,ORANGE)
		var text_lines=_wrap_text(line[1],1200,27)
		for i in range(text_lines.size()):txt(text_lines[i],Vector2(180,734+i*38),27)
		txt("配音中" if world.voice.player.playing and world.voice.enabled else "对白",Vector2(180,812),16,Color("#82ccef"))
		txt("E 继续 · V 配音"+("开" if world.voice.enabled else "关")+" · C 自动"+("开" if world.auto_dialogue else "关")+" · Esc 暂停",Vector2(820,811),16,Color("#b6d8ce"))
	if Time.get_ticks_msec()<notice_until:
		var w=ToonKit.font().get_string_size(notice,HORIZONTAL_ALIGNMENT_LEFT,-1,20).x+46;panel(Rect2(800-w/2,227,w,46));txt(notice,Vector2(823-w/2,257),20)
	if help:
		panel(Rect2(1010,140,560,200));txt("出院小贴士",Vector2(1034,177),25,ORANGE)
		txt("走近人物或物品，看到 E 提示再互动。",Vector2(1034,218),20)
		txt("车要停稳、下车，才算腾好位置。",Vector2(1034,253),20)
		txt("R 可请炫神帮忙挪车；H 收起帮助。",Vector2(1034,288),20)

func _markers(targets: Array):
	var labels=[]
	for i in range(targets.size()):
		var target=targets[i];var p3=target.p+Vector3.UP*2.6
		var point=world.camera.unproject_position(p3);var behind=world.camera.is_position_behind(p3)
		if behind:point=Vector2(800,450)-(point-Vector2(800,450))
		var off=behind or not Rect2(75,265,1450,385).has_point(point)
		point=Vector2(clampf(point.x,80,1520),clampf(point.y,270,640))
		var color=Color("#77cff4") if i==0 else Color("#b3d6e3")
		var r=10.0 if i==0 else 7.0
		if off:
			var direction=(point-Vector2(800,450)).normalized();var side=Vector2(-direction.y,direction.x)
			draw_colored_polygon(PackedVector2Array([point+direction*14,point-direction*9+side*9,point-direction*9-side*9]),color)
		else:draw_colored_polygon(PackedVector2Array([point+Vector2(0,-r),point+Vector2(r,0),point+Vector2(0,r),point+Vector2(-r,0)]),color)
		var dist=Vector2(world.player.position.x-target.p.x,world.player.position.z-target.p.z).length()
		var label=target.label+" · "+str(int(ceil(dist)))+"m"
		var size_value=17 if i==0 else 15;var width=ToonKit.font().get_string_size(label,HORIZONTAL_ALIGNMENT_LEFT,-1,size_value).x+24
		var x=clampf(point.x-width/2,30,1570-width);var y=point.y+16
		for rect in labels:
			if Rect2(x,y,width,31).intersects(rect.grow(5)):y=rect.end.y+8
		if y>point.y+20:draw_line(point+Vector2(0,12),Vector2(x+width/2,y),color,1.5)
		labels.append(Rect2(x,y,width,31));panel(Rect2(x,y,width,31),Color("#253149"));txt(label,Vector2(x+12,y+22),size_value,color)

func _cinema():
	var d=world.director
	draw_rect(Rect2(0,0,1600,65),Color("#111b29"));draw_rect(Rect2(0,835,1600,65),Color("#111b29"))
	if d.kind=="legacy":_legacy_cinema(d)
	elif d.show_photo and d.shot_texture:
		draw_rect(Rect2(0,0,1600,900),Color("#243449"));draw_rect(Rect2(200,105,1200,695),PAPER);draw_texture_rect(d.shot_texture,Rect2(220,125,1160,652),false)
	if d.kind!="legacy":
		var width=ToonKit.font().get_string_size(d.caption,HORIZONTAL_ALIGNMENT_LEFT,-1,27).x
		panel(Rect2(770-width/2,776,width+60,51),Color("#253149"));txt(d.caption,Vector2(800-width/2,812),27)
	txt("E / Enter 跳过演出 · V 配音 · Esc 暂停",Vector2(1170,875),16)
	if d.dark>0:draw_rect(Rect2(0,0,1600,900),Color(0,0,0,d.dark))
	if d.flash>0:draw_rect(Rect2(0,0,1600,900),Color(1,1,1,d.flash))

func _legacy_cinema(d):
	var width=ToonKit.font().get_string_size(d.caption,HORIZONTAL_ALIGNMENT_LEFT,-1,20).x
	panel(Rect2(44,87,width+40,42),Color("#253149"));txt(d.caption,Vector2(64,116),20)
	if d.card_title!="":
		txt("豚师2",Vector2(94,614),82,INK);txt("豚师2",Vector2(90,610),82,ORANGE)
		txt("上海风云",Vector2(104,677),42,INK);txt("上海风云",Vector2(100,673),42)
	if d.subtitle!="":
		panel(Rect2(145,675,1310,138),Color("#253149"));txt(d.speaker,Vector2(180,714),23,ORANGE)
		var lines=_wrap_text(d.subtitle,1200,27)
		for i in range(lines.size()):txt(lines[i],Vector2(180,757+i*36),27)

func _wrap_text(value: String,width: float,size_value: int) -> Array:
	var lines=[];var current=""
	for ch in value:
		if ToonKit.font().get_string_size(current+ch,HORIZONTAL_ALIGNMENT_LEFT,-1,size_value).x>width:lines.append(current);current=""
		current+=ch
	if current!="":lines.append(current)
	return lines

func menu_buttons() -> Array:
	if not menu:
		return [["继续", "resume"],["读取序章检查点", "load"],["陆家嘴自由漫游", "sandbox"],["返回标题", "title"]]
	var buttons=[]
	if world.has_story_save():buttons.append(["继续序章" if world.saved_phase()<5 else "回家看看", "continue"])
	buttons.append(["开始序章" if not world.has_story_save() else "重玩序章", "new"])
	buttons.append(["重看开场 · 长沙的黎明", "replay"])
	buttons.append(["陆家嘴自由漫游", "sandbox"])
	buttons.append(["退出游戏", "quit"])
	return buttons

func _menu():
	draw_rect(Rect2(0,0,610,900),Color(.09,.15,.24,.95))
	txt("DOLPHIN  2",Vector2(62,93),27,ORANGE);txt("豚师2",Vector2(54,199),82);txt("上海风云",Vector2(61,257),46)
	txt("序章  ·  一个都不少",Vector2(64,335),29)
	txt("湘江天亮，八子俱全。",Vector2(64,383),22,Color("#b6d8ce"))
	txt("从长沙的黎明，回到家里。",Vector2(64,418),22,Color("#b6d8ce"))
	txt("V 配音："+("开" if world.voice.enabled else "关")+"    C 自动对白："+("开" if world.auto_dialogue else "关"),Vector2(64,447),17,Color("#82ccef"))
	var buttons=menu_buttons()
	for i in range(buttons.size()):
		var rect=_button_rect(i);panel(rect,ORANGE if i==0 else Color("#3a4e64"));txt(buttons[i][0],rect.position+Vector2(24,38),24,INK if i==0 else PAPER)
	txt("W/S 选择 · Enter 确定 · 支持鼠标",Vector2(64,824),17)
	txt("0.5.4 · 原生 Godot · Windows / Linux",Vector2(64,861),15,Color("#91b5bd"))
	draw_circle(Vector2(555,_button_rect(world.menu_selection).get_center().y),8,ORANGE)

func _button_rect(index: int) -> Rect2:
	var compact=menu_buttons().size()>4
	return Rect2(63,466+index*(66 if compact else 77),475,56 if compact else 62)

func menu_click(p: Vector2):
	for i in range(menu_buttons().size()):
		if _button_rect(i).has_point(p):world.menu_action(menu_buttons()[i][1]);return
