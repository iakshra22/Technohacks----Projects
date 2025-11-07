const BANK = {
  easy: [
    {q:"HTML stands for?", a:["Hyper Text Markup Language","HighText Machine Language","Hyperlink Markup Language","Hyper Text Multiple Language"], correct:0},
    {q:"Which tag makes a line break?", a:["<br>","<lb>","<break>","<newline>"], correct:0},
    {q:"CSS stands for?", a:["Cascading Style Sheets","Creative Style Syntax","Colorful Style System","Computer Style Setup"], correct:0},
    {q:"Which tag adds a link?", a:["<a>","<link>","<href>","<url>"], correct:0},
    {q:"Which attribute sets image source?", a:["src","href","link","source"], correct:0},
    {q:"Which tag holds page title?", a:["<title>","<head>","<meta>","<header>"], correct:0},
    {q:"Which tag creates ordered list?", a:["<ol>","<ul>","<li>","<dl>"], correct:0},
    {q:"Which tag is for table row?", a:["<tr>","<td>","<th>","<table>"], correct:0},
    {q:"Which input type hides characters?", a:["password","text","email","hidden"], correct:0},
    {q:"Which attribute provides alternative text for images?", a:["alt","title","desc","label"], correct:0},
    {q:"Which tag is used to include JavaScript?", a:["<script>","<js>","<code>","<link>"], correct:0},
    {q:"Which tag groups content as a paragraph?", a:["<p>","<div>","<span>","<section>"], correct:0}
  ],
  medium: [
    {q:"Which symbol starts a single-line comment in JS?", a:["//","/*","#","<!--"], correct:0},
    {q:"Which CSS property controls text color?", a:["color","font-color","text-color","fg"], correct:0},
    {q:"Which method converts a JS object to JSON string?", a:["JSON.stringify()","JSON.parse()","toString()","Object.toJSON()"], correct:0},
    {q:"Which HTML element is semantic for navigation?", a:["<nav>","<menu>","<section>","<div>"], correct:0},
    {q:"Which CSS unit is relative to root font-size?", a:["rem","em","px","%"], correct:0},
    {q:"Which HTTP method is used to fetch data?", a:["GET","POST","DELETE","PUT"], correct:0},
    {q:"Which JS function schedules a callback after delay?", a:["setTimeout","setInterval","requestAnimationFrame","delay"], correct:0},
    {q:"Which tag is used for responsive images?", a:["<picture>","<img>","<source>","<figure>"], correct:0}
  ],
  hard: [
    {q:"Which array method returns a new array with results of calling a function?", a:["map()","forEach()","reduce()","filter()"], correct:0},
    {q:"Which is NOT a primitive in JS?", a:["Object","String","Number","Boolean"], correct:0},
    {q:"Which CSS property creates stacking context?", a:["z-index","stack","order","layer"], correct:0},
    {q:"Which HTTP status code means Not Found?", a:["404","200","500","301"], correct:0},
    {q:"Which JS keyword creates a block-scoped variable?", a:["let","var","const","function"], correct:0},
    {q:"Which array method reduces to single value?", a:["reduce()","map()","filter()","slice()"], correct:0}
  ]
};

const DIFFICULTY_COUNTS = { easy:12, medium:8, hard:6 };
const DIFFICULTY_TIME = { easy:15, medium:12, hard:10 };


let state = {
  name:'',
  difficulty:'easy',
  questions:[],
  index:0,
  score:0,
  timer:null,
  timeLeft:0,
  confettiTimer:null
};

const startPanel = document.getElementById('start');
const quizPanel = document.getElementById('quiz');
const resultPanel = document.getElementById('result');
const startBtn = document.getElementById('startBtn');
const howBtn = document.getElementById('howBtn');
const nameInput = document.getElementById('name');
const diffSelect = document.getElementById('difficulty');
const qcount = document.getElementById('qcount');
const tvalue = document.getElementById('tvalue');
const progressBar = document.getElementById('progressBar');
const questionEl = document.getElementById('question');
const answersEl = document.getElementById('answers');
const nextBtn = document.getElementById('nextBtn');
const feedbackEl = document.getElementById('feedback');
const scoreText = document.getElementById('scoreText');
const finalFeedback = document.getElementById('finalFeedback');
const leaderboardList = document.getElementById('leaderboardList');
const restartBtn = document.getElementById('restartBtn');
const backBtn = document.getElementById('backBtn');


