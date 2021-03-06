/**
 * This class is shadow warrior.  It handles the animation,
 * updating, collision detection, and general behavior of the entities.
 *
 * @author Adam Hall
 */
class ShadowWarrior {
    constructor(game, x, y, isKey) {
        Object.assign(this, {game, x, y, isKey});
        //spritesheets
        this.setFields();
        this.updateBB();
        this.loadAnimations();

    }

    setFields() {
        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/characters/shadow_assassin.png");
        this.facing = 0; //0 for right, 1 for left
        this.state = 0;  //0 for idle, 1 for running, 2 for attacking

        this.velocity = { x: 0, y: 0 };
        this.width = 55;
        this.height = 45;
        //this.locations = { 1 : { x: -1000, y: 800 }, 2: { x: -1000, y: 950 }, 3: { x: -5000, y: -5000 }};

        this.animations = [];
        this.disappearAnim = [];
        this.deadAnim = [];

        this.attackWindow = false;
        this.attackTick = 0;
        this.timer = new Timer();
        this.time1 = this.timer.getTime();
        this.time2 = this.time1;

        this.dead = false;
        this.disappear = false;
        this.health = 100;
    }

    //Create the animations for each state and direction facing
    loadAnimations() {
        //initialize
        for (var i = 0; i < 3; i++) { //0 idle 1 running 2 attacking
            this.animations.push([]);
            for (var j = 0; j < 2; j++) { //2 directions, 0 for right, 1 for left
                this.animations[i].push([]);
            }
        }

        //load animations
        //idle
        this.animations[0][0] =  new Animator(this.spritesheet, 15, 0, 55, 90, 6, .08,
            135.05, false, true);
        this.animations[0][1] =  new Animator(this.spritesheet, 20, 135, 55, 90, 6, .08,
            135.05, true, true);
        //running
        this.animations[1][0] =  new Animator(this.spritesheet, 5, 302, 75, 90, 8, .08,
            115.05, false, true);
        this.animations[1][1] =  new Animator(this.spritesheet, 25, 437, 75, 90, 8, .08,
            115.05, true, true);

        //attacking
        this.animations[2][0] = new Animator(this.spritesheet, 0, 605, 150, 135, 7, .08,
            80.05, false, true);
        this.animations[2][1] = new Animator(this.spritesheet, 10, 866, 150, 135, 7, .08,
            80.05, true, true);
        //maybe ranged attack next

        //disappear animation
        this.disappearAnim[0] = new Animator(this.spritesheet, 20, 1088, 95, 110, 6, .14,
            95.05, false, true);
        this.disappearAnim[1] = new Animator(this.spritesheet, 30, 1315, 95, 110, 6, .14,
            95.05, true, true);

        //death animation
        this.deadAnim[0] = new Animator(this.spritesheet, 45, 1580, 90, 90, 6, .12,
            100.05, false, false);
        this.deadAnim[1] = new Animator(this.spritesheet, 35, 1722, 90, 90, 6, .12,
            100.05, true, false);

    }

    //Update bounding box based on state
    updateBB() {
        this.lastBB = this.BB;
        this.BB = new BoundingBox(this.x, this.y, this.width, this.height);
        this.sight = new BoundingBox(this.x - 650, this.y, 1225, this.height);
        if (this.disappear) {
            this.ABB = new BoundingBox(0, 0, 0, 0);
        } else if (this.state === 2 && this.attackWindow) {
            ASSET_MANAGER.playAsset("./audio/sword_swing_enemy.mp3")
            if (this.facing === 0) {
                this.ABB = new BoundingBox(this.x + 60, this.y, 75, 15); //facing 0
            } else {
                this.ABB = new BoundingBox(this.x - 45, this.y, 75, 15);
            }
        } else {
            this.ABB = new BoundingBox(0, 0, 0, 0);
        }
    }

    //called when health = 0
    vanish() {
        this.BB = new BoundingBox(0,0,0,0);
        this.time1 = this.timer.getTime();
        this.velocity.x = 0;
        this.velocity.y = 0;
        this.disappear = true;
        this.updateBB();
    }

