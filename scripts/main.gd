extends Node3D

var city: ShanghaiCity
var player: StreetActor
var people=[]
var cars=[]
var camera: Camera3D
var hud: StreetHUD
var paused=true
var yaw=PI
var pitch=.30
var shake=0.0
var money=1200
var medicine=3
var capture_mode=false
var fixed_camera=false
var particles=[]
var drops=[]
var broken=[]
var autosave=0.0
var freeze_to=0
var sounds={}
var steps=0.0
var combo_hits=0
var combo_expiry=0

func _ready():
	Engine.max_fps=60;_bind_keys();capture_mode="--capture" in OS.get_cmdline_user_args()
	city=ShanghaiCity.new();add_child(city);await city.build()
	player=StreetActor.new();player.hero=true;player.world=self;player.position=Vector3(-46,.3,23);player.rotation.y=PI;add_child(player)
	for p in [Vector3(-20,.2,18),Vector3(-15,.2,22),Vector3(-9,.2,14),Vector3(27,.2,18),Vector3(34,.2,19),Vector3(-145,.2,-37)]:_person(p,false)
	for p in [Vector3(-73,.2,21),Vector3(-63,.2,18),Vector3(39,.2,9),Vector3(-151,.2,12),Vector3(76,.2,-65),Vector3(93,.2,-91),Vector3(-130,.2,52)]:_person(p,true)
	for item in [[Vector3(-45,.3,40),"#df8659",PI/2],[Vector3(22,.3,44),"#638e9e",-PI/2],[Vector3(-96,.3,-40),"#e4c588",0.0]]:
		var c=StreetCar.new();c.world=self;c.position=item[0];c.paint=item[1];c.rotation.y=item[2];add_child(c);cars.append(c)
	_pedestrians()
	camera=Camera3D.new();camera.fov=65;camera.near=.12;camera.far=1100;add_child(camera);camera.current=true
	var layer=CanvasLayer.new();add_child(layer);hud=StreetHUD.new();hud.world=self;layer.add_child(hud);_audio()
	print("SHANGHAI_READY")
	if capture_mode:paused=false;hud.menu=false;await _capture()
	elif "--test-impact-only" in OS.get_cmdline_user_args():
		paused=false;hud.menu=false;var checks=[];await ImpactChecks.run(self,checks);_test_report(checks)
	elif "--test-vehicle-only" in OS.get_cmdline_user_args():
		paused=false;hud.menu=false;var checks=[];await VehicleChecks.run(self,checks);_test_report(checks)
	elif "--test-polish-only" in OS.get_cmdline_user_args():
		paused=false;hud.menu=false;var checks=[];await PolishChecks.run(self,checks);_test_report(checks)
	elif "--test-world-only" in OS.get_cmdline_user_args():
		paused=false;hud.menu=false;var checks=[];await GameplayChecks.run(self,checks);_test_report(checks)
	elif "--test" in OS.get_cmdline_user_args():await _tests()
	else:
		if not "--fresh" in OS.get_cmdline_user_args():load_game(false)
		_follow(1)

func _bind_keys():
	for pair in [["forward",KEY_W],["back",KEY_S],["left",KEY_A],["right",KEY_D],["jump",KEY_SPACE],["guard",KEY_B]]:
		if not InputMap.has_action(pair[0]):InputMap.add_action(pair[0])
		var e=InputEventKey.new();e.physical_keycode=pair[1];InputMap.action_add_event(pair[0],e)

func _person(p: Vector3,friendly: bool):
	var a=StreetActor.new();a.world=self;a.friendly=friendly;a.position=p;a.rotation.y=PI
	if not friendly:a.max_hp=76;a.hp=76
	a.role=["brawler","flanker","bruiser"][people.size()%3]
	add_child(a);people.append(a)

func _pedestrians():
	var routes=[
		[Vector3(-84,.2,23),Vector3(-30,.2,23),Vector3(-30,.2,26),Vector3(-84,.2,26)],
		[Vector3(-165,.2,-112),Vector3(-165,.2,83),Vector3(-152,.2,83),Vector3(-152,.2,-112)],
		[Vector3(73,.2,-54),Vector3(73,.2,-105),Vector3(132,.2,-105),Vector3(132,.2,-56)]
	]
	for item in [[0,0],[0,2],[1,0],[1,1],[1,2],[1,3],[2,0],[2,2]]:
		var route=routes[item[0]];_person(route[item[1]],true);people.back().path=route;people.back().path_index=(item[1]+1)%route.size()

func alarm_pedestrians(origin: Vector3,source: Vector3):
	for actor in people:
		if actor.friendly and actor.hp>0 and actor.position.distance_to(origin)<9:
			actor.panic=maxf(actor.panic,5);actor.threat=source

func can_commit(actor: StreetActor) -> bool:
	var engaged=0
	for a in people:
		if a==actor or a.friendly or a.frozen or a.hp<=0 or a.position.distance_to(player.position)>5:continue
		if a.attack>=0 or a.tell>0:engaged+=1
	if engaged>=2:return false
	return get_world_3d().direct_space_state.intersect_ray(PhysicsRayQueryParameters3D.create(actor.position+Vector3.UP*1.1,player.position+Vector3.UP*1.1,1)).is_empty()

