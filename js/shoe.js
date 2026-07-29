(function(BJ){
'use strict';
BJ.Game.prototype.reset = function(){this.playMode=this.playMode||'game';this.trainingFilters=this.trainingFilters||[];this.forcedDeal=[];this.animating=false;this.animatedCards=new Set();this.bank=400;this.sessionStartBank=400;this.stats={rounds:0,hands:0,wins:0,losses:0,pushes:0,blackjacks:0,busts:0,correct:0,decisions:0};this.hands=[];this.dealer=[];this.active=0;this.roundActive=false;this.insurancePending=false;this.insuranceBet=0;this.history=[];this.makeShoe();this.render('לחצי על “חלוקה חדשה” כדי להתחיל.')};
BJ.Game.prototype.makeShoe = function(){this.runningCount=0;const n=Number(BJ.$('decks').value||5),r=['A','2','3','4','5','6','7','8','9','10','J','Q','K'],s=['♠','♥','♦','♣'];this.shoe=[];for(let d=0;d<n;d++)for(const suit of s)for(const rank of r)this.shoe.push(rank+suit);for(let i=this.shoe.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));const t=this.shoe[i];this.shoe[i]=this.shoe[j];this.shoe[j]=t}};
BJ.Game.prototype.draw = function(){if(this.forcedDeal&&this.forcedDeal.length)return this.forcedDeal.shift();if(!this.shoe.length){this.makeShoe();BJ.showShuffleNotice()}return this.shoe.pop()};
BJ.Game.prototype.hiLoValue = function(c){const r=this.rank(c);if(['2','3','4','5','6'].includes(r))return 1;if(['10','J','Q','K','A'].includes(r))return -1;return 0};
BJ.Game.prototype.countRevealedCard = function(c){this.runningCount=(this.runningCount||0)+this.hiLoValue(c)};
BJ.Game.prototype.trueCount = function(){const decksRemaining=Math.max(this.shoe.length/52,0.25);return (this.runningCount||0)/decksRemaining};
BJ.Game.prototype.rank = function(c){return c.slice(0,-1)};
BJ.Game.prototype.pairRank = function(c){const r=this.rank(c);return ['10','J','Q','K'].includes(r)?'10':r};
BJ.Game.prototype.value = function(cards){let total=0,aces=0;for(const c of cards){const r=this.rank(c);if(r==='A'){total+=11;aces++}else if(['J','Q','K'].includes(r))total+=10;else total+=Number(r)}while(total>21&&aces>0){total-=10;aces--}const soft=aces>0;return{total,soft}};
BJ.Game.prototype.isBJ = function(h){return h.cards.length===2&&this.value(h.cards).total===21&&!h.fromSplit};
})(window.BJ);