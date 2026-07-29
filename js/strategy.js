(function(BJ){
'use strict';

/**
 * BASIC STRATEGY DATA — project rule profile
 * ------------------------------------------
 * 5 decks, ENHC/no-hole-card, dealer stands on soft 17, DAS, up to 4 hands.
 * Double is allowed on the first two cards. The project currently offers a
 * late-surrender-style option as configured below.
 *
 * Action codes:
 * H  = Hit
 * S  = Stand
 * D  = Double if available, otherwise Hit
 * DS = Double if available, otherwise Stand
 * P  = Split if available; otherwise play the cards as an ordinary hand
 * R  = Surrender if available; otherwise use the underlying table action
 */

const DEALER_COLUMNS = Object.freeze(['2','3','4','5','6','7','8','9','10','A']);
const row = values => Object.freeze(Object.fromEntries(DEALER_COLUMNS.map((key,index)=>[key,values[index]])));

const HARD = Object.freeze({
  '5':  row(['H','H','H','H','H','H','H','H','H','H']),
  '6':  row(['H','H','H','H','H','H','H','H','H','H']),
  '7':  row(['H','H','H','H','H','H','H','H','H','H']),
  '8':  row(['H','H','H','H','H','H','H','H','H','H']),
  '9':  row(['H','D','D','D','D','H','H','H','H','H']),
  '10': row(['D','D','D','D','D','D','D','D','H','H']),
  '11': row(['D','D','D','D','D','D','D','D','H','H']),
  '12': row(['H','H','S','S','S','H','H','H','H','H']),
  '13': row(['S','S','S','S','S','H','H','H','H','H']),
  '14': row(['S','S','S','S','S','H','H','H','H','H']),
  '15': row(['S','S','S','S','S','H','H','H','H','H']),
  '16': row(['S','S','S','S','S','H','H','H','H','H']),
  '17': row(['S','S','S','S','S','S','S','S','S','S']),
  '18': row(['S','S','S','S','S','S','S','S','S','S']),
  '19': row(['S','S','S','S','S','S','S','S','S','S']),
  '20': row(['S','S','S','S','S','S','S','S','S','S']),
  '21': row(['S','S','S','S','S','S','S','S','S','S'])
});

const SOFT = Object.freeze({
  // Keys are the soft total, e.g. A,4 = soft 15.
  '13': row(['H','H','H','D','D','H','H','H','H','H']), // A,2
  '14': row(['H','H','H','D','D','H','H','H','H','H']), // A,3
  '15': row(['H','H','D','D','D','H','H','H','H','H']), // A,4
  '16': row(['H','H','D','D','D','H','H','H','H','H']), // A,5
  '17': row(['H','D','D','D','D','H','H','H','H','H']), // A,6
  '18': row(['S','DS','DS','DS','DS','S','S','H','H','H']), // A,7
  '19': row(['S','S','S','S','S','S','S','S','S','S']), // A,8
  '20': row(['S','S','S','S','S','S','S','S','S','S']), // A,9
  '21': row(['S','S','S','S','S','S','S','S','S','S'])
});

const PAIRS = Object.freeze({
  'A':  row(['P','P','P','P','P','P','P','P','P','H']),
  '10': row(['S','S','S','S','S','S','S','S','S','S']),
  '9':  row(['P','P','P','P','P','S','P','P','S','S']),
  '8':  row(['P','P','P','P','P','P','P','P','H','H']),
  '7':  row(['P','P','P','P','P','P','H','H','H','H']),
  '6':  row(['P','P','P','P','P','H','H','H','H','H']),
  '5':  row(['D','D','D','D','D','D','D','D','H','H']),
  '4':  row(['H','H','H','P','P','H','H','H','H','H']),
  '3':  row(['P','P','P','P','P','P','H','H','H','H']),
  '2':  row(['P','P','P','P','P','P','H','H','H','H'])
});

// Surrender overlay for the rule option currently exposed by the app.
// It is deliberately separated from HARD/SOFT/PAIRS so soft hands can never
// be mistaken for hard totals (the former A,4 vs 10 bug).
const SURRENDER = Object.freeze({
  hard: Object.freeze({
    '15': Object.freeze(['10']),
    '16': Object.freeze(['9','10','A'])
  }),
  pairs: Object.freeze({
    // In ENHC, 8,8 is not split against 10 or A. If surrender is offered,
    // surrender takes priority over playing the hard 16 fallback.
    '8': Object.freeze(['10','A'])
  })
});

BJ.STRATEGY = Object.freeze({
  profile: Object.freeze({
    decks: 5,
    dealerSoft17: 'stand',
    holeCard: 'ENHC',
    doubleAfterSplit: true,
    maxHands: 4,
    surrender: 'configured-late-style'
  }),
  dealerColumns: DEALER_COLUMNS,
  hard: HARD,
  soft: SOFT,
  pairs: PAIRS,
  surrender: SURRENDER
});

function dealerKey(game){
  const rank=game.pairRank(game.dealer[0]);
  return rank==='A'?'A':rank==='10'?'10':String(rank);
}

function canUse(game, action){
  return game.actions().includes(action);
}

function normalHandAction(game, hand, dealer){
  const classification=game.classifyHand(hand);
  const table=classification.type==='soft'?SOFT:HARD;
  return (table[String(classification.total)]||HARD['5'])[dealer]||'H';
}

function resolveCode(game, hand, dealer, code){
  switch(code){
    case 'S': return 'stand';
    case 'D': return canUse(game,'double')?'double':'hit';
    case 'DS': return canUse(game,'double')?'double':'stand';
    case 'P':
      if(canUse(game,'split'))return 'split';
      return resolveCode(game,hand,dealer,normalHandAction(game,hand,dealer));
    case 'R':
      if(canUse(game,'surrender'))return 'surrender';
      return resolveCode(game,hand,dealer,normalHandAction(game,hand,dealer));
    case 'H':
    default: return 'hit';
  }
}

function surrenderCode(game, hand, dealer){
  if(!canUse(game,'surrender')||hand.cards.length!==2||hand.fromSplit)return null;
  const classification=game.classifyHand(hand);
  if(classification.type==='soft')return null;

  if(classification.type==='pair'){
    const pair=classification.pairRank;
    if((SURRENDER.pairs[pair]||[]).includes(dealer))return 'R';
  }
  if((SURRENDER.hard[String(classification.total)]||[]).includes(dealer))return 'R';
  return null;
}

BJ.Game.prototype.actions = function(){
  if(!this.roundActive||this.insurancePending||this.animating)return[];
  const hand=this.hands[this.active];
  const total=this.value(hand.cards).total;
  let actions=['hit','stand'];
  if(hand.cards.length===2&&this.bank>=hand.bet)actions.push('double');
  if(hand.cards.length===2&&this.pairRank(hand.cards[0])===this.pairRank(hand.cards[1])&&this.hands.length<4&&this.bank>=hand.bet)actions.push('split');
  if(this.hands.length===1&&hand.cards.length===2&&!hand.fromSplit)actions.push('surrender');
  if(total>=21)actions=['stand'];
  return actions;
};

BJ.Game.prototype.recommend = function(){
  const hand=this.hands[this.active];
  if(!hand||!hand.cards||hand.cards.length<2||!this.dealer.length)return'hit';

  const dealer=dealerKey(this);
  const surrender=surrenderCode(this,hand,dealer);
  if(surrender)return resolveCode(this,hand,dealer,surrender);

  const classification=this.classifyHand(hand);
  if(classification.type==='pair'){
    const pair=classification.pairRank;
    const pairCode=(PAIRS[pair]||{})[dealer];
    if(pairCode)return resolveCode(this,hand,dealer,pairCode);
  }

  return resolveCode(this,hand,dealer,normalHandAction(this,hand,dealer));
};

})(window.BJ);
