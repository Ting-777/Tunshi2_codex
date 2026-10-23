class_name ChapterCivilian
extends StreetActor

var evacuated=false
var evacuating=false

func _ready():
	friendly=true;super._ready();max_hp=90;hp=90;respawn_enabled=false

func _physics_process(dt):
	if world.paused:return
	if evacuated:
		frozen=true;visible=false;collision_layer=0;vehicle_hurtbox.collision_layer=0;return
	if not evacuating:frozen=true;return
	frozen=false;panic=0
	locomotion_scale=.85 if world.fighters.any(func(a):return a.hp>0 and a.position.distance_to(position)<4.5) else 1.8
	if hp>0 and not path.is_empty() and path_index==path.size()-1 and position.distance_to(path.back())<1.2:
		evacuated=true;frozen=true;collision_layer=0;vehicle_hurtbox.collision_layer=0;visible=false;return
	super._physics_process(dt)
