class_name UrbanFrontage
extends RefCounted

const INK="#25334f"
const CREAM="#fff0d2"
const CORAL="#ff684c"
const TEAL="#078d9b"
const GLASS="#244866"

static func build(city: Node3D):
	_coffee(city);_market(city);_vinyl(city)
	# Fill the narrow gaps with deliberate side streets instead of exposed voids.
	for x in [-61,-45]:
		ToonKit.box(city,Vector3(1.8,.025,15),"#8099af",Vector3(x,.075,3),.004)
		for z in [0,4,8]:ToonKit.box(city,Vector3(.65,.018,.2),CREAM,Vector3(x,.1,z),.001)

static func _base(city: Node3D,x: float,h: float,color: String) -> Node3D:
	var g=Node3D.new();g.position=Vector3(x,0,3);city.add_child(g)
	ToonKit.box(g,Vector3(14,h-3.4,17),color,Vector3(0,(h+3.4)/2,0),.12)
	ToonKit.box(g,Vector3(14,3.4,15.1),INK,Vector3(0,1.7,-.95),.06)
	ToonKit.solid(g,Vector3(14,h,17),Vector3(0,h/2,0));city.blocks.append(Rect2(Vector2(x-7,-5.5),Vector2(14,17)))
	for side in [-1,1]:ToonKit.box(g,Vector3(.45,3.5,1.9),color,Vector3(side*6.8,1.75,7.55),.035)
	ToonKit.box(g,Vector3(14.3,.22,17.3),INK,Vector3(0,h-.04,0),.04)
	ToonKit.box(g,Vector3(14.6,.38,17.6),CREAM,Vector3(0,h+.17,0),.06)
	ToonKit.box(g,Vector3(14.1,.5,17.1),color,Vector3(0,h+.57,0),.04)
	ToonKit.box(g,Vector3(13.1,.1,16),"#5e718b",Vector3(0,h+.85,0),.03)
	return g

static func _arch(parent: Node3D,p: Vector3,w: float,h: float):
	var points=PackedVector2Array([Vector2(-w/2,-h/2),Vector2(w/2,-h/2)])
	for i in range(17):
		var a=PI*i/16;points.append(Vector2(cos(a)*w/2,h/2-w/2+sin(a)*w/2))
	ToonKit.polygon(parent,points,INK,p)
	var inner=points.duplicate()
	for i in range(inner.size()):inner[i]*=.89
	ToonKit.polygon(parent,inner,GLASS,p+Vector3(0,0,.025))
	ToonKit.box(parent,Vector3(.13,h-.24,.08),CREAM,p+Vector3(0,-.02,.08),.004)
	ToonKit.box(parent,Vector3(w+.2,.18,.52),CREAM,p+Vector3(0,-h/2-.13,.1),.025)
	# A crisp diagonal reflection, not a white rectangular grid.
	ToonKit.polygon(parent,PackedVector2Array([Vector2(-w*.42,-h*.3),Vector2(-w*.28,-h*.3),Vector2(w*.2,h*.2),Vector2(w*.03,h*.2)]),"#679eb2",p+Vector3(0,0,.04))

static func _window(parent: Node3D,p: Vector3,w: float,h: float,frame: String=CREAM):
	ToonKit.box(parent,Vector3(w+.22,h+.22,.18),INK,p,.025)
	ToonKit.box(parent,Vector3(w,h,.20),GLASS,p+Vector3(0,0,.02),.02)
	ToonKit.box(parent,Vector3(.13,h,.24),frame,p+Vector3(0,0,.04),.005)
	ToonKit.box(parent,Vector3(w+.42,.12,.48),frame,p+Vector3(0,-h/2-.13,.1),.025)
	ToonKit.polygon(parent,PackedVector2Array([Vector2(-w*.4,-h*.36),Vector2(-w*.24,-h*.36),Vector2(w*.4,h*.4),Vector2(w*.18,h*.4)]),"#56849f",p+Vector3(0,0,.14))

