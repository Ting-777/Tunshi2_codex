class_name ChapterOneStory
extends Node

var world: Node3D
var birthday=0
var practice=[]
var scene_root: Node3D
var departure_car: StreetCar
var passenger: StoryCast
var messenger: StreetActor
var helper: StreetActor
var escort: StreetActor
var shove=false
var practice_hp=100.0
var practice_time=0.0
var replay_page=false
const PRACTICE_START=ChapterOneSet.HALL+Vector3(-8,.16,-4.8)
const DINNER=ChapterOneSet.HALL+Vector3(0,.16,5.5)
const MEETING=Vector3(-125,.05,-220)

func setup(w):world=w
func reset():clear();birthday=0;practice_time=0;shove=false
func clear():
	for a in practice:
		world.people.erase(a)
	practice=[]
	if messenger:world.people.erase(messenger);messenger=null
	if helper:world.people.erase(helper);helper=null
	if escort:world.people.erase(escort);escort=null
	if scene_root:scene_root.free();scene_root=null
	departure_car=null;passenger=null
func root_scene():
	if not scene_root:scene_root=Node3D.new();scene_root.name="BirthdayStoryActors";world.add_child(scene_root)
func start_practice():
	clear();root_scene();practice_time=0;practice_hp=world.player.hp
	for i in range(3):
		var a=ChapterDummy.new();a.world=world;a.practice_role=i;a.position=ChapterOneSet.HALL+Vector3(-3.4+i*3.4,.25,-5.7);a.hp=58;a.max_hp=58;scene_root.add_child(a);world._actor_light(a);world.people.append(a);practice.append(a)
	for i in range(8):world.sons[i].position=ChapterOneSet.HALL+Vector3(-6.4+i*1.8,.25,-8.6);world.sons[i].gesture="wave"
	world.hud.say("帮孩子试演：纸板门用R/F更快，软垫摆动可B格挡或G闪避 · 不要求高分")
func meeting_cast():
	clear();root_scene();world.venue.gate.requested_open=true
	world.cast.pange.visible=true;world.cast.pange.position=MEETING;world.cast.pange.rotation.y=PI/2
	messenger=ChapterBoss.new();messenger.world=world;messenger.position=Vector3(-122,.05,-218);messenger.rotation.y=-PI/2;messenger.frozen=true;messenger.respawn_enabled=false;scene_root.add_child(messenger);world._actor_light(messenger);world.people.append(messenger);messenger.hp=messenger.max_hp
	helper=StreetActor.new();helper.world=world;helper.friendly=true;helper.position=Vector3(-129,.05,-223);helper.rotation.y=0;helper.frozen=true;helper.respawn_enabled=false;scene_root.add_child(helper);world._actor_light(helper);world.people.append(helper)
	escort=StreetActor.new();escort.world=world;escort.position=Vector3(-120,.05,-218);escort.frozen=true;escort.respawn_enabled=false;scene_root.add_child(escort);world._actor_light(escort);world.people.append(escort)
	departure_car=StreetCar.new();departure_car.world=world;departure_car.paint="#465f79";departure_car.position=Vector3(-104,.1,-219);scene_root.add_child(departure_car);departure_car.set_physics_process(false)
	passenger=StoryCast.new();departure_car.add_child(passenger);passenger.build("pange");world._story_collision(passenger,false);passenger.scale=Vector3.ONE*.45;passenger.position=Vector3(.58,.38,-.3);passenger.visible=false;world._actor_light(passenger)
	ToonKit.finish(scene_root)
func hotspots() -> Array:
	if world.stage!=3 or world.director.active() or world.quests.inside!="":return []
	match birthday:
		0:return [{"id":"story:welcome","label":"和象象、攀哥坐下说会儿话","p":DINNER,"radius":3.2}]
		1:return [{"id":"story:rehearsal_intro","label":"到舞台边，帮孩子们试演","p":PRACTICE_START,"radius":2.4}]
		2:return [{"id":"story:practice_end","label":"这轮先排到这里 · 吃饭去","p":PRACTICE_START,"radius":2.4}]
		3:return [{"id":"story:party","label":"坐下来，开始生日饭","p":DINNER,"radius":3.2}]
		4:return [{"id":"story:doorstep","label":"攀哥在后勤门口 · 过去问清楚","p":MEETING+Vector3(-3,0,0),"radius":3.2}]
	return []
func interact(id: String):
	var kind=id.substr(6)
	if kind=="practice_end":finish_practice();return
	world.bark_queue=[];world.bark_text="";world.voice.stop();world.director.start(kind)
