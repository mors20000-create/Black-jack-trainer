(function(){
'use strict';
const BJ = window.BJ = window.BJ || {};
BJ.$ = id => document.getElementById(id);
let shuffleNoticeTimer = null;
BJ.showShuffleNotice = function(){
  const o=BJ.$('shuffleOverlay');
  if(!o)return;
  clearTimeout(shuffleNoticeTimer);
  o.classList.add('show');
  o.setAttribute('aria-hidden','false');
  shuffleNoticeTimer=setTimeout(()=>{o.classList.remove('show');o.setAttribute('aria-hidden','true')},2200);
};
BJ.Game = class Game {
  constructor(){this.animating=false;this.animatedCards=new Set();this.oddsCache=new Map();this.lastDisplayedOdds=null;this.reset();}
};
})();
