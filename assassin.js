class Assassin {
    constructor(game, x, y) {
        Object.assign(this, {game, x, y});
        this.game.knight = this;

        // spritesheet
        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/assassin.png");
        this.spritesheetSword = ASSET_MANAGER.getAsset("./sprites/assassin_sword.png");
        this.spritesheetBow = ASSET_MANAGER.getAsset("./sprites/assassin_bow.png");


        // knights's state variables
        this.facing = 0; // 0 = right, 1 = left
        this.state = 0;  // 0 idle, 1, walking , 3 attacking
        this.weapon = 1; //0 hand, 1 sword, 2 bow
        this.dead = false;

        //timer for various things
        this.testTimer = new Timer();
        this.time1 = this.testTimer.getTime();
        this.time2 = this.time1;

        //boolean flag for double jump
        this.jumpFlag = false;
        this.velocity = {x: 0, y: 0};
        this.fallAcc = 2000;
        this.updateBB();

        //load animation
        this.animations = [];
        this.deadAnimL = [];
        this.deadAnimR = [];
        this.loadAnimations();
    };

    loadAnimations() {
        for (var i = 0; i < 5; i++) {  //Action State: 0-idle,1-walking,2-attacking,3-jumping,4-running
            this.animations.push([]);
            for (var j = 0; j < 2; j++) { //Direction State: 0-right, 1-left
                this.animations[i].push([]);
                for (var k = 0; k < 3; k++) { //Weapon State: 0-unequipped, 1-sword, 2-bow
                    this.animations[i][j].push([]);
                }
            }
        }
        for (var h = 0; h < 3; h++) {
            this.deadAnimL.push([]);
            this.deadAnimR.push([]);
        }
        //idle animation for state 0
        // facing right
        this.animations[0][0][0] = new Animator(this.spritesheet, 35, 16, 65, 91, 12,
            0.05, 125.05, false, true);

        // facing left
        this.animations[0][1][0] = new Animator(this.spritesheet, 30, 115, 75, 91, 12,
            0.05, 115.05, true, true);

        //walking animation for state 1
        // facing right
        this.animations[1][0][0] = new Animator(this.spritesheet, 25, 216, 65, 91, 12,
            0.05, 125.05, false, true);

        // facing left
        this.animations[1][1][0] = new Animator(this.spritesheet, 45, 320, 70, 91, 12,
            0.05, 120.05, true, true);

        //attacking animation
        // facing right
        this.animations[2][0][0] = new Animator(this.spritesheet, 35, 630, 95, 91, 10,
            0.05, 95.05, false, true);

        // facing left
        this.animations[2][1][0] = new Animator(this.spritesheet, 50, 735, 95, 91, 10,
            0.05, 95.05, true, true);

        //jumping
        // facing right
        this.animations[3][0][0] = new Animator(this.spritesheet, 12, 1170, 90, 100, 1,
            .2, 100.05, false, true);
        //facing left
        this.animations[3][1][0] = new Animator(this.spritesheet, 20, 1270, 100, 100, 1,
            .2, 90.05, false, true);

        //running
        // facing right
        this.animations[4][0][0] = new Animator(this.spritesheet, 43, 415, 65, 91, 8,
            0.07, 125.05, false, true);

        // facing left
        this.animations[4][1][0] = new Animator(this.spritesheet, 33, 520, 75, 91, 8,
            0.05, 115.05, true, true);

        //death
        // facing right
        this.deadAnimR[0] = new Animator(this.spritesheet, 0, 860, 105, 120, 11,
            .07, 85.05, false, false);
        //facing left
        this.deadAnimL[0] = new Animator(this.spritesheet, 18, 1000, 105, 120, 11,
            .07, 85.05, true, false);

        //------------------------------for sword animations ---------------------------------

        //idle animation for state 0
        // facing right
        this.animations[0][0][1] = new Animator(this.spritesheetSword, 6, 16, 105, 91, 6,
            0.09, 85.05, false, true);

        // facing left
        this.animations[0][1][1] = new Animator(this.spritesheetSword, 5, 115, 105, 91, 6,
            0.09, 85.05, true, true);

        //walking animation for state 1
        // facing right
        this.animations[1][0][1] = new Animator(this.spritesheetSword, 25, 214, 105, 91, 10,
            0.05, 85.05, false, true);

        // facing left
        this.animations[1][1][1] = new Animator(this.spritesheetSword, 10, 318, 105, 91, 12,
            0.05, 85.05, true, true);

        //attacking animation
        // facing right
        this.animations[2][0][1] = new Animator(this.spritesheetSword, 18, 615, 155, 105, 10,
            0.05, 35.05, false, true);

        // facing left
        this.animations[2][1][1] = new Animator(this.spritesheetSword, 0, 720, 155, 105, 10,
            0.05, 35.05, true, true);

        //jumping
        // facing right
        this.animations[3][0][1] = new Animator(this.spritesheetSword, 12, 1155, 140, 100, 1,
            .2, 50.05, false, true);
        //facing left
        this.animations[3][1][1] = new Animator(this.spritesheetSword, 5, 1270, 140, 100, 1,
            .2, 50.05, false, true);

        //running
        // facing right
        this.animations[4][0][1] = new Animator(this.spritesheetSword, 43, 415, 105, 91, 8,
            0.06, 85.05, false, true);

        // facing left
        this.animations[4][1][1] = new Animator(this.spritesheetSword, 0, 520, 105, 91, 8,
            0.06, 85.05, true, true);

        //death
        // facing right
        this.deadAnimR[1] = new Animator(this.spritesheetSword, 0, 837, 115, 150, 9,
            .06, 75.05, false, false);
        //facing left
        this.deadAnimL[1] = new Animator(this.spritesheetSword, 50, 986, 125, 150, 9,
            .06, 65.05, true, false);


        //for bow animations ---------------------------------
        //idle animation for state 0
        // facing right
        this.animations[0][0][2] = new Animator(this.spritesheetBow, 35, 16, 65, 91, 12,
            0.05, 125.05, false, true);

        // facing left
        this.animations[0][1][2] = new Animator(this.spritesheetBow, 30, 115, 75, 91, 12,
            0.05, 115.05, true, true);

        //walking animation for state 1
        // facing right
        this.animations[1][0][2] = new Animator(this.spritesheetBow, 25, 216, 65, 91, 12,
            0.05, 125.05, false, true);

        // facing left
        this.animations[1][1][2] = new Animator(this.spritesheetBow, 45, 320, 70, 91, 12,
            0.05, 120.05, true, true);

        //attacking animation
        // facing right
        this.animations[2][0][2] = new Animator(this.spritesheetBow, 35, 630, 95, 91, 10,
            0.05, 95.05, false, true);

        // facing left
        this.animations[2][1][2] = new Animator(this.spritesheetBow, 50, 735, 95, 91, 10,
            0.05, 95.05, true, true);

        //jumping
        // facing right
        this.animations[3][0][2] = new Animator(this.spritesheetBow, 12, 1170, 90, 100, 1,
            .2, 100.05, false, true);
        //facing left
        this.animations[3][1][2] = new Animator(this.spritesheetBow, 20, 1270, 100, 100, 1,
            .2, 90.05, false, true);

        //running
        // facing right
        this.animations[4][0][2] = new Animator(this.spritesheetBow, 43, 415, 65, 91, 8,
            0.07, 125.05, false, true);

        // facing left
        this.animations[4][1][2] = new Animator(this.spritesheetBow, 33, 520, 75, 91, 8,
            0.05, 115.05, true, true);

        //death
        // facing right
        this.deadAnimR[2] = new Animator(this.spritesheetBow, 0, 860, 105, 120, 11,
            .07, 85.05, false, false);
        //facing left
        this.deadAnimL[2] = new Animator(this.spritesheetBow, 25, 990, 105, 120, 11,
            .07, 85.05, true, false);


    };

    updateBB() {
        this.lastBB = this.BB;
        if (this.facing === 0) {
            this.BB = new BoundingBox(this.x, this.y, 65, 91);
        } else {
            this.BB = new BoundingBox(this.x, this.y, 65, 91);
        }
    };

    die() {
        this.velocity.y = -640;
        this.dead = true;

    };

    update() {
        this.time2 = this.testTimer.getTime();
        //console.log("(" + Math.floor(this.x) + "," + Math.floor(this.y) + ")");
        const TICK = this.game.clockTick;

        //-------------adjust constants to alter physics-----------
        //run
        let max_run = 200;         //adjust for maximum run speed
        let acc_run = 300;         //adjust for maximum acceleration
        const ACC_SPRINT = 600;   //adjust for maximum sprint acc
        const MAX_SPRINT = 800     //adjust for maximum sprint

        //skids
        const DEC_SKID = 4000;
        const TURN_SKID = 50;
        //jump
        const JUMP_ACC = 700;     //adjust for maximum jump acc
        const MAX_JUMP = 1000;    //adjust for maximum jump height
        const DBL_JUMP_MOD = 200; //adjust for double jump boost
        //falling
        const MAX_FALL = 1000;  //adjust for fall speed
        const STOP_FALL = 1575;
        //in air deceleration
        const AIR_DEC = 2;
        // if (this.y > 1000 ) this.dead = true;


        if (this.dead) {
            this.velocity.y = 0;
            this.velocity.x = 0;
            this.BB = new BoundingBox(0, 0 , 0 ,0);
        } else {
            // collision
            var that = this;
            let canFall = true;
            this.game.entities.forEach(function (entity) {
                if (entity instanceof Dragon) {
                    if (entity.SBB && that.BB.collide(entity.SBB)) {
                        if (entity instanceof Dragon) {
                            if (that.lastBB.left >= entity.SBB.right) { //collisions <-
                                that.x = that.lastBB.left + 3.8;
                                that.updateBB();
                            } else if (that.lastBB.right <= entity.SBB.left) {  //collisions ->
                                that.x = that.lastBB.left - 15;
                                that.updateBB();
                            }
                        }
                    }
                    if (entity.ABB && that.BB.collide(entity.ABB)) {
                        that.dead = true;
                    }
                }
                if ((entity.BB && that.BB.collide(entity.BB))
                    && (entity instanceof Land || entity instanceof Cloud || entity instanceof Background
                        || entity instanceof Portal || entity instanceof Dragon)) {
                    if (entity instanceof Cloud) {
                        if (that.BB.bottom >= entity.BB.top && (that.BB.bottom - entity.BB.top) < 10) {
                            that.y = entity.BB.y - that.BB.height;
                            that.velocity.y = 0;
                            canFall = false;
                        }
                    } else if (that.velocity.y > 0) { //falling
                        if (that.BB.bottom >= entity.BB.top && (that.BB.bottom - entity.BB.top) < 20) {
                            that.y = entity.BB.top - that.BB.height;
                            that.velocity.y = 0;
                            canFall = false;
                        }
                    } else if (entity instanceof Portal) {
                        that.x = -1750;
                        that.y = 614;

                    } else if (that.BB.bottom >= entity.BB.top && (that.BB.bottom - entity.BB.top)) {
                        canFall = false;
                    } else {
                        canFall = true;
                    }
                }

            });
            //console.log(this.y);
            if (this.y > 3000) {
                this.velocity.x = 0;
                this.x = -1700;
                this.y = 1800;
            }
            let yVel = Math.abs(this.velocity.y);
            //this physics will need a fine tuning;
            //set facing state field
            if (!this.game.B) {
                this.jumpFlag = false;
            }
            if (this.game.right) {
                this.facing = 0;
                this.state = 1;
            } else if (this.game.left) {
                this.facing = 1;
                this.state = 1;
            } else if (this.game.A) {
                this.state = 2;
            }
            if (this.game.B) {
                this.state = 3;
            } else if (!this.game.A && !this.game.B && !this.game.right && !this.game.left) {
                this.state = 0;
            }
            if (this.game.C) {
                if (this.game.left || this.game.right) {
                    this.state = 4;
                }
                acc_run = ACC_SPRINT;
                max_run = MAX_SPRINT;
            }

            //if moving right and then face left, skid
            if (this.game.left && this.velocity.x > 0 && yVel < 20) {
                this.velocity.x -= TURN_SKID;
            }
            //if moving left ann then face right, skid
            if (this.game.right && this.velocity.x < 0 && yVel < 20) {
                this.velocity.x += TURN_SKID;
            }
            //if you unpress left and right while moving right
            if (!this.game.right && !this.game.left) {
                if (this.facing === 0) { //moving right
                    if (this.velocity.x > 0 && yVel < 20) {
                        this.velocity.x -= DEC_SKID * TICK;
                    } else if (yVel < 20) {
                        this.velocity.x = 0;
                    } else if (this.velocity.x > 0) { //this is where you control horizontal deceleration when in air
                        this.velocity.x -= AIR_DEC;
                    }
                } else { //if you unpress left and right while moving left
                    if (this.velocity.x < 0 && yVel < 20) {
                        this.velocity.x += DEC_SKID * TICK;
                    } else if (yVel < 20) {
                        this.velocity.x = 0;
                    } else if (this.velocity.x < 0) { //this is where you control horizontal deceleration when in air
                        this.velocity.x += AIR_DEC;
                    }
                }
            }
            //Run physics
            if (this.facing === 0) {                        //facing right
                if (this.game.right && !this.game.left) {   //and pressing right.
                    if (yVel < 10 && !this.game.B) {        //makes sure you are on ground
                        this.velocity.x += acc_run * TICK;
                    }
                }
            } else if (this.facing === 1) {                  //facing left
                if (!this.game.right && this.game.left) {   //and pressing left.
                    if (yVel < 10 && !this.game.B) {        //makes sure you are on ground
                        this.velocity.x -= acc_run * TICK;
                    }
                }
            }

            if (this.game.B) {
                canFall = true;
                let timeDiff = this.time2 - this.time1;
                if (this.velocity.y === 0) { // add double jump later
                    this.time1 = this.testTimer.getTime();
                    this.velocity.y -= JUMP_ACC;
                    this.fallAcc = STOP_FALL;
                    this.jumpFlag = true;
                } else if (!this.jumpFlag && timeDiff > 100 && timeDiff < 200) {
                    this.velocity.y -= DBL_JUMP_MOD;
                    this.fallAcc = STOP_FALL;
                }
            }


            // max speed calculation
            if (this.velocity.x >= max_run) this.velocity.x = max_run;
            if (this.velocity.x <= -max_run) this.velocity.x = -max_run;

            // update position
            if (canFall) { //this makes sure we aren't applying velocity if we are on ground/platform
                this.velocity.y += this.fallAcc * TICK;
                this.y += this.velocity.y * TICK * PARAMS.SCALE;
            }

            if (this.velocity.y >= MAX_FALL) this.velocity.y = MAX_FALL;
            if (this.velocity.y <= -MAX_JUMP) this.velocity.y = -MAX_FALL;
            this.x += this.velocity.x * TICK * PARAMS.SCALE;

            this.updateBB(); //Update your bounding box every tick
        }
    };


    draw(ctx) {
        let xOffset = 0;
        let yOffset = 0;
        if (this.dead) {
            if (this.weapon === 1 && this.facing === 0) {
                xOffset = -75;
                yOffset = -45;
            } else if (this.weapon === 1 && this.facing === 1) {
                xOffset = -0;
                yOffset = -42;
            } else if (this.weapon === 2 && this.facing === 0) {
                xOffset = -20;
                yOffset = -20
            } else if (this.weapon === 3 && this.facing === 1) {
                xOffset = -20;
                yOffset = -20;
            } else {
                yOffset = -25;
            }
            if (this.facing === 0) {
                this.deadAnimR[this.weapon].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x + xOffset,
                                                      this.y - this.game.camera.y + yOffset, 1);
            } else {
                this.deadAnimL[this.weapon].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x + xOffset,
                                                      this.y - this.game.camera.y + yOffset, 1);
            }
        } else {
            if (this.weapon === 0) {
                xOffset = 0;
                yOffset = 0;
            } else if (this.weapon === 1) {
                if (this.state === 1 && this.facing === 1) {
                    xOffset = -15;
                    yOffset = 0;
                } else if (this.state === 2 && this.facing === 0) {
                    xOffset = -40;
                    yOffset = -13;
                } else if (this.state === 2 && this.facing === 1) {
                    xOffset = -68;
                    yOffset = -15;
                } else if (this.state === 3 && this.facing === 1) {
                    xOffset = -45;
                    yOffset = 0;
                } else {
                    xOffset = -30;
                    yOffset = 0;
                }
            } else { //if bow
                xOffset = 0;
                yOffset = 0;
            }
            this.animations[this.state][this.facing][this.weapon].drawFrame(this.game.clockTick, ctx,
                this.x - this.game.camera.x + xOffset, this.y - this.game.camera.y + yOffset, 1);
        }



        //
        // if (this.dead && this.facing === 0) {
        //     //this.deadAnimR[this.weapon].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y - 20, 1);
        // } else if (this.dead && this.facing === 1) {
        //     //this.deadAnimL[this.weapon].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y - 20, 1);
        // } else if (this.facing === 0) {
        //     if (this.state === 2 && this.weapon === 1) {
        //         this.animations[this.state][this.facing][this.weapon].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x - 14,
        //             this.y - this.game.camera.y - 14,1);
        //     } else {
        //         this.animations[this.state][this.facing][this.weapon].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x,
        //             this.y - this.game.camera.y,1);
        //     }
        //
        // } else {
        //     if (this.weapon === 1) {
        //         if ((this.state === 1 ) && this.facing === 1) {
        //             this.animations[this.state][this.facing][this.weapon].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x - 15,
        //                 this.y - this.game.camera.y, 1);
        //         } else if (this.state === 2) {
        //             this.animations[this.state][this.facing][this.weapon].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x - 70,
        //                 this.y - this.game.camera.y - 18, 1);
        //         } else if (this.state === 3 && this.facing === 1) {
        //             this.animations[this.state][this.facing][this.weapon].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x - 45,
        //                 this.y - this.game.camera.y, 1);
        //         } else {
        //             this.animations[this.state][this.facing][this.weapon].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x - 30,
        //                 this.y - this.game.camera.y, 1);
        //         }
        //
        //     } else {
        //         this.animations[this.state][this.facing][this.weapon].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x,
        //             this.y - this.game.camera.y, 1);
        //     }
        // }
        if (PARAMS.DEBUG) {
            ctx.strokeStyle = 'Red';
            ctx.strokeRect(this.BB.x - this.game.camera.x, this.BB.y - this.game.camera.y, this.BB.width, this.BB.height);
        }

    }
};