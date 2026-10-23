class_name FamilyVan
extends StreetCar

var passengers=[]
var driver_model: Node3D
var cargo: Node3D
var occupied=false
var engine_sound: AudioStreamPlayer3D

func _ready():
	collision_layer=4;collision_mask=5;floor_snap_length=.4;max_hp=240;hp=240
	for item in [[Vector3(2.52,1.0,6.25),Vector3(0,.5,0)],[Vector3(2.36,1.3,5.5),Vector3(0,1.8,-.1)]]:
		var c=CollisionShape3D.new();var box=BoxShape3D.new();box.size=item[0];c.shape=box;c.position=item[1];add_child(c)
	pedestrian_sweep=ShapeCast3D.new();var sweep_shape=BoxShape3D.new();sweep_shape.size=Vector3(2.65,2.5,6.4);pedestrian_sweep.shape=sweep_shape;pedestrian_sweep.collision_mask=8;pedestrian_sweep.collide_with_areas=true;pedestrian_sweep.collide_with_bodies=false;pedestrian_sweep.max_results=16;pedestrian_sweep.enabled=false;add_child(pedestrian_sweep)
	ToonKit.box(self,Vector3(2.5,.8,6.3),paint,Vector3(0,.86,0),.22)
	ToonKit.box(self,Vector3(2.55,.15,5.9),"#f9e7be",Vector3(0,2.5,-.15),.12)
	ToonKit.box(self,Vector3(2.42,.12,5.65),"#4f7b83",Vector3(0,1.28,-.15),.05)
	for s in [-1,1]:
		for z in [-2.75,-1.4,-.15,1.12,2.48]:ToonKit.box(self,Vector3(.12,1.2,.13),paint,Vector3(s*1.21,1.9,z),.025)
		for z in [-2.1,2.05]:
			var pivot=Node3D.new();pivot.position=Vector3(s*1.23,.48,z);add_child(pivot);wheels.append(pivot);var roll=Node3D.new();pivot.add_child(roll);rolls.append(roll)
			var tire=ToonKit.cyl(roll,.48,.24,"#293746");tire.rotation.z=PI/2;var hub=ToonKit.cyl(roll,.29,.26,"#e4dcbf");hub.rotation.z=PI/2
			ToonKit.merge_direct(roll)
		ToonKit.box(self,Vector3(.38,.20,.11),"#fff2bd",Vector3(s*.85,1.0,3.17),.04)
		ToonKit.box(self,Vector3(.22,.55,.10),"#d75b51",Vector3(s*1.03,1.15,-3.18),.04)
		ToonKit.box(self,Vector3(.22,.16,.30),paint,Vector3(s*1.37,1.94,2.3),.04)
		# Large windows, with enough transparency to read the seated family.
		var glass=ToonKit.mat("#426c7c").duplicate();glass.transparency=BaseMaterial3D.TRANSPARENCY_ALPHA;glass.albedo_color.a=.24
		ToonKit.mesh(self,ToonKit.rounded(Vector3(.035,.96,5.08),.01),glass,Vector3(s*1.235,1.91,-.1))
	var rear_glass=ToonKit.mat("#456f80").duplicate();rear_glass.transparency=BaseMaterial3D.TRANSPARENCY_ALPHA;rear_glass.albedo_color.a=.38
	ToonKit.mesh(self,ToonKit.rounded(Vector3(2.15,.98,.04),.01),rear_glass,Vector3(0,1.92,-2.84))
	for s in [-1,1]:ToonKit.box(self,Vector3(.14,1.17,.17),paint,Vector3(s*1.15,1.90,-2.85),.035)
	_pane([Vector3(-1.12,1.40,3.0),Vector3(1.12,1.40,3.0),Vector3(1.12,2.40,2.55),Vector3(-1.12,2.40,2.55)])
	ToonKit.box(self,Vector3(2.2,.22,.15),"#334855",Vector3(0,.50,3.17),.04)
	ToonKit.text(self,"八个 · 一个都不少",Vector3(0,1.12,-3.2),.0032).rotation.y=PI
	door=Node3D.new();door.position=Vector3(-1.26,0,2.5);add_child(door);ToonKit.box(door,Vector3(.06,.7,1.15),paint,Vector3(0,1.0,-.57),.03)
	for i in range(10):
		var seat=Vector3(-.59 if i%2==0 else .59,.76,.7-(i/2)*1.10 if i<8 else 1.9)
		ToonKit.box(self,Vector3(.72,.18,.67),"#e2c99b",seat,.08);ToonKit.box(self,Vector3(.72,.65,.14),"#deb77e",seat+Vector3(0,.32,-.30),.06)
		if i<8:
			var son=StoryCast.new();add_child(son);son.build("son",i+1);son.position=seat+Vector3(0,.05,-.05);son.rig.scale=Vector3.ONE*.27;_sit(son);passengers.append(son)
		elif i==8:
			var queen=StoryCast.new();add_child(queen);queen.build("queen");queen.position=Vector3(-.59,.72,1.9);queen.rig.scale=Vector3.ONE*.41;_sit(queen);passengers.append(queen)
	# Driver display uses the same original geometry, with a seated pose only.
	driver_model=Node3D.new();driver_model.position=Vector3(.59,.75,1.9);driver_model.scale=Vector3.ONE*.41;add_child(driver_model)
	var importer=StreetActor.new();importer._original(JSON.parse_string(FileAccess.get_file_as_string("res://assets/original_dolphin.json")).model,driver_model,"0");importer.free()
	for n in ["leg0","leg1"]:driver_model.find_child(n,true,false).rotation.x=-1.1
	for n in ["knee0","knee1"]:driver_model.find_child(n,true,false).rotation.x=1.2
	for n in ["arm0","arm1"]:driver_model.find_child(n,true,false).rotation.x=-.85
	ToonKit.finish(self);set_occupied(false);_engine_audio()

