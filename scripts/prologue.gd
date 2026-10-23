extends "res://scripts/main.gd"

# Story checkpoints are separate from the existing free-roam save (and tests).
# Phase: hospital / departure courtyard / group photo / home / invitation / done.
var phase=0
var babies_seen=false
var parked=false
var loaded=false
var carrying=false
var groups=[]
var scene_root: Node3D
var cast={}
var sons=[]
var babies=[]
var bag: Node3D
var held_bag: Node3D
var dialogue=[]
var line_index=0
var after_dialogue=""
var menu_selection=0
var photo_camera=false
var tutorial_started=false
var hot=[]
var prologue_test=false
var room={}
var voice: StoryVoice
var director: PrologueDirector
var pause_menu=false
var auto_dialogue=true
var line_time=0.0
var opening_seen=true
var legacy_replay=false

func _ready():
	Engine.max_fps=60;_bind_keys();_audio()
	var args=OS.get_cmdline_user_args();prologue_test="--test-prologue" in args or "--capture-prologue" in args
	capture_mode=prologue_test
	PrologueSet.environment(self)
	player=StreetActor.new();player.hero=true;player.world=self;add_child(player)
	camera=Camera3D.new();camera.fov=61;camera.near=.12;camera.far=250;camera.current=true;add_child(camera)
	var layer=CanvasLayer.new();add_child(layer);hud=load("res://scripts/prologue_hud.gd").new();hud.world=self;layer.add_child(hud)
	voice=StoryVoice.new();add_child(voice)
	director=PrologueDirector.new();director.world=self;add_child(director);director.completed.connect(_sequence_done)
	_shutter_sound()
	_build_phase();_follow(1)
	print("PROLOGUE_READY")
	if prologue_test:
		await _ticks(5)
		await load("res://scripts/prologue_checks.gd").run(self)

func _build_phase():
	if player.vehicle:player.vehicle.driver=null;player.vehicle=null
	player.visible=true;player.collision_layer=2;player.collision_mask=7;player.velocity=Vector3.ZERO;player.hp=100;player.stun=0;player.attack=-1
	if scene_root:scene_root.free()
	if held_bag:held_bag.free();held_bag=null
	carrying=false;people.clear();cars.clear();cast.clear();sons.clear();babies.clear();photo_camera=false
	scene_root=Node3D.new();add_child(scene_root)
	if phase<3:
		room=PrologueSet.hospital(scene_root)
		for n in scene_root.find_children("*","Node3D",true,false):
			if n is StoryCast and n.kind=="baby":babies.append(n)
		_friend("queen",Vector3(0,.12,-17));_friend("tingge",Vector3(9,.12,-13));_friend("pange",Vector3(9,.12,-8));_friend("xuanshen",Vector3(-9,.12,-7))
		var car=StreetCar.new();car.world=self;car.paint="#e8bf45";car.position=Vector3(0,.06,17 if parked else 5);scene_root.add_child(car);cars.append(car)
		bag=PrologueSet.suitcase(scene_root,Vector3(-7,.12,-2));bag.visible=not loaded
		if loaded:PrologueSet.suitcase(scene_root,Vector3(10,2.6,3))
		player.position=Vector3(0,.14,-5 if phase==0 else 9);yaw=PI;pitch=.34
		if phase==2:_arrange_photo()
	else:
		room=PrologueSet.home(scene_root);_friend("queen",Vector3(-8,.05,-3))
		var positions=[Vector3(-5,0,2),Vector3(-3,0,2),Vector3(-4,0,4),Vector3(0,0,2),Vector3(2,0,2),Vector3(1,0,4),Vector3(6,0,3),Vector3(8,0,3)]
		for i in range(8):
			var son=StoryCast.new();scene_root.add_child(son);son.build("son",i+1);son.position=positions[i];sons.append(son)
		player.position=Vector3(0,.05,8);yaw=PI;pitch=.32
	ToonKit.finish(scene_root)
	PrologueSet.local_lighting(self)
	_refresh_hotspots()
	if room.has("door") and phase==2:room.door.requested_open=true

