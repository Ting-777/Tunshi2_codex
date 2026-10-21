class_name ShanghaiCity
extends Node3D

var pois=[]
var roads=[]
var bridge_routes=[]
var blocks=[]
var crates=[]
var rng=RandomNumberGenerator.new()
var ground_material: ShaderMaterial

func build():
	rng.seed=20261021;_light();_land();await get_tree().process_frame
	roads=[{"a":Vector2(-150,40),"b":Vector2(230,40),"width":18.0},{"a":Vector2(-95,-270),"b":Vector2(-95,155),"width":16.0},{"a":Vector2(6,12),"b":Vector2(226,160),"width":22.0},{"a":Vector2(90,35),"b":Vector2(90,-250),"width":13.0},{"a":Vector2(-92,-120),"b":Vector2(222,-120),"width":13.0},{"a":Vector2(-94,108),"b":Vector2(225,108),"width":13.0}]
	for i in range(roads.size()):_road_mesh(i)
	var segments=PackedVector4Array();var widths=PackedFloat32Array()
	for road in roads:segments.append(Vector4(road.a.x,road.a.y,road.b.x,road.b.y));widths.append(road.width)
	ground_material.set_shader_parameter("road_segments",segments);ground_material.set_shader_parameter("road_widths",widths)
	_bridge();_landmarks();await get_tree().process_frame;_shops();_props();_street_details();StreetDecor.build(self);UrbanFrontage.ground(self);await get_tree().process_frame;_batch();ToonKit.finish(self)

func _light():
	var w=WorldEnvironment.new();var e=Environment.new();e.background_mode=Environment.BG_SKY
	var sky=Sky.new();var material=ShaderMaterial.new();material.shader=load("res://shaders/city-sky.gdshader");sky.sky_material=material;e.sky=sky
	e.ambient_light_source=Environment.AMBIENT_SOURCE_COLOR;e.ambient_light_color=Color("#8796db");e.ambient_light_energy=.05
	e.tonemap_mode=Environment.TONE_MAPPER_LINEAR;e.tonemap_exposure=1.0
	e.fog_enabled=true;e.fog_density=.0008;e.fog_light_color=Color("#88bedd");e.fog_sky_affect=0.0
	w.environment=e;add_child(w)
	var sun=DirectionalLight3D.new();sun.rotation_degrees=Vector3(-55,-32,0);sun.light_color=Color.WHITE;sun.light_energy=.98
	sun.shadow_enabled=true;sun.directional_shadow_max_distance=115;sun.directional_shadow_mode=DirectionalLight3D.SHADOW_PARALLEL_2_SPLITS;sun.shadow_bias=.25;sun.shadow_normal_bias=2.0;sun.directional_shadow_blend_splits=true;add_child(sun)

