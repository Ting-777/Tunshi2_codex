class_name VehicleChecks
extends RefCounted

static func prepare(w: Node3D):
	w.paused=false;w.hud.menu=false;w.hud.photo=false;w.hud.map_open=false;w.fixed_camera=true
	for a in w.people:a.frozen=true;a.collision_layer=0;a.collision_mask=0
	for c in w.cars:c.driver=null;c.speed=0;c.steer=0;c.velocity=Vector3.ZERO;c.position=Vector3(210,.05,145+w.cars.find(c)*7);c.collision_layer=0;c.hp=c.max_hp;c.collision_cooldowns.clear();c.pedestrian_contacts.clear()
	GameplayChecks.reset_hero(w,Vector3(-38.3,.05,70))
	var car=w.cars[0];car.position=Vector3(-40,.05,70);car.rotation=Vector3.ZERO;car.collision_layer=4
	await w._ticks(5);w._key(KEY_E)
	return car

static func clear_body(w: Node3D) -> bool:
	var shape=w.player.get_child(0) as CollisionShape3D
	var q=PhysicsShapeQueryParameters3D.new();q.shape=shape.shape;q.transform=shape.global_transform;q.collision_mask=7;q.exclude=[w.player.get_rid()]
	# Standing on the floor is expected contact, not an obstacle overlap. Identify
	# that actual support instead of assuming a fixed solver penetration tolerance.
	var space=w.get_world_3d().direct_space_state
	var floor_hit=space.intersect_ray(PhysicsRayQueryParameters3D.create(w.player.position+Vector3.UP*.1,w.player.position-Vector3.UP*.1,1))
	if w.player.is_on_floor() and not floor_hit.is_empty() and floor_hit.normal.y>.7:q.exclude=[w.player.get_rid(),floor_hit.rid]
	var hits=space.intersect_shape(q)
	if not hits.is_empty():print("EXIT_OVERLAP ",w.player.position," ",hits)
	return hits.is_empty()

static func obstacle(w: Node3D,size: Vector3,p: Vector3):
	var n=Node3D.new();w.add_child(n);ToonKit.box(n,size,"#c4cfbd",p,.04);ToonKit.solid(n,size,p);return n

static func picture(w: Node3D,out: String,name: String,eye: Vector3,target: Vector3):
	if out=="":return
	var previous=w.capture_mode;w.capture_mode=true;w.paused=true;w.hud.photo=false;w.camera.position=eye;w.camera.look_at(target)
	await w._shot(out+"/"+name+".png");w.capture_mode=previous;w.paused=false

