class_name ChapterFighter
extends StreetActor

var assignment="player"
var guard_open=0.0
var guard_hits=0
var shield: Node3D
var charge_time=-1.0
var charge_direction=Vector3.ZERO
var charge_hit=false
var charge_cooldown=2.0
var entrance_route=[]
var entrance_index=0
var charge_warning: MeshInstance3D

func _ready():
	super._ready();respawn_enabled=false
	if role=="charger":
		charge_warning=ToonKit.polygon(self,PackedVector2Array([Vector2(-1.1,0),Vector2(1.1,0),Vector2(.6,6.6),Vector2(-.6,6.6)]),"#e99c4b",Vector3.UP*.055);charge_warning.rotation.x=PI/2
		var warning_mat=StandardMaterial3D.new();warning_mat.albedo_color=Color(1,.36,.12,.38);warning_mat.transparency=BaseMaterial3D.TRANSPARENCY_ALPHA;warning_mat.shading_mode=BaseMaterial3D.SHADING_MODE_UNSHADED;warning_mat.cull_mode=BaseMaterial3D.CULL_DISABLED;charge_warning.material_override=warning_mat;charge_warning.visible=false
	if role=="shield":
		shield=ToonKit.box(body,Vector3(.58,.84,.13),"#4f697e",Vector3(-.20,1.22,.35),.12);ToonKit.finish(body)

func _human():
	super._human()
	if role=="charger":
		ToonKit.box(body,Vector3(.42,.10,.38),"#f3bf5d",Vector3(0,1.99,0),.04)
		ToonKit.box(body,Vector3(.38,.42,.08),"#f0b84d",Vector3(0,1.20,.19),.04)
	elif assignment=="staff":
		ToonKit.box(body,Vector3(.47,.39,.08),"#526789",Vector3(0,1.27,.20),.04)

func hurt(amount: float,direction: Vector3,vehicle_hit: bool=false):
	if role=="shield" and guard_open<=0 and stun<=0 and not vehicle_hit and Vector3(sin(rotation.y),0,cos(rotation.y)).dot(-direction.normalized())>.35:
		if amount>=23:guard_open=2.6;guard_hits=0;world.hud.say("破防 · 趁他失去平衡")
		else:
			amount*=.22;guard_hits+=1;world.sound("hit",.4)
			if guard_hits>=4:guard_open=2.0;guard_hits=0
			else:world.hud.say("正面守得很紧 · R重击、F踢击或绕到侧面")
	var hit=super.hurt(amount,direction,vehicle_hit)
	if hit:charge_time=-1;charge_cooldown=3.5
	return hit

func _physics_process(dt):
	if world.paused or frozen:return
	guard_open=maxf(0,guard_open-dt);charge_cooldown-=dt
	if charge_warning:charge_warning.visible=charge_time>=0 and charge_time<.85 and hp>0 and stun<=0
	if shield:shield.visible=guard_open<=0 and hp>0 and knockdown<=0
	if not entrance_route.is_empty() and entrance_index<entrance_route.size() and hp>0 and stun<=0:
		var d=entrance_route[entrance_index]-position;d.y=0
		if d.length()<1.0:entrance_index+=1
		else:
			velocity=Vector3(d.normalized().x*3.2,velocity.y-22*dt,d.normalized().z*3.2);move_and_slide();rotation.y=atan2(d.x,d.z);speed=Vector2(velocity.x,velocity.z).length();clock+=dt;gait+=speed*dt*2;pose();return
	if role=="charger" and hp>0 and stun<=0 and knockdown<=0:
		var target=world.actor_target(self);var delta=target.position-position;delta.y=0
		if charge_time<0 and charge_cooldown<=0 and delta.length()>3 and delta.length()<9 and world.can_commit(self):
			charge_time=0;charge_hit=false;charge_direction=delta.normalized();rotation.y=atan2(delta.x,delta.z)
		if charge_time>=0:
			charge_time+=dt;clock+=dt;immunity=maxf(0,immunity-dt);attack=-1;queued=""
			var rushing=charge_time>=.85 and charge_time<1.65
			tell=charge_time if not rushing else 0;velocity=charge_direction*(10.5 if rushing else 0);velocity.y=-1 if is_on_floor() else -5
			move_and_slide();speed=10.5 if rushing else 0;gait+=speed*dt*2;pose()
			if rushing:
				body.rotation.x=.4
				if not charge_hit and position.distance_to(target.position)<1.65:
					var ray=PhysicsRayQueryParameters3D.create(position+Vector3.UP,target.position+Vector3.UP,1)
					if world.get_world_3d().direct_space_state.intersect_ray(ray).is_empty():target.hurt(17,charge_direction*7);world.impact(target.position+Vector3.UP,true);charge_hit=true
				for i in range(get_slide_collision_count()):
					if absf(get_slide_collision(i).get_normal().y)<.3:charge_time=1.7
			if charge_time>=1.65:charge_time=-1;charge_cooldown=4;stun=1.25;tell=0;world.hud.say("冲撞落空 · 可以反击")
			return
	super._physics_process(dt)
