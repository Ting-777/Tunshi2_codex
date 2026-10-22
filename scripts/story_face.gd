class_name StoryFace
extends Node3D

# Human cast only. Facial surfaces follow the head volume, with articulated
# eyelids and authored mouth poses; the original dolphin model is untouched.
var role=""
var eyes=[]
var closed_lids=[]
var brows=[]
var mouth: MeshInstance3D
var mouth_poses=[]
var detail_groups=[]
var phase=0.0
var last_pose=-1
var head_width=.35
var jaw_ratio=.76
var skin="#efbf9c"
var mouth_width=.155

func build(character: String):
	role=character
	if role=="pange":head_width=.365;jaw_ratio=.91;skin="#e8b58d";mouth_width=.17;phase=1.7
	elif role=="xuanshen":head_width=.335;jaw_ratio=.69;skin="#f0bf98";mouth_width=.16;phase=2.9
	else:phase=.4
	var head=Node3D.new();head.name="HeadVolume";add_child(head)
	ToonKit.mesh(head,_head_mesh(),ToonKit.mat(skin))
	var features=_detail("NoseAndEars")
	for side in [-1,1]:
		ToonKit.orb(head,Vector3(.065,.102,.06),skin,Vector3(side*head_width,-.015,-.015))
		ToonKit.orb(features,Vector3(.028,.058,.015),"#cc967a",Vector3(side*(head_width+.016),-.017,.035))
	ToonKit.orb(features,Vector3(.038,.087,.035),skin,Vector3(0,.005,.285))
	ToonKit.orb(features,Vector3(.052 if role=="pange" else .043,.036,.052),skin,Vector3(0,-.055,.310))
	for side in [-1,1]:
		ToonKit.orb(features,Vector3(.027,.023,.025),skin,Vector3(side*.035,-.067,.291))
		_eye(side)
		_brow(side)
	var lips=_detail("ArticulatedMouth")
	var paint=ToonKit.mat("#ffffff").duplicate();paint.vertex_color_use_as_albedo=true;paint.vertex_color_is_srgb=true
	for pose in [[.004,1.0],[.025,.94],[.052,1.0],[.075,.91],[.037,.78]]:
		mouth_poses.append(_mouth_mesh(pose[0],pose[1]))
	mouth=ToonKit.mesh(lips,mouth_poses[0],paint);last_pose=0
	_hair(head)
	if role=="tingge":_glasses_and_headphones(head)
	return self

func _detail(label: String) -> Node3D:
	var group=Node3D.new();group.name=label;add_child(group);detail_groups.append(group);return group

func _jaw(y: float) -> float:
	return lerpf(1.0,jaw_ratio,smoothstep(-.015,-.37,y))

func _front(x: float,y: float,offset: float=0.0) -> Vector3:
	var z=.278*sqrt(maxf(.025,1.0-pow(x/(head_width*_jaw(y)),2)-pow(y/.405,2)))
	return Vector3(x,y,z+offset)

func _head_mesh() -> ArrayMesh:
	var v=PackedVector3Array();var n=PackedVector3Array();var indices=PackedInt32Array()
	var rows=28;var columns=48
	for row in range(rows+1):
		var latitude=PI*row/rows;var y=.405*cos(latitude);var width=head_width*_jaw(y)
		for column in range(columns+1):
			var longitude=TAU*column/columns
			var point=Vector3(width*sin(latitude)*sin(longitude),y,.278*sin(latitude)*cos(longitude))
			v.append(point);n.append(Vector3(point.x/(width*width),point.y/(.405*.405),point.z/(.278*.278)).normalized())
	for row in range(rows):
		for column in range(columns):
			var k=row*(columns+1)+column
			indices.append_array([k,k+1,k+columns+1,k+1,k+columns+2,k+columns+1])
	return _arrays(v,n,indices)

func _arrays(v: PackedVector3Array,n: PackedVector3Array,indices: PackedInt32Array,colors: PackedColorArray=PackedColorArray()) -> ArrayMesh:
	var arrays=[];arrays.resize(Mesh.ARRAY_MAX);arrays[Mesh.ARRAY_VERTEX]=v;arrays[Mesh.ARRAY_NORMAL]=n;arrays[Mesh.ARRAY_INDEX]=indices
	if not colors.is_empty():arrays[Mesh.ARRAY_COLOR]=colors
	var result=ArrayMesh.new();result.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES,arrays);return result

