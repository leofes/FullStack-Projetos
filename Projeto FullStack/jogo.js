let canvas = document.getElementById("Canvas");
let ctx = canvas.getContext("2d");
let startButton = document.getElementById("startButton");
let retryButton = document.getElementById("retryButton");
let jogoAtivo = false; // Indica se o jogo está em andamento
let fimDeJogo = false; // Indica se o jogo terminou

let jogador = {
    x: 50,
    y: 150,
    dx: 0,
    dy: 0,
    largura: 20,
    altura: 20,
    cor_preenchimento: 'red',
    cor_linha: 'black',
    desenha: function() {
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.fillStyle = this.cor_preenchimento;
        ctx.strokeStyle = this.cor_linha;
        ctx.fillRect(this.x, this.y, this.largura, this.altura);
        ctx.strokeRect(this.x, this.y, this.largura, this.altura);
        ctx.closePath();
    },
    move: function() {
        this.x += this.dx;
        this.y += this.dy;
        
        // Limites de tela no eixo X
        if (this.x < 0) this.x = 0;
        if (this.x + this.largura > canvas.width) this.x = canvas.width - this.largura;
        
        // Limitar o movimento no eixo Y entre as zonas seguras
        let minY = safe_1.y;
        let maxY = safe_1.y + safe_1.altura - this.altura;
        if (this.y < minY) this.y = minY;
        if (this.y > maxY) this.y = maxY;
    },
    reset: function() {
        this.x = 50;
        this.y = 150;
        this.dx = 0;
        this.dy = 0;
    }
};

// Borda superior e inferior
let bordaSuperior = {
    x: 0,
    y: 0,
    largura: canvas.width,
    altura: 100,
    cor_preenchimento: 'black',
    desenha: function() {
        ctx.beginPath();
        ctx.fillStyle = this.cor_preenchimento;
        ctx.fillRect(this.x, this.y, this.largura, this.altura);
        ctx.closePath();
    }
};

let bordaInferior = {
    x: 0,
    y: 300,
    largura: canvas.width,
    altura: 100,
    cor_preenchimento: 'black',
    desenha: function() {
        ctx.beginPath();
        ctx.fillStyle = this.cor_preenchimento;
        ctx.fillRect(this.x, this.y, this.largura, this.altura);
        ctx.closePath();
    }
};

let safe_1 = {
    x: 0,
    y: 100,
    largura: 100,
    altura: 200,
    cor_preenchimento: 'green',
    desenha: function() {
        ctx.beginPath();
        ctx.fillStyle = this.cor_preenchimento;
        ctx.fillRect(this.x, this.y, this.largura, this.altura);
        ctx.closePath();
    }
};

let safe_2 = {
    x: 700,
    y: 100,
    largura: 100,
    altura: 200,
    cor_preenchimento: 'green',
    desenha: function() {
        ctx.beginPath();
        ctx.fillStyle = this.cor_preenchimento;
        ctx.fillRect(this.x, this.y, this.largura, this.altura);
        ctx.closePath();
    }
};

function criarBola(x, y, direction) {
    return {
        x: x,
        y: y,
        raio: 10,
        cor_preenchimento: "blue",
        cor_linha: "black",
        speed: 2,
        direction: direction,
        desenha: function() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.raio, 0, Math.PI * 2);
            ctx.fillStyle = this.cor_preenchimento;
            ctx.fill();
            ctx.strokeStyle = this.cor_linha;
            ctx.stroke();
            ctx.closePath();
        },
        move: function() {
            let minX = safe_1.x + safe_1.largura;
            let maxX = safe_2.x - this.raio;
            this.x += this.speed * this.direction;
            if (this.x + this.raio > maxX || this.x - this.raio < minX) {
                this.direction *= -1;
            }
        }
    };
}

let centroX = (safe_1.x + safe_1.largura + safe_2.x) / 2;
let bolas = [
    criarBola(centroX, 120, 1),  
    criarBola(centroX, 160, -1),
    criarBola(centroX, 200, 1),  
    criarBola(centroX, 240, -1)
];

let mortes = {
    valor: 0,
    desenha: function() {
        ctx.fillStyle = "white";  // Alterada a cor para se destacar das bordas pretas
        ctx.font = "20px Arial";
        ctx.fillText(`Mortes: ${this.valor}`, 10, 30);
    },
    reset: function() {
        this.valor = 0;
    }
};

function checkCollision(bola) {
    let distX = jogador.x + jogador.largura / 2 - bola.x;
    let distY = jogador.y + jogador.altura / 2 - bola.y;
    let distance = Math.sqrt(distX * distX + distY * distY);

    if (distance < bola.raio + jogador.largura / 2) {
        mortes.valor++;
        jogador.reset();
    }
}

function verificarFimDeJogo() {
    if (
        jogador.x + jogador.largura > safe_2.x &&
        jogador.y + jogador.altura > safe_2.y &&
        jogador.y < safe_2.y + safe_2.altura
    ) {
        fimDeJogo = true;
        jogoAtivo = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "black";
        ctx.font = "30px Arial";
        ctx.fillText("Fim de Jogo! Você Venceu!", canvas.width / 2 - 150, canvas.height / 2);
        retryButton.style.display = 'block';  // Exibe o botão de jogar novamente
    }
}

function animacao() {
    if (!jogoAtivo || fimDeJogo) return;  // Se o jogo não estiver ativo ou tiver terminado, não faz nada

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenha as bordas
    bordaSuperior.desenha();
    bordaInferior.desenha();

    // Desenha os elementos do jogo
    safe_1.desenha();
    safe_2.desenha();
    jogador.desenha();
    mortes.desenha();

    bolas.forEach(bola => {
        bola.desenha();
        bola.move();
        checkCollision(bola);
    });

    jogador.move();

    verificarFimDeJogo();  // Verifica se o jogador chegou ao fim

    if (!fimDeJogo) {
        requestAnimationFrame(animacao);  // Continua a animação se o jogo não terminou
    }
}

// Controle do jogador
function keyDown(e) {
    if (e.key === 'ArrowRight') jogador.dx = 5;
    if (e.key === 'ArrowLeft') jogador.dx = -5;
    if (e.key === 'ArrowUp') jogador.dy = -5;
    if (e.key === 'ArrowDown') jogador.dy = 5;
}

function keyUp(e) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') jogador.dx = 0;
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') jogador.dy = 0;
}

// Listeners de teclado
document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);

// Função para iniciar o jogo quando o botão for pressionado
startButton.addEventListener('click', function() {
    jogoAtivo = true;  // Define que o jogo está ativo
    fimDeJogo = false;
    mortes.reset();
    startButton.style.display = 'none';  // Esconde o botão de início
    animacao();  // Inicia a animação
});

// Função para jogar novamente
retryButton.addEventListener('click', function() {
    fimDeJogo = false;
    jogoAtivo = true;
    jogador.reset();
    mortes.reset();
    retryButton.style.display = 'none';  // Esconde o botão de jogar novamente
    animacao();  // Inicia a animação
});
