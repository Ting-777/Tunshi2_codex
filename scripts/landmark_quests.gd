class_name LandmarkQuests
extends Node

var world: Node3D
var spaces={}
var inside=""
var tracked=""
var states={"shanghai":0,"pearl":0,"jinmao":0,"luo":0}
var photos=[]
var best=0.0
var luo_best=0
var paid=[]
var journal=false
var selection=0
var travel=-1.0
var destination=""
var aim=-1
var flash=0.0
var photo_time=0.0
var photo_origin=Vector3.ZERO
var photo_rotation=Vector3.ZERO
var clock=0.0
var running=false
var checkpoint=0
var rhythm=false
var rhythm_time=0.0
var notes=[]
var pattern=[0,2,1,3]
var alarm=0.0
var alarms=0
var returning=false
var family_positions=[]
const KEYS=["shanghai","pearl","jinmao","luo"]
const VIEWS=[Vector3(-64,73,-85),Vector3(129,95,-43),Vector3(52,60,-20)]
const VIEW_NAMES=["东方明珠","金茂大厦","国金中心"]

func setup(w: Node3D):
	world=w;spaces=LandmarkSet.build(w)
	for i in range(4):
		var bytes=PackedByteArray();var hz=[440.0,523.25,659.25,783.99][i]
		for n in range(6600):
			var sample=int(sin(TAU*hz*n/22050.0)*exp(-n/2200.0)*13000);bytes.append(sample&255);bytes.append((sample>>8)&255)
		var wav=AudioStreamWAV.new();wav.format=AudioStreamWAV.FORMAT_16_BITS;wav.mix_rate=22050;wav.data=bytes;world.sounds["note"+str(i)]=wav

func enabled() -> bool:return world.stage in [1,3,5] and not world.race_active and not world.director.active()
func main_done() -> bool:return states.shanghai==2
func active() -> bool:return inside!="" or travel>=0
func can_save() -> bool:return travel<0 and aim<0 and photo_time<=0 and not journal

func set_room(key: String):
	if inside!="":
		world.city.reveal_interior(inside,false)
		spaces[inside].room.visible=false
		for body in spaces[inside].room.find_children("*","StaticBody3D",true,false):body.collision_layer=0
	inside=key
	if inside!="":
		world.city.reveal_interior(inside,true);spaces[inside].room.visible=true
		for body in spaces[inside].room.find_children("*","StaticBody3D",true,false):body.collision_layer=1

func family(enter: bool):
	if enter:
		family_positions=[]
		for a in world.sons+[world.cast.queen,world.cast.tingge]:family_positions.append({"p":a.position,"v":a.visible,"r":a.rotation})
		for i in range(8):
			var a=world.sons[i];a.visible=true;a.position=LandmarkSet.DATA.shanghai.floor+Vector3(-3.5+i,0,-1.5);a.rotation.y=0;a.gesture="wave"
		world.cast.queen.position=LandmarkSet.DATA.shanghai.floor+Vector3(4.5,0,-1.5);world.cast.queen.visible=true
		world.cast.tingge.position=LandmarkSet.DATA.shanghai.floor+Vector3(-4.8,0,-1.5);world.cast.tingge.visible=true
	else:
		var actors=world.sons+[world.cast.queen,world.cast.tingge]
		for i in range(mini(actors.size(),family_positions.size())):
			actors[i].position=family_positions[i].p;actors[i].visible=family_positions[i].v;actors[i].rotation=family_positions[i].r;actors[i].gesture="idle"
		family_positions=[]

func ride(key: String):
	if travel>=0 or photo_time>0 or world.player.vehicle:return
	destination=key;travel=0;world.paused=true;world._clear_input();world.voice.stop();world.bark_queue=[];world.bark_text="";aim=-1;running=false;rhythm=false
	world.sound("shutter",.4)

func _arrive():
	var old=inside
	if old=="shanghai":family(false)
	set_room(destination)
	if destination=="" and tracked==old and states[old]==2:tracked=""
	var p=LandmarkSet.DATA[old].entry+Vector3(0,.3,0) if destination=="" else LandmarkSet.DATA[destination].floor+Vector3(0,.12,5.3)
	world.player.position=p;world.player.home=p;world.player.velocity=Vector3.ZERO;world.player.impulse=Vector3.ZERO;world.player.crouch=false;world.yaw=PI;world.pitch=.25
	if inside!="":
		if states[inside]==0:states[inside]=1
		tracked=inside
		if inside=="shanghai":family(true);world.bark_group("tower_welcome")
		elif inside=="luo":world.bark_group("luo_welcome")
	world._follow(1)

