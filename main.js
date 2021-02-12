
var ASSET_MANAGER = new AssetManager();
ASSET_MANAGER.queueDownload("./sprites/background/Background.png");
ASSET_MANAGER.queueDownload("./sprites/dragon_sheet.png");
ASSET_MANAGER.queueDownload("./sprites/assassin.png");
ASSET_MANAGER.queueDownload("./sprites/assassin_bow.png");
ASSET_MANAGER.queueDownload("./sprites/assassin_sword.png");
ASSET_MANAGER.queueDownload("./sprites/floating_rock.png");
ASSET_MANAGER.queueDownload("./sprites/portal.png");
ASSET_MANAGER.queueDownload("./sprites/portal_anim.png");
ASSET_MANAGER.queueDownload("./sprites/sign_portal.png");
ASSET_MANAGER.queueDownload("./sprites/floating_bridge.png");
ASSET_MANAGER.queueDownload("./sprites/landblock.png");
ASSET_MANAGER.queueDownload("./sprites/sky_land.png");
ASSET_MANAGER.queueDownload("./sprites/portal.png");
ASSET_MANAGER.queueDownload("./sprites/cloud1.png");
ASSET_MANAGER.queueDownload("./sprites/healthbar.png");
ASSET_MANAGER.queueDownload("./sprites/weaponicons.png");

ASSET_MANAGER.downloadAll(function () {
	var gameEngine = new GameEngine();

	PARAMS.BLOCKWIDTH = PARAMS.BITWIDTH * PARAMS.SCALE;

	var canvas = document.getElementById('gameWorld');
	var ctx = canvas.getContext('2d');

	PARAMS.CANVAS_WIDTH = canvas.width;
	PARAMS.CANVAS_HEIGHT = canvas.height;

	gameEngine.init(ctx);

	new SceneManager(gameEngine);

	gameEngine.start();
});
