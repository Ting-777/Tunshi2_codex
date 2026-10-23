extends "res://scripts/main.gd"

# Self-contained chapter slot; prologue/free-roam saves remain independent.
var stage=0
var pause_menu=false
var menu_selection=0
var chapter_test=false
var voice: StoryVoice
var director: ChapterOneDirector
var venue={}
var cast={}
var sons=[]
var arrival_positions=[]
var van: FamilyVan
var runner: ChapterRunner
var race_active=false
var race_replay=false
var race_step=0
var race_elapsed=0.0
var race_countdown=0.0
var race_best=0.0
var race_result=0.0
var rival_elapsed=0.0
var cake_quality=100.0
var cake_best=-1.0
var delivery_elapsed=0.0
var cargo_last_hp=240.0
var cargo_last_yaw=0.0
var encounter_root: Node3D
var fighters=[]
var staff=[]
var battle_time=0.0
var reinforcement_wave=0
var failed_reason=""
var bark_speaker=""
var bark_text=""
var bark_queue=[]
var bark_elapsed=0.0
var auto_dialogue=true
var family_routes={}
var family_boost=false
var had_rough_bark=false
var arrival_seen=false
var phone_heard=false
var gates_visual: Node3D
var checkpoint_notice=0.0
const START=Vector3(-42,.1,29)
const RACE_START=Vector3(-29,.05,22.5)
const RACE_END=Vector3(29,.05,-42.5)
const CAR_START=Vector3(91,.12,-86)

func _ready():
	Engine.max_fps=60;_bind_keys();_audio()
	var args=OS.get_cmdline_user_args();chapter_test=chapter_test or "--test-chapter1" in args or "--capture-chapter1" in args;capture_mode=chapter_test
	city=ShanghaiCity.new();add_child(city);await city.build()
	venue=ChapterOneSet.build(self)
	player=StreetActor.new();player.hero=true;player.world=self;player.position=START;add_child(player)
	van=FamilyVan.new();van.world=self;van.paint="#659eaf";van.position=CAR_START;add_child(van);cars.append(van)
	for item in [[Vector3(-55,.2,40),"#e7b553",PI/2],[Vector3(-84,.2,-161),"#687fa2",0.0]]:
		var c=StreetCar.new();c.world=self;c.position=item[0];c.paint=item[1];c.rotation.y=item[2];add_child(c);cars.append(c)
	for key in ["queen","tingge","pange","xuanshen","xiangxiang"]:
		var a=StoryCast.new();add_child(a);a.build(key);cast[key]=a;_story_collision(a,false)
	for i in range(8):
		var a=StoryCast.new();add_child(a);a.build("son",i+1);sons.append(a);_story_collision(a,false)
		arrival_positions.append(Vector3(-43+(i%4)*1.5,.02,26+(i/4)*1.7))
	runner=ChapterRunner.new();runner.world=self;runner.position=RACE_START;add_child(runner);runner.visible=false
	camera=Camera3D.new();camera.fov=65;camera.near=.12;camera.far=1100;camera.current=true;add_child(camera)
	var layer=CanvasLayer.new();add_child(layer);hud=load("res://scripts/chapter1_hud.gd").new();hud.world=self;layer.add_child(hud);hud.menu=false
	voice=StoryVoice.new();voice.catalog_path="res://assets/dialogue/chapter1.json";add_child(voice)
	director=ChapterOneDirector.new();director.world=self;add_child(director);director.completed.connect(_sequence_done)
	_pedestrians()
	for a in people+[player]+cast.values()+sons:_actor_light(a)
	# Keep the family entrance calm; unrelated pedestrians are not random attackers.
	for a in people:a.respawn_enabled=false
	var restart=get_tree().has_meta("chapter1_new")
	if restart:get_tree().remove_meta("chapter1_new")
	if FileAccess.file_exists(story_path()) and not "--fresh" in args and not restart and not "--test-chapter1" in args:load_story()
	else:new_chapter()
	print("CHAPTER1_READY")
	if "--test-chapter1" in args:
		await _ticks(5);await load("res://scripts/chapter1_checks.gd").run(self)

func _audio():
	super._audio()
	var data=PackedByteArray()
	for i in range(7700):
		var t=i/22050.0;var sample=int(sin(TAU*(660 if t<.12 else 880)*t)*exp(-t*9)*14000);data.append(sample&255);data.append((sample>>8)&255)
	var wav=AudioStreamWAV.new();wav.format=AudioStreamWAV.FORMAT_16_BITS;wav.mix_rate=22050;wav.data=data;sounds["shutter"]=wav

func _actor_light(a: Node3D):
	PrologueSet.local_lighting(a)
	for mesh in a.find_children("*","MeshInstance3D",true,false):mesh.layers=2

func _story_collision(a: StoryCast,value: bool):
	for n in a.find_children("*","StaticBody3D",true,false):n.collision_layer=1 if value else 0