func _sit(actor: StoryCast):
	actor.animated=false
	for n in actor.find_children("*","StaticBody3D",true,false):n.collision_layer=0
	for leg in actor.walk_legs:leg.rotation.x=-1.1
	for n in ["knee0","knee1"]:actor.rig.find_child(n,true,false).rotation.x=1.2

func set_occupied(value: bool):
	occupied=value
	for actor in passengers:actor.visible=value

func _engine_audio():
	var data=PackedByteArray()
	for i in range(22050):
		var t=i/22050.0;var v=sin(TAU*48*t)*.35+sin(TAU*96*t)*.12+sin(TAU*144*t)*.05
		var sample=int(v*12500);data.append(sample&255);data.append((sample>>8)&255)
	var wav=AudioStreamWAV.new();wav.format=AudioStreamWAV.FORMAT_16_BITS;wav.mix_rate=22050;wav.data=data;wav.loop_mode=AudioStreamWAV.LOOP_FORWARD;wav.loop_end=22050
	engine_sound=AudioStreamPlayer3D.new();engine_sound.stream=wav;engine_sound.max_distance=28;engine_sound.unit_size=6;engine_sound.volume_db=-29;add_child(engine_sound);engine_sound.play()

func _physics_process(dt):
	if engine_sound:
		engine_sound.stream_paused=world.paused
		engine_sound.pitch_scale=.78+absf(speed)*.035;engine_sound.volume_db=-27 if driver else -42
	super._physics_process(dt)
	if driver_model:driver_model.visible=driver!=null

func load_cake():
	if cargo:return
	cargo=Node3D.new();add_child(cargo);cargo.position=Vector3(0,1.31,-2.7)
	ToonKit.box(cargo,Vector3(1.1,.67,.9),"#f5dfc3",Vector3.UP*.33,.07)
	ToonKit.box(cargo,Vector3(1.14,.05,.94),"#efaa9a",Vector3.UP*.69,.02)
	ToonKit.text(cargo,"小心蛋糕",Vector3(0,.33,.46),.0028,"#ae6659")
	ToonKit.finish(cargo)

func _exit_tree():
	if is_instance_valid(engine_sound):engine_sound.stop();engine_sound.stream=null
