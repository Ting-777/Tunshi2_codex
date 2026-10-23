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
var title_begin=0.0
var saved_camera_fov=65.0
signal completed(kind: String)

func active() -> bool:return kind!=""
func start(value: String):
	cancel();kind=value;elapsed=0;current=-1;events=[];speaker="";subtitle="";dark=1;world.paused=true;world._clear_input();Input.mouse_mode=Input.MOUSE_MODE_VISIBLE;saved_camera_fov=world.camera.fov
	world.bark_queue=[];world.bark_text="";world.voice.stop()
	var at=1.1
	for line in world.voice.lines(kind):
		var key=world.voice.key_for(line);var length=float(world.voice.manifest.get(key,{}).get("duration",maxf(3,line[1].length()*.18)))
		events.append({"start":at,"end":at+length+.5,"line":line});at+=length+.75
	title_begin=at+.5;total=at+(5.5 if kind=="boss_intro" else 1.0)
	if kind in ["party","welcome","rehearsal_intro","rehearsal_done"]:world._party_cast()
	if kind=="ending":world._ending_cast(true)
	if kind=="doorstep":world.player.position=ChapterOneStory.MEETING+Vector3(-4,.05,-1);world.player.rotation.y=PI/2;world.story.shove=false;world.cast.xiangxiang.position=Vector3(-132,.05,-223);world.cast.xiangxiang.rotation.y=PI/2
	if kind=="boss_intro":world.boss.frozen=true
	world.paused=true;_tick_camera()
func advance():
	if not active():return
	world.voice.stop()
	if current<0:
		for i in range(events.size()):
			if events[i].start>elapsed:elapsed=events[i].start;tick(0);return
	elif current+1<events.size():elapsed=events[current+1].start;current=-1;tick(0);return
	if kind=="boss_intro" and elapsed<title_begin:elapsed=title_begin;current=-1;world.sound("boss_sting",1.0);tick(0);return
	finish()
func tick(dt: float):
	if not active() or world.pause_menu:return
	elapsed+=dt
	if not world.auto_dialogue and current>=0:
		if kind!="boss_intro" or current<events.size()-1:elapsed=minf(elapsed,events[current].end-.01)
	dark=maxf(1-smoothstep(0,.7,elapsed),smoothstep(total-.8,total,elapsed))
	var index=-1
	for i in range(events.size()):
		if elapsed>=events[i].start and elapsed<events[i].end:index=i;break
	if index!=current:
		current=index;world.voice.stop();speaker="";subtitle=""
		for a in world.cast.values()+world.sons:a.gesture="idle"
		if index>=0:
			var line=events[index].line;speaker=line[0];subtitle=line[1];world.voice.speak(line);world._speaker_pose(speaker)
	var face_actor=world.boss if kind in ["boss_intro","boss_outro"] else world.story.messenger if kind=="doorstep" else null
	if face_actor is ChapterBoss:face_actor.face.animate(dt,speaker=="沈铁川" and current>=0 and elapsed<events[current].end-.5)
	_tick_camera()
	if kind=="arrival":
		for i in range(world.sons.size()):
			var t=smoothstep(.6+i*.32,2.5+i*.32,elapsed)
			world.sons[i].visible=t>.02;world.sons[i].position=Vector3(-45,.05,38).lerp(world.arrival_positions[i],t);world.sons[i].gesture="walk" if t<1 else "wave"
	if kind=="party" and current>=cue("好。我尽快"):
		var p=world.cast.pange;var t=smoothstep(events[cue("好。我尽快")].start,events[cue("爸爸，刚才")].end,elapsed)
		world.venue.door.requested_open=true
		p.position=(ChapterOneSet.HALL+Vector3(7,.16,5)).lerp(ChapterOneSet.HALL+Vector3(0,.16,8),t*2) if t<.5 else (ChapterOneSet.HALL+Vector3(0,.16,8)).lerp(ChapterOneSet.HALL+Vector3(0,.05,16),(t-.5)*2);p.gesture="walk"
	if kind=="doorstep" and current>=cue("等一下，车堵着"):
		var t=smoothstep(events[cue("等一下，车堵着")].start,events[cue("松手")].end,elapsed)
		world.cast.pange.position=ChapterOneStory.MEETING.lerp(Vector3(-115,.05,-217),t*2) if t<.5 else Vector3(-115,.05,-217).lerp(Vector3(-104,.05,-217),(t-.5)*2)
		world.cast.pange.rotation.y=PI/2;world.cast.pange.gesture="walk";world.cast.pange.visible=t<.99
		if world.story.passenger:world.story.passenger.visible=t>=.99
		if world.story.escort:world.story.escort.position=world.cast.pange.position+Vector3(-1,0,.8);world.story.escort.rotation.y=PI/2;world.story.escort.visible=t<.99
		if world.story.departure_car and current>=cue("你先把他摁住"):
			var drive=smoothstep(events[cue("你先把他摁住")].start,total-.6,elapsed);var car=world.story.departure_car;car.position=Vector3(-104,.1,-219).lerp(Vector3(-95,.1,-187),drive);car.rotation.y=atan2(9,32)
		if world.story.helper and current>=cue("你别推我"):
			world.story.helper.position=Vector3(-129,.05,-223).lerp(Vector3(-130,.05,-222),smoothstep(events[cue("你别推我")].start,events[cue("松手")].start,elapsed));world.story.helper.body.rotation.x=-.25
	if kind=="boss_intro" and elapsed>=title_begin and elapsed-dt<title_begin:world.sound("boss_sting",1.0)
	if elapsed>=total:finish()
