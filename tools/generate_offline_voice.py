"""Generate missing speech with eSpeak NG alone, with no ONNX or network client.

Pass the eSpeak shared library and data directory from a local installation.
Only Python stdlib, the local speech library, ffmpeg and ffprobe are loaded.
"""
import argparse,ctypes,hashlib,json,subprocess,wave
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def main():
    p=argparse.ArgumentParser();p.add_argument('--library',type=Path,required=True);p.add_argument('--data',type=Path,required=True);args=p.parse_args()
    lib=ctypes.CDLL(str(args.library.resolve()))
    lib.espeak_Initialize.argtypes=[ctypes.c_int,ctypes.c_int,ctypes.c_char_p,ctypes.c_int];lib.espeak_Initialize.restype=ctypes.c_int
    rate=lib.espeak_Initialize(2,0,str(args.data.resolve().parent).encode(),0)
    assert rate>0,rate
    lib.espeak_SetVoiceByName.argtypes=[ctypes.c_char_p];assert lib.espeak_SetVoiceByName(b'cmn')==0
    callback_type=ctypes.CFUNCTYPE(ctypes.c_int,ctypes.POINTER(ctypes.c_short),ctypes.c_int,ctypes.c_void_p)
    frames=[]
    @callback_type
    def collect(samples,count,events):
        if samples and count:frames.append(ctypes.string_at(samples,count*2))
        return 0
    lib.espeak_SetSynthCallback(collect)
    lib.espeak_Synth.argtypes=[ctypes.c_void_p,ctypes.c_size_t,ctypes.c_uint,ctypes.c_int,ctypes.c_uint,ctypes.c_uint,ctypes.c_void_p,ctypes.c_void_p]
    out=ROOT/'assets/voice';manifest=json.loads((out/'manifest.json').read_text());temporary=ROOT/'builds/offline-speech.wav';count=0
    for path in sorted((ROOT/'assets/dialogue').glob('*.json')):
        for lines in json.loads(path.read_text()).values():
            for speaker,text in lines:
                key=hashlib.sha256((speaker+'|'+text).encode()).hexdigest()[:20];dest=out/(key+'.mp3')
                if dest.exists() and key in manifest and hashlib.sha256(dest.read_bytes()).hexdigest()==manifest[key]['sha256']:continue
                frames.clear();lib.espeak_SetParameter(1,150 if speaker.startswith('老') else 165,0)
                data=text.encode()+b'\0';assert lib.espeak_Synth(data,len(data),0,1,0,1,None,None)==0
                lib.espeak_Synchronize();assert frames
                with wave.open(str(temporary),'wb') as w:w.setnchannels(1);w.setsampwidth(2);w.setframerate(rate);w.writeframes(b''.join(frames))
                subprocess.run(['ffmpeg','-v','error','-y','-i',str(temporary),'-codec:a','libmp3lame','-b:a','96k',str(dest)],check=True)
                duration=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',str(dest)],text=True))
                assert duration>.3
                manifest[key]={'speaker':speaker,'text':text,'voice':'eSpeak NG cmn (offline, no ONNX)','duration':round(duration,3),'sha256':hashlib.sha256(dest.read_bytes()).hexdigest()}
                count+=1
    lib.espeak_Terminate();temporary.unlink(missing_ok=True);(out/'manifest.json').write_text(json.dumps(dict(sorted(manifest.items())),ensure_ascii=False,indent=2)+'\n');print('Generated',count,'offline clips')
if __name__=='__main__':main()
