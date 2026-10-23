class_name ChapterDummy
extends StreetActor

var pad: Node3D
var swing=0.0
var practice_role=0
func _human():
	body=Node3D.new();rig.add_child(body)
	ToonKit.box(body,Vector3(.9,1.25,.22),["#c8aa77","#a1b5a6","#bc9991"][practice_role],Vector3(0,1.05,0),.08)
	ToonKit.box(body,Vector3(.14,.75,.14),"#6f8992",Vector3(0,.35,0));ToonKit.box(body,Vector3(.85,.08,.75),"#617e89",Vector3(0,.04,0))
	ToonKit.orb(body,Vector3(.36,.36,.16),"#e2c394",Vector3(0,1.93,0));ToonKit.text(body,"?" if practice_role==2 else "门" if practice_role==0 else "挡",Vector3(0,1.25,.14),.006,"#4b6672")
	pad=Node3D.new();pad.position=Vector3(.65,1.2,.1);body.add_child(pad);ToonKit.box(pad,Vector3(.9,.25,.45),"#e8dfbe",Vector3.ZERO,.08)
func hurt(amount: float,direction: Vector3,vehicle_hit: bool=false):
	if hp<=0:return false
	if practice_role==0 and world.player.kind not in ["heavy","kick","heat"]:amount*=.35;world.hud.say("纸板门加了两层 · 重击或踢击更有效")
	return super.hurt(amount,direction,vehicle_hit)
func _physics_process(dt):
	if world.paused:return
	clock+=dt;stun=maxf(0,stun-dt);immunity=maxf(0,immunity-dt);knockdown=0;fall_amount=0
	velocity=impulse;impulse=impulse.move_toward(Vector3.ZERO,dt*20);velocity.y=-.5 if is_on_floor() else velocity.y-22*dt;move_and_slide()
	body.rotation.z=sin(clock*10)*stun*.18
	if hp<=0:body.rotation.x=move_toward(body.rotation.x,1.35,dt*3);return
	if practice_role==1:
		swing=fmod(clock,3.2);pad.position.z=.1+sin(clampf((swing-1.1)*PI,0,PI))*.85
		if swing>1.55 and swing<1.65 and world.player.position.distance_to(position)<2.25 and world.player.immunity<=0:
			var hp_before=world.player.hp;world.player.hurt(4,(world.player.position-position).normalized())
			world.player.hp=maxf(1,world.player.hp)
			if hp_before!=world.player.hp:world.hud.say("软垫摆过来了 · 可以格挡或向侧面闪避")
