<!DOCTYPE html>
<html lang="zh-HK">
<head>
    <meta charset="UTF-8">
    <title>經典比卡超沙灘排球</title>
    <style>
        body {
            margin: 0;
            background: #222;
            color: #fff;
            font-family: Arial, sans-serif;
            text-align: center;
        }
        canvas {
            background: linear-gradient(to bottom, #87CEEB 60%, #EEDC82 60%);
            display: block;
            margin: 20px auto;
            border: 4px solid #fff;
            box-shadow: 0 0 20px rgba(0,0,0,0.5);
        }
        .instructions {
            max-width: 800px;
            margin: 0 auto;
            text-align: left;
            background: #333;
            padding: 15px;
            border-radius: 8px;
        }
    </style>
</head>
<body>

    <h1>⚡ 比卡超沙灘排球 (Pikachu Volleyball) ⚡</h1>
    <div id="scoreBoard" style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">
        玩家 (比卡超 A): <span id="p1Score">0</span> | 電腦 (比卡超 B): <span id="p2Score">0</span>
    </div>
    
    <canvas id="gameCanvas" width="800" height="400"></canvas>

    <div class="instructions">
        <h3>📜 遊戲玩法與操作說明</h3>
        <p><strong>遊戲規則：</strong> 控制比卡超移動並把排球打過球網。如果排球落在己方地面，對方即得 1 分。</p>
        <p><strong>玩家 1 (左側 - 比卡超 A) 操作：</strong></p>
        <ul>
            <li>移動：鍵盤 <strong>A 鍵</strong> (左)、<strong>D 鍵</strong> (右)</li>
            <li>跳躍：鍵盤 <strong>W 鍵</strong></li>
            <li>強力扣殺：跳起後按 <strong>Space (空白鍵)</strong></li>
        </ul>
        <p><strong>電腦 2 (右側 - 比卡超 B)：</strong> 自動 AI 追球與扣殺。</p>
    </div>

<script>
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// 遊戲常數
const GRAVITY = 0.6;
const GROUND_Y = 340;
const NET_X = 400;
const NET_Y = 240;
const NET_WIDTH = 10;

// 分數
let p1Score = 0;
let p2Score = 0;

// 按鍵監聽
const keys = {};
window.addEventListener("keydown", e => keys[e.code] = true);
window.addEventListener("keyup", e => keys[e.code] = false);

// 角色類別
class Pikachu {
    constructor(x, y, color, isAI) {
        this.x = x;
        this.y = y;
        this.radius = 25;
        this.color = color;
        this.vx = 0;
        this.vy = 0;
        this.speed = 6;
        this.jumpForce = -12;
        this.isGrounded = false;
        this.isAI = isAI;
    }

    update(ball) {
        if (this.isAI) {
            // 簡單電腦 AI 邏輯
            if (ball.x > NET_X) {
                if (ball.x < this.x - 10) this.vx = -this.speed * 0.8;
                else if (ball.x > this.x + 10) this.vx = this.speed * 0.8;
                else this.vx = 0;

                // 判斷跳躍扣殺
                if (ball.y < this.y - 50 && Math.abs(ball.x - this.x) < 50 && this.isGrounded) {
                    this.vy = this.jumpForce;
                    this.isGrounded = false;
                }
            } else {
                // 球在對面時，回到右側中央防守
                if (this.x < 600) this.vx = this.speed * 0.5;
                else if (this.x > 620) this.vx = -this.speed * 0.5;
                else this.vx = 0;
            }
        } else {
            // 玩家 1 控制 (A, D, W)
            this.vx = 0;
            if (keys["KeyA"]) this.vx = -this.speed;
            if (keys["KeyD"]) this.vx = this.speed;
            if (keys["KeyW"] && this.isGrounded) {
                this.vy = this.jumpForce;
                this.isGrounded = false;
            }
        }

        // 應用物理與移動
        this.vy += GRAVITY;
        this.x += this.vx;
        this.y += this.vy;

        // 落地邊界
        if (this.y >= GROUND_Y - this.radius) {
            this.y = GROUND_Y - this.radius;
            this.vy = 0;
            this.isGrounded = true;
        }

        // 左右與球網限制
        if (!this.isAI) {
            if (this.x < this.radius) this.x = this.radius;
            if (this.x > NET_X - this.radius) this.x = NET_X - this.radius;
        } else {
            if (this.x > canvas.width - this.radius) this.x = canvas.width - this.radius;
            if (this.x < NET_X + NET_WIDTH + this.radius) this.x = NET_X + NET_WIDTH + this.radius;
        }
    }

    draw() {
        // 畫出身體 (代替比卡超)
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();

        // 畫耳朵
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - 15, this.y - 35, 8, 15);
        ctx.fillRect(this.x + 7, this.y - 35, 8, 15);
        
        // 畫眼睛
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.arc(this.x + (this.isAI ? -8 : 8), this.y - 5, 3, 0, Math.PI * 2);
        ctx.fill();
    }
}

