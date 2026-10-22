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

func _ready():
	Engine.max_fps=60;_bind_keys();_audio()
	var args=OS.get_cmdline_user_args();prologue_test="--test-prologue" in args or "--capture-prologue" in args
	capture_mode=prologue_test
	PrologueSet.environment(self)
	player=StreetActor.new();player.hero=true;player.world=self;add_child(player)
	camera=Camera3D.new();camera.fov=61;camera.near=.12;camera.far=250;camera.current=true;add_child(camera)
	var layer=CanvasLayer.new();add_child(layer);hud=load("res://scripts/prologue_hud.gd").new();hud.world=self;layer.add_child(hud)
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
		PrologueSet.hospital(scene_root)
		for n in scene_root.find_children("*","Node3D",true,false):
			if n is StoryCast and n.kind=="baby":babies.append(n)
		_friend("queen",Vector3(0,.12,-17));_friend("tingge",Vector3(9,.12,-13));_friend("pange",Vector3(9,.12,-8));_friend("xuanshen",Vector3(-9,.12,-7))
		var car=StreetCar.new();car.world=self;car.paint="#e8bf45";car.position=Vector3(0,.06,17 if parked else 5);scene_root.add_child(car);cars.append(car)
		bag=PrologueSet.suitcase(scene_root,Vector3(-7,.12,-2));bag.visible=not loaded
		if loaded:PrologueSet.suitcase(scene_root,Vector3(10,2.6,3))
		player.position=Vector3(0,.14,-5 if phase==0 else 9);yaw=PI;pitch=.34
		if phase==2:_arrange_photo()
	else:
		PrologueSet.home(scene_root);_friend("queen",Vector3(-8,.05,-3))
		var positions=[Vector3(-5,0,2),Vector3(-3,0,2),Vector3(-4,0,4),Vector3(0,0,2),Vector3(2,0,2),Vector3(1,0,4),Vector3(6,0,3),Vector3(8,0,3)]
		for i in range(8):
			var son=StoryCast.new();scene_root.add_child(son);son.build("son",i+1);son.position=positions[i];sons.append(son)
		player.position=Vector3(0,.05,8);yaw=PI;pitch=.32
	ToonKit.finish(scene_root)
	_refresh_hotspots()

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
		0:return "看看八兄弟，再和小朋友商量出院" if not babies_seen else "八个，一个都不少 · 和小朋友说话"
		1:return "把黄色小车挪到院子里的蓝色车位" if not parked else "把行李搬上全家车"
		2:return "去门口拍一张全家合照"
		3:return "听听八兄弟在忙什么  "+str(groups.size())+"/3" if groups.size()<3 else "桌上的电话响了 · 攀哥找你"
		4:return "答应八兄弟，好好看完他们的小戏"
	return "序章完成 · 一家人即将出发去上海"

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
		camera.position=Vector3(16,11,9) if phase<3 else Vector3(14,10,16);camera.look_at(Vector3(0,1,-10) if phase<3 else Vector3(0,1,0));return
	if photo_camera:return
	super._follow(dt)

func _unhandled_input(event):
	if capture_mode:return
	if event is InputEventKey and event.pressed and not event.echo:_key(event.physical_keycode)
	if event is InputEventMouseMotion and Input.mouse_mode==Input.MOUSE_MODE_CAPTURED and not paused:look(event.relative)
	if event is InputEventMouseButton and event.pressed and event.button_index==MOUSE_BUTTON_LEFT:
		if hud.menu or (paused and dialogue.is_empty()):hud.menu_click(get_viewport().get_mouse_position())
		elif not dialogue.is_empty():advance_dialogue()
		else:Input.mouse_mode=Input.MOUSE_MODE_CAPTURED