func _land():
	ground_material=ShaderMaterial.new();ground_material.shader=load("res://shaders/pavement.gdshader");var surface=ToonKit.mesh(self,ToonKit.rounded(Vector3(440,.8,470),.08),ground_material,Vector3(50,-.4,-60));surface.name="ContinuousGround";ToonKit.solid(self,Vector3(440,.8,470),Vector3(50,-.4,-60))
	ground_material.set_shader_parameter("grass_rects",PackedVector4Array([Vector4(-135,-92,29,142),Vector4(-61,-162,48,104),Vector4(156,-185,152,111),Vector4(104,-80,70,59)]))
	var plane=PlaneMesh.new();plane.size=Vector2(1300,1500);var water=ShaderMaterial.new();water.shader=load("res://shaders/river.gdshader");ToonKit.mesh(self,plane,water,Vector3(-450,-.65,-80))
	ToonKit.box(self,Vector3(1,1.5,470),"#31516a",Vector3(-170,-.4,-60));ToonKit.solid(self,Vector3(1,1.4,470),Vector3(-170,.5,-60));ToonKit.box(self,Vector3(.15,.12,470),"#f0dfba",Vector3(-169.7,1.2,-60))
	for z in range(-290,175,5):ToonKit.box(self,Vector3(.1,1.15,.1),"#263957",Vector3(-169.7,.65,z),.02)
	ToonKit.box(self,Vector3(75,2,1000),"#94b4c5",Vector3(-440,-.3,-80))
	for i in range(22):
		var z=-320+i*31;var x=-425-rng.randf_range(0,25);var h=rng.randf_range(13,28);ToonKit.box(self,Vector3(16,h,23),"#a5b7cf",Vector3(x,h/2,z),.6);ToonKit.box(self,Vector3(17,1.3,24),"#f1dabb",Vector3(x,h,z),.2)
		for y in range(3,int(h),4):ToonKit.box(self,Vector3(.06,.9,20),"#6289ad",Vector3(x+8.1,y,z),.01)
	var ferry=Node3D.new();ferry.position=Vector3(-278,0,-47);ferry.rotation.y=.25;add_child(ferry);ToonKit.box(ferry,Vector3(8,1.8,24),"#e5d6b5",Vector3(0,.3,0),1.2);ToonKit.box(ferry,Vector3(5.7,2.4,15),"#f0e5c7",Vector3(0,2.1,-1),.4);ToonKit.box(ferry,Vector3(5.8,.8,11),"#396c79",Vector3(0,2.4,-1));ToonKit.box(ferry,Vector3(6,.25,16),"#de8059",Vector3(0,3.45,-1))
	pois.append({"name":"滨江步道","p":Vector2(-160,15),"color":"#dfb166"})

func _road_mesh(index: int):
	var road=roads[index];var a=road.a;var b=road.b;var width=road.width;var d=b-a
	var g=Node3D.new();var midpoint=(a+b)*.5;g.position=Vector3(midpoint.x,0,midpoint.y);g.rotation.y=atan2(d.x,d.y);add_child(g)
	# The existing land collider supports asphalt, sidewalk and lawn continuously.
	# No raised invisible road-base box to catch the bottom of a car.
	# Asphalt and sidewalk are colors of ContinuousGround, not overlapping slabs.
	# Road crossings therefore have one depth surface while keeping the same collider.
	for z in range(int(-d.length()/2),int(d.length()/2),2):
		for side in [-1,1]:
			var local=Vector3(side*(width/2+.1),0,z+1);var point=g.transform*local
			if _in_junction(Vector2(point.x,point.z),index):continue
			ToonKit.box(g,Vector3(.2,.06,2.01),"#faf1dc",Vector3(local.x,.03,local.z),.01)
			ToonKit.box(g,Vector3(.18,.012,2.01),"#fff4da",Vector3(side*(width/2-.5),.020,local.z),.003)
	for z in range(int(-d.length()/2)+2,int(d.length()/2)-1,7):
		var point=g.transform*Vector3(0,0,z)
		if _in_junction(Vector2(point.x,point.z),index):continue
		for x in [-.17,.17]:ToonKit.box(g,Vector3(.09,.012,3),"#ffc448",Vector3(x,.021,z),.003)
		for side in [-1,1]:ToonKit.box(g,Vector3(.09,.012,2.6),"#fff6e1",Vector3(side*width/4,.021,z),.003)

func _in_junction(p: Vector2,index: int):
	for j in range(roads.size()):
		if j==index:continue
		var r=roads[j]
		if p.distance_to(Geometry2D.get_closest_point_to_segment(p,r.a,r.b))<r.width/2+2.0:return true
	return false

func _bridge():
	CityBridge.build(self)
	for x in [-102,-38,44,82]:
		for i in range(8):ToonKit.box(self,Vector3(3.6,.012,.85),"#eee3c3",Vector3(x,.023,32.8+i*1.85),.003)
	pois.append({"name":"陆家嘴环形天桥","p":Vector2(0,-10),"color":"#e8b268"})

func facade(glass: String,frame: String="#223d5c"):
	var m=ShaderMaterial.new();m.shader=load("res://shaders/facade.gdshader");m.set_shader_parameter("glass",Color(glass));m.set_shader_parameter("frame",Color(frame));return m

