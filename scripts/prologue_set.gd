class_name PrologueSet
extends RefCounted

static func block(root: Node3D,size: Vector3,color: String,p: Vector3,solid: bool=true):
	ToonKit.box(root,size,color,p,.06)
	if solid:ToonKit.solid(root,size,p)

static func environment(root: Node3D):
	var e=WorldEnvironment.new();var env=Environment.new();env.background_mode=Environment.BG_SKY
	var sky=Sky.new();var material=ShaderMaterial.new();material.shader=load("res://shaders/city-sky.gdshader");sky.sky_material=material;env.sky=sky
	env.ambient_light_source=Environment.AMBIENT_SOURCE_COLOR;env.ambient_light_color=Color("#8796db");env.ambient_light_energy=.05;env.tonemap_mode=Environment.TONE_MAPPER_LINEAR;env.tonemap_exposure=1.0;e.environment=env;root.add_child(e)
	var sun=DirectionalLight3D.new();sun.rotation_degrees=Vector3(-55,-32,0);sun.light_energy=.98;sun.shadow_enabled=true;sun.directional_shadow_max_distance=80;sun.shadow_bias=.25;sun.shadow_normal_bias=2.0;root.add_child(sun)

static func hospital(root: Node3D) -> Dictionary:
	block(root,Vector3(54,.5,60),"#b9c9c1",Vector3(0,-.25,2))
	block(root,Vector3(28,.12,19),"#eee9d9",Vector3(0,.06,-9.5))
	block(root,Vector3(28,4.8,.4),"#e9dec6",Vector3(0,2.4,-19))
	ToonKit.box(root,Vector3(27.8,.95,.06),"#83aaa2",Vector3(0,.75,-18.74))
	for s in [-1,1]:
		block(root,Vector3(.4,4.8,19),"#e6d5c2",Vector3(s*14,2.4,-9.5))
		block(root,Vector3(12.4,4.8,.4),"#eedfc7",Vector3(s*7.8,2.4,0))
		ToonKit.box(root,Vector3(12.3,.8,.06),"#67a9a5",Vector3(s*7.8,1.05,.23))
		ToonKit.box(root,Vector3(5.8,2.7,.12),"#7baebf",Vector3(s*8,2.85,-18.74))
		ToonKit.box(root,Vector3(.16,2.7,.16),"#f5ead5",Vector3(s*8,2.85,-18.62))
		ToonKit.box(root,Vector3(6.1,.22,.6),"#f5ead5",Vector3(s*8,1.45,-18.5))
		bench(root,Vector3(s*10,.12,-3),0)
	block(root,Vector3(3.2,1.8,.4),"#eedfc7",Vector3(0,3.9,0))
	block(root,Vector3(28.4,.32,19.5),"#d5ded3",Vector3(0,4.94,-9.5))
	ToonKit.box(root,Vector3(29,.22,20.1),"#638e8b",Vector3(0,5.2,-9.5))
	ToonKit.box(root,Vector3(7,.24,2.6),"#588c91",Vector3(0,3.25,1.0))
	ToonKit.text(root,"长沙 · 晴川医院",Vector3(0,4.12,.26),.007,"#326d72")
	var door=StoryDoor.new();root.add_child(door);door.position=Vector3(0,.12,0);door.build(root.get_parent())
	ToonKit.text(root,"自动门",Vector3(0,2.75,.14),.0028,"#f4e9ce")
	ToonKit.text(root,"母婴休养区",Vector3(0,3.4,-18.7),.007,"#43877d")
	for i in range(8):
		var x=-6.6+(i%4)*4.4;var z=-12.4-(i/4)*3.6
		crib(root,Vector3(x,.12,z),i+1)
	block(root,Vector3(3.1,.55,1.7),"#82bcb1",Vector3(-10,.4,-11))
	ToonKit.orb(root,Vector3(.55,.14,.65),"#f5f1de",Vector3(-10,.78,-11.1))
	# A nurse counter, storage and a reading corner give the ward a real function.
	block(root,Vector3(4.0,1.05,1.15),"#7eaaa0",Vector3(10,.65,-16.9))
	ToonKit.box(root,Vector3(4.25,.14,1.3),"#eee7d5",Vector3(10,1.25,-16.9))
	ToonKit.box(root,Vector3(.85,.6,.16),"#3a6678",Vector3(10,1.61,-17.05))
	block(root,Vector3(2.8,2.4,.7),"#c2d5c4",Vector3(-12,1.35,-16.9))
	for s in [-1,1]:
		ToonKit.box(root,Vector3(.08,.24,.10),"#5b7d7c",Vector3(-12+s*.18,1.45,-16.48))
		plant(root,Vector3(s*11.9,.12,-1.7))
	for x in [-6.5,6.5]:
		for z in [-5.5,-13.5]:ceiling_light(root,Vector3(x,4.57,z),"#fff0d3",1.0)
	# One broad loading pad, with separated actual ground heights, no overlay grid.
	ToonKit.box(root,Vector3(5,.04,5.7),"#e7ce88",Vector3(0,.025,5),.03)
	ToonKit.text(root,"接人处",Vector3(-3.5,1.3,3),.004,"#35565a").billboard=BaseMaterial3D.BILLBOARD_ENABLED
	ToonKit.box(root,Vector3(4.6,.04,5.9),"#829ea3",Vector3(0,.025,17),.03)
	ToonKit.text(root,"黄色小车停这里",Vector3(0,.16,20.2),.004,"#fff4d3").rotation.x=-PI/2
	for x in [-21,21]:
		for z in [-8,10,24]:tree(root,Vector3(x,0,z))
	for s in [-1,1]:
		block(root,Vector3(.6,1.1,56),"#70a494",Vector3(s*25,.55,2))
		for i in range(3):block(root,Vector3(4,6+i,7),["#d2d7c1","#9dbdb8","#e0c7ad"][i],Vector3(s*(30+i*6),3+i*.5,-12+i*12),false)
	block(root,Vector3(50,1.1,.6),"#70a494",Vector3(0,.55,29))
	minibus(root,Vector3(10,0,4))
	finish_set(root)
	return {"door":door,"ceiling_y":4.78}