func _patch(parent: Node3D,points: PackedVector2Array,color: String,offset: float,origin: Vector3=Vector3.ZERO):
	var v=PackedVector3Array();var n=PackedVector3Array();var indices=Geometry2D.triangulate_polygon(points)
	for point in points:v.append(_front(point.x,point.y,offset)-origin);n.append(Vector3.BACK)
	for i in range(0,indices.size(),3):var swap=indices[i+1];indices[i+1]=indices[i+2];indices[i+2]=swap
	return ToonKit.mesh(parent,_arrays(v,n,indices),ToonKit.mat(color))

func _eye(side: int):
	var center=Vector3(side*.139,.078,0)
	var eye=_detail("EyeLeft" if side<0 else "EyeRight");eye.position=center;eyes.append(eye)
	var width=.105 if role!="pange" else .108
	var height=.045 if role!="pange" else .041
	for layer in range(2):
		var outline=1.12 if layer==0 else 1.0;var points=PackedVector2Array()
		for i in range(17):
			var u=i/16.0;var x=(u*2-1)*width*outline
			points.append(Vector2(center.x+x,center.y+sin(PI*u)*height*outline+side*x*.055))
		for i in range(16,-1,-1):
			var u=i/16.0;var x=(u*2-1)*width*outline
			points.append(Vector2(center.x+x,center.y-sin(PI*u)*height*.69*outline+side*x*.055))
		_patch(eye,points,"#634d43" if layer==0 else "#f9f3e6",.010+layer*.003,center)
	var iris_center=_front(center.x,center.y+.002,.020)-center
	ToonKit.orb(eye,Vector3(.031,.031,.007),"#664a35" if role=="xuanshen" else "#4b4939",iris_center)
	ToonKit.orb(eye,Vector3(.016,.022,.004),"#222c32",iris_center+Vector3(0,0,.006))
	ToonKit.orb(eye,Vector3(.008,.008,.003),"#fff8e7",iris_center+Vector3(-.008,.011,.011))
	var lid=_detail("ClosedLidLeft" if side<0 else "ClosedLidRight");closed_lids.append(lid);lid.visible=false
	var points=PackedVector2Array()
	for edge in [1,-1]:
		for i in range(17):
			var t=(i if edge==1 else 16-i)/16.0;var x=(t*2-1)*width
			points.append(Vector2(center.x+x,center.y-.010*sin(PI*t)+edge*.0035*sin(PI*t)))
	_patch(lid,points,"#73564b",.016)

func _brow(side: int):
	var origin=Vector3(side*.139,.173,0)
	var brow=_detail("BrowLeft" if side<0 else "BrowRight");brow.position=origin;brows.append(brow)
	var points=PackedVector2Array();var width=.109;var thickness=.020 if role=="pange" else .015
	for edge in [1,-1]:
		for j in range(13):
			var u=(j if edge==1 else 12-j)/12.0;var x=(u*2-1)*width
			var arch=sin(PI*u)*.020+side*x*(.12 if role=="xuanshen" else .025)
			points.append(Vector2(origin.x+x,origin.y+arch+edge*thickness*(.3+.7*sin(PI*u))))
	_patch(brow,points,"#3c3433",.013,origin)

func _mouth_mesh(opening: float,width_scale: float) -> ArrayMesh:
	var v=PackedVector3Array();var n=PackedVector3Array();var indices=PackedInt32Array();var colors=PackedColorArray()
	var width=mouth_width*width_scale
	for band in range(3):
		var base=v.size()
		for row in range(2):
			for i in range(25):
				var t=i/24.0;var x=(t*2-1)*width;var curve=sin(PI*t)
				var smile=.019*pow(t*2-1,2);var upper=-.16+smile+sin(PI*t*2)*sin(PI*t*2)*.003
				var lower=upper-opening*curve
				var y=upper if row==0 else lower
				var color="#6d433d"
				if band==1:
					y=upper-.004 if row==0 else maxf(lower+.005,upper-minf(opening*.40,.021)*curve-.004)
					color="#fff2db"
				elif band==2:
					y=lower-.004 if row==0 else lower-.013*curve-.004;color="#bd806b"
				v.append(_front(x,y,.014 if band==0 else .017));n.append(Vector3.BACK);colors.append(Color(color))
		for i in range(24):
			var k=base+i;indices.append_array([k,k+1,k+25,k+1,k+26,k+25])
	# Closed lips have no exposed teeth.
	if opening<.01:
		for i in range(50,100):colors[i]=Color("#6d433d")
	return _arrays(v,n,indices,colors)

