class_name OrientalPearl
extends RefCounted

# Outdoor, stylized reconstruction. Height scale 0.27: 468 m -> 126.36 units.
# Retain the triangular three-tube structural silhouette rather than a central pole.
const CONCRETE="#dce4ec"
const EDGE="#adc0d0"
const INK="#324865"
const ROSE="#d772a0"
const GLASS="#284c70"
const CREAM="#fff1d8"

static func build(city: Node3D,p: Vector3) -> Node3D:
	var g=Node3D.new();g.name="OrientalPearl";g.position=p;city.add_child(g)
	_plaza(city,g);_base(g)
	var angle_offset=PI/6
	for i in range(3):
		var a=TAU*i/3+angle_offset;var radial=Vector3(sin(a),0,cos(a));var shaft=radial*2.18
		# Three independent lift/stair tubes, open between them above the entrance hall.
		ToonKit.cyl(g,1.215,74.8,CONCRETE,shaft+Vector3.UP*40.2,-1,36)
		_cylinder(g,1.215,74.8,shaft+Vector3.UP*40.2)
		for y in [33,61.2,77.7]:
			ToonKit.cyl(g,1.255,.15,EDGE,shaft+Vector3.UP*y,-1,36)
		var foot=radial*12.6+Vector3.UP*1.1;var shoulder=shaft+radial*.25+Vector3.UP*24.6
		ToonKit.rod(g,foot,shoulder,.945,CONCRETE);_beam_collision(g,foot,shoulder,.945)
		_sphere(g,foot.lerp(shoulder,.34),1.48,false,24,14)
		# The diagonal shafts seat in shaped pedestals and meet distinct bearing collars.
		ToonKit.cyl(g,1.5,.6,INK,radial*12.6+Vector3.UP*.48,1.25,24)

	# Service ties read as actual bridges between columns, rather than rings on a pole.
	for y in [33.3,47,61.2]:
		for i in range(3):
			var a=TAU*i/3+angle_offset;var b=TAU*(i+1)/3+angle_offset
			var from=Vector3(sin(a)*2.18,y,cos(a)*2.18);var to=Vector3(sin(b)*2.18,y,cos(b)*2.18)
			ToonKit.rod(g,from,to,.22,EDGE)
			ToonKit.rod(g,from+Vector3.UP*.7,to+Vector3.UP*.7,.055,CONCRETE)
	# Five hotel spheres sit inside the three-tube frame, beneath connecting decks.
	for i in range(5):
		var point=Vector3(0,37.4+i*5.8,0)
		_sphere(g,point,1.73,false,24,14)
		var platform=ToonKit.cyl(g,3.6,.38,CONCRETE,point+Vector3.UP*1.5,-1,3);platform.rotation.y=angle_offset
		var stripe=ToonKit.cyl(g,3.615,.12,ROSE,point+Vector3.UP*1.49,-1,3);stripe.rotation.y=angle_offset
		var railing=ToonKit.cyl(g,3.65,.07,INK,point+Vector3.UP*1.75,-1,3);railing.rotation.y=angle_offset
	_sphere(g,Vector3(0,25.1,0),6.75,true,48,26)
	_sphere(g,Vector3(0,73.6,0),6.08,true,48,26)
	_deck(g,Vector3(0,71.0,0),5.57,.78)
	# Slender upper core, space capsule, antenna equipment and lattice mast.
	ToonKit.cyl(g,.65,14.4,CONCRETE,Vector3(0,85.4,0),.56,32)
	for y in [81,84,87,90]:ToonKit.cyl(g,.70,.14,EDGE,Vector3.UP*y,-1,32)
	_sphere(g,Vector3(0,92.35,0),1.96,false,32,18)
	_deck(g,Vector3(0,92.2,0),1.98,.46)
	_mast(g)
	return g

