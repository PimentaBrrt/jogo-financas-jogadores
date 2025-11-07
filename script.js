const MAX_PLAYERS = 4;
const MIN_PLAYERS = 2;
const STARTING_HAND = 5;
const TOTAL_CARDS = 40;

const playersModal = document.getElementById('playersModal');
const numPlayersInput = document.getElementById('numPlayers');
const playersListDiv = document.getElementById('playersList');
const savePlayersBtn = document.getElementById('savePlayersBtn');
const playersBtn = document.getElementById('playersBtn');
const restartBtn = document.getElementById('restartBtn');
const monteEl = document.getElementById('monte');
const handEl = document.getElementById('hand');
const playerNameEl = document.getElementById('playerName');
const discardBtn = document.getElementById('discardBtn');
const passBtn = document.getElementById('passBtn');
const roundCounterEl = document.getElementById('roundCounter');
const playedTopEl = document.getElementById('playedTop');
const roundPileEl = document.getElementById('roundPile');
const roundCardsEl = document.getElementById('roundCards');
const continueBtn = document.getElementById('continueBtn');

const deckOriginal = [
  "Aplicar capital próprio e reinvestir lucros.",
  "Solicitar empréstimo com amortização constante.",
  "Emitir debêntures com taxa pré-fixada.",
  "Buscar investidor-anjo com participação societária.",
  "Realizar parceria estratégica com outra empresa do setor.",
  "Financiar via crowdfunding corporativo ou plataforma de investimento coletivo.",

  "Aplicar em CDB com juros compostos de 12% a.a.",
  "Investir em título com juros simples de 15% a.a.",
  "Dividir metade em cada tipo de aplicação.",
  "Aplicar em fundo DI atrelado ao CDI composto.",
  "Investir em Tesouro Direto atrelado à Selic para liquidez e segurança.",
  "Simular cenários com diferentes taxas antes de aplicar o total.",

  "Migrar para título com taxa real garantida.",
  "Manter investimento nominal, ignorando inflação.",
  "Aplicar em título indexado ao IPCA.",
  "Reinvestir mensalmente com taxa efetiva ajustada.",
  "Diversificar parte do portfólio entre títulos nominais e reais.",
  "Ajustar o prazo das aplicações conforme as projeções de inflação.",

  "Avaliar o risco de inadimplência antes de emprestar.",
  "Fazer um contrato simples com valor e prazo definidos.",
  "Recusar o empréstimo se comprometer seu orçamento.",
  "Propor ajudar o amigo com orientação financeira em vez de dinheiro.",
  "Definir garantias simples (como transferência de bem) para formalizar o acordo.",
  "Emprestar apenas uma parte do valor solicitado como teste de compromisso.",

  "M = C * (1 + i)^n",
  "Os juros compostos fazem o dinheiro render sobre o próprio rendimento anterior.",
  "Optar por uma aplicação de juros compostos é mais vantajoso a longo prazo.",
  "No regime composto, o montante será maior que nos juros simples.",
  "Utilizar planilha financeira ou simulador online para visualizar o crescimento.",
  "Reinvestir os rendimentos periodicamente para potencializar o montante.",

  "Antecipar recebíveis via factoring.",
  "Reduzir prazos de clientes e negociar com fornecedores.",
  "Contratar capital de giro de curto prazo.",
  "Cortar despesas operacionais fixas.",
  "Implantar um controle de fluxo de caixa diário com projeções de 3 meses.",
  "Oferecer descontos para clientes que pagam antecipadamente.",

  "Calcular o perfil de investidor antes de decidir.",
  "Aplicar parte em renda fixa e parte em variável.",
  "Consultar um planejador financeiro.",
  "Escolher o investimento com melhor relação risco/retorno no longo prazo.",
  "Estudar o histórico de volatilidade e rentabilidade de ambos os ativos.",
  "Definir metas de retorno compatíveis com sua tolerância ao risco.",

  "Reduzir custos e despesas operacionais.",
  "Reinvestir lucros acumulados em ativos produtivos.",
  "Reavaliar imobilizado e ajustar depreciação.",
  "Aumentar receitas via diversificação de produtos.",
  "Vender ativos ociosos para recompor capital.",
  "Revisar a política de dividendos para fortalecer o caixa.",

  "Reestruturar o projeto reduzindo custos.",
  "Buscar linhas de crédito subsidiadas.",
  "Rejeitar o projeto e buscar alternativas.",
  "Adiar o investimento até as taxas melhorarem.",
  "Recalcular o custo de capital considerando incentivos fiscais.",
  "Implementar o projeto em fases menores para testar a viabilidade.",

  "Negociar prazos com fornecedores.",
  "Realizar liquidação de estoque parado.",
  "Solicitar empréstimo emergencial de curto prazo.",
  "Buscar aporte de sócios temporariamente.",
  "Revisar contratos de longo prazo para reduzir custos fixos.",
  "Planejar um orçamento de contingência para emergências futuras."
];

let players = [];// {nome, mão:[]}
let deck = [];
let discardPile = [];
let currentPlayer = 0;
let roundCount = 1;
let discardMode = false;
let deckClickable = true;
let passCount = 0;