    //called continuously to update behavior based on changing game state
    update() {
        if (this.velocity.y > 50) this.vanish();
        if (PARAMS.START && !PARAMS.PAUSE) {
            if (this.health < 1 && this.disappear === false) {
                this.time1 = this.timer.getTime();
                this.time2 = this.time1;
                this.vanish();
            }
            const TICK = this.game.clockTick;
            this.attackTick += TICK;

            const MAX_RUN = 350;
            const RUN_ACC = 20;
            const MAX_FALL = 100;
            const FALL_ACC = .5;
            const ATTACK_WINDOW = .3;
            let moveTo = 0;
            let that = this;
            let inSight = false;
            //collision system
            if (!this.dead && !this.disappear) {
                this.game.entities.forEach(function (entity) {
                    if (entity.BB && that.BB.collide(entity.BB)) { //BB collision
                        if (that.velocity.y > 0) { //falling
                            if ((entity instanceof Land || entity instanceof FloatingLand) &&
                                that.lastBB.bottom <= entity.BB.top) { //things you can land on & landed true
                                //that.state = 3;
                                that.y = entity.BB.top - that.lastBB.height;
                                that.velocity.y = 0;
                                that.updateBB();
                            } //can change to states if falling here
                        }
                    }

                    if (entity instanceof Assassin) {
                        if (entity.BB && that.sight.collide(entity.BB)) { //if dragon sees assassin
                            inSight = true;
                            let flipX = 0;
                            that.facing === 1 ? flipX = 22 : flipX = 20;
                            if (entity.BB.x - that.BB.x < flipX) {
                                that.facing = 1;
                            } else {
                                that.facing = 0;

                            }
                            moveTo = entity.BB.x;
                        }

                        if (entity.ABB && that.BB.collide(entity.ABB)) {
                            that.health-= (2.5 + PARAMS.SOULS/200) ;
                            ASSET_MANAGER.playAsset("./audio/sword_thud.mp3")
                            //that.facing === 0 ? that.x -= 5 : that.x += 5;
                            that.updateBB();
                        }
                    }
                    if (entity instanceof Arrow) {
                        if (entity.BB && that.BB.collide(entity.BB)) {
                            if (entity.isAssassin === true) {
                                that.health-= (20 + PARAMS.SOULS/100);
                                that.velocity.x *= .6;
                            }
                        }
                    }
                });
                let playerDiff = 0;
                if (this.facing === 1 && inSight) {                                 //facing and in sight <-
                    playerDiff = this.x - moveTo;
                    //console.log(playerDiff + " <-");
                    if (playerDiff < 525 && playerDiff > 75) {                       //if close walk to attack position
                        this.velocity.x -= RUN_ACC;
                        this.state = 1;
                    } else if (playerDiff < 75 && playerDiff > -25) {              //attack if in zone
                        this.velocity.x = 0;
                        this.state = 2;
                    } else {                                                        //else stop
                        this.velocity.x = 0;
                        this.state = 0;
                    }

                } else if (inSight) {                                               //facing and in sight ->
                    playerDiff = moveTo - this.x;
                    //console.log(playerDiff + " ->");
                    if (playerDiff < 550 && playerDiff > 110) {                     //in zone will walk towards
                        this.velocity.x += RUN_ACC;
                        this.state = 1;
                    } else if (playerDiff < 110 && playerDiff > -25) {
                        this.velocity.x = 0;
                        this.state = 2;
                    } else {                                                        //else stop
                        this.velocity.x = 0;
                        this.state = 0;
                    }
                } else {
                    this.state = 0;
                    this.velocity.x = 0;
                }
                if (this.attackTick > ATTACK_WINDOW) {
                    this.attackWindow = true;
                    this.attackTick = false;
                }
                else {
                    this.attackWindow = false;
                }

                // update position
                this.velocity.y += FALL_ACC;
                if (this.velocity.y >= MAX_FALL) this.velocity.y = MAX_FALL;
                //if (this.velocity.y <= -MAX_FALL) this.velocity.y = -MAX_FALL;
                this.y += this.velocity.y;

                if (this.velocity.x >= MAX_RUN) this.velocity.x = MAX_RUN;
                if (this.velocity.x <= -MAX_RUN) this.velocity.x = -MAX_RUN;
                this.x += this.velocity.x * TICK * PARAMS.SCALE;
                this.updateBB();

                //if dead
            } else {
                this.time2 = this.timer.getTime();
                if (this.time2 - this.time1 > 750) {
                this.game.addEntity(new Soul(this.game, this.x + 20, this.y - 15, 100, this.isKey))
                this.removeFromWorld = true;
                }
            }
        }

    }

