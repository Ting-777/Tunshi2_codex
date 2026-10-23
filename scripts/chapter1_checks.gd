extends RefCounted

static func ticks(w,n: int):
	for i in range(n):await w.get_tree().physics_frame
static func check(out: Array,value: bool,label: String):
	out.append([value,label]);print("CHECK ",value," ",label)
static func walk(w,p: Vector3,frames: int=800) -> bool:
	for i in range(frames):
		var d=p-w.player.position;d.y=0
		if d.length()<.85:Input.action_release("forward");await ticks(w,2);return true
		w.yaw=atan2(d.x,d.z);Input.action_press("forward");await ticks(w,1)
	Input.action_release("forward");print("WALK_STUCK ",w.player.position," => ",p);return false
static func place(w,p: Vector3):
	w.player.position=p+Vector3.UP*.13;w.player.velocity=Vector3.ZERO;w.player.stun=0;w.player.impulse=Vector3.ZERO;await ticks(w,3)
static func drive(w,p: Vector3,frames: int=1500) -> bool:
	for i in range(frames):
		var d=p-w.van.position;d.y=0
		if d.length()<5.0:
			w._clear_input();Input.action_press("jump");await ticks(w,32);Input.action_release("jump");return true
		var angle=angle_difference(w.van.rotation.y,atan2(d.x,d.z))
		Input.action_release("left");Input.action_release("right");Input.action_release("back")
		var reversing=absf(angle)>2.3 or (absf(angle)>1.5 and d.length()<20)
		var turn=-angle_difference(w.van.rotation.y+PI,atan2(d.x,d.z)) if reversing else angle
		if turn>.10:Input.action_press("left",minf(1,turn*1.7))
		if turn<-.10:Input.action_press("right",minf(1,-turn*1.7))
		Input.action_release("forward");Input.action_release("jump")
		var wanted=7.5 if absf(angle)>.6 else minf(13,5+d.length()*.15)
		if reversing:
			if absf(w.van.speed)>8.0:Input.action_press("jump")
			else:Input.action_press("back")
		elif w.van.speed>wanted+1:Input.action_press("jump")
		else:Input.action_press("forward",1)
		await ticks(w,1)
	w._clear_input();print("DRIVE_STUCK ",w.van.position," => ",p," hp ",w.van.hp);return false
static func stop_barks(w):w.bark_queue=[];w.bark_text="";w.voice.stop()
static func isolate(w):
	for a in w.people:a.set_physics_process(false)
static func fight(w,frames: int=3000) -> bool:
	for i in range(frames):
		if w.failed_reason!="":print("FIGHT_FAILED ",w.failed_reason);w._clear_input();return false
		if w.director.active() or w.stage==5:w._clear_input();return true
		var target=null;var distance=INF
		for a in w.fighters:
			if a.hp<=0 or a.position.x> -112 or a.knockdown>.35:continue
			var d=a.position.distance_to(w.player.position)*(.55 if a.assignment=="staff" else 1.0)
			if d<distance:distance=d;target=a
		Input.action_release("forward");Input.action_release("guard")
		if target:
			var delta=target.position-w.player.position;delta.y=0;w.yaw=atan2(delta.x,delta.z);w.player.rotation.y=w.yaw
			if delta.length()>1.40:Input.action_press("forward")
			else:
				Input.action_press("guard")
				if w.player.heat>=60 and w.player.attack<0:w._key(KEY_Q)
				elif w.player.attack<0:w._key(KEY_R)
			if target.role=="charger" and target.charge_time>.4 and target.charge_time<.85:w.dodge()
		if w.player.hp<60 and w.medicine>0:w._key(KEY_1)
		await ticks(w,1)
	w._clear_input();print("FIGHT_TIMEOUT ",w.staff.map(func(a):return [a.position,a.hp,a.evacuated]),w.fighters.map(func(a):return [a.role,a.hp,a.position]));return false

static func snapshot(w,label: String):
	if DisplayServer.get_name()=="headless" or "--no-capture" in OS.get_cmdline_user_args():return
	var dir="res://builds/v060-native-final";var args=OS.get_cmdline_user_args()
	for i in range(args.size()-1):
		if args[i]=="--capture-output":dir=args[i+1]
	DirAccess.make_dir_recursive_absolute(dir)
	await w._shot(dir+"/"+label+".png")

