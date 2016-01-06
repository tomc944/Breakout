var game = new Phaser.Game(480, 320, Phaser.AUTO, null, {
  preload: preload, create: create, update: update
});

// global variables


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
var blipSound;
var soundDJ;
var gameoverText;
var gameHeight;
var gameWidth;
var winText;

function preload() {
  game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
  game.scale.pageAlignHorizontally = true;
  game.scale.pageAlignVertically = true;
  game.stage.backgroundColor = "#eee";
  game.load.image('sam', '../assets/img/sam.png');
  game.load.image('reset', '../assets/img/reset.png');
  game.load.image('paddle', '../assets/img/paddle.png');
  game.load.image('brick', '../assets/img/brick.png')
  game.load.spritesheet('ball', '../assets/img/wobble.png', 20, 20);
  game.load.spritesheet('button', '../assets/img/button.png', 120, 40);
  game.load.audio('gameover', '../assets/sound/gameover.wav');
  game.load.audio('score', '../assets/sound/score.wav');
  game.load.audio('blip', '../assets/sound/blip.wav');
}

function create() {
  game.physics.startSystem(Phaser.Physics.ARCADE);
  game.physics.arcade.checkCollision.down = false;

  scoreSound = game.add.audio('score');
  scoreSound.loop = true;
  scoreSound.volume = 0.1;
  scoreSound.play();

  blipSound = game.add.audio('blip');

  gameoverSound = game.add.audio('gameover');

  ball = game.add.sprite(gameWidth, game.world.height-25, 'sam');
  // ball.animations.add('wobble', [0,1,0,2,0,1,0,2,0], 24);
  ball.anchor.set(0.5);
  game.physics.enable(ball, Phaser.Physics.ARCADE);
  ball.body.collideWorldBounds = true;
  ball.body.bounce.set(1);

  gameHeight = game.world.height*0.5;
  gameWidth = game.world.width*0.5;

  ball.checkWorldBounds = true;
  ball.events.onOutOfBounds.add(ballLeaveScreen, this);

  paddle = game.add.sprite(gameWidth, game.world.height-5, 'paddle');
  paddle.anchor.set(0.5, 1);
  game.physics.enable(paddle, Phaser.Physics.ARCADE);
  paddle.body.immovable = true;

  startButton = game.add.button(gameWidth, gameHeight,
                                'button', startGame, this, 1, 0, 2);
  startButton.anchor.set(0.5);

  initBricks();

  scoreText = game.add.text(5, 5, 'Points: 0', textStyle);

  addLivesText();
}

function startGame() {
  startButton.destroy();
  ball.body.velocity.set(150, -150);
  playing = true;
}

function resetGame() {
  location.reload();
}

function addLivesText() {
  livesText = game.add.text(game.world.width-5, 5, 'Lives: '+lives,
                           textStyle);
  livesText.anchor.set(1,0);
  lifeLostText = game.add.text(gameWidth, gameHeight,
                              'Life lost, click to continue', textStyle);
  lifeLostText.anchor.set(0.5);
  lifeLostText.visible = false;
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

  gameoverSound.play();

  gameoverText = game.add.text(gameWidth, gameHeight + 50,
                              'You lost, gameover!', textStyle)
  gameoverText.anchor.set(0.5);
  gameoverText.visible = true;

  resetButton = game.add.button(gameWidth, gameHeight - 20,
                                'reset', resetGame, this);
  resetButton.anchor.set(0.5);

}


function update() {
  game.physics.arcade.collide(ball, paddle, ballHitPaddle);
  game.physics.arcade.collide(ball, bricks, ballHitBrick);
  if(playing) {
    paddle.x = game.input.x || gameWidth;
  }
  ball.angle += 2;
}

function ballHitBrick(ball, brick) {
  brickKill(brick);
  blipSound.play();
  ball.animations.play('wobble');
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
  ball.animations.play('wobble');
  blipSound.play();
  ball.body.velocity.x = -1*5*(paddle.x-ball.x);
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
    location.reload();
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
  newBrick = game.add.sprite(brickX, brickY, 'brick');
  game.physics.enable(newBrick, Phaser.Physics.ARCADE);
  newBrick.body.immovable = true;
  newBrick.anchor.set(0.5);
  bricks.add(newBrick);
}
