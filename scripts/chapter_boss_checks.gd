extends RefCounted
static func ticks(w,n: int):
	for i in range(n):await w.get_tree().physics_frame
static func check(out: Array,value: bool,label: String):out.append([value,label]);print("CHECK ",value," ",label)
static func run(w,out: Array):
	var b=w.boss
	check(out,w.director.kind=="boss_intro" and b is ChapterBoss and b.body.name=="ShenTieChuanBody" and b.face.role=="shen" and b.max_hp==560,"evacuation leads to a separately modeled named chapter boss rather than completing the chapter")
	w.director.elapsed=w.director.title_begin+.3;w.director.current=-1;w.director.tick(0)
	var p=b.position;var time=w.director.elapsed;w._key(KEY_ESCAPE);await ticks(w,5)
	check(out,w.pause_menu and w.director.elapsed==time and b.position==p and w.director.caption.contains("铁闸"),"boss title interval and actors pause together before control is returned")
	w._key(KEY_ESCAPE);w._key(KEY_TAB);await ticks(w,3)
	check(out,w.stage==4 and w.boss_state==2 and not w.paused and not b.frozen,"skipping the boss entrance starts the same real duel without awarding chapter completion")
	# Stationary targets here isolate actual timed attack contact and defensive mitigation.
	w.player.position=ChapterBoss.ARENA+Vector3(0,0,1.65);b.position=ChapterBoss.ARENA;w.player.velocity=Vector3.ZERO;w.player.impulse=Vector3.ZERO;w.player.stun=0;w.player.immunity=0;w.player.rotation.y=PI;w.player.hp=w.player.max_hp;b.move_time=-1;b.stun=0;b.recovery=0;b.begin_move("combo")
	var before=w.player.hp;await ticks(w,125);var exposed=before-w.player.hp
	check(out,exposed>=25 and b.recovery>0,"boss triple combination deals timed physical damage and ends in a punish window")
	w.player.position=ChapterBoss.ARENA+Vector3(0,0,1.65);b.position=ChapterBoss.ARENA;w.player.hp=w.player.max_hp;w.player.stun=0;w.player.immunity=0;w.player.impulse=Vector3.ZERO;w.player.rotation.y=PI;b.move_time=-1;b.recovery=0;Input.action_press("guard");b.begin_move("combo");before=w.player.hp;await ticks(w,125);Input.action_release("guard")
	check(out,before-w.player.hp<exposed and before>w.player.hp,"normal frontal guard meaningfully reduces the boss combination instead of making it harmless")
	w.player.position=ChapterBoss.ARENA+Vector3(0,0,5);w.player.hp=w.player.max_hp;w.player.immunity=0;w.player.stun=0;w.player.impulse=Vector3.ZERO;b.position=ChapterBoss.ARENA;b.recovery=0;b.move_time=-1;b.begin_move("shoulder");await ticks(w,45);w.yaw=PI;Input.action_press("right");w.dodge();Input.action_release("right");await ticks(w,59)
	check(out,w.player.hp==w.player.max_hp and b.recovery>.7,"telegraphed shoulder can be side-dodged through the ordinary dodge input and exposes recovery")
	# Actual melee, not direct mutation, establishes the damage route against the custom boss.
	b.recovery=2;b.stun=0;b.immunity=0;w.player.position=b.position+Vector3(0,0,1.4);w.player.stun=0;w.player.impulse=Vector3.ZERO;w.player.attack=-1;w.player.rotation.y=PI;w.yaw=PI;before=b.hp;w._key(KEY_R);await ticks(w,45)
	check(out,b.hp<before-20,"a normal heavy strike physically connects with the boss during recovery")
	b.hp=b.max_hp*.49;b.move_time=-1;b.recovery=0;b.stun=0;await ticks(w,2);b.begin_move("shoulder");await ticks(w,138)
	check(out,b.phase==2 and b.move_time>2.1 and Vector2(b.velocity.x,b.velocity.z).length()>8,"half health changes the move set to a genuinely moving second shoulder rather than refilling health")
	w._clear_input();b.move_time=-1;b.recovery=2;w.save_story();var health=b.hp;w.load_story();await ticks(w,3);b=w.boss
	check(out,w.boss_state==2 and b.phase==2 and absf(b.hp-health)<.1 and w.staff.all(func(a):return a.evacuated),"boss checkpoint restores health and phase without replaying the civilian evacuation")
	w.player.hp=0
	for i in range(30):
		await ticks(w,1)
		if w.failed_reason!="":break
	w._key(KEY_E);await ticks(w,3);if w.director.active():w._key(KEY_TAB)
	await ticks(w,3);b=w.boss
	check(out,w.failed_reason=="" and w.boss_state==2 and b.hp==b.max_hp and w.staff.all(func(a):return a.evacuated),"boss defeat offers a direct full-health duel retry while preserving the completed evacuation")
	w.bark_queue=[];w.bark_text="";w.voice.stop()
	var won=false
	for i in range(4500):
		if w.failed_reason!="":break
		if w.director.kind=="boss_outro":won=true;break
		var delta=b.position-w.player.position;delta.y=0;w.yaw=atan2(delta.x,delta.z);w.player.rotation.y=w.yaw
		Input.action_release("forward");Input.action_release("guard")
		if delta.length()>1.65:Input.action_press("forward")
		else:
			Input.action_press("guard")
			if w.player.attack<0:w._key(KEY_Q if w.player.heat>=60 else KEY_R)
		if b.move_name=="shoulder" and b.move_time>.5 and b.move_time<.95:
			Input.action_press("right");w.dodge();Input.action_release("right")
		if w.player.hp<60 and w.medicine>0:w._key(KEY_1)
		await ticks(w,1)
	w._clear_input()
	check(out,won and b.hp==0 and w.stage==4,"ordinary movement, guard, heavy attacks and medicine can win the full named boss duel")
	if won:w._key(KEY_TAB);await ticks(w,3)
	check(out,won and w.director.kind=="ending" and w.boss_state==3,"boss aftermath hands over to the birthday table ending only after victory")