func new_chapter():
	director.cancel();voice.stop();bark_queue=[];bark_text="";stage=0;arrival_seen=false;phone_heard=false;race_active=false;race_replay=false;race_result=0;cake_quality=100;cake_best=-1;race_best=0;money=1200;medicine=3;broken=[];failed_reason="";pause_menu=false
	_clear_encounter();_restore_hero(START);van.position=CAR_START;van.rotation=Vector3.ZERO;van.hp=van.max_hp;van.speed=0;van.velocity=Vector3.ZERO;van.set_occupied(false)
	if van.cargo:van.cargo.free();van.cargo=null
	_place_for_stage();save_story();director.start("arrival")

func _restore_hero(p: Vector3):
	if player.vehicle:player.vehicle.driver=null;player.vehicle=null
	player.position=p;player.home=p;player.hp=100;player.heat=0;player.stun=0;player.knockdown=0;player.impulse=Vector3.ZERO;player.velocity=Vector3.ZERO;player.attack=-1;player.queued="";player.dodge_time=0;player.immunity=1;player.visible=true;player.collision_layer=2;player.collision_mask=7
	yaw=PI;pitch=.30;paused=false;_clear_input();_follow(1)

func _place_for_stage():
	family_routes.clear();runner.running=false;runner.visible=false
	for i in range(8):sons[i].visible=stage!=2;sons[i].position=arrival_positions[i];sons[i].gesture="idle"
	for key in cast:cast[key].visible=stage!=2;cast[key].gesture="idle"
	cast.queen.position=Vector3(-46,0,27);cast.pange.position=Vector3(-37,0,27);cast.tingge.position=Vector3(-40,0,24);cast.xuanshen.position=Vector3(-47,0,31);cast.xiangxiang.visible=false
	if stage==0:van.position=Vector3(-44,.1,40);van.rotation.y=PI/2
	if stage==1:
		van.position=CAR_START;van.rotation=Vector3.ZERO
		for i in range(8):sons[i].position=Vector3(101+(i%4)*1.3,0,-76+(i/4)*1.6)
		cast.queen.position=Vector3(99,0,-75);cast.pange.position=Vector3(105,0,-72);cast.tingge.position=Vector3(100,0,-70);cast.xuanshen.position=Vector3(95,0,-76)
	if stage>=3:_party_cast()
	van.set_occupied(stage==2)
	if stage>=4:cast.pange.visible=false
	if stage==5:_ending_cast()
	venue.cake.visible=stage>=3
	_draw_race_gate()

func _party_cast():
	family_routes.clear();van.set_occupied(false)
	for i in range(8):
		sons[i].visible=true;sons[i].position=ChapterOneSet.HALL+Vector3(-6.1+i*1.75,.25,-6.3);sons[i].rotation.y=0;sons[i].gesture="wave"
	for key in cast:cast[key].visible=true;cast[key].rotation.y=PI
	cast.queen.position=ChapterOneSet.HALL+Vector3(-8,.16,5.5);cast.tingge.position=ChapterOneSet.HALL+Vector3(8,.16,4.5);cast.pange.position=ChapterOneSet.HALL+Vector3(7,.16,5);cast.xuanshen.position=ChapterOneSet.HALL+Vector3(-9,.16,1);cast.xiangxiang.position=ChapterOneSet.HALL+Vector3(8,.16,6)

func _ending_cast(restore_player: bool=false):
	_party_cast();cast.pange.visible=false
	for i in range(8):sons[i].position=ChapterOneSet.HALL+Vector3(-4+(i%4)*2.4,.16,3+(i/4)*1.8);sons[i].gesture="idle"
	cast.queen.position=ChapterOneSet.HALL+Vector3(-7,.16,4);cast.tingge.position=ChapterOneSet.HALL+Vector3(7,.16,4);cast.xuanshen.position=ChapterOneSet.HALL+Vector3(-5,.16,1);cast.xiangxiang.position=ChapterOneSet.HALL+Vector3(8,.16,1)
	if restore_player:_restore_hero(ChapterOneSet.HALL+Vector3(0,.2,6));player.rotation.y=PI

func _sequence_done(kind: String):
	match kind:
		"arrival":arrival_seen=true;_place_for_stage();save_story();hud.say("老三要在天桥上比一圈 · 走近起点按 E")
		"party":stage=4;_start_battle();save_story();bark_group("attack")
		"ending":stage=5;_clear_encounter();_place_for_stage();save_story();hud.say("第一章完成 · 八个，一个都不少")
	_follow(1);Input.mouse_mode=Input.MOUSE_MODE_CAPTURED

func _speaker_pose(who: String):
	var roles={"小朋友":"queen","攀哥":"pange","听歌":"tingge","炫神":"xuanshen","象象":"xiangxiang"}
	if roles.has(who):cast[roles[who]].gesture="talk"
	var names=["老大","老二","老三","老四","老五","老六","老七","老八"]
	if who in names:sons[names.find(who)].gesture="talk"