static func _sphere(g: Node3D,center: Vector3,radius: float,main: bool,segments: int,rings: int):
	# Each pane is an inset triangle on a true sphere. Gaps expose a thin steel web;
	# multi-color glass and a dark window belt replace featureless pink balls.
	var shape=SphereMesh.new();shape.radius=radius-.012;shape.height=(radius-.012)*2;shape.radial_segments=segments;shape.rings=rings
	ToonKit.mesh(g,shape,ToonKit.mat("#c9cbd8" if main else "#9caec3"),center)
	var st=SurfaceTool.new();st.begin(Mesh.PRIMITIVE_TRIANGLES)
	for k in range(rings):
		for i in range(segments):
			var points=[]
			for cell in [Vector2i(i,k),Vector2i(i+1,k),Vector2i(i,k+1),Vector2i(i+1,k+1)]:
				var phi=PI*float(cell.y)/rings;var theta=TAU*float(cell.x)/segments
				points.append(Vector3(sin(theta)*sin(phi),cos(phi),cos(theta)*sin(phi))*radius)
			for triangle in [[0,1,2],[1,3,2]]:
				var mid=(points[triangle[0]]+points[triangle[1]]+points[triangle[2]])/3
				if mid.length()<.01:continue
				var seed_i=(i*17+k*13+(1 if triangle[0]==1 else 0))%11
				var color=Color(["#ca79a2","#c3739f","#d18aac","#bb79a4","#ad8eb3"][seed_i%5]) if main else Color(["#b4c5d8","#a1b9cd","#c1cddd","#aab7d2"][seed_i%4])
				var normalized_y=mid.y/radius
				if main:
					var lower=center.y<30
					if normalized_y<-.34 or normalized_y>(.58 if lower else .82):
						color=Color(["#c3d1de","#cdd9e2","#bacbdc"][seed_i%3])
					elif normalized_y>(-.02 if lower else -.28) and normalized_y<(.16 if lower else -.13):
						color=Color(["#335c83","#48738f","#668da6"][i%3])
					elif i>=8 and i<=12:color=color.lerp(Color("#ecd0da"),.30)
				elif center.y>85 and normalized_y>-.10 and normalized_y<.30:color=Color("#bd6d98")
				st.set_color(color)
				for index in triangle:
					var v=(mid+(points[index]-mid)*.955).normalized()*radius
					st.set_normal(v.normalized());st.add_vertex(center+v)
	var material=ToonKit.mat("#ffffff").duplicate();material.vertex_color_use_as_albedo=true;material.vertex_color_is_srgb=true;material.cull_mode=BaseMaterial3D.CULL_DISABLED
	ToonKit.mesh(g,st.commit(),material)
	# Four latitudinal structural bands; meridians are already in the pane web.
	for t in [-.35,-.02,.16,.60]:_lat_ring(g,center,radius+.025,t,.08 if main else .045,CONCRETE)
	if main:
		_lat_ring(g,center,radius+.04,-.11,.055,"#a5bbcb")
		# Portholes around the lower observation level have frames and recessed glass.
		for i in range(30):
			var a=TAU*i/30;var y=-.47*radius;var r=sqrt(radius*radius-y*y)+.035
			var n=Node3D.new();n.position=center+Vector3(sin(a)*r,y,cos(a)*r);n.rotation.y=a;g.add_child(n)
			ToonKit.disk(n,.20,CONCRETE,Vector3.ZERO);ToonKit.disk(n,.145,GLASS,Vector3(0,0,.03))

static func _lat_ring(g: Node3D,center: Vector3,radius: float,t: float,thickness: float,color: String):
	var ring_radius=sqrt(1-t*t)*radius
	ToonKit.ring(g,ring_radius,thickness,.065,color,center+Vector3.UP*radius*t)