    //Draw shadow warrior, offsetting x and y based on state and direction facing
    draw(ctx) {
        let yOffset = 0;
        let xOffset = 0;
        if (this.disappear) {
            yOffset = -22;
            yOffset -= 45;
            this.facing === 0 ? xOffset = -10 : xOffset = -18;
            this.disappearAnim[this.facing].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x + xOffset,
                this.y - this.game.camera.y + yOffset, 1);
        } else if (this.dead) {
            yOffset -= 45;
            this.deadAnim[this.facing].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x,
                this.y - this.game.camera.y + yOffset, 1);
        } else {
            if (this.state === 2) {
                yOffset = -45;
                this.facing === 0 ? xOffset = 0 : xOffset = -60;
            }
            yOffset -= 45;
            this.animations[this.state][this.facing].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x + xOffset,
                this.y - this.game.camera.y + yOffset, 1);
        }


        if (PARAMS.DEBUG) {
            ctx.strokeStyle = 'Red';
            ctx.strokeRect(this.BB.x - this.game.camera.x, this.BB.y - this.game.camera.y, this.BB.width, this.BB.height);
            ctx.strokeStyle = 'Blue';
            if (this.ABB) ctx.strokeRect(this.ABB.x - this.game.camera.x, this.ABB.y - this.game.camera.y, this.ABB.width, this.ABB.height);
            ctx.strokeStyle = "White";
            ctx.strokeRect(this.sight.x - this.game.camera.x, this.sight.y - this.game.camera.y, this.sight.width, this.sight.height);

        }
    }
}

/**
 * This class is for the RedEye enemy.  It handles the animation,
 * updating, collision detection, and general behavior of the entity.
 */

class RedEye {
    constructor(game, x, y) {
        Object.assign(this, {game, x, y});
        //spritesheets
        this.setFields();
        this.updateBB();
        this.loadAnimations();

    }

    setFields() {
        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/characters/red_eye_bow.png");
        this.facing = 0; //0 for right, 1 for left
        this.state = 0; //0 for idle, 1 for attacking

        this.velocity = { x: 0, y: 0 };
        this.width = 55;
        this.height = 90;

        this.animations = [];
        this.disappearAnim = [];

        this.timer = new Timer();
        this.time1 = this.timer.getTime();
        this.time2 = this.time1;

        this.bowTime = 0;
        this.disappear = false;
        this.health = 100;
    }

    //Create animations for each state and direction facing from spritesheet
    loadAnimations() {
        for (var i = 0; i < 2; i++) {
            this.animations.push([]);
            for(let j = 0; j < 2; j++) {
                this.animations[i].push([]);
            }
        }
        //load animations
        //idle
        this.animations[0][0] = new Animator(this.spritesheet,25, 519, 85, 90, 1, .1,
            105.05, false, true);
        this.animations[0][1] = new Animator(this.spritesheet,116, 519, 85, 90, 1, .1,
            105.05, false, true);
        //attacking
        this.animations[1][0] = new Animator(this.spritesheet,5, 0, 85, 90, 8, .16,
            105.05, false, true);
        this.animations[1][1] = new Animator(this.spritesheet,5, 109, 85, 90, 8, .16,
            105.05, true, true);
        //death animation
        this.disappearAnim[0] = new Animator(this.spritesheet, 20, 260, 95, 110, 5, .14,
            95.05, false, true);
        this.disappearAnim[1] = new Animator(this.spritesheet, 30, 381, 95, 110, 5, .14,
            95.05, true, true);

    }

