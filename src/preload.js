var preload = {

  setup: function() {
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.stage.backgroundColor = "#eee";
    game.load.image('ball', '../assets/img/ball.png');
    game.load.image('reset', '../assets/img/reset.png');
    game.load.image('paddle', '../assets/img/paddle.png');
    game.load.image('brick', '../assets/img/brick.png')
    game.load.spritesheet('ball', '../assets/img/wobble.png', 20, 20);
    game.load.spritesheet('button', '../assets/img/button.png', 120, 40);
    game.load.audio('gameover', '../assets/sound/gameover.wav');
    game.load.audio('score', '../assets/sound/score.wav');
    game.load.audio('blip', '../assets/sound/blip.wav');
  }

}

module.exports = preload;
