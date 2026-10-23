extends RefCounted

static func ticks(w,n: int):
	for i in range(n):await w.get_tree().physics_frame

static func finish(w):
	var guard=0
	while (not w.dialogue.is_empty() or w.director.active()) and guard<80:
		if w.director.active():w.director.skip()
		else:w._key(KEY_E)
		guard+=1
	await ticks(w,3)

static func lines_only(w):
	var guard=0
	while not w.dialogue.is_empty() and guard<40:w._key(KEY_E);guard+=1
	await ticks(w,3)

static func go(w,p: Vector3):
	w.player.position=p+Vector3.UP*.16;w.player.velocity=Vector3.ZERO
	await ticks(w,4)

static func shot(w,name_value: String):
	var args=OS.get_cmdline_user_args()
	if "--no-capture" in args or DisplayServer.get_name()=="headless":return
	var dir="res://builds/prologue"
	for i in range(args.size()-1):
		if args[i]=="--capture-output":dir=args[i+1]
	DirAccess.make_dir_recursive_absolute(dir)
	await w._shot(dir+"/"+name_value+".png")

static func legacy(w,checks: Array):
	checks.append([w.director.kind=="legacy" and w.director.opening!=null and not w.scene_root.visible,"new game stages the first-game ending before the hospital"])
	var d=w.director;var o=d.opening;var start=o.friends.pange.position;var sky=o.saved_sky
	d.elapsed=5.15;d.tick(0)
	checks.append([o.friends.pange.position.distance_to(start)>2 and o.friends.values().all(func(a):return a.historic_uniform),"blue-uniform friends actually regroup at the dawn terrace"])
	d.elapsed=o.events[0].start+.08;d.tick(0)
	var first=d.subtitle=="海豚帮解散。" and w.voice.current_key==w.voice.key_for(["豚师","海豚帮解散。"])
	d.elapsed=o.events[1].start+.08;d.tick(0)
	checks.append([first and d.subtitle=="海豚蒂国成立。" and w.voice.player.playing,"canonical declarations play in order with the actual bundled voice"])
	var elapsed=d.elapsed;w._key(KEY_ESCAPE);await ticks(w,8)
	checks.append([w.pause_menu and is_equal_approx(d.elapsed,elapsed) and o.ambient.stream_paused and w.voice.player.stream_paused,"pause holds the opening camera, dialogue and ambient sound together"])
	w._key(KEY_ESCAPE);var pending=FileAccess.get_sha256(w.story_path());w.save_story()
	var protected=FileAccess.get_sha256(w.story_path())==pending and not w.read_story().opening_seen
	w.load_story()
	checks.append([protected and d.kind=="legacy" and not w.opening_seen,"unfinished intro checkpoint resumes safely without committing cinematic progress"])
	o=d.opening;var old_stage=o.stage;d.elapsed=o.home_begin+2;d.tick(0)
	var home_ready=o.home.visible and o.hero.get_parent()==o.home and o.queen.position.z<5.3
	d.elapsed=d.duration;d.tick(0)
	checks.append([home_ready and d.kind=="wake" and w.opening_seen and not is_instance_valid(old_stage) and w.scene_root.visible and o.environment.sky==sky,"normal ending crosses home then restores the world and starts hospital wake-up once"])
	d.skip();await finish(w);w.menu_action("title")
	var stable=FileAccess.get_sha256(w.story_path());var phase=w.phase
	w.menu_action("replay");old_stage=d.opening.stage;d.elapsed=d.opening.home_begin+2;d.tick(0);d.skip()
	checks.append([w.hud.menu and w.phase==phase and not is_instance_valid(old_stage) and FileAccess.get_sha256(w.story_path())==stable,"skipping a title replay restores the title without changing the save"])
	w.menu_action("replay");old_stage=d.opening.stage;w.menu_action("title")
	checks.append([w.hud.menu and not d.active() and not is_instance_valid(old_stage) and FileAccess.get_sha256(w.story_path())==stable,"leaving replay through the pause menu cleans up without touching progress"])
	var old_save=w.read_story();old_save.erase("opening_seen")
	var f=FileAccess.open(w.story_path(),FileAccess.WRITE);f.store_string(JSON.stringify(old_save));f.close();w.menu_action("continue")
	checks.append([w.opening_seen and not d.active() and w.phase==phase,"older version-one checkpoints continue without forcing the new intro"])
	w.menu_action("new");old_stage=d.opening.stage;d.skip()
	checks.append([d.kind=="wake" and w.read_story().opening_seen and not is_instance_valid(old_stage),"skipping a new-game intro preserves the hospital beginning and cleans its temporary stage"])

