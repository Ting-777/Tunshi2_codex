class_name StoryVoice
extends Node

var catalog_path="res://assets/dialogue/prologue.json"
var catalog={}
var manifest={}
var player: AudioStreamPlayer
var enabled=true
var current_key=""
var duration=0.0
var spoken_count=0
var streams={}

func _ready():
	catalog=JSON.parse_string(FileAccess.get_file_as_string(catalog_path))
	if FileAccess.file_exists("res://assets/voice/manifest.json"):manifest=JSON.parse_string(FileAccess.get_file_as_string("res://assets/voice/manifest.json"))
	player=AudioStreamPlayer.new();player.volume_db=-1.5;add_child(player)

func lines(key: String) -> Array:return catalog.get(key,[]).duplicate(true)

func key_for(line: Array) -> String:return (str(line[0])+"|"+str(line[1])).sha256_text().substr(0,20)

func speak(line: Array):
	stop();current_key=key_for(line)
	var path="res://assets/voice/"+current_key+".mp3"
	if not streams.has(current_key) and ResourceLoader.exists(path):streams[current_key]=load(path)
	if streams.has(current_key):
		player.stream=streams[current_key];duration=player.stream.get_length()
		if enabled:player.play();spoken_count+=1
	else:
		duration=maxf(2,str(line[1]).length()*.18);push_error("Missing bundled voice: "+current_key)

func stop():
	if player:player.stop();player.stream_paused=false
	current_key="";duration=0

func set_enabled(value: bool):
	enabled=value
	if not enabled:player.stop()

func set_paused(value: bool):player.stream_paused=value

func all_lines() -> Array:
	var out=[]
	for group in catalog.values():
		for line in group:out.append(line)
	return out

func clip_length(group: String) -> float:
	var key=key_for(lines(group)[0]);return float(manifest.get(key,{}).get("duration",3.0))
