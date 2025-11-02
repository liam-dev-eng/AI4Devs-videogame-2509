class LevelCompleteScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LevelCompleteScene' });
    }

    init(data) {
        this.levelNumber = data.levelNumber || 1;
        this.timeBonus = data.timeBonus || 0;
        this.totalScore = data.totalScore || 0;
    }

    create() {
        // Get game state
        this.gameState = Game.getGameState(this);
        
        // Set background
        this.cameras.main.setBackgroundColor('#000033');
        
        // Create celebration effects
        this.createCelebrationEffects();
        
        // Create completion text
        this.createCompletionText();
        
        // Create stats display
        this.createStatsDisplay();
        
        // Create progress display
        this.createProgressDisplay();
        
        // Create navigation options
        this.createNavigationOptions();
        
        // Play completion sound
        this.sound.play('level_complete', { volume: 0.6 });
        
        // Set up input
        this.setupInput();
        
        // Auto-continue timer (optional)
        this.setupAutoContinue();
    }

    createCelebrationEffects() {
        // Create fireworks-like particle effects
        for (let i = 0; i < 20; i++) {
            this.time.delayedCall(i * 200, () => {
                this.createFirework();
            });
        }
        
        // Create floating sparkles
        this.createSparkles();
    }

    createFirework() {
        const x = 100 + Math.random() * (GAME_CONFIG.WIDTH - 200);
        const y = 100 + Math.random() * (GAME_CONFIG.HEIGHT - 200);
        
        // Create explosion center
        const center = this.add.circle(x, y, 3, 0xffffff);
        
        // Create radiating particles
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const distance = 50 + Math.random() * 30;
            const color = Phaser.Display.Color.HSVToRGB(Math.random(), 1, 1);
            
            const particle = this.add.circle(x, y, 2, color.color);
            
            this.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * distance,
                y: y + Math.sin(angle) * distance,
                alpha: { from: 1, to: 0 },
                scale: { from: 1, to: 0 },
                duration: 1000 + Math.random() * 500,
                ease: 'Power2',
                onComplete: () => {
                    particle.destroy();
                }
            });
        }
        
        // Animate center
        this.tweens.add({
            targets: center,
            scale: { from: 1, to: 3 },
            alpha: { from: 1, to: 0 },
            duration: 800,
            ease: 'Power2',
            onComplete: () => {
                center.destroy();
            }
        });
    }

    createSparkles() {
        // Continuous sparkle generation
        this.sparkleTimer = this.time.addEvent({
            delay: 300,
            callback: () => {
                const sparkle = this.add.star(
                    Math.random() * GAME_CONFIG.WIDTH,
                    Math.random() * GAME_CONFIG.HEIGHT,
                    5, 2, 4, 0xffd700
                );
                
                this.tweens.add({
                    targets: sparkle,
                    alpha: { from: 1, to: 0 },
                    scale: { from: 0.5, to: 1.5 },
                    rotation: Math.PI * 2,
                    duration: 2000,
                    ease: 'Sine.easeOut',
                    onComplete: () => {
                        sparkle.destroy();
                    }
                });
            },
            loop: true
        });
    }

    createCompletionText() {
        // Main completion message
        const completionText = this.add.text(GAME_CONFIG.WIDTH / 2, 100, 
            `LEVEL ${this.levelNumber} COMPLETE!`, 
            {
                fontSize: '36px',
                fontFamily: 'Courier New',
                fill: '#00ff00',
                stroke: '#000000',
                strokeThickness: 2
            }
        ).setOrigin(0.5);
        
        // Animate completion text
        this.tweens.add({
            targets: completionText,
            scale: { from: 0.5, to: 1 },
            alpha: { from: 0, to: 1 },
            duration: 1000,
            ease: 'Back.out'
        });
        
        // Level name if available
        if (this.cache.json.exists(`level${this.levelNumber}`)) {
            const levelData = this.cache.json.get(`level${this.levelNumber}`);
            if (levelData.name) {
                this.add.text(GAME_CONFIG.WIDTH / 2, 140, 
                    `"${levelData.name}"`, 
                    {
                        fontSize: '20px',
                        fontFamily: 'Courier New',
                        fill: '#cccccc',
                        style: 'italic'
                    }
                ).setOrigin(0.5);
            }
        }
    }

    createStatsDisplay() {
        const startY = 200;
        const lineHeight = 30;
        
        // Time bonus
        this.add.text(GAME_CONFIG.WIDTH / 2, startY, 
            `Time Bonus: ${this.timeBonus}`, 
            {
                fontSize: '18px',
                fontFamily: 'Courier New',
                fill: '#ffffff'
            }
        ).setOrigin(0.5);
        
        // Current score
        this.add.text(GAME_CONFIG.WIDTH / 2, startY + lineHeight, 
            `Score: ${this.totalScore}`, 
            {
                fontSize: '18px',
                fontFamily: 'Courier New',
                fill: '#ffff00'
            }
        ).setOrigin(0.5);
        
        // Lives remaining
        this.add.text(GAME_CONFIG.WIDTH / 2, startY + lineHeight * 2, 
            `Lives: ${this.gameState.lives}`, 
            {
                fontSize: '18px',
                fontFamily: 'Courier New',
                fill: '#ff6666'
            }
        ).setOrigin(0.5);
        
        // Health status
        this.add.text(GAME_CONFIG.WIDTH / 2, startY + lineHeight * 3, 
            `Health: ${this.gameState.playerHealth}/${this.gameState.playerMaxHealth}`, 
            {
                fontSize: '18px',
                fontFamily: 'Courier New',
                fill: '#00ff00'
            }
        ).setOrigin(0.5);
    }

    createProgressDisplay() {
        const startY = 340;
        
        // Progress bar background
        const progressBg = this.add.rectangle(GAME_CONFIG.WIDTH / 2, startY, 300, 20, 0x333333);
        
        // Progress bar fill
        const progress = Math.min(this.levelNumber / LEVEL_CONFIG.TOTAL_LEVELS, 1);
        const progressBar = this.add.rectangle(
            GAME_CONFIG.WIDTH / 2 - 150 + (progress * 300) / 2, 
            startY, 
            progress * 300, 
            16, 
            0x00aa00
        );
        
        // Progress text
        this.add.text(GAME_CONFIG.WIDTH / 2, startY - 40, 
            `Progress: ${this.levelNumber}/${LEVEL_CONFIG.TOTAL_LEVELS}`, 
            {
                fontSize: '16px',
                fontFamily: 'Courier New',
                fill: '#ffffff'
            }
        ).setOrigin(0.5);
        
        // Animate progress bar
        progressBar.scaleX = 0;
        this.tweens.add({
            targets: progressBar,
            scaleX: 1,
            duration: 1500,
            ease: 'Power2.out',
            delay: 500
        });
    }

    createNavigationOptions() {
        const buttonStyle = {
            fontSize: '20px',
            fontFamily: 'Courier New',
            fill: '#ffffff',
            backgroundColor: '#006600',
            padding: { x: 20, y: 10 }
        };
        
        const hoverStyle = {
            fontSize: '20px',
            fontFamily: 'Courier New',
            fill: '#ffff00',
            backgroundColor: '#008800',
            padding: { x: 20, y: 10 }
        };
        
        const startY = 450;
        
        // Check if there's a next level
        const hasNextLevel = this.levelNumber < LEVEL_CONFIG.TOTAL_LEVELS;
        
        if (hasNextLevel) {
            // Continue to next level
            const continueButton = this.add.text(GAME_CONFIG.WIDTH / 2, startY, 
                'CONTINUE TO NEXT LEVEL', buttonStyle
            )
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                continueButton.setStyle(hoverStyle);
            })
            .on('pointerout', () => {
                continueButton.setStyle(buttonStyle);
            })
            .on('pointerdown', () => {
                this.continueToNextLevel();
            });
        } else {
            // Game completed!
            this.add.text(GAME_CONFIG.WIDTH / 2, startY - 50, 
                'CONGRATULATIONS!', 
                {
                    fontSize: '24px',
                    fontFamily: 'Courier New',
                    fill: '#ffd700'
                }
            ).setOrigin(0.5);
            
            this.add.text(GAME_CONFIG.WIDTH / 2, startY - 20, 
                'You have completed all levels!', 
                {
                    fontSize: '16px',
                    fontFamily: 'Courier New',
                    fill: '#ffffff'
                }
            ).setOrigin(0.5);
        }
        
        // Return to menu button
        const menuButton = this.add.text(GAME_CONFIG.WIDTH / 2, startY + 50, 
            'RETURN TO MENU', 
            {
                fontSize: '16px',
                fontFamily: 'Courier New',
                fill: '#cccccc',
                backgroundColor: '#444444',
                padding: { x: 15, y: 8 }
            }
        )
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => {
            menuButton.setStyle({
                fontSize: '16px',
                fontFamily: 'Courier New',
                fill: '#ffffff',
                backgroundColor: '#666666',
                padding: { x: 15, y: 8 }
            });
        })
        .on('pointerout', () => {
            menuButton.setStyle({
                fontSize: '16px',
                fontFamily: 'Courier New',
                fill: '#cccccc',
                backgroundColor: '#444444',
                padding: { x: 15, y: 8 }
            });
        })
        .on('pointerdown', () => {
            this.returnToMenu();
        });
    }

    setupInput() {
        // Keyboard shortcuts
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        
        // Space or Enter to continue
        this.spaceKey.on('down', () => {
            if (this.levelNumber < LEVEL_CONFIG.TOTAL_LEVELS) {
                this.continueToNextLevel();
            } else {
                this.returnToMenu();
            }
        });
        
        this.enterKey.on('down', () => {
            if (this.levelNumber < LEVEL_CONFIG.TOTAL_LEVELS) {
                this.continueToNextLevel();
            } else {
                this.returnToMenu();
            }
        });
        
        // Escape to menu
        this.escKey.on('down', () => {
            this.returnToMenu();
        });
    }

    setupAutoContinue() {
        // Auto-continue after 10 seconds if no input
        this.autoContinueTimer = this.time.delayedCall(10000, () => {
            if (this.levelNumber < LEVEL_CONFIG.TOTAL_LEVELS) {
                this.continueToNextLevel();
            } else {
                this.returnToMenu();
            }
        });
        
        // Show countdown
        this.countdownText = this.add.text(GAME_CONFIG.WIDTH / 2, GAME_CONFIG.HEIGHT - 50, 
            '', 
            {
                fontSize: '14px',
                fontFamily: 'Courier New',
                fill: '#888888'
            }
        ).setOrigin(0.5);
        
        this.countdownTimer = this.time.addEvent({
            delay: 1000,
            callback: () => {
                const remaining = Math.ceil((this.autoContinueTimer.delay - this.autoContinueTimer.elapsed) / 1000);
                if (remaining > 0) {
                    const action = this.levelNumber < LEVEL_CONFIG.TOTAL_LEVELS ? 'continuing' : 'returning to menu';
                    this.countdownText.setText(`Auto-${action} in ${remaining} seconds... (Press any key to continue now)`);
                } else {
                    this.countdownText.setText('');
                }
            },
            repeat: 9
        });
    }

    continueToNextLevel() {
        // Stop timers
        if (this.autoContinueTimer) {
            this.autoContinueTimer.remove();
        }
        if (this.countdownTimer) {
            this.countdownTimer.remove();
        }
        if (this.sparkleTimer) {
            this.sparkleTimer.remove();
        }
        
        // Update game state for next level
        Game.updateGameState(this, { currentLevel: this.levelNumber + 1 });
        
        // Emit level complete event
        this.game.events.emit('levelComplete', {
            levelNumber: this.levelNumber,
            score: this.timeBonus
        });
        
        // Transition to next level
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('GameScene');
        });
    }

    returnToMenu() {
        // Stop timers
        if (this.autoContinueTimer) {
            this.autoContinueTimer.remove();
        }
        if (this.countdownTimer) {
            this.countdownTimer.remove();
        }
        if (this.sparkleTimer) {
            this.sparkleTimer.remove();
        }
        
        // Transition to menu
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('MenuScene');
        });
    }
}
