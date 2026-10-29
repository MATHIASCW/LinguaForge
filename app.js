(function(){
"use strict";
var LANGS={fr:"Français",en:"English",es:"Español",ja:"日本語",zh:"中文",ru:"Русский"};
var ORDER=["fr","en","es","ja","zh","ru"];
var HUE={fr:228,en:8,es:38,ja:335,zh:152,ru:195};
var UI=window.LinguaForgeI18n;
function t(key){return(UI[S.ui]&&UI[S.ui][key])||UI.en[key]||key;}
function applyTranslations(){
  document.documentElement.lang=S.ui;
  document.querySelectorAll("[data-i18n]").forEach(function(el){el.textContent=t(el.getAttribute("data-i18n"));});
  document.querySelectorAll("[data-i18n-aria]").forEach(function(el){el.setAttribute("aria-label",t(el.getAttribute("data-i18n-aria")));});
  $("swap").title=t("swap");$("swap").setAttribute("aria-label",t("swap"));
  $("uiLanguage").value=S.ui;
}
var WORDS=window.LinguaForgeVocabulary;
var BYID={};WORDS.forEach(function(w){BYID[w.id]=w;});
var INT=[0,1,2,4,8,16,32];

function forms(c,l){
  if(l==="ja")return{main:c.ja,read:c.jr,acc:[c.ja,c.jr]};
  if(l==="zh")return{main:c.zh,read:c.zp,acc:[c.zh,c.zp]};
  if(l==="ru")return{main:c.ru,read:c.rr,acc:[c.ru,c.rr]};
  var acc=[c[l]];
  if(l==="en"&&/^to /.test(c.en))acc.push(c.en.slice(3));
  return{main:c[l],read:"",acc:acc};
}
function norm(s){
  return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[\s'’`\-.,!?¿¡]/g,"");
}
function lev(a,b){
  if(a===b)return 0;
  var m=a.length,n=b.length,i,j;
  if(!m)return n; if(!n)return m;
  var prev=[],cur=[];
  for(j=0;j<=n;j++)prev[j]=j;
  for(i=1;i<=m;i++){
    cur[0]=i;
    for(j=1;j<=n;j++){
      var cost=a[i-1]===b[j-1]?0:1;
      cur[j]=Math.min(prev[j]+1,cur[j-1]+1,prev[j-1]+cost);
    }
    var t=prev;prev=cur;cur=t;
  }
  return prev[n];
}
function tol(n){return n<=3?0:(n<=6?1:2);}
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;var t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}
function pad(n){return(n<10?"0":"")+n;}
function dk(d){return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());}
function parseKey(k){var p=k.split("-");return new Date(+p[0],+p[1]-1,+p[2]);}
function addDays(d,n){var x=new Date(d.getFullYear(),d.getMonth(),d.getDate());x.setDate(x.getDate()+n);return x;}

/* ---------- state ---------- */
var STORE="mots-monstres-v1";
var S={from:"en",to:"fr",ui:"en",cards:{},log:{},xp:0,best:0,opt:{auto:true,read:true,tol:true,colorblind:false}};
try{var raw=localStorage.getItem(STORE);if(raw){var o=JSON.parse(raw);for(var k in o){S[k]=o[k];}S.opt=Object.assign({auto:true,read:true,tol:true,colorblind:false},o.opt||{});}}catch(e){}
S.ui=S.ui==="fr"?"fr":"en";
function save(){try{localStorage.setItem(STORE,JSON.stringify(S));}catch(e){}}
function pairKey(){return S.from+">"+S.to;}
function cardKey(id){return pairKey()+"|"+id;}
function $(id){return document.getElementById(id);}

/* ---------- monster rendering ---------- */
function monster(id,lang){
  var r=rng(id*7919+ORDER.indexOf(lang)*131+17);
  var n=9,P=[],i;
  for(i=0;i<n;i++){var a=i/n*Math.PI*2+r()*0.2,rad=58+r()*26;P.push([100+Math.cos(a)*rad*1.08,104+Math.sin(a)*rad*0.92]);}
  function mid(p,q){return[(p[0]+q[0])/2,(p[1]+q[1])/2];}
  var m0=mid(P[n-1],P[0]);
  var d="M"+m0[0].toFixed(1)+" "+m0[1].toFixed(1);
  for(i=0;i<n;i++){var q=P[i],m=mid(P[i],P[(i+1)%n]);d+="Q"+q[0].toFixed(1)+" "+q[1].toFixed(1)+" "+m[0].toFixed(1)+" "+m[1].toFixed(1);}
  d+="Z";
  var hn=2+Math.floor(r()*2),horns="";
  for(i=0;i<hn;i++){var x=hn===2?(i?132:68):70+i*30,h=24+r()*18,tip=x+(r()*10-5);horns+='<path d="M'+(x-9)+' 64 L'+tip.toFixed(1)+' '+(60-h).toFixed(1)+' L'+(x+9)+' 64Z" fill="var(--mon-dark)"/>';}
  var ek=1+Math.floor(r()*3),eyes="";
  for(i=0;i<ek;i++){
    var ex=ek===1?100:100+(i-(ek-1)/2)*(ek===2?40:32),ey=92+(r()*6-3),er=ek===1?17:12,px=r()*4-2;
    eyes+='<circle cx="'+ex+'" cy="'+ey.toFixed(1)+'" r="'+er+'" fill="#fff"/><circle cx="'+(ex+px).toFixed(1)+'" cy="'+(ey+2).toFixed(1)+'" r="'+(er*0.5)+'" fill="#1b1b24"/>';
  }
  var spots="";
  for(i=0;i<3;i++){spots+='<circle cx="'+(60+r()*80).toFixed(0)+'" cy="'+(130+r()*28).toFixed(0)+'" r="'+(5+r()*6).toFixed(0)+'" fill="var(--mon-dark)" opacity=".28"/>';}
  var mouth='<path d="M72 124 Q100 152 128 124 Q100 132 72 124Z" fill="#1b1b24"/><path d="M82 127 l6 9 l6 -8 z M106 128 l6 8 l6 -9 z" fill="#fff"/>';
  return '<svg viewBox="0 0 200 200" aria-hidden="true">'+horns+'<path d="'+d+'" fill="var(--mon)"/>'+spots+eyes+mouth+'</svg>';
}

/* ---------- battle ---------- */
var F=null;

function dueCounts(){
  var today=dk(new Date()),due=0,fresh=0;
  WORDS.forEach(function(c){var cd=S.cards[cardKey(c.id)];if(!cd)fresh++;else if(cd.due<=today)due++;});
  return{due:due,fresh:fresh};
}
function buildQueue(free){
  var today=dk(new Date()),due=[],fresh=[];
  WORDS.forEach(function(c){var cd=S.cards[cardKey(c.id)];if(!cd)fresh.push(c.id);else if(cd.due<=today)due.push(c.id);});
  if(free)return shuffle(WORDS.map(function(c){return c.id;}));
  var q=shuffle(due);
  fresh=shuffle(fresh);
  while(fresh.length)q.push(fresh.shift());
  return q;
}
function levelOf(xp){return Math.floor(xp/100)+1;}
function renderStats(){
  var h="",hearts=F?F.hearts:3;
  for(var i=0;i<3;i++)h+='<span class="'+(i<hearts?"":"lost")+'">'+(i<hearts?"♥":"♡")+"</span>";
  $("hearts").innerHTML=h;
  $("hearts").setAttribute("aria-label",hearts+" "+t("lives"));
  $("streak").textContent=F?F.streak:0;
  $("lvl").textContent=levelOf(S.xp);
  $("xp").textContent=S.xp+" XP";
}
function renderIdle(){
  F=null;renderStats();
  var c=dueCounts();
  var none=c.due===0&&c.fresh===0;
  $("fightBody").innerHTML=
    '<div class="center">'+
    '<div class="word" style="font-size:26px">'+(none?t("nothing"):t("approaching"))+'</div>'+
    '<div class="sum"><span class="chip">'+c.due+' '+t("due")+'</span><span class="chip">'+c.fresh+' '+t("newWords")+'</span></div>'+
    '<p class="empty" style="margin:0;max-width:46ch">'+(none?"Come back tomorrow, or train freely without changing your calendar.":t("battleHelp"))+'</p>'+
    '<div class="row" style="justify-content:center">'+
    '<button class="btn" id="goFight" type="button"'+(none?" disabled":"")+'>'+t("start")+'</button>'+
    '<button class="btn ghost" id="goFree" type="button">'+t("free")+'</button></div></div>';
  $("goFight").onclick=function(){startFight(false);};
  $("goFree").onclick=function(){startFight(true);};
}
function startFight(free){
  var q=buildQueue(free);
  if(!q.length){renderIdle();return;}
  F={queue:q,i:0,hearts:3,streak:0,won:0,miss:0,xp:0,free:free,redo:{},locked:false,hint:0,timer:null,sel:-1,sugg:[]};
  $("fightBody").innerHTML=
    '<div class="bar" aria-hidden="true"><i id="prog"></i></div>'+
    '<div class="arena" id="arena">'+
      '<div class="label" id="count"></div>'+
      '<div class="monster" id="mon"></div><div class="hammer" id="hammer" aria-hidden="true">🔨</div><div class="ground"></div>'+
      '<div class="banner"><div class="word" id="word"></div><div class="reading" id="reading"></div></div>'+
    '</div>'+
    '<div class="fx" id="fx" aria-live="polite"></div>'+
    '<form class="ans" id="form" autocomplete="off">'+
      '<input id="inp" type="text" inputmode="text" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Your translation">'+
      '<button class="btn" id="go" type="submit">'+t("attack")+'</button>'+
      '<ul class="sugg" id="sugg" role="listbox" hidden></ul>'+
    '</form>'+
    '<div class="row"><button class="btn ghost" id="hintBtn" type="button">'+t("hint")+'</button><button class="btn ghost" id="stopBtn" type="button">'+t("finish")+'</button><span class="hint" id="hint"></span></div>';
  $("form").onsubmit=function(e){e.preventDefault();submit();};
  $("hintBtn").onclick=giveHint;
  $("stopBtn").onclick=function(){endFight(true);};
  var inp=$("inp");
  inp.oninput=showSuggest;
  inp.onkeydown=function(e){
    var ul=$("sugg");
    if(ul.hidden||!F.sugg.length)return;
    if(e.key==="ArrowDown"){e.preventDefault();F.sel=(F.sel+1)%F.sugg.length;paintSugg();}
    else if(e.key==="ArrowUp"){e.preventDefault();F.sel=(F.sel-1+F.sugg.length)%F.sugg.length;paintSugg();}
    else if(e.key==="Enter"&&F.sel>=0){e.preventDefault();pickSugg(F.sel);}
    else if(e.key==="Escape"){ul.hidden=true;}
  };
  inp.onblur=function(){setTimeout(function(){var u=$("sugg");if(u)u.hidden=true;},120);};
  showMonster();
}
function showMonster(){
  var id=F.queue[F.i],c=BYID[id],f=forms(c,S.from);
  F.locked=false;F.hint=0;
  var mon=$("mon");
  mon.className="monster";
  mon.style.setProperty("--h",HUE[S.from]);
  mon.innerHTML=monster(id,S.from);
  $("word").textContent=f.main;
  $("word").setAttribute("lang",S.from);
  $("reading").textContent=(S.opt.read&&f.read)?f.read:"";
  $("count").textContent=t("monster")+" "+(F.i+1);
  $("prog").style.width="100%";
  $("fx").className="fx";$("fx").textContent="";
  $("hint").textContent="";
  var inp=$("inp");inp.value="";inp.disabled=false;
  $("go").textContent=t("attack");
  $("sugg").hidden=true;
  inp.focus();
  renderStats();
}
function giveHint(){
  if(!F||F.locked)return;
  var c=BYID[F.queue[F.i]],f=forms(c,S.to);
  F.hint=Math.min(F.hint+1,f.main.length-1);
  var main=f.main,h=F.hint;
  var s=main.slice(0,h)+new Array(main.length-h+1).join("·");
  $("hint").textContent=s+"  ("+main.length+" characters)";
  $("inp").focus();
}
function judge(input,c){
  var f=forms(c,S.to),x=norm(input);
  if(!x)return null;
  var raw=input.trim().toLowerCase().normalize("NFC");
  var i,best=99,bestLen=0;
  for(i=0;i<f.acc.length;i++){
    if(f.acc[i].toLowerCase().normalize("NFC")===raw)return"perfect";
  }
  for(i=0;i<f.acc.length;i++){
    var a=norm(f.acc[i]),d=lev(x,a);
    if(d<best){best=d;bestLen=a.length;}
  }
  if(best===0)return"accent";
  if(S.opt.tol&&best<=tol(bestLen)){
    // An exact answer for another card is a real mistake.
    for(var j=0;j<WORDS.length;j++){
      if(WORDS[j].id===c.id)continue;
      var o=forms(WORDS[j],S.to).acc;
      for(var k=0;k<o.length;k++)if(norm(o[k])===x)return"miss";
    }
    return"typo";
  }
  return"miss";
}
function answerText(c){var f=forms(c,S.to);return f.main+(f.read?" ("+f.read+")":"");}
function submit(){
  if(!F)return;
  if(F.locked){advance();return;}
  var inp=$("inp"),val=inp.value;
  if(!norm(val))return;
  var c=BYID[F.queue[F.i]],res=judge(val,c);
  resolve(res,c);
}
function resolve(res,c){
  var today=dk(new Date()),k=cardKey(c.id);
  var cd=S.cards[k]||{box:0,due:today};
  var ok=res!=="miss";
  var fx=$("fx"),mon=$("mon");
  F.locked=true;$("sugg").hidden=true;
  var lg=S.log[today]||(S.log[today]={won:0,miss:0});
  if(ok){
    cd.box=Math.min(cd.box+1,6);
    cd.due=dk(addDays(new Date(),INT[cd.box]));
    F.streak++;F.won++;S.best=Math.max(S.best,F.streak);lg.won++;
    var gain=(res==="perfect"?10:7)-(F.hint?Math.min(F.hint,3):0)+Math.min(F.streak,5);
    F.xp+=gain;S.xp+=gain;
    mon.classList.add("defeated");
    $("arena").classList.remove("smash");void $("arena").offsetWidth;$("arena").classList.add("smash");
    if(res==="perfect"){fx.className="fx good";fx.innerHTML=t("directHit")+" <b>+"+gain+" XP</b>";}
    else if(res==="accent"){fx.className="fx warn";fx.innerHTML=t("accentWarning")+" <b>"+esc(answerText(c))+"</b>";}
    else{fx.className="fx warn";fx.innerHTML=t("typoWarning")+" <b>"+esc(answerText(c))+"</b>";}
    $("inp").disabled=true;
    F.timer=setTimeout(advance,res==="perfect"?850:1700);
  }else{
    cd.box=0;cd.due=today;
    F.streak=0;F.hearts--;F.miss++;lg.miss++;
    mon.classList.add("escape");
    $("arena").classList.remove("shake");void $("arena").offsetWidth;$("arena").classList.add("shake");
    fx.className="fx bad";fx.innerHTML="Missed! The answer was <b>"+esc(answerText(c))+"</b>";
    if(!F.redo[c.id]&&F.hearts>0){F.redo[c.id]=1;F.queue.push(c.id);}
    $("inp").disabled=true;
    $("go").textContent=F.hearts>0?t("next"):t("finish");
    $("go").focus();
  }
  S.cards[k]=cd;save();renderStats();
  $("prog").style.width="100%";
}
function advance(){
  if(!F)return;
  if(F.timer){clearTimeout(F.timer);F.timer=null;}
  if(!F.locked)return;
  F.i++;
  if(F.hearts<=0){endFight(false);}
  else if(F.i>=F.queue.length){F.queue=shuffle(WORDS.map(function(c){return c.id;}));F.i=0;showMonster();}
  else showMonster();
}
function endFight(stopped){
  var f=F;F=null;
  var win=f.hearts>0;
  renderStats();
  $("fightBody").innerHTML=
    '<div class="center">'+
    '<div class="word" style="font-size:28px">'+(win?t("battleComplete"):t("outOfLives"))+'</div>'+
    '<div class="sum"><span class="chip">'+f.won+' '+t("defeated")+'</span><span class="chip">'+f.miss+' '+t("missed")+'</span><span class="chip">+'+f.xp+' XP</span><span class="chip">best streak '+S.best+'</span></div>'+
    '<p class="empty" style="margin:0;max-width:46ch">'+(win?"Successful words are scheduled on the calendar. Missed words return today.":"Missed words return today. Take a breath and try again.")+'</p>'+
    '<div class="row" style="justify-content:center"><button class="btn" id="again" type="button">'+t("newBattle")+'</button><button class="btn ghost" id="toCal" type="button">'+t("openCalendar")+'</button></div></div>';
  $("again").onclick=renderIdle;
  $("toCal").onclick=function(){setTab("cal");};
  renderCal();renderDex();
}

/* ---------- autocomplete ---------- */
function showSuggest(){
  var ul=$("sugg");
  if(!S.opt.auto||!F||F.locked){ul.hidden=true;return;}
  var x=norm($("inp").value);
  if(!x){ul.hidden=true;return;}
  var out=[];
  WORDS.forEach(function(c){
    var f=forms(c,S.to),score=99,i;
    for(i=0;i<f.acc.length;i++){
      var a=norm(f.acc[i]);
      if(a.indexOf(x)===0){score=Math.min(score,0);}
      else if(x.length>=3&&lev(x,a.slice(0,x.length))<=1){score=Math.min(score,1);}
    }
    if(score<99)out.push({s:score,main:f.main,read:f.read});
  });
  out.sort(function(a,b){return a.s-b.s||a.main.length-b.main.length;});
  F.sugg=out.slice(0,5);F.sel=-1;
  if(!F.sugg.length){ul.hidden=true;return;}
  ul.innerHTML=F.sugg.map(function(s,i){return'<li role="option" data-i="'+i+'"><span>'+esc(s.main)+'</span>'+(s.read?'<small>'+esc(s.read)+'</small>':"")+"</li>";}).join("");
  Array.prototype.forEach.call(ul.children,function(li){
    li.onmousedown=function(e){e.preventDefault();pickSugg(+li.getAttribute("data-i"));};
  });
  ul.hidden=false;
}
function paintSugg(){
  Array.prototype.forEach.call($("sugg").children,function(li,i){li.className=i===F.sel?"on":"";});
}
function pickSugg(i){
  var s=F.sugg[i];if(!s)return;
  $("inp").value=s.main;$("sugg").hidden=true;$("inp").focus();
}

/* ---------- calendar ---------- */
var calM=new Date();calM=new Date(calM.getFullYear(),calM.getMonth(),1);
var selDay=null;
function dueMap(){
  var today=dk(new Date()),m={};
  Object.keys(S.cards).forEach(function(k){
    var cd=S.cards[k],d=cd.due<today?today:cd.due;
    (m[d]=m[d]||[]).push(k);
  });
  return m;
}
function renderCal(){
  var today=dk(new Date()),dm=dueMap();
  var c=dueCounts();
  var nDue=(dm[today]||[]).length;
  $("calSummary").textContent=t("today")+": "+nDue+" "+t("wordsDue")+" across all languages, and "+c.fresh+" "+t("newWords")+" for "+LANGS[S.from]+" → "+LANGS[S.to]+".";
  $("monthTitle").textContent=calM.toLocaleDateString(S.ui==="fr"?"fr-FR":"en-US",{month:"long",year:"numeric"});
  var html="";
  ["L","M","M","J","V","S","D"].forEach(function(d){html+='<div class="dow">'+d+"</div>";});
  var off=(calM.getDay()+6)%7,days=new Date(calM.getFullYear(),calM.getMonth()+1,0).getDate(),i;
  for(i=0;i<off;i++)html+='<div class="day out"></div>';
  for(i=1;i<=days;i++){
    var key=calM.getFullYear()+"-"+pad(calM.getMonth()+1)+"-"+pad(i);
    var n=(dm[key]||[]).length,lg=S.log[key];
    var cls="day"+(key===today?" today":"")+(key===selDay?" sel":"");
    html+='<button type="button" class="'+cls+'" data-d="'+key+'"><span class="n">'+i+"</span>"+(n?'<span class="due">'+n+"</span>":"")+(lg&&lg.won+lg.miss>0?'<span class="done"></span>':"")+"</button>";
  }
  $("calGrid").innerHTML=html;
  Array.prototype.forEach.call($("calGrid").querySelectorAll("button.day"),function(b){
    b.onclick=function(){selDay=b.getAttribute("data-d");renderCal();};
  });
  renderDay(dm);
}
function renderDay(dm){
  var el=$("dayDetail");
  if(!selDay){el.innerHTML='<p class="empty" style="margin:12px 0 0">'+(Object.keys(S.cards).length?"Select a day to see the words due.":"Your calendar is empty. Defeat your first monsters: successful words are rescheduled after 1, 2, 4, 8, 16 and 32 days.")+"</p>";return;}
  var d=parseKey(selDay),list=dm[selDay]||[],lg=S.log[selDay];
  var h='<h2 style="margin-top:14px">'+esc(d.toLocaleDateString(S.ui==="fr"?"fr-FR":"en-US",{weekday:"long",day:"numeric",month:"long"}))+"</h2>";
  if(lg&&lg.won+lg.miss>0)h+='<p class="empty" style="margin:0">Battled that day: '+lg.won+" defeated, "+lg.miss+" missed.</p>";
  if(!list.length){h+='<p class="empty" style="margin:6px 0 0">No words scheduled for this day.</p>';}
  else{
    h+='<ul class="list">';
    list.slice(0,60).forEach(function(k){
      var p=k.split("|"),pr=p[0].split(">"),c=BYID[+p[1]];
      if(!c)return;
      h+='<li><span class="pr">'+pr[0].toUpperCase()+" → "+pr[1].toUpperCase()+"</span><b lang=\""+pr[0]+'">'+esc(forms(c,pr[0]).main)+'</b><span class="empty" lang="'+pr[1]+'">'+esc(forms(c,pr[1]).main)+"</span></li>";
    });
    h+="</ul>";
  }
  el.innerHTML=h;
}

/* ---------- bestiary ---------- */
function renderDex(){
  var g="",mastered=0,seen=0;
  WORDS.forEach(function(c){
    var cd=S.cards[cardKey(c.id)],box=cd?cd.box:0;
    if(cd)seen++;
    if(box>=4)mastered++;
    var pips="";for(var i=1;i<=6;i++)pips+='<i class="'+(i<=box?"on":"")+'"></i>';
    g+='<div class="dexc"><span class="w" lang="'+S.from+'">'+esc(forms(c,S.from).main)+'</span><span class="a" lang="'+S.to+'">'+(cd?esc(answerText(c)):"???")+'</span><div class="pips" title="Niveau '+box+' sur 6">'+pips+"</div></div>";
  });
  $("dexGrid").innerHTML=g;
  $("dexSummary").textContent=LANGS[S.from]+" → "+LANGS[S.to]+": "+seen+" "+t("encountered")+" / "+WORDS.length+", "+mastered+" "+t("mastered")+" (level 4+).";
}

/* ---------- navigation and settings ---------- */
function setTab(t){
  ["fight","cal","dex"].forEach(function(n){
    var on=n===t;
    $("v-"+n).hidden=!on;
    $("t-"+n).setAttribute("aria-selected",on?"true":"false");
  });
  if(t==="cal")renderCal();
  if(t==="dex")renderDex();
}
function fillSelects(){
  ["selFrom","selTo"].forEach(function(id){
    $(id).innerHTML=ORDER.map(function(l){return'<option value="'+l+'">'+LANGS[l]+"</option>";}).join("");
  });
  $("selFrom").value=S.from;$("selTo").value=S.to;
}
function pairChanged(){
  if(F&&F.timer)clearTimeout(F.timer);
  save();renderIdle();renderCal();renderDex();
}
$("selFrom").onchange=function(){
  S.from=this.value;
  if(S.to===S.from)S.to=ORDER.filter(function(l){return l!==S.from;})[0];
  fillSelects();pairChanged();
};
$("selTo").onchange=function(){
  S.to=this.value;
  if(S.to===S.from)S.from=ORDER.filter(function(l){return l!==S.to;})[0];
  fillSelects();pairChanged();
};
$("swap").onclick=function(){var t=S.from;S.from=S.to;S.to=t;fillSelects();pairChanged();};
Array.prototype.forEach.call(document.querySelectorAll(".tab"),function(b){b.onclick=function(){setTab(b.getAttribute("data-tab"));};});
$("prevM").onclick=function(){calM=new Date(calM.getFullYear(),calM.getMonth()-1,1);renderCal();};
$("nextM").onclick=function(){calM=new Date(calM.getFullYear(),calM.getMonth()+1,1);renderCal();};
var uiLanguage=$("uiLanguage");
uiLanguage.value=S.ui;
uiLanguage.onchange=function(){
  S.ui=this.value;
  save();
  applyTranslations();
  renderIdle();
  renderCal();
  renderDex();
};
function applyAccessibility(){
  document.documentElement.setAttribute("data-colorblind",S.opt.colorblind?"true":"false");
}
[["oAuto","auto"],["oRead","read"],["oTol","tol"],["oColorblind","colorblind"]].forEach(function(p){
  var el=$(p[0]);el.checked=!!S.opt[p[1]];
  el.onchange=function(){S.opt[p[1]]=el.checked;save();applyAccessibility();if(F&&!F.locked){var f=forms(BYID[F.queue[F.i]],S.from);$("reading").textContent=(S.opt.read&&f.read)?f.read:"";}};
});
var armed=false;
$("reset").onclick=function(){
  if(!armed){armed=true;$("reset").textContent="Confirm reset";$("resetMsg").textContent="This action cannot be undone.";return;}
  S.cards={};S.log={};S.xp=0;S.best=0;armed=false;save();
  $("reset").textContent="Reset progress";$("resetMsg").textContent="Progress reset.";
  selDay=null;renderIdle();renderCal();renderDex();
};

fillSelects();applyTranslations();renderIdle();renderCal();renderDex();
applyAccessibility();
})();
