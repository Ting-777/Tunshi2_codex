class_name GameplayChecks
extends RefCounted

static func walk(w: Node3D,target: Vector3,limit: int=700) -> bool:
	var arrived=false
	for i in range(limit):
		var delta=target-w.player.position;delta.y=0
		if delta.length()<.32:arrived=true;break
		w.yaw=atan2(delta.x,delta.z);Input.action_press("forward")
		await w.get_tree().physics_frame
	Input.action_release("forward");await w._ticks(5)
	return arrived

static func reset_hero(w: Node3D,p: Vector3):
	w.player.position=p;w.player.velocity=Vector3.ZERO;w.player.stun=0;w.player.immunity=0;w.player.knockdown=0;w.player.attack=-1;w.player.queued="";w.player.dodge_time=0;w.player.hp=100;w.player.collision_layer=2;w.player.collision_mask=7;w.player.vehicle=null;w.player.visible=true
	w.player.impulse=Vector3.ZERO;w.player.fall_amount=0;w.player.crouch=false

static func run(w: Node3D,checks: Array,shots: String=""):
	w.fixed_camera=true
	var quick="--test-native-fast" in OS.get_cmdline_user_args()
	if shots=="":
		var args=OS.get_cmdline_user_args()
		for i in range(args.size()-1):
			if args[i]=="--capture-output":shots=args[i+1];DirAccess.make_dir_recursive_absolute(shots)
	for actor in w.people:actor.frozen=true;actor.collision_layer=0;actor.collision_mask=0
	for car in w.cars:car.speed=0;car.velocity=Vector3.ZERO;car.position=Vector3(210,.2,145+w.cars.find(car)*7);car.collision_layer=0
	# All four approaches must work with ordinary walking and no jump action.
	for i in range(1 if quick else w.city.bridge_routes.size()):
		var route=w.city.bridge_routes[i];reset_hero(w,route.foot+Vector3.UP*.08);await w._ticks(15)
		var up=await walk(w,route.top);print("RAMP_TOP ",i," ",up," ",w.player.position);up=(await walk(w,route.landing,100)) and up;up=(await walk(w,route.portal,150)) and up
		checks.append([up and w.player.position.y>5.55 and w.player.is_on_floor(),"bridge %d ascent without jumping"%i]);print("BRIDGE_ASCEND ",i," ",w.player.position," ",up)
		if i==0 and shots!="":
			w.paused=true;w.hud.photo=true;w.camera.position=Vector3(-36,11,40);w.camera.look_at(Vector3(-8,4,18));await w._shot(shots+"/01-bridge-connected.png");w.paused=false
		var down=await walk(w,route.landing,150);down=(await walk(w,route.top,100)) and down;down=(await walk(w,route.foot,700)) and down
		checks.append([down and absf(w.player.position.y)<.25,"bridge %d descent to flush ground"%i]);print("BRIDGE_DESCEND ",i," ",w.player.position," ",down)
	# Walk the entire annulus with the actual controller, including all former slab seams.
	if not quick:
		reset_hero(w,Vector3(0,5.68,17));await w._ticks(12);var loop=true
		for i in range(1,65):
			var a=TAU*i/64;loop=(await walk(w,Vector3(sin(a)*27,5.64,cos(a)*27-10),90)) and loop
			if w.player.position.y<5.4:loop=false;break
		checks.append([loop and w.player.is_on_floor(),"complete footbridge loop has continuous support"]);print("BRIDGE_LOOP ",loop," ",w.player.position)
	var angle=.63;var radial=Vector3(sin(angle),0,cos(angle));reset_hero(w,radial*27+Vector3(0,5.7,-10));await w._ticks(10)
	w.yaw=angle;Input.action_press("forward");await w._ticks(65);Input.action_release("forward");checks.append([Vector2(w.player.position.x,w.player.position.z+10).length()<29.5 and w.player.position.y>5.4,"outer railing physically prevents a fall"])
	w.yaw=angle+PI;Input.action_press("forward");await w._ticks(100);Input.action_release("forward");checks.append([Vector2(w.player.position.x,w.player.position.z+10).length()>24.6 and w.player.position.y>5.4,"inner railing physically prevents a fall"])
	if shots!="":
		w.paused=true;w.camera.position=Vector3(48,17,30);w.camera.look_at(Vector3(10,4,-7));await w._shot(shots+"/02-open-landing-rails.png");w.paused=false
	if "--test-bridge-only" in OS.get_cmdline_user_args():return
	# Crossing both edges of every road must not snag the car on an invisible base.
	var fixtures=[
		[Vector3(-60,.06,17),Vector3.FORWARD*-1,42.0],
		[Vector3(-116,.06,-250),Vector3.RIGHT,42.0],
		[Vector3(138,.06,100.8)-Vector3(-.558,0,.830)*23,Vector3(-.558,0,.830),46.0],
		[Vector3(68,.06,-210),Vector3.RIGHT,44.0],
		[Vector3(145,.06,-143),Vector3.BACK,46.0],
		[Vector3(170,.06,85),Vector3.BACK,46.0],
		[Vector3(-147,.06,-240),Vector3.LEFT,15.0],
		[Vector3(150,.06,-195),Vector3.RIGHT,40.0]]
	var car=w.cars[0];car.collision_layer=4;car.driver=w.player;w.player.vehicle=car;w.player.collision_layer=0;w.player.collision_mask=0
	for i in range(fixtures.size()):
		if quick and i not in [0,6,7]:continue
		var f=fixtures[i];car.position=f[0];car.rotation=Vector3(0,atan2(f[1].x,f[1].z),0);car.speed=0;car.velocity=Vector3.ZERO;car.steer=0
		Input.action_press("forward");await w._ticks(180 if i==6 else 240);Input.action_release("forward");var travelled=(car.position-f[0]).dot(f[1]);checks.append([travelled>f[2] and absf(car.rotation.x)<.01 and absf(car.rotation.z)<.01,"car enters riverside promenade freely" if i==6 else "car crosses open lawn freely" if i==7 else "car freely crosses road %d and both sidewalks"%i]);print("ROAD_CROSS ",i," ",travelled," ",car.position)
	car.speed=0;car.driver=null;w.player.vehicle=null
	# The same freedom must not disable collision with real buildings.
	car.position=Vector3(0,.05,70);car.rotation=Vector3.ZERO;car.velocity=Vector3.ZERO;car.driver=w.player;w.player.vehicle=car
	var wall=ToonKit.solid(w,Vector3(8,3,.6),Vector3(0,1.5,84));await w._ticks(2);Input.action_press("forward");await w._ticks(160);Input.action_release("forward");print("SOLID_WALL ",car.position," speed=",car.speed);checks.append([car.position.z<82 and car.speed<3,"visible solid obstacles still stop vehicles"]);wall.queue_free();car.driver=null;car.speed=0;car.position=Vector3(210,.2,145);car.collision_layer=0
	reset_hero(w,Vector3(-40,.05,70));w.player.rotation.y=PI/2;var civilian=w.people[6];civilian.hp=100;civilian.max_hp=100;civilian.immunity=0;civilian.knockdown=0;civilian.stun=0;civilian.panic=0;civilian.position=Vector3(-38.5,.05,70);civilian.velocity=Vector3.ZERO;civilian.collision_layer=2;civilian.collision_mask=1
	await w._ticks(3);w.player.strike("heavy");await w._ticks(30);checks.append([civilian.hp<100 and w.hud.target==civilian,"ordinary pedestrian takes real animated melee contact"])
	if shots!="":
		civilian.pose();w.paused=true;w.hud.photo=true;w.camera.position=Vector3(-44,2.8,75);w.camera.look_at(Vector3(-39,1,70));await w._shot(shots+"/03-pedestrian-contact.png");w.paused=false
	civilian.frozen=false;var separation=civilian.position.distance_to(w.player.position);await w._ticks(110);print("FLEE ",separation," -> ",civilian.position.distance_to(w.player.position)," stun=",civilian.stun," pos=",civilian.position);checks.append([civilian.panic>0 and civilian.position.distance_to(w.player.position)>separation+3,"struck pedestrian retreats and flees"]);civilian.frozen=true
	# Drive through a standing pedestrian; actual sweep, damage and reaction, not a hurt() fixture.
	for reverse in [false,true]:
		var sign_value=-1 if reverse else 1;car.collision_layer=4;car.position=Vector3(0,.05,70);car.rotation=Vector3.ZERO;car.speed=0;car.steer=0;car.velocity=Vector3.ZERO;car.driver=w.player;w.player.vehicle=car;w.player.collision_layer=0;w.player.collision_mask=0
		civilian.position=Vector3(0,.05,70+sign_value*12);civilian.frozen=true;civilian.hp=100;civilian.stun=0;civilian.immunity=0;civilian.knockdown=0;civilian.panic=0;civilian.impulse=Vector3.ZERO;civilian.collision_layer=2;civilian.collision_mask=1;civilian.velocity=Vector3.ZERO
		var action="back" if reverse else "forward";var contact_tick=-1;Input.action_press(action)
		for tick in range(180):
			await w._ticks(1)
			if civilian.hp<100 and contact_tick<0:contact_tick=tick;civilian.frozen=false
			if not reverse and shots!="" and tick==contact_tick+18 and contact_tick>=0:
				w.paused=true;w.hud.photo=true;w.camera.position=Vector3(8,3.8,87);w.camera.look_at(Vector3(0,1,83));await w._shot(shots+"/04-car-knockdown.png");w.paused=false
		Input.action_release(action);civilian.frozen=true
		checks.append([civilian.hp<100 and civilian.knockdown>0,"reverse car knocks pedestrian down" if reverse else "forward car knocks pedestrian down"])
		checks.append([(car.position.z-civilian.position.z)*sign_value>2 and (civilian.position.z-(70+sign_value*12))*sign_value>.1 and absf(civilian.position.z-(70+sign_value*12))<6,"reverse impact uses travel direction and car continues" if reverse else "forward impact uses travel direction and car continues"]);print("CAR_PERSON ",reverse," HP=",civilian.hp," DOWN=",civilian.knockdown," car=",car.position," person=",civilian.position)
		car.speed=0;car.driver=null;w.player.vehicle=null;car.collision_layer=0;car.position=Vector3(210,.2,145)
	reset_hero(w,Vector3(-5,.05,58));civilian.frozen=false;await w._ticks(120);checks.append([civilian.hp>0 and civilian.knockdown>0,"vehicle injury keeps surviving pedestrian down beyond two seconds"])
	for i in range(600):
		if civilian.knockdown<=0 and civilian.fall_amount<.01:break
		await w._ticks(1)
	checks.append([civilian.hp>0 and civilian.knockdown<=0 and civilian.collision_layer==2,"surviving civilian gets up and restores collision"])
	civilian.frozen=true;civilian.hp=10;civilian.immunity=0;civilian.knockdown=0;civilian.position=Vector3(-3.5,.05,58);w.player.rotation.y=PI/2;w.player.attack=-1;w.player.stun=0;var cash_drops=w.drops.size();w.player.strike("heavy");await w._ticks(35);checks.append([civilian.hp==0 and w.drops.size()==cash_drops,"downed civilian does not create enemy cash loot"])
	if shots!="":
		w.paused=true;w.hud.photo=true;w.camera.position=Vector3(-47,3,62);w.camera.look_at(Vector3(3,4,2));await w._shot(shots+"/05-road-and-bridge.png");w.paused=false