func tower(p: Vector3,size: Vector3,color: String,frame: String="#264968"):
	ToonKit.mesh(self,ToonKit.rounded(size,.3),facade(color,frame),p+Vector3.UP*size.y/2);ToonKit.solid(self,size,p+Vector3.UP*size.y/2);blocks.append(Rect2(Vector2(p.x-size.x/2,p.z-size.z/2),Vector2(size.x,size.z)));ToonKit.box(self,Vector3(size.x+1.5,.7,size.z+1.5),"#d6d0b1",p+Vector3.UP*1.1,.15)

func _landmarks():
	var p=Vector3(-64,0,-85);OrientalPearl.build(self,p);pois.append({"name":"东方明珠","p":Vector2(-64,-85),"color":"#d885ac"})

	tower(Vector3(39,0,-29),Vector3(18,65,18),"#17789a");tower(Vector3(65,0,-27),Vector3(17,72,19),"#3f9ab0");tower(Vector3(60,0,-15),Vector3(43,8,30),"#215b7b","#efdfc4");ToonKit.text(self,"ifc  ·  国金中心",Vector3(60,7.2,.16),.028)
	for x in [45,60,75]:lobby(Vector3(x,0,.8),7)
	pois.append({"name":"国金中心","p":Vector2(52,-20),"color":"#77a8a1"})
	var jm=Vector3(129,0,-43)
	for i in range(14):var w=24-i*1.2;ToonKit.mesh(self,ToonKit.rounded(Vector3(w,7.2,w),.35),facade("#6d8fb3","#b7d0df"),jm+Vector3.UP*(i*7+3.6));ToonKit.box(self,Vector3(w+1,.7,w+1),"#e1d7bb",jm+Vector3.UP*(i*7+7),.2)
	ToonKit.cyl(self,2,15,"#dce0c7",jm+Vector3.UP*105,.3);ToonKit.solid(self,Vector3(24,110,24),jm+Vector3.UP*55);pois.append({"name":"金茂大厦","p":Vector2(129,-43),"color":"#a4b8ac"})
	var sw=Vector3(178,0,-31);tower(sw,Vector3(23,112,18),"#227ca9","#23476c")
	for side in [-1,1]:tower(sw+Vector3(side*9.4,112,0),Vector3(4.2,24,18),"#227ca9","#23476c")
	tower(sw+Vector3(0,133,0),Vector3(23,4,18),"#227ca9","#23476c");pois.append({"name":"环球金融中心","p":Vector2(178,-31),"color":"#5b9da7"})
	_loft(Vector3(132,0,3));pois.append({"name":"上海中心","p":Vector2(132,3),"color":"#8fc4be"})
	for i in range(9):var q=Node3D.new();q.position=Vector3(76+i*7,.17,-54-i*6);q.rotation.y=-.7;add_child(q);ToonKit.box(q,Vector3(7,.05,11),"#f8e9cc",Vector3.ZERO,.02)
	for x in [78,104,133]:
		for z in [-60,-93]:tree(Vector3(x,.16,z),1.2)
	pois.append({"name":"中心绿地","p":Vector2(104,-80),"color":"#a5bd80"})

func _loft(origin: Vector3):
	var st=SurfaceTool.new();st.begin(Mesh.PRIMITIVE_TRIANGLES)
	for k in range(36):
		for i in range(48):
			var p=[]
			for j in [Vector2i(i,k),Vector2i(i+1,k),Vector2i(i,k+1),Vector2i(i+1,k+1)]:var t=float(j.y)/36;var a=TAU*j.x/48+t*1.7;var r=(12.4-7.1*t)*(1+.12*cos(3*a-t*1.7));p.append(origin+Vector3(sin(a)*r,t*168,cos(a)*r))
			for j in [0,2,1,2,3,1]:st.add_vertex(p[j])
	st.generate_normals();ToonKit.mesh(self,st.commit(),facade("#4ba5b4","#204b6a"))
	for j in range(9):
		for k in range(24):
			var p=[]
			for h in [k,k+1]:var t=float(h)/24;var a=TAU*j/9+t*1.7;var r=(12.45-7.1*t)*(1+.12*cos(3*a-t*1.7));p.append(origin+Vector3(sin(a)*r,t*168,cos(a)*r))
			ToonKit.rod(self,p[0],p[1],.11,"#d1ddc4")
	ToonKit.cyl(self,6,.6,"#c4d6c0",origin+Vector3.UP*168,5.6,48);ToonKit.solid(self,Vector3(22,168,22),origin+Vector3.UP*84)

