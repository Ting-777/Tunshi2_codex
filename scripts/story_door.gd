class_name StoryDoor
extends Node3D

var world: Node3D
var panels=[]
var opened=0.0
var requested_open=false
var automatic=true
var width=3.2
var enabled=true

func build(owner_world: Node3D,door_width: float=3.2,glass: bool=true):
	world=owner_world;width=door_width;automatic=glass
	for side in [-1,1]:
		var panel=AnimatableBody3D.new();panel.collision_layer=1;panel.collision_mask=0;panel.sync_to_physics=false;add_child(panel)
		var shape=CollisionShape3D.new();var box=BoxShape3D.new();box.size=Vector3(width/2,2.95,.18);shape.shape=box;shape.position.y=1.475;panel.add_child(shape)
		if glass:
			var pane=ToonKit.box(panel,Vector3(width/2-.14,2.7,.08),"#87bdc5",Vector3(0,1.48,0),.02)
			var material=ToonKit.mat("#86bfc9").duplicate();material.transparency=BaseMaterial3D.TRANSPARENCY_ALPHA;material.albedo_color.a=.34;material.cull_mode=BaseMaterial3D.CULL_DISABLED;pane.material_override=material
			for x in [-1,1]:ToonKit.box(panel,Vector3(.09,3,.16),"#537e86",Vector3(x*(width/4-.045),1.5,0),.02)
			ToonKit.box(panel,Vector3(width/2,.16,.16),"#537e86",Vector3(0,3,0),.02)
			ToonKit.box(panel,Vector3(width/2,.35,.14),"#537e86",Vector3(0,.18,0),.02)
			ToonKit.box(panel,Vector3(width/2-.12,.12,.11),"#eee8cd",Vector3(0,1.25,.06),.02)
		else:
			ToonKit.box(panel,Vector3(width/2,2.95,.16),"#54877d",Vector3(0,1.475,0),.05)
			ToonKit.box(panel,Vector3(.10,.25,.09),"#e7bf6e",Vector3(-side*(width/4-.16),1.28,.12),.025)
			# Wooden entrance leaves rotate about their outer jambs.
			for child in panel.get_children():
				if child is Node3D:child.position.x-=side*width/4
		panels.append(panel)
	ToonKit.finish(self);_place()
	return self

func _physics_process(dt):
	if not world or not enabled:return
	if world.get("pause_menu")==true:return
	var close=global_position.distance_to(world.player.global_position)
	var desired=requested_open or (automatic and close<3.6)
	# Hysteresis keeps glass panels from closing on someone crossing the threshold.
	if automatic and opened>.05 and close<4.3:desired=true
	opened=move_toward(opened,1.0 if desired else 0.0,dt*1.5);_place()

func _place():
	for i in range(panels.size()):
		var side=-1 if i==0 else 1
		if automatic:panels[i].position.x=side*(width/4+opened*width*.52)
		else:panels[i].position.x=side*width/2;panels[i].rotation.y=side*opened*1.58