func cast_is_speaking(role: String,number: int) -> bool:
	var names={"queen":"小朋友","pange":"攀哥","tingge":"听歌","xuanshen":"炫神","xiangxiang":"象象"}
	var who=names.get(role,"")
	if role=="son":who=["老大","老二","老三","老四","老五","老六","老七","老八"][number-1]
	if director.active():return director.speaker==who and director.current>=0 and director.elapsed<director.events[director.current].end-.5
	return bark_speaker==who and bark_elapsed<voice.duration

func bark_group(group: String):
	for line in voice.lines(group):bark_queue.append(line)
	if bark_text=="":_next_bark()
func _next_bark():
	voice.stop();bark_speaker="";bark_text="";bark_elapsed=0
	for a in cast.values()+sons:a.gesture="idle"
	if bark_queue.is_empty():return
	var line=bark_queue.pop_front();bark_speaker=line[0];bark_text=line[1];voice.speak(line);_speaker_pose(bark_speaker)

func race_points() -> Array:
	return [Vector3(0,CityBridge.DECK,17),Vector3(27,CityBridge.DECK,-10),Vector3(0,CityBridge.DECK,-37),RACE_END]
func race_targets() -> Array:
	if race_step==1:return [{"label":"任选一侧 · 东半圈","p":Vector3(27,CityBridge.DECK,-10)},{"label":"任选一侧 · 西半圈","p":Vector3(-27,CityBridge.DECK,-10)}]
	return [{"label":["上南侧坡道","任选一侧","北侧天桥出口","沿坡道跑到终点"][mini(race_step,3)],"p":race_points()[mini(race_step,3)]}]

func start_race(replay: bool=false):
	if player.vehicle:hud.say("先下车，再跟老三比一圈");return
	race_replay=replay;race_active=true;race_step=0;race_elapsed=0;race_countdown=3.0;rival_elapsed=0;runner.visible=true;runner.running=false;runner.finished=false;runner.next=0;runner.position=RACE_START+Vector3(.8,0,0);sons[2].visible=false
	runner.route=[Vector3(-3,CityBridge.DECK,22.5),Vector3(0,CityBridge.DECK,22.5),Vector3(0,CityBridge.DECK,17)]
	for i in range(1,33):
		var a=PI*i/32;runner.route.append(CityBridge.CENTER+Vector3(sin(a)*27,CityBridge.DECK,cos(a)*27))
	runner.route.append(Vector3(0,CityBridge.DECK,-42.5));runner.route.append(Vector3(2.8,CityBridge.DECK,-42.5));runner.route.append(RACE_END)
	bark_queue=[];bark_text="";bark_group("race_go");_draw_race_gate();hud.say("三秒后开跑 · 只认天桥上的检查点，左右都能走")

func _tick_race(dt: float):
	if race_countdown>0:
		race_countdown=maxf(0,race_countdown-dt)
		if race_countdown==0:runner.running=true;hud.say("开始！北侧坡道下见")
		return
	race_elapsed+=dt
	if not runner.finished:rival_elapsed+=dt
	var goals=race_targets();var passed=false
	for h in goals:
		if player.position.distance_to(h.p)<3.4 and absf(player.position.y-h.p.y)<1.4:passed=true;break
	if passed:
		race_step+=1;sound("shutter",.5);_draw_race_gate()
		if race_step>=4:_finish_race()

func _finish_race():
	race_active=false;race_result=race_elapsed
	if race_best<=0 or race_result<race_best:race_best=race_result
	runner.running=false;runner.visible=false;sons[2].visible=true
	hud.say("天桥一圈 "+("%.1f"%race_result)+" 秒 · "+("抢先到达" if not runner.finished else "老三先到了")+" · 完成就算数")
	if not race_replay:stage=1;_place_for_stage();bark_group("race_finish");bark_group("cake_ready")
	else:_place_for_stage()
	race_replay=false;save_story();_draw_race_gate()

func _draw_race_gate():
	if gates_visual:gates_visual.free();gates_visual=null
	if not race_active:return
	gates_visual=Node3D.new();add_child(gates_visual)
	for target in race_targets():
		for side in [-1,1]:
			ToonKit.box(gates_visual,Vector3(.24,1.75,.24),"#f3bc4d",target.p+Vector3(side*1.5,.875,0),.03)
		ToonKit.box(gates_visual,Vector3(3.3,.32,.12),"#f3bc4d",target.p+Vector3.UP*1.9,.04)
	ToonKit.finish(gates_visual)