func steer_actor(actor: StreetActor,desired: Vector3) -> Vector3:
	var direction=desired
	for a in people:
		if a==actor or a.hp<=0 or absf(a.position.y-actor.position.y)>1:continue
		var away=actor.position-a.position;away.y=0;var dist=away.length()
		if dist>.01 and dist<1.15:direction+=away.normalized()*(1.15-dist)*1.8
	direction=direction.normalized();var origin=actor.position+Vector3.UP*.8
	var query=PhysicsRayQueryParameters3D.create(origin,origin+direction*1.6,1)
	if not get_world_3d().direct_space_state.intersect_ray(query).is_empty():
		for angle in [.8,-.8,1.4,-1.4]:
			var turn=direction.rotated(Vector3.UP,angle);query.to=origin+turn*1.8
			if get_world_3d().direct_space_state.intersect_ray(query).is_empty():return turn
		return Vector3.ZERO
	return direction

func movement() -> Vector3:
	if paused:return Vector3.ZERO
	var v=Input.get_vector("left","right","back","forward");var forward=Vector3(sin(yaw),0,cos(yaw));var right=Vector3(-cos(yaw),0,sin(yaw));return (forward*v.y+right*v.x).normalized()

func _unhandled_input(event):
	if not player or capture_mode:return
	if event is InputEventKey and event.pressed and not event.echo:_key(event.physical_keycode)
	if event is InputEventMouseButton and event.pressed:
		if hud.menu:_start();return
		if paused:
			if not hud.map_open:paused=false;Input.mouse_mode=Input.MOUSE_MODE_CAPTURED
			return
		if Input.mouse_mode!=Input.MOUSE_MODE_CAPTURED:Input.mouse_mode=Input.MOUSE_MODE_CAPTURED;return
		if event.button_index==MOUSE_BUTTON_LEFT:player.strike()
		if event.button_index==MOUSE_BUTTON_RIGHT:dodge()
	if event is InputEventMouseMotion and Input.mouse_mode==Input.MOUSE_MODE_CAPTURED and not paused:look(event.relative)

func look(delta: Vector2):yaw-=delta.x*.0035;pitch=clampf(pitch+delta.y*.0028,-.23,1.05)

func _key(key: int):
	if key==KEY_T and paused:
		save_game(false);Engine.time_scale=1.0
		for action in ["forward","back","left","right","jump","guard"]:Input.action_release(action)
		Input.mouse_mode=Input.MOUSE_MODE_VISIBLE;get_tree().change_scene_to_file("res://scenes/prologue.tscn");return
	if key==KEY_F11:DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_WINDOWED if DisplayServer.window_get_mode()==DisplayServer.WINDOW_MODE_FULLSCREEN else DisplayServer.WINDOW_MODE_FULLSCREEN);return
	if key==KEY_M and not hud.menu:hud.map_open=not hud.map_open;paused=hud.map_open;Input.mouse_mode=Input.MOUSE_MODE_VISIBLE if paused else Input.MOUSE_MODE_CAPTURED;return
	if key==KEY_ESCAPE:
		if hud.map_open:hud.map_open=false;paused=false
		elif not hud.menu:paused=not paused
		Input.mouse_mode=Input.MOUSE_MODE_VISIBLE if paused else Input.MOUSE_MODE_CAPTURED;return
	if hud.menu and key==KEY_ENTER:_start();return
	if paused:return
	match key:
		KEY_H:hud.help=not hud.help
		KEY_E:board()
		KEY_R:player.strike("heavy")
		KEY_F:player.strike("kick")
		KEY_Q:
			if player.heat>=60 and player.attack<0 and player.stun<=0 and not player.vehicle and player.dodge_time<=0:player.heat-=60;player.strike("heat")
			else:hud.say("打出有效命中，积攒热血")
		KEY_G:dodge()
		KEY_X:player.crouch=not player.crouch
		KEY_SPACE:
			if player.is_on_floor() and not player.vehicle:player.velocity.y=8.2
		KEY_1:
			if medicine>0 and player.hp<100:medicine-=1;player.hp=minf(100,player.hp+40);hud.say("体力恢复 · 剩余 "+str(medicine)+" 份")
		KEY_F5:save_game()
		KEY_F9:load_game()

func _start():hud.menu=false;paused=false;Input.mouse_mode=Input.MOUSE_MODE_CAPTURED;hud.say("沿街自由探索 · H 查看操作")

