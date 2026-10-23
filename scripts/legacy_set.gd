class_name LegacySet
extends RefCounted

# A staged interpretation of the user-confirmed ending, not a reconstruction
# of unrecovered chapter V geometry. No defeated-boss fate is invented here.
static func dawn(root: Node3D):
	var water=PlaneMesh.new();water.size=Vector2(420,380)
	var material=ShaderMaterial.new();material.shader=load("res://shaders/legacy-river.gdshader")
	ToonKit.mesh(root,water,material,Vector3(0,-.35,-65))
	var outline=PackedVector2Array([Vector2(-24,65),Vector2(24,65),Vector2(24,11),Vector2(16,-7),Vector2(7,-15),Vector2(-7,-15),Vector2(-16,-7),Vector2(-24,11)])
	for i in range(outline.size()):outline[i].y=-outline[i].y
	var island=ToonKit.polygon(root,outline,"#8caa8a");island.rotation.x=-PI/2;island.position.y=-.12
	ToonKit.box(root,Vector3(21,.25,17),"#d9d2bc",Vector3(0,.025,-1),.14)
	for side in [-1,1]:
		ToonKit.box(root,Vector3(.5,.68,16),"#c3c3b0",Vector3(side*10.65,.22,-1),.08)
		for i in range(5):PrologueSet.tree(root,Vector3(side*(16+i%2*3),0,11+i*9))
	for i in range(3):ToonKit.box(root,Vector3(8,.07*(i+1),.65),"#d4cdb8",Vector3(0,.035*(i+1)-.1,8.7-i*.65),.025)
	for side in [-1,1]:
		ToonKit.box(root,Vector3(6,.63,.9),"#c3c3b0",Vector3(side*7.3,.22,7.25),.08)
		ToonKit.box(root,Vector3(3.2,.22,.8),"#859c91",Vector3(side*17,.45,6),.08)
		for x in [-1.1,1.1]:ToonKit.box(root,Vector3(.18,.45,.5),"#607e7b",Vector3(side*17+x,.15,6),.02)
	# Broad distant banks and a restrained skyline frame the river horizon.
	for side in [-1,1]:
		ToonKit.box(root,Vector3(35,2,280),"#899f9a",Vector3(side*145,-.5,-65))
		for i in range(9):
			var height=6+(i*7)%15
			ToonKit.box(root,Vector3(7,height,9),"#91a5a1",Vector3(side*(135+i%3*9),height/2.0,-135+i*17),.25)
	PrologueSet.finish_set(root)
	var sun=ToonKit.orb(root,Vector3(9,9,2),"#ffdab0",Vector3(-68,19,-150))
	var glow=StandardMaterial3D.new();glow.shading_mode=BaseMaterial3D.SHADING_MODE_UNSHADED;glow.albedo_color=Color("#ffdab0");sun.material_override=glow;sun.cast_shadow=GeometryInstance3D.SHADOW_CASTING_SETTING_OFF

