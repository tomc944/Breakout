


function setPhysics() {
  game.physics.startSystem(Phaser.Physics.ARCADE);
  game.physics.arcade.checkCollision.down = false;
}

function createStartButton() {
  startButton = game.add.button(gameWidth, gameHeight,
                                'button', startGame, this, 1, 0, 2);
  startButton.anchor.set(0.5);
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
