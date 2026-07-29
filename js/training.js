(function(BJ){
'use strict';

const ALL_FILTERS=Object.freeze(['double','split','surrender','soft','hard']);
const SPLIT_SEQUENCE=Object.freeze(['A','2','3','4','5','6','7','8','9','10']);

BJ.Game.prototype.setPlayMode=function(mode,filters=[]){
  this.playMode=mode==='trainer'?'trainer':'game';
  this.trainingFilters=this.playMode==='trainer'?[...new Set(filters.filter(x=>ALL_FILTERS.includes(x)))]:[];
  this.forcedDeal=[];
  this.splitTrainingIndex=0;
};

BJ.Game.prototype.trainingCategoryMatch=function(playerCards,dealerCard,filters){
  const hand={cards:playerCards,bet:25,fromSplit:false,done:false,result:null};
  const c=this.classifyHand(hand);
  const dealer=this.pairRank(dealerCard);
  return filters.some(filter=>{
    if(filter==='split')return c.type==='pair';
    if(filter==='soft')return c.type==='soft';
    if(filter==='hard')return c.type==='hard';
    if(filter==='double')return c.type==='soft'?(c.total>=13&&c.total<=18):(c.type!=='pair'&&c.total>=9&&c.total<=11);
    if(filter==='surrender'){
      const strong=['9','10','A'].includes(dealer);
      if(!strong)return false;
      return (c.type==='hard'&&c.total>=14&&c.total<=17)||(c.type==='pair'&&c.pairRank==='8')||(c.type==='soft'&&(c.total===15||c.total===16));
    }
    return false;
  });
};

/**
 * Split-only Trainer uses a deterministic player sequence:
 * A,A -> 2,2 -> ... -> 10,10 -> repeat.
 * Only the dealer up-card is random. Other Trainer filters retain the
 * existing random category-based deal generation.
 */
BJ.Game.prototype.isSplitOnlyTrainer=function(){
  return this.playMode==='trainer'&&
    Array.isArray(this.trainingFilters)&&
    this.trainingFilters.length===1&&
    this.trainingFilters[0]==='split';
};

BJ.Game.prototype.findCardIndexesByExactRank=function(rank,count){
  const indexes=[];
  for(let i=0;i<this.shoe.length&&indexes.length<count;i++){
    if(this.rank(this.shoe[i])===rank)indexes.push(i);
  }
  return indexes;
};

BJ.Game.prototype.buildSequentialSplitDeal=function(){
  if(this.shoe.length<3)return null;
  const sequenceIndex=Number.isInteger(this.splitTrainingIndex)?this.splitTrainingIndex:0;
  const rank=SPLIT_SEQUENCE[sequenceIndex%SPLIT_SEQUENCE.length];
  const pairIndexes=this.findCardIndexesByExactRank(rank,2);

  // This is unlikely with a multi-deck shoe, but a fresh shoe guarantees
  // the requested pair while preserving the fixed sequence.
  if(pairIndexes.length<2){
    this.makeShoe();
    const refreshed=this.findCardIndexesByExactRank(rank,2);
    if(refreshed.length<2)return null;
    pairIndexes.splice(0,pairIndexes.length,...refreshed);
    if(BJ.showShuffleNotice)BJ.showShuffleNotice();
  }

  const playerOne=this.shoe[pairIndexes[0]];
  const playerTwo=this.shoe[pairIndexes[1]];
  for(const index of [...pairIndexes].sort((a,b)=>b-a))this.shoe.splice(index,1);

  if(!this.shoe.length)return null;
  const dealerIndex=Math.floor(Math.random()*this.shoe.length);
  const dealer=this.shoe.splice(dealerIndex,1)[0];

  this.forcedDeal=[playerOne,dealer,playerTwo];
  this.splitTrainingIndex=(sequenceIndex+1)%SPLIT_SEQUENCE.length;
  return {player:[playerOne,playerTwo],dealer,filters:['split'],pairRank:rank};
};

BJ.Game.prototype.buildTrainingDeal=function(){
  if(this.isSplitOnlyTrainer())return this.buildSequentialSplitDeal();
  const filters=this.trainingFilters&&this.trainingFilters.length?this.trainingFilters:ALL_FILTERS;
  if(this.shoe.length<3)return null;
  const maxAttempts=Math.min(12000,this.shoe.length*this.shoe.length);
  for(let attempt=0;attempt<maxAttempts;attempt++){
    const i=Math.floor(Math.random()*this.shoe.length);
    let j=Math.floor(Math.random()*this.shoe.length);
    let k=Math.floor(Math.random()*this.shoe.length);
    if(j===i||k===i||k===j)continue;
    const p1=this.shoe[i],dealer=this.shoe[j],p2=this.shoe[k];
    if(!this.trainingCategoryMatch([p1,p2],dealer,filters))continue;
    const picked=[i,j,k].sort((a,b)=>b-a);
    const cardsByIndex=new Map([[i,p1],[j,dealer],[k,p2]]);
    for(const index of picked)this.shoe.splice(index,1);
    this.forcedDeal=[cardsByIndex.get(i),cardsByIndex.get(j),cardsByIndex.get(k)];
    return {player:[p1,p2],dealer,filters:[...filters]};
  }
  return null;
};

BJ.Game.prototype.prepareOpeningDeal=function(){
  this.forcedDeal=[];
  if(this.playMode!=='trainer')return true;

  // First try to build a matching opening deal from the current shoe.
  let result=this.buildTrainingDeal();
  if(result)return true;

  // If the current shoe no longer contains a valid combination for the
  // selected Trainer filter, automatically start a fresh shoe and retry.
  // The bank, statistics, history and Split sequence position are preserved.
  this.makeShoe();
  if(BJ.showShuffleNotice)BJ.showShuffleNotice();
  result=this.buildTrainingDeal();
  return Boolean(result);
};

BJ.Game.prototype.trainingLabel=function(){
  if(this.playMode!=='trainer')return 'Game';
  const labels={double:'Double',split:'Split',surrender:'Surrender',soft:'Soft',hard:'Hard'};
  return 'Trainer: '+(this.trainingFilters||[]).map(x=>labels[x]||x).join(' + ');
};

})(window.BJ);