static func run(w: Node3D,checks: Array):
	var out="";var args=OS.get_cmdline_user_args()
	for i in range(args.size()-1):
		if args[i]=="--capture-output":out=args[i+1];DirAccess.make_dir_recursive_absolute(out)
	if "--no-capture" in args:out=""
	var car=await prepare(w)
	checks.append([w.player.vehicle==car,"E boards a reachable parked car"])
	w._key(KEY_E);await w._ticks(6)
	print("ORDINARY_EXIT vehicle=",w.player.vehicle," visible=",w.player.visible," floor=",w.player.is_on_floor()," clear=",clear_body(w)," position=",w.player.position," velocity=",w.player.velocity," impulse=",w.player.impulse)
	checks.append([w.player.vehicle==null and w.player.visible and w.player.is_on_floor() and clear_body(w),"ordinary exit has physical support and no body overlap"])
	car=await prepare(w);var neighbor=w.cars[1];neighbor.position=Vector3(-42.8,.05,70);neighbor.rotation=Vector3.ZERO;neighbor.collision_layer=4;await w._ticks(4)
	w._key(KEY_E);await w._ticks(6);w.player.rotation.y=0;w.player.pose()
	checks.append([w.player.vehicle==null and w.player.position.x>car.position.x+1.5 and clear_body(w),"adjacent parked car blocks one side and E exits on free side"])
	await picture(w,out,"01-free-side-exit",Vector3(-32,3.6,78),Vector3(-40,1,70))
	car=await prepare(w)
	for i in [1,2]:var other=w.cars[i];other.position=Vector3(-40+(-2.8 if i==1 else 2.8),.05,70);other.rotation=Vector3.ZERO;other.collision_layer=4
	await w._ticks(4);w._key(KEY_E)
	checks.append([w.player.vehicle==car and car.driver==w.player and not w.player.visible and w.player.collision_layer==0,"both occupied sides keep driver safely seated"])
	await picture(w,out,"02-both-sides-blocked",Vector3(-31,5.2,80),Vector3(-40,1,70))
	w.cars[2].position=Vector3(210,.05,152);await w._ticks(3);w._key(KEY_E);await w._ticks(5)
	checks.append([w.player.vehicle==null and w.player.position.x>car.position.x and clear_body(w),"moving a blocking car immediately frees the exit"])
	car=await prepare(w);var low=obstacle(w,Vector3(.7,.9,5),Vector3(-42.1,.45,70));await w._ticks(3);w._key(KEY_E);await w._ticks(5)
	checks.append([w.player.vehicle==null and w.player.position.x>car.position.x and clear_body(w),"low obstacle missed by eye-height ray still blocks standing capsule"])
	await picture(w,out,"03-low-obstacle-exit",Vector3(-32,3.2,77),Vector3(-40,1,70));low.queue_free();await w._ticks(2)
	# A narrow post between the door and the destination must block the whole path.
	car=await prepare(w);var post=obstacle(w,Vector3(.18,2.8,.18),Vector3(-41.15,1.4,70));await w._ticks(3);w._key(KEY_E);await w._ticks(5)
	checks.append([w.player.vehicle==null and w.player.position.x>car.position.x and clear_body(w),"capsule sweep prevents passing through a post between car and landing"]);post.queue_free();await w._ticks(2)
	car=await prepare(w);var deck=obstacle(w,Vector3(3.4,.4,7),Vector3(-39.5,2.8,70));car.position=Vector3(-40,3.05,70);car.velocity=Vector3.ZERO;await w._ticks(8);w._key(KEY_E);await w._ticks(6)
	checks.append([w.player.vehicle==null and w.player.position.x>car.position.x and w.player.position.y>2.9 and w.player.is_on_floor(),"unsupported ledge side is skipped in favor of supported deck"])
	deck.queue_free();await w._ticks(2)
	car=await prepare(w);deck=obstacle(w,Vector3(2.5,.4,7),Vector3(-40,2.8,70));car.position=Vector3(-40,3.05,70);car.velocity=Vector3.ZERO;await w._ticks(8);w._key(KEY_E)
	checks.append([w.player.vehicle==car and car.driver==w.player,"E refuses both unsupported sides instead of dropping player off a ledge"]);deck.queue_free();await w._ticks(2)
	car=await prepare(w);var curb=obstacle(w,Vector3(1.4,.2,5),Vector3(-42,.1,70));await w._ticks(3);w._key(KEY_E);await w._ticks(6)
	checks.append([w.player.vehicle==null and w.player.position.x<car.position.x and w.player.position.y>.18 and w.player.is_on_floor() and clear_body(w),"normal low curb remains a usable exit"]);curb.queue_free();await w._ticks(2)
	car=await prepare(w);car.speed=5;w._key(KEY_E)
	checks.append([w.player.vehicle==car and car.driver==w.player,"speed limit still prevents a moving-car exit"])
	car=await prepare(w);car.driver=null;GameplayChecks.reset_hero(w,Vector3(-38.2,.05,70));var wall=obstacle(w,Vector3(.2,3,5),Vector3(-38.8,1.5,70));await w._ticks(3);w._key(KEY_E)
	checks.append([w.player.vehicle==null and w.near_car()==null,"solid wall prevents boarding and hides unreachable E prompt"]);wall.queue_free();await w._ticks(2);w._key(KEY_E)
	checks.append([w.player.vehicle==car,"boarding works when actual wall is removed"])
	w._key(KEY_E);await w._ticks(6)
	if out!="":
		GameplayChecks.reset_hero(w,Vector3(-65,.05,23.5));w.player.rotation.y=PI;await w._ticks(6);w.player.pose();w.hud.notice_until=0
		await picture(w,out,"04-original-hero-street",Vector3(-59,2.8,31),Vector3(-66,1.3,23.5))