static func _glazing(g: Node3D,frame: String):
	for x in [-6.2,-3.1,0,3.1,6.2]:ToonKit.box(g,Vector3(.11,2.9,.2),frame,Vector3(x,1.65,8.65),.015)
	for y in [.24,3.08]:ToonKit.box(g,Vector3(12.5,.13,.22),frame,Vector3(0,y,8.65),.015)
	var mat=StandardMaterial3D.new();mat.albedo_color=Color(.48,.76,.95,.10);mat.transparency=BaseMaterial3D.TRANSPARENCY_ALPHA;mat.roughness=1
	ToonKit.mesh(g,ToonKit.rounded(Vector3(12.3,2.7,.02),.002),mat,Vector3(0,1.65,8.59))

static func _awning(g: Node3D,color: String):
	for i in range(18):
		var color_i=color if i%2==0 else CREAM
		var n=ToonKit.box(g,Vector3(.72,.07,2.15),color_i,Vector3(-6.12+i*.72,3.1,9.25),.01);n.rotation.x=.17
		ToonKit.box(g,Vector3(.72,.27,.06),color_i,Vector3(-6.12+i*.72,2.81,10.31),.015)
	for side in [-1,1]:ToonKit.rod(g,Vector3(side*6.5,2.45,8.48),Vector3(side*6.5,2.79,10.2),.045,INK)

static func _coffee(city: Node3D):
	var g=_base(city,-69,9.6,"#f6bc87")
	# Brick reveals, broad cornice and arched window bays give this shop its own silhouette.
	for x in [-6.7,6.7]:
		ToonKit.box(g,Vector3(.7,6.2,.5),"#df785b",Vector3(x,6.5,8.52),.04)
		for y in range(4,10):ToonKit.box(g,Vector3(.82,.12,.56),CREAM,Vector3(x,y,8.55),.01)
	for x in [-4.2,0,4.2]:_arch(g,Vector3(x,6.9,8.58),3.15,3.1)
	ToonKit.box(g,Vector3(14.5,.3,.9),INK,Vector3(0,4.8,8.6),.03)
	ToonKit.box(g,Vector3(13.7,1.25,.52),CREAM,Vector3(0,4.02,8.74),.05)
	ToonKit.text(g,"D O L P H I N",Vector3(-.8,4.1,9.035),.013,INK)
	ToonKit.text(g,"豚港咖啡   ·   自家烘焙",Vector3(-.7,3.62,9.035),.0048,INK)
	ToonKit.disk(g,.43,CORAL,Vector3(5.15,4.04,9.05));ToonKit.text(g,"D",Vector3(5.15,4.04,9.09),.010,CREAM)
	_awning(g,TEAL);_glazing(g,CREAM)
	ToonKit.box(g,Vector3(8.8,.95,.7),"#c76a4c",Vector3(-1.1,.78,7.65),.04)
	ToonKit.box(g,Vector3(9.2,.12,.92),CREAM,Vector3(-1.1,1.31,7.65),.02)
	for y in [1.6,2.27]:
		ToonKit.box(g,Vector3(8.6,.08,.42),"#c89164",Vector3(-1.1,y,6.85),.01)
		for j in range(7):ToonKit.cyl(g,.13,.24,CREAM if j%2==0 else CORAL,Vector3(-4.7+j*1.15,y+.17,6.9),.09,12)
	ToonKit.box(g,Vector3(1.45,.65,.6),"#416280",Vector3(-1.2,1.7,7.6),.06)
	for x in [-1.6,-.9]:ToonKit.cyl(g,.06,.16,CREAM,Vector3(x,1.45,8),.04,12)
	_door(g,4.65,CREAM)
	# Round hanging shop sign, a real object with thickness and support.
	ToonKit.rod(g,Vector3(-6.8,4.6,8.8),Vector3(-6.8,4.6,11.2),.07,INK)
	ToonKit.disk(g,.84,INK,Vector3(-6.8,3.9,11.1));ToonKit.disk(g,.73,CREAM,Vector3(-6.8,3.9,11.14))
	ToonKit.text(g,"豚\n港",Vector3(-6.8,3.91,11.19),.008,INK)
	for x in [-74.7,-68.4]:_table(city,Vector3(x,.15,16.3))
	_poster(g,Vector3(-4.5,2.16,8.75),"TODAY","慢点喝。",CORAL)
	# Roof plant room and air-conditioning are placed, rather than an empty box top.
	ToonKit.box(g,Vector3(4,2.2,4),"#e18563",Vector3(3,11.5,-3),.08)
	for x in [-3,0]:_ac(g,Vector3(x,10.2,-2))

