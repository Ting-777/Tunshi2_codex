class_name StoryCast
extends Node3D

# Authored from the supplied lineup. The hero is always StreetActor's unchanged
# original_dolphin.json; family variants operate on deep copies only.
const BADGES=["#e45450","#ec9548","#e4bb39","#65a55c","#30a59a","#4386ce","#9567bc","#ac4e70"]
var rig: Node3D
var body: Node3D
var arms=[]
var kind=""
var number=0
var clock=0.0
var animated=true
var gesture="idle"
var walk_legs=[]
var face: StoryFace
var stage_world: Node

func build(role: String,index: int=0):
	kind=role;number=index;rig=Node3D.new();add_child(rig)
	stage_world=get_parent()
	while stage_world and not ("pause_menu" in stage_world):stage_world=stage_world.get_parent()
	if role in ["son","baby","queen"]:_dolphin(role,index)
	else:_human(role)
	for n in rig.find_children("*","Node3D",true,false):
		if not n is MeshInstance3D:ToonKit.merge_direct(n)
	ToonKit.merge_direct(rig);ToonKit.outline(rig)
	if face:face.refine_outlines()
	ToonKit.finish(rig,true)
	for name_value in ["leg0","leg1"]:
		var leg=rig.find_child(name_value,true,false)
		if leg:walk_legs.append(leg)
	if role!="baby":
		var solid=StaticBody3D.new();solid.collision_layer=1;solid.collision_mask=0;add_child(solid)
		var col=CollisionShape3D.new();var shape=CapsuleShape3D.new();shape.radius=.23 if role=="son" else .37;shape.height=1.30 if role=="son" else 2.25;col.shape=shape;col.position.y=shape.height/2;solid.add_child(col)
	return self

func _dolphin(role: String,index: int):
	var data=JSON.parse_string(FileAccess.get_file_as_string("res://assets/original_dolphin.json")).model.duplicate(true)
	_recolor(data,role)
	var importer=StreetActor.new();importer._original(data,rig,"0");importer.free()
	body=rig.find_child("body",true,false)
	for i in range(2):arms.append(rig.find_child("arm"+str(i),true,false))
	rig.scale=Vector3.ONE*(.64 if role=="queen" else .37 if role=="son" else .22)
	if role=="queen":
		ToonKit.orb(body,Vector3(.25,.17,.13),"#bc4278",Vector3(-.24,3.31,.16));ToonKit.orb(body,Vector3(.25,.17,.13),"#bc4278",Vector3(.24,3.31,.16))
		ToonKit.orb(body,Vector3(.12,.13,.15),"#f3adbd",Vector3(0,3.31,.23))
		ToonKit.cyl(body,.26,.13,"#edbf4b",Vector3(0,3.42,-.05))
		for x in [-.18,0,.18]:ToonKit.orb(body,Vector3(.065,.11,.065),"#f6d779",Vector3(x,3.55,-.05))
	else:
		var badge=ToonKit.disk(body,.20,BADGES[index-1],Vector3(0,3.32,.27))
		badge.name="NumberBadge";ToonKit.text(body,str(index),Vector3(-.005,3.32,.297),.0038,"#ffffff").font_size=64
		if role=="son":
			ToonKit.polygon(body,PackedVector2Array([Vector2(-.29,.13),Vector2(.29,.13),Vector2(0,-.40)]),"#df4d51",Vector3(0,2.10,.61))
			ToonKit.box(body,Vector3(.64,.13,.10),"#efefdc",Vector3(0,2.17,.55),.02)
		else:
			ToonKit.orb(rig,Vector3(.18,.23,.15),"#f4efda",Vector3(0,.30,.05))
			for name_value in ["leg0","leg1"]:rig.find_child(name_value,true,false).visible=false

func _recolor(d: Dictionary,role: String):
	if d.has("mesh"):
		var c=d.mesh.color
		if role=="queen":
			if c in ["#65bfdf","#77cdeb","#85d5eb","#62bcda","#69c3dd","#6dc7dd","#49a7c5","#5cb4d0"]:d.mesh.color="#e9a2b6"
		elif d.name=="part":
			if d.position[1]<2.25 and c in ["#65bfdf","#e4f9ef","#62bcda"]:d.mesh.color="#f4f2e5"
			if c in ["#69c3dd","#6dc7dd"]:d.mesh.color="#293b59"
	for child in d.children:_recolor(child,role)