func lobby(p: Vector3,width: float):
	ToonKit.box(self,Vector3(width,3.4,.35),"#315765",p+Vector3.UP*1.85,.05)
	for side in [-1,1]:ToonKit.box(self,Vector3(.18,3.6,2.7),"#e9ddbc",p+Vector3(side*(width/2+.15),1.9,1));ToonKit.box(self,Vector3(.1,2.8,.15),"#99bab3",p+Vector3(side*width*.2,1.7,.23));ToonKit.box(self,Vector3(.045,.6,.06),"#e6c98a",p+Vector3(side*.35,1.6,.48),.01)
	ToonKit.box(self,Vector3(width+1.2,.25,3.4),"#efdcb6",p+Vector3(0,3.9,1.1));ToonKit.box(self,Vector3(width+1.2,.22,3.4),"#c4c7aa",p+Vector3(0,.17,1.1))

func _shops():
	UrbanFrontage.build(self)
	for p in [Vector3(24,0,85),Vector3(65,0,83),Vector3(126,0,143),Vector3(206,0,94),Vector3(218,0,3),Vector3(-132,0,-182),Vector3(-132,0,75),Vector3(205,0,-65)]:var h=rng.randf_range(24,56);tower(p,Vector3(20,h,23),["#6b9a9a","#82a6a0","#729ca7"][rng.randi_range(0,2)]);lobby(p+Vector3(0,0,11.8),9)
	for x in [166,208]:ToonKit.box(self,Vector3(29,4,13),"#d7c8a6",Vector3(x,2,-93),.25);ToonKit.box(self,Vector3(25,2.5,.16),"#1f556e",Vector3(x,1.5,-86.4));ToonKit.box(self,Vector3(29,.4,3),"#ebd4a8",Vector3(x,4.2,-85.8));ToonKit.solid(self,Vector3(29,4,13),Vector3(x,2,-93))
	pois.append({"name":"豚港咖啡","p":Vector2(-69,15),"color":"#df9865"})

func tree(p: Vector3,scale_value: float=1):
	UrbanFrontage.tree(self,p,scale_value)

func flower(p: Vector3):
	ToonKit.cyl(self,1,.45,"#d5b995",p+Vector3.UP*.2,1.1,16);ToonKit.orb(self,Vector3(.9,.35,.9),"#7caa77",p+Vector3.UP*.55)
	for i in range(5):var a=i*TAU/5;ToonKit.orb(self,Vector3(.1,.08,.1),"#efbf73",p+Vector3(sin(a)*.55,.8,cos(a)*.55))

func bench(p: Vector3,angle: float=0):
	var g=Node3D.new();g.position=p;g.rotation.y=angle;add_child(g)
	for z in [-.29,0,.29]:ToonKit.box(g,Vector3(2.15,.09,.24),"#b28d60",Vector3(0,.6,z),.03)
	for y in [.9,1.15]:ToonKit.box(g,Vector3(2.15,.15,.1),"#c19c6b",Vector3(0,y,-.4),.02)
	for x in [-.83,.83]:ToonKit.box(g,Vector3(.08,.62,.7),"#456b71",Vector3(x,.3,0),.02);ToonKit.box(g,Vector3(.08,.85,.08),"#456b71",Vector3(x,.85,-.4),.02)
	ToonKit.solid(g,Vector3(2.2,.65,.9),Vector3(0,.3,0))