func _place_grown_sons():
	var positions=[Vector3(-5,0,2),Vector3(-3,0,2),Vector3(-4,0,4),Vector3(0,0,2),Vector3(2,0,2),Vector3(1,0,4),Vector3(6,0,3),Vector3(8,0,3)]
	for i in range(sons.size()):sons[i].rig.scale=Vector3.ONE*.37;sons[i].rig.rotation=Vector3.ZERO;sons[i].position=positions[i];sons[i].rotation.y=0;sons[i].gesture="idle"

func _shutter_sound():
	var wav=AudioStreamWAV.new();wav.format=AudioStreamWAV.FORMAT_16_BITS;wav.mix_rate=22050;var data=PackedByteArray()
	for i in range(4000):
		var t=float(i)/22050;var sample=int(sin(i*2.1)*exp(-t*36)*14000);data.append(sample&255);data.append((sample>>8)&255)
	wav.data=data;sounds["shutter"]=wav

func _sequence_done(kind: String):
	match kind:
		"legacy":
			if legacy_replay:
				legacy_replay=false;hud.menu=true;paused=true;_follow(1)
			else:
				opening_seen=true;save_story();director.start("wake")
		"wake":say_group("opening")
		"exit":
			if room.has("door"):room.door.requested_open=false
			_follow(1)
		"gather":_refresh_hotspots();_follow(1)
		"photo":photo_camera=true;say_group("photo","home")
		"years":save_story();_refresh_hotspots();_follow(1);say_group("growth")
		"leave":save_story();_refresh_hotspots();_follow(1);hud.say("序章完成 · 一个都不少 · 下一站上海")

func _friend(role: String,p: Vector3):
	var actor=StoryCast.new();scene_root.add_child(actor);actor.build(role);actor.position=p;cast[role]=actor
	return actor

func _refresh_hotspots():
	hot=[]
	if phase==0:
		if not babies_seen:_hot("babies","看看八兄弟",Vector3(0,.12,-12.3),4.1)
		_hot("queen","与小朋友说话",cast.queen.position,3.2,cast.queen)
		for key in ["tingge","pange","xuanshen"]:_hot(key,"与"+{"tingge":"听歌","pange":"攀哥","xuanshen":"炫神"}[key]+"说话",cast[key].position,2.6,cast[key])
	elif phase==1:
		if parked and not loaded:
			if carrying:_hot("load","把行李放上全家车",Vector3(8.0,.1,5),3.0)
			else:_hot("bag","抱起行李",bag.position,2.7)
		_hot("xuanshen","请炫神帮忙挪车",cast.xuanshen.position,2.6,cast.xuanshen)
	elif phase==2:_hot("photo","大家到齐，拍合照",Vector3(0,.1,8.5),2.5)
	else:
		_hot("boys0","听老大、老二和老三说悄悄话",Vector3(-4,.1,3),3)
		_hot("boys1","看看老四、老五和老六的排练",Vector3(1,.1,3),3)
		_hot("boys2","陪老七和老八坐一会儿",Vector3(7,.1,3),3)
		_hot("queen","与小朋友说话",cast.queen.position,3,cast.queen)
		if phase==3 and groups.size()==3:_hot("phone","接攀哥的电话",Vector3(-11,.1,6),2.8)
		if phase>=4:_hot("leave","收好合照，一起去上海",Vector3(0,.1,11),2.5)

func _hot(id: String,label: String,p: Vector3,radius: float,owner_node: Node=null):hot.append({"id":id,"label":label,"p":p,"radius":radius,"owner":owner_node})

func nearest_hotspot() -> Dictionary:
	if not player or not dialogue.is_empty() or paused:return {}
	if player.vehicle:return {"id":"car","label":"下车","p":player.position}
	var best={};var distance=INF
	for h in hot:
		var d=Vector2(player.position.x-h.p.x,player.position.z-h.p.z).length()
		if d<h.radius and d<distance:
			var ray=PhysicsRayQueryParameters3D.create(player.position+Vector3.UP,h.p+Vector3.UP,1)
			if h.owner:
				var excluded: Array[RID]=[]
				for n in h.owner.find_children("*","CollisionObject3D",true,false):excluded.append(n.get_rid())
				ray.exclude=excluded
			if get_world_3d().direct_space_state.intersect_ray(ray).is_empty():best=h;distance=d
	if phase==1 and not carrying:
		var car=near_car()
		if car and car.position.distance_to(player.position)<distance:return {"id":"car","label":"上黄色小车","p":car.position}
	return best

