class_name ToonKit
extends RefCounted

static var materials={}
static var geometries={}
static var font_cache: Font

static func font() -> Font:
	if not font_cache:font_cache=load("res://assets/fonts/Chinese.otf")
	return font_cache

static func mat(color: String, shine: bool=false) -> StandardMaterial3D:
	var key=color+str(shine)
	if materials.has(key):return materials[key]
	var m=StandardMaterial3D.new()
	m.albedo_color=Color(color)
	m.diffuse_mode=BaseMaterial3D.DIFFUSE_TOON
	m.specular_mode=BaseMaterial3D.SPECULAR_TOON if shine else BaseMaterial3D.SPECULAR_DISABLED
	m.roughness=.25
	materials[key]=m
	return m

static func mesh(parent: Node3D, shape: Mesh, material: Material, p: Vector3=Vector3.ZERO) -> MeshInstance3D:
	var n=MeshInstance3D.new();n.mesh=shape;n.material_override=material;n.position=p;parent.add_child(n)
	return n

static func rounded(size: Vector3,r: float=.08) -> ArrayMesh:
	var key=str(size)+str(r)
	if geometries.has(key):return geometries[key]
	r=minf(r,minf(size.x,minf(size.y,size.z))*.45)
	var vs=PackedVector3Array();var ns=PackedVector3Array();var ix=PackedInt32Array()
	var faces=[[Vector3.RIGHT,Vector3.BACK,Vector3.UP],[Vector3.LEFT,Vector3.FORWARD,Vector3.UP],[Vector3.UP,Vector3.RIGHT,Vector3.BACK],[Vector3.DOWN,Vector3.RIGHT,Vector3.FORWARD],[Vector3.BACK,Vector3.LEFT,Vector3.UP],[Vector3.FORWARD,Vector3.RIGHT,Vector3.UP]]
	for f in faces:
		var base=vs.size();var us=absf(f[1].dot(size));var ds=absf(f[2].dot(size))
		var u=[-us/2,-us/2+r*.25,-us/2+r,0,us/2-r,us/2-r*.25,us/2]
		var v=[-ds/2,-ds/2+r*.25,-ds/2+r,0,ds/2-r,ds/2-r*.25,ds/2]
		for j in range(7):
			for i in range(7):
				var p=f[0]*size*.5+f[1]*u[i]+f[2]*v[j]
				var c=Vector3(clampf(p.x,-size.x/2+r,size.x/2-r),clampf(p.y,-size.y/2+r,size.y/2-r),clampf(p.z,-size.z/2+r,size.z/2-r))
				var n=(p-c).normalized();vs.append(c+n*r);ns.append(n)
		for j in range(6):
			for i in range(6):
				var k=base+j*7+i;ix.append_array([k,k+1,k+7,k+1,k+8,k+7])
	var arrays=[];arrays.resize(Mesh.ARRAY_MAX);arrays[Mesh.ARRAY_VERTEX]=vs;arrays[Mesh.ARRAY_NORMAL]=ns;arrays[Mesh.ARRAY_INDEX]=ix
	var out=ArrayMesh.new();out.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES,arrays);geometries[key]=out
	return out

static func box(parent: Node3D,size: Vector3,color: String,p: Vector3=Vector3.ZERO,r: float=.08):
	return mesh(parent,rounded(size,r),mat(color),p)

static func orb(parent: Node3D,size: Vector3,color: String,p: Vector3=Vector3.ZERO):
	var s=SphereMesh.new();s.radius=1;s.height=2;s.radial_segments=20;s.rings=12
	var n=mesh(parent,s,mat(color),p);n.scale=size;return n

static func cyl(parent: Node3D,r: float,h: float,color: String,p: Vector3=Vector3.ZERO,top: float=-1,segments: int=20):
	var s=CylinderMesh.new();s.bottom_radius=r;s.top_radius=r if top<0 else top;s.height=h;s.radial_segments=segments
	return mesh(parent,s,mat(color),p)

static func rod(parent: Node3D,a: Vector3,b: Vector3,r: float,color: String):
	var n=cyl(parent,r,a.distance_to(b),color,(a+b)*.5);n.quaternion=Quaternion(Vector3.UP,(b-a).normalized());return n

static func solid(parent: Node3D,size: Vector3,p: Vector3) -> StaticBody3D:
	var n=StaticBody3D.new();n.position=p;n.collision_layer=1;n.collision_mask=0
	var c=CollisionShape3D.new();var s=BoxShape3D.new();s.size=size;c.shape=s;n.add_child(c);parent.add_child(n);return n

static func text(parent: Node3D,value: String,p: Vector3,pixel: float=.01,color: String="#fff0ca"):
	var n=Label3D.new();n.text=value;n.position=p;n.font=font();n.font_size=64;n.pixel_size=pixel;n.modulate=Color(color);n.outline_size=0;parent.add_child(n);return n

