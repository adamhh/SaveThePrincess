
var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./sprites/dragon/dragon_attack.png");
ASSET_MANAGER.queueDownload("./sprites/dragon/dragon_idle.png");
ASSET_MANAGER.queueDownload("./sprites/dragon/dragon_walk.png");
ASSET_MANAGER.queueDownload("./sprites/knight/knight_attack.png");
ASSET_MANAGER.queueDownload("./sprites/knight/knight_idle.png");
ASSET_MANAGER.queueDownload("./sprites/knight/knight_walk.png");
ASSET_MANAGER.queueDownload("./sprites/princess/princess_idle.png");

ASSET_MANAGER.downloadAll(function () {
	var gameEngine = new GameEngine();
	PARAMS.DEBUG = true;
	PARAMS.BLOCKWIDTH = PARAMS.BITWIDTH * PARAMS.SCALE;

	var canvas = document.getElementById('gameWorld');
	var ctx = canvas.getContext('2d');

	PARAMS.CANVAS_WIDTH = canvas.width;

	gameEngine.init(ctx);

	new SceneManager(gameEngine);

	gameEngine.start();
});
