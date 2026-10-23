class_name StreetActor
extends CharacterBody3D

var world: Node3D
var hero=false
var friendly=false
var respawn_enabled=true
var locomotion_scale=1.0
var hp=100.0
var max_hp=100.0
var heat=0.0
var rig: Node3D
var body: Node3D
var arms=[]
var elbows=[]
var legs=[]
var knees=[]
var home=Vector3.ZERO
var clock=0.0
var gait=0.0
var speed=0.0
var stun=0.0
var immunity=0.0
var dodge_time=0.0
var dodge_dir=Vector3.ZERO
var attack=-1.0
var kind="jab"
var hand=0
var latched=false
var queued=""
var tell=0.0
var cooldown=1.2
var down_time=0.0
var vehicle: Node3D
var crouch=false
var frozen=false
var impulse=Vector3.ZERO
var combo_step=0
var combo_window=0.0
var knockdown=0.0
var guard_flash=0.0
var role="brawler"
var path=[]
var path_index=0
var panic=0.0
var threat=Vector3.ZERO
var reaction_direction=Vector3.BACK
var fall_amount=0.0
var recovery_wait=false
var traffic_evade=0.0
var traffic_direction=Vector3.ZERO
var traffic_scan=0.0
var pose_support=[]
var vehicle_hurtbox: Area3D
static var original_meshes={}

func _ready():
	collision_layer=2;collision_mask=7;floor_snap_length=.25
	var c=CollisionShape3D.new();var shape=CapsuleShape3D.new();shape.radius=.4 if hero else .31;shape.height=2.12 if hero else 1.95;c.shape=shape;c.position.y=shape.height/2;add_child(c)
	rig=Node3D.new();add_child(rig)
	if hero:
		var data=JSON.parse_string(FileAccess.get_file_as_string("res://assets/original_dolphin.json"));_original(data.model,rig,"0");rig.scale=Vector3.ONE*.65;rig.position.y=.13
		body=rig.find_child("body",true,false)
		for i in range(2):arms.append(rig.find_child("arm"+str(i),true,false));elbows.append(rig.find_child("elbow"+str(i),true,false));legs.append(rig.find_child("leg"+str(i),true,false));knees.append(rig.find_child("knee"+str(i),true,false))
	else:_human()
	for group in [body]+arms+elbows+legs+knees:ToonKit.merge_direct(group)
	ToonKit.outline(rig);ToonKit.finish(rig,true);home=position
	vehicle_hurtbox=Area3D.new();vehicle_hurtbox.collision_layer=8;vehicle_hurtbox.collision_mask=0;vehicle_hurtbox.monitoring=false;add_child(vehicle_hurtbox)
	var hit_shape=CollisionShape3D.new();hit_shape.shape=shape.duplicate();vehicle_hurtbox.add_child(hit_shape);_sync_vehicle_hurtbox()
	if not hero:
		for n in rig.find_children("*","MeshInstance3D",true,false):
			var bounds=n.get_aabb();var points=PackedVector3Array()
			for x in [0,1]:
				for y in [0,1]:
					for z in [0,1]:points.append(bounds.position+bounds.size*Vector3(x,y,z))
			pose_support.append({"node":n,"points":points})

func _original(d: Dictionary,parent: Node3D,key: String):
	var n: Node3D
	if d.has("mesh"):
		var g=d.mesh
		if not original_meshes.has(key):
			var vs=PackedVector3Array();var ns=PackedVector3Array();var ix=PackedInt32Array()
			for i in range(0,g.position.size(),3):vs.append(Vector3(g.position[i],g.position[i+1],g.position[i+2]));ns.append(Vector3(g.normal[i],g.normal[i+1],g.normal[i+2]))
			if g.index.size()>0:
				for i in range(0,g.index.size(),3):ix.append_array([int(g.index[i]),int(g.index[i+2]),int(g.index[i+1])])
			else:
				for i in range(0,vs.size(),3):ix.append_array([i,i+2,i+1])
			var a=[];a.resize(Mesh.ARRAY_MAX);a[Mesh.ARRAY_VERTEX]=vs;a[Mesh.ARRAY_NORMAL]=ns;a[Mesh.ARRAY_INDEX]=ix;var m=ArrayMesh.new();m.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES,a);original_meshes[key]=m
		n=ToonKit.mesh(parent,original_meshes[key],ToonKit.mat(g.color))
	else:n=Node3D.new();parent.add_child(n)
	n.name=d.name;n.position=Vector3(d.position[0],d.position[1],d.position[2]);n.basis=Basis.from_euler(Vector3(d.rotation[0],d.rotation[1],d.rotation[2]),EULER_ORDER_XYZ);n.scale=Vector3(d.scale[0],d.scale[1],d.scale[2])
	for i in range(d.children.size()):_original(d.children[i],n,key+"/"+str(i))