func _props():
	for z in range(-230,140,22):tree(Vector3(-157,.15,z),1.15);tree(Vector3(-131,.15,z),1.1)
	for z in range(-215,135,44):bench(Vector3(-163,.15,z),-PI/2);ToonKit.box(self,Vector3(47,.1,3.5),"#d3dbe1",Vector3(-138,.04,z+9));flower(Vector3(-125,.1,z+13))
	for x in range(-140,215,18):
		if x< -100 or x> -14:tree(Vector3(x,.1,25),1)
		if x>95:tree(Vector3(x,.1,57),1.05)
		var g=Node3D.new();g.position=Vector3(x,.1,27);add_child(g);ToonKit.cyl(g,.065,6.3,"#263554",Vector3.UP*3.15,.05,10);ToonKit.rod(g,Vector3(0,6.1,0),Vector3(0,6.1,1.5),.06,"#263554");ToonKit.box(g,Vector3(.55,.14,1.6),"#e5d8b6",Vector3(0,6.08,1.25));ToonKit.box(g,Vector3(.55,1.5,.045),"#fa6048",Vector3(.36,4.4,0));ToonKit.text(g,"上海",Vector3(.36,4.4,.045),.004)
	for p in [Vector3(-73,.15,18),Vector3(-45,.15,18),Vector3(41,.15,22),Vector3(65,.15,18),Vector3(83,.15,-73)]:bench(p)

	for p in [Vector3(-25,.15,19),Vector3(-15,.15,15),Vector3(104,.15,-57),Vector3(-153,.15,-38)]:
		var g=Node3D.new();g.position=p;add_child(g);ToonKit.box(g,Vector3(.85,1,.85),"#bd9563",Vector3.UP*.5,.05)
		for y in [.12,.8]:ToonKit.box(g,Vector3(.91,.08,.91),"#e0be8b",Vector3.UP*y,.02)
		ToonKit.solid(g,Vector3(.9,1,.9),Vector3.UP*.5);crates.append({"node":g,"p":p,"hp":32.0})
	var sign=Node3D.new();sign.position=Vector3(-8,.1,25);add_child(sign);ToonKit.box(sign,Vector3(2.6,2.2,.2),"#386e80",Vector3.UP*2.7,.1);ToonKit.box(sign,Vector3(.15,1.8,.15),"#53787b",Vector3.UP*.9);ToonKit.text(sign,"陆家嘴\nLUJIAZUI\n← 滨江    国金 →",Vector3(0,2.7,.13),.008)

func _batch():
	var groups={}
	for n in find_children("*","MeshInstance3D",true,false):
		var keep=false
		for c in crates:
			if n.get_parent()==c.node:keep=true
		if keep or n.material_override==null:continue
		var p=n.global_position;var key=str(n.material_override.get_instance_id())+":"+str(floor(p.x/80))+":"+str(floor(p.z/80))
		if not groups.has(key):groups[key]={"mat":n.material_override,"nodes":[]}
		groups[key].nodes.append(n)
	for g in groups.values():
		if g.nodes.size()<2:continue
		var st=SurfaceTool.new();st.begin(Mesh.PRIMITIVE_TRIANGLES)
		for n in g.nodes:st.append_from(n.mesh,0,n.global_transform)
		ToonKit.mesh(self,st.commit(),g.mat)
		for n in g.nodes:n.queue_free()

