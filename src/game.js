var game = new Phaser.Game(480, 320, Phaser.AUTO, null, {
  preload: preload, create: create, update: update
});

var ball;
var paddle;
var bricks;
var newBrick;
var brickInfo;
var scoreText;
var score = 0;
var lives = 3;
var livesText;
var lifeLostText;
var textStyle = {font: '18px Oxygen', fill: '#0095DD'}
var playing = false;
var startButton;
var resetButton;
var scoreSound;
var gameoverSound;
var oofSound;
var blipSound;
var soundDJ;
var gameoverText;
var gameHeight;
var gameWidth;
var winText;
var hits = 0;
var normalButton;
var goofyButton;
var goofyMode = false;

function preload() {
  game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
  game.scale.pageAlignHorizontally = true;
  game.scale.pageAlignVertically = true;
  game.scale.maxHeight = game.height * 1.5;
  game.scale.maxWidth = game.width * 1.5;
  game.stage.backgroundColor = "#eee";
  game.load.image('sam', '../assets/img/sam.png');
  game.load.image('reset', '../assets/img/reset.png');
  game.load.image('paddle', '../assets/img/paddle.png');
  game.load.image('brickball', '../assets/img/brick.png')
  game.load.image('normalButton', '../assets/img/normal.png');
  game.load.image('goofyButton', '../assets/img/goofy.png')
  game.load.spritesheet('ball', '../assets/img/wobble.png', 20, 20);
  // game.load.spritesheet('button', '../assets/img/button.png', 120, 40);
  game.load.audio('gameover', '../assets/sound/gameover.wav');
  game.load.audio('score', '../assets/sound/score.wav');
  game.load.audio('blip', '../assets/sound/blip.wav');
  game.load.audio('oof', '../assets/sound/oof.wav');
  game.load.audio('victory', '../assets/sound/victory.mp3');
  gameHeight = game.world.height*0.5;
  gameWidth = game.world.width*0.5;
}

function create() {
  setPhysics();
  loadSound();
  createPaddle();
  createStartButtons();
  addBannerText();
}

function setPhysics() {
  game.physics.startSystem(Phaser.Physics.ARCADE);
  game.physics.arcade.checkCollision.down = false;
}

function createStartButtons() {
  normalButton = game.add.button(gameWidth, gameHeight,
                                'normalButton', startGame, this);
  normalButton.anchor.set(0.5);

  goofyButton = game.add.button(gameWidth, gameHeight - 30,
                                'goofyButton', startGoofyGame, this)

  goofyButton.anchor.set(0.5);
}


function startGame() {
  normalButton.destroy();
  goofyButton.destroy();
  createBall();
  initBricks();
  playing = true;
}

function startGoofyGame() {
  normalButton.destroy();
  goofyButton.destroy();
  goofyMode = true;
  createBall();
  initBricks();
  playing = true;
}

function resetGame() {
  location.reload();
}

function createBall() {
  if (goofyMode) {
    ball = game.add.sprite(gameWidth, game.world.height-25, 'brickball');
  } else {
    ball = game.add.sprite(gameWidth, game.world.height-25, 'sam');
  }

  ball.anchor.set(0.5);
  game.physics.enable(ball, Phaser.Physics.ARCADE);
  ball.body.collideWorldBounds = true;
  ball.body.bounce.set(1);

  ball.checkWorldBounds = true;
  ball.events.onOutOfBounds.add(ballLeaveScreen, this);

  ball.body.velocity.set(150, -150)
}

function createPaddle() {
  paddle = game.add.sprite(gameWidth, game.world.height-5, 'paddle');
  paddle.anchor.set(0.5, 1);
  game.physics.enable(paddle, Phaser.Physics.ARCADE);
  paddle.body.immovable = true;
}

function loadSound() {
  scoreSound = game.add.audio('score');
  scoreSound.loop = true;
  scoreSound.volume = 0.1;
  scoreSound.play();

  blipSound = game.add.audio('blip');
  gameoverSound = game.add.audio('gameover');
  oofSound = game.add.audio('oof');
  victorySound = game.add.audio('victory');
}