func _human():
	var shirt="#38819c" if friendly else "#dc7654";var skin="#e4b88d"
	body=Node3D.new();rig.add_child(body)
	ToonKit.box(body,Vector3(.57,.65,.33),shirt,Vector3(0,1.22,0),.13);ToonKit.box(body,Vector3(.47,.15,.3),"#253e4c",Vector3(0,.9,0),.05);ToonKit.cyl(body,.095,.17,skin,Vector3(0,1.61,0))
	ToonKit.orb(body,Vector3(.195,.245,.18),skin,Vector3(0,1.83,0));ToonKit.orb(body,Vector3(.20,.12,.185),"#263e46",Vector3(0,1.99,-.025));ToonKit.orb(body,Vector3(.035,.045,.045),skin,Vector3(0,1.80,.18))
	for s in [-1,1]:ToonKit.orb(body,Vector3(.018,.026,.015),"#273f46",Vector3(s*.073,1.84,.175));ToonKit.box(body,Vector3(.06,.018,.018),"#273f46",Vector3(s*.075,1.89,.165),.004)
	ToonKit.box(body,Vector3(.025,.55,.02),"#f0dcb9",Vector3(0,1.23,.17),.005)
	for s in [-1,1]:
		var a=Node3D.new();a.position=Vector3(s*.31,1.48,0);body.add_child(a);ToonKit.orb(a,Vector3(.11,.20,.13),shirt,Vector3(s*.025,-.14,0));arms.append(a)
		var e=Node3D.new();e.position=Vector3(s*.025,-.32,0);a.add_child(e);ToonKit.orb(e,Vector3(.085,.18,.095),shirt,Vector3(0,-.11,0));ToonKit.box(e,Vector3(.16,.16,.17),skin,Vector3(0,-.29,.025),.06);elbows.append(e)
		var l=Node3D.new();l.position=Vector3(s*.15,.91,0);rig.add_child(l);ToonKit.box(l,Vector3(.22,.43,.27),"#253e4c",Vector3(0,-.18,0),.08);legs.append(l)
		var k=Node3D.new();k.position.y=-.4;l.add_child(k);ToonKit.box(k,Vector3(.19,.37,.24),"#253e4c",Vector3(0,-.14,0),.07);ToonKit.box(k,Vector3(.22,.12,.38),"#efe3c6",Vector3(0,-.38,.07),.05);knees.append(k)

func contact_time() -> float:
	return .18 if kind=="jab" else .29 if kind=="cross" else .33 if kind=="finish" else .28

func attack_duration() -> float:
	return .43 if kind=="jab" else .52 if kind=="cross" else .78 if kind=="finish" else .68

func strike(value: String="jab"):
	if hp<=0 or stun>0 or knockdown>0 or dodge_time>0 or vehicle:return
	if attack>=0:
		if hero and attack>.13:queued=value
		return
	if hero and value=="jab":
		combo_step=combo_step%3+1 if combo_window>0 else 1
		value=["jab","cross","finish"][combo_step-1]
	else:combo_step=0
	attack=0;kind=value;hand=1-hand;latched=false;combo_window=.85
	if hero:world.aim_assist()

func hurt(amount: float,direction: Vector3,vehicle_hit: bool=false):
	if hp<=0 or (immunity>0 and not vehicle_hit):return false
	var talents=world.get("talents") if hero else null
	if talents:amount*=talents.reduction(hp,max_hp)
	if hero and not vehicle_hit and Input.is_action_pressed("guard"):
		var facing=Vector3(sin(rotation.y),0,cos(rotation.y))
		if facing.dot(-direction.normalized())>.05:
			amount*=0.0 if talents and talents.has("defense3") and talents.guard_window>0 else .18 if talents and talents.has("defense2") else .3;guard_flash=.22;heat=minf(100,heat+5)
			if talents:talents.counter_window=.8
	reaction_direction=(global_basis.inverse()*direction).normalized();reaction_direction.y=0
	hp=maxf(0,hp-amount);stun=.28 if hp>0 else 2.0;impulse=direction;attack=-1;queued="";combo_step=0;combo_window=0;tell=0
	if hero:immunity=.4
	else:
		if friendly:
			panic=8;threat=position-direction.normalized()*2
			world.alarm_pedestrians(position,threat)
		if vehicle_hit:
			knockdown=clampf(3.0+amount*.055,3.0,8.5);stun=knockdown;immunity=.75;collision_layer=0;collision_mask=1
		if hp<=0:
			down_time=18;collision_layer=0;collision_mask=1
			if not friendly:world.loot(position)
	_sync_vehicle_hurtbox();return true