func navigation_targets() -> Array:
	if director.active() or pause_menu or failed_reason!="":return []
	if race_active:return race_targets()
	match stage:
		0:return [{"label":"老三 · 天桥竞速起点","p":RACE_START}]
		1:return [{"label":"中心绿地 · 生日蛋糕取货","p":ChapterOneSet.BAKERY}]
		2:
			if not player.vehicle:return [{"label":"蓝色全家车 · 蛋糕在后座","p":van.position}]
			# A road junction is a hint, not a mandatory course gate.
			if player.position.x> -108 and player.position.z> -160:return [{"label":"往滨江 · 西侧道路","p":Vector3(-95,0,-120)}]
			return [{"label":"生日会场南侧停车处","p":ChapterOneSet.VAN_PARK}]
		3:
			if player.position.z> -230:return [{"label":"会客厅入口 · 自动门","p":ChapterOneSet.HALL+Vector3(0,.16,11)}]
			return [{"label":"八兄弟的生日节目","p":ChapterOneSet.HALL+Vector3(0,.16,5.5)}]
		4:
			var goals=[];var pending=staff.filter(func(a):return not a.evacuated and a.hp>0)
			pending.sort_custom(func(a,b):return a.hp<b.hp if absf(a.hp-b.hp)>5 else player.position.distance_squared_to(a.position)<player.position.distance_squared_to(b.position))
			if not pending.is_empty():goals.append({"label":"护送工作人员 "+str(staff.find(pending[0])+1),"p":pending[0].position})
			else:
				var threats=fighters.filter(func(a):return a.hp>0 and a.position.x< -112)
				threats.sort_custom(func(a,b):return player.position.distance_squared_to(a.position)<player.position.distance_squared_to(b.position))
				if not threats.is_empty():goals.append({"label":"清掉院内威胁","p":threats[0].position})
			goals.append({"label":"后勤门开关"+(" · 有人挡门" if venue.gate.blocked else ""),"p":ChapterOneSet.SWITCH})
			return goals
	return []

func objective() -> String:
	if failed_reason!="":return failed_reason
	if race_active:return "和老三比一圈 · "+str(mini(race_step+1,4))+" / 4"
	if stage==4 and staff.all(func(a):return a.evacuated):return "人员已撤离 · 清掉院内剩余打手"
	return ["先和老三在天桥上比一圈","到中心绿地取生日蛋糕","把全家和蛋糕送到滨江","进会客厅，看八兄弟的节目","护送工作人员撤到南侧接应车","第一章完成 · 八个，一个都不少"][stage]
func subobjective() -> String:
	if race_active:return "南侧上桥，任选半圈，北侧下桥 · 成绩不影响主线"
	return ["起点就在南坡道脚下 · 走近 E 开始","蓝色全家车已停在取货处附近","路线自选 · 急转和碰撞影响蛋糕，低分仍可继续","车停稳，下车从正门进去","关后勤门可挡增援 · R/F破防，G躲冲撞","攀哥被带走了 · 下一站南京路"][stage]

func nearest_hotspot() -> Dictionary:
	if paused or director.active():return {}
	if player.vehicle:return {"id":"car","label":"下车","p":player.position}
	var targets=[]
	if stage==0 and not race_active:targets.append({"id":"race","label":"和老三比一圈","p":RACE_START,"radius":3.2})
	if stage==1:targets.append({"id":"cake","label":"把蛋糕装进全家车","p":ChapterOneSet.BAKERY,"radius":3.3})
	if stage in [1,2,3,5] and not race_active:targets.append({"id":"race_again","label":"再比一圈 · 刷新最好成绩","p":RACE_START,"radius":3.0})
	if stage==3:targets.append({"id":"party","label":"坐下来，看孩子们的节目","p":ChapterOneSet.HALL+Vector3(0,.16,5.5),"radius":3.3})
	if stage==4:targets.append({"id":"gate","label":"打开后勤门" if not venue.gate.requested_open else "关闭后勤门","p":ChapterOneSet.SWITCH,"radius":2.5})
	if stage in [0,1,3,5]:
		var p=sons[0].position if stage<3 else cast.queen.position
		targets.append({"id":"family","label":"听听他们在聊什么","p":p,"radius":2.7})
	var best={};var distance=INF
	for h in targets:
		var d=player.position.distance_to(h.p)
		if d<h.radius and d<distance:
			var ray=PhysicsRayQueryParameters3D.create(player.position+Vector3.UP,h.p+Vector3.UP,1)
			if get_world_3d().direct_space_state.intersect_ray(ray).is_empty():best=h;distance=d
	var c=near_car() if not race_active else null
	if c and c.position.distance_to(player.position)<distance:best={"id":"car","label":"上全家车" if c==van else "上车","p":c.position}
	return best

func interact():
	var h=nearest_hotspot()
	if h.is_empty():return
	match h.id:
		"car":board()
		"race":start_race()
		"race_again":start_race(true)
		"cake":
			if van.position.distance_to(ChapterOneSet.BAKERY)>18:hud.say("把蓝色全家车开回取货处附近");return
			stage=2;cake_quality=100;had_rough_bark=false;delivery_elapsed=0;van.load_cake();van.set_occupied(true);cargo_last_hp=van.hp;cargo_last_yaw=van.rotation.y
			for a in cast.values()+sons:a.visible=false
			bark_group("cake_loaded");save_story();hud.say("蛋糕装好了 · 开车去滨江，完整度只影响评价")
		"party":bark_queue=[];bark_text="";director.start("party")
		"gate":
			venue.gate.requested_open=not venue.gate.requested_open
			if not venue.gate.requested_open:bark_group("gate_closed")
			save_story()
		"family":bark_group("family"+str([0,1,3,5].find(stage)%3))