func hotspot() -> Dictionary:
	if not enabled() or travel>=0 or aim>=0:return {}
	var p=world.player.position;var targets=[]
	if inside=="":
		for key in KEYS:
			if key=="shanghai" or world.stage>=1:targets.append({"id":"lift:"+key,"p":LandmarkSet.DATA[key].entry+Vector3(0,.16,-1.5),"label":"乘电梯 · "+LandmarkSet.DATA[key].name,"radius":2.2})
	else:
		var base=LandmarkSet.DATA[inside].floor
		targets.append({"id":"lift:","p":base+Vector3(0,0,5.7),"label":"乘电梯返回大厅","radius":2.0})
		match inside:
			"shanghai":
				for i in range(3):targets.append({"id":"scope:"+str(i),"p":base+[Vector3(-6,0,-5),Vector3(6,0,-5),Vector3(-6,0,4)][i],"label":("已拍 · " if i in photos else "观景镜 · ")+VIEW_NAMES[i],"radius":1.9})
				if photos.size()==3:targets.append({"id":"family_photo","p":base+Vector3(0,0,3),"label":"拍八子全家合照","radius":1.8})
			"pearl":targets.append({"id":"rhythm","p":base+Vector3(0,0,-3),"label":"城市节拍 · 试听 / 重玩","radius":2.0})
			"jinmao":targets.append({"id":"parkour","p":base+Vector3(-5,0,4),"label":"中庭快递 · 开始 / 重跑","radius":1.8})
			"luo":
				targets.append({"id":"luo_start","p":base+Vector3(0,0,3.8),"label":"旧员工安保训练 · 开始 / 重试","radius":1.5})
				if running:targets.append({"id":"luo_take","p":base+Vector3(0,0,-5),"label":"取回老员工纪念章","radius":1.5})
	for h in targets:
		if p.distance_to(h.p)>h.radius:continue
		var ray=PhysicsRayQueryParameters3D.create(p+Vector3.UP,h.p+Vector3.UP,1)
		if world.get_world_3d().direct_space_state.intersect_ray(ray).is_empty():return h
	return {}

func interact(id: String):
	if id.begins_with("lift:"):ride(id.substr(5));return
	if id.begins_with("scope:"):
		aim=int(id.substr(6));world._clear_input();var delta=VIEWS[aim]-(world.player.position+Vector3.UP*1.7);world.yaw=atan2(delta.x,delta.z)+.16;world.pitch=atan2(-delta.y,Vector2(delta.x,delta.z).length())-.1;return
	match id:
		"family_photo":
			if photo_time>0:return
			photo_origin=world.player.position;photo_rotation=world.player.rotation;photo_time=2.2;world.player.position=LandmarkSet.DATA.shanghai.floor+Vector3(0,.05,.3);world.player.rotation.y=0;world.paused=true;world._clear_input();flash=.8;world.sound("shutter",.7);complete("shanghai");world.bark_group("tower_family")
		"rhythm":rhythm=true;rhythm_time=0;notes=[];world.sound("note"+str(pattern[0]),.65);world._clear_input();world.hud.say("先听四拍、看亮灯，再按 1 / 2 / 3 / 4 重现")
		"parkour":running=true;clock=0;checkpoint=0;world.hud.say("从 1 号台开始，沿中庭逐级跳上去 · 落地可重新开始")
		"luo_start":running=true;returning=false;clock=0;alarms=0;alarm=0;world.hud.say("等待光束熄灭，或按 X 蹲下穿过 · 取章后返回")
		"luo_take":returning=true;world.hud.say("纪念章拿到了 · 返回入口完成训练")

func complete(key: String):
	states[key]=2
	var points=world.reward_task("c1.m2" if key=="shanghai" else "c1.s"+str(["pearl","jinmao","luo"].find(key)+1))
	if key not in paid:paid.append(key);world.money+=200;world.hud.say(LandmarkSet.DATA[key].title+" · 完成，200 元 + %d 天赋点 · T 学习"%points)
	if key=="pearl":world.bark_group("pearl_done")
	if key=="jinmao":world.bark_group("jinmao_done")
	if key=="luo":world.bark_group("luo_done")
	world.save_story()

func shoot() -> bool:
	if aim<0:return false
	var direction=(VIEWS[aim]-world.camera.position).normalized()
	if (-world.camera.global_basis.z).dot(direction)>cos(deg_to_rad(4)):
		if aim not in photos:photos.append(aim)
		world.hud.say(VIEW_NAMES[aim]+" · 拍到了 "+str(photos.size())+" / 3");flash=.55;world.sound("shutter",.7);aim=-1;world.save_story()
	else:world.hud.say("把金色地标框移进取景器中央，再按左键")
	return true

