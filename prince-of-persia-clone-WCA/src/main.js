// Main game configuration and initialization
class Game {
    constructor() {
        this.config = {
            type: Phaser.AUTO,
            width: GAME_CONFIG.WIDTH,
            height: GAME_CONFIG.HEIGHT,
            parent: 'gameContainer',
            backgroundColor: COLORS.BACKGROUND,
            scene: [
                BootScene,
                PreloadScene,
                MenuScene,
                GameScene,
                LevelCompleteScene
            ],
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: GAME_CONFIG.GRAVITY },
                    debug: false
                }
            },
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH
            },
            render: {
                pixelArt: true,
                antialias: false,
                roundPixels: true,
                powerPreference: 'high-performance'
            }
        };

        this.game = null;
        this.gameState = {
            currentLevel: 1,
            playerMaxHealth: PLAYER_CONFIG.MAX_HEALTH,
            playerHealth: PLAYER_CONFIG.MAX_HEALTH,
            score: 0,
            lives: 3
        };
    }

    init() {
        this.game = new Phaser.Game(this.config);
        
        // Global game state accessible from all scenes
        this.game.registry.set('gameState', this.gameState);
        
        // Hide loading screen once game starts
        this.game.events.once('ready', () => {
            const loadingScreen = document.getElementById('loadingScreen');
            if (loadingScreen) {
                loadingScreen.style.display = 'none';
            }
        });

        // Global event listeners
        this.setupGlobalEvents();
    }

    setupGlobalEvents() {
        // Handle game state changes
        this.game.events.on('levelComplete', (levelData) => {
            this.gameState.currentLevel++;
            this.gameState.score += levelData.score || 0;
            this.game.registry.set('gameState', this.gameState);
        });

        this.game.events.on('playerDeath', () => {
            this.gameState.lives--;
            this.gameState.playerHealth = this.gameState.playerMaxHealth;
            this.game.registry.set('gameState', this.gameState);
            
            if (this.gameState.lives <= 0) {
                this.game.scene.start('MenuScene');
                this.resetGameState();
            }
        });

        this.game.events.on('gameOver', () => {
            this.resetGameState();
        });

        this.game.events.on('newGame', () => {
            this.resetGameState();
        });
    }

    resetGameState() {
        this.gameState = {
            currentLevel: 1,
            playerMaxHealth: PLAYER_CONFIG.MAX_HEALTH,
            playerHealth: PLAYER_CONFIG.MAX_HEALTH,
            score: 0,
            lives: 3
        };
        this.game.registry.set('gameState', this.gameState);
    }

    // Utility methods accessible globally
    static getGameState(scene) {
        return scene.registry.get('gameState');
    }

    static updateGameState(scene, updates) {
        const gameState = scene.registry.get('gameState');
        Object.assign(gameState, updates);
        scene.registry.set('gameState', gameState);
    }

    static preloadAssets(scene) {
        // This method is no longer needed as assets are loaded in PreloadScene
        console.log('Assets are loaded in PreloadScene');
    }
}

// Initialize the game when the page loads
window.addEventListener('load', () => {
    const game = new Game();
    game.init();
});

// Make Game class globally available
window.Game = Game;