func _physics_process(dt):
	_sync_vehicle_hurtbox()
	if not world or world.paused or frozen:return
	traffic_evade=maxf(0,traffic_evade-dt);traffic_scan-=dt;panic=maxf(0,panic-dt);clock+=dt;stun=maxf(0,stun-dt);immunity=maxf(0,immunity-dt);guard_flash=maxf(0,guard_flash-dt);knockdown=maxf(0,knockdown-dt)
	if not hero:
		recovery_wait=hp>0 and knockdown>0 and knockdown<.52 and not can_stand()
		if recovery_wait:knockdown=.7;stun=maxf(stun,.7)
		fall_amount=move_toward(fall_amount,1.0 if hp<=0 or knockdown>.45 else 0.0,dt*(7.0 if hp<=0 or knockdown>.45 else 2.5))
		if hp>0 and knockdown<=0 and stun<=0 and traffic_scan<=0:traffic_scan=.1;notice_traffic()
	if attack<0:combo_window=maxf(0,combo_window-dt)
	if not hero:rig.visible=position.distance_squared_to(world.player.position)<120*120
	if vehicle:visible=false;return
	visible=true;collision_layer=0 if hp<=0 or knockdown>0 or fall_amount>.05 else 2;collision_mask=1 if hp<=0 or knockdown>0 or fall_amount>.05 else 7
	var move=world.movement() if hero else Vector3.ZERO
	if not hero:
		cooldown-=dt
		if hp<=0:
			down_time-=dt
			if respawn_enabled and down_time<=0 and world.player.position.distance_to(home)>35:position=home;hp=max_hp;stun=0;panic=0;fall_amount=0;recovery_wait=false
		else:
			var target=world.actor_target(self)
			var d=target.position-position;d.y=0
			if traffic_evade>0:
				move=world.steer_actor(self,traffic_direction)*1.25;tell=0
			elif not friendly and d.length()<13 and absf(target.position.y-position.y)<1.8 and not target.vehicle:
				rotation.y=lerp_angle(rotation.y,atan2(d.x,d.z),minf(1,dt*7))
				if d.length()>1.35:
					var flank=Vector3.ZERO
					if d.length()>2.5 and role=="flanker":flank=Vector3(d.z,0,-d.x).normalized()*.7
					move=world.steer_actor(self,(d.normalized()+flank).normalized())*.72
				elif cooldown<=0 and attack<0 and stun<=0 and knockdown<=0 and world.can_commit(self):
					tell+=dt
					if tell>(.82 if role=="bruiser" else .48):strike("heavy" if role=="bruiser" else "jab");tell=0;cooldown=1.5+randf()*.5
				else:tell=0
			elif friendly:
				if panic>0:
					var away=position-threat;away.y=0
					if away.length_squared()<.01:away=Vector3.RIGHT
					move=world.steer_actor(self,away.normalized())*1.15
				elif not path.is_empty():
					var destination=path[path_index];var step=destination-position;step.y=0
					if step.length()<.6:path_index=(path_index+1)%path.size()
					else:move=world.steer_actor(self,step.normalized())*.35
				else:
					move=Vector3(cos(clock*.18+home.x),0,sin(clock*.18+home.x))*.1
					if position.distance_to(home)>5:move=(home-position).normalized()*.2
			else:tell=0

	if stun>0 or hp<=0 or knockdown>0 or fall_amount>.05:move=Vector3.ZERO
	if attack>=0:move*=.15
	var run=(6.4 if hero else 3.4)*locomotion_scale
	if crouch:run*=.45
	velocity.x=move_toward(velocity.x,move.x*run,dt*28);velocity.z=move_toward(velocity.z,move.z*run,dt*28)
	if attack>=0 and attack<contact_time() and stun<=0:
		var push=2.9 if hero else 1.5;velocity.x=sin(rotation.y)*push;velocity.z=cos(rotation.y)*push
	if dodge_time>0:dodge_time-=dt;velocity.x=dodge_dir.x*11;velocity.z=dodge_dir.z*11
	# Keep knockback separate from locomotion: adding it back each tick accumulates
	# hundreds of metres of launch distance instead of one decaying reaction.
	var locomotion=Vector2(velocity.x,velocity.z)
	velocity.x+=impulse.x;velocity.z+=impulse.z;impulse=impulse.move_toward(Vector3.ZERO,dt*20)
	velocity.y=-.5 if is_on_floor() and velocity.y<=0 else velocity.y-22*dt
	move_and_slide()
	var actual_speed=Vector2(velocity.x,velocity.z).length()
	velocity.x=locomotion.x;velocity.z=locomotion.y
	if position.y< -4:position=home;velocity=Vector3.ZERO
	if move.length()>.1 and attack<0:rotation.y=lerp_angle(rotation.y,atan2(move.x,move.z),minf(1,dt*12))
	speed=actual_speed;gait+=speed*dt*2
	if attack>=0:
		attack+=dt
		if attack>=contact_time() and not latched:latched=true;pose();world.melee(self)
		if attack>=attack_duration():
			attack=-1
			if queued!="":var next=queued;queued="";strike(next)
	pose()