static func crib(root: Node3D,p: Vector3,index: int):
	var n=Node3D.new();n.position=p;root.add_child(n)
	ToonKit.box(n,Vector3(1.7,.22,1.05),"#d8ae7b",Vector3(0,.51,0),.12)
	ToonKit.box(n,Vector3(1.52,.14,.88),"#f8efd9",Vector3(0,.66,0),.07)
	for z in [-.49,.49]:ToonKit.box(n,Vector3(1.66,.27,.10),"#edd9b5",Vector3(0,.78,z),.04)
	for x in [-.79,.79]:ToonKit.box(n,Vector3(.10,.27,1.02),"#edd9b5",Vector3(x,.78,0),.04)
	for x in [-.62,.62]:
		for z in [-.35,.35]:ToonKit.cyl(n,.05,.44,"#a5aca3",Vector3(x,.25,z));ToonKit.orb(n,Vector3(.10,.10,.10),"#435865",Vector3(x,.08,z))
	ToonKit.solid(n,Vector3(1.7,.7,1.05),Vector3(0,.45,0))
	var baby=StoryCast.new();n.add_child(baby);baby.build("baby",index);baby.position=Vector3(0,.64,-.04)
	return baby

static func suitcase(root: Node3D,p: Vector3,color: String="#c36d49") -> Node3D:
	var n=Node3D.new();n.position=p;root.add_child(n);ToonKit.box(n,Vector3(.85,.87,.45),color,Vector3(0,.48,0),.12);ToonKit.box(n,Vector3(.35,.12,.13),"#293d4a",Vector3(0,.98,0),.03)
	for x in [-.27,.27]:ToonKit.orb(n,Vector3(.07,.07,.07),"#293d4a",Vector3(x,.07,0))
	return n

