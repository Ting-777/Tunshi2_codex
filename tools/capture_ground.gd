extends SceneTree

func _initialize():call_deferred("capture_ground")

func capture_ground():
	var out="";var args=OS.get_cmdline_user_args()
	for i in range(args.size()-1):
		if args[i]=="--impact-output":out=args[i+1]
	if out=="":quit(2);return
	DirAccess.make_dir_recursive_absolute(out+"/frames")
	var w=load("res://scenes/main.tscn").instantiate();root.add_child(w)
	while not w.camera:await process_frame
	w.paused=true;w.fixed_camera=true;w.capture_mode=true;w.hud.menu=false;w.hud.photo=true
	for i in range(36):
		var t=float(i)/35;w.camera.position=Vector3(-106+6*t,.65+sin(t*PI)*.1,53-3*t);w.camera.look_at(Vector3(-89,.12,39))
		for settle in range(2):await process_frame
		await RenderingServer.frame_post_draw
		var frame=w.get_viewport().get_texture().get_image();frame.save_png(out+"/frames/%03d.png"%i)
	var f=FileAccess.open(out+"/capture.json",FileAccess.WRITE)
	if f:f.store_string(JSON.stringify({"frames":36,"playback_fps":12,"source":"native Godot viewport","scene_paused":true,"camera":"low junction inspection","video_frames_are_unmodified":true},"  "))
	print("GROUND_MOTION_CAPTURE_COMPLETE ",out);quit()