static func _market(city: Node3D):
	var g=_base(city,-53,11.5,"#77d7bd")
	ToonKit.box(g,Vector3(6.8,3.2,7),"#e1f4d6",Vector3(-3,13.3,-2.5),.12)
	ToonKit.box(g,Vector3(7.2,.22,7.3),INK,Vector3(-3,15,-2.5),.03)
	for x in [-4.2,0]:
		for y in [6.4,9.5]:_window(g,Vector3(x,y,8.6),2.7,2.15,"#c8f2d2")
	ToonKit.box(g,Vector3(2.85,6.6,.6),"#1f7d85",Vector3(4.55,8,8.6),.06)
	for y in [5.4,6.5,7.6,8.7,9.8]:
		ToonKit.box(g,Vector3(2.1,.65,.1),"#4aafb0",Vector3(4.55,y,8.96),.03)
	ToonKit.box(g,Vector3(14.2,1.15,1.0),CREAM,Vector3(0,3.74,8.75),.04)
	for y in [3.34,4.14]:ToonKit.box(g,Vector3(14.3,.13,1.05),CORAL,Vector3(0,y,8.76),.015)
	ToonKit.text(g,"陆家嘴便利",Vector3(-.5,3.78,9.29),.012,TEAL)
	ToonKit.text(g,"24h",Vector3(5.4,3.78,9.3),.008,CORAL)
	ToonKit.box(g,Vector3(1.8,5.8,.55),INK,Vector3(7.12,6.45,9.05),.07)
	ToonKit.box(g,Vector3(1.55,5.55,.14),CORAL,Vector3(7.12,6.45,9.4),.03)
	ToonKit.text(g,"便\n利\n商\n店",Vector3(7.12,6.45,9.49),.014,CREAM)
	_glazing(g,"#e4f6d9");_door(g,4.65,TEAL)
	for y in [.6,1.35,2.1]:
		ToonKit.box(g,Vector3(9.4,.1,.75),"#f0d2a1",Vector3(-1.3,y,7.6),.01)
		for j in range(15):
			var col=[CORAL,"#ffd54f","#71d4be","#678dc5"][j%4]
			ToonKit.box(g,Vector3(.37,.43,.35),col,Vector3(-5.6+j*.61,y+.27,7.65),.035)
			ToonKit.box(g,Vector3(.32,.065,.38),CREAM,Vector3(-5.6+j*.61,y+.33,7.66),.005)
	# Vending cabinet at the alley mouth, clear of the pedestrian through-route.
	var v=Node3D.new();v.position=Vector3(7.75,.12,10.3);g.add_child(v)
	ToonKit.box(v,Vector3(.96,1.9,.7),CORAL,Vector3.UP*.95,.08);ToonKit.box(v,Vector3(.73,1.1,.03),INK,Vector3(0,1.15,.365),.015)
	for x in [-.21,0,.21]:
		for y in [.85,1.17,1.49]:ToonKit.cyl(v,.052,.20,"#ffde64",Vector3(x,y,.39),.045,10)
	ToonKit.box(v,Vector3(.65,.16,.04),INK,Vector3(0,.3,.38),.015)
	ToonKit.text(v,"冰汽水",Vector3(0,1.8,.4),.0024,CREAM)
	ToonKit.solid(v,Vector3(.95,1.9,.7),Vector3.UP*.95)
	_poster(g,Vector3(-4.8,2.1,8.76),"OPEN","一直开着。",TEAL)
	# Weathered service pipes and AC units deliberately break the clean mass.
	for x in [-6.3,6.35]:ToonKit.cyl(g,.045,7.1,INK,Vector3(x,7,8.64),-1,8)
	_ac(g,Vector3(-2.8,11.9,4));_ac(g,Vector3(1.2,11.9,4))

