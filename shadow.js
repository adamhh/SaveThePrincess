class ShadowWarrior {
    constructor(game, x, y) {
        Object.assign(this, {game, x, y});
        //spritesheets
        this.setFields();
        this.updateBB();
        this.loadAnimations();

    }

    setFields() {
        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/shadow_assassin.png");
        this.facing = 0; //0 for right, 1 for left
        this.state = 0;  //0 for idle, 1 for running, 2 for attacking

        this.velocity = { x: 0, y: 0 };
        this.width = 55;
        this.height = 90;

        this.animations = [];
        this.disappearAnim = [];
        this.deadAnim = [];

        this.timer = new Timer();
        this.time1 = this.timer.getTime();
        this.time2 = this.time1;

        this.attackCount = 5;
        this.dead = false;
        this.disappear = false;
        this.health = 50;
        this.deathCount = 3;
    }

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

    updateBB() {
        this.lastBB = this.BB;
        this.BB = new BoundingBox(this.x, this.y, this.width, this.height);
        this.sight = new BoundingBox(this.x - 400, this.y, 875, this.height);
        if (this.state === 2) {
            if (this.facing === 0) {
                this.ABB = new BoundingBox(this.x + 115, this.y, 25, 80); //facing 0
            } else {
                this.ABB = new BoundingBox(this.x - 50, this.y, 25, 80);
            }
        } else {
            this.ABB = new BoundingBox(0, 0, 0, 0);
        }
    }

    die() {
        this.BB = new BoundingBox(0,0,0,0);
        this.velocity.x = 0
        this.dead = true;
    }

    vanish() {
        this.BB = new BoundingBox(0,0,0,0);
        this.time1 = this.timer.getTime();
        this.velocity.x = 0;
        this.deathCount > 0 ? this.disappear = true : this.die();
    }

    update() {
        if (this.health < 1 && this.disappear === false) {
            this.time1 = this.timer.getTime();
            this.time2 = this.time1;
            this.vanish();
        }
        const TICK = this.game.clockTick;
        const MAX_RUN = 250;
        const RUN_ACC = 200;
        const MAX_FALL = 100;
        const FALL_ACC = .5;
        let moveTo = 0;
        let that = this;
        let inSight = false;
        //collision system
        if (!this.dead && !this.disappear) {
            this.game.entities.forEach(function (entity) {
                if (entity.BB && that.BB.collide(entity.BB)) { //BB collision
                    if (that.velocity.y > 0) { //falling
                        if ((entity instanceof Land || entity instanceof Land) &&
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
                        if ((entity.BB.x - that.sight.x) < (that.sight.x + that.sight.width) - entity.BB.x) {
                            that.facing = 1;
                        } else {
                            that.facing = 0;

                        }
                        moveTo = entity.BB.x;
                    }
                    if (entity.ABB && that.BB.collide(entity.ABB)) {
                        that.health--;
                    }
                }
            });
            let playerDiff = 0;
            if (this.facing === 1 && inSight) {                                 //facing and in sight <-
                playerDiff = this.x - moveTo;
                console.log(playerDiff);
                if (playerDiff < 425 && playerDiff > 65) {                       //if close walk to attack position
                    this.velocity.x -= RUN_ACC;
                    this.state = 1;
                } else if (playerDiff < 65 && playerDiff > -20) {              //attack if in zone
                    this.velocity.x = 0;
                    this.state = 2;
                } else {                                                        //else stop
                    this.velocity.x = 0;
                    this.state = 0;
                }

            } else if (inSight) {                                               //facing and in sight ->
                playerDiff = moveTo - this.x;
                console.log(playerDiff);
                if (playerDiff < 450 && playerDiff > 90) {                     //in zone will walk towards
                    this.velocity.x += RUN_ACC;
                    this.state = 1;
                } else if (playerDiff < 90 && playerDiff > -20) {
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

            // if (this.state === 2) {
            //     this.attackCount++;
            //     this.attackCount % 15 === 0 ? this.attacking = true : this.attacking = false;
            // } else {
            //     this.attacking = false;
            // }
            //this.attacking = true;

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
                this.x = -5000;
                this.y = -5000;
                this.disappear = false;
                this.health = 100;
            }
        }
    }

    draw(ctx) {
        let yOffset = 0;
        let xOffset = 0;
        if (this.disappear) {
            yOffset = -22;
            this.facing === 0 ? xOffset = -10 : xOffset = -18;
            this.disappearAnim[this.facing].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x + xOffset,
                this.y - this.game.camera.y + yOffset, 1);
        } else if (this.dead) {
            this.deadAnim[this.facing].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x,
                this.y - this.game.camera.y, 1);
        } else {
            if (this.state === 2) {
                yOffset = -45;
                this.facing === 0 ? xOffset = 0 : xOffset = -60;
            }
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
