class_name StreetCar
extends CharacterBody3D

var world: Node3D
var driver: StreetActor
var paint="#df8659"
var speed=0.0
var steer=0.0
var hp=180.0
var wheels=[]
var rolls=[]
var door: Node3D
var door_angle=0.0
var pedestrian_sweep: ShapeCast3D

func _ready():
	collision_layer=4;collision_mask=5;floor_snap_length=.4
	var col=CollisionShape3D.new();var shape=BoxShape3D.new();shape.size=Vector3(1.86,.8,4.35);col.shape=shape;col.position.y=.4;add_child(col)
	var roof=CollisionShape3D.new();var cabin=BoxShape3D.new();cabin.size=Vector3(1.55,.65,1.65);roof.shape=cabin;roof.position=Vector3(0,1.335,-.2);add_child(roof)
	pedestrian_sweep=ShapeCast3D.new();var sweep_shape=BoxShape3D.new();sweep_shape.size=Vector3(1.96,1.5,4.45);pedestrian_sweep.shape=sweep_shape;pedestrian_sweep.collision_mask=2;pedestrian_sweep.max_results=16;pedestrian_sweep.enabled=false;add_child(pedestrian_sweep)
	_build();ToonKit.outline(self);ToonKit.finish(self)

func _build():
	var profile=PackedVector2Array([Vector2(-2.22,.44),Vector2(-2.24,.83),Vector2(-1.8,.97),Vector2(-1.27,1.02),Vector2(-.83,1.61),Vector2(.5,1.66),Vector2(1.11,1.05),Vector2(1.93,.97),Vector2(2.24,.79),Vector2(2.21,.43)])
	for z in [1.34,-1.32]:
		for i in range(17):var a=PI*i/16;profile.append(Vector2(z+cos(a)*.49,.44+sin(a)*.49))
	profile.append(Vector2(-2.22,.44));var ix=Geometry2D.triangulate_polygon(profile);var st=SurfaceTool.new();st.begin(Mesh.PRIMITIVE_TRIANGLES)
	for side in [-1,1]:
		for i in range(0,ix.size(),3):
			for j in ([0,1,2] if side>0 else [0,2,1]):var p=profile[ix[i+j]];st.add_vertex(Vector3(side*.94,p.y,p.x))
	for i in range(profile.size()-1):
		var a=profile[i];var b=profile[i+1];var p=[Vector3(-.94,a.y,a.x),Vector3(.94,a.y,a.x),Vector3(-.94,b.y,b.x),Vector3(.94,b.y,b.x)]
		for j in [0,1,2,1,3,2]:st.add_vertex(p[j])
	st.generate_normals();var material=ToonKit.mat(paint,true).duplicate();material.cull_mode=BaseMaterial3D.CULL_DISABLED;ToonKit.mesh(self,st.commit(),material)
	_pane([Vector3(-.84,1.09,1.15),Vector3(.84,1.09,1.15),Vector3(.84,1.63,.58),Vector3(-.84,1.63,.58)])
	_pane([Vector3(-.84,1.60,-.82),Vector3(.84,1.60,-.82),Vector3(.84,1.06,-1.27),Vector3(-.84,1.06,-1.27)])
	for side in [-1,1]:
		_pane([Vector3(side*.955,1.08,.96),Vector3(side*.955,1.08,-1.14),Vector3(side*.955,1.56,-.78),Vector3(side*.955,1.6,.42)])
		ToonKit.box(self,Vector3(.04,.51,.055),paint,Vector3(side*.97,1.34,-.24),.01);ToonKit.box(self,Vector3(.04,.06,.22),"#f4dbac",Vector3(side*.98,1.01,.1),.02);ToonKit.box(self,Vector3(.24,.14,.23),paint,Vector3(side*1.05,1.16,.77),.05);ToonKit.box(self,Vector3(.06,.12,.18),"#34535b",Vector3(side*1.17,1.16,.77),.02)
		ToonKit.box(self,Vector3(.5,.15,.07),"#fff0b2",Vector3(side*.59,.76,2.19),.03);ToonKit.box(self,Vector3(.48,.13,.06),"#dc5e53",Vector3(side*.61,.78,-2.23),.03)
		for z in [-1.32,1.34]:
			var pivot=Node3D.new();pivot.position=Vector3(side*.96,.44,z);add_child(pivot);wheels.append(pivot);var roll=Node3D.new();pivot.add_child(roll);rolls.append(roll)
			var tire=ToonKit.cyl(roll,.435,.27,"#253c43",Vector3.ZERO,-1,24);tire.rotation.z=PI/2;var hub=ToonKit.cyl(roll,.27,.285,"#d4d9ca");hub.rotation.z=PI/2;var core=ToonKit.cyl(roll,.09,.3,"#365a61");core.rotation.z=PI/2
			for i in range(5):var a=i*TAU/5;var spoke=ToonKit.box(roll,Vector3(.31,.055,.18),"#587b80",Vector3(0,sin(a)*.16,cos(a)*.16),.01);spoke.rotation.x=-a
			ToonKit.merge_direct(roll)
	ToonKit.box(self,Vector3(1.55,.15,.11),"#263e48",Vector3(0,.6,2.24),.02);ToonKit.box(self,Vector3(1.68,.11,.15),"#d9ddc9",Vector3(0,.4,2.25),.03);ToonKit.box(self,Vector3(1.67,.12,.14),"#263e48",Vector3(0,.43,-2.24),.03);ToonKit.box(self,Vector3(.46,.16,.025),"#457ab0",Vector3(0,.58,-2.32),.01);ToonKit.text(self,"沪 A · 0721",Vector3(0,.58,-2.34),.00085).rotation.y=PI
	for x in [-.14,.14]:ToonKit.box(self,Vector3(.15,.02,1),"#f3dfbd",Vector3(x,1.03,1.55),.005)
	door=Node3D.new();door.position=Vector3(-.97,0,.78);add_child(door);ToonKit.box(door,Vector3(.055,.37,1.1),paint,Vector3(0,.83,-.55),.02)