func pose():
	var moving=speed>.3 and hp>0 and is_on_floor()
	body.position.y=(absf(sin(gait))*.04 if moving else sin(clock*2)*.012)-(.35 if crouch else 0.0);body.rotation=Vector3.ZERO
	rig.rotation.z=lerp_angle(rig.rotation.z,1.45 if hp<=0 or knockdown>.35 else 0.0,.15)
	rig.position.y=(.13 if hero else 0.0)+.3*absf(sin(rig.rotation.z))
	for i in range(2):
		arms[i].position.z=0;arms[i].rotation=Vector3(-sin(gait+i*PI)*.4 if moving else -.12,0,(1 if i else -1)*.06);elbows[i].rotation.x=-.12;legs[i].rotation.x=sin(gait+i*PI)*.6 if moving else 0;knees[i].rotation.x=maxf(0,-sin(gait+i*PI))*.7 if moving else .03
	if attack>=0:
		var t=attack/attack_duration();var hit=sin(clampf((t-.12)/.57,0,1)*PI);var sign=1 if hand else -1
		arms[hand].rotation.x=-.7-hit*.9;arms[hand].rotation.y=-sign*.44*hit;arms[hand].position.z=hit*(.26 if hero else .13);elbows[hand].rotation.x=-.75*(1-hit);arms[1-hand].rotation.x=-.8;elbows[1-hand].rotation.x=-.7;body.rotation.y=sign*sin(t*TAU)*.28;body.rotation.x=hit*.09
		if kind=="cross":body.rotation.y=sign*hit*.65;arms[hand].rotation.y=-sign*.7*hit
		if kind=="finish":body.rotation.y=sign*hit*.55;arms[hand].rotation.y=-sign*.65*hit;arms[hand].rotation.x=-.7-hit*1.25;legs[1-hand].rotation.x=-.25*hit;body.position.y-=.12*hit
		if kind=="heat":body.rotation.y=t*TAU;arms[0].rotation=Vector3(-1.2,0,-.65);arms[1].rotation=Vector3(-1.2,0,.65)
		if kind=="kick":legs[hand].rotation.x=-1.35*hit;knees[hand].rotation.x=.25;body.rotation.x=-.12*hit
	elif tell>0:arms[1].rotation.x=-.95;elbows[1].rotation.x=-.8;body.rotation.y=-tell*.45
	if dodge_time>0:body.rotation.x=.45
	if attack<0 and hp>0 and not friendly:
		var engaged=hero and world.people.any(func(a):return not a.friendly and a.hp>0 and a.position.distance_to(position)<7) or not hero and world.player.position.distance_to(position)<8
		if engaged and not moving:
			for i in range(2):arms[i].rotation.x=-.85;arms[i].rotation.y=(.18 if i==0 else -.18);elbows[i].rotation.x=-.75
	if stun>0 and hp>0:
		body.rotation.x=reaction_direction.z*.48;body.rotation.z=-reaction_direction.x*.48;body.position.y-=.12
		for i in range(2):arms[i].rotation.x=-.4;arms[i].rotation.z=(.8 if i else -.8);elbows[i].rotation.x=-.25

	if hero and Input.is_action_pressed("guard") and attack<0:
		body.rotation.x=.08
		for i in range(2):arms[i].rotation=Vector3(-1.1,(.32 if i==0 else -.32),0);elbows[i].rotation.x=-.95
	if friendly and panic>0 and stun<=0 and knockdown<=0:
		for i in range(2):elbows[i].rotation.x=-.95
	if knockdown>0:body.position.y-=.24;body.rotation.x=-.25
	if not hero:pose_recovery()
	_sync_vehicle_hurtbox()

