class_name ChapterOneSet
extends RefCounted

const HALL=Vector3(-136,0,-242)
const VAN_PARK=Vector3(-122,.12,-201)
const STAFF_BUS=Vector3(-116,0,-194)
const STAFF_SAFE=Vector3(-116,.03,-198.7)
const GATE=Vector3(-112,0,-217)
const SWITCH=Vector3(-115.5,0,-222)
const BAKERY=Vector3(100,0,-80)

static func build(w: Node3D) -> Dictionary:
	var root=Node3D.new();root.name="RiversideBirthday";w.add_child(root)
	var room=Node3D.new();room.position=HALL;root.add_child(room)
	# Fully enclosed, lit room; both exits lead to the same actual outdoor courtyard.
	PrologueSet.block(room,Vector3(28,.16,20),"#e8d7bb",Vector3(0,.08,0))
	PrologueSet.block(room,Vector3(28,4.8,.4),"#e6ceb0",Vector3(0,2.55,-10))
	for side in [-1,1]:
		PrologueSet.block(room,Vector3(.4,4.8,20),"#f1dabc",Vector3(side*14,2.55,0))
		PrologueSet.block(room,Vector3(11.8,4.8,.4),"#eedcc1",Vector3(side*8.1,2.55,10))
		ToonKit.box(room,Vector3(10.4,2.2,.09),"#76b0bf",Vector3(side*8.1,2.45,10.23),.04)
		ToonKit.box(room,Vector3(10.6,.18,.4),"#f9ebd1",Vector3(side*8.1,1.35,10.34),.03)
	PrologueSet.block(room,Vector3(4.4,1.7,.4),"#eedcc1",Vector3(0,4.08,10))
	PrologueSet.block(room,Vector3(28.5,.30,20.5),"#eadfc8",Vector3(0,5.08,0))
	ToonKit.box(room,Vector3(29,.28,21),"#638a89",Vector3(0,5.35,0),.07)
	ToonKit.box(room,Vector3(16,1.1,.24),"#547f7c",Vector3(0,4.0,10.34),.05)
	ToonKit.text(room,"江畔会客厅",Vector3(0,4.0,10.50),.012)
	var door=StoryDoor.new();room.add_child(door);door.position=Vector3(0,.16,10);door.build(w,4.0,true)
	CityBridge._slab(root,HALL+Vector3(0,0,12.5),HALL+Vector3(0,.16,9.8),4.2,.16,"#e6d2ad")
	for x in [-8,8]:
		for z in [-5,5]:PrologueSet.ceiling_light(room,Vector3(x,4.76,z),"#ffe6bf",1.2)
	# The children's small stage is dressed for their play, with broad paper scenery.
	ToonKit.box(room,Vector3(15,.08,4.1),"#b49b99",Vector3(0,.21,-6.6),.03)
	ToonKit.box(room,Vector3(15,2.1,.12),"#eac371",Vector3(0,2.75,-9.72),.05)
	ToonKit.text(room,"八个 · 一个都不少",Vector3(0,2.86,-9.63),.014,"#4d6b75")
	for i in range(8):
		var color=StoryCast.BADGES[i];ToonKit.orb(room,Vector3(.38,.48,.27),color,Vector3(-6+i*1.7,4.20,-9.45))
		# Eight numbered places make the family table legible without tiny ornaments.
		var x=-5.25+(i%4)*3.5;var z=-1.8+(i/4)*4.7
		_chair(room,Vector3(x,.16,z),0 if i<4 else PI)
		ToonKit.cyl(room,.25,.035,"#f8eddb",Vector3(x,1.18,z+(1 if i<4 else -1.0)),-1,16)
		ToonKit.box(room,Vector3(.33,.42,.04),color,Vector3(x,1.45,z+(1 if i<4 else -1.0)),.03)
		ToonKit.text(room,str(i+1),Vector3(x,1.46,z+(1.03 if i<4 else -1.03)),.0035).rotation.y=0 if i<4 else PI
	PrologueSet.block(room,Vector3(13,1.0,2.8),"#bf8d67",Vector3(0,.66,.55))
	ToonKit.box(room,Vector3(13.2,.07,3),"#f6e5cf",Vector3(0,1.20,.55),.04)
	var cake=Node3D.new();cake.position=Vector3(0,1.25,.55);room.add_child(cake);_cake(cake)
	# Broad serving dishes make the birthday meal an actual set, not an empty meeting table.
	for x in [-3.3,3.3]:
		ToonKit.cyl(room,.55,.13,"#f8edda",Vector3(x,1.32,.55),-1,24)
		for j in range(5):ToonKit.orb(room,Vector3(.16,.10,.18),"#bc7854",Vector3(x-.3+j*.15,1.46,.55+sin(j)*.15))
	for x in [-5,5]:ToonKit.cyl(room,.15,.3,"#ccad80",Vector3(x,1.39,.5),-1,16)
	# A service counter, storage, wash-up and coats complete the borrowed venue.
	PrologueSet.block(room,Vector3(1.4,1.0,10),"#81a69d",Vector3(12.4,.66,1.0))
	ToonKit.box(room,Vector3(1.6,.12,10.2),"#f5e6ce",Vector3(12.4,1.22,1.0))
	PrologueSet.block(room,Vector3(4,2.2,1.2),"#8eada1",Vector3(10,1.27,-8.8))
	for x in [-11.8,11.8]:PrologueSet.plant(room,Vector3(x,.16,7.7))
	PrologueSet.bench(room,Vector3(-11,.16,1),PI/2)
	ToonKit.box(room,Vector3(1.1,.07,1.3),"#38637b",Vector3(9.8,1.34,4.4));ToonKit.text(room,"象象的生日宴",Vector3(11.65,2.2,4.4),.005,"#4d6b75").rotation.y=-PI/2
	# Courtyard: a broad clear fighting area, side service entrance and south escape.
	for item in [[Vector3(.5,1.4,24),Vector3(-153,.7,-220)],[Vector3(.5,1.4,11),Vector3(-112,.7,-227)],[Vector3(.5,1.4,5),Vector3(-112,.7,-210)],[Vector3(25,1.4,.5),Vector3(-140.5,.7,-208)],[Vector3(9,1.4,.5),Vector3(-116.5,.7,-208)]]:
		PrologueSet.block(root,item[0],"#b6c3aa",item[1])
	var gate=ChapterGate.new();root.add_child(gate);gate.position=GATE;gate.rotation.y=PI/2;gate.build(w)
	ToonKit.box(root,Vector3(.50,1.25,.45),"#3c6574",SWITCH+Vector3.UP*.625,.07)
	ToonKit.box(root,Vector3(.34,.32,.08),"#e9b557",SWITCH+Vector3(0,1.05,.25),.06)
	ToonKit.text(root,"后勤门开关",SWITCH+Vector3(0,1.7,.25),.0035)
	for p in [Vector3(-148,0,-226),Vector3(-148,0,-214)]:PrologueSet.plant(root,p)
	for z in [-225,-214]:
		var g=Node3D.new();g.position=Vector3(-143,0,z);root.add_child(g)
		PrologueSet.block(g,Vector3(2.2,1.0,1.1),"#9b8670",Vector3.UP*.5);ToonKit.box(g,Vector3(2.3,.12,1.2),"#ddcaa7",Vector3.UP*1.06)
		w.city.crates.append({"node":g,"p":g.position,"hp":38.0})
	PrologueSet.minibus(root,STAFF_BUS,"会场接应")
	ToonKit.text(root,"工作人员接应",STAFF_BUS+Vector3(0,2.8,-3.4),.005,"#fff0d2").rotation.y=PI
	# Full width entry signs face the real roads, rather than relying on HUD fiction.
	var sign=ToonKit.text(root,"江畔会客厅  ←",Vector3(-104,2.6,-206),.007,"#fff0d2");sign.rotation.y=PI/2
	w.city.pois.append({"name":"江畔会客厅","p":Vector2(HALL.x,HALL.z),"color":"#edb56d"})
	w.city.ground_material.set_shader_parameter("story_pad",Vector4(VAN_PARK.x,VAN_PARK.z,3.2,7.3))
	ToonKit.text(root,"生日会场 · 停车处",VAN_PARK+Vector3(0,.06,4.1),.004,"#496b75").rotation.x=-PI/2
	_bakery(root);w.city.pois.append({"name":"生日蛋糕取货","p":Vector2(BAKERY.x,BAKERY.z),"color":"#e7a8a0"})
	ToonKit.finish(root)
	# Keep existing city daylight while lighting this interior consistently.
	PrologueSet.local_lighting(room)
	for mesh in room.find_children("*","MeshInstance3D",true,false):mesh.layers=2
	for lamp in room.find_children("*","OmniLight3D",true,false):lamp.light_cull_mask=2
	return {"root":root,"room":room,"door":door,"gate":gate,"cake":cake}

