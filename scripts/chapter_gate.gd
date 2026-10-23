class_name ChapterGate
extends Node3D

var world: Node3D
var opened=1.0
var requested_open=true
var panel: AnimatableBody3D
var blocked=false

func build(owner_world: Node3D):
	world=owner_world
	panel=AnimatableBody3D.new();panel.collision_layer=1;panel.collision_mask=0;panel.sync_to_physics=false;add_child(panel)
	var shape=CollisionShape3D.new();var box=BoxShape3D.new();box.size=Vector3(8.0,3.3,.28);shape.shape=box;shape.position.y=1.65;panel.add_child(shape)
	ToonKit.box(panel,Vector3(8,3.3,.25),"#507c81",Vector3.UP*1.65,.08)
	ToonKit.box(panel,Vector3(7.7,.22,.28),"#edb35a",Vector3.UP*.15,.025)
	ToonKit.text(panel,"后勤通道",Vector3(0,1.6,.16),.007)
	for s in [-1,1]:PrologueSet.block(self,Vector3(.48,4.1,.6),"#e7d0aa",Vector3(s*4.2,2.05,0))
	ToonKit.box(self,Vector3(8.9,.6,.85),"#305568",Vector3(0,4.0,0),.07)
	ToonKit.finish(self);panel.position.y=opened*3.8

func _physics_process(dt):
	if not world or world.paused:return
	blocked=false
	if not requested_open and opened>.02:
		var shape=BoxShape3D.new();shape.size=Vector3(7.85,2.7,.85)
		var query=PhysicsShapeQueryParameters3D.new();query.shape=shape;query.transform=global_transform*Transform3D(Basis.IDENTITY,Vector3.UP*1.4);query.collision_mask=6
		blocked=not get_world_3d().direct_space_state.intersect_shape(query,4).is_empty()
	if not blocked:opened=move_toward(opened,1.0 if requested_open else 0.0,dt*.65)
	panel.position.y=opened*3.8
