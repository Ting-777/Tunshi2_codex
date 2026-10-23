class_name ChapterRunner
extends CharacterBody3D

var world: Node3D
var model: StoryCast
var route=[]
var next=0
var running=false
var finished=false
var speed=5.75

func _ready():
	collision_layer=0;collision_mask=1;floor_snap_length=.3
	var c=CollisionShape3D.new();var shape=CapsuleShape3D.new();shape.radius=.26;shape.height=1.3;c.shape=shape;c.position.y=.65;add_child(c)
	model=StoryCast.new();add_child(model);model.build("son",3)
	world._actor_light(model)
	for n in model.find_children("*","StaticBody3D",true,false):n.collision_layer=0

func _physics_process(dt):
	model.animated=not world.paused
	if world.paused or not running:return
	var delta=route[next]-position;delta.y=0
	if delta.length()<.7:
		next+=1
		if next>=route.size():running=false;finished=true;model.gesture="wave";return
		delta=route[next]-position;delta.y=0
	velocity.x=delta.normalized().x*speed;velocity.z=delta.normalized().z*speed;velocity.y=-.6 if is_on_floor() else velocity.y-22*dt
	move_and_slide();rotation.y=atan2(delta.x,delta.z);model.gesture="walk"