// 排球類別
class Ball {
    constructor() {
        this.reset(1);
    }

    reset(servingPlayer) {
        this.x = servingPlayer === 1 ? 200 : 600;
        this.y = 100;
        this.radius = 15;
        this.vx = 0;
        this.vy = 0;
    }

    update(p1, p2) {
        this.vy += GRAVITY * 0.7; // 排球重力稍輕
        this.x += this.vx;
        this.y += this.vy;

        // 地面碰撞 (得分判定)
        if (this.y >= GROUND_Y - this.radius) {
            if (this.x < NET_X) {
                p2Score++;
                document.getElementById("p2Score").innerText = p2Score;
                this.reset(1);
            } else {
                p1Score++;
                document.getElementById("p1Score").innerText = p1Score;
                this.reset(2);
            }
            return;
        }

        // 天花板與左右牆壁反彈
        if (this.y < this.radius) { this.y = this.radius; this.vy = -this.vy; }
        if (this.x < this.radius) { this.x = this.radius; this.vx = -this.vx; }
        if (this.x > canvas.width - this.radius) { this.x = canvas.width - this.radius; this.vx = -this.vx; }

        // 球網碰撞物理
        if (this.x + this.radius > NET_X && this.x - this.radius < NET_X + NET_WIDTH && this.y + this.radius > NET_Y) {
            if (this.vy > 0 && this.y < NET_Y + 10) {
                this.vy = -this.vy; // 彈過網頂
            } else {
                this.vx = -this.vx * 0.8; // 撞網側反彈
            }
        }

        // 玩家/電腦與球的碰撞檢測
        this.checkCollision(p1, false);
        this.checkCollision(p2, true);
    }

    checkCollision(player, isAI) {
        let dx = this.x - player.x;
        let dy = this.y - player.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.radius + player.radius) {
            // 計算擊球角度
            let angle = Math.atan2(dy, dx);
            let speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            speed = Math.max(speed, 8); // 保持基礎球速

            this.vx = Math.cos(angle) * speed * 1.2;
            this.vy = Math.sin(angle) * speed * 1.2 - 3; // 給予向上的力

            // 檢查扣殺/殺球動作
            if (!isAI && keys["Space"] && !player.isGrounded) {
                this.vx = 14; // 向右強力扣殺
                this.vy = 4;
            }
            if (isAI && !player.isGrounded) {
                this.vx = -14; // 電腦向左強力扣殺
                this.vy = 4;
            }
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = "#FFF";
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#000";
        ctx.stroke();
        ctx.closePath();
    }
}

// 初始化物件
const player1 = new Pikachu(150, GROUND_Y - 25, "#FFDE00", false);
const player2 = new Pikachu(650, GROUND_Y - 25, "#FFEB3B", true);
const volleyball = new Ball();

// 遊戲主循環
function gameLoop() {
    // 清空並重新繪製背景
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 繪製球網
    ctx.fillStyle = "#FFF";
    ctx.fillRect(NET_X, NET_Y, NET_WIDTH, canvas.height - NET_Y);

    // 更新與繪製物件
    player1.update(volleyball);
    player2.update(volleyball);
    volleyball.update(player1, player2);

    player1.draw();
    player2.draw();
    volleyball.draw();

    requestAnimationFrame(gameLoop);
}

// 啟動遊戲
gameLoop();
</script>
</body>
</html>