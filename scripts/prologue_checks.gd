extends RefCounted

static func ticks(w,n: int):
	for i in range(n):await w.get_tree().physics_frame

static func finish(w):
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

static func run(w):
	var checks=[]
	var normal="user://shanghai-prologue-v1.json";var old_hash=FileAccess.get_sha256(normal) if FileAccess.file_exists(normal) else ""
	checks.append([w.hud.menu and not w.tutorial_started,"title does not create story progress"])
	await shot(w,"00-title")
	w.menu_action("new")
	var p=w.player.position;Input.action_press("forward");await ticks(w,15);Input.action_release("forward")
	checks.append([w.player.position.distance_to(p)<.1 and w.paused,"dialogue freezes movement"])
	await finish(w)
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
	w.fixed_camera=true;w.camera.position=Vector3(14,9,-1);w.camera.look_at(Vector3(0,1,-12));await shot(w,"01-eight-newborns");w.fixed_camera=false
	await finish(w);await go(w,Vector3(0,.12,-16));w._key(KEY_E);await finish(w)
	checks.append([w.phase==1 and not w.parked,"birth leads to playable departure courtyard"])
	await go(w,Vector3(-7,0,-2));w._key(KEY_E)
	checks.append([not w.carrying,"luggage cannot skip making room for the family vehicle"])
	w.rescue_car();await ticks(w,4);w._key(KEY_E)
	checks.append([w.player.vehicle==w.cars[0],"ordinary E boarding uses existing safe vehicle controller"])
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
	checks.append([w.photo_camera and w.after_dialogue=="home","photo stages the hero, family and dedicated camera"])
	await shot(w,"03-first-family-photo");await finish(w)
	checks.append([w.phase==3 and w.sons.size()==8,"years-later transition replaces eight newborns with eight schoolboys"])
	checks.append([not w.hot.any(func(h):return h.id=="phone"),"Shanghai invitation waits for time with the children"])
	for i in range(3):
		await go(w,[Vector3(-4,0,3),Vector3(1,0,3),Vector3(7,0,3)][i]);w._key(KEY_E)
		if i==0:
			w.fixed_camera=true;w.camera.position=Vector3(10,7,13);w.camera.look_at(Vector3(1,.8,3));await shot(w,"04-eight-boys-at-home");w.fixed_camera=false
		await finish(w)
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
