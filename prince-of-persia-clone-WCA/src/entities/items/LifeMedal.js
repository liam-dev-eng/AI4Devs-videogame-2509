class LifeMedal extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'life_medal');
        
        // Add to scene
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Physics properties
        this.body.setGravity(0, 150); // Light gravity
        this.setCollideWorldBounds(true);
        this.setBounce(0.4);
        this.setSize(18, 18);
        this.setOffset(1, 1);
        
        // Item properties
        this.maxHealthIncrease = ITEM_CONFIG.LIFE_MEDAL.MAX_HEALTH_INCREASE;
        this.isCollected = false;
        this.originalY = y;
        
        // Visual effects
        this.glowTween = null;
        this.rotationTween = null;
        this.createVisualEffects();
        
        // Set golden tint
        this.setTint(0xffd700);
    }

    createVisualEffects() {
        // Rotating animation
        this.rotationTween = this.scene.tweens.add({
            targets: this,
            rotation: Math.PI * 2,
            duration: 3000,
            repeat: -1,
            ease: 'Linear'
        });
        
        // Pulsing glow effect
        this.glowTween = this.scene.tweens.add({
            targets: this,
            alpha: { from: 0.7, to: 1.0 },
            scale: { from: 0.9, to: 1.1 },
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Floating motion
        this.scene.tweens.add({
            targets: this,
            y: { from: this.originalY - 8, to: this.originalY + 8 },
            duration: 2500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    update(time, delta) {
        if (this.isCollected) return;
        
        // Add magical sparkle effects
        this.addMagicalEffects(time);
    }

    addMagicalEffects(time) {
        // More frequent sparkles for this rare item
        if (Math.random() < 0.05) { // 5% chance per frame
            this.createMagicalSparkle();
        }
        
        // Occasional golden ray effect
        if (Math.random() < 0.01) { // 1% chance per frame
            this.createGoldenRay();
        }
    }

    createMagicalSparkle() {
        const sparkle = this.scene.add.rectangle(
            this.x + (Math.random() - 0.5) * 30,
            this.y + (Math.random() - 0.5) * 30,
            3, 3,
            Math.random() > 0.5 ? 0xffd700 : 0xffffff
        );
        
        this.scene.tweens.add({
            targets: sparkle,
            alpha: { from: 1, to: 0 },
            scale: { from: 0.5, to: 1.5 },
            rotation: Math.PI * 2,
            duration: 800,
            ease: 'Power2',
            onComplete: () => {
                sparkle.destroy();
            }
        });
    }

    createGoldenRay() {
        // Create vertical golden ray
        const ray = this.scene.add.rectangle(
            this.x, this.y - 30,
            2, 60,
            0xffd700
        ).setAlpha(0);
        
        this.scene.tweens.add({
            targets: ray,
            alpha: { from: 0, to: 0.8 },
            scaleX: { from: 0.1, to: 1 },
            duration: 200,
            yoyo: true,
            ease: 'Power2',
            onComplete: () => {
                ray.destroy();
            }
        });
    }

    collect(player) {
        if (this.isCollected) return false;
        
        this.isCollected = true;
        
        // Increase player's maximum health
        player.increaseMaxHealth(this.maxHealthIncrease);
        
        // Visual feedback
        this.createCollectionEffect();
        
        // Show the health increase
        this.showHealthIncrease();
        
        // Play special collection sound
        this.scene.sound.play('collect', { volume: 0.7, rate: 0.8 }); // Lower pitch for special item
        
        // Camera flash effect
        this.scene.cameras.main.flash(500, 255, 215, 0, false); // Golden flash
        
        // Add to score (high value item)
        const gameState = Game.getGameState(this.scene);
        Game.updateGameState(this.scene, { score: gameState.score + 500 });
        
        // Remove the medal
        this.destroy();
        
        return true;
    }

    createCollectionEffect() {
        // Stop existing tweens
        if (this.glowTween) {
            this.glowTween.stop();
        }
        if (this.rotationTween) {
            this.rotationTween.stop();
        }
        
        // Epic collection burst effect
        for (let i = 0; i < 12; i++) {
            const particle = this.scene.add.rectangle(
                this.x, this.y, 4, 4, 0xffd700
            );
            
            const angle = (i / 12) * Math.PI * 2;
            const speed = 80 + Math.random() * 40;
            
            this.scene.tweens.add({
                targets: particle,
                x: this.x + Math.cos(angle) * speed,
                y: this.y + Math.sin(angle) * speed,
                alpha: { from: 1, to: 0 },
                scale: { from: 1, to: 0 },
                rotation: Math.PI * 4,
                duration: 1000,
                ease: 'Power2',
                onComplete: () => {
                    particle.destroy();
                }
            });
        }
        
        // Central golden explosion
        for (let i = 0; i < 6; i++) {
            const ray = this.scene.add.rectangle(
                this.x, this.y, 2, 40, 0xffd700
            ).setRotation((i / 6) * Math.PI * 2);
            
            this.scene.tweens.add({
                targets: ray,
                scaleY: { from: 1, to: 3 },
                alpha: { from: 1, to: 0 },
                duration: 600,
                ease: 'Power2',
                onComplete: () => {
                    ray.destroy();
                }
            });
        }
        
        // Scale up and fade out the medal itself
        this.scene.tweens.add({
            targets: this,
            scaleX: 3,
            scaleY: 3,
            alpha: 0,
            rotation: this.rotation + Math.PI * 2,
            duration: 600,
            ease: 'Back.out'
        });
    }

    showHealthIncrease() {
        // Show max health increase
        const healthText = this.scene.add.text(
            this.x, this.y - 30,
            `MAX HEALTH +${this.maxHealthIncrease}!`,
            {
                fontSize: '16px',
                fontFamily: 'Courier New',
                fill: '#ffd700',
                stroke: '#000000',
                strokeThickness: 2
            }
        ).setOrigin(0.5);
        
        // Animate the text with golden effect
        this.scene.tweens.add({
            targets: healthText,
            y: healthText.y - 40,
            alpha: { from: 1, to: 0 },
            scale: { from: 0.8, to: 1.2 },
            duration: 2000,
            ease: 'Power2',
            onComplete: () => {
                healthText.destroy();
            }
        });
        
        // Additional "LIFE MEDAL!" text
        const medalText = this.scene.add.text(
            this.x, this.y - 50,
            'LIFE MEDAL!',
            {
                fontSize: '14px',
                fontFamily: 'Courier New',
                fill: '#ffffff',
                stroke: '#ffd700',
                strokeThickness: 1
            }
        ).setOrigin(0.5);
        
        this.scene.tweens.add({
            targets: medalText,
            y: medalText.y - 30,
            alpha: { from: 1, to: 0 },
            duration: 1800,
            ease: 'Power2',
            onComplete: () => {
                medalText.destroy();
            }
        });
    }

    reset(x, y) {
        this.isCollected = false;
        this.originalY = y;
        this.setPosition(x, y);
        this.setAlpha(0.7);
        this.setScale(0.9);
        this.setRotation(0);
        this.setTint(0xffd700);
        
        this.body.enable = true;
        this.createVisualEffects();
    }

    destroy() {
        if (this.glowTween) {
            this.glowTween.stop();
        }
        if (this.rotationTween) {
            this.rotationTween.stop();
        }
        super.destroy();
    }
}