static func bench(root: Node3D,p: Vector3,angle: float):
	var n=Node3D.new();root.add_child(n);n.position=p;n.rotation.y=angle
	block(n,Vector3(3.1,.22,.8),"#79a6a0",Vector3(0,.52,0));ToonKit.box(n,Vector3(3.1,.65,.15),"#79a6a0",Vector3(0,1,-.34))
	for s in [-1,1]:ToonKit.box(n,Vector3(.14,.5,.6),"#536779",Vector3(s*1.2,.25,0))

static func tree(root: Node3D,p: Vector3):
	ToonKit.cyl(root,.24,3.3,"#92745a",p+Vector3.UP*1.65);ToonKit.orb(root,Vector3(2.1,2.2,1.9),"#75a878",p+Vector3.UP*4.1);ToonKit.orb(root,Vector3(1.7,1.4,1.6),"#95bd85",p+Vector3(.5,5.1,.2))

static func minibus(root: Node3D,p: Vector3):
	var n=Node3D.new();root.add_child(n);n.position=p;n.name="FamilyMinibus"
	block(n,Vector3(2.7,1.8,6.7),"#5a99ad",Vector3(0,1.4,0));ToonKit.box(n,Vector3(2.5,.9,1.0),"#345563",Vector3(0,2,2.9))
	for s in [-1,1]:
		ToonKit.box(n,Vector3(.08,.8,4.4),"#3e6372",Vector3(s*1.38,2,-.2))
		for z in [-2.2,2.2]:var w=ToonKit.cyl(n,.51,.23,"#293d4a",Vector3(s*1.34,.52,z));w.rotation.z=PI/2;var hub=ToonKit.cyl(n,.29,.25,"#d3d6c7",Vector3(s*1.35,.52,z));hub.rotation.z=PI/2
	ToonKit.box(n,Vector3(2.7,.22,6.2),"#f1d6a0",Vector3(0,2.46,0))
	ToonKit.text(n,"全家出发",Vector3(0,1.44,3.39),.004,"#fff1d3")