function addBannerText() {
  livesText = game.add.text(game.world.width-5, 5, 'Lives: '+lives,
                           textStyle);
  livesText.anchor.set(1,0);
  lifeLostText = game.add.text(gameWidth, gameHeight,
                              'Life lost, click to continue', textStyle);
  lifeLostText.anchor.set(0.5);
  lifeLostText.visible = false;

  scoreText = game.add.text(5, 5, 'Points: 0', textStyle);
}

function ballLeaveScreen() {
  lives--;
  if(lives){
    livesText.setText("Lives: "+lives);
    lifeLostText.visible = true;
    ball.reset(gameWidth, game.world.height-25);
    paddle.reset(gameWidth, game.world.height-5);
    gameoverSound.play();
    game.input.onDown.addOnce(function() {
      lifeLostText.visible = false;
      ball.body.velocity.set(150, -150);
    }, this);
  } else {
    gameover();
  }
}

function gameover() {
  scoreSound.loop = false;
  scoreSound.stop();

  ball.kill();

  gameoverSound.play();

  gameoverText = game.add.text(gameWidth, gameHeight + 50,
                              'You lost, game over!', textStyle)
  gameoverText.anchor.set(0.5);
  gameoverText.visible = true;

  resetButton = game.add.button(gameWidth, gameHeight - 20,
                                'reset', resetGame, this);
  resetButton.anchor.set(0.5);
}


function update() {
  if(playing) {
    game.physics.arcade.collide(ball, bricks, ballHitBrick);
    game.physics.arcade.collide(ball, paddle, ballHitPaddle);
    paddle.x = game.input.x || gameWidth;
    ball.angle += 2;
  }
}

function ballHitBrick(ball, brick) {
  brickKill(brick);
  oofSound.play();
  // ball.animations.play('wobble');
  score += 10;
  scoreText.setText('Points: '+score);
  checkWin();
}

function brickKill(brick) {
  var killTween = game.add.tween(brick.scale);
  killTween.to({x:0,y:0}, 200, Phaser.Easing.Linear.None);
  killTween.onComplete.addOnce(function() {
    brick.kill();
  }, this);
  killTween.start();
}

function ballHitPaddle(ball, paddle) {
  hits += 1;
  // ball.animations.play('wobble');
  blipSound.play();
  ball.body.velocity.x = -1*5*(paddle.x-ball.x);

  if (hits >= 10 && paddle.width >= 20) {
    paddle.scale.x -= 0.07;
  }

}

function checkWin() {
  if(score === brickInfo.count.row*brickInfo.count.col*10) {
    winText = game.add.text(gameWidth, gameHeight + 50,
                                'You won, play again?!', textStyle)
    winText.anchor.set(0.5);
    winText.visible = true;

    resetButton = game.add.button(gameWidth, gameHeight - 20,
                                  'reset', resetGame, this);
    resetButton.anchor.set(0.5);

    ball.kill();

    scoreSound.loop = false;
    scoreSound.stop();

    victorySound.play();

  }
}

function initBricks() {
  brickInfo = {
    width: 50,
    height: 20,
    count: {
      row: 7,
      col: 3
    },
    offset: {
      top: 50,
      left: 60
    },
    padding: 10
  }

  bricks = game.add.group();
  for(c=0; c<brickInfo.count.col; c++) {
    for (r=0; r<brickInfo.count.row; r++) {
      setIndividualBrick();
    }
  }
}

function setIndividualBrick() {
  var brickX = (r*(brickInfo.width+brickInfo.padding))+brickInfo.offset.left;
  var brickY = (c*(brickInfo.height+brickInfo.padding))+brickInfo.offset.top;
  if (goofyMode) {
    newBrick = game.add.sprite(brickX, brickY, 'sam');
  } else {
    newBrick = game.add.sprite(brickX, brickY, 'brickball')
  }
  game.physics.enable(newBrick, Phaser.Physics.ARCADE);
  newBrick.body.immovable = true;
  newBrick.anchor.set(0.5);
  bricks.add(newBrick);
}