func _process(dt):
	if not player or not camera:return
	Engine.time_scale=.12 if Time.get_ticks_msec()<freeze_to else 1.0
	if not paused:
		autosave+=dt
		if autosave>45:save_game(false);autosave=0
		if player.hp<=0:_respawn_hero()
		for p in particles.duplicate():
			p.life-=dt;p.node.position+=p.velocity*dt;p.velocity.y-=dt*7;p.node.scale=Vector3.ONE*maxf(.01,p.life/.32)
			if p.life<=0:p.node.queue_free();particles.erase(p)
		for p in drops.duplicate():
			p.node.rotation.y+=dt;p.node.position.y=.6+sin(Time.get_ticks_msec()*.003)*.08
			if player.position.distance_to(p.node.position)<1.5:money+=50;p.node.queue_free();drops.erase(p);hud.say("拾取 ¥50")
		steps-=dt
		if player.speed>1 and player.is_on_floor() and not player.vehicle and steps<=0:sound("step",.3);steps=.29
	if not fixed_camera:_follow(dt)

func _respawn_hero():
	if player.vehicle:player.vehicle.driver=null;player.vehicle=null
	player.hp=100;player.position=player.home;player.velocity=Vector3.ZERO;player.impulse=Vector3.ZERO;player.stun=0;player.knockdown=0;player.immunity=2;player.attack=-1;player.queued="";player.dodge_time=0;player.collision_layer=2;player.collision_mask=7;player.visible=true
	for action in ["forward","back","left","right","jump","guard"]:Input.action_release(action)
	money=maxi(0,money-50);hud.say("回到街口 · 休息后继续");_follow(1)

func _follow(dt: float):
	if hud.menu:camera.position=Vector3(-50,3.3,29.5);camera.look_at(player.position+Vector3.UP*1.4);return
	var target=player.position+Vector3.UP*1.42;var distance=6.3
	if player.vehicle:target=player.vehicle.position+Vector3.UP*1.7;distance=9.2
	var offset=-Vector3(sin(yaw)*cos(pitch),-sin(pitch),cos(yaw)*cos(pitch));var desired=target+offset*distance;var hit=get_world_3d().direct_space_state.intersect_ray(PhysicsRayQueryParameters3D.create(target,desired,1))
	if hit:desired=hit.position+(target-hit.position).normalized()*.3
	camera.position=camera.position.lerp(desired,1-exp(-dt*12)) if dt<.5 else desired;camera.look_at(target)
	if shake>0 and not paused:camera.position+=Vector3(randf_range(-1,1),randf_range(-1,1),0)*shake;shake=move_toward(shake,0,dt*1.5)

func dodge():
	if player.vehicle or player.dodge_time>0 or player.stun>0:return
	var v=movement();player.dodge_dir=v if v.length()>.2 else -Vector3(sin(player.rotation.y),0,cos(player.rotation.y));player.dodge_time=.28;player.immunity=.27;player.attack=-1;player.queued="";player.combo_step=0;player.combo_window=0;sound("swing",.4)

func aim_assist():
	var best: StreetActor;var range_value=2.6;var forward=Vector3(sin(player.rotation.y),0,cos(player.rotation.y))
	for a in people:
		var d=a.position-player.position
		if a.hp<=0 or a.knockdown>.35 or absf(d.y)>.95 or d.length()>range_value or forward.dot(d.normalized())<0:continue
		if get_world_3d().direct_space_state.intersect_ray(PhysicsRayQueryParameters3D.create(player.position+Vector3.UP*1.1,a.position+Vector3.UP*1.1,1)):continue
		best=a;range_value=d.length()
	if best:var d=best.position-player.position;player.rotation.y=atan2(d.x,d.z)

func actor_target(_actor: StreetActor) -> StreetActor:return player

func melee_targets(actor: StreetActor) -> Array:return people if actor==player else [player]

func melee(actor: StreetActor):
	var targets=melee_targets(actor);var forward=Vector3(sin(actor.rotation.y),0,cos(actor.rotation.y));var kind=actor.kind;var reach=3.8 if kind=="heat" else 2.55 if kind=="kick" else 2.15;var damage=18.0 if kind=="jab" else 21.0 if kind=="cross" else 34.0 if kind=="finish" else 30.0 if kind=="heavy" else 23.0 if kind=="kick" else 42.0
	if actor!=player:damage=14 if kind=="heavy" else 10
	sound("swing",.6)
	for a in targets:
		var d=a.position-actor.position
		if a.hp<=0 or a.knockdown>.35 or a.vehicle or d.length()>reach or absf(d.y)>.95:continue
		if kind!="heat" and forward.dot(d.normalized())<.4:continue
		if kind!="heat":
			var limb=actor.knees[actor.hand] if kind=="kick" else actor.elbows[actor.hand];var tip=limb.to_global(Vector3(0,-.43 if actor.hero else -.30,.03));var axis=Vector3(a.position.x,clampf(tip.y,a.position.y+.4,a.position.y+1.65),a.position.z)
			if tip.distance_to(axis)>(.78 if kind=="kick" else .79 if kind in ["cross","finish"] else .71):continue
		if get_world_3d().direct_space_state.intersect_ray(PhysicsRayQueryParameters3D.create(actor.position+Vector3.UP*1.1,a.position+Vector3.UP*1.1,1)):continue
		if a.hurt(damage,forward*(2 if kind=="jab" else 3 if kind=="cross" else 6)):
			if actor==player and kind in ["finish","heat"] and a.hp>0:a.knockdown=1.35;a.stun=1.35
			impact(a.position+Vector3.UP*1.2,kind not in ["jab","cross"])
			if actor==player:
				combo_hits=combo_hits+1 if Time.get_ticks_msec()<combo_expiry else 1;combo_expiry=Time.get_ticks_msec()+2400
				player.heat=minf(100,player.heat+17);hud.target=a;hud.target_time=2.8;freeze_to=Time.get_ticks_msec()+65;shake=.07 if kind=="jab" else .15
	if actor==player:
		for b in city.crates.duplicate():
			var d=b.p-player.position
			if d.length()<reach and forward.dot(d.normalized())>.3:
				b.hp-=damage;impact(b.p+Vector3.UP*.5,true)
				if b.hp<=0:broken.append([b.p.x,b.p.z]);b.node.queue_free();city.crates.erase(b);loot(b.p)

