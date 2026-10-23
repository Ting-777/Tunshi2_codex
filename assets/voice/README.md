# Generated speech assets

Run `python tools/restore_assets.py` after cloning or pulling. It restores the exact audio from the SHA256-pinned GitHub Release voice bundle in VOICE-BUNDLE.json, without regenerating speech. MP3 files and the generated playback manifest are ignored in Git. The Windows PCK contains all active audio and plays offline.

On a new development revision, `python tools/generate_voice.py` generates any newly authored clips using the explicitly authorized Microsoft TTS endpoint. `python tools/package_voice.py` creates a checked release asset. Windows CI performs these steps before importing and testing the exact PCK. Neither screenshots nor video are included.
