extends RefCounted
static func check(out: Array,passed: bool,label: String):out.append([passed,label]);print("CHECK ",passed," ",label)
static func ticks(w,n: int):
	for i in range(n):await w.get_tree().physics_frame
static func run(w,out: Array):
	var t=w.talents;var before=t.snapshot();var old_hp=w.player.hp;var old_pos=w.player.position
	var reward_total=0;var cost_total=0;var main_total=0;var side_total=0
	for m in t.data.missions:
		reward_total+=m.points
		if m.kind=="main":main_total+=m.points
		else:side_total+=m.points
	for n in t.data.nodes:cost_total+=n.cost
	check(out,reward_total==80 and cost_total==80 and main_total==35 and side_total==45 and t.data.missions.size()==42,"full-campaign finite reward ledger exactly funds the entire 80-point talent tree")
	var requires_all=true
	for m in t.data.missions:requires_all=requires_all and reward_total-m.points<cost_total
	check(out,requires_all,"omitting any single planned quest prevents buying the whole tree")
	check(out,t.award("c7.m2")==0 and t.award("invented")==0,"unimplemented chapters and arbitrary IDs cannot mint talent points")
	t.restore(null);t.award("c1.m1");var earned=t.total();t.award("c1.m1")
	check(out,t.total()==earned and not t.buy("attack2"),"quest replay cannot duplicate points and prerequisite purchases are enforced")
	for id in ["c0.m1","c0.m2","c1.m2","c1.s1","c1.s2","c1.s3"]:t.award(id)
	check(out,t.buy("attack1") and not t.buy("attack1") and t.buy("vitality1") and t.buy("defense1"),"shared points support a mixed attack, health and defense build")
	w.player.position=Vector3(-95,.1,-150);w.player.velocity=Vector3.ZERO;await ticks(w,5)
	t.sync_player(w.player);w.player.hp=w.player.max_hp;w.player.immunity=0;w.player.stun=0;w.player.hurt(20,Vector3.ZERO)
	check(out,w.player.max_hp==115 and is_equal_approx(w.player.hp,96.6),"purchased health and mitigation change real hero damage reception")
	var temporary_root=w.encounter_root==null
	if temporary_root:w.encounter_root=Node3D.new();w.add_child(w.encounter_root)
	var victim=w._fighter(w.player.position+Vector3(0,0,1.25),"brawler","player");victim.set_physics_process(false);w.player.immunity=0;w.player.stun=0;w.player.impulse=Vector3.ZERO;w.player.rotation.y=0;w.yaw=0;w.player.attack=-1;w.player.strike();await ticks(w,40)
	check(out,victim.hp<victim.max_hp-18,"attack talent increases a physically connected melee hit")
	w.people.erase(victim);w.fighters.erase(victim);victim.queue_free()
	if temporary_root:w.encounter_root.queue_free();w.encounter_root=null
	w.player.attack=-1;w.player.stun=0;w.player.hp=40;w.medicine=2;w._key(KEY_1)
	check(out,w.player.hp==80 and w.medicine==1,"ordinary medicine still consumes a real item and respects the upgraded maximum")
	t.buy("action1");w.dodge();check(out,t.dodge_window>1 and t.has("action1"),"movement talent arms an actual post-dodge heavy counter window")
	check(out,t.reason("attack3").contains("第2章") and not t.buy("attack3"),"advanced nodes cannot be bought before their chapter unlock")
	t.save_profile();var owned=t.owned.duplicate();t.owned=[];t.load_profile()
	check(out,t.owned==owned and t.available()>=0,"talent allocation and unique task rewards persist in a separate campaign profile")
	w._key(KEY_T);var d=t.dodge_window;await ticks(w,5)
	check(out,t.menu and w.paused and t.dodge_window==d,"talent menu pauses world simulation and combat timing")
	w._key(KEY_R);check(out,t.owned.is_empty() and t.available()==t.total(),"free respec refunds invested points without erasing completed quests")
	w._key(KEY_T)
	var old_stage=w.stage;w.stage=4;w._key(KEY_T);var blocked=not t.menu;w.failed_reason="测试撤离";w.paused=true;w._key(KEY_T);var configurable=t.menu;w._key(KEY_ESCAPE)
	check(out,blocked and configurable and w.paused,"active combat prevents respec while a failed encounter permits preparing talents without unpausing threats")
	w.stage=old_stage;w.failed_reason="";w.paused=false
	var ch=t.data.balance[7];check(out,ch.main_only_points==35 and ch.all_points==80 and ch.recommended_entry_points>ch.main_only_points and ch.enemy_hp_multiplier<1.5,"late campaign has an explicit side-quest growth gap without relying on excessive enemy HP")
	t.restore(before);t.save_profile();t.sync_player(w.player);w.player.position=old_pos;w.player.hp=minf(old_hp,w.player.max_hp);w.player.immunity=1;w.player.stun=0;w.player.impulse=Vector3.ZERO;w.player.dodge_time=0
