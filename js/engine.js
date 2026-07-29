(function(BJ){
'use strict';

/**
 * Classify a player hand before consulting Basic Strategy.
 * Precedence is intentional:
 *   1. Pair (only two equal blackjack ranks)
 *   2. Soft hand (an ace is still counted as 11)
 *   3. Hard hand
 *
 * This prevents soft hands such as A,4 and A,5 from being treated as
 * hard 15/16 and receiving an incorrect surrender recommendation.
 */
BJ.Game.prototype.classifyHand = function(handOrCards){
  const cards=Array.isArray(handOrCards)?handOrCards:(handOrCards&&handOrCards.cards)||[];
  const value=this.value(cards);
  const isPair=cards.length===2&&this.pairRank(cards[0])===this.pairRank(cards[1]);
  return Object.freeze({
    type:isPair?'pair':value.soft?'soft':'hard',
    total:value.total,
    soft:value.soft,
    pairRank:isPair?this.pairRank(cards[0]):null,
    cardCount:cards.length
  });
};

BJ.runEngineClassificationTests = function(game){
  const tests=[
    {cards:['A♠','4♥'],type:'soft',total:15,label:'A,4'},
    {cards:['A♠','5♥'],type:'soft',total:16,label:'A,5'},
    {cards:['10♠','5♥'],type:'hard',total:15,label:'10,5'},
    {cards:['8♠','8♥'],type:'pair',total:16,pairRank:'8',label:'8,8'},
    {cards:['10♠','K♥'],type:'pair',total:20,pairRank:'10',label:'10,K'},
    {cards:['A♠','A♥','4♦'],type:'soft',total:16,label:'A,A,4'}
  ];
  const failures=[];
  for(const test of tests){
    const result=game.classifyHand(test.cards);
    if(result.type!==test.type||result.total!==test.total||(test.pairRank&&result.pairRank!==test.pairRank)){
      failures.push({test,result});
    }
  }
  if(failures.length)console.error('Blackjack engine hand-classification tests failed:',failures);
  else console.info('Blackjack engine hand-classification tests passed.');
  return failures;
};
BJ.Game.prototype.start = async function(){if(this.roundActive||this.animating)return;this.lastDisplayedOdds=null;const bet=Number(BJ.$('bet').value);if(this.bank<bet){this.render('אין מספיק כסף להימור.');return}if(!BJ.$('disableCutCard').checked&&this.shoe.length<=130){this.makeShoe();BJ.showShuffleNotice();}if(!this.prepareOpeningDeal()){this.render('לא נמצאה חלוקה מתאימה למסנן. נסה מסנן נוסף או ערבב מחדש.');return}this.hands=[{cards:[],bet,fromSplit:false,done:false,result:null}];this.dealer=[];this.active=0;this.roundActive=true;this.insurancePending=false;this.insuranceBet=0;this.stats.rounds++;this.animating=true;this.render('הקלפים מחולקים…');
   await this.dealCard('hand',0);await this.dealCard('dealer');await this.dealCard('hand',0);this.animating=false;this.insurancePending=this.rank(this.dealer[0])==='A';
   if(this.isBJ(this.hands[0])&&!['A','10'].includes(this.pairRank(this.dealer[0]))){const h=this.hands[0];this.bank+=h.bet*1.5;h.done=true;h.result='Blackjack';this.stats.hands++;this.stats.wins++;this.stats.blackjacks++;this.roundActive=false;this.addHistory('Blackjack טבעי — ניצחון 3:2');this.render('🃏 Blackjack טבעי!');return}
   this.render(this.insurancePending?'לדילר יש אס. בחרי Insurance או ללא Insurance.':'בחרי מהלך.')};
BJ.Game.prototype.dealCard = async function(target,handIndex=0){const card=this.draw();let key;if(target==='dealer'){this.dealer.push(card);key='dealer:'+(this.dealer.length-1)}else{this.hands[handIndex].cards.push(card);key='hand:'+handIndex+':'+(this.hands[handIndex].cards.length-1)}this.animatedCards.add(key);this.render('קלף נמשך…');await new Promise(r=>setTimeout(r,980));this.animatedCards.delete(key);this.countRevealedCard(card);if(target==='dealer'&&this.dealer.length>1){const v=this.value(this.dealer);this.render(v.total>21?'הדילר עבר 21.':'סכום הדילר התעדכן ל־'+v.total+'.')}else{this.render('הקלף נפתח.')}return card};
BJ.Game.prototype.act = async function(action){if(this.animating||!this.actions().includes(action))return;const rec=this.recommend();this.stats.decisions++;const correct=action===rec;if(correct)this.stats.correct++;let note=correct?'<span class="good">✅ החלטה נכונה.</span>':'<span class="bad">❌ עדיף: '+rec.toUpperCase()+'</span>';const h=this.hands[this.active];this.animating=true;
   if(action==='hit'){await this.dealCard('hand',this.active);const t=this.value(h.cards).total;if(t>21){h.done=true;h.result='Bust';note+='<br><span class="bad">עברת 21 — הפסד אוטומטי.</span>';await this.advance()}else if(t===21){h.done=true;await this.advance()}}
   else if(action==='stand'){h.done=true;await this.advance()}
   else if(action==='double'){h.bet*=2;await this.dealCard('hand',this.active);h.done=true;if(this.value(h.cards).total>21)h.result='Bust';await this.advance()}
   else if(action==='surrender'){h.done=true;h.result='surrender';await this.advance()}
   else if(action==='split'){const a=h.cards[0],b=h.cards[1];this.hands.splice(this.active,1,{cards:[a],bet:h.bet,fromSplit:true,done:false,result:null},{cards:[b],bet:h.bet,fromSplit:true,done:false,result:null});await this.dealCard('hand',this.active);await this.dealCard('hand',this.active+1)}
   this.animating=false;this.render(note)};
BJ.Game.prototype.advance = async function(){for(let i=this.active+1;i<this.hands.length;i++){if(!this.hands[i].done){this.active=i;return}}await this.settle()};
BJ.Game.prototype.settle = async function(){const live=this.hands.some(h=>h.result!=='surrender'&&this.value(h.cards).total<=21);if(live){await this.dealCard('dealer');const dbj=this.dealer.length===2&&this.value(this.dealer).total===21;if(!dbj)while(this.value(this.dealer).total<17)await this.dealCard('dealer')}const dt=this.value(this.dealer).total,dbj=this.dealer.length===2&&dt===21;const texts=[];if(this.insuranceBet>0){if(dbj){this.bank+=this.insuranceBet*2;texts.push('Insurance זכה')}else{this.bank-=this.insuranceBet;texts.push('Insurance הפסיד')}}for(const h of this.hands){const pt=this.value(h.cards).total,pbj=this.isBJ(h);if(h.result==='surrender'){this.bank-=h.bet/2;this.stats.hands++;this.stats.losses++;h.result='Surrender';texts.push('Surrender');continue}if(pt>21||h.result==='Bust'){this.bank-=h.bet;this.stats.hands++;this.stats.losses++;this.stats.busts++;h.result='Bust';texts.push('Bust');continue}if(dbj){if(pbj){this.stats.hands++;this.stats.pushes++;h.result='Push'}else{this.bank-=h.bet;this.stats.hands++;this.stats.losses++;h.result='Dealer Blackjack'}texts.push(h.result);continue}if(pbj){this.bank+=h.bet*1.5;this.stats.hands++;this.stats.wins++;this.stats.blackjacks++;h.result='Blackjack'}else if(dt>21||pt>dt){this.bank+=h.bet;this.stats.hands++;this.stats.wins++;h.result='Win'}else if(pt<dt){this.bank-=h.bet;this.stats.hands++;this.stats.losses++;h.result='Loss'}else{this.stats.hands++;this.stats.pushes++;h.result='Push'}texts.push(h.result)}this.roundActive=false;this.addHistory(texts.join(' • '));this.render('הסיבוב הסתיים.')};
BJ.Game.prototype.takeInsurance = function(){if(!this.insurancePending)return;this.insuranceBet=this.hands[0].bet/2;this.insurancePending=false;this.render('Insurance נלקח.')};
BJ.Game.prototype.declineInsurance = function(){if(!this.insurancePending)return;this.insurancePending=false;this.render('ממשיכים ללא Insurance.')};
})(window.BJ);