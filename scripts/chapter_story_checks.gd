extends RefCounted
static func ticks(w,n: int):
	for i in range(n):await w.get_tree().physics_frame
static func check(out: Array,passed: bool,label: String):out.append([passed,label]);print("CHECK ",passed," ",label)
static func run(w,out: Array) -> bool:
	var helper=load("res://scripts/chapter1_checks.gd")
	w._key(KEY_C);w._key(KEY_E);await ticks(w,4);var first=w.director.current;w._key(KEY_E);await ticks(w,2)
	check(out,w.director.kind=="welcome" and w.director.current==first+1 and w.stage==3,"dialogue advance moves one spoken line without skipping the entire birthday or starting combat")
	w._key(KEY_C);w._key(KEY_TAB);await ticks(w,3)
	check(out,w.story.birthday==1 and w.fighters.is_empty() and w.staff.is_empty(),"birthday welcome returns to a separate playable rehearsal instead of a surprise fight")
	var walk_ok=true
	for p in [ChapterOneSet.HALL+Vector3(-8,.16,5),w.story.PRACTICE_START]:walk_ok=(await helper.walk(w,p)) and walk_ok
	w._key(KEY_E);await ticks(w,2);w._key(KEY_TAB);await ticks(w,3)
	check(out,walk_ok and w.story.birthday==2 and w.story.practice.size()==3,"stage aisle and normal E interaction lead to three real cardboard practice targets")
	if w.story.practice.size()!=3:return false
	var dummy=w.story.practice[0];await helper.place(w,dummy.position+Vector3(0,0,1.3));w.yaw=PI;w.player.rotation.y=PI;w.player.attack=-1;w.player.strike("heavy");await ticks(w,42)
	check(out,dummy.hp<58,"birthday rehearsal uses actual physically connected combat against a paper prop")
	await helper.walk(w,w.story.PRACTICE_START);w._key(KEY_E);await ticks(w,2);w._key(KEY_TAB);await ticks(w,3)
	check(out,w.story.birthday==3 and w.stage==3 and w.story.practice.is_empty(),"a low-scoring rehearsal still continues to dinner without awarding a false main completion")
	for p in [ChapterOneSet.HALL+Vector3(-8,.16,5.5),w.story.DINNER]:await helper.walk(w,p)
	w._key(KEY_E);await ticks(w,2);w._key(KEY_TAB);await ticks(w,3)
	check(out,w.story.birthday==4 and w.stage==3 and w.fighters.is_empty() and w.cast.pange.visible,"birthday dinner leaves Pange visibly at the service entrance and does not spawn the evacuation battle")
	w.save_story();w.load_story();await ticks(w,4)
	check(out,w.story.birthday==4 and w.story.messenger!=null and w.story.helper!=null,"a dinner checkpoint restores the unresolved doorstep meeting without replaying the outing")
	for p in [ChapterOneSet.HALL+Vector3(0,.16,11.5),Vector3(-136,0,-222),w.story.MEETING+Vector3(-3,0,0)]:walk_ok=(await helper.walk(w,p)) and walk_ok
	w._key(KEY_E);await ticks(w,3)
	check(out,walk_ok and w.director.kind=="doorstep" and w.stage==3,"player walks out through the real door to witness why Carry's people want SN and confront Pange")
	if w.director.kind!="doorstep":return false
	w._key(KEY_TAB);await ticks(w,4)
	check(out,w.stage==4 and w.story.birthday==5 and w.story.recap().any(func(s):return "SN" in s and "推搡" in s),"only the witnessed confrontation hands over to an evacuation with a cause recorded in the story recap")
	return w.stage==4
