extends RefCounted

static func ticks(w,n: int):
	for i in range(n):await w.get_tree().physics_frame
static func check(out: Array,passed: bool,label: String):out.append([passed,label]);print("CHECK ",passed," ",label)
static func place(w,p: Vector3):w.player.position=p+Vector3.UP*.12;w.player.velocity=Vector3.ZERO;w.player.impulse=Vector3.ZERO;await ticks(w,4)
static func ride(w,key: String):w.quests.ride(key);await ticks(w,105)
static func run_main(w,out: Array):
	var q=w.quests;var old=w.player.position
	check(out,q.states.size()==4 and q.spaces.size()==4 and not q.main_done(),"journal has one required outing and three independent landmark side quests")
	q.key(KEY_J);var t=q.clock;await ticks(w,5);check(out,w.paused and q.journal and q.clock==t,"task journal freezes the playable world")
	q.selection=2;q.key(KEY_ENTER);check(out,q.tracked=="jinmao" and not w.paused,"journal tracking chooses an actual entrance without starting or completing a quest")
	q.tracked="";await place(w,LandmarkSet.DATA.shanghai.entry+Vector3(0,0,6))
	var reachable=await load("res://scripts/chapter1_checks.gd").walk(w,LandmarkSet.DATA.shanghai.entry,150)
	check(out,reachable and w.nearest_hotspot().get("id","")=="lift:shanghai","tower lobby has a usable automatic doorway and reachable elevator control")
	w._key(KEY_E);await ticks(w,10);w._key(KEY_ESCAPE);t=q.travel;await ticks(w,8)
	check(out,q.travel==t and w.pause_menu,"pause holds elevator transition before relocation")
	w._key(KEY_ESCAPE);await ticks(w,105)
	check(out,q.inside=="shanghai" and w.player.position.y>150 and w.player.is_on_floor(),"elevator reaches a supported high floor in the real city")
	if q.inside!="shanghai":return
	check(out,w.sons.all(func(a):return a.visible and a.position.y>150),"all eight original-geometry sons actually accompany the tower outing")
	var qpos=w.player.position;w.save_story();w.load_story();await ticks(w,5)
	check(out,q.inside=="shanghai" and w.player.position.distance_to(qpos)<.5 and w.player.is_on_floor(),"checkpoint restores the correct high floor and eight-child outing")
	var bad=q.safe_floor([999,158,999]);check(out,bad.distance_to(LandmarkSet.DATA.shanghai.floor)<7,"malformed high-floor location cannot put a saved hero outside the shell")
	q.interact("scope:0");w.yaw+=1;w._follow(1);q.shoot();check(out,q.photos.is_empty() and q.aim==0,"misaligned camera cannot count a landmark photograph")
	for i in range(3):
		await place(w,LandmarkSet.DATA.shanghai.floor+[Vector3(-6,0,-5),Vector3(6,0,-5),Vector3(-6,0,4)][i]);q.interact("scope:"+str(i))
		var d=q.VIEWS[i]-(w.player.position+Vector3.UP*1.7);w.yaw=atan2(d.x,d.z);w.pitch=atan2(-d.y,Vector2(d.x,d.z).length());w._follow(1);q.shoot()
	check(out,q.photos.size()==3 and q.aim<0,"real camera aiming records three distinct city views")
	var cash=w.money;q.interact("family_photo");q.interact("family_photo")
	check(out,q.main_done() and w.money==cash+200,"family photograph completes the main outing and reward cannot be farmed")
	await ticks(w,140)
	await ride(w,"");check(out,q.inside=="" and w.player.position.y<1 and w.sons.all(func(a):return a.position.y<1),"downward elevator restores the street and family placements")
	q.tracked="";await place(w,old);w.save_story()

static func run_sides(w,out: Array):
	var q=w.quests;var old=w.player.position;var stage=w.stage
	await place(w,LandmarkSet.DATA.pearl.entry);await ride(w,"pearl")
	check(out,w.player.is_on_floor() and q.inside=="pearl" and w.player.position.y>70,"Oriental Pearl side quest has a physically supported upper room")
	q.interact("rhythm");q.rhythm_time=3.3;q.key(KEY_2)
	check(out,q.notes.is_empty() and q.states.pearl==1,"wrong musical input replays the phrase without granting completion")
	q.rhythm_time=3.3
	for note in q.pattern:q.key(KEY_1+note)
	check(out,q.states.pearl==2 and not q.rhythm,"four remembered notes complete the Pearl side quest")
	await ride(w,"");await ride(w,"jinmao");q.interact("parkour")
	var supported=true
	await place(w,LandmarkSet.DATA.jinmao.floor+Vector3(-5,0,4))
	for i in range(8):
		var target=LandmarkSet.DATA.jinmao.floor+LandmarkSet.parkour_point(i)
		for frame in range(240):
			var delta=target-w.player.position;delta.y=0;w.yaw=atan2(delta.x,delta.z)
			if delta.length()>.3:Input.action_press("forward")
			else:Input.action_release("forward")
			if w.player.is_on_floor() and w.player.position.y<target.y-.15:w._key(KEY_SPACE)
			await ticks(w,1)
			if q.checkpoint>i:break
		Input.action_release("forward");supported=supported and q.checkpoint>i
	check(out,supported and q.states.jinmao==2 and q.best>0,"Jinmao's eight ascending physical platforms record a completed courier time")
	await ride(w,"");await ride(w,"luo");q.interact("luo_start");q.clock=0
	await place(w,LandmarkSet.DATA.luo.floor+Vector3(0,0,2.2));q.clock=0;await ticks(w,2)
	check(out,q.alarms>0 and q.states.luo==1,"LUO live training beam detects an exposed former employee")
	q.alarm=0;q.clock=0;w.player.crouch=true;var count=q.alarms;await ticks(w,3)
	check(out,q.alarms==count,"crouching provides a real alternative to waiting for security timing")
	var walk_ok=await load("res://scripts/chapter1_checks.gd").walk(w,LandmarkSet.DATA.luo.floor+Vector3(0,0,-5));w._key(KEY_E)
	check(out,walk_ok and q.states.luo==1 and q.returning,"taking the LUO keepsake still requires returning through the training floor")
	await load("res://scripts/chapter1_checks.gd").walk(w,LandmarkSet.DATA.luo.floor+Vector3(0,0,4.4));w.player.crouch=false;await ticks(w,4)
	check(out,q.states.luo==2 and not q.running and w.stage==stage,"LUO return completes an independent side quest without advancing chapter stages")
	var cash=w.money;w.save_story();w.load_story();await ticks(w,4);q.complete("luo")
	check(out,q.states.values().all(func(v):return v==2) and w.money==cash,"all landmark quests and one-time rewards survive save/load independently")
	await ride(w,"");q.tracked="";await place(w,old);w.save_story()
