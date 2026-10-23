class_name LegacyOpening
extends RefCounted

var world: Node3D
var stage: Node3D
var dawn: Node3D
var home: Node3D
var hero: StreetActor
var queen: StoryCast
var friends={}
var events=[]
var active_event=-1
var duration=0.0
var home_begin=0.0
var title_begin=0.0
var home_rise=0.0
var door: StoryDoor
var ambient: AudioStreamPlayer
var saved_sky: Sky
var saved_sky_material: Material
var saved_sun={}
var environment: Environment
var sun: DirectionalLight3D
var player_was_visible=true
var scene_was_visible=true
var camera_fov=61.0
var elapsed=0.0
const ORIGIN=Vector3(0,0,400)
const HOME=Vector3(80,0,0)

func build(owner_world: Node3D):
	world=owner_world;camera_fov=world.camera.fov
	stage=Node3D.new();stage.name="LegacyOpeningStage";world.add_child(stage);stage.position=ORIGIN
	dawn=Node3D.new();stage.add_child(dawn);LegacySet.dawn(dawn)
	home=Node3D.new();stage.add_child(home);home.position=HOME;door=LegacySet.home(home,world).door;home.visible=false
	player_was_visible=world.player.visible;scene_was_visible=world.scene_root.visible;world.player.hide();world.scene_root.hide()
	hero=StreetActor.new();hero.hero=true;hero.world=world;hero.frozen=true;dawn.add_child(hero);hero.position=Vector3(0,.15,-2);hero.collision_layer=0;hero.collision_mask=0
	for key in ["tingge","pange","xuanshen"]:
		var actor=StoryCast.new();actor.historic_uniform=true;dawn.add_child(actor);actor.build(key);actor.animated=false;friends[key]=actor
	queen=StoryCast.new();home.add_child(queen);queen.build("queen");queen.animated=false;queen.position=Vector3(4,0,8.5);PrologueSet.local_lighting(queen)
	for e in world.get_children():
		if e is WorldEnvironment:environment=e.environment;saved_sky=environment.sky;saved_sky_material=saved_sky.sky_material
		if e is DirectionalLight3D:sun=e;saved_sun={"rotation":sun.rotation,"color":sun.light_color,"energy":sun.light_energy}
	var sky_material=ProceduralSkyMaterial.new();sky_material.sky_top_color=Color("#637c9a");sky_material.sky_horizon_color=Color("#f4c39a");sky_material.ground_horizon_color=Color("#e4bb95");sky_material.ground_bottom_color=Color("#748b8d");saved_sky.sky_material=sky_material
	sun.rotation_degrees=Vector3(-13,-28,0);sun.light_color=Color("#ffe0b4");sun.light_energy=1.05
	_schedule();_ambient();tick(0,0)

func _schedule():
	var cursor=5.4
	for i in range(2):cursor=_add("legacy_declaration",i,cursor,1.0)
	for i in range(3):cursor=_add("legacy_homeward",i,cursor,.55)
	title_begin=cursor;home_begin=cursor+3.0
	cursor=_add("legacy_bridge",0,home_begin+.85,.55)
	for i in range(5):
		if i==2:home_rise=cursor
		cursor=_add("legacy_home",i,cursor,.45)
	duration=cursor+1.15

func _add(group: String,index: int,start: float,gap: float) -> float:
	var line=world.voice.lines(group)[index]
	var length=float(world.voice.manifest.get(world.voice.key_for(line),{}).get("duration",maxf(1.2,line[1].length()*.18)))
	events.append({"line":line,"group":group,"index":index,"start":start,"end":start+length})
	return start+length+gap

func tick(time: float,dt: float):
	elapsed=time
	var d=world.director;d.speaker="";d.subtitle="";d.card_title=""
	var found=-1
	for i in range(events.size()):
		if time>=events[i].start and time<events[i].end:found=i;break
	if found!=active_event:
		world.voice.stop();active_event=found
		if found>=0:world.voice.speak(events[found].line)
	if found>=0:d.speaker=events[found].line[0];d.subtitle=events[found].line[1]
	d.dark=maxf(0,1-time/1.15)
	if absf(time-home_begin)<.75:d.dark=maxf(d.dark,1-absf(time-home_begin)/.75)
	if time>duration-1.1:d.dark=maxf(d.dark,(time-duration+1.1)/1.1)
	var inside=time>=home_begin
	if inside and not home.visible:
		dawn.hide();home.show();hero.reparent(home);hero.position=Vector3(-.7,.78,-1.35);hero.rotation=Vector3.ZERO;hero.rig.rotation.z=PI/2
		PrologueSet.local_lighting(hero)
		sun.rotation_degrees=Vector3(-48,-30,0);sun.light_color=Color("#fff1d2")
	if inside:_home(time-home_begin,dt)
	else:_river(time,dt)
	ambient.stream_paused=world.pause_menu