static func _chair(root: Node3D,p: Vector3,angle: float):
	var g=Node3D.new();g.position=p;g.rotation.y=angle;root.add_child(g)
	ToonKit.box(g,Vector3(.9,.15,.9),"#70918b",Vector3.UP*.55,.05)
	ToonKit.box(g,Vector3(.9,.75,.12),"#70918b",Vector3(0,.96,-.40),.05)
	for x in [-.32,.32]:
		for z in [-.32,.32]:ToonKit.box(g,Vector3(.10,.5,.10),"#526a6c",Vector3(x,.27,z),.02)
	ToonKit.solid(g,Vector3(.95,.8,.95),Vector3.UP*.4)

static func _cake(root: Node3D):
	ToonKit.cyl(root,1.05,.16,"#e4b884",Vector3.UP*.08,-1,32)
	ToonKit.cyl(root,.94,.46,"#f7edce",Vector3.UP*.36,-1,32)
	ToonKit.cyl(root,.95,.09,"#d7959a",Vector3.UP*.61,-1,32)
	for i in range(8):
		var a=i*TAU/8;var p=Vector3(sin(a)*.66,.73,cos(a)*.66)
		ToonKit.orb(root,Vector3(.12,.16,.12),StoryCast.BADGES[i],p)
		ToonKit.cyl(root,.035,.27,"#f3d077",p+Vector3.UP*.18,-1,8)

static func _bakery(root: Node3D):
	var g=Node3D.new();g.position=BAKERY+Vector3(0,0,-3);root.add_child(g)
	PrologueSet.block(g,Vector3(5,1.12,1.5),"#d18e78",Vector3.UP*.56)
	ToonKit.box(g,Vector3(5.2,.12,1.7),"#fae7c8",Vector3.UP*1.2,.04)
	for x in [-2.4,2.4]:PrologueSet.block(g,Vector3(.16,3.1,.16),"#5a7f84",Vector3(x,1.55,-.2))
	ToonKit.box(g,Vector3(5.6,.20,3.3),"#dfa295",Vector3(0,3.2,-.5),.08)
	ToonKit.text(g,"八份快乐 · 蛋糕取货",Vector3(0,2.65,.20),.005,"#5b6269")
	for x in [-1.5,0,1.5]:
		ToonKit.box(g,Vector3(.9,.4,.8),"#fae5cd",Vector3(x,1.45,0),.06)
		ToonKit.box(g,Vector3(.94,.05,.84),"#f0b6ac",Vector3(x,1.68,0),.02)