func follow() -> bool:
	if photo_time>0:
		var b=LandmarkSet.DATA.shanghai.floor;world.camera.position=b+Vector3(0,2.4,6.5);world.camera.look_at(b+Vector3(0,1.1,-.8));return true
	if aim<0:return false
	world.camera.position=world.player.position+Vector3.UP*1.7
	world.camera.look_at(world.camera.position+Vector3(sin(world.yaw)*cos(world.pitch),-sin(world.pitch),cos(world.yaw)*cos(world.pitch)));return true

func key(code: int) -> bool:
	if code==KEY_J:
		if travel>=0 or photo_time>0 or world.director.active() or world.pause_menu or world.failed_reason!="":return true
		journal=not journal;world.hud.map_open=false;world.paused=journal;world.voice.set_paused(journal);world._clear_input();Input.mouse_mode=Input.MOUSE_MODE_VISIBLE if journal else Input.MOUSE_MODE_CAPTURED;return true
	if journal:
		if code in [KEY_W,KEY_UP]:selection=posmod(selection-1,4)
		if code in [KEY_S,KEY_DOWN]:selection=posmod(selection+1,4)
		if code in [KEY_ENTER,KEY_E]:tracked=KEYS[selection];journal=false;world.paused=false;world.hud.map_open=false;world.voice.set_paused(false);Input.mouse_mode=Input.MOUSE_MODE_CAPTURED
		if code==KEY_ESCAPE:journal=false;world.paused=false;world.voice.set_paused(false);Input.mouse_mode=Input.MOUSE_MODE_CAPTURED
		return true
	if travel>=0 or photo_time>0:return code not in [KEY_ESCAPE,KEY_V,KEY_F11]
	if aim>=0:
		if code in [KEY_E,KEY_ESCAPE]:aim=-1;return true
		return code not in [KEY_V,KEY_F11]
	if rhythm:
		if code in [KEY_E,KEY_ESCAPE]:rhythm=false;return true
		if code>=KEY_1 and code<=KEY_4:
			if rhythm_time<3.2:return true
			var note=code-KEY_1;world.sound("note"+str(note),.65)
			if note!=pattern[notes.size()]:notes=[];rhythm_time=0;world.hud.say("听错也没事 · 再听一次四拍")
			else:
				notes.append(note)
				if notes.size()==4:rhythm=false;complete("pearl")
			return true
	return false

func tick(dt: float):
	if world.pause_menu or journal or world.hud.map_open or world.talents.menu:return
	flash=maxf(0,flash-dt)
	if photo_time>0:
		world.paused=true;photo_time=maxf(0,photo_time-dt)
		if photo_time<=0:world.player.position=photo_origin;world.player.rotation=photo_rotation;world.paused=false;world.save_story()
		return
	if travel>=0:
		world.paused=true
		var old=travel;travel+=dt
		if old<.65 and travel>=.65:_arrive()
		if travel>=1.6:travel=-1;world.paused=false;world.save_story()
		return
	if world.paused or inside=="":return
	clock+=dt;alarm=maxf(0,alarm-dt)
	if rhythm:
		var previous=int(rhythm_time/.8);rhythm_time+=dt
		if int(rhythm_time/.8)!=previous and rhythm_time<3.2:world.sound("note"+str(pattern[mini(3,int(rhythm_time/.8))]),.65)
		for i in range(4):spaces.pearl.effects.get_child(i).position.y=.75+(.3 if rhythm_time<3.2 and pattern[mini(3,int(rhythm_time/.8))]==i else 0)
	if inside=="jinmao" and running:
		var target=LandmarkSet.DATA.jinmao.floor+LandmarkSet.parkour_point(checkpoint)
		if world.player.position.distance_to(target)<1.1 and world.player.is_on_floor():
			checkpoint+=1;world.sound("shutter",.5)
			if checkpoint==8:
				running=false
				if best<=0 or clock<best:best=clock
				complete("jinmao");world.hud.say("送达 · %.1f 秒，最好 %.1f 秒"%[clock,best])
	if inside=="luo":
		for i in range(2):spaces.luo.effects.get_child(i).visible=beam_on(i)
		if running:
			var p=world.player.position-LandmarkSet.DATA.luo.floor
			for i in range(2):
				if absf(p.z-[2.2,-2.2][i])<.45 and beam_on(i) and not world.player.crouch and p.y<1.4 and alarm<=0:
					alarms+=1;alarm=1.5;world.sound("hit",.4);world.hud.say("触发训练提示 · 不扣血，等灯灭或 X 蹲下")
			if returning and p.distance_to(Vector3(0,0,4.4))<1.3:
				running=false;luo_best=alarms if states.luo!=2 else mini(luo_best,alarms);complete("luo");world.hud.say("安保训练结束 · 提示 %d 次，最佳 %d 次"%[alarms,luo_best])