static func home(root: Node3D) -> Dictionary:
	block(root,Vector3(30,.5,26),"#d4b58a",Vector3(0,-.25,0))
	block(root,Vector3(30,5,.4),"#ead7b4",Vector3(0,2.5,-13))
	for s in [-1,1]:block(root,Vector3(.4,5,26),"#e7c7a2",Vector3(s*15,2.5,0))
	ToonKit.box(root,Vector3(10,3,.18),"#7fb4c7",Vector3(-7,3.05,-12.7))
	ToonKit.box(root,Vector3(.23,3,.21),"#fcf0d6",Vector3(-7,3.05,-12.5))
	ToonKit.box(root,Vector3(10.5,.22,.65),"#fcf0d6",Vector3(-7,1.55,-12.4))
	for x in [-12.5,-1.5]:ToonKit.box(root,Vector3(1,4.3,.27),"#d78c70",Vector3(x,2.8,-12.1),.12)
	ToonKit.box(root,Vector3(4.6,.5,1.6),"#85ab98",Vector3(-9,.50,-6));ToonKit.box(root,Vector3(4.6,1.25,.42),"#85ab98",Vector3(-9,1.18,-6.65))
	for x in [-11.1,-6.9]:ToonKit.box(root,Vector3(.4,.9,1.8),"#85ab98",Vector3(x,.9,-6))
	block(root,Vector3(3.8,.5,2.2),"#bf8d65",Vector3(-7,.45,-1.8));ToonKit.orb(root,Vector3(.24,.20,.24),"#f3dcac",Vector3(-7,.88,-1.8))
	# Eight beds remain visible across the back wall; the children play in front.
	for i in range(8):
		var p=Vector3(3.2+(i%4)*2.8,0,-10.7+(i/4)*4.3)
		block(root,Vector3(2.15,.35,3.2),"#bf936c",p+Vector3.UP*.34);ToonKit.box(root,Vector3(2,.19,2.9),"#f7e9cd",p+Vector3.UP*.61);ToonKit.box(root,Vector3(1.8,.15,1.9),["#a8bfaa","#97b6c3","#dbaf8b","#b5a3bf"][i%4],p+Vector3(0,.77,.48));ToonKit.box(root,Vector3(1.7,.24,.65),"#fff2d8",p+Vector3(0,.80,-.95))
	ToonKit.box(root,Vector3(8,.035,5),"#c9b6a0",Vector3(4,.03,4))
	block(root,Vector3(3,.75,1),"#a77e5f",Vector3(-11,.48,6))
	ToonKit.box(root,Vector3(.5,.07,.9),"#334456",Vector3(-11,.91,6))
	# Family furniture and a birthday board, rather than a location label on a wall.
	block(root,Vector3(.8,2.8,3),"#ae8763",Vector3(-14.2,1.4,-.8))
	ToonKit.box(root,Vector3(.10,1.5,1.35),"#f2dfb9",Vector3(-14.65,2.6,-4.1))
	var calendar=ToonKit.text(root,"八兄弟\n生日倒计时",Vector3(-14.55,2.6,-4.1),.0028,"#94684d");calendar.rotation.y=PI/2
	# The keepsake lives on the back wall, outside every playable camera path.
	# A floating front-wall label previously crossed the follow camera at the phone.
	ToonKit.box(root,Vector3(3.3,1.8,.12),"#926649",Vector3(7.9,3.4,-12.65))
	ToonKit.box(root,Vector3(3.05,1.55,.14),"#f1e1bf",Vector3(7.9,3.4,-12.63))
	for i in range(8):ToonKit.orb(root,Vector3(.21,.20,.05),"#62b7d4",Vector3(6.85+(i%4)*.7,3.1+(i/4)*.6,-12.52))
	ToonKit.text(root,"八子俱全",Vector3(7.9,4.55,-12.5),.0038,"#805f4b")
	# Enclosed shell and a proper entrance; the porch is supported outside the door.
	for s in [-1,1]:block(root,Vector3(14.1,4.8,.4),"#e7c7a2",Vector3(s*7.95,2.4,12.8))
	block(root,Vector3(1.8,1.8,.4),"#e7c7a2",Vector3(0,3.9,12.8))
	block(root,Vector3(30.4,.32,26.5),"#f2e1c5",Vector3(0,4.96,0))
	ToonKit.box(root,Vector3(30.8,.25,27),"#9e6b54",Vector3(0,5.25,0))
	block(root,Vector3(8,.5,5),"#bca88c",Vector3(0,-.25,15.5))
	var door=StoryDoor.new();root.add_child(door);door.position=Vector3(0,.02,12.8);door.build(root.get_parent(),1.8,false)
	# The sleeping area has a partition and a real sliding doorway, not eight beds
	# placed against an open backdrop. The left aisle remains physically walkable.
	block(root,Vector3(12.2,4.8,.24),"#d8be98",Vector3(8.9,2.4,-4.35))
	block(root,Vector3(.24,4.8,8.65),"#d8be98",Vector3(.5,2.4,-8.675))
	block(root,Vector3(2.2,1.3,.24),"#d8be98",Vector3(1.7,4.15,-4.35))
	var bedroom_door=StoryDoor.new();root.add_child(bedroom_door);bedroom_door.position=Vector3(1.7,0,-4.35);bedroom_door.build(root.get_parent(),2.2,true)
	ToonKit.text(root,"八兄弟的小房间",Vector3(7.9,2.8,-4.18),.004,"#7e624c")
	block(root,Vector3(2.7,1.1,1.0),"#a17b59",Vector3(11.8,.58,11.9))
	ToonKit.box(root,Vector3(2.8,.14,1.1),"#e9d8b6",Vector3(11.8,1.2,11.9))
	ToonKit.box(root,Vector3(2.1,1.4,.10),"#87a5ac",Vector3(11.8,2.3,12.5))
	block(root,Vector3(1.2,2.1,.55),"#ae8966",Vector3(-13.9,1.06,7.8))
	for x in [-.3,.3]:ToonKit.box(root,Vector3(.07,.2,.08),"#e4c18b",Vector3(-13.9+x,1.3,8.12))
	plant(root,Vector3(-13,.04,-10.4));plant(root,Vector3(12.7,.03,7.2))
	for p in [Vector3(-7,4.62,-6),Vector3(-6,4.62,5),Vector3(6,4.62,5),Vector3(8,4.62,-9)]:ceiling_light(root,p,"#ffdfb2",.85)
	for i in range(3):suitcase(root,Vector3(8+i*1.1,0,9),["#bc7356","#7da6ab","#c7a55f"][i])
	# The children's play has actual props: a hand-drawn river, building blocks,
	# a little speaker and a snack box, rather than eight idle quest markers.
	ToonKit.box(root,Vector3(2.7,.04,1.7),"#f3e6c6",Vector3(-4,.05,4.6),.015)
	ToonKit.box(root,Vector3(2.2,.015,.30),"#6c9fb5",Vector3(-4,.08,4.6),.01)
	for item in [[-.7,.6,"#cc9a64"],[.1,1.0,"#8eaaa8"],[.75,.45,"#afbd98"]]:ToonKit.box(root,Vector3(.45,item[1],.45),item[2],Vector3(-4+item[0],.1+item[1]/2,4.25),.025)
	ToonKit.box(root,Vector3(.65,.9,.4),"#596a83",Vector3(1,.5,5.1))
	ToonKit.disk(root,.20,"#28394e",Vector3(1,.51,5.32))
	ToonKit.cyl(root,.34,.26,"#d4a46b",Vector3(2.1,.15,4.9));ToonKit.box(root,Vector3(.55,.40,.5),"#b76356",Vector3(3,.22,4.8))
	finish_set(root)
	return {"door":door,"bedroom_door":bedroom_door,"ceiling_y":4.8}

