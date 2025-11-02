class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        // Set background
        this.cameras.main.setBackgroundColor(COLORS.BACKGROUND);
        
        // Add background image
        this.add.image(GAME_CONFIG.WIDTH / 2, GAME_CONFIG.HEIGHT / 2, 'background')
            .setScale(1)
            .setAlpha(0.3);

        // Main title
        this.add.text(GAME_CONFIG.WIDTH / 2, 150, 'PRINCE OF PERSIA', {
            fontSize: '48px',
            fontFamily: 'Courier New',
            fill: '#FFD700',
            stroke: '#8B4513',
            strokeThickness: 3,
            shadow: {
                offsetX: 3,
                offsetY: 3,
                color: '#654321',
                blur: 0,
                stroke: false,
                fill: true
            }
        }).setOrigin(0.5);

        this.add.text(GAME_CONFIG.WIDTH / 2, 200, 'CLONE', {
            fontSize: '32px',
            fontFamily: 'Courier New',
            fill: '#DEB887',
            stroke: '#8B4513',
            strokeThickness: 2
        }).setOrigin(0.5);

        // Game stats display
        const gameState = this.registry.get('gameState');
        if (gameState && gameState.score > 0) {
            this.add.text(GAME_CONFIG.WIDTH / 2, 280, `Last Score: ${gameState.score}`, {
                fontSize: '20px',
                fontFamily: 'Courier New',
                fill: '#ffff00'
            }).setOrigin(0.5);

            this.add.text(GAME_CONFIG.WIDTH / 2, 310, `Highest Level: ${gameState.currentLevel - 1}`, {
                fontSize: '20px',
                fontFamily: 'Courier New',
                fill: '#ffff00'
            }).setOrigin(0.5);
        }

        // Menu buttons
        this.createMenuButtons();
        
        // Instructions
        this.createInstructions();
        
        // Set up input
        this.setupInput();
        
        // Add some atmospheric elements
        this.createAtmosphere();
    }

    createMenuButtons() {
        const buttonStyle = {
            fontSize: '24px',
            fontFamily: 'Courier New',
            fill: '#FFD700',
            backgroundColor: '#654321',
            stroke: '#8B4513',
            strokeThickness: 2,
            padding: { x: 20, y: 10 }
        };

        const hoverStyle = {
            fontSize: '24px',
            fontFamily: 'Courier New',
            fill: '#FFFFFF',
            backgroundColor: '#8B4513',
            stroke: '#FFD700',
            strokeThickness: 2,
            padding: { x: 20, y: 10 }
        };

        // Start Game Button
        const startButton = this.add.text(GAME_CONFIG.WIDTH / 2, 380, 'START GAME', buttonStyle)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                startButton.setStyle(hoverStyle);
                this.sound.play('collect', { volume: 0.1 });
            })
            .on('pointerout', () => {
                startButton.setStyle(buttonStyle);
            })
            .on('pointerdown', () => {
                this.startGame();
            });

        // Continue Button (if game in progress)
        const gameState = this.registry.get('gameState');
        if (gameState && gameState.currentLevel > 1) {
            const continueButton = this.add.text(GAME_CONFIG.WIDTH / 2, 430, 'CONTINUE', buttonStyle)
                .setOrigin(0.5)
                .setInteractive({ useHandCursor: true })
                .on('pointerover', () => {
                    continueButton.setStyle(hoverStyle);
                    this.sound.play('collect', { volume: 0.1 });
                })
                .on('pointerout', () => {
                    continueButton.setStyle(buttonStyle);
                })
                .on('pointerdown', () => {
                    this.continueGame();
                });
        }

        // Credits text
        this.add.text(GAME_CONFIG.WIDTH / 2, GAME_CONFIG.HEIGHT - 60, 
            'Made with Phaser 3 - A Prince of Persia Inspired Clone', {
            fontSize: '14px',
            fontFamily: 'Courier New',
            fill: '#888888'
        }).setOrigin(0.5);

        this.add.text(GAME_CONFIG.WIDTH / 2, GAME_CONFIG.HEIGHT - 40, 
            'Original Prince of Persia © Jordan Mechner 1989', {
            fontSize: '12px',
            fontFamily: 'Courier New',
            fill: '#666666'
        }).setOrigin(0.5);
    }

    createInstructions() {
        const instructionStyle = {
            fontSize: '16px',
            fontFamily: 'Courier New',
            fill: '#cccccc',
            align: 'center'
        };

        this.add.text(50, 480, 'CONTROLS:', instructionStyle);
        this.add.text(50, 500, 'Arrow Keys - Move & Jump', instructionStyle);
        this.add.text(50, 520, 'SPACE - Attack with Sword', instructionStyle);
        this.add.text(50, 540, 'DOWN Arrow - Crouch', instructionStyle);

        this.add.text(450, 480, 'OBJECTIVE:', instructionStyle);
        this.add.text(450, 500, 'Navigate through 10 levels', instructionStyle);
        this.add.text(450, 520, 'Defeat enemies and avoid traps', instructionStyle);
        this.add.text(450, 540, 'Collect items to restore health', instructionStyle);
    }

    setupInput() {
        // Keyboard controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

        // Enter or Space to start game
        this.spaceKey.on('down', () => {
            this.startGame();
        });

        this.enterKey.on('down', () => {
            this.startGame();
        });
    }

    createAtmosphere() {
        // Add some flickering torches effect (simulated with tinting rectangles)
        for (let i = 0; i < 3; i++) {
            const torch = this.add.rectangle(
                100 + i * 300, 
                100, 
                20, 
                60, 
                0xff6600
            ).setAlpha(0.6);

            // Flickering animation
            this.tweens.add({
                targets: torch,
                alpha: { from: 0.6, to: 0.3 },
                duration: 500 + Math.random() * 1000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }

        // Subtle background movement
        const bg = this.add.image(GAME_CONFIG.WIDTH / 2, GAME_CONFIG.HEIGHT / 2, 'background')
            .setScale(1.1)
            .setAlpha(0.1);

        this.tweens.add({
            targets: bg,
            x: { from: GAME_CONFIG.WIDTH / 2 - 10, to: GAME_CONFIG.WIDTH / 2 + 10 },
            duration: 8000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    startGame() {
        // Reset game state for new game
        this.game.events.emit('newGame');
        
        // Transition to game scene
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('GameScene');
        });
    }

    continueGame() {
        // Continue from current level
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('GameScene');
        });
    }
}