func _human(role: String):
	var shirt="#8058aa" if role=="tingge" else "#438e60" if role=="pange" else "#e98437" if role=="xuanshen" else "#c74e45"
	var skin="#f0c29d"
	body=Node3D.new();rig.add_child(body)
	ToonKit.box(body,Vector3(.82,.89,.46),shirt,Vector3(0,1.24,0),.17)
	ToonKit.cyl(body,.13,.19,skin,Vector3(0,1.74,0))
	if role in ["tingge","pange","xuanshen"]:
		face=StoryFace.new();body.add_child(face);face.position.y=2.03;face.build(role)
	else:
		ToonKit.orb(body,Vector3(.34,.38,.28),skin,Vector3(0,2.02,0))
		ToonKit.orb(body,Vector3(.35,.20,.29),"#252a35",Vector3(0,2.25,-.03))
	for s in [-1,1]:
		if not face:ToonKit.orb(body,Vector3(.045,.055,.023),"#252a35",Vector3(s*.12,2.03,.267))
		var arm=Node3D.new();arm.position=Vector3(s*.47,1.62,0);body.add_child(arm);arms.append(arm)
		ToonKit.orb(arm,Vector3(.15,.35,.17),shirt,Vector3(s*.025,-.28,0));ToonKit.orb(arm,Vector3(.13,.14,.13),skin,Vector3(s*.025,-.62,.02))
		ToonKit.box(rig,Vector3(.28,.64,.34),"#29364e",Vector3(s*.21,.51,0),.09);ToonKit.box(rig,Vector3(.31,.17,.49),"#f3edda" if role=="xuanshen" else "#283141",Vector3(s*.21,.15,.08),.07)
	if not face:ToonKit.orb(body,Vector3(.09,.035,.023),"#975c51",Vector3(0,1.86,.258))
	if role=="pange":
		ToonKit.box(body,Vector3(.29,.80,.05),"#f4e8cd",Vector3(0,1.27,.239),.03)
	elif role=="xuanshen":
		ToonKit.polygon(body,PackedVector2Array([Vector2(.03,.29),Vector2(-.18,-.01),Vector2(-.02,-.01),Vector2(-.09,-.28),Vector2(.20,.08),Vector2(.04,.08)]),"#ffe05a",Vector3(0,1.29,.244))
	elif role!="tingge":
		ToonKit.orb(body,Vector3(.45,.46,.31),"#eee7d6",Vector3(0,1.12,.12));ToonKit.cyl(body,.54,.08,"#dcb778",Vector3(0,2.30,0));ToonKit.cyl(body,.34,.24,"#e8c98b",Vector3(0,2.45,0));ToonKit.cyl(body,.35,.08,"#bc4948",Vector3(0,2.38,0));ToonKit.orb(body,Vector3(.10,.11,.025),"#252a35",Vector3(.13,2.04,.29))

func _process(dt):
	if not animated or not body:return
	if stage_world and stage_world.pause_menu:return
	clock+=dt;body.position.y=sin(clock*1.8+number)*.013
	if face:
		var speaking=gesture=="talk"
		if speaking and stage_world and not stage_world.dialogue.is_empty():speaking=stage_world.line_time<stage_world.voice.duration
		face.animate(dt,speaking,gesture=="wave")
	for i in range(arms.size()):arms[i].rotation.x=sin(clock*1.7+number+i*.4)*.045;arms[i].rotation.z=0
	if gesture=="talk":
		body.rotation.x=sin(clock*4)*.025
		if arms.size()>0:arms[0].rotation.x=-.55+sin(clock*3)*.18
	elif gesture=="wave":
		body.rotation.x=0
		if arms.size()>1:arms[1].rotation.z=-.9;arms[1].rotation.x=-.8+sin(clock*6)*.25
	elif gesture=="walk":
		for i in range(walk_legs.size()):walk_legs[i].rotation.x=sin(clock*8+i*PI)*.6
		for i in range(arms.size()):arms[i].rotation.x=-sin(clock*8+i*PI)*.35
	else:
		body.rotation.x=0
		for arm in arms:arm.rotation.z=0
		for leg in walk_legs:leg.rotation.x=0