func _key(key: int):
	if key==KEY_F11:super._key(key);return
	if hud.menu or (paused and dialogue.is_empty()):
		var count=hud.menu_buttons().size()
		if key in [KEY_W,KEY_UP]:menu_selection=posmod(menu_selection-1,count)
		if key in [KEY_S,KEY_DOWN]:menu_selection=posmod(menu_selection+1,count)
		if key==KEY_ENTER:menu_action(hud.menu_buttons()[menu_selection][1])
		if key==KEY_ESCAPE and not hud.menu:menu_action("resume")
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
		"sandbox":
			save_story();_clear_input();Engine.time_scale=1;Input.mouse_mode=Input.MOUSE_MODE_VISIBLE;get_tree().change_scene_to_file("res://scenes/main.tscn");return
		"quit":get_tree().quit();return
		"title":hud.menu=true;paused=true;return
		"resume":paused=false
		"load","continue":load_story();hud.menu=false;paused=false
		"new":
			phase=0;babies_seen=false;parked=false;loaded=false;groups=[];tutorial_started=true;_build_phase();hud.menu=false;paused=false;save_story()
			show_dialogue([["小朋友","醒了？八子计划完成了。你自己生的八个儿子，一个都不少。"],["豚师","八个……只有我玩明白了。就是现在有一点困告。"],["小朋友","先看看孩子。炫神在门口折腾车，我们今天回家。"]]);return
	if not hud.menu:Input.mouse_mode=Input.MOUSE_MODE_CAPTURED;_follow(1)

func interact():
	var h=nearest_hotspot()
	if h.is_empty():return
	match h.id:
		"car":board()
		"babies":
			babies_seen=true;save_story();_refresh_hotspots()
			show_dialogue([["攀哥","一、二、三、四……八。等一下，我从这头再数一遍。"],["炫神","一次解决！我是说八子计划。不是说接人的车。"],["听歌","是日，八子俱全。豚师，你往旁边一点，别把老八挡住。"],["豚师","那岂不是起飞。小朋友，我们怎么把他们带回去？"]])
		"queen":
			if phase==0 and babies_seen:
				show_dialogue([["小朋友","你去把黄色小车挪到院子后面的蓝色车位。全家车停不进来，行李也还在门边。"],["炫神","放心，我又叫了一辆大车。小黄只负责拉东西，不把八个儿子叠着放。"],["豚师","本来还想坐着指挥一下。"],["小朋友","本宫也想。先干活。"]],"courtyard")
			else:show_dialogue([["小朋友","先看看孩子，再收拾东西。" if phase<3 else "他们最近总凑在一起排节目。你答应看的，可别看一半又困告了。"],["豚师","这次认真看。"]])
		"tingge":show_dialogue([["听歌","我带了相机。先拍一张，再挑一张没闭眼的。"],["豚师","这个计划可能比八子计划难。"]])
		"pange":show_dialogue([["攀哥","我已经数过两遍了。你困归困，回家路上不能再少一个。"],["豚师","我也算在里面？"],["攀哥","你最容易忘。"]])
		"xuanshen":
			if phase==1:rescue_car()
			else:show_dialogue([["炫神","黄色的，能开就行。但八个儿子，真装不下。"],["豚师","你当年也是这么说的。"]])
		"bag":
			carrying=true;bag.visible=false;held_bag=PrologueSet.suitcase(player,Vector3(0,.52,.67));held_bag.scale=Vector3.ONE*.66;ToonKit.finish(held_bag);_refresh_hotspots();hud.say("抱好了 · 送到院子右侧的蓝色全家车旁")
		"load":
			carrying=false;loaded=true
			if held_bag:held_bag.free();held_bag=null
			PrologueSet.suitcase(scene_root,Vector3(10,2.6,3));ToonKit.finish(scene_root)
			show_dialogue([["攀哥","行李装好了。小朋友和孩子坐大车，咱们分开走。"],["听歌","先别走！第一次合照，还差摄影师……也差豚师。"],["豚师","我一直在这儿搬东西。"]],"photo_ready")
		"photo":take_family_photo()
		"boys0","boys1","boys2":_boys(int(h.id.right(1)))
		"phone":
			show_dialogue([["攀哥 · 电话","生日快到了，来上海住一阵？房间都收拾好了。象象说，来多少人都得先吃饭。"],["炫神 · 电话","这次车我提前改好了！十个人，真能坐。"],["听歌 · 电话","我准备节目。你们慢慢来，别又把自己落在车上。"],["老大","我们也有节目！讲爸爸以前的故事。现在还不能告诉你。"],["豚师","好。爸爸这次从第一幕看到最后一幕。再带你们好好逛上海。"]],"invited")
		"leave":
			if phase<5:show_dialogue([["老七","一、二……八。爸爸，这次你也站过来。"],["老八","合照我收好了。你困了，到了上海再睡。"],["小朋友","人都齐了？那就出发。"],["豚师","齐了。一个都不少。"]],"complete")
			else:hud.say("序章已完成 · Esc 可重玩或进入陆家嘴漫游")