static func _vinyl(city: Node3D):
	var g=_base(city,-37,10.0,"#bcb4ed")
	# Sloped, stepped crown + asymmetric huge record mural.
	ToonKit.polygon(g,PackedVector2Array([Vector2(-7,0),Vector2(7,0),Vector2(7,1.0),Vector2(-7,2.6)]),INK,Vector3(0,10.3,8.55))
	ToonKit.polygon(g,PackedVector2Array([Vector2(-6.8,.18),Vector2(6.8,.18),Vector2(6.8,.85),Vector2(-6.8,2.4)]),"#f3d45e",Vector3(0,10.3,8.58))
	ToonKit.box(g,Vector3(14,1.25,.65),INK,Vector3(0,3.8,8.8),.05)
	ToonKit.text(g,"沿 江 唱 片",Vector3(-1.4,3.86,9.16),.012,CREAM)
	ToonKit.text(g,"VINYL",Vector3(4.5,3.86,9.16),.007,"#facd4f")
	# Graphic mural: monumental circles, cut diagonal and deliberate color hierarchy.
	ToonKit.disk(g,2.3,CORAL,Vector3(2.95,7.18,8.6));ToonKit.disk(g,1.85,INK,Vector3(2.95,7.18,8.66))
	for r in [1.48,1.2,.91]:
		var ring=ToonKit.ring(g,r,.025,.02,"#597189",Vector3(2.95,7.18,8.7));ring.rotation.x=PI/2
	ToonKit.disk(g,.53,"#ffda4f",Vector3(2.95,7.18,8.75));ToonKit.disk(g,.10,INK,Vector3(2.95,7.18,8.8))
	ToonKit.text(g,"SIDE\nA",Vector3(-3.1,7.3,8.68),.024,INK)
	ToonKit.text(g,"给城市换个节拍。",Vector3(-3.0,5.2,8.7),.0045,INK)
	for i in range(4):
		var stripe=ToonKit.box(g,Vector3(.12,3.1,.08),CREAM,Vector3(-6.6+i*.42,6.75,8.7),.005);stripe.rotation.z=-.42
	_glazing(g,"#b8caed");_door(g,4.65,"#b8caed")
	for j in range(6):
		var x=-5.2+j*1.48;var color_j=["#fa835a","#edd266","#67cdbb"][j%3]
		ToonKit.box(g,Vector3(1.14,1.14,.08),color_j,Vector3(x,1.93,7.95),.015)
		ToonKit.disk(g,.43,INK,Vector3(x,1.93,8.01));ToonKit.disk(g,.13,color_j,Vector3(x,1.93,8.05))
	ToonKit.box(g,Vector3(9.7,.9,.8),"#6e637f",Vector3(-1.2,.8,7.95),.03)
	for x in [-4.7,-3,-1.3,.4,2.1]:
		ToonKit.box(g,Vector3(1.4,.6,.5),"#fae4c0",Vector3(x,1.4,7.95),.02)
		for j in range(5):ToonKit.box(g,Vector3(.055,.48,.48),INK,Vector3(x-.45+j*.19,1.55,7.98),.005)
	ToonKit.box(g,Vector3(1.4,4.5,.5),TEAL,Vector3(7.1,6.0,9.2),.06)
	ToonKit.text(g,"唱\n片",Vector3(7.1,6.1,9.5),.017,CREAM)
	# Large side-wall painting is visible when approaching from the ring bridge.
	var side=Node3D.new();side.position=Vector3(7.08,0,0);side.rotation.y=PI/2;g.add_child(side)
	ToonKit.box(side,Vector3(12,5.5,.03),INK,Vector3(0,6.8,0),.02)
	ToonKit.disk(side,2.2,"#f4ca51",Vector3(2.3,6.8,.03));ToonKit.disk(side,1.8,CORAL,Vector3(2.3,6.8,.07))
	ToonKit.text(side,"SHANGHAI\nON REPEAT",Vector3(-2.3,6.8,.1),.011,CREAM)
	_ac(g,Vector3(-3,10.5,-1))

