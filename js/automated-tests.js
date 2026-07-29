(function(BJ){
'use strict';

const DEALERS=['2','3','4','5','6','7','8','9','10','A'];
const VALID_CODES=new Set(['H','S','D','DS','P']);
const row=s=>Object.freeze(Object.fromEntries(DEALERS.map((d,i)=>[d,s.split(' ')[i]])));

// Independent reference snapshot. This must not read values from strategy.js.
const REFERENCE=Object.freeze({
 hard:Object.freeze({
  5:row('H H H H H H H H H H'),6:row('H H H H H H H H H H'),7:row('H H H H H H H H H H'),8:row('H H H H H H H H H H'),
  9:row('H D D D D H H H H H'),10:row('D D D D D D D D H H'),11:row('D D D D D D D D H H'),
  12:row('H H S S S H H H H H'),13:row('S S S S S H H H H H'),14:row('S S S S S H H H H H'),
  15:row('S S S S S H H H H H'),16:row('S S S S S H H H H H'),17:row('S S S S S S S S S S'),
  18:row('S S S S S S S S S S'),19:row('S S S S S S S S S S'),20:row('S S S S S S S S S S'),21:row('S S S S S S S S S S')
 }),
 soft:Object.freeze({
  13:row('H H H D D H H H H H'),14:row('H H H D D H H H H H'),15:row('H H D D D H H H H H'),
  16:row('H H D D D H H H H H'),17:row('H D D D D H H H H H'),18:row('S DS DS DS DS S S H H H'),
  19:row('S S S S S S S S S S'),20:row('S S S S S S S S S S'),21:row('S S S S S S S S S S')
 }),
 pairs:Object.freeze({
  A:row('P P P P P P P P P H'),10:row('S S S S S S S S S S'),9:row('P P P P P S P P S S'),
  8:row('P P P P P P P P H H'),7:row('P P P P P P H H H H'),6:row('P P P P P H H H H H'),
  5:row('D D D D D D D D H H'),4:row('H H H P P H H H H H'),3:row('P P P P P P H H H H'),2:row('P P P P P P H H H H')
 }),
 surrender:Object.freeze({hard:Object.freeze({15:['10'],16:['9','10','A']}),pairs:Object.freeze({8:['10','A']})})
});

function result(section,name,expected,actual,details=''){
 return {section,name,expected:String(expected),actual:String(actual),pass:expected===actual,details};
}
function card(rank,suit='♠'){return rank+suit;}
function createGame(){return Object.create(BJ.Game.prototype);}
function makeScenario(game,cards,dealer,{bank=1000,fromSplit=false,hands=1}={}){
 game.bank=bank;game.roundActive=true;game.insurancePending=false;game.animating=false;game.active=0;
 game.hands=[{cards,bet:25,fromSplit,done:false,result:null}];
 while(game.hands.length<hands)game.hands.push({cards:[card('10'),card('7','♥')],bet:25,fromSplit:true,done:true,result:null});
 game.dealer=[card(dealer)];
}

function tableTests(){
 const out=[];
 for(const section of ['hard','soft','pairs']){
  const actualSection=BJ.STRATEGY?.[section]||{};
  for(const [hand,expectedRow] of Object.entries(REFERENCE[section])){
   for(const dealer of DEALERS){
    const actual=actualSection?.[hand]?.[dealer];
    out.push(result('table',`${section} ${hand} מול ${dealer}`,expectedRow[dealer],actual??'MISSING'));
   }
  }
 }
 for(const subtype of ['hard','pairs']){
  const allHands=new Set([...Object.keys(REFERENCE.surrender[subtype]),...Object.keys(BJ.STRATEGY?.surrender?.[subtype]||{})]);
  for(const hand of allHands)for(const dealer of DEALERS){
   const expected=(REFERENCE.surrender[subtype][hand]||[]).includes(dealer);
   const actual=(BJ.STRATEGY?.surrender?.[subtype]?.[hand]||[]).includes(dealer);
   out.push(result('surrender',`${subtype} ${hand} מול ${dealer}`,expected,actual));
  }
 }
 return out;
}

function schemaTests(){
 const out=[];
 const p=BJ.STRATEGY?.profile||{};
 for(const [key,expected] of Object.entries({decks:5,dealerSoft17:'stand',holeCard:'ENHC',doubleAfterSplit:true,maxHands:4})){
  out.push(result('schema',`profile.${key}`,expected,p[key]));
 }
 out.push(result('schema','dealerColumns length',10,BJ.STRATEGY?.dealerColumns?.length));
 out.push(result('schema','dealerColumns unique',10,new Set(BJ.STRATEGY?.dealerColumns||[]).size));
 for(const section of ['hard','soft','pairs'])for(const [hand,r] of Object.entries(BJ.STRATEGY?.[section]||{})){
  out.push(result('schema',`${section}.${hand} columns`,10,Object.keys(r).length));
  for(const dealer of DEALERS)out.push(result('schema',`${section}.${hand}.${dealer} valid code`,true,VALID_CODES.has(r[dealer]),`code=${r[dealer]}`));
 }
 return out;
}

function classificationTests(){
 const game=createGame();
 const cases=[
  {name:'A,4',cards:[card('A'),card('4','♥')],type:'soft',total:15},
  {name:'A,5',cards:[card('A'),card('5','♥')],type:'soft',total:16},
  {name:'A,6',cards:[card('A'),card('6','♥')],type:'soft',total:17},
  {name:'A,A,4',cards:[card('A'),card('A','♥'),card('4','♦')],type:'soft',total:16},
  {name:'10,5',cards:[card('10'),card('5','♥')],type:'hard',total:15},
  {name:'8,8',cards:[card('8'),card('8','♥')],type:'pair',total:16,pairRank:'8'},
  {name:'10,K',cards:[card('10'),card('K','♥')],type:'pair',total:20,pairRank:'10'}
 ];
 const out=[];
 for(const t of cases){
  const a=game.classifyHand(t.cards);
  out.push(result('classification',`${t.name} type`,t.type,a.type));
  out.push(result('classification',`${t.name} total`,t.total,a.total));
  if(t.pairRank)out.push(result('classification',`${t.name} pair rank`,t.pairRank,a.pairRank));
 }
 return out;
}

function integrationTests(){
 const game=createGame();
 const cases=[
  ['A,4 מול 10',[card('A'),card('4','♥')],'10','hit'],
  ['A,5 מול 10',[card('A'),card('5','♥')],'10','hit'],
  ['A,6 מול 10',[card('A'),card('6','♥')],'10','hit'],
  ['11 מול 10',[card('8'),card('3','♥')],'10','hit'],
  ['11 מול 9',[card('8'),card('3','♥')],'9','double'],
  ['Hard 15 מול 10',[card('10'),card('5','♥')],'10','surrender'],
  ['Hard 16 מול A',[card('10'),card('6','♥')],'A','surrender'],
  ['Soft 15 מול 10',[card('A'),card('4','♥')],'10','hit'],
  ['Soft 16 מול 10',[card('A'),card('5','♥')],'10','hit'],
  ['8,8 מול 10',[card('8'),card('8','♥')],'10','surrender'],
  ['A,A מול A',[card('A'),card('A','♥')],'A','hit']
 ];
 const out=[];
 for(const [name,cards,dealer,expected] of cases){
  makeScenario(game,cards,dealer);
  const actual=game.recommend();
  out.push(result('integration',name,expected,actual,game.classifyHand(game.hands[0]).type));
  out.push(result('invariant',`${name}: recommendation allowed`,true,game.actions().includes(actual),`actions=${game.actions().join(',')}`));
 }
 makeScenario(game,[card('8'),card('3','♥')],'9',{bank:0});
 out.push(result('fallback','11 מול 9 ללא כסף להכפלה','hit',game.recommend()));
 makeScenario(game,[card('8'),card('8','♥')],'6',{bank:0});
 out.push(result('fallback','8,8 מול 6 ללא כסף לפיצול','stand',game.recommend()));
 makeScenario(game,[card('A'),card('4','♥')],'10',{fromSplit:false});
 out.push(result('invariant','Soft hand never surrenders',false,game.recommend()==='surrender'));
 return out;
}

function run(){
 const started=performance.now();
 let results=[];
 try{results=[...schemaTests(),...tableTests(),...classificationTests(),...integrationTests()];}
 catch(error){results.push({section:'runtime',name:'Test suite execution',expected:'no exception',actual:error?.message||String(error),pass:false,details:error?.stack||''});}
 const failures=results.filter(x=>!x.pass);
 return Object.freeze({
  version:'1.5.4',timestamp:new Date().toISOString(),durationMs:Math.round((performance.now()-started)*100)/100,
  total:results.length,passed:results.length-failures.length,failed:failures.length,ok:failures.length===0,results,failures
 });
}

function escapeHtml(value){
 return String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
}

function hideFailureToast(){
 const toast=document.getElementById('systemErrorToast');
 if(toast)toast.classList.add('hidden');
}

function showFailureToast(report){
 const toast=document.getElementById('systemErrorToast');
 if(!toast)return;
 const summary=document.getElementById('systemErrorSummary');
 const details=document.getElementById('systemErrorDetails');
 const detailsBtn=document.getElementById('systemErrorDetailsBtn');
 const closeBtn=document.getElementById('systemErrorClose');
 if(summary)summary.textContent=`נכשלו ${report.failed} מתוך ${report.total} בדיקות אוטומטיות.`;
 if(details){
  details.classList.add('hidden');
  details.innerHTML=report.failures.slice(0,10).map(f=>
   `<div class="system-error-failure"><b>${escapeHtml(f.name)}</b><br>צפוי: ${escapeHtml(f.expected)}<br>התקבל: ${escapeHtml(f.actual)}</div>`
  ).join('')+(report.failures.length>10?`<div class="system-error-failure">ועוד ${report.failures.length-10} תקלות.</div>`:'');
 }
 if(detailsBtn){
  detailsBtn.textContent='הצג פרטים';
  detailsBtn.onclick=()=>{
   if(!details)return;
   const opening=details.classList.contains('hidden');
   details.classList.toggle('hidden',!opening);
   detailsBtn.textContent=opening?'הסתר פרטים':'הצג פרטים';
  };
 }
 if(closeBtn)closeBtn.onclick=hideFailureToast;
 toast.classList.remove('hidden');
}

function updateFailureNotification(report){
 if(report.ok)hideFailureToast();
 else showFailureToast(report);
}

function runAndReport(){
 const report=run();
 BJ.lastSelfTestReport=report;
 try{localStorage.setItem('bjLastSelfTestReport',JSON.stringify({version:report.version,timestamp:report.timestamp,total:report.total,passed:report.passed,failed:report.failed,ok:report.ok,durationMs:report.durationMs,failures:report.failures.slice(0,25)}));}catch(_e){}
 updateFailureNotification(report);
 if(report.ok)console.info(`[Blackjack Self-Test] PASS ${report.passed}/${report.total} in ${report.durationMs}ms`,report);
 else console.error(`[Blackjack Self-Test] FAIL ${report.failed}/${report.total}`,report.failures);
 document.dispatchEvent(new CustomEvent('bj:self-test-complete',{detail:report}));
 return report;
}

BJ.AutomatedTests=Object.freeze({run,runAndReport,reference:REFERENCE});
})(window.BJ);