func _river(time: float,dt: float):
	var d=world.director;d.caption="长沙 · 橘子洲问天台 · 黎明"
	var targets={"tingge":Vector3(-3.0,.15,1.3),"pange":Vector3(3.0,.15,.8),"xuanshen":Vector3(5.1,.15,2.2)}
	var i=0
	for key in friends:
		var actor=friends[key];var t=smoothstep(.8+i*.6,5.2+i*.3,time)
		actor.position=(targets[key]+Vector3((i-1)*1.8,0,8)).lerp(targets[key],t)
		var toward=Vector3(0,0,-2)-actor.position;actor.rotation.y=atan2(toward.x,toward.z)
		actor.gesture="walk" if t<1 else "talk" if _speaking({"tingge":"听歌","pange":"攀哥","xuanshen":"炫神"}[key]) else "idle"
		_animate(actor,dt);i+=1
	hero.rotation.y=lerpf(PI,0,smoothstep(1.2,4.8,time));_hero_pose(time,_speaking("豚师"))
	if time<5.4:_camera(Vector3(14,6.6,14).lerp(Vector3(8,4.0,9),smoothstep(0,5.4,time)),Vector3(0,1.2,-1))
	elif active_event>=0 and events[active_event].group=="legacy_declaration":
		var t=_line_fraction();_camera(Vector3(-3.8,2.6,5.8).lerp(Vector3(-2.5,2.5,4.9),t),Vector3(0,1.4,-2))
	elif time>=title_begin:
		d.card_title="豚师2 · 上海风云";d.caption="天亮以后，故事还在继续。"
		_camera(Vector3(10,5,11).lerp(Vector3(13,6,14),smoothstep(title_begin,home_begin,time)),Vector3(.5,1.0,-1))
	else:
		var speaker=d.speaker;var key={"听歌":"tingge","攀哥":"pange","炫神":"xuanshen"}.get(speaker,"pange")
		var target=friends[key].position;var direction=(Vector3(0,0,-2)-target).normalized();var side=Vector3(-direction.z,0,direction.x)
		_camera(target+direction*4.5+side*2.6+Vector3.UP*2.7,target+Vector3(0,1.4,0))

func _home(time: float,dt: float):
	var d=world.director;d.caption="后来 · 长沙的家"
	var t=smoothstep(.6,3.8,time)
	queen.position=Vector3(4,0,8.5).lerp(Vector3(1.8,0,.45),t)
	queen.rotation.y=atan2(-2.0-queen.position.x,-1.3-queen.position.z)
	queen.gesture="walk" if t<1 else "talk" if _speaking("小朋友") else "idle";_animate(queen,dt)
	door.opened=1.0-smoothstep(3.0,5.0,time);door.requested_open=time<3;door._place()
	var rise=smoothstep(home_rise,home_rise+4.5,elapsed)
	hero.position=Vector3(-.7,.78,-1.35).lerp(Vector3(-1.25,.05,.20),rise)
	hero.rig.rotation.z=lerpf(PI/2,0,rise);_hero_pose(time,_speaking("豚师"))
	if time<4.5:_camera(HOME+Vector3(-5.7,2.8,-4.2).lerp(Vector3(-5.2,2.6,-3.8),smoothstep(0,4.5,time)),HOME+Vector3(-.3,1.4,1.8))
	elif d.speaker=="豚师":_camera(HOME+Vector3(1.4,2.4,3.3),HOME+Vector3(-1.7,1.5,-.5))
	else:_camera(HOME+Vector3(-4.3,2.3,3.3),HOME+queen.position+Vector3(0,1.35,0))

func _hero_pose(time: float,talking: bool):
	hero.body.rotation.x=sin(time*3.6)*.018 if talking else 0
	for i in range(hero.arms.size()):hero.arms[i].rotation.x=-.14+(sin(time*3+i)*.07 if talking else 0);hero.arms[i].rotation.z=0
	if talking and elapsed<home_begin and active_event==1:hero.arms[1].rotation.x=-1.0;hero.arms[1].rotation.z=-.65

func _speaking(who: String) -> bool:
	return active_event>=0 and events[active_event].line[0]==who

func _animate(actor: StoryCast,dt: float):
	actor.animated=true;actor._process(dt);actor.animated=false

func _line_fraction() -> float:
	var e=events[active_event];return smoothstep(e.start,e.end,elapsed)

func _camera(p: Vector3,target: Vector3):
	world.camera.fov=55;world.camera.position=ORIGIN+p;world.camera.look_at(ORIGIN+target)

func restore_voice():
	if active_event>=0 and world.voice.enabled:
		world.voice.player.play(maxf(0,elapsed-events[active_event].start));world.voice.set_paused(world.pause_menu)

func set_paused(value: bool):ambient.stream_paused=value

func _ambient():
	var data=PackedByteArray();var filtered=0.0;var rng=RandomNumberGenerator.new();rng.seed=54
	var notes=[196.0,246.94,293.66,329.63,293.66,246.94]
	for i in range(132300):
		var t=i/22050.0;filtered=lerpf(filtered,rng.randf_range(-1,1),.018)
		var pluck=sin(TAU*notes[int(t)%6]*t)*pow(1-fmod(t,1.0),3)*.13
		var sample=int(clampf(filtered*.55+pluck,-1,1)*32760);data.append(sample&255);data.append((sample>>8)&255)
	var wav=AudioStreamWAV.new();wav.format=AudioStreamWAV.FORMAT_16_BITS;wav.mix_rate=22050;wav.data=data;wav.loop_mode=AudioStreamWAV.LOOP_FORWARD;wav.loop_end=132300
	ambient=AudioStreamPlayer.new();stage.add_child(ambient);ambient.stream=wav;ambient.volume_db=-22;ambient.play()

func dispose():
	if not is_instance_valid(stage):return
	ambient.stop();world.player.visible=player_was_visible;world.scene_root.visible=scene_was_visible;world.camera.fov=camera_fov
	saved_sky.sky_material=saved_sky_material;environment.sky=saved_sky;sun.rotation=saved_sun.rotation;sun.light_color=saved_sun.color;sun.light_energy=saved_sun.energy
	stage.free();stage=null