func _tick_delivery(dt: float):
	delivery_elapsed+=dt
	if delivery_elapsed>9 and not phone_heard:phone_heard=true;bark_group("pange_call")
	var impact_damage=maxf(0,cargo_last_hp-van.hp);var turn=absf(angle_difference(cargo_last_yaw,van.rotation.y))/maxf(dt,.001)
	cake_quality=maxf(0,cake_quality-impact_damage*.75-maxf(0,absf(van.speed)*turn-5.5)*dt*.7)
	cargo_last_hp=van.hp;cargo_last_yaw=van.rotation.y
	if cake_quality<70 and not had_rough_bark:had_rough_bark=true;bark_group("cake_damage")
	if van.hp<=0:hud.say("全家车失去动力 · Esc 菜单可请炫神接应，不重跑竞速")
	if player.vehicle==null and van.position.distance_to(ChapterOneSet.VAN_PARK)<8 and absf(van.speed)<1 and player.position.distance_to(van.position)<6:
		stage=3;cake_best=maxf(cake_best,cake_quality);van.set_occupied(false)
		if van.cargo:van.cargo.free();van.cargo=null
		_party_cast();_family_to_venue();venue.cake.visible=true;bark_group("delivery_good" if cake_quality>=70 else "delivery_rough");save_story();hud.say("到了 · 下车进会客厅，孩子们已经等不及了")

func _family_to_venue():
	venue.door.requested_open=true
	var actors=sons+cast.values()
	for i in range(actors.size()):
		var a=actors[i];var end=a.position;a.position=ChapterOneSet.VAN_PARK+Vector3((i%2)*1.2,0,(i/2)*.6)
		family_routes[a]=[Vector3(-124,.03,-204),Vector3(-124,.03,-222),Vector3(-136,.03,-222),ChapterOneSet.HALL+Vector3(0,.16,8),end]

func _tick_family(dt: float):
	for a in family_routes.keys():
		var route=family_routes[a]
		if route.is_empty():a.gesture="idle";family_routes.erase(a);continue
		var target=route[0];var delta=target-a.position
		if delta.length()<.2:route.pop_front();continue
		a.rotation.y=atan2(delta.x,delta.z);a.position=a.position.move_toward(target,dt*3.3);a.gesture="walk"
	if family_routes.is_empty():venue.door.requested_open=false

func _clear_encounter():
	for a in fighters+staff:people.erase(a)
	fighters.clear();staff.clear()
	if encounter_root:encounter_root.free();encounter_root=null

func _start_battle():
	_clear_encounter();failed_reason="";paused=false;pause_menu=false;battle_time=0;reinforcement_wave=0;family_boost=false;_restore_hero(Vector3(-135,.1,-224));medicine=maxi(medicine,3)
	venue.gate.requested_open=true;venue.gate.opened=1;venue.gate.panel.position.y=3.8
	encounter_root=Node3D.new();add_child(encounter_root)
	for i in range(3):
		var a=ChapterCivilian.new();a.world=self;a.position=ChapterOneSet.HALL+Vector3(-1.0+i,.22,7.0);encounter_root.add_child(a);_actor_light(a);a.evacuating=true;a.frozen=false
		a.path=[ChapterOneSet.HALL+Vector3(0,.05,12),Vector3(-136,.05,-222),Vector3(-124,.05,-222),Vector3(-124,.05,-206.5),Vector3(-116,.03,-206.5),ChapterOneSet.STAFF_SAFE+Vector3((i-1)*.6,0,0)];a.path_index=0;people.append(a);staff.append(a)
	for item in [[Vector3(-130,.05,-224),"brawler","staff"],[Vector3(-141,.05,-219),"shield","player"],[Vector3(-122,.05,-219),"charger","player"],[Vector3(-129,.05,-213),"flanker","player"],[Vector3(-136,.05,-215),"brawler","player"]]:_fighter(item[0],item[1],item[2])
	# Visible source of reinforcements, outside the actual service gate.
	PrologueSet.minibus(encounter_root,Vector3(-104,0,-219));ToonKit.finish(encounter_root)
	van.position=ChapterOneSet.VAN_PARK;van.speed=0;van.velocity=Vector3.ZERO;van.rotation=Vector3.ZERO;van.set_occupied(false)
	_family_evacuate();venue.door.requested_open=true;_clear_input();_follow(1)

func _fighter(p: Vector3,role_value: String,task: String):
	var a=ChapterFighter.new();a.world=self;a.role=role_value;a.assignment=task;a.position=p;a.hp=76;a.max_hp=76;encounter_root.add_child(a);_actor_light(a);people.append(a);fighters.append(a);return a

