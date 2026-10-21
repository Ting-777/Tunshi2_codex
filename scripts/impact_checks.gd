class_name ImpactChecks
extends RefCounted

static func prepare(w: Node3D,p: Vector3=Vector3(-40,.05,70),angle: float=0.0):
	for action in ["forward","back","left","right","jump","guard"]:Input.action_release(action)
	w.paused=false;w.hud.menu=false;w.hud.photo=false;w.hud.map_open=false;w.fixed_camera=true;w.freeze_to=0;Engine.time_scale=1
	for a in w.people:a.frozen=true;a.hp=100;a.knockdown=0;a.fall_amount=0;a.vehicle=null;a.collision_layer=0;a.collision_mask=0;a._sync_vehicle_hurtbox()
	for c in w.cars:c.driver=null;c.speed=0;c.steer=0;c.hp=c.max_hp;c.velocity=Vector3.ZERO;c.position=Vector3(210,.05,145+w.cars.find(c)*7);c.collision_layer=0;c.collision_cooldowns.clear();c.pedestrian_contacts.clear();c.last_damage=0;c.last_impact_speed=0
	GameplayChecks.reset_hero(w,p);var car=w.cars[0];car.position=p;car.rotation=Vector3(0,angle,0);car.collision_layer=4
	await w._ticks(4);car.driver=w.player;w.player.vehicle=car;w.player.collision_layer=0;w.player.collision_mask=0;w.player.visible=false
	return car

static func drive_to_damage(w: Node3D,car: StreetCar,limit: int=200):
	Input.action_press("forward")
	for i in range(limit):
		await w._ticks(1)
		if car.last_damage>0:break
	Input.action_release("forward")

