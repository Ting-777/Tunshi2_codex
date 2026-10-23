class_name ChapterBoss
extends ChapterFighter

const BOSS_NAME="沈铁川"
const BOSS_TITLE="Carry旗下 · 现场执行头目"
const ARENA=Vector3(-135,.05,-216)
var face: StoryFace
var phase=1
var phase_flash=0.0
var move_name=""
var move_time=-1.0
var move_direction=Vector3.ZERO
var move_origin=Vector3.ZERO
var recovery=0.0
var move_count=0
var contact_mask=0
var guard_break=0.0
var pressure=0
var fought=false
var warning: MeshInstance3D

func _ready():
	role="boss";assignment="player";max_hp=560;hp=max_hp
	super._ready();face.refine_outlines()
	warning=ToonKit.polygon(self,PackedVector2Array([Vector2(-1.15,0),Vector2(1.15,0),Vector2(1.15,6.8),Vector2(-1.15,6.8)]),"#eeb36b",Vector3.UP*.055);warning.rotation.x=PI/2
	var mat=StandardMaterial3D.new();mat.albedo_color=Color(1,.45,.1,.28);mat.transparency=BaseMaterial3D.TRANSPARENCY_ALPHA;mat.shading_mode=BaseMaterial3D.SHADING_MODE_UNSHADED;mat.cull_mode=BaseMaterial3D.CULL_DISABLED;warning.material_override=mat;warning.visible=false

func _human():
	# Authored broad silhouette, cropped jacket, copper wrist guards and heavy shoes.
	body=Node3D.new();body.name="ShenTieChuanBody";rig.add_child(body)
	ToonKit.box(body,Vector3(.86,.76,.43),"#30485a",Vector3(0,1.29,0),.18)
	ToonKit.box(body,Vector3(.38,.65,.075),"#cc744b",Vector3(0,1.31,.235),.08)
	for s in [-1,1]:
		var lapel=ToonKit.box(body,Vector3(.18,.49,.075),"#e4d0aa",Vector3(s*.22,1.48,.24),.04);lapel.rotation.z=s*.25
	ToonKit.box(body,Vector3(.65,.18,.37),"#22323e",Vector3(0,.91,0),.07)
	ToonKit.cyl(body,.13,.18,"#ddb08e",Vector3(0,1.78,0))
	face=StoryFace.new();body.add_child(face);face.build("shen");face.position=Vector3(0,2.06,.01);face.scale=Vector3.ONE*.66
	for s in [-1,1]:
		var a=Node3D.new();a.position=Vector3(s*.44,1.60,0);body.add_child(a);arms.append(a)
		ToonKit.orb(a,Vector3(.17,.23,.17),"#30485a",Vector3(s*.025,-.15,0))
		var e=Node3D.new();e.position=Vector3(s*.025,-.34,0);a.add_child(e);elbows.append(e)
		ToonKit.orb(e,Vector3(.125,.19,.13),"#ddb08e",Vector3(0,-.13,0));ToonKit.box(e,Vector3(.25,.19,.24),"#b97c4d",Vector3(0,-.28,.03),.07);ToonKit.orb(e,Vector3(.13,.12,.13),"#ddb08e",Vector3(0,-.38,.04))
		var l=Node3D.new();l.position=Vector3(s*.20,.91,0);rig.add_child(l);legs.append(l)
		ToonKit.box(l,Vector3(.29,.46,.31),"#263846",Vector3(0,-.19,0),.09)
		var k=Node3D.new();k.position.y=-.42;l.add_child(k);knees.append(k)
		ToonKit.box(k,Vector3(.25,.35,.28),"#263846",Vector3(0,-.14,0),.08);ToonKit.box(k,Vector3(.29,.15,.43),"#5b4e45",Vector3(0,-.39,.07),.06)

func begin_move(value: String):
	move_name=value;move_time=0;contact_mask=0;move_origin=position
	var delta=world.player.position-position;delta.y=0
	move_direction=delta.normalized() if delta.length()>.01 else Vector3.BACK
	rotation.y=atan2(move_direction.x,move_direction.z);attack=-1;tell=0

func hurt(amount: float,direction: Vector3,vehicle_hit: bool=false):
	if frozen:return false
	var frontal=Vector3(sin(rotation.y),0,cos(rotation.y)).dot(-direction.normalized())>.4
	var armored=move_time>=0 and move_name=="shoulder" and move_time<.9
	if guard_break<=0 and recovery<=0 and move_time<0 and frontal and not vehicle_hit:
		if amount>=23:guard_break=1.7;pressure=0;world.hud.say("铁闸破防 · 重击或侧后方进攻")
		else:
			amount*=.28;pressure+=1
			if pressure>=3:guard_break=.9;pressure=0
	var hit=super.hurt(amount,direction,vehicle_hit)
	if hit and hp>0:
		if armored and not vehicle_hit:stun=0;impulse*=.15
		else:
			move_time=-1;recovery=maxf(recovery,.32 if amount<23 else .65);stun=minf(stun,.18);immunity=.15
	return hit

