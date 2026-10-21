class_name PolishChecks
extends RefCounted

static func reset_person(a: StreetActor,p: Vector3):
	a.position=p;a.home=p;a.velocity=Vector3.ZERO;a.hp=100;a.max_hp=100;a.stun=0;a.immunity=0;a.knockdown=0;a.fall_amount=0;a.panic=0;a.traffic_evade=0;a.traffic_scan=0;a.impulse=Vector3.ZERO;a.attack=-1;a.queued="";a.rotation=Vector3.ZERO;a.collision_layer=2;a.collision_mask=7;a.path=[];a.recovery_wait=false

static func picture(w: Node3D,out: String,name: String,eye: Vector3,target: Vector3):
	if out=="":return
	w.paused=true;w.hud.photo=true;w.camera.position=eye;w.camera.look_at(target);await w._shot(out+"/"+name+".png");w.paused=false

static func run(w: Node3D,checks: Array):
	w.fixed_camera=true;var out="";var args=OS.get_cmdline_user_args()
	for i in range(args.size()-1):
		if args[i]=="--capture-output":out=args[i+1];DirAccess.make_dir_recursive_absolute(out)
	for a in w.people:a.frozen=true;a.collision_layer=0;a.collision_mask=0
	for c in w.cars:c.speed=0;c.driver=null;c.position=Vector3(210,.1,145+w.cars.find(c)*7);c.collision_layer=0
	var person=w.people[6];var car=w.cars[0]
	# Real melee from opposite sides should bend the torso away from the blow.
	for sign_value in [1,-1]:
		GameplayChecks.reset_hero(w,Vector3(-40,.05,70));w.player.rotation.y=PI/2 if sign_value==1 else -PI/2
		reset_person(person,Vector3(-40+sign_value*1.5,.05,70));person.frozen=true;await w._ticks(4);w.player.strike("heavy");await w._ticks(27);person.pose()
		var lean=person.body.global_basis.y;checks.append([person.hp<100 and lean.x*sign_value>.2,"melee stagger follows impact from left" if sign_value==1 else "melee stagger follows impact from right"])
		print("DIRECTIONAL_STAGGER ",sign_value," hp=",person.hp," lean=",lean)
		if sign_value==1:await picture(w,out,"01-directed-stagger",Vector3(-43,2.2,74.5),Vector3(-39,1.1,70))
	# A close, occluded target must not steal aim from a reachable person beside it.
	GameplayChecks.reset_hero(w,Vector3(-40,.05,70));w.player.rotation.y=PI/2;reset_person(person,Vector3(-38.6,.05,70));person.frozen=true
	var visible=w.people[7];reset_person(visible,Vector3(-38.7,.05,71.1));visible.frozen=true
	var wall=ToonKit.solid(w,Vector3(.12,3,.5),Vector3(-39.2,1.5,70));await w._ticks(4);w.player.strike("heavy");await w._ticks(30)
	checks.append([visible.hp<100 and person.hp==100 and w.hud.target==visible,"melee aims at visible reachable target instead of person behind wall"]);print("OCCLUDED_AIM ",person.hp," ",visible.hp);wall.queue_free();visible.collision_layer=0;person.collision_layer=0;await w._ticks(2)
	# Drive into a late-reacting person, then exercise the complete fall/recovery.
	car.position=Vector3(0,.05,70);car.rotation=Vector3.ZERO;car.velocity=Vector3.ZERO;car.steer=0;car.speed=0;car.collision_layer=4;car.driver=w.player;w.player.vehicle=car;w.player.collision_layer=0;w.player.collision_mask=0
	reset_person(person,Vector3(0,.05,82));person.frozen=true;var contact=-1
	Input.action_press("forward")
	for tick in range(190):
		await w._ticks(1)
		if person.hp<100 and contact<0:contact=tick;person.frozen=false
		if contact>=0 and tick-contact>42:break
	Input.action_release("forward");car.speed=0;car.velocity=Vector3.ZERO
	var falling=person.body.to_global(Vector3(0,1.7,0))-person.body.global_position
	checks.append([person.hp<100 and falling.z>.9,"car impact falls in the direction of travel"])
	var torso_height=person.body.to_global(Vector3(0,1.22,0)).y-person.position.y
	checks.append([absf(person.floor_clearance()-.025)<.025 and torso_height<.35,"fallen torso settles onto ground instead of remaining in push-up pose"]);print("FALL_SUPPORT ",person.floor_clearance()," torso_height=",torso_height," direction=",falling)
	await picture(w,out,"02-grounded-fall",Vector3(-6.8,2.4,88),Vector3(0,.65,84.6))
	# A stationary car above the standing volume must delay getting up.
	car.position=Vector3(person.position.x,.025,person.position.z+.2);car.speed=0;car.velocity=Vector3.ZERO;await w._ticks(150)
	checks.append([person.knockdown>.45 and person.fall_amount>.95 and person.collision_layer==0,"pedestrian stays down while parked car blocks recovery"])
	print("BLOCKED_RECOVERY ",person.knockdown," ",person.fall_amount," ",person.can_stand())
	Input.action_press("forward");var brace_shown=false;var moved_clear=false
	for i in range(600):
		await w._ticks(1)
		if not moved_clear and car.position.distance_to(person.position)>9:Input.action_release("forward");car.speed=0;moved_clear=true
		if not brace_shown and person.fall_amount>.35 and person.fall_amount<.7 and person.knockdown<.45:
			brace_shown=true;await picture(w,out,"03-braced-getup",Vector3(-6,1.7,87),Vector3(0,.9,84.3))
		if brace_shown and person.knockdown<=0 and person.fall_amount<.01:break
	Input.action_release("forward");car.speed=0
	checks.append([brace_shown and person.knockdown<=0 and person.fall_amount<.01 and person.collision_layer==2,"person braces, gets up, then restores standing collision after car moves"])
	person.frozen=true;car.driver=null;w.player.vehicle=null;car.position=Vector3(210,.1,145);car.collision_layer=0
	# Active pedestrians can move aside before an approaching vehicle reaches them.
	for reverse in [false,true]:
		var sign_value=-1 if reverse else 1;car.position=Vector3(-15,.05,70);car.rotation=Vector3.ZERO;car.velocity=Vector3.ZERO;car.steer=0;car.speed=0;car.collision_layer=4;car.driver=w.player;w.player.vehicle=car;w.player.collision_layer=0;w.player.collision_mask=0
		reset_person(person,Vector3(-15,.05,70+sign_value*16));person.frozen=false;var warned=false;var shot=false;var action="back" if reverse else "forward";Input.action_press(action)
		for i in range(205):
			await w._ticks(1)
			if person.traffic_evade>0:warned=true
			if not reverse and not shot and absf(person.position.x+15)>1.5 and person.traffic_evade>0:
				shot=true;await picture(w,out,"04-step-away-from-car",Vector3(-22,2.6,90),Vector3(-15,1.0,83.0))
		Input.action_release(action);checks.append([warned and person.hp==100 and absf(person.position.x+15)>1.6 and (car.position.z-person.position.z)*sign_value>2,"pedestrian notices reversing car and evades without damage" if reverse else "pedestrian notices approaching car and evades without damage"])
		print("TRAFFIC_EVADE ",reverse," hp=",person.hp," position=",person.position," car=",car.position)
		person.frozen=true;car.driver=null;car.speed=0;w.player.vehicle=null;car.position=Vector3(210,.1,145);car.collision_layer=0
	GameplayChecks.reset_hero(w,Vector3(-45,.05,70));reset_person(person,Vector3(-40,.05,70));person.frozen=false;car.position=Vector3(-40,.05,73);car.speed=0;await w._ticks(45)
	checks.append([person.traffic_evade==0 and person.panic==0 and person.hp==100,"parked cars do not repeatedly frighten pedestrians"])
	person.frozen=true;car.position=Vector3(210,.1,145)