func objective() -> String:
	match phase:
		0:return "先看看八兄弟" if not babies_seen else "和小朋友商量出院"
		1:return "把黄色小车挪到院子里的蓝色车位" if not parked else "把行李搬上全家车"
		2:return "去门口拍一张全家合照"
		3:return "听听八兄弟在忙什么  "+str(groups.size())+"/3" if groups.size()<3 else "桌上的电话响了 · 攀哥找你"
		4:return "答应八兄弟，好好看完他们的小戏"
	return "序章完成 · 走到玄关，前往上海第一章"

func navigation_targets() -> Array:
	if hud.menu or not dialogue.is_empty() or director.active():return []
	var goal={}
	if phase==0:
		goal={"id":"babies","label":"八兄弟的婴儿篮","p":Vector3(0,.12,-12.3)} if not babies_seen else {"id":"queen","label":"小朋友","p":cast.queen.position}
		if player.position.z>1:goal={"id":"door","label":"回到病房 · 自动门","p":Vector3(0,.12,.2)}
	elif phase==1:
		if not parked:
			if player.vehicle:goal={"id":"parking","label":"蓝色停车位","p":Vector3(0,0,17)}
			elif player.position.z<.4:goal={"id":"door","label":"医院出口 · 自动门","p":Vector3(0,.12,-.3)}
			else:goal={"id":"car","label":"黄色小车","p":cars[0].position}
		elif not loaded:
			if carrying:goal={"id":"load","label":"把行李放上全家车","p":Vector3(8,0,5)}
			elif player.position.z>1:goal={"id":"door","label":"从自动门取回行李","p":Vector3(0,.12,.2)}
			else:goal={"id":"bag","label":"门边的行李","p":bag.position}
	elif phase==2:goal={"id":"photo","label":"站到合照的位置","p":Vector3(0,0,8.5)}
	elif phase==3:
		if groups.size()==3:goal={"id":"phone","label":"桌上的电话","p":Vector3(-11,.1,6)}
		else:
			var targets=[]
			for i in range(3):
				if not i in groups:targets.append({"id":"boys"+str(i),"label":["老大、老二和老三","老四、老五和老六","老七和老八"][i],"p":[Vector3(-4,0,3),Vector3(1,0,3),Vector3(7,0,3)][i]})
			targets.sort_custom(func(a,b):return player.position.distance_squared_to(a.p)<player.position.distance_squared_to(b.p));return targets
	elif phase==4:goal={"id":"leave","label":"玄关 · 一起去上海","p":Vector3(0,0,11)}
	return [] if goal.is_empty() else [goal]

func subobjective() -> String:
	if phase==0:return "八只婴儿篮就在房间里面，走近按 E。"
	if phase==1:return "先停稳并下车 · R 可请炫神挪车" if not parked else "一次搬好，不用来回数八遍。"
	if phase==2:return "八个孩子和老朋友们都在等你。"
	if phase==3:return "婴儿篮换成小床，他们也有了各自的小心思。"
	return "这一次，爸爸要从第一幕看到最后一幕。"

func movement() -> Vector3:
	return Vector3.ZERO if not dialogue.is_empty() or hud.menu else super.movement()