func impact(p: Vector3,heavy: bool):
	sound("hit",.8 if heavy else .6)
	for i in range(9 if heavy else 5):
		var n=ToonKit.box(self,Vector3(.06,.07,.30),"#ffe2a0" if i%2 else "#ed9858",p,.02);n.rotation=Vector3(randf()*PI,randf()*PI,randf()*PI);particles.append({"node":n,"velocity":Vector3(randf_range(-3,3),randf_range(1,4),randf_range(-3,3)),"life":.32})

func loot(p: Vector3):drops.append({"node":ToonKit.box(self,Vector3(.36,.07,.22),"#e4bc67",Vector3(p.x,.6,p.z),.03)})

func near_car():
	if not player or player.vehicle:return null
	var best=null;var dist=3.5
	for car in cars:
		var d=player.position.distance_to(car.position)
		if d>=dist:continue
		var ray=PhysicsRayQueryParameters3D.create(player.position+Vector3.UP,car.position+Vector3.UP,1)
		if get_world_3d().direct_space_state.intersect_ray(ray):continue
		dist=d;best=car
	return best

func exit_position(car: StreetCar):
	# Check the hero's actual standing capsule, not a single eye-height ray.
	var space=get_world_3d().direct_space_state
	var shape=player.get_child(0) as CollisionShape3D
	for side in [-1,1]:
		var p=car.position+car.basis.x*side*1.9
		var floor_hit=space.intersect_ray(PhysicsRayQueryParameters3D.create(p+Vector3.UP*.55,p-Vector3.UP*.85,1))
		if floor_hit.is_empty() or floor_hit.normal.y<.7:continue
		var floor_y=floor_hit.position.y
		if floor_y-car.position.y>.4 or floor_y-car.position.y<-.65:continue
		var supported=true
		for offset in [Vector3.LEFT*.28,Vector3.RIGHT*.28,Vector3.FORWARD*.28,Vector3.BACK*.28]:
			var foot=Vector3(p.x,floor_y,p.z)+offset
			var support=space.intersect_ray(PhysicsRayQueryParameters3D.create(foot+Vector3.UP*.3,foot-Vector3.UP*.3,1))
			if support.is_empty() or support.normal.y<.7 or absf(support.position.y-floor_y)>.22:supported=false;break
		if not supported:continue
		p.y=floor_y+.03
		var query=PhysicsShapeQueryParameters3D.new();query.shape=shape.shape;query.margin=.01;query.collision_mask=7;query.exclude=[player.get_rid(),car.get_rid()]
		query.transform=Transform3D(Basis.IDENTITY,p+shape.position)
		var overlaps=space.intersect_shape(query,1)
		if not overlaps.is_empty():continue
		# Sweep at the landing height so a modest curb remains a valid exit.
		query.transform.origin=Vector3(car.position.x,p.y,car.position.z)+shape.position
		query.motion=Vector3(p.x-car.position.x,0,p.z-car.position.z)
		var fractions=space.cast_motion(query)
		if fractions[0]<.999:continue
		return p
	return null

func board():
	if player.vehicle:
		var car=player.vehicle
		if absf(car.speed)>3:hud.say("先减速，再下车");return
		var p=exit_position(car)
		if p!=null:
			player.vehicle=null;car.driver=null;player.position=p;player.velocity=Vector3.ZERO;player.collision_layer=2;player.collision_mask=7;player.visible=true;car.door_angle=1;hud.say("下车");return
		hud.say("两侧没有安全落脚点，挪车后再下车")
	else:
		var car=near_car()
		if car:car.driver=player;player.vehicle=car;player.collision_layer=0;player.collision_mask=0;player.visible=false;car.door_angle=1;yaw=car.rotation.y;hud.say("W/S 油门刹车 · A/D 转向 · 空格手刹")

func safe_position(value):
	var fallback=Vector3(-46,.3,23)
	if not value is Array or value.size()!=3:return fallback
	for v in value:
		if not (v is float or v is int) or not is_finite(float(v)):return fallback
	var p=Vector3(value[0],value[1],value[2])
	if p.x< -165 or p.x>259 or p.z< -280 or p.z>167 or p.y<-.2 or p.y>7:return fallback
	for r in city.blocks:
		if r.grow(.8).has_point(Vector2(p.x,p.z)):return fallback
	return p+Vector3.UP*.08