func _street_details():
	var frontage_index=0
	for spot in [Vector3(-124,0,-66),Vector3(-126,0,-112),Vector3(15,0,-150),Vector3(48,0,-161),Vector3(211,0,-155)]:
		var g=Node3D.new();g.position=spot;add_child(g)
		var wall=["#f5dac0","#b9d7df","#e0c5db"][frontage_index%3];frontage_index+=1
		ToonKit.box(g,Vector3(17,13,19),wall,Vector3(0,6.5,0),.3);ToonKit.solid(g,Vector3(17,13,19),Vector3(0,6.5,0));blocks.append(Rect2(Vector2(spot.x-8.5,spot.z-9.5),Vector2(17,19)))
		ToonKit.box(g,Vector3(18,.6,20),"#ebdec1",Vector3(0,13,0),.15)
		for x in [-5,0,5]:
			for y in [5.5,9.2]:
				ToonKit.box(g,Vector3(3.2,2.5,.2),"#476f77",Vector3(x,y,9.62),.04);ToonKit.box(g,Vector3(.10,2.6,.3),"#e9dfc1",Vector3(x,y,9.76),.02);ToonKit.box(g,Vector3(3.5,.14,.6),"#e9dfc1",Vector3(x,y-1.3,9.8),.025)
		for x in [-8.3,8.3]:
			ToonKit.box(g,Vector3(.42,13,.5),"#fff0d2",Vector3(x,6.5,9.5),.03)
			ToonKit.cyl(g,.05,10.5,"#365573",Vector3(x-.3,6.4,9.8),-1,8)
		for y in [4.2,7.5,11.2]:ToonKit.box(g,Vector3(17.5,.16,.6),"#fff0d2",Vector3(0,y,9.6),.025)
		var side=Node3D.new();side.position=Vector3(-8.56,0,0);side.rotation.y=-PI/2;g.add_child(side)
		for xx in [-6,0,6]:
			for yy in [5.5,9.2]:UrbanFrontage._window(side,Vector3(xx,yy,0),2.8,2.45,"#eef0dc")
		ToonKit.box(g,Vector3(5,2.8,5),wall,Vector3(-4,14,-4),.10)
		ToonKit.box(g,Vector3(5.2,.20,5.2),"#fff0d2",Vector3(-4,15.5,-4),.03)
		ToonKit.cyl(g,1.4,2.4,"#517c96",Vector3(3,14.5,-2),-1,16)
		ToonKit.cyl(g,1.55,.15,"#263957",Vector3(3,15.78,-2),1.4,16)
		UrbanFrontage._ac(g,Vector3(-2.5,10.8,10.1))
		ToonKit.box(g,Vector3(15.4,2.6,.2),"#436f78",Vector3(0,1.6,9.62));ToonKit.box(g,Vector3(16,1,.3),"#b88166",Vector3(0,3.6,9.8));ToonKit.text(g,"RIVERSIDE  ·  沿江里",Vector3(0,3.6,10),.009)
	for z in range(-200,132,27):
		for x in [-144,-120]:
			for side in [-1,1]:ToonKit.box(self,Vector3(1.4,.38,3.8),"#819e71",Vector3(x+side*2,.27,z),.17)
	for x in [-82,-58]:
		var g=Node3D.new();g.position=Vector3(x,.12,21);add_child(g);ToonKit.box(g,Vector3(.9,1.25,.12),"#385c68",Vector3.UP*.7,.06);ToonKit.box(g,Vector3(.74,.96,.025),"#e9dbb6",Vector3(0,.72,.08),.02);ToonKit.text(g,"COFFEE\n¥ 18",Vector3(0,.76,.1),.0023)
	for x in [-110,74,151]:
		var g=Node3D.new();g.position=Vector3(x,.12,29);add_child(g);ToonKit.cyl(g,.055,3.3,"#426872",Vector3.UP*1.65,.05,12);ToonKit.box(g,Vector3(.6,1.1,.32),"#345763",Vector3(0,2.75,0),.05)
		for i in range(3):ToonKit.orb(g,Vector3(.15,.15,.04),["#d77461","#d9b563","#87af80"][i],Vector3(0,3.06-i*.30,.18))
	# Solid seating and low retaining walls frame the riverside instead of a featureless plane.
	for z in [-126,-82,-38,62,105]:
		ToonKit.box(self,Vector3(5,.45,2),"#d9caaa",Vector3(-160,.3,z),.14);ToonKit.solid(self,Vector3(5,.45,2),Vector3(-160,.3,z));flower(Vector3(-156,.15,z+3))