func _process(dt):
	if not player or not camera or not hud:return
	if director and director.active():director.tick(dt)
	if not dialogue.is_empty() and not pause_menu:
		line_time+=dt
		if dialogue[line_index][0]=="豚师":player.body.rotation.x=sin(line_time*3)*.025
		if auto_dialogue and line_time>=voice.duration+.65:advance_dialogue()
	for actor in cast.values()+sons+babies:actor.animated=not pause_menu and not hud.menu
	if not paused:
		if phase==1 and not parked and not player.vehicle and cars.size()>0:
			var car=cars[0]
			if absf(car.position.x)<1.5 and absf(car.position.z-17)<1.7 and absf(car.speed)<.7:
				parked=true;save_story();_refresh_hotspots();hud.say("位置腾出来了 · 再把门口的行李搬上车")
		if player.hp<=0:
			player.hp=100;player.stun=0;player.impulse=Vector3.ZERO
			rescue_car();hud.say("先休息一下 · 炫神把车重新挪好了")
		if player.position.y< -2:player.position=Vector3(0,.2,8);player.velocity=Vector3.ZERO
		for p in particles.duplicate():
			p.life-=dt;p.node.position+=p.velocity*dt
			if p.life<=0:p.node.queue_free();particles.erase(p)
	if not fixed_camera:_follow(dt)

func _follow(dt: float):
	if not hud:return
	if hud.menu:
		camera.position=Vector3(11,3.1,15) if phase<3 else Vector3(9,2.9,10);camera.look_at(Vector3(0,2.2,0) if phase<3 else Vector3(0,1.1,3));return
	if photo_camera:return
	super._follow(dt)

func _unhandled_input(event):
	if capture_mode:return
	if event is InputEventKey and event.pressed and not event.echo:_key(event.physical_keycode)
	if event is InputEventMouseMotion and Input.mouse_mode==Input.MOUSE_MODE_CAPTURED and not paused:look(event.relative)
	if event is InputEventMouseButton and event.pressed and event.button_index==MOUSE_BUTTON_LEFT:
		if hud.menu or pause_menu:hud.menu_click(get_viewport().get_mouse_position())
		elif director.active():director.skip()
		elif not dialogue.is_empty():advance_dialogue()
		else:Input.mouse_mode=Input.MOUSE_MODE_CAPTURED

func _key(key: int):
	if key==KEY_F11:super._key(key);return
	if key==KEY_V:
		voice.set_enabled(not voice.enabled)
		if director.opening:director.opening.restore_voice()
		if voice.enabled and not dialogue.is_empty():voice.speak(dialogue[line_index]);line_time=0;voice.set_paused(pause_menu)
		return
	if key==KEY_C:auto_dialogue=not auto_dialogue;return
	if key==KEY_ESCAPE and not hud.menu:
		pause_menu=not pause_menu;paused=pause_menu or not dialogue.is_empty() or director.active();voice.set_paused(pause_menu);director.set_paused(pause_menu);menu_selection=0;_clear_input();Input.mouse_mode=Input.MOUSE_MODE_VISIBLE if paused else Input.MOUSE_MODE_CAPTURED;return
	if hud.menu or pause_menu:
		var count=hud.menu_buttons().size()
		if key in [KEY_W,KEY_UP]:menu_selection=posmod(menu_selection-1,count)
		if key in [KEY_S,KEY_DOWN]:menu_selection=posmod(menu_selection+1,count)
		if key==KEY_ENTER:menu_action(hud.menu_buttons()[menu_selection][1])
		if key==KEY_ESCAPE and not hud.menu:menu_action("resume")
		return
	if director.active():
		if key in [KEY_E,KEY_ENTER,KEY_SPACE]:director.skip()
		return
	if not dialogue.is_empty():
		if key in [KEY_E,KEY_ENTER,KEY_SPACE]:advance_dialogue()
		return
	if key==KEY_ESCAPE:paused=true;menu_selection=0;_clear_input();Input.mouse_mode=Input.MOUSE_MODE_VISIBLE;return
	if key==KEY_E:interact()
	if key==KEY_H:hud.help=not hud.help
	if key==KEY_F5:save_story();hud.say("序章检查点已保存")
	if key==KEY_F9:load_story()
	if key==KEY_R and phase==1:rescue_car()
	if key==KEY_SPACE and player.is_on_floor() and not player.vehicle:player.velocity.y=8.2

func _clear_input():
	for action in ["forward","back","left","right","jump","guard"]:Input.action_release(action)