func finish_practice():
	world.player.hp=maxf(world.player.hp,minf(practice_hp,world.player.max_hp));world.player.stun=0;world.player.impulse=Vector3.ZERO;clear();birthday=3;world.director.start("rehearsal_done")
func sequence_done(kind: String) -> bool:
	match kind:
		"welcome":birthday=1;world.save_story();return true
		"rehearsal_intro":birthday=2;start_practice();world.save_story();return true
		"rehearsal_done":birthday=3;world._party_cast();world.save_story();return true
		"party":birthday=4;meeting_cast();world.reward_task("c1.m4");world.save_story();world.hud.say("攀哥去后勤门口了 · 从正门出去看看");return true
		"doorstep":
			birthday=5;world.cast.pange.visible=false;clear();world.stage=4;world._start_battle();world.staff[0].hp=81;world.staff[0].position=Vector3(-129,.05,-222);world.staff[0].path_index=1;world.save_story();world.bark_group("attack");return true
	return false
func tick(dt: float):
	if world.paused or world.stage!=3:return
	if birthday==2:
		practice_time+=dt
		if not practice.is_empty() and practice.all(func(a):return a.hp<=0):finish_practice()
	if birthday==4 and messenger and messenger.hp<messenger.max_hp:world.director.start("doorstep")
func targets() -> Array:
	if world.stage!=3:return []
	if birthday==4:
		if world.player.position.z< -230:return [{"label":"先经过正门去后勤院落","p":ChapterOneSet.HALL+Vector3(0,.16,11)}]
		return [{"label":"后勤门口 · 攀哥","p":MEETING}]
	if world.player.position.z> -230:return [{"label":"先从会客厅正门进去","p":ChapterOneSet.HALL+Vector3(0,.16,11)}]
	if birthday==2:
		for a in practice:
			if a.hp>0:return [{"label":"试演纸板道具 · "+str(practice.find(a)+1),"p":a.position}]
	var h=hotspots()
	return [{"label":h[0].label,"p":h[0].p}] if not h.is_empty() else []
func objective() -> String:
	if world.stage!=3:return ""
	return ["先坐下来，和朋友们好好说会儿话","帮孩子排一段爸爸的故事","试演纸板道具 · 不要求高分","回到桌前，开始生日饭","去后勤门口找攀哥","保护家人与工作人员"][clampi(birthday,0,5)]
func hint() -> String:
	return ["朋友都在桌边 · 从正门进会客厅","舞台在桌子后面，从两侧走过去","R/F破纸板门；B/G应对软垫 · 也可回舞台边E收场","孩子要上节目了 · 这次答应认真看完","他刚说要把来人带离宴会 · 出门亲眼看清情况","先护送人员，不追那辆车"][clampi(birthday,0,5)]
func save() -> Dictionary:return {"birthday":birthday}
func restore(d):
	clear();birthday=clampi(int(d.get("birthday",0)),0,5) if d is Dictionary else 0
	if world.stage==3:
		if birthday==2:start_practice()
		if birthday==4:meeting_cast()
func recap() -> Array:
	var lines=["一家人受攀哥邀请到上海，为八个孩子过生日。象象是攀哥来上海后认识的饭馆老板，在武康路附近开店。这次他借了滨江场地；豚师答应看完孩子们的节目。"]
	if world.stage>=1:lines.append("天桥竞速之后，一家人去看陆家嘴。三栋地标的支线可以稍后再做，不影响生日饭。")
	if world.phone_heard:lines.append("运蛋糕时，攀哥让炫神别把来找他的人带进会客厅。大家问原因，他只说是前阵子认识的人，没有讲完。")
	if world.stage>=3:lines.append("象象说，场地和八个座位是攀哥提前准备的。他一直忙着照应全家，孩子给他留了一份蛋糕。")
	if birthday>=4 or world.stage>=4:lines.append("生日饭时，攀哥接到催促，去后勤门口见人，想把对方带离宴会。豚师听见外面语气不对，出门去看。")
	if world.stage>=4:lines.append("SN是攀哥在象象店里认识的年轻拳手。Carry组织比赛，沈铁川替他管理现场；攀哥接走受伤、不愿继续比赛的SN。铁川要求交人；攀哥为避免牵连家人跟车离开。留下的人堵出口并推搡工作人员，豚师因此护送大家撤离。")
	if world.stage==5:lines.append("家人和工作人员安全了，攀哥仍没回来。炫神看到车往南京路去。豚师交代好家人和接应安排，准备与炫神找他。")
	return lines