static func _door(g: Node3D,x: float,color: String):
	ToonKit.box(g,Vector3(1.6,2.65,.20),color,Vector3(x,1.5,8.77),.035)
	ToonKit.box(g,Vector3(1.32,2.35,.05),GLASS,Vector3(x,1.52,8.91),.02)
	ToonKit.box(g,Vector3(.05,.62,.10),CREAM,Vector3(x-.47,1.48,8.98),.01)
	ToonKit.box(g,Vector3(1.65,.10,.7),"#607995",Vector3(x,.15,8.85),.02)

static func _poster(g: Node3D,p: Vector3,large: String,small: String,color: String):
	ToonKit.box(g,Vector3(1.6,1.95,.035),CREAM,p,.015)
	ToonKit.box(g,Vector3(1.42,1.2,.025),color,p+Vector3(0,.18,.03),.005)
	ToonKit.disk(g,.37,"#f9cc4a",p+Vector3(0,.2,.06))
	ToonKit.text(g,large,p+Vector3(0,-.35,.075),.0039,INK)
	ToonKit.text(g,small,p+Vector3(0,-.72,.075),.0026,INK)

static func _ac(g: Node3D,p: Vector3):
	ToonKit.box(g,Vector3(1.8,.85,.75),"#d6e0e5",p,.05)
	for i in range(6):ToonKit.box(g,Vector3(1.45,.035,.04),"#648099",p+Vector3(0,-.26+i*.1,.4),.005)

static func _table(city: Node3D,p: Vector3):
	var g=Node3D.new();g.position=p;city.add_child(g)
	ToonKit.cyl(g,.70,.09,CREAM,Vector3.UP*.76,-1,32);ToonKit.cyl(g,.055,.72,INK,Vector3.UP*.36,-1,12)
	for angle in [0.0,TAU/3,TAU*2/3]:ToonKit.rod(g,Vector3(0,.23,0),Vector3(sin(angle)*.43,.03,cos(angle)*.43),.035,INK)
	ToonKit.solid(g,Vector3(1.15,.8,1.15),Vector3.UP*.4)
	for side in [-1,1]:
		var q=Node3D.new();q.position=Vector3(side*1.2,0,0);q.rotation.y=side*PI/2;g.add_child(q)
		ToonKit.box(q,Vector3(.5,.07,.54),CORAL,Vector3.UP*.48,.07);ToonKit.box(q,Vector3(.5,.47,.07),CORAL,Vector3(0,.74,-.24),.08)
		for x in [-.20,.20]:
			for z in [-.20,.20]:ToonKit.rod(q,Vector3(x,.45,z),Vector3(x*1.2,.02,z*1.2),.025,INK)
	ToonKit.cyl(g,.04,2.55,INK,Vector3.UP*1.35,-1,12)
	# Alternating triangular fabric panels; recognizable canopy silhouette.
	var st=SurfaceTool.new();st.begin(Mesh.PRIMITIVE_TRIANGLES)
	for i in range(12):
		var a=TAU*i/12;var b=TAU*(i+1)/12
		st.set_color(Color(TEAL if i%2 else CREAM))
		for point in [Vector3(0,2.9,0),Vector3(sin(a)*1.6,2.5,cos(a)*1.6),Vector3(sin(b)*1.6,2.5,cos(b)*1.6)]:st.add_vertex(point)
	st.generate_normals();var m=ToonKit.mat("#ffffff").duplicate();m.vertex_color_use_as_albedo=true;m.cull_mode=BaseMaterial3D.CULL_DISABLED;ToonKit.mesh(g,st.commit(),m)

