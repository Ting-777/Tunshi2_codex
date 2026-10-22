extends Node

func _ready():
	var args=OS.get_cmdline_user_args()
	var story="--test-prologue" in args or "--capture-prologue" in args
	var sandbox=("--test" in args or "--capture" in args or "--sandbox" in args) and not story
	get_tree().change_scene_to_file.call_deferred("res://scenes/main.tscn" if sandbox else "res://scenes/prologue.tscn")
