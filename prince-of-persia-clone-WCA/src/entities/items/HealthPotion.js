class HealthPotion extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type = 'small') {
        const spriteKey = type === 'large' ? 'health_potion_large' : 'health_potion_small';
        super(scene, x, y, spriteKey);
        
        // Add to scene
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Physics properties
        this.body.setGravity(0, 200); // Light gravity
        this.setCollideWorldBounds(true);
        this.setBounce(0.3);
        this.setSize(14, 14);
        this.setOffset(1, 1);
        
        // Item properties
        this.type = type;
        this.healAmount = type === 'large' ? 
            ITEM_CONFIG.HEALTH_POTION_LARGE.HEAL_AMOUNT : 
            ITEM_CONFIG.HEALTH_POTION_SMALL.HEAL_AMOUNT;
        
        this.isCollected = false;
        this.floatOffset = Math.random() * Math.PI * 2; // Random float phase
        this.originalY = y;
        
        // Visual effects
        this.glowTween = null;
        this.createGlowEffect();
        this.createFloatingEffect();
        
        // Set tint based on type
        if (type === 'large') {
            this.setTint(0xff4444); // Brighter red for large potions
        } else {
            this.setTint(0xff6666); // Normal red for small potions
        }
    }

    createGlowEffect() {
        // Subtle glow animation
        this.glowTween = this.scene.tweens.add({
            targets: this,
            alpha: { from: 0.8, to: 1.0 },
            duration: 1000 + Math.random() * 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    createFloatingEffect() {
        // Gentle floating motion
        this.scene.tweens.add({
            targets: this,
            y: { from: this.originalY - 5, to: this.originalY + 5 },
            duration: 2000 + Math.random() * 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    update(time, delta) {
        if (this.isCollected) return;
        
        // Add sparkle effect
        this.addSparkleEffect(time);
    }

    addSparkleEffect(time) {
        // Occasional sparkle particles
        if (Math.random() < 0.02) { // 2% chance per frame
            this.createSparkle();
        }
    }

    createSparkle() {
        // Create a simple sparkle effect using a small rectangle
        const sparkle = this.scene.add.rectangle(
            this.x + (Math.random() - 0.5) * 20,
            this.y + (Math.random() - 0.5) * 20,
            2, 2,
            0xffffff
        );
        
        // Animate sparkle
        this.scene.tweens.add({
            targets: sparkle,
            alpha: { from: 1, to: 0 },
            scale: { from: 1, to: 2 },
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                sparkle.destroy();
            }
        });
    }

    collect(player) {
        if (this.isCollected) return false;
        
        this.isCollected = true;
        
        // Check if player needs healing
        if (player.health >= player.maxHealth) {
            // Player is at full health - show message
            this.showMessage('Health Full!');
            return false;
        }
        
        // Heal the player
        player.heal(this.healAmount);
        
        // Visual feedback
        this.createCollectionEffect();
        
        // Show heal amount
        this.showHealAmount();
        
        // Play collection sound
        this.scene.sound.play('collect', { volume: 0.5 });
        
        // Remove the potion
        this.destroy();
        
        return true;
    }

    createCollectionEffect() {
        // Stop existing tweens
        if (this.glowTween) {
            this.glowTween.stop();
        }
        
        // Collection burst effect
        for (let i = 0; i < 8; i++) {
            const particle = this.scene.add.rectangle(
                this.x, this.y, 3, 3, 
                this.type === 'large' ? 0xff2222 : 0xff4444
            );
            
            const angle = (i / 8) * Math.PI * 2;
            const speed = 50 + Math.random() * 30;
            
            this.scene.tweens.add({
                targets: particle,
                x: this.x + Math.cos(angle) * speed,
                y: this.y + Math.sin(angle) * speed,
                alpha: { from: 1, to: 0 },
                scale: { from: 1, to: 0 },
                duration: 600,
                ease: 'Power2',
                onComplete: () => {
                    particle.destroy();
                }
            });
        }
        
        // Scale up and fade out the potion itself
        this.scene.tweens.add({
            targets: this,
            scaleX: 2,
            scaleY: 2,
            alpha: 0,
            duration: 300,
            ease: 'Back.out'
        });
    }

    showHealAmount() {
        const healText = this.scene.add.text(
            this.x, this.y - 20,
            `+${this.healAmount}`,
            {
                fontSize: '14px',
                fontFamily: 'Courier New',
                fill: '#00ff00',
                stroke: '#000000',
                strokeThickness: 1
            }
        ).setOrigin(0.5);
        
        // Animate the text
        this.scene.tweens.add({
            targets: healText,
            y: healText.y - 30,
            alpha: { from: 1, to: 0 },
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                healText.destroy();
            }
        });
    }

    showMessage(message) {
        const messageText = this.scene.add.text(
            this.x, this.y - 20,
            message,
            {
                fontSize: '12px',
                fontFamily: 'Courier New',
                fill: '#ffff00',
                stroke: '#000000',
                strokeThickness: 1
            }
        ).setOrigin(0.5);
        
        this.scene.tweens.add({
            targets: messageText,
            y: messageText.y - 20,
            alpha: { from: 1, to: 0 },
            duration: 1500,
            ease: 'Power2',
            onComplete: () => {
                messageText.destroy();
            }
        });
    }

    reset(x, y) {
        this.isCollected = false;
        this.originalY = y;
        this.setPosition(x, y);
        this.setAlpha(0.8);
        this.setScale(1);
        this.clearTint();
        
        if (this.type === 'large') {
            this.setTint(0xff4444);
        } else {
            this.setTint(0xff6666);
        }
        
        this.body.enable = true;
        this.createGlowEffect();
        this.createFloatingEffect();
    }

    destroy() {
        if (this.glowTween) {
            this.glowTween.stop();
        }
        super.destroy();
    }
}
