// Original effects cut from the user's reference. No continuous soundtrack:
// samples follow game events, including alternative decisions and pauses.
let audioGain=null,audioReady=null,soundPreference=null;
const soundBuffers={},playingSounds=new Set(),audioEvents=[];
function prepareAudio(){
 try{
  if(!audio){
   audio=new(window.AudioContext||window.webkitAudioContext)();
   audioGain=audio.createGain();audioGain.connect(audio.destination);
   audioReady=Promise.all(Object.entries(SOUND_ASSETS).map(async([name,uri])=>{
    const raw=atob(uri.slice(uri.indexOf(',')+1));
    const bytes=Uint8Array.from(raw,c=>c.charCodeAt(0));
    soundBuffers[name]=await audio.decodeAudioData(bytes.buffer);
   })).catch(()=>{});
  }
  audioGain.gain.setValueAtTime(muted?0:1,audio.currentTime);
  if(visible)audio.resume().catch(()=>{});
 }catch(e){muted=true;}
}
function stopSounds(){for(const source of playingSounds){try{source.stop();}catch(e){}}playingSounds.clear();audioEvents.length=0;}
function tone(type){
 if(muted||!visible||!audio)return;
 const play=()=>{
  if(muted||!visible||!soundBuffers[type])return;
  const source=audio.createBufferSource();source.buffer=soundBuffers[type];source.connect(audioGain);
  playingSounds.add(source);source.onended=()=>playingSounds.delete(source);source.start();
  audioEvents.push({type,at:clock});
 };
 if(soundBuffers[type])play();else audioReady?.then(play);
}
function firstTapAudio(){if(soundPreference===null)muted=false;prepareAudio();updateSound();}
function toggleAudio(){muted=!muted;soundPreference=!muted;prepareAudio();updateSound();}
