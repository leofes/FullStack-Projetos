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

// Função para criar uma bola que se move na horizontal
function criarBolaHorizontal(x, y, direction) {
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

// Função para criar uma bola que se move na vertical
function criarBolaVertical(x, y, direction) {
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
            let minY = 100 + this.raio;
            let maxY = 300 - this.raio;
            this.y += this.speed * this.direction;
            if (this.y + this.raio > maxY || this.y - this.raio < minY) {
                this.direction *= -1;
            }
        }
    };
}

// Função para criar uma moeda
function criarMoeda(x, y) {
    return {
        x: x,
        y: y,
        raio: 8,
        cor_preenchimento: "yellow",
        cor_linha: "black",
        coletada: false,
        desenha: function() {
            if (!this.coletada) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.raio, 0, Math.PI * 2);
                ctx.fillStyle = this.cor_preenchimento;
                ctx.fill();
                ctx.strokeStyle = this.cor_linha;
                ctx.stroke();
                ctx.closePath();
            }
        },
        coletar: function() {
            this.coletada = true;
        }
    };
}

// Distribui as bolas verticais entre as zonas seguras no eixo X
let espacoEntreBolas = (safe_2.x - (safe_1.x + safe_1.largura)) / 6;  // Calcula a distribuição no eixo X
let bolasVerticais = [
    criarBolaVertical(safe_1.x + safe_1.largura + espacoEntreBolas * 0.5, 150, 2),
    criarBolaVertical(safe_1.x + safe_1.largura + espacoEntreBolas * 1.5, 150, -2),
    criarBolaVertical(safe_1.x + safe_1.largura + espacoEntreBolas * 2.5, 150, 2),
    criarBolaVertical(safe_1.x + safe_1.largura + espacoEntreBolas * 3.5, 150, -2),
    criarBolaVertical(safe_1.x + safe_1.largura + espacoEntreBolas * 4.5, 150, 2),
    criarBolaVertical(safe_1.x + safe_1.largura + espacoEntreBolas * 5.5, 150, -2)
];

let centroX = (safe_1.x + safe_1.largura + safe_2.x) / 2;
let bolasHorizontais = [
    criarBolaHorizontal(centroX, 120, 2),  
    criarBolaHorizontal(centroX, 160, -2),
    criarBolaHorizontal(centroX, 200, 2),  
    criarBolaHorizontal(centroX, 240, -2),
    criarBolaHorizontal(centroX, 280, 2)
];

// Lista de moedas
let moedas = [
    criarMoeda(150, 130),
    criarMoeda(300, 230),
    criarMoeda(450, 180),
    criarMoeda(550, 120)
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

function verificarColetaMoedas() {
    moedas.forEach(moeda => {
        if (!moeda.coletada) {
            let distX = jogador.x + jogador.largura / 2 - moeda.x;
            let distY = jogador.y + jogador.altura / 2 - moeda.y;
            let distance = Math.sqrt(distX * distX + distY * distY);

            if (distance < jogador.largura / 2 + moeda.raio) {
                moeda.coletar(); // Coleta a moeda
            }
        }
    });
}

function todasMoedasColetadas() {
    return moedas.every(moeda => moeda.coletada);
}

function verificarFimDeJogo() {
    if (
        jogador.x + jogador.largura > safe_2.x &&
        jogador.y + jogador.altura > safe_2.y &&
        jogador.y < safe_2.y + safe_2.altura &&
        todasMoedasColetadas() // Verifica se todas as moedas foram coletadas
    ) {
        fimDeJogo = true;
        jogoAtivo = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "black";
        ctx.font = "30px Arial";
        ctx.fillText("Fim de Jogo! Você Venceu!", canvas.width / 2 - 150, canvas.height / 2);
        retryButton.style.display = 'block';
    } else if (
        jogador.x + jogador.largura > safe_2.x &&
        jogador.y + jogador.altura > safe_2.y &&
        jogador.y < safe_2.y + safe_2.altura &&
        !todasMoedasColetadas() // Jogador não coletou todas as moedas
    ) {
        ctx.fillStyle = "red";
        ctx.font = "20px Arial";
        ctx.fillText("Colete todas as moedas antes de ir para a Safe Zone!", canvas.width / 2 - 200, canvas.height / 2 + 150);
    }
}

function animacao() {
    if (!jogoAtivo || fimDeJogo) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    bordaSuperior.desenha();
    bordaInferior.desenha();
    safe_1.desenha();
    safe_2.desenha();
    jogador.desenha();
    mortes.desenha();

    // Desenha e move bolas horizontais e verticais
    bolasHorizontais.forEach(bola => {
        bola.desenha();
        bola.move();
        checkCollision(bola);
    });
    
    bolasVerticais.forEach(bola => {
        bola.desenha();
        bola.move();
        checkCollision(bola);
    });

    // Desenha e verifica a coleta das moedas
    moedas.forEach(moeda => moeda.desenha());
    verificarColetaMoedas();

    jogador.move();

    verificarFimDeJogo();

    if (!fimDeJogo) {
        requestAnimationFrame(animacao);
    }
}

document.addEventListener("keydown", function(event) {
    if (jogoAtivo) {
        if (event.key === "ArrowRight") jogador.dx = 5;
        if (event.key === "ArrowLeft") jogador.dx = -5;
        if (event.key === "ArrowDown") jogador.dy = 5;
        if (event.key === "ArrowUp") jogador.dy = -5;
    }
});

document.addEventListener("keyup", function(event) {
    if (jogoAtivo) {
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") jogador.dx = 0;
        if (event.key === "ArrowDown" || event.key === "ArrowUp") jogador.dy = 0;
    }
});

function iniciarJogo() {
    jogador.reset();
    mortes.reset();
    fimDeJogo = false;
    jogoAtivo = true;
    moedas.forEach(moeda => moeda.coletada = false); // Resetar moedas
    retryButton.style.display = 'none';
    animacao();
}

startButton.addEventListener("click", iniciarJogo);
retryButton.addEventListener("click", iniciarJogo);