static func home(root: Node3D,world: Node3D) -> Dictionary:
	ToonKit.box(root,Vector3(42,.2,42),"#94a58b",Vector3(0,-.22,0),.03)
	ToonKit.box(root,Vector3(32,1.1,.35),"#9eab93",Vector3(0,.45,-14.5),.04)
	for x in [-9,7]:
		ToonKit.box(root,Vector3(9,5.0,5),"#b7c0aa",Vector3(x,2.3,-18),.10)
		ToonKit.box(root,Vector3(9.5,.3,5.5),"#728b88",Vector3(x,4.9,-18),.05)
		ToonKit.box(root,Vector3(2.2,1.7,.1),"#7d9d9e",Vector3(x,2.8,-15.4),.03)
	PrologueSet.block(root,Vector3(14,.2,14),"#bf9670",Vector3(0,-.1,.5))
	PrologueSet.block(root,Vector3(.25,4.6,14),"#d4bc9e",Vector3(-7,2.3,.5))
	PrologueSet.block(root,Vector3(.25,4.6,14),"#d4bc9e",Vector3(7,2.3,.5))
	PrologueSet.block(root,Vector3(14,.24,14),"#e6d3b2",Vector3(0,4.72,.5))
	# Rear window is an opening with a real exterior beyond it.
	PrologueSet.block(root,Vector3(3,4.6,.25),"#d4bc9e",Vector3(-5.5,2.3,-6.5))
	PrologueSet.block(root,Vector3(6,4.6,.25),"#d4bc9e",Vector3(4,2.3,-6.5))
	PrologueSet.block(root,Vector3(5,1.05,.25),"#d4bc9e",Vector3(-1.5,.525,-6.5))
	PrologueSet.block(root,Vector3(5,1.1,.25),"#d4bc9e",Vector3(-1.5,4.05,-6.5))
	ToonKit.box(root,Vector3(5.25,.14,.55),"#f2e7cd",Vector3(-1.5,1.07,-6.42),.025)
	ToonKit.box(root,Vector3(.13,2.5,.2),"#f2e7cd",Vector3(-1.5,2.3,-6.42),.025)
	for x in [-3.9,.9]:ToonKit.box(root,Vector3(.5,2.6,.15),"#b87560",Vector3(x,2.35,-6.25),.05)
	ToonKit.box(root,Vector3(20,.25,7),"#8faa8c",Vector3(0,-.25,-10.1));PrologueSet.tree(root,Vector3(-4,0,-10.5))
	PrologueSet.block(root,Vector3(9.8,4.6,.25),"#d4bc9e",Vector3(-2.1,2.3,7.5))
	PrologueSet.block(root,Vector3(1.8,4.6,.25),"#d4bc9e",Vector3(6.1,2.3,7.5))
	PrologueSet.block(root,Vector3(2.4,1.65,.25),"#d4bc9e",Vector3(4,3.775,7.5))
	var door=StoryDoor.new();root.add_child(door);door.position=Vector3(4,0,7.5);door.build(world,2.4,false);door.enabled=false
	ToonKit.box(root,Vector3(4.2,.48,1.8),"#729689",Vector3(-2.1,.37,-1.5),.18)
	ToonKit.box(root,Vector3(4.2,.9,.3),"#5c827b",Vector3(-2.1,1.05,-2.25),.12)
	for x in [-4.1,-.1]:ToonKit.box(root,Vector3(.3,.65,1.8),"#5c827b",Vector3(x,.7,-1.5),.13)
	ToonKit.orb(root,Vector3(.45,.14,.58),"#f3dfb8",Vector3(-3.5,.73,-1.4))
	ToonKit.box(root,Vector3(4.6,.025,3.4),"#c4a18a",Vector3(-.8,.015,.5),.02)
	ToonKit.box(root,Vector3(2.7,.18,1.3),"#b17c55",Vector3(.2,.70,1.1),.07)
	for x in [-.9,1.3]:
		for z in [.65,1.55]:ToonKit.box(root,Vector3(.12,.65,.12),"#895e46",Vector3(x,.34,z),.025)
	# Eight folded baby outfits, not a machine or an exposition prop.
	for i in range(8):
		var p=Vector3(-.65+(i%4)*.55,.835, .85+(i/4)*.48)
		ToonKit.box(root,Vector3(.43,.10,.32),"#f5eddb",p,.04)
		ToonKit.box(root,Vector3(.11,.015,.12),StoryCast.BADGES[i],p+Vector3(.12,.058,.07),.02)
	PrologueSet.block(root,Vector3(2.0,1.8,.75),"#a77d5b",Vector3(5.8,.9,-3.8))
	ToonKit.orb(root,Vector3(.20,.24,.20),"#e6d6b6",Vector3(5.6,2.08,-3.8));PrologueSet.plant(root,Vector3(-5.8,0,4.3))
	PrologueSet.ceiling_light(root,Vector3(-1,4.48,.5),"#ffe6b8",.65)
	PrologueSet.finish_set(root);PrologueSet.local_lighting(root)
	return {"door":door}
