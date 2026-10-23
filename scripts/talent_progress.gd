extends Node

var data={}
var earned=[]
var owned=[]
var campaign_chapter=0
var testing=false
var menu=false
var column=0
var row=0
var notice=""
var guard_window=0.0
var counter_window=0.0
var dodge_window=0.0

func _ready():
	data=JSON.parse_string(FileAccess.get_file_as_string("res://assets/data/progression.json"))
	var args=OS.get_cmdline_user_args();testing="--test" in args or "--test-chapter1" in args or "--test-prologue" in args
	if not testing:load_profile()
func path() -> String:return "user://talents-test.json" if testing else "user://shanghai-talents-v1.json"
func mission(id: String) -> Dictionary:
	for m in data.missions:
		if m.id==id:return m
	return {}
func node(id: String) -> Dictionary:
	for n in data.nodes:
		if n.id==id:return n
	return {}
func total() -> int:
	var count=0
	for id in earned:count+=int(mission(id).get("points",0))
	return count
func spent() -> int:
	var count=0
	for id in owned:count+=int(node(id).get("cost",0))
	return count
func available() -> int:return total()-spent()
func has(id: String) -> bool:return id in owned
func award(id: String) -> int:
	var m=mission(id)
	if m.is_empty() or not m.implemented or id in earned:return 0
	earned.append(id);campaign_chapter=maxi(campaign_chapter,int(m.chapter));save_profile();return int(m.points)
func reason(id: String) -> String:
	var n=node(id)
	if n.is_empty():return "不存在的天赋"
	if has(id):return "已经学会"
	if n.chapter>campaign_chapter:return "第%d章开放"%n.chapter
	if n.requires!="" and not has(n.requires):return "先学习同一分支的上一项"
	if available()<n.cost:return "天赋点不足"
	return ""
func buy(id: String) -> bool:
	var why=reason(id)
	if why!="":notice=why;return false
	owned.append(id);notice="学会："+node(id).name;save_profile();return true
func respec():owned=[];notice="已返还全部已用点数，任务记录保留";save_profile()
func health() -> float:return 100.0+(15 if has("vitality1") else 0)+(20 if has("vitality2") else 0)+(25 if has("vitality4") else 0)+(20 if has("vitality5") else 0)
func damage(kind: String,hp: float,max_hp: float,airborne: bool=false) -> float:
	var scale=1.0+(.08 if has("attack1") else 0)+(.10 if has("attack2") else 0)+(.15 if has("attack5") else 0)
	if has("attack3") and kind in ["heavy","kick"]:scale*=1.2
	if has("attack4") and hp<max_hp*.35:scale*=1.15
	if kind=="heavy":
		if has("action1") and dodge_window>0:scale*=1.4
		if has("action4") and counter_window>0:scale*=1.3
	if kind=="kick" and airborne and has("action2"):scale*=1.3
	return scale
func reduction(hp: float,max_hp: float) -> float:
	var scale=1.0-(.08 if has("defense1") else 0)-(.08 if has("defense4") else 0)
	if has("defense5") and hp<max_hp*.35:scale*=.8
	return scale
func heal(vehicle: bool) -> float:return 40.0+(15 if has("vitality3") else 0)+(10 if vehicle and has("utility2") else 0)
func sync_player(player):player.max_hp=health();player.hp=minf(player.hp,player.max_hp)
func tick(dt: float):guard_window=maxf(0,guard_window-dt);counter_window=maxf(0,counter_window-dt);dodge_window=maxf(0,dodge_window-dt)
func save_profile():
	var f=FileAccess.open(path(),FileAccess.WRITE)
	if f:f.store_string(JSON.stringify({"version":1,"earned":earned,"owned":owned}))
func load_profile():
	var d=JSON.parse_string(FileAccess.get_file_as_string(path())) if FileAccess.file_exists(path()) else null
	restore(d)
func snapshot() -> Dictionary:return {"version":1,"earned":earned.duplicate(),"owned":owned.duplicate()}
func restore(d):
	earned=[];owned=[];campaign_chapter=0;menu=false;guard_window=0;counter_window=0;dodge_window=0
	if not d is Dictionary or d.get("version",0)!=1:return
	var missions=d.get("earned",[])
	if missions is Array:
		for id in missions:
			var m=mission(str(id))
			if not m.is_empty() and m.implemented and id not in earned:earned.append(id);campaign_chapter=maxi(campaign_chapter,int(m.chapter))
	var nodes=d.get("owned",[])
	if nodes is Array:
		# Only accept affordable, sequential, unlocked purchases from the saved profile.
		for id in nodes:
			if reason(str(id))=="":owned.append(id)
func reset_campaign():restore(null);save_profile()