func _hair(head: Node3D):
	var v=PackedVector3Array();var n=PackedVector3Array();var indices=PackedInt32Array()
	for row in range(13):
		for column in range(41):
			var angle=TAU*column/40.0;var cut=.17+.10*cos(angle)
			var latitude=acos(cut/.445)*row/12.0
			var point=Vector3((head_width+.012)*sin(latitude)*sin(angle),.445*cos(latitude),.29*sin(latitude)*cos(angle)-.018)
			v.append(point);n.append(Vector3(point.x/(head_width*head_width),point.y/(.445*.445),(point.z+.018)/(.29*.29)).normalized())
	for row in range(12):
		for column in range(40):
			var k=row*41+column;indices.append_array([k,k+1,k+41,k+1,k+42,k+41])
	ToonKit.mesh(head,_arrays(v,n,indices),ToonKit.mat("#252e39"))
	var fringe_group=_detail("HairSweep")
	if role=="pange":
		var fringe=ToonKit.orb(fringe_group,Vector3(.24,.085,.11),"#252e39",Vector3(-.075,.28,.205));fringe.rotation.z=.18
	elif role=="xuanshen":
		for i in range(5):
			var spike=ToonKit.cyl(head,.10,.29+(2-abs(i-2))*.055,"#252e39",Vector3((i-2)*.113,.44,-.025),0,7);spike.rotation.z=(2-i)*.18
	else:
		ToonKit.orb(fringe_group,Vector3(.22,.067,.10),"#252e39",Vector3(.08,.29,.20))

func _glasses_and_headphones(head: Node3D):
	var frames=_detail("Glasses")
	for side in [-1,1]:
		var points=[]
		for corner in range(4):
			var cx=.081 if corner in [0,3] else -.081
			var cy=.041 if corner<2 else -.041
			for j in range(5):
				var angle=(corner*PI/2)+j*PI/8
				points.append(_front(side*.139+cx+.035*cos(angle),.079+cy+.026*sin(angle),.040))
		for i in range(points.size()):ToonKit.rod(frames,points[i],points[(i+1)%points.size()],.009,"#343b42")
		ToonKit.rod(frames,_front(side*.252,.10,.034),Vector3(side*.345,.10,-.025),.009,"#343b42")
		ToonKit.orb(head,Vector3(.065,.145,.125),"#38414b",Vector3(side*.355,.068,-.016))
		ToonKit.orb(head,Vector3(.065,.147,.128),"#efc746",Vector3(side*.398,.068,-.016))
		ToonKit.orb(head,Vector3(.013,.090,.078),"#d7a93b",Vector3(side*.455,.068,-.016))
	ToonKit.rod(frames,_front(-.025,.105,.045),_front(.025,.105,.045),.008,"#343b42")
	var v=PackedVector3Array();var n=PackedVector3Array();var indices=PackedInt32Array()
	for i in range(33):
		var angle=PI*i/32;var radial=Vector3(cos(angle),sin(angle),0)
		var center=Vector3(.39*cos(angle),.10+.39*sin(angle),-.045)
		for j in range(13):
			var normal=radial*cos(TAU*j/12)+Vector3.BACK*sin(TAU*j/12)
			v.append(center+normal*.025);n.append(normal)
	for i in range(32):
		for j in range(12):
			var k=i*13+j;indices.append_array([k,k+1,k+13,k+1,k+14,k+13])
	ToonKit.mesh(head,_arrays(v,n,indices),ToonKit.mat("#efc746"))

func refine_outlines():
	# Small facial forms must not inherit the body's centimetre-thick outline.
	for group in detail_groups:
		for mesh in group.find_children("*","MeshInstance3D",true,false):
			mesh.material_override.next_pass=null
			mesh.cast_shadow=GeometryInstance3D.SHADOW_CASTING_SETTING_OFF

func animate(dt: float,speaking: bool,happy: bool=false):
	phase+=dt
	var blink=fmod(phase,4.7)
	var eyelid=clampf(absf(blink-4.57)/.105,.045,1.0) if blink>4.46 else 1.0
	for i in range(eyes.size()):
		eyes[i].scale.y=eyelid;eyes[i].visible=eyelid>.15;closed_lids[i].visible=eyelid<=.15
	for i in range(brows.size()):brows[i].position.y=.173+(sin(phase*3.1)*.006 if speaking else .008 if happy else 0.0)
	var pose=0
	if speaking:pose=1+int(floor(phase*8.5))%4
	if pose!=last_pose:mouth.mesh=mouth_poses[pose];last_pose=pose
