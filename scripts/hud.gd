class_name StreetHUD
extends Control

var world: Node3D
var menu=true
var map_open=false
var help=false
var photo=false
var target: StreetActor
var target_time=0.0
var notice=""
var notice_until=0
const INK=Color("#202a48")
const PAPER=Color("#fff1d5")
const ORANGE=Color("#ffca43")

func _ready():mouse_filter=Control.MOUSE_FILTER_IGNORE
func _process(dt):
	if world and not world.paused:target_time=maxf(0,target_time-dt)
	queue_redraw()
func say(value: String):notice=value;notice_until=Time.get_ticks_msec()+3400
func panel(r: Rect2,color: Color=INK):
	var cut=9.0;draw_colored_polygon(PackedVector2Array([r.position,r.position+Vector2(r.size.x,0),r.end-Vector2(0,cut),r.end-Vector2(cut,0),r.position+Vector2(0,r.size.y)]),color)
func txt(s: String,p: Vector2,font_size: int=20,color: Color=PAPER):draw_string(ToonKit.font(),p,s,HORIZONTAL_ALIGNMENT_LEFT,-1,font_size,color)

func _draw():
	if not world or not world.player or photo:return
	if map_open:_map();return
	if menu:
		draw_rect(Rect2(0,0,580,900),Color(.07,.17,.22,.94));txt("DOLPHIN  2",Vector2(65,112),28,ORANGE);txt("豚师2",Vector2(58,240),94);txt("上海风云",Vector2(65,303),48);draw_line(Vector2(65,340),Vector2(480,340),ORANGE,4);txt("陆家嘴  /  LUJIAZUI",Vector2(65,393),27);txt("沿江兜风，拐进街头。",Vector2(65,452),23,Color("#b6cebe"));txt("原生 Godot · 都市卡通版 · 无剧情自由漫游",Vector2(65,502),17,Color("#b6cebe"));panel(Rect2(65,615,385,70),ORANGE);txt("开始漫游    →",Vector2(106,661),29,INK);txt("点击或按 Enter 开始",Vector2(65,724),19);txt("WASD 移动   鼠标视角   M 地图",Vector2(65,812),18);return
	panel(Rect2(30,26,315,76));draw_rect(Rect2(30,26,6,76),ORANGE);txt("豚师2  ·  上海风云",Vector2(53,58),23);txt("LUJIAZUI  /  陆家嘴",Vector2(53,86),16,Color("#c5d8ed"));panel(Rect2(1300,26,270,62));txt("¥ "+str(world.money)+"   M 地图",Vector2(1320,65),22)
	panel(Rect2(30,116,250,57));txt("豚师  "+str(int(ceil(world.player.hp)))+" / 100",Vector2(45,139),15);draw_rect(Rect2(45,149,218,8),Color("#4d5876"));draw_rect(Rect2(45,149,218*world.player.hp/100,8),Color("#5fe1bc"));panel(Rect2(30,180,250,46));txt("热血",Vector2(45,202),14,ORANGE);draw_rect(Rect2(93,191,170,9),Color("#4d5876"));draw_rect(Rect2(93,191,170*world.player.heat/100,9),ORANGE)
	_minimap()
	if Time.get_ticks_msec()<world.combo_expiry:
		panel(Rect2(30,238,250,69));txt(str(world.combo_hits)+"  连击",Vector2(46,272),27,ORANGE);txt("三段连打 · 收招击倒",Vector2(46,294),14)
	if world.player.guard_flash>0:txt("格挡",Vector2(728,720),26,ORANGE)
	if is_instance_valid(target) and target_time>0:
		panel(Rect2(625,33,350,60));txt("路人" if target.friendly else "重拳打手" if target.role=="bruiser" else "街头打手",Vector2(643,58),18);draw_rect(Rect2(643,70,314,7),Color("#485d60"));draw_rect(Rect2(643,70,314*target.hp/target.max_hp,7),ORANGE)
	if Time.get_ticks_msec()<notice_until:
		var w=ToonKit.font().get_string_size(notice,HORIZONTAL_ALIGNMENT_LEFT,-1,20).x+46;panel(Rect2(800-w/2,117,w,46));txt(notice,Vector2(823-w/2,147),20)
	if world.player.vehicle:
		var car=world.player.vehicle;var ratio=clampf(car.hp/car.max_hp,0,1)
		panel(Rect2(1280,668,290,157));txt(str(int(absf(car.speed)*3.6))+" km/h",Vector2(1300,708),34)
		txt("车况  "+str(int(ceil(car.hp)))+" / "+str(int(car.max_hp)),Vector2(1300,736),17,ORANGE if ratio>.3 else Color("#ff806a"))
		draw_rect(Rect2(1300,746,248,10),Color("#48576d"));draw_rect(Rect2(1300,746,248*ratio,10),Color("#5fe1bc") if ratio>.5 else ORANGE if ratio>.25 else Color("#ff806a"))
		txt("W/S 油门刹车 · A/D 转向" if car.hp>0 else "失去动力 · 停稳后下车",Vector2(1300,784),15);txt("空格 手刹 · E 下车",Vector2(1300,808),15)
		if car.damage_flash>0:draw_rect(Rect2(0,0,1600,900),Color(1,.22,.12,minf(.14,car.damage_flash*.28)))
	elif world.near_car():panel(Rect2(626,742,348,47));txt("E  上车 · 沿江兜风",Vector2(665,774),22)
	if help:
		panel(Rect2(1185,120,385,410));txt("操作",Vector2(1210,158),26,ORANGE);var lines=["WASD  移动    鼠标  视角","空格  跳跃    X  蹲下","左键  连击    R 重击    F 踢击","右键 / G 闪避    B 格挡","Q 热血爆发    E 上下车","M 地图    1 恢复体力","F5 保存    F9 读取","Esc 暂停    F11 全屏"]
		for i in range(lines.size()):txt(lines[i],Vector2(1210,200+i*34),18)
	panel(Rect2(440,839,720,35));txt("左键 连击   R 重击   F 踢击   G 闪避   E 上下车   M 地图   H 操作",Vector2(461,863),16)
	if world.paused and not world.capture_mode:
		draw_rect(Rect2(0,0,1600,900),Color(0,.06,.1,.55));panel(Rect2(545,330,510,240));txt("休息一下",Vector2(688,397),38);txt("按 Esc 或点击继续",Vector2(674,460),23);txt("T 返回序章标题",Vector2(697,518),21,ORANGE)