func _family_evacuate():
	family_routes.clear();cast.pange.visible=false;cast.xiangxiang.position=ChapterOneSet.HALL+Vector3(6,.16,6)
	var actors=sons+[cast.queen,cast.tingge]
	for i in range(actors.size()):
		var a=actors[i];a.visible=true;a.position=ChapterOneSet.HALL+Vector3(-2+(i%4)*1.4,.18,4.2+(i/4)*1.3)
		family_routes[a]=[ChapterOneSet.HALL+Vector3(0,.05,12),Vector3(-136,.05,-226),Vector3(-124,.05,-226),Vector3(-124,.05,-204),ChapterOneSet.VAN_PARK+Vector3(-1.9,0,1.4)]
	cast.xuanshen.position=ChapterOneSet.VAN_PARK+Vector3(2,0,0)

func actor_target(actor: StreetActor) -> StreetActor:
	if actor is ChapterFighter and actor.assignment=="staff":
		var best: StreetActor;var dist=INF
		for a in staff:
			if a.evacuated or a.hp<=0:continue
			var d=a.position.distance_squared_to(actor.position)
			if d<dist:best=a;dist=d
		if best:return best
	return player
func melee_targets(actor: StreetActor) -> Array:
	if actor==player:return fighters if stage==4 else people
	return [actor_target(actor)]
func can_commit(actor: StreetActor) -> bool:
	var target=actor_target(actor);var count=0
	for a in fighters:
		if a==actor or a.hp<=0 or actor_target(a)!=target:continue
		if a.attack>=0 or a.tell>0 or a.charge_time>=0:count+=1
	if count>=(2 if target==player else 1):return false
	return get_world_3d().direct_space_state.intersect_ray(PhysicsRayQueryParameters3D.create(actor.position+Vector3.UP,target.position+Vector3.UP,1)).is_empty()
func aim_assist():
	if stage!=4:super.aim_assist();return
	var best=null;var distance=2.7;var forward=Vector3(sin(player.rotation.y),0,cos(player.rotation.y))
	for a in fighters:
		var d=a.position-player.position
		if a.hp>0 and a.knockdown<=.35 and d.length()<distance and absf(d.y)<1 and forward.dot(d.normalized())>0:
			if get_world_3d().direct_space_state.intersect_ray(PhysicsRayQueryParameters3D.create(player.position+Vector3.UP,a.position+Vector3.UP,1)).is_empty():best=a;distance=d.length()
	if best:var d=best.position-player.position;player.rotation.y=atan2(d.x,d.z)
func loot(_p: Vector3):pass

func _tick_battle(dt: float):
	battle_time+=dt
	if player.hp<=0:_fail("豚师需要休息 · 重试本次撤离");return
	for a in staff:
		if a.hp<=0:_fail("工作人员倒下了 · 重试本次撤离");return
	if battle_time>=10+reinforcement_wave*13 and reinforcement_wave<2:
		var a=_fighter(Vector3(-105,.05,-216.8+reinforcement_wave*1.2),"brawler" if reinforcement_wave==0 else "shield","staff")
		a.entrance_route=[Vector3(-110,.05,-217),Vector3(-115,.05,-217),Vector3(-128,.05,-221)];reinforcement_wave+=1;hud.say("后勤通道来人了 · 可以关门或用车挡住")
	if not family_boost and family_routes.is_empty():
		family_boost=true;bark_group("evac_half")
	if family_routes.is_empty():
		for a in sons+[cast.queen,cast.tingge]:a.visible=false
		van.set_occupied(true)
	if staff.all(func(a):return a.evacuated) and not fighters.any(func(a):return a.hp>0 and a.position.x< -112 and a.position.distance_to(ChapterOneSet.VAN_PARK)<52):
		bark_queue=[];bark_text="";voice.stop();director.start("ending")

func _fail(reason: String):
	failed_reason=reason;paused=true;pause_menu=false;voice.stop();_clear_input();Input.mouse_mode=Input.MOUSE_MODE_VISIBLE;Engine.time_scale=1
func retry_battle():
	race_active=false;stage=4;_start_battle();bark_queue=[];bark_text="";save_story();hud.say("从院内撤离重新开始 · 竞速和送蛋糕已保留")

func _process(dt):
	if not player or not hud:return
	if director.active():director.tick(dt)
	for a in cast.values()+sons:a.animated=not paused and not pause_menu or director.active() and not pause_menu
	if not paused:
		if bark_text!="":
			bark_elapsed+=dt
			if bark_elapsed>voice.duration+.7:_next_bark()
		_tick_family(dt)
		if race_active:_tick_race(dt)
		if stage==2:_tick_delivery(dt)
		if stage==4:_tick_battle(dt)
		if player.hp<=0 and stage!=4:_rescue_van()
	super._process(dt)
func _respawn_hero():
	if stage==4:_fail("豚师需要休息 · 重试本次撤离")
	else:_rescue_van()
func _follow(dt: float):
	if director and director.active():return
	super._follow(dt)
func movement() -> Vector3:
	if race_active and race_countdown>0:return Vector3.ZERO
	return super.movement()

func _clear_input():
	for action in ["forward","back","left","right","jump","guard"]:Input.action_release(action)