func menu_action(action: String):
	menu_selection=0
	match action:
		"chapter1":
			save_story();director.cancel();voice.stop();_clear_input();Engine.time_scale=1;Input.mouse_mode=Input.MOUSE_MODE_VISIBLE;get_tree().change_scene_to_file("res://scenes/chapter1.tscn");return
		"sandbox":
			save_story();director.cancel();_clear_input();Engine.time_scale=1;Input.mouse_mode=Input.MOUSE_MODE_VISIBLE;get_tree().change_scene_to_file("res://scenes/main.tscn");return
		"quit":director.cancel();get_tree().quit();return
		"title":
			if director.kind=="legacy":director.cancel();legacy_replay=false
			elif director.active():load_story();director.cancel()
			dialogue=[];voice.stop();pause_menu=false;hud.menu=true;paused=true;return
		"resume":pause_menu=false;paused=not dialogue.is_empty() or director.active();voice.set_paused(false);director.set_paused(false)
		"load","continue":load_story();hud.menu=false;paused=director.active();pause_menu=false
		"replay":
			pause_menu=false;legacy_replay=true;hud.menu=false;dialogue=[];director.start("legacy");return
		"new":
			pause_menu=false;director.cancel();voice.stop();dialogue=[];legacy_replay=false;opening_seen=false
			phase=0;babies_seen=false;parked=false;loaded=false;groups=[];tutorial_started=true;_build_phase();hud.menu=false;paused=false;save_story()
			director.start("legacy");return
	if not hud.menu:Input.mouse_mode=Input.MOUSE_MODE_CAPTURED;_follow(1)

func interact():
	var h=nearest_hotspot()
	if h.is_empty():return
	match h.id:
		"car":board()
		"babies":
			babies_seen=true;save_story();_refresh_hotspots()
			say_group("babies")
		"queen":
			if phase==0 and babies_seen:
				say_group("courtyard","courtyard")
			else:say_group("queen_before" if phase<3 else "queen_home")
		"tingge":say_group("tingge")
		"pange":say_group("pange")
		"xuanshen":
			if phase==1:rescue_car()
			else:say_group("xuanshen")
		"bag":
			carrying=true;bag.visible=false;held_bag=PrologueSet.suitcase(player,Vector3(0,.52,.67));held_bag.scale=Vector3.ONE*.66;ToonKit.finish(held_bag);_refresh_hotspots();hud.say("抱好了 · 送到院子右侧的蓝色全家车旁")
			PrologueSet.local_lighting(held_bag)
		"load":
			carrying=false;loaded=true
			if held_bag:held_bag.free();held_bag=null
			PrologueSet.suitcase(scene_root,Vector3(10,2.6,3));ToonKit.finish(scene_root)
			PrologueSet.local_lighting(scene_root)
			say_group("luggage","photo_ready")
		"photo":take_family_photo()
		"boys0","boys1","boys2":_boys(int(h.id.right(1)))
		"phone":
			say_group("phone","invited")
		"leave":
			if phase<5:say_group("leave","complete")
			else:menu_action("chapter1")

func _boys(index: int):
	if not index in groups:groups.append(index);save_story();_refresh_hotspots()
	say_group("boys"+str(index))

func rescue_car():
	if phase!=1:return
	if player.vehicle:player.vehicle.driver=null;player.vehicle=null
	var car=cars[0];car.position=Vector3(0,.06,17 if parked else 5);car.rotation=Vector3.ZERO;car.hp=180;car.speed=0;car.velocity=Vector3.ZERO
	player.position=Vector3(-2,.2,17 if parked else 5);player.velocity=Vector3.ZERO;player.visible=true;player.collision_layer=2;player.collision_mask=7
	_clear_input();hud.say("炫神把车摆正了 · 靠近按 E 上车")

func _arrange_photo():
	var poses={"queen":Vector3(-2.3,.12,.8),"tingge":Vector3(-5.6,.12,.5),"pange":Vector3(4.6,.12,.6),"xuanshen":Vector3(7,.12,.8)}
	for key in poses:cast[key].position=poses[key];cast[key].rotation.y=0
	for i in range(babies.size()):babies[i].get_parent().position=Vector3(-3+(i%4)*2,.12,3+(i/4)*1.7)