static func _deck(g: Node3D,center: Vector3,radius: float,height: float):
	ToonKit.cyl(g,radius+.15,.12,CONCRETE,center+Vector3.UP*(height/2),-1,72)
	ToonKit.cyl(g,radius+.11,.16,INK,center-Vector3.UP*(height/2),-1,72)
	# Individually framed angled glass, authored as one ring rather than 72 nodes.
	var st=SurfaceTool.new();st.begin(Mesh.PRIMITIVE_TRIANGLES)
	for i in range(72):
		var a=TAU*(i+.04)/72;var b=TAU*(i+.96)/72
		var p=[Vector3(sin(a)*radius,-height/2,cos(a)*radius),Vector3(sin(b)*radius,-height/2,cos(b)*radius),Vector3(sin(a)*radius,height/2,cos(a)*radius),Vector3(sin(b)*radius,height/2,cos(b)*radius)]
		for j in [0,2,1,1,2,3]:st.set_normal(Vector3(p[j].x,0,p[j].z).normalized());st.set_color(Color("#6eabc6" if i%5==0 else GLASS));st.add_vertex(center+p[j])
	var material=ToonKit.mat("#ffffff").duplicate();material.vertex_color_use_as_albedo=true;material.cull_mode=BaseMaterial3D.CULL_DISABLED;ToonKit.mesh(g,st.commit(),material)
	for i in range(36):
		var a=TAU*i/36;ToonKit.rod(g,center+Vector3(sin(a)*(radius+.025),-height*.48,cos(a)*(radius+.025)),center+Vector3(sin(a)*(radius+.025),height*.48,cos(a)*(radius+.025)),.025,CONCRETE)

static func _mast(g: Node3D):
	var low=94.4;var high=123.6
	for i in range(12):
		var t=float(i)/12;var t2=float(i+1)/12;var r=lerpf(.79,.12,t);var r2=lerpf(.79,.12,t2);var y=lerpf(low,high,t);var y2=lerpf(low,high,t2)
		var color=CONCRETE if i%4<2 else "#cf768b"
		for j in range(4):
			var a=TAU*j/4+PI/4;var b=TAU*(j+1)/4+PI/4
			var p1=Vector3(sin(a)*r,y,cos(a)*r);var p2=Vector3(sin(a)*r2,y2,cos(a)*r2)
			var p3=Vector3(sin(b)*r,y,cos(b)*r);var p4=Vector3(sin(b)*r2,y2,cos(b)*r2)
			ToonKit.rod(g,p1,p2,.065,color);ToonKit.rod(g,p1,p3,.04,color);ToonKit.rod(g,p1,p4,.032,color);ToonKit.rod(g,p3,p2,.032,color)
	for y in [95.1,100.1,107.4]:
		ToonKit.ring(g,1.0 if y<101 else .7,.20,.10,EDGE,Vector3.UP*y)
	ToonKit.cyl(g,.10,2.76,CONCRETE,Vector3.UP*124.98,.035,16)
	ToonKit.orb(g,Vector3(.11,.14,.11),"#fa6676",Vector3.UP*126.36)

static func _base(g: Node3D):
	ToonKit.cyl(g,13.8,.22,EDGE,Vector3.UP*.11,-1,96)
	_cylinder(g,13.8,.22,Vector3.UP*.11)
	ToonKit.cyl(g,12.95,.18,CREAM,Vector3.UP*.30,-1,96)
	_cylinder(g,12.95,.18,Vector3.UP*.30)
	# Broad glazing bays and a clean continuous roof. Frames are actual supports;
	# there is no second decorative grid or roof stripe layer.
	ToonKit.cyl(g,7.8,3.6,GLASS,Vector3.UP*2.19,-1,72)
	_cylinder(g,7.8,3.6,Vector3.UP*2.19)
	ToonKit.cyl(g,8.25,.23,CONCRETE,Vector3.UP*4.1,-1,96)
	ToonKit.cyl(g,8.15,1.5,CONCRETE,Vector3.UP*4.95,3.55,72)
	for i in range(12):
		if i%4==0:continue
		var a=TAU*i/12;var radial=Vector3(sin(a),0,cos(a))
		ToonKit.rod(g,radial*7.84+Vector3.UP*.52,radial*7.84+Vector3.UP*3.98,.12,EDGE)
	# One coherent doorway per canopy, with two glass leaves and short handles.
	for i in range(3):
		var a=TAU*i/3;var entry=Node3D.new();entry.rotation.y=a;g.add_child(entry)
		ToonKit.box(entry,Vector3(6.5,.22,3.0),CREAM,Vector3(0,3.65,8.2),.06)
		for side in [-1,1]:
			ToonKit.box(entry,Vector3(.22,3.15,.22),INK,Vector3(side*2.85,1.95,9.35),.03)
			ToonKit.box(entry,Vector3(.22,2.65,.24),CONCRETE,Vector3(side*2.05,1.76,7.93),.025)
			ToonKit.box(entry,Vector3(1.94,2.37,.10),"#47738e" if side<0 else "#3e6683",Vector3(side*.98,1.76,7.96),.025)
			ToonKit.box(entry,Vector3(.075,.42,.10),CREAM,Vector3(side*.18,1.68,8.05),.015)
		ToonKit.box(entry,Vector3(4.3,.20,.26),CONCRETE,Vector3(0,3.05,7.93),.025)
		ToonKit.box(entry,Vector3(6.7,.60,.18),INK,Vector3(0,3.5,9.72),.025)
		ToonKit.text(entry,"东方明珠",Vector3(0,3.52,9.84),.0065,CREAM)

