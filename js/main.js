(function(BJ){
'use strict';
const $=BJ.$;
function updateCountVisibility(){const box=$('countBox'),toggle=$('showCount');if(!box||!toggle)return;box.classList.toggle('hidden',!toggle.checked);localStorage.setItem('bjShowCount',toggle.checked?'1':'0');}
function updateCutCardSetting(){const toggle=$('disableCutCard');if(!toggle)return;localStorage.setItem('bjDisableCutCard',toggle.checked?'1':'0');}
function selectedFilters(){return [...document.querySelectorAll('.trainer-filter:checked')].map(x=>x.value).filter(x=>x!=='mixed');}
function showScreen(name){$('modeLauncher').classList.toggle('hidden',name!=='launcher');$('trainerSetup').classList.toggle('hidden',name!=='trainer');$('gameShell').classList.toggle('hidden',name!=='game');}
function updateModeBadge(){const badge=$('modeBadge');badge.textContent=game.trainingLabel();badge.classList.toggle('trainer-active',game.playMode==='trainer');}
function enterGame(mode,filters=[]){game.setPlayMode(mode,filters);updateModeBadge();showScreen('game');game.render(mode==='trainer'?'Trainer פעיל. לחצי על “חלוקה חדשה”.':'לחצי על “חלוקה חדשה” כדי להתחיל.');}
function returnToLauncher(){if(game.roundActive||game.animating){if(!confirm('הסיבוב עדיין פעיל. לחזור למסך הפתיחה?'))return;}game.roundActive=false;game.insurancePending=false;game.forcedDeal=[];showScreen('launcher');}

const game=new BJ.Game();
window.blackjackGame=game;
if(BJ.AutomatedTests)BJ.AutomatedTests.runAndReport();else if(BJ.runEngineClassificationTests)BJ.runEngineClassificationTests(game);

$('gameModeBtn').addEventListener('click',()=>enterGame('game'));
$('trainerModeBtn').addEventListener('click',()=>showScreen('trainer'));
$('backToModeBtn').addEventListener('click',()=>showScreen('launcher'));
$('startTrainerBtn').addEventListener('click',()=>{const filters=selectedFilters();if(!filters.length){$('trainerSetupError').textContent='יש לבחור לפחות מסנן אחד.';return;}$('trainerSetupError').textContent='';enterGame('trainer',filters);});
$('exitModeBtn').addEventListener('click',returnToLauncher);
$('mixedFilter').addEventListener('change',e=>{document.querySelectorAll('.trainer-filter').forEach(x=>{if(x!==e.target)x.checked=e.target.checked;});});
document.querySelectorAll('.trainer-filter').forEach(x=>{if(x.id!=='mixedFilter')x.addEventListener('change',()=>{$('mixedFilter').checked=[...document.querySelectorAll('.trainer-filter:not(#mixedFilter)')].every(y=>y.checked);});});

$('newBtn').addEventListener('click',()=>game.start());
$('hitBtn').addEventListener('click',()=>game.act('hit'));
$('standBtn').addEventListener('click',()=>game.act('stand'));
$('doubleBtn').addEventListener('click',()=>game.act('double'));
$('splitBtn').addEventListener('click',()=>game.act('split'));
$('surrenderBtn').addEventListener('click',()=>game.act('surrender'));
$('insuranceBtn').addEventListener('click',()=>game.takeInsurance());
$('noInsuranceBtn').addEventListener('click',()=>game.declineInsurance());
$('saveBtn').addEventListener('click',()=>game.save());
$('loadBtn').addEventListener('click',()=>game.load());
$('resetBtn').addEventListener('click',()=>game.reset());
$('decks').addEventListener('change',()=>{if(!game.roundActive){game.makeShoe();game.render('הנעל אופסה.');}});
$('showHint').addEventListener('change',()=>{if(game.roundActive&&!game.animating)game.render('בחרי מהלך.');});
$('showOdds').addEventListener('change',()=>game.render(game.roundActive?'בחרי מהלך.':'לחצי על “חלוקה חדשה” כדי להתחיל.'));
$('showCount').addEventListener('change',updateCountVisibility);
$('disableCutCard').addEventListener('change',updateCutCardSetting);
$('showCount').checked=localStorage.getItem('bjShowCount')==='1';
$('disableCutCard').checked=localStorage.getItem('bjDisableCutCard')==='1';
updateCountVisibility();updateCutCardSetting();showScreen('launcher');
})(window.BJ);
