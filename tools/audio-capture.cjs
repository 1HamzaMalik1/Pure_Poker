// Review-only capture of the ad's Web Audio output. No microphone is used.
module.exports=function(){
 const Native=window.AudioContext||window.webkitAudioContext;
 window.AudioContext=class extends Native{
  constructor(...args){
   super(...args);
   const tap=this.createMediaStreamDestination();
   const analyser=this.createAnalyser();analyser.fftSize=2048;
   const silent=this.createGain();silent.gain.value=0;analyser.connect(silent);silent.connect(this.destination);
   const original=this.createGain.bind(this);
   this.createGain=()=>{const gain=original();gain.connect(tap);gain.connect(analyser);return gain;};
   const chunks=[],recorder=new MediaRecorder(tap.stream,{mimeType:'audio/webm;codecs=opus'});
   const capture={startedAt:performance.timeOrigin+performance.now(),analyser,recorder,done:null,bytes:null};
   capture.done=new Promise(resolve=>{recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};recorder.onstop=async()=>{capture.bytes=Array.from(new Uint8Array(await new Blob(chunks,{type:'audio/webm'}).arrayBuffer()));resolve();};});
   recorder.start(200);window.__audioCapture=capture;
  }
 };
};