let playedThisRound = [];

function shuffle(arr){
	for(let i=arr.length-1;i>0;i--){
		const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];
	}
}

function openPlayersModal(){
	playersModal.classList.remove('hidden');
	renderPlayersInputs();
}

function closePlayersModal(){
	playersModal.classList.add('hidden');
}

function showDealButton() {
    const existingBtn = document.querySelector('.deal-button');
    if (existingBtn) {
        existingBtn.remove();
    }
    
    if (players.some(p => p.hand.length > 0)) {
        return;
    }

    const dealBtn = document.createElement('button');
    dealBtn.className = 'btn deal-button';
    dealBtn.textContent = 'Dar Mãos Iniciais';
    dealBtn.onclick = () => {
        dealInitialHands();
        dealBtn.remove();
        renderAll();
    };
    monteEl.appendChild(dealBtn);
}

document.querySelector('.close-modal').addEventListener('click', closePlayersModal);
playersModal.addEventListener('mousedown', (e) => {
    if(e.target === playersModal && e.button === 0) {
        closePlayersModal();
    }
});

function renderPlayersInputs(){
	playersListDiv.innerHTML='';
	let n = parseInt(numPlayersInput.value,10) || MIN_PLAYERS;
	n = Math.max(MIN_PLAYERS,Math.min(MAX_PLAYERS,n));
	for(let i=0;i<n;i++){
		const input = document.createElement('input');
		input.type='text';
		input.value = players[i]?.name || ('Jogador ' + (i+1));
		input.dataset.index = i;
		playersListDiv.appendChild(input);
	}
}

numPlayersInput.addEventListener('change',renderPlayersInputs);
playersBtn.addEventListener('click',openPlayersModal);

savePlayersBtn.addEventListener('click', () => {
    const inputs = Array.from(playersListDiv.querySelectorAll('input'));
    const newPlayerCount = inputs.length;
    
    // Se é a primeira vez (não há jogadores ainda)
    if (players.length === 0) {
        players = inputs.map((inp, i) => ({
            name: inp.value.trim() || ('Jogador ' + (i+1)),
            hand: []
        }));
        playedThisRound = new Array(players.length).fill(null);
        startGame();
        closePlayersModal();
        return;
    }
    
    // Se já existe um jogo em andamento
    const namesChanged = inputs.some((inp, i) => 
        players[i]?.name !== (inp.value.trim() || ('Jogador ' + (i+1)))
    );
    
    if ((newPlayerCount !== players.length || namesChanged) && players.some(p => p.hand.length > 0)) {
        if (!confirm('Alterar os jogadores irá reiniciar o jogo. Deseja continuar?')) {
            closePlayersModal();
            return;
        }
        players = inputs.map((inp, i) => ({
            name: inp.value.trim() || ('Jogador ' + (i+1)),
            hand: []
        }));
        playedThisRound = new Array(players.length).fill(null);
        startGame();
    } else {
        // Apenas atualiza os nomes
        if (players.length === 0) {
            players = inputs.map((inp, i) => ({
                name: inp.value.trim() || ('Jogador ' + (i+1)),
                hand: []
            }));
        } else {
            players.forEach((p, i) => {
                if (i < inputs.length) {
                    p.name = inputs[i].value.trim() || ('Jogador ' + (i+1));
                }
            });
        }
        renderAll();
    }
    closePlayersModal();
});

restartBtn.addEventListener('click',()=>{
	// Reiniciar
	if(players.length===0) return;
	if(confirm('Tem certeza que deseja reiniciar o jogo?')) {
		initNewGame();
		closePlayersModal();
	}
});

function initNewGame(){
    deck = [...deckOriginal];
    shuffle(deck);
    discardPile = [];
    currentPlayer = 0;
    roundCount = 1;
    passCount = 0;
    playedThisRound = new Array(players.length).fill(null);
    players.forEach(p => p.hand = []);
    renderAll();
    showDealButton();
}

function startGame(){
    if(players.length < MIN_PLAYERS || players.length > MAX_PLAYERS) return alert('Número de jogadores inválido');
    // Resetar o deck para estado inicial
    deck = [...deckOriginal];
    shuffle(deck);
    discardPile = [];
    currentPlayer = 0;
    roundCount = 1;
    passCount = 0;
    playedThisRound = new Array(players.length).fill(null);
    renderAll();
    showDealButton();
}

function dealInitialHands(){
    if (deck.length < players.length * STARTING_HAND) {
        alert('Não há cartas suficientes no monte para distribuir.');
        return;
    }

    players.forEach(p => p.hand = []);
    
    for(let i = 0; i < STARTING_HAND; i++){
        for(let j = 0; j < players.length; j++){
            const card = deck.pop();
            players[j].hand.push(card);
        }
    }

    deckClickable = false;
    setTimeout(() => deckClickable = true, 1000);
}

function renderAll(){
	roundCounterEl.textContent = roundCount;
	renderMonte();
	renderHand();
	renderPlayedTop();
}

function renderMonte(){
	const stack = monteEl.querySelector('.stack');
	stack.textContent = deck.length;
}

