class Bat extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'bat');
        
        // Add to scene
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Physics properties
        this.body.setGravity(0, -GAME_CONFIG.GRAVITY); // Flying enemy, no gravity
        this.setCollideWorldBounds(true);
        this.setBounce(0.8);
        this.setSize(20, 14);
        this.setOffset(2, 1);
        
        // Enemy state
        this.health = ENEMY_CONFIG.BAT.HEALTH;
        this.maxHealth = ENEMY_CONFIG.BAT.HEALTH;
        this.damage = ENEMY_CONFIG.BAT.DAMAGE;
        this.speed = ENEMY_CONFIG.BAT.SPEED;
        this.attackRange = ENEMY_CONFIG.BAT.ATTACK_RANGE;
        this.flyHeight = ENEMY_CONFIG.BAT.FLY_HEIGHT;
        
        // AI state
        this.state = 'patrol'; // patrol, chase, attack, dead
        this.direction = 1;
        this.startX = x;
        this.startY = y;
        this.patrolRadius = 100;
        this.isAttacking = false;
        this.lastAttackTime = 0;
        this.attackCooldown = 1000;
        
        // Flight patterns
        this.flightPattern = 'circle'; // circle, figure8, hover
        this.patrolAngle = 0;
        this.hoverTimer = 0;
        this.diveSpeed = 150;
        this.isDiving = false;
        
        this.player = null;
        this.detectionRange = 120;
        this.chaseRange = 200;
        
        this.play('bat_fly');
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
        this.updateFlightPattern(delta);
        this.updateAnimation();
    }

    updateAI(time, delta) {
        const distanceToPlayer = this.player ? 
            Phaser.Math.Distance.Between(this.x, this.y, this.player.x, this.player.y) : 999;
        
        switch (this.state) {
            case 'patrol':
                if (distanceToPlayer < this.detectionRange) {
                    this.state = 'chase';
                }
                break;
                
            case 'chase':
                this.handleChase();
                
                if (distanceToPlayer < this.attackRange && !this.isDiving) {
                    this.tryAttack(time);
                }
                
                if (distanceToPlayer > this.chaseRange) {
                    this.state = 'patrol';
                    this.isDiving = false;
                }
                break;
                
            case 'attack':
                // Continue diving until impact or timeout
                if (this.isDiving) {
                    this.handleDive();
                }
                break;
        }
    }

    updateFlightPattern(delta) {
        if (this.state === 'patrol' && !this.isDiving) {
            this.patrolAngle += delta * 0.001;
            
            switch (this.flightPattern) {
                case 'circle':
                    const circleX = this.startX + Math.cos(this.patrolAngle) * this.patrolRadius;
                    const circleY = this.startY + Math.sin(this.patrolAngle) * 30;
                    this.flyToward(circleX, circleY);
                    break;
                    
                case 'figure8':
                    const fig8X = this.startX + Math.sin(this.patrolAngle) * this.patrolRadius;
                    const fig8Y = this.startY + Math.sin(this.patrolAngle * 2) * 40;
                    this.flyToward(fig8X, fig8Y);
                    break;
                    
                case 'hover':
                    this.hoverTimer += delta;
                    if (this.hoverTimer > 2000) {
                        // Switch to random position
                        this.startX += (Math.random() - 0.5) * 200;
                        this.startY += (Math.random() - 0.5) * 60;
                        this.hoverTimer = 0;
                    }
                    this.flyToward(this.startX, this.startY);
                    break;
            }
        }
    }

    flyToward(targetX, targetY) {
        const angleToTarget = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);
        const velocityX = Math.cos(angleToTarget) * this.speed;
        const velocityY = Math.sin(angleToTarget) * this.speed;
        
        this.setVelocity(velocityX, velocityY);
        
        // Flip sprite based on direction
        this.setFlipX(velocityX < 0);
    }

    handleChase() {
        if (!this.player) return;
        
        // Fly toward player with some erratic movement
        const targetX = this.player.x + (Math.sin(Date.now() * 0.005) * 40);
        const targetY = this.player.y - 50 + (Math.cos(Date.now() * 0.003) * 20);
        
        this.flyToward(targetX, targetY);
    }

    tryAttack(time) {
        if (time - this.lastAttackTime > this.attackCooldown) {
            this.attack();
            this.lastAttackTime = time;
        }
    }

    attack() {
        if (!this.player || this.isDiving) return;
        
        this.isAttacking = true;
        this.isDiving = true;
        this.state = 'attack';
        
        // Dive toward player
        const angleToPlayer = Phaser.Math.Angle.Between(
            this.x, this.y, this.player.x, this.player.y
        );
        
        this.setVelocity(
            Math.cos(angleToPlayer) * this.diveSpeed,
            Math.sin(angleToPlayer) * this.diveSpeed
        );
        
        // Timeout for dive attack
        this.scene.time.delayedCall(1500, () => {
            this.isDiving = false;
            this.isAttacking = false;
            this.state = 'chase';
        });
    }

    handleDive() {
        // Continue diving, but slow down gradually
        this.setVelocity(this.body.velocity.x * 0.98, this.body.velocity.y * 0.98);
        
        // Check for collision with player
        if (this.player) {
            const distanceToPlayer = Phaser.Math.Distance.Between(
                this.x, this.y, this.player.x, this.player.y
            );
            
            if (distanceToPlayer < this.attackRange) {
                this.player.takeDamage(this.damage);
                this.isDiving = false;
                this.isAttacking = false;
                this.state = 'chase';
                
                // Bounce back after attack
                this.setVelocity(-this.body.velocity.x * 0.5, -50);
            }
        }
    }

    updateAnimation() {
        if (this.isDiving) {
            this.setTint(0xff6666);
        } else if (this.state === 'chase') {
            this.setTint(0xffaaaa);
        } else {
            this.clearTint();
        }
        
        // Flap animation speed based on velocity
        const speed = Math.sqrt(this.body.velocity.x ** 2 + this.body.velocity.y ** 2);
        if (speed > 20) {
            // Fast flapping
            this.setScale(1 + Math.sin(Date.now() * 0.02) * 0.1);
        } else {
            // Slow flapping
            this.setScale(1 + Math.sin(Date.now() * 0.01) * 0.05);
        }
    }

    takeDamage(amount) {
        this.health -= amount;
        
        // Visual feedback
        this.setTint(0xff0000);
        this.scene.time.delayedCall(100, () => {
            this.clearTint();
        });
        
        // Erratic flight when damaged
        this.setVelocity(
            (Math.random() - 0.5) * 200,
            (Math.random() - 0.5) * 200 - 50
        );
        
        if (this.health <= 0) {
            this.handleDeath();
        } else {
            this.state = 'chase';
            this.isDiving = false;
        }
    }

    handleDeath() {
        if (this.state === 'dead') return;
        
        this.state = 'dead';
        this.isDiving = false;
        this.isAttacking = false;
        
        // Re-enable gravity for death fall
        this.body.setGravity(0, GAME_CONFIG.GRAVITY);
        this.setTint(0x666666);
        
        this.scene.sound.play('enemy_death', { volume: 0.2 });
        
        // Spinning fall death animation
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            angle: 720,
            duration: 1200,
            ease: 'Power2',
            onComplete: () => {
                this.destroy();
            }
        });
        
        this.body.enable = false;
        
        // Score for bat
        const gameState = Game.getGameState(this.scene);
        Game.updateGameState(this.scene, { score: gameState.score + 150 });
    }

    reset(x, y) {
        this.health = this.maxHealth;
        this.state = 'patrol';
        this.direction = 1;
        this.startX = x;
        this.startY = y;
        this.isAttacking = false;
        this.isDiving = false;
        this.lastAttackTime = 0;
        this.patrolAngle = 0;
        this.hoverTimer = 0;
        
        this.setPosition(x, y);
        this.setVelocity(0, 0);
        this.setAlpha(1);
        this.setAngle(0);
        this.setScale(1);
        this.clearTint();
        this.setFlipX(false);
        
        // Remove gravity for flying
        this.body.setGravity(0, -GAME_CONFIG.GRAVITY);
        this.body.enable = true;
        this.play('bat_fly');
        
        // Randomize flight pattern
        const patterns = ['circle', 'figure8', 'hover'];
        this.flightPattern = patterns[Math.floor(Math.random() * patterns.length)];
    }
}