static func tree(city: Node3D,p: Vector3,size: float):
	var g=Node3D.new();g.position=p;g.scale=Vector3.ONE*size;city.add_child(g)
	ToonKit.solid(g,Vector3(.28,2.8,.28),Vector3.UP*1.4)
	ToonKit.cyl(g,.16,3.1,"#66556c",Vector3.UP*1.55,.09,7)
	# Branches support an asymmetrical crown of broad, faceted leaf plates.
	for branch in [Vector3(-.9,3.2,.2),Vector3(1,3.6,-.15),Vector3(.15,4.25,.1)]:ToonKit.rod(g,Vector3(0,1.9,0),branch,.085,"#66556c")
	var seed_i=int(absf(p.x*13+p.z*7));var random=RandomNumberGenerator.new();random.seed=seed_i+3921
	var st=SurfaceTool.new();st.begin(Mesh.PRIMITIVE_TRIANGLES)
	# A single lobed deciduous crown. Uneven ring silhouettes, branch volume and
	# broad color facets replace both the old sphere trio and cone-shaped tiers.
	var rings=[];var levels=[Vector2(2.65,.64),Vector2(3.05,1.05),Vector2(3.85,1.12),Vector2(4.5,.72),Vector2(4.85,.16)]
	var lobes=[]
	for i in range(15):lobes.append(random.randf_range(.80,1.15))
	for k in range(levels.size()):
		var row=[]
		for i in range(15):
			var a=TAU*i/15;var radius=levels[k].y*1.75*lobes[i]
			row.append(Vector3(sin(a)*radius+.12*k,levels[k].x+sin(a*3+.8)*.14,cos(a)*radius))
		rings.append(row)
	for k in range(4):
		for i in range(15):
			var j=(i+1)%15;var points=[rings[k][i],rings[k][j],rings[k+1][i],rings[k+1][j]]
			for tri in [[0,2,1],[1,2,3]]:
				st.set_color(Color(["#178487","#249f8a","#51bc91","#8bd299"][k]).lightened(random.randf_range(-.03,.04)))
				for index in tri:st.add_vertex(points[index])
	for i in range(15):
		var j=(i+1)%15
		st.set_color(Color("#226879"))
		for v in [Vector3(0,2.8,0),rings[0][j],rings[0][i]]:st.add_vertex(v)
		st.set_color(Color("#8bd299"))
		for v in [Vector3(.5,4.9,0),rings[4][i],rings[4][j]]:st.add_vertex(v)
	st.generate_normals();var m=ToonKit.mat("#ffffff").duplicate();m.vertex_color_use_as_albedo=true;m.cull_mode=BaseMaterial3D.CULL_DISABLED;ToonKit.mesh(g,st.commit(),m)

	ToonKit.box(g,Vector3(2.65,.15,2.65),"#e3e2dd",Vector3(0,.06,0),.09)
	ToonKit.box(g,Vector3(2.32,.04,2.32),"#304f65",Vector3(0,.16,0),.02)
	for x in [-.9,-.6,-.3,0,.3,.6,.9]:ToonKit.box(g,Vector3(.045,.025,2.12),"#5f8095",Vector3(x,.195,0),.002)

static func ground(city: Node3D):
	# Street edge: two contrasting stone bands, tactile paving and drain grates.
	for z in [28.1,51.9]:
		ToonKit.box(city,Vector3(365,.02,.27),"#f3c65b",Vector3(35,.13,z-.72),.003)
	for x in range(-140,216,12):
		for z in [27.6,52.4]:
			ToonKit.box(city,Vector3(.8,.02,.38),"#466079",Vector3(x,.025,z),.01)
			for j in range(6):ToonKit.box(city,Vector3(.035,.01,.3),"#a1b5c4",Vector3(x-.31+j*.12,.042,z),.001)
	# Continuous forecourt paving: no decorative border or subdivision strokes.
	for x in [-83.8,-28.3]:
		ToonKit.box(city,Vector3(2.8,.55,1.4),INK,Vector3(x,.3,15.7),.08)
		ToonKit.box(city,Vector3(2.5,.16,1.15),"#25a692",Vector3(x,.64,15.7),.07)
		ToonKit.solid(city,Vector3(2.8,.7,1.4),Vector3(x,.35,15.7))
	# Painted lane arrows and parking bay graphics give the roadway a human scale.
	for x in [-125,-60,55,120,190]:
		var arrow=ToonKit.polygon(city,PackedVector2Array([Vector2(-.22,-1.5),Vector2(.22,-1.5),Vector2(.22,.5),Vector2(.7,.5),Vector2(0,1.5),Vector2(-.7,.5),Vector2(-.22,.5)]),"#e7ebeb",Vector3(x,.024,44.7));arrow.rotation=Vector3(-PI/2,0,-PI/2)
	for x in [-66,-54,-42]:
		for side in [-1,1]:ToonKit.box(city,Vector3(.065,.015,3.7),"#e1e8e8",Vector3(x+side*2.5,.024,33),.002)
