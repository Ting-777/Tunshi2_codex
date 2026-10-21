extends SceneTree

func _initialize():call_deferred("run")

func run():
	var w=load("res://scenes/main.tscn").instantiate();root.add_child(w)
	while w.hud==null:await process_frame
	w.paused=false;w.fixed_camera=true;w.hud.menu=false;w.hud.photo=true;w.autosave=-999
	for a in w.people:a.frozen=true;a.collision_layer=0;a.collision_mask=0
	for c in w.cars:c.position=Vector3(210,.1,150+w.cars.find(c)*7);c.speed=0;c.collision_layer=0
	var car=w.cars[0];car.position=Vector3(0,.05,70);car.rotation=Vector3.ZERO;car.velocity=Vector3.ZERO;car.steer=0;car.collision_layer=4;car.driver=w.player;w.player.vehicle=car;w.player.collision_layer=0;w.player.collision_mask=0
	var person=w.people[6];person.position=Vector3(0,.05,82);person.velocity=Vector3.ZERO;person.hp=100;person.max_hp=100;person.stun=0;person.knockdown=0;person.immunity=0;person.panic=0;person.collision_layer=2;person.collision_mask=1
	Input.action_press("forward");var contact=-1
	for tick in range(220):
		await physics_frame
		if person.hp<100 and contact<0:contact=tick;person.frozen=false
		if contact>=0 and tick-contact>40 and car.position.z>person.position.z+4:break
	Input.action_release("forward");w.paused=true;car.speed=0
	w.camera.position=Vector3(-7,2.8,89);w.camera.look_at(Vector3(0,.7,84.5))
	var args=OS.get_cmdline_user_args();var out="res://builds/round-21-car-impact"
	for i in range(args.size()-1):
		if args[i]=="--impact-output":out=args[i+1]
	DirAccess.make_dir_recursive_absolute(out)
	await w._shot(out+"/01-car-impact-visible.png")
	var ok=person.hp<100 and person.knockdown>0 and person.position.z>82.1 and person.position.z<88 and car.position.z>person.position.z+4
	var f=FileAccess.open(out+"/results.json",FileAccess.WRITE);f.store_string(JSON.stringify({"passed":1 if ok else 0,"failed":0 if ok else 1,"hp":person.hp,"knockdown":person.knockdown,"pedestrian_z":person.position.z,"car_z":car.position.z},"  "));f.close()
	quit(0 if ok else 1)
