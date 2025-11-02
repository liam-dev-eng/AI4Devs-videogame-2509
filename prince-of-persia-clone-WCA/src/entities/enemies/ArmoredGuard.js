class ArmoredGuard extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'armored_guard');
        
        // Add to scene
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Physics properties
        this.setCollideWorldBounds(true);
        this.setBounce(0.05); // Less bouncy due to armor
        this.setSize(30, 32);
        this.setOffset(1, 0);
        
        // Enemy state (stronger than regular guard)
        this.health = ENEMY_CONFIG.ARMORED_GUARD.HEALTH;
        this.maxHealth = ENEMY_CONFIG.ARMORED_GUARD.HEALTH;
        this.damage = ENEMY_CONFIG.ARMORED_GUARD.DAMAGE;
        this.speed = ENEMY_CONFIG.ARMORED_GUARD.SPEED;
        this.attackRange = ENEMY_CONFIG.ARMORED_GUARD.ATTACK_RANGE;
        this.patrolDistance = ENEMY_CONFIG.ARMORED_GUARD.PATROL_DISTANCE;
        
        // AI state
        this.state = 'patrol';
        this.direction = 1;
        this.startX = x;
        this.patrolLeft = x - this.patrolDistance / 2;
        this.patrolRight = x + this.patrolDistance / 2;
        this.lastAttackTime = 0;
        this.isAttacking = false;
        this.attackDuration = 600; // Slower but more powerful attacks
        this.attackTimer = 0;
        
        // Special armored guard properties
        this.isBlocking = false;
        this.blockChance = 0.3; // 30% chance to block frontal attacks
        this.vulnerableFromBehind = true;
        
        this.player = null;
        this.detectionRange = 120; // Shorter detection due to helmet
        this.chaseRange = 180;
        
        this.play('armored_guard_idle');
    }

    setPlayer(player) {
        this.player = player;
    }

    update(time, delta) {
        if (this.health <= 0) {
            this.handleDeath();
            return;
        }
        
        this.updateAI(time, delta);
        this.updateAttack(delta);
        this.updateBlocking();
        this.updateAnimation();
    }

    updateAI(time, delta) {
        if (this.isAttacking) return;
        
        const distanceToPlayer = this.player ? 
            Phaser.Math.Distance.Between(this.x, this.y, this.player.x, this.player.y) : 999;
        
        switch (this.state) {
            case 'patrol':
                this.handlePatrol();
                
                if (distanceToPlayer < this.detectionRange) {
                    this.state = 'chase';
                }
                break;
                
            case 'chase':
                this.handleChase();
                
                if (distanceToPlayer < this.attackRange) {
                    this.tryAttack(time);
                }
                
                if (distanceToPlayer > this.chaseRange) {
                    this.state = 'patrol';
                }
                break;
                
            case 'attack':
                this.setVelocityX(0);
                break;
        }
    }

    handlePatrol() {
        // Slower, more methodical patrol
        if (this.direction === 1) {
            this.setVelocityX(this.speed);
            this.setFlipX(false);
            
            if (this.x >= this.patrolRight) {
                this.direction = -1;
                // Pause at patrol endpoints
                this.scene.time.delayedCall(1000, () => {
                    if (this.state === 'patrol') {
                        this.direction = -1;
                    }
                });
            }
        } else {
            this.setVelocityX(-this.speed);
            this.setFlipX(true);
            
            if (this.x <= this.patrolLeft) {
                this.direction = 1;
                this.scene.time.delayedCall(1000, () => {
                    if (this.state === 'patrol') {
                        this.direction = 1;
                    }
                });
            }
        }
    }

    handleChase() {
        if (!this.player) return;
        
        const directionToPlayer = this.player.x > this.x ? 1 : -1;
        
        // Armored guards are slower but more persistent
        this.setVelocityX(directionToPlayer * this.speed);
        this.setFlipX(directionToPlayer === -1);
        this.direction = directionToPlayer;
    }

    tryAttack(time) {
        if (time - this.lastAttackTime > ENEMY_CONFIG.ARMORED_GUARD.ATTACK_COOLDOWN) {
            this.attack();
            this.lastAttackTime = time;
        }
    }

    attack() {
        this.isAttacking = true;
        this.attackTimer = this.attackDuration;
        this.state = 'attack';
        this.setVelocityX(0);
        
        // Powerful attack with longer windup
        if (this.player) {
            const distanceToPlayer = Phaser.Math.Distance.Between(
                this.x, this.y, this.player.x, this.player.y
            );
            
            if (distanceToPlayer < this.attackRange) {
                // Delayed damage to allow player to dodge
                this.scene.time.delayedCall(400, () => {
                    if (distanceToPlayer < this.attackRange && this.player) {
                        this.player.takeDamage(this.damage);
                        // Camera shake for heavy attack
                        this.scene.cameras.main.shake(300, 0.03);
                    }
                });
            }
        }
    }

    updateAttack(delta) {
        if (this.attackTimer > 0) {
            this.attackTimer -= delta;
        } else if (this.isAttacking) {
            this.isAttacking = false;
            this.state = 'chase';
        }
    }

    updateBlocking() {
        // Randomly raise guard when facing player
        if (this.player && this.state === 'chase' && !this.isAttacking) {
            const isPlayerInFront = (this.direction === 1 && this.player.x > this.x) ||
                                   (this.direction === -1 && this.player.x < this.x);
            
            if (isPlayerInFront && Math.random() < 0.01) { // 1% chance per frame
                this.isBlocking = true;
                this.scene.time.delayedCall(1000, () => {
                    this.isBlocking = false;
                });
            }
        }
    }

    updateAnimation() {
        if (this.isAttacking) {
            this.setTint(0xff9999);
        } else if (this.isBlocking) {
            this.setTint(0x9999ff);
        } else {
            this.clearTint();
        }
    }

    takeDamage(amount) {
        // Check if attack is blocked
        if (this.isBlocking && this.player) {
            const isAttackFromFront = (this.direction === 1 && this.player.x > this.x) ||
                                    (this.direction === -1 && this.player.x < this.x);
            
            if (isAttackFromFront && Math.random() < this.blockChance) {
                // Attack blocked!
                this.setTint(0xffffff);
                this.scene.time.delayedCall(200, () => {
                    this.clearTint();
                });
                
                // Small knockback to player
                if (this.player) {
                    this.player.setVelocityX(this.direction * -50);
                }
                
                return; // No damage taken
            }
        }
        
        // Take damage normally
        this.health -= amount;
        
        // Visual feedback
        this.setTint(0xff0000);
        this.scene.time.delayedCall(150, () => {
            this.clearTint();
        });
        
        // Less knockback due to armor
        const knockbackDirection = this.player ? 
            (this.x > this.player.x ? 1 : -1) : this.direction;
        this.setVelocityX(knockbackDirection * 50);
        
        if (this.health <= 0) {
            this.handleDeath();
        } else {
            this.state = 'chase';
        }
    }

    handleDeath() {
        if (this.state === 'dead') return;
        
        this.state = 'dead';
        this.setVelocity(0, 0);
        this.setTint(0x666666);
        
        this.scene.sound.play('enemy_death', { volume: 0.4 });
        
        // Slower death animation (heavier enemy)
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            angle: 45,
            scaleY: 0.5,
            duration: 1500,
            ease: 'Power2',
            onComplete: () => {
                this.destroy();
            }
        });
        
        this.body.enable = false;
        
        // Higher score for tougher enemy
        const gameState = Game.getGameState(this.scene);
        Game.updateGameState(this.scene, { score: gameState.score + 200 });
    }

    reset(x, y) {
        this.health = this.maxHealth;
        this.state = 'patrol';
        this.direction = 1;
        this.startX = x;
        this.patrolLeft = x - this.patrolDistance / 2;
        this.patrolRight = x + this.patrolDistance / 2;
        this.isAttacking = false;
        this.isBlocking = false;
        this.attackTimer = 0;
        this.lastAttackTime = 0;
        
        this.setPosition(x, y);
        this.setVelocity(0, 0);
        this.setAlpha(1);
        this.setAngle(0);
        this.setScale(1);
        this.clearTint();
        this.setFlipX(false);
        
        this.body.enable = true;
        this.play('armored_guard_idle');
    }
}