func _unhandled_input(event):
	if capture_mode:return
	if event is InputEventKey and event.pressed and not event.echo:_key(event.physical_keycode)
	if event is InputEventMouseMotion and Input.mouse_mode==Input.MOUSE_MODE_CAPTURED and not paused:look(event.relative)
	if event is InputEventMouseButton and event.pressed:
		if pause_menu:hud.menu_click(get_viewport().get_mouse_position())
		elif failed_reason!="":retry_battle()
		elif director.active():director.skip()
		elif not paused and not (race_active and race_countdown>0):
			if Input.mouse_mode!=Input.MOUSE_MODE_CAPTURED:Input.mouse_mode=Input.MOUSE_MODE_CAPTURED
			elif event.button_index==MOUSE_BUTTON_LEFT:player.strike()
			elif event.button_index==MOUSE_BUTTON_RIGHT:dodge()
func _key(key: int):
	if key==KEY_F11:super._key(key);return
	if key==KEY_V:
		voice.set_enabled(not voice.enabled)
		if director.active():director.restore_voice()
		return
	if key==KEY_ESCAPE:
		if hud.map_open:hud.map_open=false;paused=false;voice.set_paused(false);Input.mouse_mode=Input.MOUSE_MODE_CAPTURED;return
		pause_menu=not pause_menu;paused=pause_menu or director.active() or failed_reason!="";voice.set_paused(pause_menu);_clear_input();menu_selection=0;Input.mouse_mode=Input.MOUSE_MODE_VISIBLE if paused else Input.MOUSE_MODE_CAPTURED;return
	if pause_menu:
		if key in [KEY_W,KEY_UP]:menu_selection=posmod(menu_selection-1,hud.menu_buttons().size())
		if key in [KEY_S,KEY_DOWN]:menu_selection=posmod(menu_selection+1,hud.menu_buttons().size())
		if key==KEY_ENTER:menu_action(hud.menu_buttons()[menu_selection][1])
		return
	if failed_reason!="":
		if key in [KEY_E,KEY_ENTER]:retry_battle()
		elif key==KEY_ESCAPE:pause_menu=true;menu_selection=0
		return
	if director.active():
		if key in [KEY_E,KEY_ENTER,KEY_SPACE]:director.skip()
		return
	if key==KEY_M:
		hud.map_open=not hud.map_open;paused=hud.map_open;voice.set_paused(paused);_clear_input();Input.mouse_mode=Input.MOUSE_MODE_VISIBLE if paused else Input.MOUSE_MODE_CAPTURED;return
	if paused:return
	if race_active and race_countdown>0 and not key in [KEY_H,KEY_F5,KEY_F9]:return
	if key==KEY_E:interact();return
	if key==KEY_F5:save_story();hud.say("第一章检查点已保存");return
	if key==KEY_F9:load_story();return
	# Combat and vehicle controls retain the established sandbox mappings.
	super._key(key)

func menu_action(action: String):
	match action:
		"resume":pause_menu=false;paused=director.active() or failed_reason!="";voice.set_paused(false)
		"retry":director.cancel();retry_battle()
		"rescue":_rescue_van();pause_menu=false;paused=false
		"load":load_story();pause_menu=false
		"new":
			director.cancel();voice.stop();_clear_input();get_tree().set_meta("chapter1_new",true);get_tree().reload_current_scene();return
		"title":save_story();director.cancel();voice.stop();_clear_input();Engine.time_scale=1;Input.mouse_mode=Input.MOUSE_MODE_VISIBLE;get_tree().change_scene_to_file("res://scenes/prologue.tscn");return
	if not paused:Input.mouse_mode=Input.MOUSE_MODE_CAPTURED

func _rescue_van():
	var p=CAR_START if stage<3 else ChapterOneSet.VAN_PARK
	_restore_hero(p+Vector3(-2.2,.12,0));van.position=p;van.rotation=Vector3.ZERO;van.hp=van.max_hp;van.speed=0;van.velocity=Vector3.ZERO;cargo_last_hp=van.hp;cargo_last_yaw=0
	if stage==2:cake_quality=maxf(0,cake_quality-15)
	hud.say("炫神接应，把车摆正了 · 已完成内容保留");save_story()

func story_path() -> String:return "user://chapter1-test.json" if chapter_test else "user://shanghai-chapter1-v1.json"
func save_game(show_notice: bool=true):save_story()
func load_game(show_notice: bool=true):load_story()
func save_story():
	if director.active() or failed_reason!="" or race_active:return
	var p=player.position
	if player.vehicle:p=player.vehicle.position-Vector3.RIGHT*2.2
	var d={"version":1,"stage":stage,"arrival_seen":arrival_seen,"phone_heard":phone_heard,"p":[p.x,p.y,p.z],"hp":player.hp,"heat":player.heat,"yaw":yaw,"money":money,"medicine":medicine,"race_best":race_best,"race_result":race_result,"cake_best":cake_best,"cake_quality":cake_quality,"delivery_elapsed":delivery_elapsed,"voice":voice.enabled,"cars":[],"gate_open":venue.gate.requested_open,"gate_opened":venue.gate.opened,"battle_time":battle_time,"reinforcement_wave":reinforcement_wave,"fighters":[],"staff":[],"broken":broken}
	for c in cars:d.cars.append({"p":[c.position.x,c.position.y,c.position.z],"yaw":c.rotation.y,"hp":c.hp})
	for a in fighters:d.fighters.append({"p":[a.position.x,a.position.y,a.position.z],"hp":a.hp,"role":a.role,"assignment":a.assignment,"entrance_index":a.entrance_index,"knockdown":a.knockdown})
	for a in staff:d.staff.append({"p":[a.position.x,a.position.y,a.position.z],"hp":a.hp,"path_index":a.path_index,"evacuated":a.evacuated})
	var f=FileAccess.open(story_path(),FileAccess.WRITE)
	if f:f.store_string(JSON.stringify(d))

