(function(BJ){
'use strict';
const ACTION_NAMES={H:'Hit',S:'Stand',D:'Double / Hit',DS:'Double / Stand',P:'Split / רגיל',R:'Surrender'};
function render(){
 const report=BJ.AutomatedTests.run();
 const summary=document.getElementById('testerSummary');
 const body=document.getElementById('testerBody');
 const filter=document.getElementById('testerFilter')?.value||'all';
 const search=(document.getElementById('testerSearch')?.value||'').trim().toLowerCase();
 const rows=report.results.map(r=>({section:r.section,hand:r.name,dealer:'—',expected:r.expected,actual:r.actual,pass:r.pass,details:r.details||''}));
 const visible=rows.filter(r=>(filter==='all'||r.section===filter)&&(!search||`${r.section} ${r.hand} ${r.expected} ${r.actual} ${r.details}`.toLowerCase().includes(search)));
 summary.className='tester-summary '+(report.ok?'tester-pass':'tester-fail');
 summary.innerHTML=report.ok
  ? `✅ כל <b>${report.total}</b> הבדיקות האוטומטיות עברו בהצלחה תוך ${report.durationMs}ms.`
  : `❌ נמצאו <b>${report.failed}</b> תקלות מתוך ${report.total} בדיקות.`;
 body.innerHTML=visible.map(r=>`<tr class="${r.pass?'pass-row':'fail-row'}"><td>${r.pass?'✅':'❌'}</td><td>${r.section}</td><td>${r.hand}</td><td>${r.dealer}</td><td>${ACTION_NAMES[r.expected]||r.expected}</td><td>${ACTION_NAMES[r.actual]||r.actual}</td><td>${r.details}</td></tr>`).join('');
 document.getElementById('testerCount').textContent=`מוצגות ${visible.length} מתוך ${report.total} בדיקות · עברו ${report.passed} · נכשלו ${report.failed}`;
 BJ.lastSelfTestReport=report;
 return report;
}
BJ.StrategyTester=Object.freeze({run:BJ.AutomatedTests.run,render});
})(window.BJ);