static func ceiling_light(root: Node3D,p: Vector3,color: String,energy: float):
	ToonKit.box(root,Vector3(2.4,.13,1.0),"#e7d9b9",p)
	ToonKit.box(root,Vector3(2.1,.09,.75),"#fff5d6",p-Vector3.UP*.10)
	var lamp=OmniLight3D.new();lamp.position=p-Vector3.UP*.35;lamp.light_color=Color(color);lamp.light_energy=energy;lamp.omni_range=14;lamp.omni_attenuation=.8;root.add_child(lamp)

static func plant(root: Node3D,p: Vector3):
	ToonKit.cyl(root,.30,.52,"#b98161",p+Vector3.UP*.26,.37)
	for i in range(4):
		var leaf=ToonKit.orb(root,Vector3(.18,.50,.20),"#5d9674",p+Vector3(cos(i*1.9)*.21,.78,sin(i*1.9)*.21));leaf.rotation.z=(i-1.5)*.24

static func finish_set(root: Node3D):
	# Batch static pieces before cel conversion; actor/vehicle joints stay separate.
	for n in root.find_children("*","Node3D",true,false):
		if not n is MeshInstance3D:ToonKit.merge_direct(n)
	ToonKit.merge_direct(root);ToonKit.finish(root)

static func local_lighting(root: Node3D):
	for mesh in root.find_children("*","MeshInstance3D",true,false):
		var src=mesh.material_override
		if not src is ShaderMaterial:continue
		var path=src.shader.resource_path
		if not path in ["res://shaders/urban-cel.gdshader","res://shaders/urban-cel-double.gdshader"]:continue
		var material=src.duplicate()
		var values={}
		for key in ["tint","vertex_paint","rim_strength"]:values[key]=src.get_shader_parameter(key)
		material.shader=load("res://shaders/interior-cel-double.gdshader" if "double" in path else "res://shaders/interior-cel.gdshader")
		for key in values:material.set_shader_parameter(key,values[key])
		mesh.material_override=material