static func _plaza(city: Node3D,g: Node3D):
	# Keep the surrounding public paths open and distinct from the building footprint.
	ToonKit.cyl(g,21.8,.035,"#b8cbd7",Vector3.UP*.018,-1,96)
	for i in range(3):
		var a=TAU*i/3;var approach=Node3D.new();approach.rotation.y=a;g.add_child(approach)
		ToonKit.box(approach,Vector3(4.6,.02,11.5),CREAM,Vector3(0,.05,18.7),.01)
		var ramp=ToonKit.box(approach,Vector3(4.6,.08,3.6),CREAM,Vector3(0,.20,14.4),.01);ramp.rotation.x=atan(.4/3.6)
		var support=ToonKit.solid(approach,Vector3(4.6,.08,3.6),Vector3(0,.20,14.4));support.rotation.x=ramp.rotation.x
	for i in range(6):
		var a=TAU*i/6+PI/6;var p=Vector3(sin(a)*19,.05,cos(a)*19)
		if p.x< -18:continue
		var node=Node3D.new();node.position=p;node.rotation.y=a;g.add_child(node)
		ToonKit.box(node,Vector3(3.0,.55,1.25),INK,Vector3.UP*.275,.10)
		ToonKit.box(node,Vector3(2.7,.10,1.0),"#329e8a",Vector3.UP*.62,.08)
		ToonKit.solid(node,Vector3(3,.7,1.25),Vector3.UP*.35)
		for x in [-.85,0,.85]:ToonKit.orb(node,Vector3(.09,.07,.09),"#ecbacc",Vector3(x,.75,0))
	# One readable landmark sign sits by the front approach, clear of the route center.
	var sign=Node3D.new();sign.position=Vector3(5,.04,20.9);g.add_child(sign)
	ToonKit.box(sign,Vector3(3.6,1.35,.22),INK,Vector3.UP*.85,.05)
	ToonKit.text(sign,"东方明珠\nORIENTAL PEARL",Vector3(0,.86,.14),.0045,CREAM)
	ToonKit.solid(sign,Vector3(3.6,1.5,.28),Vector3.UP*.75)

static func _cylinder(g: Node3D,r: float,h: float,p: Vector3):
	var body=StaticBody3D.new();body.position=p;body.collision_layer=1;body.collision_mask=0
	var shape=CylinderShape3D.new();shape.radius=r;shape.height=h
	var collider=CollisionShape3D.new();collider.shape=shape;body.add_child(collider);g.add_child(body)
	return body

static func _beam_collision(g: Node3D,from: Vector3,to: Vector3,r: float):
	var body=_cylinder(g,r,from.distance_to(to),(from+to)/2)
	body.quaternion=Quaternion(Vector3.UP,(to-from).normalized())