func beam_on(i: int) -> bool:return fmod(clock+i*1.4,4.4)<2.6
func targets() -> Array:
	if not enabled():return []
	if inside=="":
		var key=tracked if tracked!="" else "shanghai" if not main_done() and world.stage==1 else ""
		if key!="":return [{"label":LandmarkSet.DATA[key].title+" · 大厅入口","p":LandmarkSet.DATA[key].entry+Vector3(0,0,4.4)}]
		return []
	var base=LandmarkSet.DATA[inside].floor
	if inside=="shanghai":
		if photos.size()<3:
			for i in range(3):
				if i not in photos:return [{"label":"观景镜 · "+VIEW_NAMES[i],"p":base+[Vector3(-6,0,-5),Vector3(6,0,-5),Vector3(-6,0,4)][i]}]
		if not main_done():return [{"label":"八个，一个都不少 · 全家合照","p":base+Vector3(0,0,3)}]
	if inside=="jinmao" and running:return [{"label":"跳到 "+str(checkpoint+1)+" 号台","p":base+LandmarkSet.parkour_point(checkpoint)}]
	if inside=="luo" and running:return [{"label":"回到访客入口" if returning else "取回员工纪念章","p":base+Vector3(0,0,4.4 if returning else -5)}]
	if states[inside]!=2:return [{"label":"开始 · "+LandmarkSet.DATA[inside].title,"p":base+{"pearl":Vector3(0,0,-3),"jinmao":Vector3(-5,0,4),"luo":Vector3(0,0,3.8),"shanghai":Vector3.ZERO}[inside]}]
	return [{"label":"下楼 · 返回大厅","p":base+Vector3(0,0,5.7)}]

func objective() -> String:
	if inside!="":return LandmarkSet.DATA[inside].title
	if world.stage==1 and not main_done():return "带八子登上上海中心观景层"
	return ""
func hint() -> String:
	if aim>=0:return "鼠标转动观景镜 · 左键拍摄 · E 返回"
	if inside=="shanghai":return "找观景镜，认出三处地标；然后拍一张八子全家合照"
	if rhythm:return "听四拍、看亮灯，再按 1 / 2 / 3 / 4 · E 退出"
	if inside=="pearl":return "听歌的节拍台 · 完成四拍，无需拼手速"
	if inside=="jinmao":return "空格跳跃，依次登上八个平台 · 可重跑，成绩不锁剧情"
	if inside=="luo":return "自由伞总部 · 旧员工通道；等待灯灭或 X 蹲下过线"
	return "生日饭前登高看看上海 · J 任务日志，可追踪三条支线"

func save() -> Dictionary:return {"states":states.duplicate(),"photos":photos.duplicate(),"paid":paid.duplicate(),"best":best,"luo_best":luo_best,"inside":inside,"tracked":tracked}
func restore(d):
	reset()
	if not d is Dictionary:return
	var saved=d.get("states",{})
	if saved is Dictionary:
		for key_name in KEYS:states[key_name]=clampi(int(saved.get(key_name,0)),0,2)
	var saved_photos=d.get("photos",[])
	if saved_photos is Array:
		for i in saved_photos:
			if i is int or i is float:
				if int(i) in [0,1,2] and int(i) not in photos:photos.append(int(i))
	var saved_paid=d.get("paid",[])
	if saved_paid is Array:
		for k in saved_paid:
			if k in KEYS and k not in paid:paid.append(k)
	best=maxf(0,float(d.get("best",0)));luo_best=maxi(0,int(d.get("luo_best",0)));tracked=str(d.get("tracked",""))
	if tracked not in KEYS:tracked=""
	var key_name=str(d.get("inside",""))
	if key_name in KEYS and enabled():set_room(key_name)
	if inside=="shanghai":family(true)
func reset():
	if inside=="shanghai":family(false)
	photo_time=0
	set_room("");states={"shanghai":0,"pearl":0,"jinmao":0,"luo":0};photos=[];paid=[];best=0;luo_best=0;tracked="";aim=-1;travel=-1;journal=false;running=false;rhythm=false;returning=false
func safe_floor(value) -> Variant:
	if inside=="" or not value is Array or value.size()!=3:return null
	for n in value:
		if not (n is float or n is int) or not is_finite(float(n)):return null
	var p=Vector3(value[0],value[1],value[2]);var b=LandmarkSet.DATA[inside].floor
	if absf(p.x-b.x)<7.7 and absf(p.z-b.z)<6.5 and p.y>=b.y-.1 and p.y<b.y+4.5:return p+Vector3.UP*.08
	return b+Vector3(0,.12,5.3)

func reset_visit():
	if inside=="shanghai":family(false)
	photo_time=0
	set_room("");aim=-1;travel=-1;running=false;rhythm=false;journal=false