static func run(w: Node3D,checks: Array):
	var out="";var args=OS.get_cmdline_user_args()
	for i in range(args.size()-1):
		if args[i]=="--capture-output":out=args[i+1];DirAccess.make_dir_recursive_absolute(out)
	if "--no-capture" in args:out=""
	var car=await prepare(w);var wall=VehicleChecks.obstacle(w,Vector3(9,3,.4),Vector3(-40,1.5,77));await w._ticks(3);car.speed=6
	await drive_to_damage(w,car);var low_damage=car.max_hp-car.hp;var low_injury=100-w.player.hp
	checks.append([low_damage>0 and car.last_impact_speed>2,"real low-speed wall contact damages vehicle"])
	wall.queue_free();await w._ticks(2)
	car=await prepare(w);wall=VehicleChecks.obstacle(w,Vector3(9,3,.4),Vector3(-40,1.5,77));await w._ticks(3);car.speed=22;w.player.immunity=5;Input.action_press("guard")
	await drive_to_damage(w,car);Input.action_release("guard")
	var high_damage=car.max_hp-car.hp;var high_injury=100-w.player.hp
	checks.append([high_damage>low_damage*2 and high_injury>low_injury+10,"fast impact causes more vehicle and occupant damage than slow impact"])
	checks.append([high_injury>0 and w.player.vehicle==car,"seated hero takes crash injury despite melee immunity and held guard"])
	print("WALL_DAMAGE low=",low_damage,"/",low_injury," high=",high_damage,"/",high_injury," delta_v=",car.last_impact_speed)
	await VehicleChecks.picture(w,out,"01-car-and-occupant-damage",Vector3(-32,4.2,73),Vector3(-40,1.1,74.5))
	var parked_hp=car.hp;var driver_hp=w.player.hp;Input.action_press("forward");await w._ticks(100);Input.action_release("forward")
	checks.append([absf(car.hp-parked_hp)<.01 and absf(w.player.hp-driver_hp)<.01,"holding throttle against wall does not repeatedly drain health"])
	wall.queue_free();await w._ticks(2)
	car=await prepare(w,Vector3(-40,.05,70),.1);wall=VehicleChecks.obstacle(w,Vector3(.2,3,100),Vector3(-37.7,1.5,95));await w._ticks(3);car.speed=20;Input.action_press("forward");await w._ticks(80);Input.action_release("forward")
	checks.append([car.max_hp-car.hp<high_damage*.15 and car.position.z>80,"glancing collision uses normal closing speed instead of full driving speed"]);print("GLANCING_DAMAGE ",car.max_hp-car.hp," at ",car.position)
	wall.queue_free();await w._ticks(2)
	car=await prepare(w);var other=w.cars[1];other.position=Vector3(-40,.05,82);other.rotation=Vector3(0,PI,0);other.collision_layer=4;other.speed=14;car.speed=14
	await drive_to_damage(w,car,90)
	checks.append([car.hp<car.max_hp and other.hp<other.max_hp and car.last_impact_speed>10,"oncoming cars use relative speed and damage both vehicles"]);print("CAR_V_CAR ",car.hp," ",other.hp," delta_v=",car.last_impact_speed)
	var oncoming_damage=car.max_hp-car.hp
	car=await prepare(w);other=w.cars[1];other.position=Vector3(-40,.05,82);other.rotation=Vector3.ZERO;other.collision_layer=4;other.speed=14;car.speed=22
	await drive_to_damage(w,car,150)
	checks.append([car.last_damage>0 and car.max_hp-car.hp<oncoming_damage,"rear-end collision with moving car is milder than oncoming collision"]);print("REAR_END_DAMAGE ",car.max_hp-car.hp," delta_v=",car.last_impact_speed)
	car=await prepare(w);car.hp=0;var origin=car.position;Input.action_press("forward");await w._ticks(60);Input.action_release("forward")
	checks.append([car.position.distance_to(origin)<.1 and absf(car.speed)<.1,"zero-health car loses engine power"])
	w._key(KEY_E);await w._ticks(5);checks.append([w.player.vehicle==null and w.player.visible,"hero can leave disabled car safely"])
	car=await prepare(w);car.hp=69;w.player.hp=64;w.save_game(false);car.hp=180;w.player.hp=100;w.load_game(false)
	checks.append([absf(car.hp-69)<.01 and absf(w.player.hp-64)<.01,"vehicle damage and occupant health survive save and load"])
	car=await prepare(w);wall=VehicleChecks.obstacle(w,Vector3(9,3,.4),Vector3(-40,1.5,77));await w._ticks(3);car.speed=25;w.player.hp=1
	await drive_to_damage(w,car);await w._ticks(8)
	checks.append([w.player.vehicle==null and car.driver==null and w.player.visible and w.player.collision_layer==2 and w.player.position.distance_to(w.player.home)<1,"fatal occupant crash respawns hero on foot without remaining attached to car"])
	wall.queue_free();await w._ticks(2)
	# Standing and fallen people both remain real, separately swept vehicle targets.
	car=await prepare(w);var person=w.people[6];PolishChecks.reset_person(person,Vector3(-40,.05,82));person.frozen=true;Input.action_press("forward")
	var contact=false
	for i in range(190):
		await w._ticks(1)
		if person.hp<100:contact=true;break
	Input.action_release("forward");car.speed=0;car.velocity=Vector3.ZERO;person.frozen=false
	checks.append([contact and person.hp<100 and w.hud.target==person,"driving hit reduces pedestrian health and shows actual target health bar"])
	var injury_hp=person.hp;await w._ticks(120)
	checks.append([person.hp==injury_hp and person.knockdown>0 and person.fall_amount>.95 and person.collision_layer==0 and w.hud.target_time>0,"injured pedestrian remains down two seconds after impact with readable health feedback"])
	print("PERSON_INJURY hp=",person.hp," down=",person.knockdown," position=",person.position)
	await VehicleChecks.picture(w,out,"02-injured-pedestrian-stays-down",Vector3(-46,2.5,88),Vector3(-40,.7,83))
	person.frozen=true;person.pose();var fallen=person.vehicle_hurtbox.global_position;car.position=Vector3(fallen.x,.05,fallen.z-5);car.rotation=Vector3.ZERO;car.speed=9;car.pedestrian_contacts.clear();await w._ticks(2);Input.action_press("forward")
	for i in range(70):
		await w._ticks(1)
		if person.hp<injury_hp:break
	Input.action_release("forward");car.speed=0
	checks.append([person.hp<injury_hp,"a second actual pass can injure a fallen person instead of ignoring downed collision"])
	car=await prepare(w);PolishChecks.reset_person(person,Vector3(-40,.05,78));person.frozen=true;car.speed=26;Input.action_press("forward")
	for i in range(60):
		await w._ticks(1)
		if person.hp<=0:break
	Input.action_release("forward");car.speed=0;person.frozen=false;await w._ticks(120)
	checks.append([person.hp<=0 and person.fall_amount>.95 and person.collision_layer==0,"severe high-speed impact can incapacitate pedestrian without immediate revival"])
	car=await prepare(w);PolishChecks.reset_person(person,Vector3(-40,.05,72));person.frozen=false;await w._ticks(60)
	checks.append([person.hp==100 and person.knockdown==0,"stationary vehicle overlapping a person does not invent impact damage"])
	# Single authored surface owns asphalt, paving, promenade and lawn at junctions.
	var surface=w.city.get_node_or_null("ContinuousGround")
	checks.append([surface is MeshInstance3D and surface.material_override==w.city.ground_material and w.city.ground_material.get_shader_parameter("road_segments").size()==6,"road intersections share one continuous depth surface with all six road masks"])
	if out!="":
		GameplayChecks.reset_hero(w,Vector3(-65,.05,23.5));w.player.rotation.y=PI;car.driver=null;car.position=Vector3(210,.05,145);w.hud.notice_until=0;await w._ticks(5)
		await VehicleChecks.picture(w,out,"03-continuous-shop-and-road",Vector3(-78,3.5,29.5),Vector3(-52,4.4,9.8))
		await VehicleChecks.picture(w,out,"04-junction-low-angle",Vector3(-106,.65,53),Vector3(-89,.1,39))