func _sync_vehicle_hurtbox():
	if not vehicle_hurtbox:return
	vehicle_hurtbox.collision_layer=8 if hp>0 and not vehicle and (collision_layer==2 or knockdown>0 or fall_amount>.05) else 0
	if hero:vehicle_hurtbox.position=Vector3.UP*1.06;vehicle_hurtbox.quaternion=Quaternion.IDENTITY
	else:
		vehicle_hurtbox.quaternion=rig.quaternion
		vehicle_hurtbox.position=rig.position+rig.quaternion*Vector3.UP*.975

func can_stand() -> bool:
	var shape=CapsuleShape3D.new();shape.radius=.29;shape.height=1.85
	var query=PhysicsShapeQueryParameters3D.new();query.shape=shape;query.transform=Transform3D(Basis.IDENTITY,global_position+Vector3.UP*1.01);query.collision_mask=5;query.exclude=[get_rid()]
	return get_world_3d().direct_space_state.intersect_shape(query,4).is_empty()

func notice_traffic():
	for car in world.cars:
		if absf(car.speed)<4:continue
		var forward=Vector3(sin(car.rotation.y),0,cos(car.rotation.y))*signf(car.speed)
		var side=Vector3(-forward.z,0,forward.x);var relative=global_position-car.global_position
		if absf(relative.y)>1.8:continue
		var approach=(relative.dot(forward)-2.2)/absf(car.speed);var lateral=relative.dot(side)
		if approach<.18 or approach>.85 or absf(lateral)>1.8:continue
		if not get_world_3d().direct_space_state.intersect_ray(PhysicsRayQueryParameters3D.create(car.global_position+Vector3.UP*.9,global_position+Vector3.UP*.9,1)).is_empty():continue
		var choice=signf(lateral) if absf(lateral)>.12 else (1.0 if get_instance_id()%2==0 else -1.0)
		traffic_direction=side*choice;traffic_evade=.9;attack=-1;tell=0
		if friendly:panic=maxf(panic,2.5);threat=car.global_position
		return

func pose_recovery():
	if fall_amount<=.001:
		rig.rotation=Vector3.ZERO;rig.position.y=-.045
		return
	var direction=reaction_direction
	if direction.length_squared()<.01:direction=Vector3.BACK
	var axis=Vector3(direction.z,0,-direction.x).normalized()
	rig.quaternion=Quaternion(axis,fall_amount*1.48)
	body.rotation=body.rotation.lerp(Vector3(.1,0,0),fall_amount);body.position.y=lerpf(body.position.y,-.1,fall_amount)
	var recovering=hp>0 and knockdown<=.45
	var brace=sin(fall_amount*PI) if recovering else 0.0
	for i in range(2):
		legs[i].rotation.x=lerpf(legs[i].rotation.x,-.18 if i==0 else .18,fall_amount)-brace*.7
		knees[i].rotation.x=lerpf(knees[i].rotation.x,.45 if i==0 else .65,fall_amount)+brace*.8
		arms[i].rotation=arms[i].rotation.lerp(Vector3(.05,0,-.65 if i==0 else .65),fall_amount)
		elbows[i].rotation.x=lerpf(elbows[i].rotation.x,.08,fall_amount)-brace*.9
		arms[i].rotation.x-=brace*1.1
	body.position.y-=brace*.22
	rig.position.y=0
	if is_on_floor():rig.position.y=(.025-floor_clearance())/maxf(get_floor_normal().y,.5)

func floor_clearance() -> float:
	var normal=get_floor_normal() if is_on_floor() else Vector3.UP
	var lowest=INF
	for part in pose_support:
		for point in part.points:lowest=minf(lowest,normal.dot(part.node.global_transform*point-global_position))
	return lowest