func _connect_hit(index: int,damage: float,reach: float,arc: float,low: bool=false):
	if contact_mask&(1<<index):return
	contact_mask|=1<<index
	var p=world.player;var d=p.position-position;var vertical=d.y;d.y=0
	if d.length()>reach or vertical>1.1 or (low and vertical>.6):return
	var forward=Vector3(sin(rotation.y),0,cos(rotation.y))
	if d.normalized().dot(forward)<arc:return
	var ray=PhysicsRayQueryParameters3D.create(position+Vector3.UP,p.position+Vector3.UP,1)
	if not world.get_world_3d().direct_space_state.intersect_ray(ray).is_empty():return
	if p.hurt(world.enemy_damage(damage),d.normalized()*5):
		world.impact(p.position+Vector3.UP,true);world.sound("hit",.8)
		if low and p.dodge_time<=0:p.stun=maxf(p.stun,.5)

func _physics_process(dt):
	if world.paused or frozen:return
	if hp<=0 or knockdown>0:
		warning.visible=false;super._physics_process(dt);return
	clock+=dt;immunity=maxf(0,immunity-dt);stun=maxf(0,stun-dt);guard_break=maxf(0,guard_break-dt);phase_flash=maxf(0,phase_flash-dt);recovery=maxf(0,recovery-dt)
	if hp<=max_hp*.5 and phase==1:
		phase=2;phase_flash=2.2;world.bark_group("boss_phase");world.sound("boss_sting",.8);world.hud.say("铁闸改变架势 · 冲肩后还会接第二次，不要抢攻")
	var delta=world.player.position-position;delta.y=0
	if move_time<0 and stun<=0 and recovery<=0:
		if delta.length()>9.5:
			move_direction=world.steer_actor(self,delta.normalized());velocity.x=move_direction.x*3.3;velocity.z=move_direction.z*3.3;rotation.y=atan2(delta.x,delta.z)
		elif delta.length()>3.5 and move_count%2==0:begin_move("shoulder");move_count+=1
		elif delta.length()>2.0:
			var direction=world.steer_actor(self,delta.normalized());velocity.x=direction.x*2.8;velocity.z=direction.z*2.8;rotation.y=atan2(delta.x,delta.z)
		else:begin_move("sweep" if move_count%3==2 else "combo");move_count+=1
	else:velocity.x=move_toward(velocity.x,0,dt*25);velocity.z=move_toward(velocity.z,0,dt*25)
	if move_time>=0:
		move_time+=dt;velocity.x=0;velocity.z=0
		match move_name:
			"combo":
				if move_time>=.62:_connect_hit(0,9,2.0,.25)
				if move_time>=1.05:_connect_hit(1,10,2.2,.1)
				if move_time>=1.72:_connect_hit(2,19,2.5,.3)
				if move_time>1.95:move_time=-1;recovery=1.1
			"sweep":
				if move_time>=.95:_connect_hit(0,19,2.65,-.5,true)
				if move_time>1.28:move_time=-1;recovery=1.4
			"shoulder":
				var rushing=(move_time>=.95 and move_time<1.48) or (phase==2 and move_time>=2.10 and move_time<2.58)
				if rushing:
					velocity.x=move_direction.x*10;velocity.z=move_direction.z*10
					_connect_hit(0 if move_time<1.5 else 1,22,1.8,.05)
					# A miss remains a miss until a new contact interval, not one damage sample at launch.
					if world.player.position.distance_to(position)>1.8:contact_mask&=~(1<<(0 if move_time<1.5 else 1))
				if phase==2 and move_time>=1.65 and move_time<2.1:
					if move_time-dt<1.65:
						move_direction=delta.normalized();rotation.y=atan2(delta.x,delta.z)
				if move_time>(2.65 if phase==2 else 1.55):move_time=-1;recovery=1.6
	velocity+=Vector3(impulse.x,0,impulse.z);impulse=impulse.move_toward(Vector3.ZERO,dt*20);velocity.y=-.5 if is_on_floor() else velocity.y-22*dt
	move_and_slide();speed=Vector2(velocity.x,velocity.z).length();gait+=speed*dt*2
	pose();_boss_pose();face.animate(dt,false)
	warning.visible=move_time>=0 and move_name=="shoulder" and (move_time<.95 or (phase==2 and move_time>=1.65 and move_time<2.1))
	_sync_vehicle_hurtbox()

func _boss_pose():
	if hp<=0:return
	for i in range(2):arms[i].rotation.x=-.85;elbows[i].rotation.x=-1.3
	if recovery>0:body.rotation.x=.16;arms[0].rotation.x=-.3;return
	if move_time<0:return
	var t=move_time
	match move_name:
		"combo":
			var hand_value=0 if t<.85 else 1
			var beat=sin(clampf((t-(.30 if t<.85 else .75))/.44,0,1)*PI)
			arms[hand_value].rotation.x=-.8-beat*1.3;elbows[hand_value].rotation.x=-1.1+beat
			if t>1.2:arms[0].rotation.x=-2.5+smoothstep(1.5,1.84,t)*2.3;body.rotation.x=smoothstep(1.5,1.84,t)*.3
		"sweep":
			body.rotation.y=sin(clampf(t/1.28,0,1)*PI)*1.0;legs[1].rotation.x=-sin(clampf((t-.6)/.65,0,1)*PI)*1.4;body.position.y=-.1
		"shoulder":body.rotation.x=.18 if t<.95 else .48;arms[0].rotation.x=-.4;elbows[0].rotation.x=-1.6
