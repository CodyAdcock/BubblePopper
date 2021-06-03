//Canvas Setup
const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 500;

let score = 0;
let gameFrame = 0;
ctx.font = '50px Georgia';
let gameSpeed = 1;
let gameOver = false;
let paused = false;
let startButton;

let colorPlayer = 'blue';
const colorsPlayer = ['black', 'blue', 'green', 'purple', 'red', 'yellow'];
let randomColorPlayer = colorsPlayer[Math.floor(Math.random()*colorsPlayer.length)];
let colorEnemy = 'yellow';
const colorsEnemy = ['blue', 'green', 'orange', 'pink', 'red', 'yellow'];
let randomColorEnemy = colorsEnemy[Math.floor(Math.random()*colorsEnemy.length)];

//Mouse Interactivity
let canvasPosition = canvas.getBoundingClientRect();

const mouse = {
    x: canvas.width/2,
    y: canvas.height/2,
    click: false
}
canvas.addEventListener('mousedown', function(event){
    mouse.click = true;
    mouse.x = event.x - canvasPosition.left;
    mouse.y = event.y - canvasPosition.top;
});
canvas.addEventListener('mouseup', function(){
    mouse.click = false;    
});
//Player
const playerLeft = new Image();
playerLeft.src = 'fishSprites/fish_swim_left_' + randomColorPlayer + '.png';
const playerRight = new Image();
playerRight.src = 'fishSprites/fish_swim_right_' + randomColorPlayer + '.png';

class Player {
    constructor(){
        this.x = canvas.width;
        this.y = canvas.height/2;
        this.radius = 50;
        this.angle = 0;
        this.frameX = 0;
        this.frameY = 0;
        this.frame = 0;
        this.spriteWidth = 498;
        this.spriteHeight = 327;
    }
    update(){
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        let theta = Math.atan2(dy, dx); 
        this.angle = theta;
        if (mouse.x != this.x){
            this.x -= dx/20;
        }
        if (mouse.y != this.y){
            this.y -= dy/20;
        }
        // Swim animation
        if (gameFrame % 5 == 0){
            this.frameX++;
            this.frameY += this.frameX == 4 ? 1 : 0;
            this.frameX %= 4;
            this.frameY %= 3;
        }
    }
    draw(){
        if (mouse.click){
            ctx.lineWidth = 0.2;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
        }
        // Hitbox
        /*ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
        ctx.fillRect(this.x,this.y,this.radius,10);*/

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        if (this.x >= mouse.x){
            ctx.drawImage(playerLeft, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, 0 - 60, 0 - 45, this.spriteWidth/4, this.spriteHeight/4);
        } else {
            ctx.drawImage(playerRight, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, 0 - 60, 0 - 45, this.spriteWidth/4, this.spriteHeight/4);
        }
        ctx.restore();
    }
}
const player = new Player();

//Bubbles
const bubblesArray = [];
const bubbleImage = new Image;
bubbleImage.src = 'bubbleSprites/bubble_pop_frame_01.png';
class Bubble {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + 100;
        this.radius = 50;
        this.speed = Math.random() * 5 + 1;
        this.distance;
        this.counted = false;
        this.sound = Math.random() <= 0.5 ? 'sound1' : 'sound2';
    }
    update(){
        this.y -= this.speed;
        const dx = this.x - player.x;
        const dy = this.y - player.y;
        this.distance = Math.sqrt(dx*dx + dy*dy); //pythagorean theorem to find distance between two bubbles
    }
    draw(){
        // Hitbox
        /*ctx.fillStyle = 'blue';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill()
        ctx.closePath();
        ctx.stroke();*/
        ctx.drawImage(bubbleImage, this.x - 65, this.y - 65, this.radius * 2.6, this.radius * 2.6);
    }
}

const bubblePop1 = document.createElement('audio');
bubblePop1.src = 'sounds/bubbles-single1.wav';
const bubblePop2 = document.createElement('audio');
bubblePop2.src = 'sounds/Plop.ogg';