function renderHand(){
	handEl.innerHTML='';
	if(players.length===0) return;
	const p = players[currentPlayer];

    if (players[currentPlayer + 1]) {
        playerNameEl.textContent = 'Vez de ' + p.name + '.' + ' Próximo a jogar: ' + players[currentPlayer + 1].name;
    }
    else {
        playerNameEl.textContent = 'Vez de ' + p.name + '.' + ' Último a jogar na rodada.';
    }
	
	handEl.classList.toggle('discard-mode', discardMode);
	p.hand.forEach((c, idx)=>{
		const div = document.createElement('div');
		div.className = 'card';
		div.textContent = c;
		div.dataset.index = idx;
		div.addEventListener('click',(e)=>onCardClick(idx,e));
		handEl.appendChild(div);
	});
}

function renderPlayedTop(){
	playedTopEl.innerHTML = '';
	if(!playedThisRound || playedThisRound.length===0) return;
	playedThisRound.forEach((c,i)=>{
		if(!c) return;
		const div = document.createElement('div');
		div.className = 'card';
		div.textContent = 'Carta ' + (i+1);
		div.title = players[i]?.name || ('Jogador ' + (i+1));
		playedTopEl.appendChild(div);
	});
}

// Jogar ou discartar cartas
function onCardClick(idx, event){
	const p = players[currentPlayer];
	if(!p) return;
	const card = p.hand[idx];
	if(!card) return;

	if(discardMode){
		// deleta carta clicada
		p.hand.splice(idx,1);
		discardPile.push(card);
		renderAll();
		return;
	}

	if(playedThisRound[currentPlayer]){
		alert('Você já jogou uma carta nesta rodada.');
		return;
	}

	const targetEl = event.currentTarget;
	const rect = targetEl.getBoundingClientRect();
	const clone = targetEl.cloneNode(true);
	clone.style.position = 'fixed';
	clone.style.left = rect.left + 'px';
	clone.style.top = rect.top + 'px';
	clone.style.width = rect.width + 'px';
	clone.style.height = rect.height + 'px';
	clone.style.zIndex = 1000;
	document.body.appendChild(clone);

	requestAnimationFrame(()=>{
		clone.classList.add('play-anim');
	});

	clone.addEventListener('transitionend',()=>{
		// grava carta do jogador
		playedThisRound[currentPlayer] = card;
		// remove a carta da mão do jogador
		players[currentPlayer].hand.splice(idx,1);
		clone.remove();
		renderAll();
	},{once:true});
}

// saca do monte
monteEl.addEventListener('click',()=>{
    if(deckClickable === false) return; 
	if(players.length===0) return openPlayersModal();
	if(deck.length===0) return alert('Monte vazio');
    if (players[currentPlayer].hand.length > 4) return alert('O máximo de cartas na mão de um jogador deve ser 5.')
	const card = deck.pop();
	players[currentPlayer].hand.push(card);
	renderAll();
});

// modo de descarte
discardBtn.addEventListener('click',()=>{
	discardMode = !discardMode;
	discardBtn.classList.toggle('active', discardMode);
	renderHand();
});

// passar vez (com timer de 3 segundos)
passBtn.addEventListener('click',()=>{
	if(players.length===0) return openPlayersModal();
	if(!playedThisRound[currentPlayer]) {
		alert('Você precisa jogar uma carta antes de passar a vez.');
		return;
	}
	passBtn.disabled = true;
	let seconds = 3;
	const origText = passBtn.textContent;
	passBtn.textContent = `Passando... ${seconds}`;
	const interval = setInterval(()=>{
		seconds--;
		if(seconds>0) passBtn.textContent = `Passando... ${seconds}`;
	},1000);
	setTimeout(()=>{
		clearInterval(interval);
		passBtn.disabled = false;
		passBtn.textContent = origText;
		passCount++;
		currentPlayer = (currentPlayer + 1) % players.length;
		if(passCount >= players.length){
			passCount = 0;
			roundCount++;
			showRoundPile();
		}
		renderAll();
	},3000);
});

function showRoundPile(){
	roundCardsEl.innerHTML = '';
	const cards = [];
	for(let i=0;i<players.length;i++){
		if(playedThisRound[i]) cards.push({card: playedThisRound[i], playerIndex: i});
	}
	cards.forEach(item=>{
		const c = document.createElement('div');
		c.className = 'card';
		c.textContent = item.card;
		c.title = players[item.playerIndex]?.name || '';
		roundCardsEl.appendChild(c);
	});

	document.body.classList.add('in-round-pile');
	roundPileEl.classList.remove('hidden');
}

continueBtn.addEventListener('click',()=>{
	for(let i=0;i<playedThisRound.length;i++){
		if(playedThisRound[i]){
			discardPile.push(playedThisRound[i]);
			playedThisRound[i] = null;
		}
	}
	roundPileEl.classList.add('hidden');
	document.body.classList.remove('in-round-pile');
	renderAll();
});

// mostra o modal
window.addEventListener('load',()=>{
    numPlayersInput.value = 4;
    players = []; // Garante que players começa vazio
    renderPlayersInputs();
    openPlayersModal();
});