func load_story():
	var d=JSON.parse_string(FileAccess.get_file_as_string(story_path())) if FileAccess.file_exists(story_path()) else null
	if not d is Dictionary or d.get("version",0)!=1:new_chapter();return
	director.cancel();voice.stop();bark_queue=[];bark_text="";race_active=false;race_replay=false;failed_reason="";pause_menu=false;hud.map_open=false;_clear_encounter()
	stage=clampi(int(d.get("stage",0)),0,5);arrival_seen=d.get("arrival_seen",true)==true;phone_heard=d.get("phone_heard",false)==true
	race_best=maxf(0,float(d.get("race_best",0)));race_result=maxf(0,float(d.get("race_result",0)));cake_best=clampf(float(d.get("cake_best",-1)),-1,100);cake_quality=clampf(float(d.get("cake_quality",100)),0,100);delivery_elapsed=maxf(0,float(d.get("delivery_elapsed",0)))
	voice.set_enabled(d.get("voice",true)==true);money=clampi(int(d.get("money",1200)),0,999999);medicine=clampi(int(d.get("medicine",3)),0,99)
	_place_for_stage()
	if stage==4:
		_start_battle();battle_time=maxf(0,float(d.get("battle_time",0)));reinforcement_wave=clampi(int(d.get("reinforcement_wave",0)),0,2)
		var states=d.get("fighters",[])
		if states is Array:
			for i in range(mini(states.size(),7)):
				var s=states[i]
				if not s is Dictionary:continue
				var a=fighters[i] if i<fighters.size() else _fighter(Vector3(-105,.1,-217),str(s.get("role","brawler")),str(s.get("assignment","player")))
				a.position=safe_position(s.get("p",[]));a.hp=clampf(float(s.get("hp",76)),0,a.max_hp);a.knockdown=clampf(float(s.get("knockdown",0)),0,8);a.entrance_index=clampi(int(s.get("entrance_index",0)),0,3)
				if i>=5:a.entrance_route=[Vector3(-110,.05,-217),Vector3(-115,.05,-217),Vector3(-128,.05,-221)]
		var saved_staff=d.get("staff",[])
		if saved_staff is Array:
			for i in range(mini(saved_staff.size(),staff.size())):
				var s=saved_staff[i]
				if not s is Dictionary:continue
				staff[i].position=safe_position(s.get("p",[]));staff[i].hp=clampf(float(s.get("hp",90)),1,90);staff[i].path_index=clampi(int(s.get("path_index",0)),0,staff[i].path.size()-1);staff[i].evacuated=s.get("evacuated",false)==true;staff[i].visible=not staff[i].evacuated
		venue.gate.requested_open=d.get("gate_open",true)==true;venue.gate.opened=clampf(float(d.get("gate_opened",1.0 if venue.gate.requested_open else 0.0)),0,1);venue.gate.panel.position.y=venue.gate.opened*3.8
	_restore_hero(safe_position(d.get("p",[])));player.hp=clampf(float(d.get("hp",100)),1,100);player.heat=clampf(float(d.get("heat",0)),0,100);yaw=float(d.get("yaw",PI))
	var saved_cars=d.get("cars",[])
	if saved_cars is Array:
		for i in range(mini(saved_cars.size(),cars.size())):
			if not saved_cars[i] is Dictionary:continue
			cars[i].position=safe_position(saved_cars[i].get("p",[]));cars[i].hp=clampf(float(saved_cars[i].get("hp",cars[i].max_hp)),0,cars[i].max_hp);cars[i].rotation.y=float(saved_cars[i].get("yaw",0));cars[i].speed=0;cars[i].velocity=Vector3.ZERO
	if stage==2:van.load_cake()
	elif van.cargo:van.cargo.free();van.cargo=null
	cargo_last_hp=van.hp;cargo_last_yaw=van.rotation.y
	var saved_broken=d.get("broken",[])
	if saved_broken is Array:
		broken=saved_broken
		for c in city.crates.duplicate():
			if [c.p.x,c.p.z] in broken:c.node.queue_free();city.crates.erase(c)
	_follow(1);hud.say("已回到第一章检查点")
	if stage==0 and not arrival_seen:director.start("arrival")