    //Update bounding box based on state and direction facing.
    updateBB() {
        this.lastBB = this.BB;
        this.BB = new BoundingBox(this.x, this.y, this.width, this.height);
        this.sight = new BoundingBox(this.x - 900, this.y - 200, 1910, this.height + 200);
        if (this.disappear) {
            this.ABB = new BoundingBox(0, 0, 0, 0);
        }
        // console.log(this.attacking + " " + this.bowTime);
        if (this.state === 1) {
            if (this.bowTime < 1.3 && this.bowTime > 1.25) {
                this.game.addEntity(new Arrow(this.game, this.x, this.y, this.facing === 1, false));
                this.bowTime = 0;
            }
        }
    }

    //Called when health = 0
    vanish() {
        this.disappear = true;
        this.time1 = this.timer.getTime();
        this.updateBB();
    }

    //Called continuously to update behavior based on changing game state
    update() {
        if (PARAMS.START && !PARAMS.PAUSE) {
            if (this.health < 1 && this.disappear === false) {
                this.time1 = this.timer.getTime();
                this.time2 = this.time1;
                this.vanish();
            }
            const TICK = this.game.clockTick;
            this.bowTime += TICK;
            const MAX_FALL = 100;
            const FALL_ACC = .5;
            let that = this;
            let inSight = false;
            //collision system
            if (!this.disappear) {
                this.game.entities.forEach(function (entity) {
                    if (entity.BB && that.BB.collide(entity.BB)) { //BB collision
                        if (that.velocity.y > 0) { //falling
                            if ((entity instanceof Land || entity instanceof FloatingLand) &&
                                that.lastBB.bottom <= entity.BB.top) { //things you can land on & landed true
                                that.y = entity.BB.top - that.lastBB.height;
                                that.velocity.y = 0;
                                that.updateBB();
                            } //can change to states if falling here
                        }
                    }
                    if (entity instanceof Assassin) {
                        if (entity.BB && that.sight.collide(entity.BB)) {
                            inSight = true;
                            let flipX = 0;
                            that.facing === 1 ? flipX = 22 : flipX = 20;
                            if (entity.BB.x - that.BB.x < flipX) {
                                that.facing = 1;
                            } else {
                                that.facing = 0;

                            }
                        }
                        if (entity.ABB && that.BB.collide(entity.ABB)) {
                            ASSET_MANAGER.playAsset("./audio/sword_thud.mp3")
                            that.health-= (10 + PARAMS.SOULS/100);
                        }

                    }
                    if (entity instanceof Arrow && entity.BB && that.BB.collide(entity.BB)) {
                        if (entity.isAssassin) {
                            that.health-= (25 + PARAMS.SOULS/100);
                        }
                    }

                });
                if (inSight) {
                    this.state = 1;
                    this.updateBB();
                } else {
                    this.state = 0;
                    this.bowTime = 0;
                    this.updateBB();
                }
                // update position

                this.velocity.y += FALL_ACC;
                if (this.velocity.y >= MAX_FALL) this.velocity.y = MAX_FALL;
                this.y += this.velocity.y;
                this.updateBB();

                //if dead
            } else {
                this.time2 = this.timer.getTime();
                if (this.time2 - this.time1 > 600) {
                    this.game.addEntity(new Soul(this.game, this.x + 20, this.y + 30, 75, false));
                    this.removeFromWorld = true;
                }
            }
        }

    }

    //Draw entity state animation, offsetting x and y based on state
    draw(ctx) {
        let yOffset = 0;
        let xOffset = 0;
        if (this.disappear) {
            yOffset = -22;
            this.facing === 0 ? xOffset = -10 : xOffset = -18;
            this.disappearAnim[this.facing].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x + xOffset,
                                                    this.y - this.game.camera.y + yOffset, 1);
        } else {
            this.animations[this.state][this.facing].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x,
                                                this.y - this.game.camera.y, 1);
        }

        if (PARAMS.DEBUG) {
            ctx.strokeStyle = 'Red';
            ctx.strokeRect(this.BB.x - this.game.camera.x, this.BB.y - this.game.camera.y, this.BB.width, this.BB.height);
            ctx.strokeStyle = "White";
            ctx.strokeRect(this.sight.x - this.game.camera.x, this.sight.y - this.game.camera.y, this.sight.width, this.sight.height);
        }
    }
}