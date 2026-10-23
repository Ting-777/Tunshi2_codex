class_name PrologueDirector
extends Node

signal completed(kind: String)
var world: Node3D
var kind=""
var elapsed=0.0
var duration=0.0
var dark=0.0
var flash=0.0
var caption=""
var switched=false
var shot_texture: Texture2D
var show_photo=false
var start_camera=Vector3.ZERO
var baby_end=0.0
var opening: LegacyOpening
var speaker=""
var subtitle=""
var card_title=""

func active() -> bool:return kind!=""

func start(sequence: String):
	if active():cancel()
	kind=sequence;elapsed=0;switched=false;dark=0;flash=0;show_photo=false;caption=""
	duration={"wake":4.0,"exit":2.8,"gather":2.8,"photo":3.6,"years":8.0,"leave":5.0}.get(kind,2.0)
	if kind=="years":baby_end=2.4+world.voice.clip_length("montage_baby")+.45;duration=baby_end+world.voice.clip_length("montage_grown")+.7
	world.paused=true;world.photo_camera=true;world._clear_input();world.voice.stop();Input.mouse_mode=Input.MOUSE_MODE_VISIBLE
	start_camera=world.camera.position
	if kind=="legacy":opening=LegacyOpening.new();opening.build(world);duration=opening.duration
	if kind=="wake":
		dark=1
		world.player.position=Vector3(-9.1,.9,-11);world.player.rig.rotation.z=PI/2
	if kind=="photo":
		world.player.position=Vector3(0,.14,1);world.player.rotation.y=0
		for actor in world.cast.values():actor.gesture="wave"
	if kind=="exit" and world.room.has("door"):world.room.door.requested_open=true
	if kind=="leave" and world.room.has("door"):world.room.door.requested_open=true

func tick(dt: float):
	if not active() or world.pause_menu:return
	elapsed+=dt
	if kind=="legacy":
		opening.tick(elapsed,dt)
		if elapsed>=duration:finish()
		return
	var t=clampf(elapsed/duration,0,1);var smooth=t*t*(3-2*t)
	match kind:
		"wake":
			caption="长沙 · 八子计划完成的这一天";dark=maxf(0,1-elapsed/.8)
			_camera(Vector3(-3.5,2.8,-5).lerp(Vector3(-6.4,2.5,-8.5),smooth),Vector3(-8.5,1.4,-11))
			if t>.55:
				var rise=smoothstep(.55,1,t);world.player.rig.rotation.z=lerpf(PI/2,0,rise);world.player.position=Vector3(-9.1,.9,-11).lerp(Vector3(-7.8,.14,-9.5),rise)
		"exit":
			caption="先把接人的位置腾出来"
			_camera(Vector3(0,2.4,-3.5).lerp(Vector3(-3,2.5,7),smooth),Vector3(0,1,5))
		"gather":
			caption="一、二、三、四……八。人都到齐了。"
			dark=1-absf(t*2-1);dark=smoothstep(.35,.8,dark)
			if t>.48 and not switched:switched=true;world._arrange_photo()
			_camera(Vector3(6,3.0,14),Vector3(1.5,1.1,2))
		"photo":
			caption="第一张全家合照"
			_camera(Vector3(6,3.2,15).lerp(Vector3(2,2.8,12.5),smooth),Vector3(1.4,1.25,2.4))
			if t>.70 and not switched:
				switched=true;flash=.9;world.sound("shutter",.75);_remember_photo.call_deferred()
			flash=move_toward(flash,0,dt*3)
		"years":
			if elapsed<2.4:
				show_photo=shot_texture!=null;caption="八子俱全 · 第一次合照";dark=clampf((elapsed-1.8)/.6,0,1)
			elif elapsed<baby_end:
				if not switched:
					switched=true;show_photo=false;world.phase=3;world._build_phase();world.photo_camera=true
					for i in range(world.sons.size()):
						world.sons[i].rig.scale=Vector3.ONE*.22;world.sons[i].rig.rotation.z=PI/2;world.sons[i].position=Vector3(3.6+(i%4)*2.8,.88,-10.7+(i/4)*4.3)
					world.voice.speak(world.voice.lines("montage_baby")[0])
				caption="最初，是八个人轮流醒。";dark=maxf(0,1-(elapsed-2.4)/.65)
				_camera(Vector3(14,3.4,-5.0).lerp(Vector3(13.5,3.3,-5.2),(elapsed-2.4)/(baby_end-2.4)),Vector3(7.5,1,-9))
			else:
				if switched:
					switched=false;world._place_grown_sons();world.voice.speak(world.voice.lines("montage_grown")[0])
				caption="几年以后 · 八个儿子，八个主意";dark=maxf(0,1-(elapsed-baby_end)/.65)
				_camera(Vector3(8,2.8,10).lerp(Vector3(6,2.8,9),(elapsed-baby_end)/(duration-baby_end)),Vector3(1,1.0,3))
				for i in range(world.sons.size()):
					var actor=world.sons[i];actor.gesture="wave" if i==2 else "talk";actor.rotation.y=sin(elapsed+i)*.12
		"leave":
			caption="一个都不少 · 下一站，上海"
			_camera(Vector3(5,2.7,8),Vector3(0,1.1,11.5));dark=clampf((t-.70)/.30,0,1)
			for i in range(world.sons.size()):
				var actor=world.sons[i];var target=Vector3(-1.1+(i%4)*.72,0,9.2+(i/4)*1.0)
				actor.position=actor.position.move_toward(target,dt*1.6);actor.rotation.y=0;actor.gesture="walk"
	if elapsed>=duration:finish()

func _remember_photo():
	if DisplayServer.get_name()=="headless":return
	world.hud.photo=true
	await get_tree().process_frame
	await RenderingServer.frame_post_draw
	shot_texture=ImageTexture.create_from_image(world.get_viewport().get_texture().get_image())
	world.hud.photo=false

func _camera(p: Vector3,target: Vector3):world.camera.position=p;world.camera.look_at(target)

func skip():
	if active():finish()

func finish():
	if not active():return
	var done=kind;kind="";show_photo=false;dark=0;flash=0;caption="";world.voice.stop()
	if opening:opening.dispose();opening=null
	speaker="";subtitle="";card_title=""
	world.player.rig.rotation=Vector3.ZERO
	if done=="wake":world.player.position=Vector3(-7.8,.14,-9.5)
	if done=="gather":world._arrange_photo()
	if done=="years":
		if world.phase!=3:world.phase=3;world._build_phase()
		world._place_grown_sons()
	if done=="leave":world.phase=5;world._build_phase()
	for actor in world.cast.values():actor.gesture="idle"
	for actor in world.sons:actor.gesture="idle"
	world.photo_camera=false;world.paused=false;completed.emit(done)

func cancel():
	if opening:opening.dispose();opening=null
	kind="";speaker="";subtitle="";card_title="";caption="";dark=0;flash=0;show_photo=false
	world.voice.stop();world.photo_camera=false

func set_paused(value: bool):
	if opening:opening.set_paused(value)
