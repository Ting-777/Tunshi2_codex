"""Synthesize landmark dialogue locally with an already downloaded Piper model.

Build-time only: piper-tts==1.3.0, ffmpeg and ffprobe. Never sends text over a network.
The game only needs the resulting bundled MP3 files, not Python or a voice model.
"""
import argparse,hashlib,json,subprocess,wave
from pathlib import Path
import onnxruntime
onnxruntime.disable_telemetry_events()
from piper import PiperVoice, PiperConfig, SynthesisConfig
from piper.voice import ESPEAK_DATA_DIR
ROOT=Path(__file__).resolve().parents[1]
GROUPS=['tower_welcome','tower_family','pearl_done','jinmao_done','luo_welcome','luo_done']

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--model',type=Path,required=True);parser.add_argument('--all-chapter',action='store_true');parser.add_argument('--all-dialogue',action='store_true');args=parser.parse_args()
    config=Path(str(args.model)+'.json')
    options=onnxruntime.SessionOptions();options.intra_op_num_threads=2;options.inter_op_num_threads=1
    voice=PiperVoice(config=PiperConfig.from_dict(json.loads(config.read_text())),session=onnxruntime.InferenceSession(str(args.model),sess_options=options,providers=['CPUExecutionProvider']),espeak_data_dir=ESPEAK_DATA_DIR)
    catalog={}
    paths=sorted((ROOT/'assets/dialogue').glob('*.json')) if args.all_dialogue else [ROOT/'assets/dialogue/chapter1.json']
    for path in paths:
        for group,lines in json.loads(path.read_text()).items():catalog[path.stem+':'+group if args.all_dialogue else group]=lines
    out=ROOT/'assets/voice';manifest=json.loads((out/'manifest.json').read_text());temporary=ROOT/'builds/landmark-speech.wav'
    model_hash=hashlib.sha256(args.model.read_bytes()).hexdigest()
    for group in (list(catalog) if args.all_chapter or args.all_dialogue else GROUPS):
        for speaker,text in catalog[group]:
            key=hashlib.sha256((speaker+'|'+text).encode()).hexdigest()[:20];path=out/(key+'.mp3')
            if path.exists() and key in manifest and hashlib.sha256(path.read_bytes()).hexdigest()==manifest[key]['sha256']:continue
            rate=1.08 if speaker=='豚师' else .9 if speaker.startswith('老') else 1.0
            with wave.open(str(temporary),'wb') as wav:voice.synthesize_wav(text,wav,syn_config=SynthesisConfig(length_scale=rate))
            subprocess.run(['ffmpeg','-v','error','-y','-i',str(temporary),'-codec:a','libmp3lame','-b:a','96k',str(path)],check=True)
            duration=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',str(path)],text=True))
            assert duration>.3 and path.stat().st_size>1000
            manifest[key]={'speaker':speaker,'text':text,'voice':'Piper zh_CN-huayan-medium (local)','model_sha256':model_hash,'length_scale':rate,'duration':round(duration,3),'sha256':hashlib.sha256(path.read_bytes()).hexdigest()};print(key,round(duration,2),flush=True)
    temporary.unlink(missing_ok=True)
    (out/'manifest.json').write_text(json.dumps(dict(sorted(manifest.items())),ensure_ascii=False,indent=2)+'\n')
if __name__=='__main__':main()