static func ring(parent: Node3D,r: float,w: float,h: float,color: String,p: Vector3):
	var st=SurfaceTool.new();st.begin(Mesh.PRIMITIVE_TRIANGLES)
	for i in range(96):
		var a=i*TAU/96;var b=(i+1)*TAU/96
		for y in [0.0,h]:
			var v=[Vector3(sin(a)*(r-w/2),y,cos(a)*(r-w/2)),Vector3(sin(b)*(r-w/2),y,cos(b)*(r-w/2)),Vector3(sin(a)*(r+w/2),y,cos(a)*(r+w/2)),Vector3(sin(b)*(r+w/2),y,cos(b)*(r+w/2))]
			for j in ([0,1,2,2,1,3] if y>0 else [0,2,1,2,3,1]):st.add_vertex(v[j])
		for radius in [r-w/2,r+w/2]:
			var v=[Vector3(sin(a)*radius,0,cos(a)*radius),Vector3(sin(b)*radius,0,cos(b)*radius),Vector3(sin(a)*radius,h,cos(a)*radius),Vector3(sin(b)*radius,h,cos(b)*radius)]
			for j in ([0,2,1,2,3,1] if radius>r else [0,1,2,2,1,3]):st.add_vertex(v[j])
	st.generate_normals();var material=mat(color).duplicate();material.cull_mode=BaseMaterial3D.CULL_DISABLED
	return mesh(parent,st.commit(),material,p)

static func merge_direct(root: Node3D):
	var vs=PackedVector3Array();var ns=PackedVector3Array();var cs=PackedColorArray();var ix=PackedInt32Array();var old=[]
	for n in root.get_children():
		if not n is MeshInstance3D or not n.material_override is StandardMaterial3D:continue
		var a=n.mesh.surface_get_arrays(0);var base=vs.size();var normal=n.basis.inverse().transposed()
		for i in range(a[Mesh.ARRAY_VERTEX].size()):
			vs.append(n.transform*a[Mesh.ARRAY_VERTEX][i]);ns.append((normal*a[Mesh.ARRAY_NORMAL][i]).normalized());cs.append(n.material_override.albedo_color)
		if a[Mesh.ARRAY_INDEX]!=null and a[Mesh.ARRAY_INDEX].size()>0:
			for k in a[Mesh.ARRAY_INDEX]:ix.append(base+k)
		else:
			for k in range(a[Mesh.ARRAY_VERTEX].size()):ix.append(base+k)
		old.append(n)
	if old.size()<2:return
	var a=[];a.resize(Mesh.ARRAY_MAX);a[Mesh.ARRAY_VERTEX]=vs;a[Mesh.ARRAY_NORMAL]=ns;a[Mesh.ARRAY_COLOR]=cs;a[Mesh.ARRAY_INDEX]=ix
	var out=ArrayMesh.new();out.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES,a)
	var m=mat("#ffffff").duplicate();m.vertex_color_use_as_albedo=true;m.vertex_color_is_srgb=true
	mesh(root,out,m)
	for n in old:root.remove_child(n);n.queue_free()

static func outline(root: Node3D):
	for n in root.find_children("*","MeshInstance3D",true,false):
		var m=n.material_override.duplicate();var edge=ShaderMaterial.new();edge.shader=load("res://shaders/outline.gdshader");m.next_pass=edge;n.material_override=m

# Convert AFTER vertex-color merging. Build-time standard materials stay available
# for geometry tools; all opaque meshes share the same authored cel lighting.
static var cel_cache={}
static func finish(root: Node3D,actor: bool=false):
	for n in root.find_children("*","MeshInstance3D",true,false):
		var src=n.material_override
		if not src is StandardMaterial3D or src.transparency!=BaseMaterial3D.TRANSPARENCY_DISABLED:continue
		var key=str(src.get_instance_id())+str(actor)
		if not cel_cache.has(key):
			var m=ShaderMaterial.new()
			m.shader=load("res://shaders/urban-cel-double.gdshader" if src.cull_mode==BaseMaterial3D.CULL_DISABLED else "res://shaders/urban-cel.gdshader")
			m.set_shader_parameter("tint",src.albedo_color)
			m.set_shader_parameter("vertex_paint",src.vertex_color_use_as_albedo)
			m.set_shader_parameter("rim_strength",.045 if actor else 0.0)
			m.next_pass=src.next_pass
			cel_cache[key]=m
		n.material_override=cel_cache[key]

static func polygon(parent: Node3D,points: PackedVector2Array,color: String,p: Vector3=Vector3.ZERO):
	var st=SurfaceTool.new();st.begin(Mesh.PRIMITIVE_TRIANGLES)
	var ids=Geometry2D.triangulate_polygon(points)
	for i in range(0,ids.size(),3):
		for j in [0,2,1]:st.set_normal(Vector3.BACK);st.add_vertex(Vector3(points[ids[i+j]].x,points[ids[i+j]].y,0))
	var material=mat(color).duplicate();material.cull_mode=BaseMaterial3D.CULL_DISABLED
	return mesh(parent,st.commit(),material,p)

static func disk(parent: Node3D,radius: float,color: String,p: Vector3):
	var n=cyl(parent,radius,.035,color,p,-1,48);n.rotation.x=PI/2;return n
