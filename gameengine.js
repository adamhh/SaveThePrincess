// This game shell was happily modified from Googler Seth Ladd's "Bad Aliens" game and his Google IO talk in 2011

class GameEngine {
    constructor() {
        this.entities = [];
        this.ctx = null;
        this.surfaceWidth = null;
        this.surfaceHeight = null;

        this.left = false;
        this.right = false;
        this.up = false;
        this.down = false;
        this.A = false;
        this.B = false;
        this.C = false;
        this.One = false;
        this.Two = false;
        this.Three = false;

    };

    init(ctx) { // called after page has loaded
        this.ctx = ctx;
        this.surfaceWidth = this.ctx.canvas.width;
        this.surfaceHeight = this.ctx.canvas.height;
        this.startInput();
        this.timer = new Timer();
    };

    start() {
        var that = this;
        (function gameLoop() {
            that.loop();
            requestAnimFrame(gameLoop, that.ctx.canvas);
        })();
    };

    startInput() {
        var that = this;

        if (PARAMS.START === false) {
            this.ctx.canvas.addEventListener("click", function (e) {
                let click = getXandY(e);
                if (click.x > 344 && click.x < 602 && click.y > 344 && click.y < 494) {
                    PARAMS.PLAY = true;
                }
                if (PARAMS.CONTROLS && click) {
                    PARAMS.CONTROLS = false;
                    PARAMS.START = true;
                }
                if (PARAMS.PAUSE) {
                    if (click.y > 465 && click.y < 480) {
                        if (click.x > 335 && click.x < 385) {
                            PARAMS.VOLUME = 0;
                        } else if (click.x > 390 && click.x < 640) {
                            PARAMS.VOLUME = Math.floor((click.x - 390) / 2.5);
                        }

                    } else if (click.y > 504 && click.y < 540) {
                        if (click.x > 353 && click.x < 445) PARAMS.DIFFICULTY = PARAMS.EASY;
                        if (click.x > 465 && click.x < 615) PARAMS.DIFFICULTY = PARAMS.NORMAL;
                        if (click.x > 640 && click.x < 734) PARAMS.DIFFICULTY = PARAMS.HARD;
                    }
                }
            }, false);

        }
        var getXandY = function (e) {
            var x = e.clientX - that.ctx.canvas.getBoundingClientRect().left;
            var y = e.clientY - that.ctx.canvas.getBoundingClientRect().top;

            return { x: x, y: y };
        }

        this.ctx.canvas.addEventListener("keydown", function (e) {
            switch (e.code) {
                case "ArrowLeft":
                case "KeyA":
                    that.left = true;
                    break;
                case "ArrowRight":
                case "KeyD":
                    that.right = true;
                    break;
                case "ArrowUp":
                case "KeyW":
                    that.up = true;
                    break;
                case "ArrowDown":
                case "KeyS":
                    that.down = true;
                    break;
                case "KeyZ":
                case "Comma":
                    that.B = true;
                    break;
                case "KeyX":
                case "Period":
                    that.A = true;

                    break;
                case "KeyC":
                case "Slash":
                    that.C = true;
                    break;
                case "Digit1":
                    that.One = true;
                    that.Two = false;
                    that.Three = false;
                    break;
                case "Digit2":
                    that.One = false;
                    that.Two = true;
                    that.Three = false;
                    break;
                case "Digit3":
                    that.One = false;
                    that.Two = false;
                    that.Three = true;
                    break;
                case "Escape":
                    PARAMS.PAUSE = !PARAMS.PAUSE;
                    break;
                case "KeyQ":
                    if (PARAMS.GAMEOVER) PARAMS.STARTOVER = true;
                    break;
                case "KeyR":
                    if (PARAMS.GAMEOVER) PARAMS.RESPAWN = true;
            }
        }, false);

        this.ctx.canvas.addEventListener("keyup", function (e) {
            switch (e.code) {
                case "ArrowLeft":
                case "KeyA":
                    that.left = false;
                    break;
                case "ArrowRight":
                case "KeyD":
                    that.right = false;
                    break;
                case "ArrowUp":
                case "KeyW":
                    that.up = false;
                    break;
                case "ArrowDown":
                case "KeyS":
                    that.down = false;
                    break;
                case "KeyZ":
                case "Comma":
                    that.B = false;
                    break;
                case "KeyX":
                case "Period":
                    that.A = false;
                    break;
                case "KeyC":
                case "Slash":
                    that.C = false;
                    break;
            }
        }, false);
    };

    addEntity(entity) {
        this.entities.push(entity);
    };

    draw() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.save();
        for (var i = 0; i < this.entities.length; i++) {
            this.entities[i].draw(this.ctx);
        }
        this.camera.draw(this.ctx);
    };

    update() {
        var entitiesCount = this.entities.length;

        for (var i = 0; i < entitiesCount; i++) {
            var entity = this.entities[i];

            if (entity && !entity.removeFromWorld) {
                entity.update();
            }
        }
        this.camera.update();

        for (var i = this.entities.length - 1; i >= 0; --i) {
            if (this.entities[i].removeFromWorld) {
                this.entities.splice(i, 1);
            }
        }
    };

    loop() {
        this.clockTick = this.timer.tick();
        this.update();
        this.draw();
    };
};