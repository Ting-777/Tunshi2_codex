class_name ChapterOneDirector
extends Node

var world: Node3D
var kind=""
var elapsed=0.0
var dark=0.0
var speaker=""
var subtitle=""
var caption=""
var events=[]
var total=0.0
var current=-1
var saved_camera_fov=65.0
signal completed(kind: String)

func active() -> bool:return kind!=""

func start(value: String):
	cancel();kind=value;elapsed=0;current=-1;events=[];speaker="";subtitle="";dark=1;world.paused=true;world._clear_input();Input.mouse_mode=Input.MOUSE_MODE_VISIBLE;saved_camera_fov=world.camera.fov
	var group={"arrival":"arrival","party":"party","ending":"ending"}[kind];var at=1.1
	for line in world.voice.lines(group):
		var key=world.voice.key_for(line);var length=float(world.voice.manifest.get(key,{}).get("duration",3))
		events.append({"start":at,"end":at+length+.5,"line":line});at+=length+.75
	total=at+1.0
	if kind=="party":world._party_cast()
	if kind=="ending":world._ending_cast(true)
	world.paused=true;_tick_camera()

func tick(dt: float):
	if not active() or world.pause_menu:return
	elapsed+=dt;dark=maxf(1-smoothstep(0,.7,elapsed),smoothstep(total-.8,total,elapsed))
	var index=-1
	for i in range(events.size()):
		if elapsed>=events[i].start and elapsed<events[i].end:index=i;break
	if index!=current:
		current=index;world.voice.stop();speaker="";subtitle=""
		for a in world.cast.values()+world.sons:a.gesture="idle"
		if index>=0:
			var line=events[index].line;speaker=line[0];subtitle=line[1];world.voice.speak(line);world._speaker_pose(speaker)
	_tick_camera()
	if kind=="arrival":
		for i in range(world.sons.size()):
			var t=smoothstep(.6+i*.32,2.5+i*.32,elapsed)
			world.sons[i].visible=t>.02;world.sons[i].position=Vector3(-45,.05,38).lerp(world.arrival_positions[i],t);world.sons[i].gesture="walk" if t<1 else "wave"
	if kind=="party" and current>=3:
		var p=world.cast.pange;var t=smoothstep(events[3].start,events[3].end+1,elapsed)
		world.venue.door.requested_open=true
		p.position=(ChapterOneSet.HALL+Vector3(7,.16,5)).lerp(ChapterOneSet.HALL+Vector3(0,.16,8),t*2) if t<.5 else (ChapterOneSet.HALL+Vector3(0,.16,8)).lerp(ChapterOneSet.HALL+Vector3(0,.05,16),(t-.5)*2);p.gesture="walk"
	if elapsed>=total:finish()

func _tick_camera():
	var c=world.camera;c.fov=58
	match kind:
		"arrival":
			caption="第一章 · 八个，一个都不少"
			c.position=Vector3(-55,3.8,30).lerp(Vector3(-53,3.3,28),smoothstep(0,total,elapsed));c.look_at(Vector3(-42,1.3,30))
		"party":
			caption="滨江 · 生日饭"
			if current==0:c.position=ChapterOneSet.HALL+Vector3(5,2.5,7);c.look_at(world.cast.xiangxiang.position+Vector3.UP*1.3)
			elif current in [1,2]:c.position=ChapterOneSet.HALL+Vector3(1.5,2.6,5.5);c.look_at(ChapterOneSet.HALL+Vector3(0,1.2,-6.5))
			elif current==3:c.position=ChapterOneSet.HALL+Vector3(-4,2.5,7);c.look_at(world.cast.pange.position+Vector3.UP*1.3)
			else:c.position=ChapterOneSet.HALL+Vector3(-5,2.5,6);c.look_at(world.cast.queen.position+Vector3.UP*1.3)
		"ending":
			caption="蛋糕还没切完"
			if current in [1,2]:c.position=ChapterOneSet.HALL+Vector3(3.5,2.4,7);c.look_at(ChapterOneSet.HALL+Vector3(.5,1.0,3.5))
			else:c.position=ChapterOneSet.HALL+Vector3(-5,2.7,7);c.look_at(ChapterOneSet.HALL+Vector3(0,1.2,3.0))

func set_paused(value: bool):world.voice.set_paused(value)
func restore_voice():
	if current>=0 and world.voice.enabled:world.voice.player.play(maxf(0,elapsed-events[current].start));world.voice.set_paused(world.pause_menu)
func skip():
	if active() and not world.pause_menu:finish()
func finish():
	if not active():return
	var done=kind;cancel();world.paused=false;completed.emit(done)
func cancel():
	if not active():return
	kind="";world.voice.stop();world.camera.fov=saved_camera_fov;speaker="";subtitle="";dark=0