func _focus_actor() -> Node3D:
	var who=speaker.split(" · ")[0]
	var roles={"小朋友":"queen","攀哥":"pange","听歌":"tingge","炫神":"xuanshen","象象":"xiangxiang"}
	if roles.has(who):return world.cast[roles[who]]
	var names=["老大","老二","老三","老四","老五","老六","老七","老八"]
	if who in names:return world.sons[names.find(who)]
	if who=="沈铁川" and kind in ["boss_intro","boss_outro"] and world.boss:return world.boss
	if who=="沈铁川" and world.story.messenger:return world.story.messenger
	if who=="工作人员" and world.story.helper:return world.story.helper
	return world.player
func _tick_camera():
	var c=world.camera;c.fov=58
	match kind:
		"arrival":
			caption="第一章 · 八个，一个都不少"
			c.position=Vector3(-55,3.8,30).lerp(Vector3(-53,3.3,28),smoothstep(0,total,elapsed));c.look_at(Vector3(-42,1.3,30))
		"welcome","rehearsal_intro","rehearsal_done","party":
			caption={"welcome":"生日饭前 · 大家先歇一会儿","rehearsal_intro":"先帮孩子们排一段","rehearsal_done":"戏里戏外","party":"滨江 · 生日饭"}[kind]
			var a=_focus_actor();var is_child=a in world.sons
			c.position=ChapterOneSet.HALL+(Vector3(0,2.6,-1.8) if is_child else Vector3(-3.5,2.6,7.1));c.look_at(a.position+Vector3.UP*(.8 if is_child else 1.25))
		"doorstep":
			caption="后勤门口 · 把话说清楚"
			c.position=Vector3(-134,3,-216.2) if current<cue("等一下，车堵着") else Vector3(-135,3.1,-225)
			c.look_at(_focus_actor().position+Vector3.UP*1.2)
		"boss_intro","boss_outro":
			caption="滨江后勤院 · 铁闸"
			var b=world.boss
			if kind=="boss_intro":b.position=ChapterBoss.ARENA+Vector3(0,0,lerpf(-2,-.4,smoothstep(title_begin-1.1,title_begin,elapsed)))
			var t=smoothstep(title_begin-1,title_begin+.7,elapsed) if kind=="boss_intro" else 0.0
			c.position=(b.position+Vector3(-3.4,2.3,4.8)).lerp(b.position+Vector3(-2.5,1.8,3.4),t);c.look_at(b.position+Vector3.UP*1.45)
			if kind=="boss_intro":
				b._boss_pose();b.arms[0].rotation.x=-1.15-t*.65;b.elbows[0].rotation.x=-1.4;b.body.rotation.y=-t*.22
		"ending":
			caption="蛋糕还留着"
			c.position=ChapterOneSet.HALL+Vector3(3.5,2.5,7) if _focus_actor() in world.sons else ChapterOneSet.HALL+Vector3(-5,2.7,7)
			c.look_at(_focus_actor().position+Vector3.UP*(.8 if _focus_actor() in world.sons else 1.2))
func set_paused(value: bool):
	world.voice.set_paused(value)
	for node in world.find_children("*","AudioStreamPlayer",true,false):node.stream_paused=value
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

func cue(prefix: String) -> int:
	for i in range(events.size()):
		if events[i].line[1].begins_with(prefix):return i
	return 0