func _minimap():
	var outer=Rect2(30,633,214,190);panel(outer);var rect=Rect2(39,642,196,172);draw_rect(rect,Color("#d3dfe8"));var center=Vector2(world.player.position.x,world.player.position.z);var scale_value=1.9
	var river=Rect2(rect.get_center()+(Vector2(-500,-400)-center)*scale_value,Vector2(330,650)*scale_value).intersection(rect)
	if river.has_area():draw_rect(river,Color("#1e8da5"))
	for block in world.city.blocks:
		var b=Rect2(rect.get_center()+(block.position-center)*scale_value,block.size*scale_value).intersection(rect)
		if b.has_area():draw_rect(b,Color("#91b2c2"))
	for road in world.city.roads:
		var p=_clip(rect.get_center()+(road.a-center)*scale_value,rect.get_center()+(road.b-center)*scale_value,rect)
		if p.size()==2:draw_line(p[0],p[1],Color("#536781"),road.width*scale_value)
	for poi in world.city.pois:
		var point=rect.get_center()+(poi.p-center)*scale_value
		if rect.grow(-7).has_point(point):draw_circle(point,4,Color(poi.color))
	for actor in world.people:
		if actor.hp<=0 or absf(actor.position.y-world.player.position.y)>3:continue
		var point=rect.get_center()+(Vector2(actor.position.x,actor.position.z)-center)*scale_value
		if rect.grow(-5).has_point(point):draw_circle(point,2.5 if actor.friendly else 3.4,PAPER if actor.friendly else Color("#d8755d"))
	for r in [Rect2(17,620,22,210),Rect2(235,620,22,210),Rect2(17,620,240,22),Rect2(17,814,240,16)]:draw_rect(r,INK)
	var angle=world.player.vehicle.rotation.y if world.player.vehicle else world.player.rotation.y;draw_circle(rect.get_center(),7,ORANGE);draw_line(rect.get_center(),rect.get_center()+Vector2(sin(angle),cos(angle))*17,PAPER,3);txt("N ↑",Vector2(197,665),13,INK);txt("M 陆家嘴全图",Vector2(55,805),14)

func _clip(a: Vector2,b: Vector2,r: Rect2):
	var d=b-a;var low=0.0;var high=1.0;var p=[-d.x,d.x,-d.y,d.y];var q=[a.x-r.position.x,r.end.x-a.x,a.y-r.position.y,r.end.y-a.y]
	for i in range(4):
		if absf(p[i])<.00001:
			if q[i]<0:return []
		else:
			var t=q[i]/p[i]
			if p[i]<0:low=maxf(low,t)
			else:high=minf(high,t)
			if low>high:return []
	return [a+d*low,a+d*high]

func _map():
	draw_rect(Rect2(0,0,1600,900),INK);txt("陆家嘴",Vector2(56,73),36);txt("LUJIAZUI / SHANGHAI",Vector2(58,107),18,ORANGE);txt("M / Esc 返回游戏",Vector2(1270,72),21)
	panel(Rect2(340,125,910,720),Color("#2389a2"));var origin=Vector2(840,590);var s=1.45;draw_rect(Rect2(origin+Vector2(-170,-285)*s,Vector2(440,460)*s),Color("#d3dfe8"));draw_rect(Rect2(origin+Vector2(69,-110)*s,Vector2(72,60)*s),Color("#55ac94"))
	for road in world.city.roads:draw_line(origin+road.a*s,origin+road.b*s,Color("#536781"),road.width*s,true)
	for rect in world.city.blocks:draw_rect(Rect2(origin+rect.position*s,rect.size*s),Color("#8cabc2"))
	draw_arc(origin+Vector2(0,-10)*s,27*s,0,TAU,96,PAPER,7,true)
	for i in range(world.city.pois.size()):
		var poi=world.city.pois[i];var p=origin+poi.p*s;draw_circle(p,6,Color(poi.color));txt(str(i+1),p+Vector2(-3,4),11,INK);var y=194+i*54;draw_circle(Vector2(83,y-7),10,Color(poi.color));txt(str(i+1),Vector2(79,y-3),12,INK);txt(poi.name,Vector2(106,y),20)
	var p=origin+Vector2(world.player.position.x,world.player.position.z)*s;draw_circle(p,11,INK);draw_circle(p,7,ORANGE);var angle=world.player.vehicle.rotation.y if world.player.vehicle else world.player.rotation.y;draw_line(p,p+Vector2(sin(angle),cos(angle))*22,PAPER,4);txt("你在这里",p+Vector2(16,9),18,INK);txt("黄 浦 江",Vector2(370,545),30);txt("外滩方向 ←",Vector2(370,600),19);txt("N ↑",Vector2(1170,165),25,INK);txt("● 豚师   ━ 可驾驶道路   ○ 环形天桥",Vector2(365,880),16)
