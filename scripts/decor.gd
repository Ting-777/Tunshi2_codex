class_name StreetDecor
extends RefCounted

static func build(city: Node3D):
	_pergola(city,Vector3(-146,.15,68))
	for x in [74,114,134]:
		city.bench(Vector3(x,.15,-103));city.flower(Vector3(x+3,.15,-103))
	for x in [-82,-58,-32]:
		for z in [18.8,25]:
			var g=Node3D.new();g.position=Vector3(x,.14,z);city.add_child(g)
			ToonKit.cyl(g,.2,.6,"#3e6970",Vector3.UP*.3,.15,12);ToonKit.box(g,Vector3(.28,.10,.3),"#edc786",Vector3.UP*.65,.05)

static func _window(city: Node3D,x: float,kind: int):
	var g=Node3D.new();g.position=Vector3(x,0,0);city.add_child(g)
	# Shallow authored displays sit behind glass; these shops remain exterior scenery.
	ToonKit.box(g,Vector3(12.6,.18,1.8),"#d9bd94",Vector3(0,.22,10.7),.04)
	for xx in [-5.9,-2.9,.2,3.3]:
		ToonKit.box(g,Vector3(.095,2.65,.12),"#e6d5ae",Vector3(xx,1.62,11.72),.015)
	for y in [.34,2.9]:ToonKit.box(g,Vector3(12.3,.10,.12),"#e6d5ae",Vector3(0,y,11.72),.015)
	ToonKit.box(g,Vector3(12.2,.06,.2),"#e6d5ae",Vector3(0,1.82,11.72),.01)
	var glass=StandardMaterial3D.new();glass.albedo_color=Color(.48,.73,.74,.16);glass.transparency=BaseMaterial3D.TRANSPARENCY_ALPHA;glass.roughness=.7;glass.cull_mode=BaseMaterial3D.CULL_DISABLED
	ToonKit.mesh(g,ToonKit.rounded(Vector3(11.9,2.5,.025),.006),glass,Vector3(0,1.62,11.69))
	if kind==0:
		ToonKit.box(g,Vector3(8,1,.65),"#b57955",Vector3(-1.1,.8,10.9),.06);ToonKit.box(g,Vector3(8.3,.12,.85),"#ecd7ae",Vector3(-1.1,1.36,10.9),.04)
		for y in [1.65,2.25]:
			ToonKit.box(g,Vector3(7.8,.08,.42),"#c79a6a",Vector3(-1.1,y,10.15),.02)
			for j in range(6):ToonKit.cyl(g,.12,.24,"#f1dbaa" if j%2 else "#db8a64",Vector3(-4.3+j*1.15,y+.17,10.15),.09,12)
		ToonKit.box(g,Vector3(1.4,.6,.65),"#527983",Vector3(-1.2,1.7,10.85),.09)
		for xx in [-1.55,-.9]:ToonKit.cyl(g,.045,.16,"#cbd4bb",Vector3(xx,1.43,11.1),.03,10)
		ToonKit.text(g,"今日手冲  ·  拿铁\\n慢一点，咖啡不会跑。",Vector3(4.5,2.2,11.86),.0029)
	elif kind==1:
		for y in [.65,1.35,2.05]:
			ToonKit.box(g,Vector3(10.7,.08,.75),"#d7c59f",Vector3(-.5,y,10.6),.02)
			for j in range(13):
				ToonKit.box(g,Vector3(.47,.40,.35),["#df9566","#a1bc85","#e4c46e","#8db6bb"][j%4],Vector3(-5.2+j*.76,y+.25,10.6),.04)
		ToonKit.text(g,"冰镇汽水  ·  今日到货",Vector3(0,2.55,11.87),.0045)
	else:
		for y in [.88,2.1]:
			for j in range(7):
				var record=ToonKit.cyl(g,.36,.04,"#253f4b",Vector3(-5+j*1.25,y,10.8),-1,24);record.rotation.x=PI/2
				var label=ToonKit.cyl(g,.13,.06,["#de9b67","#9eb789","#e1cb91"][j%3],Vector3(-5+j*1.25,y,10.84),-1,16);label.rotation.x=PI/2
		ToonKit.box(g,Vector3(10,.13,.55),"#c8976a",Vector3(-1,1.38,10.7),.02);ToonKit.text(g,"SIDE A  ·  沿江的风",Vector3(0,2.7,11.87),.005)
	for xx in [-4,0,4]:
		for y in [5.4,8.1]:
			ToonKit.box(g,Vector3(.085,1.5,.2),"#e9d9b6",Vector3(xx,y,11.77),.01);ToonKit.box(g,Vector3(2.6,.08,.2),"#e9d9b6",Vector3(xx,y,11.77),.01)
	ToonKit.box(g,Vector3(1.5,2.25,.16),"#bdac8e",Vector3(4.5,1.35,11.77),.03);ToonKit.box(g,Vector3(1.23,1.95,.04),"#436e78",Vector3(4.5,1.4,11.87),.025)

static func _pergola(city: Node3D,p: Vector3):
	var g=Node3D.new();g.position=p;city.add_child(g)
	ToonKit.box(g,Vector3(8,.12,7),"#d8c6a4",Vector3.UP*.06,.1)
	for x in [-3.5,3.5]:
		for z in [-2.8,2.8]:ToonKit.box(g,Vector3(.2,3.2,.2),"#a98760",Vector3(x,1.6,z),.035);ToonKit.solid(g,Vector3(.25,3.2,.25),Vector3(x,1.6,z))
	for z in [-2.8,2.8]:ToonKit.box(g,Vector3(8,.24,.2),"#9b7d5a",Vector3(0,3.1,z),.04)
	for x in range(-4,5):ToonKit.box(g,Vector3(.14,.14,7),"#bb976a",Vector3(x,3.35,0),.03)
	city.bench(p+Vector3(0,0,-2.2));city.flower(p+Vector3(3.5,0,3.6))
