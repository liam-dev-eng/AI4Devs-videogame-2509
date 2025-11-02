class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    preload() {
        // Set background
        this.cameras.main.setBackgroundColor(COLORS.BACKGROUND);

        // Create title
        this.add.text(GAME_CONFIG.WIDTH / 2, GAME_CONFIG.HEIGHT / 2 - 100, 
            'Prince of Persia Clone', 
            {
                fontSize: '32px',
                fontFamily: 'Courier New',
                fill: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5);

        // Create loading bar background
        const loadingBarBg = this.add.graphics();
        loadingBarBg.fillStyle(0x333333);
        loadingBarBg.fillRect(GAME_CONFIG.WIDTH / 2 - 150, GAME_CONFIG.HEIGHT / 2 - 10, 300, 20);

        // Create loading bar
        const loadingBar = this.add.graphics();

        // Create loading text
        const loadingText = this.add.text(GAME_CONFIG.WIDTH / 2, GAME_CONFIG.HEIGHT / 2 + 50, 
            'Loading Assets...', 
            {
                fontSize: '16px',
                fontFamily: 'Courier New',
                fill: '#ffffff'
            }
        ).setOrigin(0.5);

        // Progress events
        this.load.on('progress', (value) => {
            loadingBar.clear();
            loadingBar.fillStyle(0x00ff00);
            loadingBar.fillRect(GAME_CONFIG.WIDTH / 2 - 150, GAME_CONFIG.HEIGHT / 2 - 10, 300 * value, 20);
        });

        this.load.on('fileprogress', (file) => {
            loadingText.setText('Loading: ' + file.key);
        });

        this.load.on('complete', () => {
            loadingText.setText('Complete!');
        });

        // Load all game assets
        this.loadAssets();
    }

    loadAssets() {
        // Load placeholder sprite assets using data URLs (colored rectangles)
        this.createPlaceholderSprites();
        
        // Load level data
        this.load.json('level1', 'src/levels/level1.json');
        this.load.json('level2', 'src/levels/level2.json');
        this.load.json('level3', 'src/levels/level3.json');
        
        // Load audio placeholders (will be silent)
        this.createPlaceholderAudio();
    }

    createPlaceholderSprites() {
        // Load real sprite images
        
        // Player sprites
        this.load.image('player_idle', 'assets/sprites/player_idle.png');
        this.load.image('player_run', 'assets/sprites/player_run.png');
        this.load.image('player_run2', 'assets/sprites/player_run2.png');
        this.load.image('player_jump', 'assets/sprites/player_jump.png');
        this.load.image('player_attack', 'assets/sprites/player_attack.png');
        this.load.image('player_crouch', 'assets/sprites/player_crouch.png');
        
        // Enemy sprites
        this.load.image('guard', 'assets/sprites/guard.png');
        this.load.image('guard2', 'assets/sprites/guard2.png');
        this.load.image('armored_guard', 'assets/sprites/armored_guard.png');
        this.load.image('bat', 'assets/sprites/bat.png');
        
        // Item sprites
        this.load.image('health_potion_small', 'assets/sprites/health_potion_small.png');
        this.load.image('health_potion_large', 'assets/sprites/health_potion_large.png');
        this.load.image('life_medal', 'assets/sprites/life_medal.png');
        
        // Environment sprites
        this.load.image('platform', 'assets/sprites/platform.png');
        this.load.image('spike', 'assets/sprites/spike.png');
        this.load.image('blade', 'assets/sprites/blade.png');
        this.load.image('background', 'assets/sprites/background.png');
        this.load.image('torch', 'assets/sprites/torch.png');
        
        // UI elements
        this.load.image('health_bar_bg', 'assets/sprites/health_bar_bg.png');
        this.load.image('health_bar', 'assets/sprites/health_bar.png');
    }

    createColoredRectangle(width, height, color) {
        // Create a data URL for a colored rectangle
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, width, height);
        
        // Add a simple border for visibility
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, width, height);
        
        return canvas.toDataURL();
    }

    createPlaceholderAudio() {
        // Create silent audio placeholders
        const silentAudio = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEfBjiS1/LNeSsFJHfH8N2QQAoUX7Pp66hVFApGn+Dyv2EfBjiS1/LNeSsFJHfH8N2QQAoUX7Pp66hVFApGn+DywGEfBjiS1/LNebSsFJHbH8N2QQoUX7Pp66hVFApGn+DywGEfBjiS1/LNeSsFJHfH8N2QQAoUX7Pp66hVFApGn+DywGEfBjiS1/LNeSsFJHfH8N2QQAoUX7Pp66hVFApMn+DywGMfBjiS1/LNeSsFJHfH8N2QQAoUX7Pp66hVFApMn+DywGMfBjiS1/LNeSsFJHfH8N2QQAoUX7Pp66hVFApMn+DywGMfBjiS1/LNeSsFJHfH8N2QQAoUX7Pp66hVFApMn+DywGMfBjiS1/LNeSsFJHfH8N2QQAoUX7Pp66hVFApMn+DywGMfBjiS1/LNeSsFJHfH8N2QQAoUX7Pp66hVFApMn+DywGMfBjiS1/LNeSsFJHfH8N2QQAoUX7Pp66hVFApMn+DywGMfBjiS1/LNeSsFJHfH8N2QQAoUX7Pp66hVFApMn+DywGMfBjiS1/LNeSsFJHfH8N2QQAoUX7Pp66hVFApMn+DywGMfBjiS1/LNeSsFJHfH8N2QQAoUX7Pp66hVFApMn+DywGMfBjiS1/LNeSsFJHfH8N2QQAoUX7Pp66hVFApMn+DywGMfBjiS1/LNeSsFJHfH8N2QQAoUX7Pp66hVFApMn+DywGMfBjiS1/LNeSsFJHfH8N2QQAoUX7Pp66hVFApMn+DywGMfBjiS1/LNeSsFJHfH8N2QQAoUX7Pp66hVFApMn+DywGMfBjiS1/LNeSsFJHfH8N2QQAoUX7Pp66hVFApMn+DywGMfBjiS1/LNeSsFJHfH8N2QQAoUX7Pp66hVFApMn+DywGMfBjiS1/LNeSsFJHfH8N2QQAoUX7Pp66hVFApMn+DywGMfBjiS1/LNeSvFJHfH8N2QQAoUX7Pp66hVFApMn+DywGMfBjiS1/LNeSvFJHfH8N2QQAoUX7Pp66hVFApMn+DywGMfBjiS1/LNeSsFJHfH8N2QQAoUX7Pp66hVFApMn+DywGMfBjiS1/LNeSsFJHfH8N2QQAoUX7Pp66hVFApMn+DywGMfBjiS1/LNeSsFJHfH8N2QQAoUX7Pp66hVFApMn+DywGMfBjiS1/LNeSsFJHfH8N2QQAoUX7Pp66hVFApMn+DywGMfBjiS1/LNeSsFJHfH8N2QQAoUX7Pp66hVFApMn+DywGMfBjiS1/LNeSsFJHfH8N2QQAoUX7Pp66hVFApMn+DywGMfBjiS1/LNeSsFJHfH8N2QQAoUX7Pp66hVFApMn+DywGMfBjiS1/LNeSsFJHfH8N2QQAoUX7Pp66hVFApMn+DywGMfBjiS1/LNeSsFJHfH8N2QQAoUX7Pp66hVFApMn+DywGMfBjiS1/LNeSsFJHfH8N2QQAoUX7Pp66hVFApMn+DywGMfBjiS1/LNeSsFJHfH8N2QQAoUX7Pp66hVFApMn+DywGMfBjiS1/LNeSsFJHfH8N2QQAoUX7Pp66hVFApMn+DywGMfBjiS1/LNeSsFJHfH8N2QQAoUX7Pp66hVFApMn+DywGMfBjiS1/LNeSsFJHfH8N2QQAoUX7Pp66hVFApMn+DywGMfBjiS1/LNeSsFJHfH8N2QQAoUX7Pp66hVFApMn+DywGMfBjiS1/LNeSsFJHfH8N2QQAoUX7Pp66hVFApMn+DywGMfBjiS1/LNeSsFJHfH8N2QQAoUX7Pp66hVFApMn+DywGMfBjiS1/LNeSsFJHfH8N2QQAoUX7Pp66hVFApMn+DywGMfBjiS1/LNeSsFJHfH8N2QQAoUX7Pp66hVFApMn+DywGMfBjiS1/LNeSsFJHfH8N2QQAoUX7Pp66hVFApMn+DywGMfBjiS1/LNeSsFJHfH8N2QQAoUX7Pp';
        
        Object.values(SOUNDS).forEach(soundKey => {
            this.load.audio(soundKey, `assets/audio/${soundKey}.mp3`);
        });
    }

    create() {
        // Animation setup
        this.createAnimations();
        
        // Move to menu scene after loading
        this.time.delayedCall(1000, () => {
            this.scene.start('MenuScene');
        });
    }

    createAnimations() {
        // Player animations (using single frames for now)
        this.anims.create({
            key: 'player_idle',
            frames: [{ key: 'player_idle' }],
            frameRate: ANIMATION_CONFIG.FRAME_RATE
        });

        this.anims.create({
            key: 'player_run',
            frames: [
                { key: 'player_run' },
                { key: 'player_run2' }
            ],
            frameRate: ANIMATION_CONFIG.FRAME_RATE,
            repeat: -1
        });

        this.anims.create({
            key: 'player_jump',
            frames: [{ key: 'player_jump' }],
            frameRate: ANIMATION_CONFIG.FRAME_RATE
        });

        this.anims.create({
            key: 'player_attack',
            frames: [{ key: 'player_attack' }],
            frameRate: ANIMATION_CONFIG.FRAME_RATE
        });

        this.anims.create({
            key: 'player_crouch',
            frames: [{ key: 'player_crouch' }],
            frameRate: ANIMATION_CONFIG.FRAME_RATE
        });

        // Enemy animations
        this.anims.create({
            key: 'guard_idle',
            frames: [
                { key: 'guard' },
                { key: 'guard2' }
            ],
            frameRate: ANIMATION_CONFIG.FRAME_RATE / 2,
            repeat: -1
        });

        this.anims.create({
            key: 'armored_guard_idle',
            frames: [{ key: 'armored_guard' }],
            frameRate: ANIMATION_CONFIG.FRAME_RATE
        });

        this.anims.create({
            key: 'bat_fly',
            frames: [{ key: 'bat' }],
            frameRate: ANIMATION_CONFIG.FRAME_RATE
        });
    }
}