func take_family_photo():
	director.start("photo")

func say_group(key: String,then: String=""):
	show_dialogue(voice.lines(key),then)

func show_dialogue(lines: Array,then: String=""):
	dialogue=lines;line_index=0;after_dialogue=then;paused=true;_clear_input();Input.mouse_mode=Input.MOUSE_MODE_VISIBLE
	_line_started()

func _line_started():
	line_time=0;voice.speak(dialogue[line_index])
	for actor in cast.values()+sons:actor.gesture="idle"
	var who=dialogue[line_index][0];var actor=null
	if who in {"小朋友":"queen","听歌":"tingge","攀哥":"pange","炫神":"xuanshen"}:
		actor=cast.get({"小朋友":"queen","听歌":"tingge","攀哥":"pange","炫神":"xuanshen"}[who])
	elif who in ["老大","老二","老三","老四","老五","老六","老七","老八"] and sons.size()==8:
		actor=sons[["老大","老二","老三","老四","老五","老六","老七","老八"].find(who)]
	if actor:
		actor.gesture="talk"
		if not photo_camera:
			var d=player.position-actor.position;actor.rotation.y=atan2(d.x,d.z);player.rotation.y=atan2(-d.x,-d.z)

func advance_dialogue():
	if dialogue.is_empty():return
	line_index+=1
	if line_index<dialogue.size():_line_started();return
	voice.stop()
	for actor in cast.values()+sons:actor.gesture="idle"
	dialogue=[];line_index=0;paused=false;Input.mouse_mode=Input.MOUSE_MODE_CAPTURED
	var action=after_dialogue;after_dialogue=""
	hud.notice_until=0
	match action:
		"courtyard":phase=1;_refresh_hotspots();save_story();director.start("exit")
		"photo_ready":phase=2;_refresh_hotspots();save_story();hud.help=false;director.start("gather")
		"home":director.start("years")
		"invited":phase=4;_refresh_hotspots();save_story()
		"complete":director.start("leave")

func story_path() -> String:return "user://prologue-test.json" if prologue_test else "user://shanghai-prologue-v1.json"
func has_story_save() -> bool:return FileAccess.file_exists(story_path())
func saved_phase() -> int:
	var d=read_story();return int(d.get("phase",0))
func read_story() -> Dictionary:
	if not has_story_save():return {}
	var d=JSON.parse_string(FileAccess.get_file_as_string(story_path()))
	if not d is Dictionary or d.get("version",0)!=1:return {}
	return d
func save_story():
	# Opening the title or free-roam must never invent/overwrite story progress.
	if not tutorial_started or director.active():return
	var f=FileAccess.open(story_path(),FileAccess.WRITE)
	if f:f.store_string(JSON.stringify({"version":1,"phase":phase,"babies_seen":babies_seen,"parked":parked,"loaded":loaded,"groups":groups,"voice":voice.enabled,"auto_dialogue":auto_dialogue,"opening_seen":opening_seen}))
func load_story():
	director.cancel();voice.stop();pause_menu=false;legacy_replay=false
	var d=read_story()
	if d.is_empty():menu_action("new");return
	phase=clampi(int(d.get("phase",0)),0,5);babies_seen=d.get("babies_seen",false)==true or phase>0;parked=d.get("parked",false)==true or phase>1;loaded=d.get("loaded",false)==true or phase>1;groups=[]
	var saved_groups=d.get("groups",[])
	voice.set_enabled(d.get("voice",true)==true);auto_dialogue=d.get("auto_dialogue",true)==true
	opening_seen=d.get("opening_seen",true)==true
	if saved_groups is Array:
		for g in saved_groups:
			if (g is int or g is float) and int(g) in [0,1,2] and not int(g) in groups:groups.append(int(g))
	tutorial_started=true;dialogue=[];paused=false;_build_phase();hud.menu=false;_follow(1);hud.say("已回到序章检查点")
	if phase==0 and not opening_seen:director.start("legacy")