const confettiCanvas = document.getElementById('confetti');
const ctx = confettiCanvas.getContext('2d');
let confettiPieces = [];

function resizeCanvas(){confettiCanvas.width = window.innerWidth;confettiCanvas.height = window.innerHeight}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function show(panel){document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));panel.classList.add('active')}
function shuffle(a){return a.slice().sort(()=>Math.random()-0.5)}
function pickQuestions(bank, count){
  const pool = shuffle(bank);
  return pool.slice(0, Math.min(count,pool.length));
}

startBtn.addEventListener('click', ()=>{
  const name = nameInput.value.trim();
  if(!name){alert('Please enter your name');nameInput.focus();return}
  state.name = name;state.difficulty = diffSelect.value;
 
  const needed = DIFFICULTY_COUNTS[state.difficulty];

  const bank = BANK[state.difficulty] || [];
  state.questions = pickQuestions(bank, needed).map(q=>({...q}));

  state.questions.forEach(q=>{
    const pairs = q.a.map((text,idx)=>({text,idx}));
    const shuffled = shuffle(pairs);
    q.a = shuffled.map(s=>s.text);
    q.correct = shuffled.findIndex(s=>s.idx===q.correct);
  });
  state.index = 0;state.score = 0;
  
  state.timeLeft = DIFFICULTY_TIME[state.difficulty] || 10;
  show(quizPanel);
  renderQuestion();
});

howBtn.addEventListener('click', ()=>{
  alert('Choose a difficulty and press Start. You have limited seconds per question. Select the correct answer and press Next. Leaderboard saves top 5 locally.');
});

nextBtn.addEventListener('click', ()=>{

  state.index++;
  if(state.index < state.questions.length){
    renderQuestion();
  } else {
    endQuiz();
  }
});

restartBtn.addEventListener('click', ()=>{

  state.index = 0;state.score = 0;
  state.questions = pickQuestions(BANK[state.difficulty], DIFFICULTY_COUNTS[state.difficulty]).map(q=>({...q}));
  state.questions.forEach(q=>{const pairs=q.a.map((t,i)=>({t,i}));const s=shuffle(pairs);q.a=s.map(x=>x.t);q.correct=s.findIndex(x=>x.i===q.correct)});
  show(quizPanel);renderQuestion();
});

backBtn.addEventListener('click', ()=>{show(startPanel)});


function renderQuestion(){
  clearTimers();
  const cur = state.questions[state.index];
  qcount.textContent = `Question ${state.index+1} / ${state.questions.length}`;
  questionEl.textContent = cur.q;

  answersEl.innerHTML = '';
  cur.a.forEach((ans,i)=>{
    const btn = document.createElement('button');btn.className='answer';btn.setAttribute('role','listitem');btn.textContent=ans;
    btn.addEventListener('click', ()=>onAnswer(btn,i));answersEl.appendChild(btn);
  });

  feedbackEl.textContent='';nextBtn.classList.add('hide');nextBtn.classList.remove('show');

  const prog = ((state.index)/state.questions.length)*100;document.getElementById('progressBar').style.width = prog+'%';

  state.timeLeft = DIFFICULTY_TIME[state.difficulty] || 10;updateTimerDisplay();
  state.timer = setInterval(()=>{
    state.timeLeft--;updateTimerDisplay();
    if(state.timeLeft<=0){clearInterval(state.timer);lockAnswers();nextBtn.classList.remove('hide');nextBtn.classList.add('show');}
  },1000);
}

function updateTimerDisplay(){tvalue.textContent = state.timeLeft}

