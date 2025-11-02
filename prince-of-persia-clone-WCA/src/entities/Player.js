class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player_idle');
        
        // Add to scene
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Physics properties
        this.setCollideWorldBounds(true);
        this.setBounce(0.2);
        this.setSize(28, 30); // Collision box
        this.setOffset(2, 2); // Offset for sprite alignment
        
        // Player state
        this.health = PLAYER_CONFIG.MAX_HEALTH;
        this.maxHealth = PLAYER_CONFIG.MAX_HEALTH;
        this.isAttacking = false;
        this.isCrouching = false;
        this.isInvulnerable = false;
        this.facingDirection = 1; // 1 for right, -1 for left
        this.isOnGround = false;
        this.attackCooldown = 0;
        
        // Animation state tracking
        this.currentState = 'idle';
        this.previousState = 'idle';
        
        // Combat properties
        this.attackBox = null;
        this.attackTimer = 0;
        this.attackDuration = 300; // milliseconds
        this.invulnerabilityTimer = 0;
        
        // Input references
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.attackKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        // Initialize systems
        this.setupAnimations();
        this.createAttackBox();
    }

    setupAnimations() {
        // Make sure animations exist before playing them
        if (!this.scene.anims.exists('player_idle')) {
            console.warn('Player animations not loaded yet');
            return;
        }
        
        this.play('player_idle');
    }

    createAttackBox() {
        // Create invisible attack collision box
        this.attackBox = this.scene.physics.add.sprite(this.x, this.y, null);
        this.attackBox.setVisible(false);
        this.attackBox.body.setSize(PLAYER_CONFIG.ATTACK_RANGE, 30);
        this.attackBox.body.enable = false;
        this.attackBox.setImmovable(true);
    }

    update(time, delta) {
        // Update ground detection
        this.updateGroundDetection();
        
        // Handle input and movement
        this.handleInput();
        
        // Update attack system
        this.updateAttack(delta);
        
        // Update animation state
        this.updateAnimations();
        
        // Update attack box position
        this.updateAttackBox();
        
        // Update invulnerability
        this.updateInvulnerability(delta);
    }

    updateGroundDetection() {
        this.isOnGround = this.body.onFloor() || this.body.touching.down;
    }

    handleInput() {
        // Don't process movement input during attack
        if (this.isAttacking) {
            this.setVelocityX(0);
            return;
        }

        // Horizontal movement
        if (this.cursors.left.isDown) {
            this.setVelocityX(-PLAYER_CONFIG.SPEED);
            this.facingDirection = -1;
            this.setFlipX(true);
            this.currentState = this.isOnGround ? 'run' : 'jump';
        } else if (this.cursors.right.isDown) {
            this.setVelocityX(PLAYER_CONFIG.SPEED);
            this.facingDirection = 1;
            this.setFlipX(false);
            this.currentState = this.isOnGround ? 'run' : 'jump';
        } else {
            this.setVelocityX(0);
            this.currentState = this.isOnGround ? 'idle' : 'jump';
        }

        // Crouching
        if (this.cursors.down.isDown && this.isOnGround) {
            this.isCrouching = true;
            this.currentState = 'crouch';
            this.setVelocityX(0);
        } else {
            this.isCrouching = false;
        }

        // Jumping - prevent double jump
        if (Phaser.Input.Keyboard.JustDown(this.cursors.up) && this.isOnGround && !this.isCrouching) {
            this.jump();
        }

        // Attacking
        if (Phaser.Input.Keyboard.JustDown(this.attackKey) && this.attackCooldown <= 0) {
            this.attack();
        }
    }

    jump() {
        this.setVelocityY(PLAYER_CONFIG.JUMP_VELOCITY);
        this.currentState = 'jump';
        this.scene.sound.play('jump', { volume: 0.3 });
    }

    attack() {
        if (this.isAttacking) return;
        
        this.isAttacking = true;
        this.attackTimer = this.attackDuration;
        this.attackCooldown = 500; // milliseconds
        this.currentState = 'attack';
        
        // Enable attack box
        this.attackBox.body.enable = true;
        
        // Play attack sound
        this.scene.sound.play('attack', { volume: 0.4 });
        
        // Camera shake for impact
        this.scene.cameras.main.shake(100, 0.01);
    }

    updateAttack(delta) {
        // Update attack cooldown
        if (this.attackCooldown > 0) {
            this.attackCooldown -= delta;
        }
        
        // Update attack duration
        if (this.attackTimer > 0) {
            this.attackTimer -= delta;
        } else if (this.isAttacking) {
            // End attack
            this.isAttacking = false;
            this.attackBox.body.enable = false;
        }
    }

    updateAttackBox() {
        if (this.attackBox) {
            // Position attack box in front of player
            const offsetX = this.facingDirection * (PLAYER_CONFIG.ATTACK_RANGE / 2 + 15);
            this.attackBox.setPosition(this.x + offsetX, this.y);
        }
    }

    updateAnimations() {
        if (this.currentState !== this.previousState) {
            this.previousState = this.currentState;
            
            switch (this.currentState) {
                case 'idle':
                    if (this.scene.anims.exists('player_idle')) {
                        this.play('player_idle');
                    }
                    break;
                case 'run':
                    if (this.scene.anims.exists('player_run')) {
                        this.play('player_run');
                    }
                    break;
                case 'jump':
                    if (this.scene.anims.exists('player_jump')) {
                        this.play('player_jump');
                    }
                    break;
                case 'attack':
                    if (this.scene.anims.exists('player_attack')) {
                        this.play('player_attack');
                    }
                    break;
                case 'crouch':
                    if (this.scene.anims.exists('player_crouch')) {
                        this.play('player_crouch');
                    }
                    break;
            }
        }
    }

    updateInvulnerability(delta) {
        if (this.isInvulnerable) {
            this.invulnerabilityTimer -= delta;
            
            // Flashing effect
            this.setAlpha(Math.sin(this.invulnerabilityTimer / 50) * 0.5 + 0.5);
            
            if (this.invulnerabilityTimer <= 0) {
                this.isInvulnerable = false;
                this.setAlpha(1);
            }
        }
    }

    takeDamage(amount) {
        if (this.isInvulnerable) return false;
        
        this.health -= amount;
        this.isInvulnerable = true;
        this.invulnerabilityTimer = PLAYER_CONFIG.INVULNERABILITY_TIME;
        
        // Visual feedback
        this.scene.cameras.main.shake(200, 0.02);
        this.setTint(0xff0000);
        
        // Remove tint after brief delay
        this.scene.time.delayedCall(100, () => {
            this.clearTint();
        });
        
        // Play hurt sound
        this.scene.sound.play('hurt', { volume: 0.5 });
        
        // Check for death
        if (this.health <= 0) {
            this.die();
            return true;
        }
        
        // Update health in game state
        Game.updateGameState(this.scene, { playerHealth: this.health });
        
        return false;
    }

    heal(amount) {
        this.health = Math.min(this.health + amount, this.maxHealth);
        
        // Visual feedback
        this.setTint(0x00ff00);
        this.scene.time.delayedCall(200, () => {
            this.clearTint();
        });
        
        // Play collect sound
        this.scene.sound.play('collect', { volume: 0.4 });
        
        // Update health in game state
        Game.updateGameState(this.scene, { playerHealth: this.health });
    }

    increaseMaxHealth(amount) {
        this.maxHealth += amount;
        this.health = this.maxHealth; // Full heal when max health increases
        
        // Visual feedback
        this.setTint(0xffd700);
        this.scene.time.delayedCall(300, () => {
            this.clearTint();
        });
        
        // Update game state
        Game.updateGameState(this.scene, { 
            playerMaxHealth: this.maxHealth,
            playerHealth: this.health 
        });
    }

    die() {
        this.health = 0;
        this.setTint(0x666666);
        
        // Death animation (fade out)
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                this.scene.game.events.emit('playerDeath');
            }
        });
        
        // Disable physics
        this.body.enable = false;
        if (this.attackBox) {
            this.attackBox.body.enable = false;
        }
    }

    reset(x, y) {
        // Reset player state
        const gameState = Game.getGameState(this.scene);
        this.health = gameState.playerHealth;
        this.maxHealth = gameState.playerMaxHealth;
        
        this.isAttacking = false;
        this.isCrouching = false;
        this.isInvulnerable = false;
        this.facingDirection = 1;
        this.attackCooldown = 0;
        this.attackTimer = 0;
        
        // Reset visuals
        this.setAlpha(1);
        this.clearTint();
        this.setFlipX(false);
        
        // Reset position
        this.setPosition(x, y);
        this.setVelocity(0, 0);
        
        // Re-enable physics
        this.body.enable = true;
        
        // Reset animation
        this.currentState = 'idle';
        this.previousState = '';
        this.play('player_idle');
    }

    getAttackBox() {
        return this.attackBox;
    }
}
