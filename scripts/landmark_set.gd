class_name LandmarkSet
extends RefCounted

const DATA={
	"shanghai":{"name":"上海中心","title":"主线 · 八子看上海","entry":Vector3(132,0,23),"floor":Vector3(132,158,3),"color":"#76c5bc"},
	"pearl":{"name":"东方明珠","title":"支线 · 听得见的上海","entry":Vector3(-64,.4,-71),"floor":Vector3(-64,72,-85),"color":"#dc8bb2"},
	"jinmao":{"name":"金茂大厦","title":"支线 · 中庭快递","entry":Vector3(129,0,-24),"floor":Vector3(129,87,-43),"color":"#e8bb70"},
	"luo":{"name":"环球金融中心 · LUO","title":"支线 · 老员工回来了","entry":Vector3(178,0,-13),"floor":Vector3(178,108,-31),"color":"#6da4da"}}

static func block(g: Node3D,size: Vector3,color: String,p: Vector3):
	ToonKit.box(g,size,color,p);ToonKit.solid(g,size,p)

static func build(w: Node3D) -> Dictionary:
	var result={}
	for key in DATA:
		var d=DATA[key];var lobby=Node3D.new();lobby.name=key+"_lobby";lobby.position=d.entry;w.add_child(lobby)
		# Public vestibule adjoins the existing tower; its forward doorway is physical.
		block(lobby,Vector3(8,.16,7),"#ded9c7",Vector3(0,.08,0))
		for x in [-4,4]:block(lobby,Vector3(.25,4,7),"#547d8b",Vector3(x,2,0))
		block(lobby,Vector3(8,4,.25),"#376278",Vector3(0,2,-3.5));block(lobby,Vector3(8,.3,7),"#e4e3cc",Vector3(0,4.15,0))
		for x in [-2.9,2.9]:block(lobby,Vector3(2.1,3.8,.2),"#78a8b6",Vector3(x,1.9,3.5))
		block(lobby,Vector3(8,.8,.25),"#36566f",Vector3(0,3.6,3.5))
		var ramp=ToonKit.box(lobby,Vector3(3.6,.08,2.8),"#ded9c7",Vector3(0,.06,4.5));ramp.rotation.x=atan(.16/2.8)
		var ramp_body=ToonKit.solid(lobby,Vector3(3.6,.08,2.8),Vector3(0,.06,4.5));ramp_body.rotation.x=ramp.rotation.x
		ToonKit.text(lobby,d.name,Vector3(0,3.6,3.66),.006)
		var door=StoryDoor.new();door.position=Vector3(0,.16,3.5);lobby.add_child(door);door.build(w,3.6,true)
		ToonKit.text(lobby,"↑  LUO 访客电梯  E" if key=="luo" else "↑  观光电梯  E",Vector3(0,2,-3.32),.006)
		ToonKit.box(lobby,Vector3(2.8,2.9,.14),"#b9ced0",Vector3(0,1.6,-3.3))
		ToonKit.text(lobby,"↑",Vector3(0,1.7,-3.18),.018)
		ToonKit.finish(lobby)
		var room=Node3D.new();room.name=key+"_upper_floor";room.position=d.floor;w.add_child(room)
		# Complete glazed shell, structural posts, floor and ceiling. Each sits at real tower height.
		block(room,Vector3(17,.5,17),"#e3ddca",Vector3(0,-.25,0))
		var ceiling=8.0 if key=="jinmao" else 5.0
		block(room,Vector3(17,.3,17),"#d7e6de",Vector3(0,ceiling+.15,0))
		for side in [-1,1]:
			for axis in [0,1]:
				var size=Vector3(17,ceiling,.15) if axis==0 else Vector3(.15,ceiling,17)
				var p=Vector3(0,ceiling/2,side*8.5) if axis==0 else Vector3(side*8.5,ceiling/2,0)
				var glass=ToonKit.box(room,size,"#a7d2dc",p)
				var m=ToonKit.mat("#99cad5").duplicate();m.transparency=BaseMaterial3D.TRANSPARENCY_ALPHA;m.albedo_color.a=.12;m.cull_mode=BaseMaterial3D.CULL_DISABLED;glass.material_override=m
				ToonKit.solid(room,size,p)
				ToonKit.box(room,Vector3(size.x,.6,size.z),"#446678",Vector3(p.x,.3,p.z))
		for x in [-8.3,8.3]:
			for z in [-8.3,8.3]:block(room,Vector3(.32,ceiling,.32),"#537b89",Vector3(x,ceiling/2,z))
		# Elevator enclosure and readable exit panel.
		block(room,Vector3(3.2,3.8,.25),"#567e89",Vector3(0,1.9,6.9))
		for x in [-1.65,1.65]:block(room,Vector3(.22,3.8,1.6),"#567e89",Vector3(x,1.9,7.6))
		ToonKit.text(room,"E  ↓  返回大厅",Vector3(0,2,6.72),.006)
		ToonKit.box(room,Vector3(12,.85,.16),"#36576c",Vector3(0,4.3,-8.2))
		ToonKit.text(room,d.title,Vector3(0,4.3,-8.08),.007)
		var light=OmniLight3D.new();light.position=Vector3(0,3,0);light.omni_range=20;light.light_energy=.5;light.light_cull_mask=2;room.add_child(light)
		var effects=Node3D.new();room.add_child(effects)
		match key:
			"shanghai":
				for x in [-6.8,6.8]:
					block(room,Vector3(1.2,.55,2.4),"#719a9c",Vector3(x,.275,.2));ToonKit.box(room,Vector3(.2,.8,2.4),"#547b86",Vector3(x+(.5 if x>0 else -.5),.65,.2))
				block(room,Vector3(3,.8,1.4),"#c4b596",Vector3(1.5,.4,-6.1));ToonKit.text(room,"浦江两岸  /  城市观景",Vector3(1.5,1.5,-6),.004)
				for p in [Vector3(-6,0,-5),Vector3(6,0,-5),Vector3(-6,0,4)]:
					ToonKit.cyl(room,.18,1.2,"#466a7c",p+Vector3.UP*.6)
					var lens=ToonKit.cyl(room,.33,1.05,"#e7ba63",p+Vector3.UP*1.5);lens.rotation.x=PI/2
			"pearl":
				ToonKit.box(room,Vector3(8,.65,1.8),"#425d80",Vector3(0,.325,-4.8))
				for i in range(4):
					var lamp=ToonKit.box(effects,Vector3(1.3,.15,1.2),["#dd93b3","#e5bb66","#78c4bc","#7d9cdb"][i],Vector3(-3+i*2,.75,-4.8));lamp.name="Pad"+str(i)
				for x in [-6,6]:
					block(room,Vector3(1.4,.5,3),"#ab7592",Vector3(x,.25,1));ToonKit.box(room,Vector3(.24,.8,3),"#6d6385",Vector3(x+(.55 if x>0 else -.55),.6,1))
				ToonKit.cyl(room,.9,.55,"#d6bfa4",Vector3(0,.275,1))
				ToonKit.text(room,"听歌的城市节拍台",Vector3(0,2,-6.5),.007)
			"jinmao":
				# Broad ascending landings turn around the middle of the atrium.
				for i in range(8):
					var p=parkour_point(i);block(room,Vector3(2.4,.45,2.4),"#cfad75",p-Vector3.UP*.225)
					block(room,Vector3(.65,maxf(.1,p.y-.45),.65),"#627d8b",Vector3(p.x,maxf(.1,p.y-.45)/2,p.z))
					ToonKit.text(room,str(i+1),p+Vector3.UP*.4,.007)
				ToonKit.box(room,Vector3(1,.8,1),"#df966b",Vector3(-5,.4,4))
			"luo":
				for x in [-6,6]:
					block(room,Vector3(2.8,.8,1.2),"#b4c4c3",Vector3(x,.4,-6));ToonKit.box(room,Vector3(1.2,.75,.12),"#294c65",Vector3(x,1.2,-6.2))
				ToonKit.text(room,"LUO  /  自由伞\n豚师 · 旧员工访客通道",Vector3(0,3,-7.8),.009)
				for x in [-6.2,6.2]:
					block(room,Vector3(2.7,1.9,3.6),"#436786",Vector3(x,.95,-1))
				block(room,Vector3(2,1,1),"#b7ced2",Vector3(0,.5,-6))
				ToonKit.orb(room,Vector3(.5,.35,.5),"#e5c278",Vector3(0,1.35,-6))
				for z in [2.2,-2.2]:
					for side in [-1,1]:ToonKit.box(room,Vector3(.3,2.5,.5),"#42617b",Vector3(side*7.7,1.25,z))
					var beam=ToonKit.box(effects,Vector3(15.2,.15,.12),"#ed7e76",Vector3(0,1.15,z));beam.name="Beam"+str(effects.get_child_count())
		ToonKit.finish(room);room.visible=false
		for body in room.find_children("*","StaticBody3D",true,false):body.collision_layer=0
		result[key]={"room":room,"lobby":lobby,"door":door,"effects":effects}
	return result

static func parkour_point(i: int) -> Vector3:
	var points=[Vector3(-5,.5,1.6),Vector3(-5,1,-1.1),Vector3(-3,1.5,-3.5),Vector3(0,2,-4.5),Vector3(3,2.5,-3.5),Vector3(5,3,-1),Vector3(4.5,3.5,2),Vector3(2,4,3.6)]
	return points[clampi(i,0,7)]
