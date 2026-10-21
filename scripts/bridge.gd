class_name CityBridge
extends RefCounted

const CENTER=Vector3(0,0,-10)
const DECK=5.64
const INK="#466c76"
const GLASS="#8db7bf"

static func build(city: Node3D):
	var root=Node3D.new();root.name="CircularFootbridge";root.position=CENTER;city.add_child(root)
	# A single collision surface comes from exactly the visible annular slab.
	var deck=ToonKit.ring(root,27,5.6,.24,"#fbedd5",Vector3.UP*(DECK-.24))
	_mesh_collision(root,deck.mesh,deck.transform)
	_arc_guard(root,24.3,0,TAU)
	var opening=asin(2.48/29.7)
	for i in range(4):_arc_guard(root,29.7,TAU*i/4+opening,TAU*(i+1)/4-opening)
	for i in range(8):
		var a=TAU*(i+.5)/8;var p=Vector3(sin(a)*27,(DECK-.24)/2,cos(a)*27)
		ToonKit.cyl(root,.43,DECK-.24,"#d2c9ad",p,-1,20)
		var body=StaticBody3D.new();body.position=p;body.collision_layer=1;body.collision_mask=0;root.add_child(body)
		var shape=CylinderShape3D.new();shape.radius=.43;shape.height=DECK-.24;var col=CollisionShape3D.new();col.shape=shape;body.add_child(col)
	# Each approach turns into an open plaza rather than ending inside a shop/IFC.
	
	for i in range(4):
		var a=TAU*i/4;var radial=Vector3(sin(a),0,cos(a));var tangent=Vector3(cos(a),0,-sin(a))
		var center=radial*32.5+Vector3.UP*DECK
		_slab(root,center-tangent*2.6,center+tangent*2.6,7.0,.24,"#fbedd5")
		# Outer edge and the side away from the ramp, with a genuine opening to the ring.
		_guard(root,center-tangent*2.6+radial*3.5,center+tangent*2.6+radial*3.5)
		_guard(root,center+tangent*2.6-radial*3.5,center+tangent*2.6+radial*3.5)
		var top=center-tangent*2.6;var foot=radial*32.5-tangent*29
		_slab(root,foot,top,3.6,.22,"#efe3d8")
		var lateral=Vector3(top.z-foot.z,0,foot.x-top.x).normalized()*1.72
		for side in [-1,1]:_guard(root,foot.lerp(top,.035)+lateral*side,top+lateral*side)
		city.bridge_routes.append({"foot":foot+CENTER,"top":top+CENTER,"landing":center+CENTER,"portal":radial*27+CENTER+Vector3.UP*DECK})
	# Ground-level rotary shares the same continuous driving grade as every road.
	ToonKit.cyl(root,34,.014,"#35455f",Vector3.UP*.007,-1,96)
	ToonKit.cyl(root,16,.025,"#3fa28b",Vector3.UP*.026,-1,64)
	for i in range(12):
		var a=TAU*i/12;city.flower(CENTER+Vector3(sin(a)*10,.05,cos(a)*10))

static func _slab(root: Node3D,a: Vector3,b: Vector3,width: float,thickness: float,color: String):
	var side=Vector3(b.z-a.z,0,a.x-b.x).normalized()*width/2
	var vertices=PackedVector3Array([a-side,a+side,b-side,b+side,a-side-Vector3.UP*thickness,a+side-Vector3.UP*thickness,b-side-Vector3.UP*thickness,b+side-Vector3.UP*thickness])
	_polyhedron(root,vertices,color)
	var body=StaticBody3D.new();body.collision_layer=1;body.collision_mask=0;root.add_child(body)
	var shape=ConvexPolygonShape3D.new();shape.points=vertices;var c=CollisionShape3D.new();c.shape=shape;body.add_child(c)

static func _polyhedron(root: Node3D,v: PackedVector3Array,color: String):
	var st=SurfaceTool.new();st.begin(Mesh.PRIMITIVE_TRIANGLES)
	for tri in [[0,2,1],[1,2,3],[4,5,6],[5,7,6],[0,1,4],[1,5,4],[2,6,3],[3,6,7],[0,4,2],[2,4,6],[1,3,5],[3,7,5]]:
		for i in tri:st.add_vertex(v[i])
	st.generate_normals();var m=ToonKit.mat(color).duplicate();m.cull_mode=BaseMaterial3D.CULL_DISABLED;ToonKit.mesh(root,st.commit(),m)

static func _guard(root: Node3D,a: Vector3,b: Vector3):
	# Broad infill and a single functional handrail, without ornamental line layers.
	var normal=Vector3(b.z-a.z,0,a.x-b.x).normalized()*.055
	var v=PackedVector3Array([a-normal+Vector3.UP*.12,a+normal+Vector3.UP*.12,b-normal+Vector3.UP*.12,b+normal+Vector3.UP*.12,a-normal+Vector3.UP*1.08,a+normal+Vector3.UP*1.08,b-normal+Vector3.UP*1.08,b+normal+Vector3.UP*1.08])
	_polyhedron(root,v,GLASS)
	var body=StaticBody3D.new();body.collision_layer=1;body.collision_mask=0;root.add_child(body)
	var shape=ConvexPolygonShape3D.new();shape.points=v;var col=CollisionShape3D.new();col.shape=shape;body.add_child(col)
	ToonKit.rod(root,a+Vector3.UP*1.12,b+Vector3.UP*1.12,.075,INK)
	for p in [a,b]:ToonKit.cyl(root,.065,1.12,INK,p+Vector3.UP*.56,-1,10)

static func _arc_guard(root: Node3D,r: float,start: float,end: float):
	var count=ceili((end-start)*r/2.8)
	for i in range(count):
		var a=lerpf(start,end,float(i)/count);var b=lerpf(start,end,float(i+1)/count)
		_guard(root,Vector3(sin(a)*r,DECK,cos(a)*r),Vector3(sin(b)*r,DECK,cos(b)*r))

static func _mesh_collision(root: Node3D,mesh: Mesh,transform: Transform3D):
	var body=StaticBody3D.new();body.transform=transform;body.collision_layer=1;body.collision_mask=0;root.add_child(body)
	var shape=mesh.create_trimesh_shape();shape.backface_collision=true;var col=CollisionShape3D.new();col.shape=shape;body.add_child(col)
