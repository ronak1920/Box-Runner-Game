const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

//  Declaring Variables
let score;
let scoreCount;
let highscore;
let highScoreCount;
let player;
let gravity;
let obstacles = [];
let gameSpeed;
let keys = {};
let extraJumps;
let count = 0;
   

// Adding the Event Listeners
document.addEventListener('keydown', function (evt) {
    keys[evt.code] = true;
  });
  document.addEventListener('keyup', function (evt) {
    keys[evt.code] = false;
    // count++;
    // console.log(count);
  });
  window.addEventListener("keydown", function(evt) {
    if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(evt.code) > -1) {
        evt.preventDefault();
    }
    }, false);


class Player {
    constructor (x, y, w, h, c) {
      this.x = x;  // x-axis
      this.y = y;  // y-axis
      this.w = w;  // width
      this.h = h;  // height
      this.c = c;  // color
  
      this.dy = 0;  // this is the jump velocity
      this.jumpForce = 10; // This implies how high the chrachter should go
      this.originalHeight = h;  // To reference the default height when we shrink our running charachter down
      this.grounded = false;   // to see if the charachter is on the ground or not .
      this.jumpTimer = 0;
    }
  
    Animate () {

      // This is the logic for jump Animation
      if (keys['Space'] || keys['ArrowUp']) {
        this.Jump();
      } 
      else {
        this.jumpTimer = 0;
      }
  
      if (keys['ArrowDown'] || keys['ShiftRight']) {
        this.h = this.originalHeight / 2;
      } 
      else {
        this.h = this.originalHeight;
      }
  
      // Makes the canvas grounded
      this.y += this.dy;
  
      // This logic is for gravity Animation (when the charachter comes to ground from jump ) .
      if (this.y + this.h < canvas.height) {
        this.dy += gravity;
        this.grounded = false;
      } 
      else {
        this.dy = 0;
        this.grounded = true;
        this.y = canvas.height - this.h;
      }
      this.Draw();
    }
  
    Jump () {

      // if (this.grounded && count == 1) {
      //   this.dy = -this.jumpForce;
      // }
      // else if (this.grounded && count == 2) {
      //   this.dy = -14;
      // }
      // else if (this.grounded && count == 3) {
      //   this.dy = -18;
      // }
      // else if (count > 3) {
      //   this.dy = -this.jumpForce;
      //   count = 0;
      // } 

        // Checking if he is touching the floor before he jumps
        if (this.grounded && this.jumpTimer == 0) {
            this.jumpTimer = 1;
            this.dy = -this.jumpForce;
        }  
        else if (this.jumpTimer > 0 && this.jumpTimer < 15) {
            this.jumpTimer++;
            this.dy = -this.jumpForce - (this.jumpTimer / 50);
        }

    }
  
    Draw () {
      ctx.beginPath();
      ctx.fillStyle = this.c;
      ctx.fillRect(this.x, this.y, this.w, this.h);
      ctx.closePath();
    }
  }
  

class Obstacle {

    constructor (x, y, w, h, c) {
        this.x = x;   // x-axis
        this.y = y;   // y-axis
        this.w = w;   // width
        this.h = h;   // height
        this.c = c;   // color
  
        this.dx = -gameSpeed;  //velocity of the obstacles in x direction
    }
  
    Update () {
        this.x += this.dx;
        this.Draw();
        // We need to update this to make the obstacle go faster
        this.dx = -gameSpeed;
    }
  
    Draw () {
        // This is the first path
        ctx.beginPath();
        ctx.fillStyle = this.c;
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.closePath();
    }
}
  

class Score {

    constructor (text, x, y, align, c, size) {
        this.text = text;
        this.x = x;
        this.y = y;
        this.align = align;
        this.c = c;
        this.size = size;
    }

    Draw () {
        // This is the first path
        ctx.beginPath();
        ctx.fillStyle = this.c;
        ctx.font = this.size + "px sans-serif";
        ctx.textAlign = this.align;
        ctx.fillText(this.text, this.x, this.y);
        ctx.closePath();
    }
}
 

// Game Functions
function SpawnObstacle () {
    let size = RandomIntInRange(20, 70);
    let type = RandomIntInRange(0, 1);
    let obstacle = new Obstacle(canvas.width + size, canvas.height - size, size, size, '#2484E4');
  
    if (type == 1) {
        // this will set the obstacle slightly higher
        obstacle.y -= Player.originalHeight - 10;
    }
    obstacles.push(obstacle);
  }
  
function RandomIntInRange (min, max) {
    return Math.round(Math.random() * (max - min) + min);
}
  
function Start () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  
    ctx.font = "20px sans-serif";
  
    gameSpeed = 15;
    gravity = 1;
  
    score = 0;
    highscore = 0;

    // this will store our highcore on the screen 
    // even if we hit refresh 
    if (localStorage.getItem('highscore')) {
        highscore = localStorage.getItem('highscore');
    }

    player = new Player(25, 0, 50, 50, '#f94f62');

    scoreCount = new Score("Score : " + score, 25, 25, "left", "#212121", "20");
    highScoreCount =  new Score("High-Score : " + highscore, canvas.width - 25, 25, "right", "#212121", "20");
  
    requestAnimationFrame(Update);
}
  
let initialSpawnTimer = 200;
let spawnTimer = initialSpawnTimer;

function Update () {
    requestAnimationFrame(Update);

    // If we do not clear the canvas or rectangle then
    // the canvas will stretch instead of moving in x direction
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    spawnTimer--;
    if (spawnTimer <= 0) {
        SpawnObstacle();

        spawnTimer = initialSpawnTimer - gameSpeed * 8;
            
        if (spawnTimer < 60) {
            spawnTimer = 60;
        }
    }

    // this logic is for drawing the obstacles 
    for (let i = 0; i <  obstacles.length; i++) {
        let obs = obstacles[i];

        if (obs.x + obs.width < 0) {
            // This will make sure as soon as the block goes off-screen or out
            // of the window the obstacle will be deleted 
            obstacles.splice(i, 1);
        }

        // Checking the collision and re-starting the game 
        if (player.x < obs.x + obs.w && player.x + player.w > obs.x && player.y < obs.y + obs.h && player.y + player.h > obs.y) {
            obstacles = [];
            score = 0;
            spawnTimer = initialSpawnTimer;
            gameSpeed = 3;
            // When the charachter dies this code will 
            // store the highcore for us 
            window.localStorage.setItem('highscore', highscore)
        }

        obs.Update();
    }

    player.Animate();

    score++;
    // This will update the score constantly as the game continues
    scoreCount.text = "Score : " + score;
    scoreCount.Draw();

    if (score > highscore) {
        highscore = score;
        highScoreCount.text = "High-Score : " + highscore;
    }

    highScoreCount.Draw();

    gameSpeed += 0.008;

}


SpawnObstacle ();

Start();