func _save_path():return "user://toon-test-save.json" if "--test" in OS.get_cmdline_user_args() else "user://shanghai-toon-save.json"

func save_game(show_notice: bool=true):
	var p=player.position
	if player.vehicle:p=player.vehicle.position-player.vehicle.basis.x*1.9+Vector3.UP*.25
	var data={"version":3,"p":[p.x,p.y,p.z],"hp":player.hp,"heat":player.heat,"money":money,"medicine":medicine,"yaw":yaw,"broken":broken,"cars":[]}
	for c in cars:data.cars.append({"p":[c.position.x,c.position.y,c.position.z],"yaw":c.rotation.y,"hp":c.hp})
	var f=FileAccess.open(_save_path(),FileAccess.WRITE)
	if f:f.store_string(JSON.stringify(data))
	if show_notice:hud.say("已保存当前位置")

func load_game(show_notice: bool=true):
	if not FileAccess.file_exists(_save_path()):return
	var d=JSON.parse_string(FileAccess.get_file_as_string(_save_path()))
	if not d is Dictionary or d.get("version",0)!=3:return
	if player.vehicle:player.vehicle.driver=null;player.vehicle=null
	player.collision_layer=2;player.collision_mask=7;player.visible=true;player.position=safe_position(d.get("p",[]));player.velocity=Vector3.ZERO;player.hp=clampf(float(d.get("hp",100)),10,100);player.heat=clampf(float(d.get("heat",0)),0,100);money=clampi(int(d.get("money",1200)),0,999999);medicine=clampi(int(d.get("medicine",3)),0,99);yaw=float(d.get("yaw",PI))
	if not is_finite(yaw):yaw=PI
	var saved=d.get("cars",[])
	if saved is Array:
		for i in range(mini(saved.size(),cars.size())):
			if not saved[i] is Dictionary:continue
			cars[i].position=safe_position(saved[i].get("p",[]));cars[i].speed=0;cars[i].velocity=Vector3.ZERO;var angle=float(saved[i].get("yaw",0));cars[i].rotation.y=angle if is_finite(angle) else 0;cars[i].hp=clampf(float(saved[i].get("hp",180)),0,180)
	var states=d.get("broken",[])
	if states is Array:
		broken=states
		for c in city.crates.duplicate():
			if [c.p.x,c.p.z] in broken:c.node.queue_free();city.crates.erase(c)
	if show_notice:hud.say("已读取存档")

func _audio():
	for kind in ["hit","swing","step"]:
		var rate=22050;var duration=.07 if kind=="step" else .15;var data=PackedByteArray()
		for i in range(int(rate*duration)):
			var t=float(i)/rate;var v=(sin(t*(110 if kind=="hit" else 75)*TAU)*.55+randf_range(-1,1)*.45)*pow(1-t/duration,3)
			if kind=="swing":v=randf_range(-1,1)*pow(1-t/duration,3)*.3
			var sample=int(v*18000);data.append(sample&255);data.append((sample>>8)&255)
		var wav=AudioStreamWAV.new();wav.format=AudioStreamWAV.FORMAT_16_BITS;wav.mix_rate=rate;wav.data=data;sounds[kind]=wav

func sound(kind: String,volume: float):
	if not sounds.has(kind):return
	var p=AudioStreamPlayer.new();p.stream=sounds[kind];p.volume_db=linear_to_db(volume*.3);p.pitch_scale=randf_range(.9,1.1);add_child(p);p.finished.connect(p.queue_free);p.play()

func _ticks(count: int):
	for i in range(count):await get_tree().physics_frame

func _until_strike(expected: String,contact: bool=false):
	for i in range(110):
		await get_tree().physics_frame
		if player.kind==expected and player.attack>=0 and (not contact or player.latched):return

