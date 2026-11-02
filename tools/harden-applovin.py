"""Apply host lifecycle and verified store-destination changes to the source."""
from pathlib import Path
p=Path(__file__).resolve().parents[1]/'src/playable.html'
s=p.read_text()
s=s.replace('<meta name="ad.size" content="width=400,height=870">\n','')
s=s.replace('let m=null,ready=false,',"let hostState='default',hostViewable=true,pageActive=true;\n let m=null,ready=false,")
a=s.index(' function install(){');b=s.index(' function resize(){',a)
s=s[:a]+''' function install(){
  if(!ready||!visible||!started||!ended||performance.now()-firstTapAt<500)return;
  const platform=CONFIG.deliveryPlatform==='ios'?'ios':/Android/i.test(navigator.userAgent)?'android':'ios';
  const url=platform==='ios'?CONFIG.iosStoreUrl:CONFIG.androidStoreUrl;
  if(!url){toast('This playable is available for iOS.');return;}
  if(m){try{window.mraid.open(url);}catch(e){toast('Please try Play Now again.');}}
  else toast('To install, open this playable in the AppLovin preview or app.');
 }
'''+s[b:]
a=s.index(' function visibility(value){');b=s.index(' function boot(){',a)
s=s[:a]+''' function applyVisibility(){
  visible=ready&&pageActive&&!document.hidden&&(!m||(hostViewable&&hostState!=='hidden'&&hostState!=='loading'));
  document.body.style.setProperty('--ad-visible',visible?'1':'0');document.body.style.setProperty('--chip-motion',visible?'running':'paused');
  document.querySelectorAll('.nudge').forEach(el=>el.style.animationPlayState=visible?'running':'paused');
  if(audio){if(audioGain)audioGain.gain.setValueAtTime(muted||!visible?0:1,audio.currentTime);if(!visible)audio.suspend().catch(()=>{});else audio.resume().catch(()=>{});}
 }
 function visibility(value){if(m)hostViewable=Boolean(value);else pageActive=Boolean(value);applyVisibility();}
'''+s[b:]
a=s.index(" document.addEventListener('visibilitychange'");b=s.index(' reset(current);updateSound();',a)
s=s[:a]+''' document.addEventListener('visibilitychange',applyVisibility);
 window.addEventListener('pagehide',()=>{pageActive=false;applyVisibility();});
 window.addEventListener('pageshow',()=>{pageActive=true;applyVisibility();});window.addEventListener('resize',resize);
 if(m){
  hostState=m.getState();hostViewable=m.isViewable();
  m.addEventListener('viewableChange',visibility);m.addEventListener('sizeChange',resize);
  m.addEventListener('stateChange',state=>{hostState=state;if(state!=='hidden'&&state!=='loading')hostViewable=m.isViewable();applyVisibility();});
 }
 applyVisibility();
'''+s[b:]
p.write_text(s)