function onAnswer(button, chosenIndex){

  lockAnswers();
  clearInterval(state.timer);
  const cur = state.questions[state.index];
  const correctIndex = cur.correct;
  
  Array.from(answersEl.children).forEach((btn,idx)=>{
    btn.disabled = true;btn.classList.remove('correct','wrong');
    if(idx===correctIndex) btn.classList.add('correct');
    if(idx===chosenIndex && idx!==correctIndex) btn.classList.add('wrong');
  });
  
  if(chosenIndex===correctIndex) { state.score++; feedbackEl.textContent='Correct ✅' }
  else { feedbackEl.textContent='Wrong ❌' }
  nextBtn.classList.remove('hide');nextBtn.classList.add('show');
}

function lockAnswers(){Array.from(answersEl.children).forEach(b=>{b.disabled=true})}

function clearTimers(){ if(state.timer){clearInterval(state.timer);state.timer=null} if(state.confettiTimer){clearInterval(state.confettiTimer);state.confettiTimer=null;clearConfetti()} }

function endQuiz(){ clearTimers(); show(resultPanel);
 
  document.getElementById('progressBar').style.width = '100%';
  scoreText.textContent = `${state.name}, your score: ${state.score} / ${state.questions.length}`;
  const pct = Math.round((state.score/state.questions.length)*100);
  if(pct>=80) finalFeedback.textContent = '🌟 Excellent Work!';
  else if(pct>=50) finalFeedback.textContent = '👍 Good job!';
  else finalFeedback.textContent = '💪 Keep practising!';
  saveLeaderboard({name:state.name,score:pct});
  renderLeaderboard();
  if(pct>=50) startConfetti();
}

function saveLeaderboard(entry){
  const raw = localStorage.getItem('quiz_leaderboard_v1');
  const list = raw?JSON.parse(raw):[];
  list.push(entry);
  list.sort((a,b)=>b.score-a.score);
  localStorage.setItem('quiz_leaderboard_v1', JSON.stringify(list.slice(0,5)));
}
function renderLeaderboard(){
  const raw = localStorage.getItem('quiz_leaderboard_v1');
  const list = raw?JSON.parse(raw):[];leaderboardList.innerHTML='';
  if(list.length===0){leaderboardList.innerHTML='<li class="small-muted">No records yet</li>';return}
  list.forEach((e,i)=>{
    const li = document.createElement('li');li.textContent = `${i+1}. ${e.name} — ${e.score}%`;leaderboardList.appendChild(li);
  });
}

function startConfetti(){
  confettiPieces = [];
  const count = Math.min(250, Math.max(60, state.questions.length * 20));
  for(let i=0;i<count;i++){
    confettiPieces.push({x:Math.random()*confettiCanvas.width,y:Math.random()*-confettiCanvas.height*2,r:Math.random()*6+2,d:Math.random()*3+2,tilt:Math.random()*10-5,color:`hsl(${Math.random()*360},80%,60%)`,ySpeed:Math.random()*3+2,xSpeed:Math.random()*1-0.5})
  }
  if(state.confettiTimer) clearInterval(state.confettiTimer);
  state.confettiTimer = setInterval(()=>{
    drawConfetti();
  },20);

  setTimeout(()=>{ if(state.confettiTimer){clearInterval(state.confettiTimer);state.confettiTimer=null;clearConfetti()} },4500);
}
function drawConfetti(){
  ctx.clearRect(0,0,confettiCanvas.width,confettiCanvas.height);
  confettiPieces.forEach(p=>{
    ctx.beginPath();ctx.ellipse(p.x,p.y,p.r,p.r/1.6, p.tilt,0,Math.PI*2);ctx.fillStyle=p.color;ctx.fill();
    p.y += p.ySpeed; p.x += p.xSpeed; p.tilt += 0.02;
    if(p.y>confettiCanvas.height+10){p.y=-10; p.x=Math.random()*confettiCanvas.width}
  });
}
function clearConfetti(){ ctx.clearRect(0,0,confettiCanvas.width,confettiCanvas.height); confettiPieces=[] }

(function init(){ renderLeaderboard(); show(startPanel); })();