func _capture():
	fixed_camera=true;await _ticks(48);paused=true;var dir="res://builds/round-04";var args=OS.get_cmdline_user_args()
	for i in range(args.size()-1):
		if args[i]=="--capture-output":dir=args[i+1]
	DirAccess.make_dir_recursive_absolute(dir)
	if "--capture-clean" in args:
		await _capture_clean(dir);return
	if "--capture-pearl" in args:
		await _capture_pearl(dir);return
	player.rotation.y=PI;camera.position=player.position+Vector3(2.2,2.8,6.5);camera.look_at(player.position+Vector3.UP*1.25);await _shot(dir+"/01-street.png")
	hud.photo=true;player.position=Vector3(-153,.3,-8);player.rotation.y=-PI/2;camera.position=Vector3(-157.2,2,-5.3);camera.look_at(player.position+Vector3.UP*1.25);await _shot(dir+"/02-original-dolphin.png")
	player.position=Vector3(-25,.15,21);player.rotation.y=PI/2;people[0].position=Vector3(-23.5,.15,21);people[0].frozen=true;people[0].rotation.y=-PI/2;player.stun=0;player.attack=-1;paused=false;player.strike("heavy");await _ticks(18);paused=true;people[0].pose();camera.position=Vector3(-25.4,2.2,26.7);camera.look_at(Vector3(-24,1.4,21));hud.photo=false;await _shot(dir+"/03-combat.png")
	hud.map_open=true;await _shot(dir+"/04-map.png");hud.map_open=false;hud.photo=true;camera.position=Vector3(-37,2.1,46);camera.look_at(cars[0].position+Vector3.UP*.9);await _shot(dir+"/05-car.png");camera.position=Vector3(-227,7,14);camera.look_at(Vector3(35,49,-30));await _shot(dir+"/06-riverside.png")
	for actor in people:actor.frozen=true
	player.position=Vector3(-39,.2,71);player.velocity=Vector3.ZERO;player.rotation.y=PI/2;player.attack=-1;player.stun=0;player.combo_step=0;player.combo_window=0;player.queued=""
	var victim=people[0];victim.position=Vector3(-37.6,.2,71);victim.rotation.y=-PI/2;victim.hp=150;victim.max_hp=150;victim.knockdown=0;victim.stun=0;victim.immunity=0;victim.collision_layer=2
	paused=false;player.strike();await _until_strike("jab",true);player.strike();await _until_strike("cross");await _ticks(12);player.strike();await _until_strike("finish",true);victim.frozen=false;victim.cooldown=99;await _ticks(13);paused=true;hud.photo=false;camera.position=Vector3(-32.5,2.4,72.5);camera.look_at(Vector3(-38,1,70.5));await _shot(dir+"/07-combo-finish.png")
	hud.photo=true;player.position=Vector3(-65,.18,23.5);player.rotation.y=PI;player.attack=-1;player.pose();camera.position=Vector3(-78,3.5,29.5);camera.look_at(Vector3(-52,4.4,9.8));await _shot(dir+"/08-frontage.png")
	camera.position=Vector3(-81,3.5,55);camera.look_at(Vector3(-35,3.2,15));await _shot(dir+"/09-boulevard.png")
	print("CAPTURE_COMPLETE ",dir);get_tree().quit()

func _capture_clean(dir: String):
	hud.photo=true;paused=false
	player.position=Vector3(-65,.5,23.5);player.velocity=Vector3.ZERO;await _ticks(40);paused=true;player.rotation.y=PI;player.pose()
	camera.position=Vector3(-78,3.5,29.5);camera.look_at(Vector3(-52,4.4,9.8));await _shot(dir+"/01-street-clean.png")
	camera.position=Vector3(-62.5,4.4,22);camera.look_at(Vector3(-61,5.4,11.6));await _shot(dir+"/02-store-windows.png")
	player.position=Vector3(-64,.6,-65);player.velocity=Vector3.ZERO;player.attack=-1;player.stun=0;yaw=PI
	paused=false;await _ticks(40);Input.action_press("forward");await _ticks(76);Input.action_release("forward");await _ticks(8)
	var access=player.is_on_floor() and player.position.y>.30 and player.position.z< -70
	print("PEARL_ACCESS_CHECK ",access," position=",player.position)
	if not access:get_tree().quit(2);return
	player.position=Vector3(-63,.6,-66);player.velocity=Vector3.ZERO;await _ticks(40);paused=true;player.rotation.y=0;player.pose()
	camera.position=Vector3(-70,2.9,-57);camera.look_at(Vector3(-64,4.6,-82));await _shot(dir+"/03-entrance-clean.png")
	camera.position=Vector3(-227,7,14);camera.look_at(Vector3(35,49,-30));await _shot(dir+"/04-skyline-clean.png")
	print("CAPTURE_COMPLETE ",dir);get_tree().quit()

func _capture_pearl(dir: String):
	hud.photo=true
	# Exercise the actual controller on the public arrival ramp before shooting.
	player.position=Vector3(-64,.6,-65);player.velocity=Vector3.ZERO;player.attack=-1;player.stun=0;yaw=PI
	paused=false;await _ticks(40);Input.action_press("forward");await _ticks(76);Input.action_release("forward");await _ticks(8)
	var access=player.is_on_floor() and player.position.y>.30 and player.position.z< -70
	print("PEARL_ACCESS_CHECK ",access," position=",player.position)
	if not access:get_tree().quit(2);return
	# Actual scene cameras; preserve the original hero and let physics settle it.
	player.position=Vector3(-63,.6,-66);player.velocity=Vector3.ZERO;await _ticks(40);paused=true;player.rotation.y=0;player.pose()
	camera.position=Vector3(-120,26,20);camera.look_at(Vector3(-64,59,-85));await _shot(dir+"/01-pearl-whole.png")
	camera.position=Vector3(-88,27,-57);camera.look_at(Vector3(-64,29,-85));await _shot(dir+"/02-pearl-lower.png")
	camera.position=Vector3(-87,77,-60);camera.look_at(Vector3(-64,76,-85));await _shot(dir+"/03-pearl-upper.png")
	camera.position=Vector3(-70,2.9,-57);camera.look_at(Vector3(-64,4.6,-82));await _shot(dir+"/04-pearl-arrival.png")
	camera.position=Vector3(-227,7,14);camera.look_at(Vector3(35,49,-30));await _shot(dir+"/05-pearl-skyline.png")
	print("CAPTURE_COMPLETE ",dir);get_tree().quit()