func _boys(index: int):
	if not index in groups:groups.append(index);save_story();_refresh_hotspots()
	var lines=[
		[["老大","我演爸爸。我最大，这个不用争。"],["老二","我画了上海！这些高楼先放椅子上，别踩我的江。"],["老三","那我演爸爸打架的时候！"],["豚师","爸爸也不是每天都打架。先别拿弟弟练。"]],
		[["老四","听歌叔叔说，可以先来一段音乐。"],["老五","那什么时候演到吃饭？"],["老六","我记得攀哥喜欢吃这个。我们带一盒去。"],["豚师","别提前吃完就行。也给爸爸留一点。"]],
		[["老七","一、二……八。爸爸，我数完了，你还要不要再数一遍？"],["豚师","攀哥教你的？"],["老八","你先坐。你刚才又站着睡了。"],["豚师","没有睡。我在想，去上海带你们看什么。"]]
	]
	show_dialogue(lines[index])

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
	photo_camera=true;player.position=Vector3(0,.13,.6);player.rotation.y=0;player.velocity=Vector3.ZERO
	camera.position=Vector3(3.5,5.7,18);camera.look_at(Vector3(1.2,1.2,2));
	show_dialogue([["听歌","看镜头！八个都在……豚师，你醒一下。"],["豚师","醒着。只有我……困告明白了。"],["攀哥","一到八，全部拍进去了。这张就叫《八子俱全》。"]],"home")

func show_dialogue(lines: Array,then: String=""):
	dialogue=lines;line_index=0;after_dialogue=then;paused=true;_clear_input();Input.mouse_mode=Input.MOUSE_MODE_VISIBLE

func advance_dialogue():
	if dialogue.is_empty():return
	line_index+=1
	if line_index<dialogue.size():return
	dialogue=[];line_index=0;paused=false;Input.mouse_mode=Input.MOUSE_MODE_CAPTURED
	var action=after_dialogue;after_dialogue=""
	hud.notice_until=0
	match action:
		"courtyard":phase=1;_refresh_hotspots();save_story();hud.help=true
		"photo_ready":phase=2;_arrange_photo();_refresh_hotspots();save_story();hud.help=false
		"home":
			phase=3;_build_phase();save_story();_follow(1)
			show_dialogue([["几年以后","八只篮子换成了八张小床。家里总算不用一整夜轮流醒，换成了白天一起闹。"],["小朋友","八个儿子都会走、会说话了。就是有些话，跟他们爸爸学得太快。"],["老三","那岂不是起飞！"],["豚师","这个我可没教。"]])
		"invited":phase=4;_refresh_hotspots();save_story()
		"complete":phase=5;save_story();hud.say("序章完成 · 一个都不少 · 下一站上海");_refresh_hotspots()

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
	if not tutorial_started:return
	var f=FileAccess.open(story_path(),FileAccess.WRITE)
	if f:f.store_string(JSON.stringify({"version":1,"phase":phase,"babies_seen":babies_seen,"parked":parked,"loaded":loaded,"groups":groups}))
func load_story():
	var d=read_story()
	if d.is_empty():menu_action("new");return
	phase=clampi(int(d.get("phase",0)),0,5);babies_seen=d.get("babies_seen",false)==true or phase>0;parked=d.get("parked",false)==true or phase>1;loaded=d.get("loaded",false)==true or phase>1;groups=[]
	var saved_groups=d.get("groups",[])
	if saved_groups is Array:
		for g in saved_groups:
			if (g is int or g is float) and int(g) in [0,1,2] and not int(g) in groups:groups.append(int(g))
	tutorial_started=true;dialogue=[];paused=false;_build_phase();hud.menu=false;_follow(1);hud.say("已回到序章检查点")
