class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Set loading bar background
        this.cameras.main.setBackgroundColor(COLORS.BACKGROUND);
        
        // Create loading text
        this.add.text(GAME_CONFIG.WIDTH / 2, GAME_CONFIG.HEIGHT / 2 - 50, 
            'Prince of Persia Clone', 
            {
                fontSize: '32px',
                fontFamily: 'Courier New',
                fill: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5);

        this.add.text(GAME_CONFIG.WIDTH / 2, GAME_CONFIG.HEIGHT / 2, 
            'Initializing...', 
            {
                fontSize: '16px',
                fontFamily: 'Courier New',
                fill: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5);

        // Basic system initialization
        this.initializeInput();
        this.initializeAudio();
    }

    create() {
        // Move to preload scene after brief delay
        this.time.delayedCall(1000, () => {
            this.scene.start('PreloadScene');
        });
    }

    initializeInput() {
        // Set up global input handling
        this.input.keyboard.on('keydown', (event) => {
            // Prevent default browser behavior for game keys
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) {
                event.preventDefault();
            }
        });
    }

    initializeAudio() {
        // Initialize audio context if needed
        if (this.sound.context && this.sound.context.state === 'suspended') {
            this.sound.context.resume();
        }
    }
}