func _pane(points: Array):
	var st=SurfaceTool.new();st.begin(Mesh.PRIMITIVE_TRIANGLES)
	for i in [0,2,1,0,3,2]:st.add_vertex(points[i])
	st.generate_normals();var m=ToonKit.mat("#294f60").duplicate();m.cull_mode=BaseMaterial3D.CULL_DISABLED;ToonKit.mesh(self,st.commit(),m)

func _physics_process(dt):
	if not world or world.paused:return
	var throttle=0.0;var turn=0.0
	if driver:
		throttle=Input.get_action_strength("forward")-Input.get_action_strength("back");turn=Input.get_action_strength("left")-Input.get_action_strength("right")
		if throttle!=0:speed=move_toward(speed,throttle*26,dt*(11 if speed*throttle<0 else 6))
		else:speed=move_toward(speed,0,dt*2.6)
		if Input.is_action_pressed("jump"):speed=move_toward(speed,0,dt*24)
	else:speed=move_toward(speed,0,dt*6)
	steer=move_toward(steer,turn,dt*4);rotation.y+=steer*clampf(speed/7,-1,1)*dt*.85/(1+absf(speed)*.025);rotation.x=0;rotation.z=0
	var previous=global_position;var forward=Vector3(sin(rotation.y),0,cos(rotation.y));velocity.x=forward.x*speed;velocity.z=forward.z*speed;velocity.y=-1 if is_on_floor() else velocity.y-20*dt;move_and_slide()
	for i in range(get_slide_collision_count()):
		var hit=get_slide_collision(i)
		if absf(hit.get_normal().y)<.3:
			hp=maxf(0,hp-absf(speed)*dt*.3);speed=move_toward(speed,0,dt*50)
	var travelled=global_position-previous;travelled.y=0
	if absf(speed)>1 and absf(travelled.dot(forward))<absf(speed)*dt*.2:speed=0
	_hit_pedestrians(previous)
	for i in range(wheels.size()):wheels[i].rotation.y=steer*.4 if wheels[i].position.z>0 else 0;rolls[i].rotation.x+=speed*dt/.435
	door_angle=move_toward(door_angle,0,dt*2);door.rotation.y=-door_angle
	if driver:driver.position=position
	if position.y< -5:position=Vector3(-45,.3,40);speed=0;velocity=Vector3.ZERO

func _hit_pedestrians(previous: Vector3):
	if absf(speed)<3:return
	# Sweep only the distance the car really travelled, after solid-world collision.
	pedestrian_sweep.global_transform=Transform3D(global_basis,previous+Vector3.UP*.85)
	pedestrian_sweep.target_position=global_basis.inverse()*(global_position-previous)
	pedestrian_sweep.force_shapecast_update()
	var travel=Vector3(sin(rotation.y),0,cos(rotation.y))*signf(speed)
	for i in range(pedestrian_sweep.get_collision_count()):
		var person=pedestrian_sweep.get_collider(i)
		if not person is StreetActor or person==driver or person.hp<=0 or person.knockdown>0:continue
		var origin=global_position+Vector3.UP*.9
		if world.get_world_3d().direct_space_state.intersect_ray(PhysicsRayQueryParameters3D.create(origin,person.global_position+Vector3.UP*.9,1)):continue
		if person.hurt(clampf(absf(speed)*2.6,10,70),travel*minf(absf(speed)*.75,12),true):
			world.impact(person.position+Vector3.UP*.8,true);speed*=.94