function handleBubbles(){
    if (gameFrame % 50 == 0){
        bubblesArray.push(new Bubble());
    }
    for (let i = 0; i < bubblesArray.length; i++){
        bubblesArray[i].update();
        bubblesArray[i].draw();
        if (bubblesArray[i].y < 0 - bubblesArray[i].radius * 2 /*make the whole bubble leave screen*/){
            bubblesArray.splice(i, 1);
            i--;
        } else if (bubblesArray[i].distance < bubblesArray[i].radius + player.radius){
            if(!bubblesArray[i].counted){
                if (bubblesArray[i].sound == 'sound1'){
                    // bubblePop1.play();
                } else {
                    // bubblePop2.play();
                }
                score++;
                bubblesArray[i].counted = true;
                bubblesArray.splice(i, 1);
                i--;
            }
        }
    }
}

//Repeating backgrounds
const background = new Image();
background.src = 'backgrounds/background1.png';

const BG = {
    x1: 0,
    x2: canvas.width,
    y:0,
    width: canvas.width,
    height: canvas.height,
}

function handleBackgroud(){
    BG.x1 -= gameSpeed;
    if (BG.x1 < -BG.width) BG.x1 = BG.width;
    BG.x2 -= gameSpeed;
    if (BG.x2 < -BG.width) BG.x2 = BG.width;
    ctx.drawImage(background, BG.x1, BG.y, BG.width, BG.height);
    ctx.drawImage(background, BG.x2, BG.y, BG.width, BG.height);
}

//Enemies
const enemyImage = new Image();
enemyImage.src = 'enemySprites/__' + randomColorEnemy + '_cartoon_fish_01_swim.png';

class Enemy {
    constructor(){
        this.x = canvas.width + 200;
        this.y = Math.random() * (canvas.height - 150) + 90;
        this.radius = 60;
        this.speed = Math.random() * 2 + 2;
        this.frame = 0;
        this.frameX = 0;
        this.frameY = 0;
        this.spriteWidth = 418; //sheet width / columns
        this.spriteHeight = 397; // sheet height / rows
    }
    draw(){
        // Hitbox
        /*ctx.fillStyle = 'green';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();*/
        ctx.drawImage(enemyImage, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.x - 60, this.y - 70, this.spriteWidth / 3, this.spriteWidth / 3);
    }
    update(){
        this.x -= this.speed;
        if (this.x < 0 - this.radius * 2){
            this.x = canvas.width + 200;
            this.y = Math.random() * (canvas.height - 150) + 90;
            this.speed = Math.random() * 2 + 2;
        }
        // Swim animation
        if (gameFrame % 5 == 0){
            this.frameX++;
            this.frameY += this.frameX == 4 ? 1 : 0;
            this.frameX %= 4;
            this.frameY %= 3;
        }
        // Collision with player 
        const dx = this.x - player.x;
        const dy = this.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < this.radius + player.radius){
            handleGameOver();
        }
    }
}

const enemy1 = new Enemy();
function handleEnemies(){
    enemy1.draw();
    enemy1.update();
}

const replayButton = new Image();
replayButton.src = 'buttons/play-button.png';

function handleGameOver(){
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER!', canvas.width/ 2, canvas.height / 2 - 40);
    ctx.fillText('you reached score: ' + score, canvas.width / 2, canvas.height / 2 + 40);
    ctx.fillText('play again?', canvas.width / 2, canvas.height / 2 + 220);
    ctx.drawImage(replayButton,canvas.width / 2 - 50,  canvas.height / 2 + 80, 100, 100 );

    gameOver = true;
}

function togglePause(){
    if(!paused){
        paused = true;
    } else if (!gameOver){
        paused = false;
        animate();
    }
}

//Animation Loop
function animate(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    handleBackgroud();
    handleBubbles();
    player.update();
    player.draw();
    handleEnemies();
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.fillText('score: ' + score, 100, 50);
    gameFrame++;
    if (!gameOver && !paused) requestAnimationFrame(animate);
}
animate();
replayButton.onclick = function(){
    console.log('click');
    handleRestart();
}

window.addEventListener('resize', function(){
    canvasPosition = canvas.getBoundingClientRect();
})
window.addEventListener('keydown', function (e) {
    var key = e.keyCode;
    if (key === 80)// p key
    {
        togglePause();
    }
    });