func _shot(path: String):
	for i in range(4):await get_tree().process_frame
	await RenderingServer.frame_post_draw;var frame=get_viewport().get_texture().get_image();frame.save_png(path);frame.save_jpg(path.replace(".png",".jpg"),.65);print("NATIVE_SCREENSHOT ",path)

func _tests():
	paused=false;hud.menu=false
	for a in people:a.frozen=true;a.collision_layer=0;a.collision_mask=0
	var checks=[];await _ticks(60)
	checks.append([player.arms.size()==2 and player.knees.size()==2,"original dolphin hierarchy"]);checks.append([city.pois.size()==9 and city.roads.size()==6,"map and world share coordinates"]);checks.append([cars[0].wheels.size()==4,"four independent wheels"]);checks.append([safe_position([999,0,0]).x==-46,"out-of-bounds save fallback"]);checks.append([safe_position([NAN,0,0]).x==-46,"nonfinite save fallback"]);checks.append([safe_position("bad").x==-46,"malformed save fallback"]);checks.append([player.is_on_floor(),"physical sidewalk support"])
	var initial=player.position;Input.action_press("forward");await _ticks(30);Input.action_release("forward");await _ticks(2);checks.append([player.position.distance_to(initial)>1.5,"movement action through physics controller"])
	player.position=cars[0].position+Vector3(1.7,.3,0);board();checks.append([player.vehicle==cars[0] and not player.visible,"board nearest car"]);player.heat=60;_key(KEY_Q);checks.append([player.heat==60 and player.attack<0,"Q inside vehicle does not consume heat"]);player.heat=0;Input.action_press("forward");Input.action_press("left");await _ticks(120);Input.action_release("forward");Input.action_release("left");var car=cars[0];checks.append([absf(car.rotation.x)<.01 and absf(car.rotation.z)<.01 and car.position.y<1,"cornering remains grounded"]);checks.append([car.position.y>-.03,"wheel clearance above road"]);car.speed=0;board();checks.append([player.vehicle==null and player.visible,"exit car"])
	player.position=Vector3(-25,.2,21);player.velocity=Vector3.ZERO;player.rotation.y=PI/2;player.stun=0;player.attack=-1;var target=people[0];target.position=Vector3(-23.5,.2,21);target.collision_layer=2;target.collision_mask=1;var hp=target.hp;player.strike("heavy");await _ticks(40);checks.append([target.hp<hp and player.heat>0,"animated hand contact damages and builds heat"]);checks.append([hud.target==target,"enemy HUD tracks only player hit"])
	_key(KEY_M);checks.append([hud.map_open and paused,"M opens map and freezes simulation"]);_key(KEY_M);checks.append([not hud.map_open and not paused,"M returns to world"]);var angle=yaw
	for i in range(4):look(Vector2(1800,0))
	checks.append([absf(yaw-angle)>TAU*3,"unrestricted horizontal camera turns"]);yaw=angle;player.attack=-1;player.stun=0;await _ticks(10);_key(KEY_SPACE);await _ticks(8);checks.append([player.velocity.y>0,"physical jump"])
	var p=player.position;save_game(false);player.position=Vector3(-130,.2,50);load_game(false);checks.append([Vector2(player.position.x,player.position.z).distance_to(Vector2(p.x,p.z))<.2,"saved player position"]);checks.append([cars[0].speed==0,"saved parked car state"])
	# Behavioral fixtures exercise real AI, input and contact rather than calling hurt directly.
	player.position=Vector3(-40,.2,70);player.velocity=Vector3.ZERO;player.attack=-1;player.stun=0;player.immunity=0;player.hp=100
	target.position=Vector3(-35,.2,70);target.velocity=Vector3.ZERO;target.hp=76;target.stun=0;target.cooldown=0;target.tell=0;target.attack=-1;target.frozen=false
	await _ticks(210);checks.append([player.hp<100,"hostile AI approaches and lands a real attack"]);checks.append([player.hp>0,"single hostile has readable recovery windows"])
	target.frozen=true;target.velocity=Vector3.ZERO;target.position=player.position+Vector3(1.05,0,0);target.rotation.y=-PI/2;target.stun=0;target.attack=-1;player.hp=100;player.immunity=0;player.stun=0
	Input.action_press("guard");target.frozen=false;target.strike();await _ticks(26);Input.action_release("guard");checks.append([player.hp>90 and player.hp<100,"held guard reduces an actual enemy strike"]);target.frozen=true
	player.immunity=0;player.stun=0;player.attack=-1;dodge();player.heat=60;_key(KEY_Q);checks.append([player.heat==60 and player.attack<0,"Q during dodge does not consume heat"]);player.heat=0;var before=player.hp;var hit=player.hurt(10,Vector3.RIGHT);checks.append([not hit and player.hp==before,"dodge grants its brief invulnerability window"]);await _ticks(25)
	player.hp=40;medicine=2;_key(KEY_1);checks.append([player.hp==80 and medicine==1,"recovery item restores HP and consumes one item"])
	player.position=Vector3(-40,.2,70);player.velocity=Vector3.ZERO;player.attack=-1;player.stun=0;player.rotation.y=PI/2;target.position=Vector3(-38.5,.2,70);target.hp=76;target.immunity=0;var barrier=ToonKit.solid(self,Vector3(.12,3,3),Vector3(-39.25,1.5,70));await _ticks(2);player.strike("heat");await _ticks(25);checks.append([target.hp==76,"solid wall blocks melee damage"]);barrier.queue_free();await _ticks(2)
	var crate=city.crates[0];player.position=crate.p-Vector3(1.2,0,0);player.velocity=Vector3.ZERO;player.rotation.y=PI/2;player.attack=-1;player.stun=0;var count=city.crates.size();var cash=money;player.strike("heat");await _ticks(38);checks.append([city.crates.size()==count-1 and broken.size()>0,"strike destroys world crate and records persistence"])
	await get_tree().process_frame;checks.append([money>cash,"world loot pickup credits cash"])
	save_game(false);var missing=city.crates.size();load_game(false);checks.append([city.crates.size()==missing,"broken crate remains absent after reload"])
	player.position=Vector3(-40,.2,70);player.velocity=Vector3.ZERO;player.rotation.y=PI/2;player.hp=100;player.attack=-1;player.stun=0;player.immunity=0;player.dodge_time=0;player.combo_step=0;player.combo_window=0;player.heat=0
	target.position=Vector3(-38.6,.2,70);target.hp=150;target.max_hp=150;target.knockdown=0;target.stun=0;target.immunity=0;target.frozen=true;target.collision_layer=2
	player.strike();await _ticks(12);checks.append([player.kind=="jab" and target.hp<150,"first combo strike makes hand contact"]);player.strike();await _until_strike("cross");checks.append([player.kind=="cross","buffered second attack becomes a cross"]);await _ticks(12);player.strike();await _until_strike("finish",true);print("COMBO_CONTACT ",player.kind," phase=",player.attack," hp=",target.hp," knockdown=",target.knockdown);checks.append([player.kind=="finish" and target.knockdown>0 and target.hp<115,"third buffered attack connects and knocks enemy down"])
	target.frozen=false;target.cooldown=99;await _ticks(110);checks.append([target.knockdown<=0 and absf(target.rig.rotation.z)<.2 and target.collision_layer==2,"fallen enemy stands and restores body collision"]);target.frozen=true
	await _ticks(50);player.strike();checks.append([player.kind=="jab" and player.combo_step==1,"expired combo returns to first strike"])
	player.attack=-1;player.queued="";player.stun=0;player.immunity=0;player.hp=100;player.rotation.y=-PI/2;target.position=player.position+Vector3(1.05,0,0);target.rotation.y=-PI/2;target.attack=-1;target.stun=0;target.knockdown=0;target.frozen=false;target.cooldown=99;Input.action_press("guard");target.strike();await _ticks(26);Input.action_release("guard");target.frozen=true;checks.append([player.hp<=90,"held guard cannot block an attack from behind"])
	var pedestrian=people.back();pedestrian.frozen=false;pedestrian.position=pedestrian.path[0];pedestrian.path_index=1;pedestrian.collision_layer=2;pedestrian.collision_mask=1;var start=pedestrian.position;await _ticks(120);checks.append([pedestrian.position.distance_to(start)>.8,"pedestrian follows an authored outdoor route"]);pedestrian.frozen=true
	if "--test-world" in OS.get_cmdline_user_args():
		var shot_dir="";var args=OS.get_cmdline_user_args()
		for i in range(args.size()-1):
			if args[i]=="--capture-output":shot_dir=args[i+1];DirAccess.make_dir_recursive_absolute(shot_dir)
		await GameplayChecks.run(self,checks,shot_dir)
	if "--test-polish" in OS.get_cmdline_user_args():await PolishChecks.run(self,checks)
	if "--test-vehicle" in OS.get_cmdline_user_args():await VehicleChecks.run(self,checks)
	if "--test-impact" in OS.get_cmdline_user_args():await ImpactChecks.run(self,checks)
	_test_report(checks)

func _test_report(checks: Array):
	var passed=0;var failed=0
	for check in checks:
		if check[0]:passed+=1;print("PASS ",check[1])
		else:failed+=1;print("FAIL ",check[1])
	var result_path="res://builds/world-test.json"
	for i in range(OS.get_cmdline_user_args().size()-1):
		if OS.get_cmdline_user_args()[i]=="--test-result":result_path=OS.get_cmdline_user_args()[i+1]
	var result=FileAccess.open(result_path,FileAccess.WRITE)
	if result:result.store_string(JSON.stringify({"passed":passed,"failed":failed,"checks":checks},"  "))
	print("DRAW_CALLS ",Performance.get_monitor(Performance.RENDER_TOTAL_DRAW_CALLS_IN_FRAME));print("TEST_RESULT ",passed," passed; ",failed," failed");get_tree().quit(0 if failed==0 else 1)