static func run(w):
	var checks=[]
	var normal="user://shanghai-prologue-v1.json";var old_hash=FileAccess.get_sha256(normal) if FileAccess.file_exists(normal) else ""
	checks.append([w.hud.menu and not w.tutorial_started,"title does not create story progress"])
	var bundled=true;var unique={}
	for line in w.voice.all_lines():
		var key=w.voice.key_for(line);unique[key]=true
		var path="res://assets/voice/"+key+".mp3"
		if not ResourceLoader.exists(path):bundled=false
		else:
			var stream=load(path)
			if not stream is AudioStreamMP3 or stream.get_length()<.3:bundled=false
	checks.append([bundled and unique.size()==70,"all 70 authored Chinese voice clips are bundled and load offline"])
	await shot(w,"00-title")
	w.menu_action("new")
	await legacy(w,checks)
	var p=w.player.position;Input.action_press("forward");await ticks(w,15);Input.action_release("forward")
	checks.append([w.player.position.distance_to(p)<.1 and w.paused,"dialogue freezes movement"])
	checks.append([w.director.kind=="wake","new game begins with a staged hospital wake-up"])
	await ticks(w,45);await shot(w,"00b-hospital-wake-up")
	checks.append([w.camera.position.y<4.5,"opening camera stays under the physical ceiling"])
	w.director.skip();await ticks(w,5)
	checks.append([w.voice.player.playing and w.voice.duration>.5,"spoken dialogue starts an actual AudioStreamPlayer"])
	var line_time=w.line_time;w._key(KEY_ESCAPE);await ticks(w,12)
	checks.append([w.pause_menu and w.voice.player.stream_paused and is_equal_approx(w.line_time,line_time),"pause freezes dialogue timing and audio playback together"])
	w._key(KEY_ESCAPE);var old_key=w.voice.current_key;w._key(KEY_E);await ticks(w,3)
	checks.append([not w.pause_menu and w.voice.current_key!=old_key and w.voice.player.get_playback_position()<.3,"skipping a line stops the old voice before the new one"])
	var old_index=w.line_index;w.line_time=w.voice.duration+.64;await ticks(w,5)
	checks.append([w.line_index==old_index+1,"automatic dialogue advance follows the spoken clip duration"])
	await finish(w)
	await go(w,Vector3(0,.12,-5));p=w.player.position
	var roof=w.get_world_3d().direct_space_state.intersect_ray(PhysicsRayQueryParameters3D.create(Vector3(0,2.5,-5),Vector3(0,6,-5),1))
	checks.append([not roof.is_empty() and roof.position.y>4.7 and roof.normal.y<-.9,"hospital has a real solid ceiling rather than an open roof"])
	checks.append([w.navigation_targets()[0].id=="babies","the first objective identifies the actual nursery location"])
	checks.append([w.babies.size()==8,"eight separately numbered newborn models"])
	w._key(KEY_E)
	checks.append([not w.babies_seen,"distant interaction cannot complete nursery objective"])
	await go(w,Vector3(0,.12,-20));w._key(KEY_E)
	checks.append([w.dialogue.is_empty(),"hospital wall blocks interaction with the queen behind it"])
	await go(w,p)
	Input.action_press("forward");await ticks(w,64);Input.action_release("forward");await ticks(w,3)
	checks.append([w.player.position.distance_to(p)>4,"prologue uses actual movement input and collisions"])
	# Walk the last metres into the clear central aisle, then use the ordinary E path.
	await go(w,Vector3(0,.12,-12));w._key(KEY_E)
	checks.append([w.babies_seen and not w.dialogue.is_empty(),"E at nursery counts all eight and starts family dialogue"])
	w.fixed_camera=true;w.camera.position=Vector3(11.8,3.2,-6.1);w.camera.look_at(Vector3(0,1,-13.2));await shot(w,"01-eight-newborns");w.fixed_camera=false
	await finish(w);await go(w,Vector3(0,.12,-16));w._key(KEY_E);await finish(w)
	checks.append([w.phase==1 and not w.parked,"birth leads to playable departure courtyard"])
	checks.append([w.navigation_targets()[0].id=="door","interior navigation leads through the hospital exit before the car"])
	await go(w,Vector3(0,.12,-5));await ticks(w,45)
	var closed=w.get_world_3d().direct_space_state.intersect_ray(PhysicsRayQueryParameters3D.create(Vector3(.35,1,-1),Vector3(.35,1,1),1))
	checks.append([not closed.is_empty() and closed.collider is AnimatableBody3D,"closed glass door has a matching physical collision"])
	await go(w,Vector3(0,.12,-2));Input.action_press("back");await ticks(w,40);Input.action_release("back")
	checks.append([w.player.position.z>.3 and w.room.door.opened>.5,"proximity opens the real sliding panels and walking crosses the doorway"])
	await go(w,Vector3(-5,0,9));await ticks(w,48)
	checks.append([w.room.door.opened<.05,"hospital door closes after the player clears its safety zone"])
	await go(w,Vector3(-7,0,-2));w._key(KEY_E)
	checks.append([not w.carrying,"luggage cannot skip making room for the family vehicle"])
	w.rescue_car();await ticks(w,4);w._key(KEY_E)
	checks.append([w.player.vehicle==w.cars[0],"ordinary E boarding uses existing safe vehicle controller"])
	checks.append([w.navigation_targets()[0].id=="parking","driving guidance switches to the blue parking space"])
	w.cars[0].position=Vector3(0,.06,20);Input.action_press("forward");await ticks(w,120);Input.action_release("forward")
	checks.append([w.cars[0].hp<180 and w.player.hp<100,"real courtyard wall impact injures both car and seated hero"])
	w._key(KEY_R);await ticks(w,5)
	checks.append([not w.player.vehicle and w.cars[0].hp==180 and not w.parked,"mechanic rescue recovers a damaged car without skipping the objective"])
	w._key(KEY_E)
	Input.action_press("forward")
	for i in range(180):
		await ticks(w,1)
		if w.cars[0].position.z>=14.5:break
	Input.action_release("forward");Input.action_press("jump")
	await ticks(w,5);await shot(w,"02-moving-the-yellow-car")
	await ticks(w,45);Input.action_release("jump")
	checks.append([w.cars[0].position.z>15 and w.cars[0].position.z<18.7,"real throttle and handbrake reach the marked parking space"])
	checks.append([not w.parked,"parking requires leaving the car"])
	w._key(KEY_E);await ticks(w,8)
	checks.append([w.parked and not w.player.vehicle and w.player.visible,"stopped safe exit completes parking objective"])
	await go(w,Vector3(-7,0,-2));w._key(KEY_E)
	checks.append([w.carrying and is_instance_valid(w.held_bag) and not w.bag.visible,"pickup visibly transfers the luggage to the hero"])
	w.save_story();w.load_story();await ticks(w,4)
	checks.append([w.parked and not w.loaded and not w.carrying and w.bag.visible,"mid-carry checkpoint restores a recoverable bag and parked car"])
	await go(w,Vector3(-7,0,-2));w._key(KEY_E);await go(w,Vector3(7,0,6));w._key(KEY_E);await finish(w)
	checks.append([w.loaded and w.phase==2 and not w.carrying,"loading changes the visible world and unlocks the photograph"])
	checks.append([w.babies.size()==8 and w.babies.all(func(b):return b.global_position.z>2),"all eight actual babies join the family photograph"])
	await go(w,Vector3(0,0,8.5));w._key(KEY_E)
	var photo_start=w.camera.position;await ticks(w,75)
	checks.append([w.director.kind=="photo" and w.camera.position.distance_to(photo_start)>.2 and w.cast.tingge.gesture=="wave","family photo moves the camera and animates the actors"])
	await shot(w,"03a-photo-performance");await ticks(w,155)
	checks.append([w.photo_camera and w.after_dialogue=="home","photo stages the hero, family and dedicated camera"])
	await shot(w,"03-first-family-photo");await lines_only(w)
	checks.append([w.director.kind=="years" and w.phase==2,"the family photograph flows into a timed years-passing sequence"])
	await ticks(w,205)
	checks.append([w.phase==3 and w.sons.size()==8 and w.sons[0].rig.scale.x<.3,"growth montage stages all eight younger children in their sleeping room"])
	await shot(w,"03b-years-passing")
	var elapsed=w.director.elapsed;w._key(KEY_ESCAPE);await ticks(w,10)
	checks.append([is_equal_approx(w.director.elapsed,elapsed),"pause freezes the transition animation as well as gameplay"])
	w._key(KEY_ESCAPE);w.save_story()
	checks.append([w.saved_phase()==2,"saving cannot commit a half-finished growth transition"])
	for i in range(600):
		await ticks(w,1)
		if w.director.elapsed>w.director.baby_end+.9:break
	await shot(w,"03c-eight-growing-boys");w.director.skip();await finish(w)
	checks.append([w.phase==3 and w.sons.size()==8,"years-later transition replaces eight newborns with eight schoolboys"])
	roof=w.get_world_3d().direct_space_state.intersect_ray(PhysicsRayQueryParameters3D.create(Vector3(0,2.5,8),Vector3(0,6,8),1))
	checks.append([not roof.is_empty() and roof.position.y>4.7,"the family home has its own solid ceiling"])
	checks.append([w.navigation_targets().size()==3,"all unfinished family conversations have visible objective locations"])
	checks.append([not w.hot.any(func(h):return h.id=="phone"),"Shanghai invitation waits for time with the children"])
	for i in range(3):
		await go(w,[Vector3(-4,0,3),Vector3(1,0,3),Vector3(7,0,3)][i]);w._key(KEY_E)
		if i==0:
			w.fixed_camera=true;w.camera.position=Vector3(11.8,3.1,10.8);w.camera.look_at(Vector3(.8,1.1,2.7));await shot(w,"04-eight-boys-at-home");w.fixed_camera=false
		await finish(w)
		if i==0:
			w.fixed_camera=true;w.camera.position=Vector3(-9,2.7,11);w.camera.look_at(Vector3(3,1.2,3));await shot(w,"04b-family-objective-markers");w.fixed_camera=false
	checks.append([w.groups.size()==3 and w.hot.any(func(h):return h.id=="phone"),"three distinct family conversations unlock the telephone"])
	await go(w,Vector3(-4,0,3));w._key(KEY_E);await finish(w)
	checks.append([w.groups.size()==3,"repeated family conversation cannot duplicate progress"])
	await go(w,Vector3(-11,0,8));w._key(KEY_E);await shot(w,"05-shanghai-invitation");await finish(w)
	checks.append([w.phase==4,"remote friends invite the family without teleporting into the home"])
	await go(w,Vector3(0,0,10.8));w._key(KEY_E);await finish(w)
	checks.append([w.phase==5 and w.saved_phase()==5,"prologue completes and persists only after the family promise"])
	w.load_story();await ticks(w,5)
	checks.append([w.phase==5 and w.sons.size()==8 and w.groups.size()==3,"completed checkpoint resumes the home with all eight children"])
	w._key(KEY_ESCAPE);var frozen=w.player.position;Input.action_press("forward");await ticks(w,10);Input.action_release("forward")
	checks.append([w.paused and w.player.position.distance_to(frozen)<.1,"pause menu stops actual movement input"])
	w.menu_action("resume");await shot(w,"06-prologue-complete")
	var after_hash=FileAccess.get_sha256(normal) if FileAccess.file_exists(normal) else ""
	checks.append([old_hash==after_hash and w.story_path()!=normal,"automated story checks preserve the normal player save"])
	checks.append([FileAccess.get_sha256("res://assets/original_dolphin.json")=="7333d7666dd647f9fd858b7001bce2821705b9f6134425b0f399faacc451a08e","original hero geometry remains byte-identical"])
	w._test_report(checks)
