class Guard extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'guard');
        
        // Add to scene
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Physics properties
        this.setCollideWorldBounds(true);
        this.setBounce(0.1);
        this.setSize(28, 30);
        this.setOffset(2, 2);
        
        // Enemy state
        this.health = ENEMY_CONFIG.GUARD.HEALTH;
        this.maxHealth = ENEMY_CONFIG.GUARD.HEALTH;
        this.damage = ENEMY_CONFIG.GUARD.DAMAGE;
        this.speed = ENEMY_CONFIG.GUARD.SPEED;
        this.attackRange = ENEMY_CONFIG.GUARD.ATTACK_RANGE;
        this.patrolDistance = ENEMY_CONFIG.GUARD.PATROL_DISTANCE;
        
        // AI state
        this.state = 'patrol'; // patrol, chase, attack, dead
        this.direction = 1; // 1 for right, -1 for left
        this.startX = x;
        this.patrolLeft = x - this.patrolDistance / 2;
        this.patrolRight = x + this.patrolDistance / 2;
        this.lastAttackTime = 0;
        this.isAttacking = false;
        this.attackDuration = 400;
        this.attackTimer = 0;
        
        // Player reference (will be set by game scene)
        this.player = null;
        this.detectionRange = 150;
        this.chaseRange = 200;
        
        // Animation setup
        this.play('guard_idle');
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
        this.updateAnimation();
    }

    updateAI(time, delta) {
        if (this.isAttacking) return;
        
        const distanceToPlayer = this.player ? 
            Phaser.Math.Distance.Between(this.x, this.y, this.player.x, this.player.y) : 999;
        
        switch (this.state) {
            case 'patrol':
                this.handlePatrol();
                
                // Check if player is in detection range
                if (distanceToPlayer < this.detectionRange) {
                    this.state = 'chase';
                }
                break;
                
            case 'chase':
                this.handleChase();
                
                // Check if player is in attack range
                if (distanceToPlayer < this.attackRange) {
                    this.tryAttack(time);
                }
                
                // Stop chasing if player is too far
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
        // Simple back and forth patrol with edge detection
        if (this.direction === 1) {
            this.setVelocityX(this.speed);
            this.setFlipX(false);
            
            if (this.x >= this.patrolRight || !this.body.onFloor()) {
                this.direction = -1;
            }
        } else {
            this.setVelocityX(-this.speed);
            this.setFlipX(true);
            
            if (this.x <= this.patrolLeft || !this.body.onFloor()) {
                this.direction = 1;
            }
        }
    }

    handleChase() {
        if (!this.player) return;
        
        const directionToPlayer = this.player.x > this.x ? 1 : -1;
        
        this.setVelocityX(directionToPlayer * this.speed * 1.5); // Faster when chasing
        this.setFlipX(directionToPlayer === -1);
        this.direction = directionToPlayer;
    }

    tryAttack(time) {
        if (time - this.lastAttackTime > ENEMY_CONFIG.GUARD.ATTACK_COOLDOWN) {
            this.attack();
            this.lastAttackTime = time;
        }
    }

    attack() {
        this.isAttacking = true;
        this.attackTimer = this.attackDuration;
        this.state = 'attack';
        this.setVelocityX(0);
        
        // Create attack hitbox
        if (this.player) {
            const distanceToPlayer = Phaser.Math.Distance.Between(
                this.x, this.y, this.player.x, this.player.y
            );
            
            if (distanceToPlayer < this.attackRange) {
                // Damage player if in range
                this.scene.time.delayedCall(200, () => {
                    if (distanceToPlayer < this.attackRange) {
                        this.player.takeDamage(this.damage);
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
            this.state = 'chase'; // Return to chase after attack
        }
    }

    updateAnimation() {
        // Simple animation logic - could be expanded with more states
        if (this.isAttacking) {
            // Attack animation would go here
            this.setTint(0xff6666);
        } else {
            this.clearTint();
        }
    }

    takeDamage(amount) {
        this.health -= amount;
        
        // Visual feedback
        this.setTint(0xff0000);
        this.scene.time.delayedCall(100, () => {
            this.clearTint();
        });
        
        // Knockback
        const knockbackDirection = this.player ? 
            (this.x > this.player.x ? 1 : -1) : this.direction;
        this.setVelocityX(knockbackDirection * 100);
        
        if (this.health <= 0) {
            this.handleDeath();
        } else {
            // Switch to chase mode when damaged
            this.state = 'chase';
        }
    }

    handleDeath() {
        if (this.state === 'dead') return;
        
        this.state = 'dead';
        this.setVelocity(0, 0);
        this.setTint(0x666666);
        
        // Play death sound
        this.scene.sound.play('enemy_death', { volume: 0.3 });
        
        // Death animation
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            angle: 90,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                this.destroy();
            }
        });
        
        // Disable physics
        this.body.enable = false;
        
        // Add to score
        const gameState = Game.getGameState(this.scene);
        Game.updateGameState(this.scene, { score: gameState.score + 100 });
    }

    reset(x, y) {
        this.health = this.maxHealth;
        this.state = 'patrol';
        this.direction = 1;
        this.startX = x;
        this.patrolLeft = x - this.patrolDistance / 2;
        this.patrolRight = x + this.patrolDistance / 2;
        this.isAttacking = false;
        this.attackTimer = 0;
        this.lastAttackTime = 0;
        
        this.setPosition(x, y);
        this.setVelocity(0, 0);
        this.setAlpha(1);
        this.setAngle(0);
        this.clearTint();
        this.setFlipX(false);
        
        this.body.enable = true;
        this.play('guard_idle');
    }
}