static func run(w):
	var out=[];var prologue_hash=FileAccess.get_sha256("user://shanghai-prologue-v1.json") if FileAccess.file_exists("user://shanghai-prologue-v1.json") else ""
	check(out,w.chapter_test and w.story_path()=="user://chapter1-test.json" and w.director.kind=="arrival","normal first-chapter entry uses an isolated slot and staged arrival")
	check(out,w.sons.size()==8 and w.van.passengers.size()==9 and w.van.driver_model!=null,"eight sons, queen and original-geometry driver have ten real van seats")
	var voiced=true;var unique={}
	for line in w.voice.all_lines():
		var key=w.voice.key_for(line);unique[key]=true;voiced=voiced and ResourceLoader.exists("res://assets/voice/"+key+".mp3")
	check(out,voiced and unique.size()==178,"all 178 chapter dialogue lines are bundled offline")
	await ticks(w,85);w._key(KEY_ESCAPE);var elapsed=w.director.elapsed;await ticks(w,8)
	check(out,w.director.elapsed==elapsed and w.voice.player.stream_paused,"pause holds opening timeline and speech")
	w._key(KEY_ESCAPE);w._key(KEY_TAB);await ticks(w,3)
	check(out,not w.paused and not w.director.active() and w.arrival_seen,"skipping arrival returns immediate control and marks only chapter progress")
	var reached=await walk(w,w.RACE_START);w._key(KEY_E);await ticks(w,185)
	check(out,reached and w.race_active and w.runner.position.distance_to(w.RACE_START)>1,"race starts through E and rival moves through real physics")
	await walk(w,Vector3(-2.6,CityBridge.DECK,22.5));await walk(w,Vector3(0,CityBridge.DECK,22.5));await walk(w,Vector3(0,CityBridge.DECK,17));await ticks(w,3)
	check(out,w.race_step==1 and w.player.position.y>5,"player climbs the real south ramp into the first elevated checkpoint")
	await snapshot(w,"01-bridge-race");var saved=w.player.position;await place(w,Vector3(-27,.05,-10));await ticks(w,4)
	check(out,w.race_step==1,"ground-level shortcuts cannot collect elevated bridge checkpoints")
	await place(w,saved)
	var loop_ok=true
	for i in range(1,17):
		var a=-PI*i/16;loop_ok=(await walk(w,CityBridge.CENTER+Vector3(sin(a)*27,CityBridge.DECK,cos(a)*27))) and loop_ok
	await walk(w,Vector3(0,CityBridge.DECK,-42.5));await walk(w,Vector3(2.6,CityBridge.DECK,-42.5))
	w.race_elapsed=maxf(w.race_elapsed,180)
	loop_ok=(await walk(w,w.RACE_END)) and loop_ok;await ticks(w,4)
	check(out,loop_ok and w.stage==1 and not w.race_active and w.race_result>=180,"either bridge arc is playable and a slow finish still advances the chapter")
	if w.stage!=1:w.call_deferred("_test_report",out);return
	var best=w.race_best;var hash=FileAccess.get_sha256(w.story_path());w.start_race(true);w.save_story()
	check(out,FileAccess.get_sha256(w.story_path())==hash,"optional race replay cannot overwrite active chapter progress")
	w.load_story();await ticks(w,4)
	check(out,w.stage==1 and is_equal_approx(w.race_best,best) and not w.race_active,"loading during a replay returns to chapter checkpoint with best time")
	await load("res://scripts/landmark_checks.gd").run_main(w,out)
	var travel=true
	for p in [Vector3(36,0,-47),Vector3(70,0,-62),ChapterOneSet.BAKERY]:travel=(await walk(w,p)) and travel
	w._key(KEY_E);await ticks(w,3)
	check(out,travel and w.stage==2 and w.van.cargo!=null and w.van.occupied,"cake pickup loads the actual ten-seat family vehicle after a continuous walk")
	if w.stage!=2:w.call_deferred("_test_report",out);return
	await walk(w,w.van.position+w.van.basis.x*signf((w.player.position-w.van.position).dot(w.van.basis.x))*1.9);w._key(KEY_E);await ticks(w,2)
	await snapshot(w,"02-family-van");var car_start=w.van.position;Input.action_press("forward");await ticks(w,90);w._clear_input();Input.action_press("jump");await ticks(w,45);w._clear_input()
	check(out,w.player.vehicle==w.van and w.van.position.distance_to(car_start)>5,"family van accelerates and brakes through normal input and collision")
	# A temporary visible solid verifies injury/cargo through the actual car controller.
	var forward=Vector3(sin(w.van.rotation.y),0,cos(w.van.rotation.y));var wall=ToonKit.solid(w,Vector3(8,4,1),w.van.position+forward*12+Vector3.UP*2)
	var car_hp=w.van.hp;var hero_hp=w.player.hp;var quality=w.cake_quality
	Input.action_press("forward");await ticks(w,155);w._clear_input();wall.queue_free();await ticks(w,3)
	check(out,w.van.hp<car_hp and w.player.hp<hero_hp and w.cake_quality<quality,"real frontal collision injures occupants, damages van and reduces cake quality")
	var damaged=w.van.hp;var quality_saved=w.cake_quality;w.save_story();w.load_story();await ticks(w,4)
	check(out,is_equal_approx(w.van.hp,damaged) and is_equal_approx(w.cake_quality,quality_saved) and w.stage==2,"delivery saves keep damage and cake condition")
	await walk(w,w.van.position+w.van.basis.x*signf((w.player.position-w.van.position).dot(w.van.basis.x))*1.9);w._key(KEY_E);await ticks(w,3)
	var drove=true
	for p in [Vector3(90,0,-140),Vector3(-95,0,-120),Vector3(-95,0,-180),ChapterOneSet.VAN_PARK]:drove=(await drive(w,p)) and drove
	w.cake_quality=0;w._key(KEY_E);await ticks(w,8)
	check(out,drove and w.stage==3 and w.cake_best==0 and not w.player.vehicle,"free-route driving and safe exit finish delivery even with zero cake score")
	if not drove or w.stage!=3:w.call_deferred("_test_report",out);return
	var entered=true
	for p in [Vector3(-124,0,-204),Vector3(-124,0,-222),Vector3(-136,0,-222),ChapterOneSet.HALL+Vector3(0,.16,7)]:entered=(await walk(w,p)) and entered
	w._key(KEY_E);await ticks(w,3)
	check(out,entered and w.director.kind=="welcome" and w.sons.all(func(a):return a.visible),"real entrance and working door lead to eight-son birthday staging")
	if w.director.kind!="welcome":w.call_deferred("_test_report",out);return
	await snapshot(w,"03-birthday");
	var story_ok=await load("res://scripts/chapter_story_checks.gd").run(w,out)
	check(out,story_ok and w.staff.size()==3 and w.fighters.size()==5,"birthday and witnessed confrontation hand control to the live evacuation battle")
	if not story_ok or w.staff.size()!=3:w.call_deferred("_test_report",out);return
	stop_barks(w);w._key(KEY_ESCAPE);var time=w.battle_time;var p=w.staff[0].position;await ticks(w,12)
	check(out,w.battle_time==time and w.staff[0].position==p,"pause freezes escort, enemy AI and reinforcement clock")
	w._key(KEY_ESCAPE);await place(w,Vector3(-150,0,-212))
	var first_hp=w.staff[1].hp
	for i in range(2400):
		if w.failed_reason!="":break
		await ticks(w,1)
	check(out,w.staff.any(func(a):return a.hp<first_hp) and w.failed_reason!="","doing nothing allows actual enemy attacks to hurt staff and fail evacuation")
	w.retry_battle();await ticks(w,3)
	check(out,w.stage==4 and is_equal_approx(w.race_best,best) and w.failed_reason=="" and w.staff.all(func(a):return a.hp==90),"retry resets only this encounter, preserving completed outing scores")
	isolate(w);await place(w,ChapterOneSet.SWITCH+Vector3(-.6,0,0));w._key(KEY_E);await ticks(w,110)
	var ray=PhysicsRayQueryParameters3D.create(ChapterOneSet.GATE+Vector3(3,1.4,0),ChapterOneSet.GATE+Vector3(-3,1.4,0),1)
	check(out,w.venue.gate.opened<.03 and not w.get_world_3d().direct_space_state.intersect_ray(ray).is_empty(),"closing the service gate creates a real collision across reinforcement access")
	w.venue.gate.requested_open=true;await ticks(w,110);w.van.position=ChapterOneSet.GATE+Vector3(0,.1,0);var hp=w.van.hp;w.venue.gate.requested_open=false;await ticks(w,70)
	check(out,w.venue.gate.blocked and w.venue.gate.opened>.8 and w.van.hp==hp,"a vehicle under the gate prevents closing instead of being crushed")
	w.save_story();w.load_story();isolate(w);await ticks(w,4)
	check(out,w.venue.gate.blocked and w.venue.gate.opened>.8 and w.van.position.distance_to(ChapterOneSet.GATE)<.5,"checkpoint preserves an obstructed open gate without spawning it through a vehicle")
	w.van.position=ChapterOneSet.VAN_PARK;await ticks(w,110)
	var rein=w._fighter(Vector3(-105,.1,-217),"brawler","staff");rein.entrance_route=[Vector3(-110,.05,-217),Vector3(-115,.05,-217),Vector3(-128,.05,-221)]
	await ticks(w,180)
	check(out,rein.position.x> -112 and not w.director.active(),"reinforcement physically approaches and remains outside a closed gate")
	w.staff[0].hp=57;w.fighters[0].hp=31;w.reinforcement_wave=1;w.save_story();w.load_story();await ticks(w,3)
	check(out,w.staff[0].hp<=57 and w.fighters[0].hp<=31 and not w.venue.gate.requested_open,"combat checkpoint retains wounds, enemy state and gate choice")
	w.retry_battle();stop_barks(w);await ticks(w,3);isolate(w)
	var shield=w.fighters[1];shield.position=Vector3(-137,.1,-222);shield.rotation.y=0;shield.cooldown=999;shield.set_physics_process(true)
	await place(w,Vector3(-137,0,-220.7));w.player.rotation.y=PI;w.yaw=PI;w.player.strike();await ticks(w,48)
	check(out,shield.hp<76 and shield.hp>60 and shield.guard_open<=0,"front guard reduces a physically connected light strike")
	var shield_hp=shield.hp;w.player.strike("heavy");await ticks(w,48)
	check(out,shield.hp<shield_hp-20 and shield.guard_open>0,"a physically connected heavy strike breaks guard for a punish window")
	isolate(w);var charger=w.fighters[2];charger.position=Vector3(-128,.1,-222);charger.stun=0;charger.charge_cooldown=0;charger.set_physics_process(true)
	await place(w,Vector3(-128,0,-216));w.player.immunity=0;w.yaw=0;var hero_before=w.player.hp;await ticks(w,34)
	var tell=charger.charge_time>0 and charger.charge_time<.85;Input.action_press("right");w.dodge();Input.action_release("right");await ticks(w,95)
	check(out,tell and w.player.hp==hero_before and charger.charge_cooldown>1 and w.player.position.x< -130,"telegraphed straight charge can be dodged through the normal dodge controller")
	w.retry_battle();stop_barks(w);await ticks(w,3)
	# Close the gate through its reachable control, then protect the group with actual attacks.
	await walk(w,ChapterOneSet.SWITCH+Vector3(-.6,0,0));w._key(KEY_E)
	await snapshot(w,"04-courtyard");var won=await fight(w)
	check(out,won and w.staff.all(func(a):return a.evacuated) and w.director.kind=="boss_intro","active melee, breaks, heat and route control complete a real evacuation before the boss")
	if not won:w.call_deferred("_test_report",out);return
	await load("res://scripts/chapter_boss_checks.gd").run(w,out)
	if w.director.active():w._key(KEY_TAB)
	await ticks(w,4)
	check(out,w.stage==5 and w.sons.size()==8 and w.sons.all(func(a):return a.visible),"ending skip restores all eight children and a completed playable chapter")
	w.save_story();w.load_story();await ticks(w,4)
	var old_hash=FileAccess.get_sha256("user://shanghai-prologue-v1.json") if FileAccess.file_exists("user://shanghai-prologue-v1.json") else ""
	check(out,w.stage==5 and is_equal_approx(w.race_best,best) and old_hash==prologue_hash,"completed chapter persists without changing the prologue slot")
	check(out,FileAccess.get_sha256("res://assets/original_dolphin.json")=="7333d7666dd647f9fd858b7001bce2821705b9f6134425b0f399faacc451a08e","original hero geometry remains byte-identical")
	await load("res://scripts/landmark_checks.gd").run_sides(w,out)
	await load("res://scripts/talent_checks.gd").run(w,out)
	w.call_deferred("_test_report",out)
