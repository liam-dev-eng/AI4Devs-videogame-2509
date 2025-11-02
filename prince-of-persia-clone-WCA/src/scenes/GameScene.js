class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    create() {
        // Get current game state
        this.gameState = Game.getGameState(this);
        
        // Initialize scene properties
        this.currentLevel = this.gameState.currentLevel;
        this.levelData = null;
        this.player = null;
        this.platforms = null;
        this.enemies = null;
        this.items = null;
        this.traps = null;
        this.exitZone = null;
        
        // UI elements
        this.healthBar = null;
        this.scoreText = null;
        this.levelText = null;
        this.timeText = null;
        this.levelTimer = 0;
        
        // Load and create the level
        this.loadLevel();
    }

    loadLevel() {
        const levelKey = `level${this.currentLevel}`;
        
        if (!this.cache.json.exists(levelKey)) {
            console.error(`Level ${this.currentLevel} not found, loading level 1`);
            this.currentLevel = 1;
        }
        
        this.levelData = this.cache.json.get(levelKey) || this.cache.json.get('level1');
        
        if (!this.levelData) {
            console.error('No level data available');
            return;
        }
        
        this.createLevel();
    }

    createLevel() {
        // Set world bounds
        this.physics.world.setBounds(0, 0, this.levelData.width, this.levelData.height);
        
        // Set background color
        this.cameras.main.setBackgroundColor(this.levelData.background.color || '#2F4F4F');
        
        // Create background layers
        this.createBackground();
        
        // Create platforms
        this.createPlatforms();
        
        // Create player
        this.createPlayer();
        
        // Create enemies
        this.createEnemies();
        
        // Create items
        this.createItems();
        
        // Create traps
        this.createTraps();
        
        // Create exit zone
        this.createExitZone();
        
        // Create decorative elements
        this.createDecorations();
        
        // Set up collisions
        this.setupCollisions();
        
        // Create UI
        this.createUI();
        
        // Set up camera
        this.setupCamera();
        
        // Initialize level timer
        this.levelTimer = this.levelData.timeLimit * 1000; // Convert to milliseconds
    }

    createBackground() {
        if (this.levelData.background.layers) {
            this.levelData.background.layers.forEach(layer => {
                const bg = this.add.image(layer.x, layer.y, layer.image);
                bg.setOrigin(0, 0);
                bg.setScrollFactor(layer.parallax || 1);
                bg.setAlpha(0.7);
            });
        }
    }

    createPlatforms() {
        this.platforms = this.physics.add.staticGroup();
        
        this.levelData.platforms.forEach(platformData => {
            // Create multiple platform tiles to fill the width
            const tilesNeeded = Math.ceil(platformData.width / 32);
            
            for (let i = 0; i < tilesNeeded; i++) {
                const platform = this.platforms.create(
                    platformData.x + (i * 32), 
                    platformData.y, 
                    'platform'
                );
                platform.setScale(1);
                platform.refreshBody();
            }
        });
    }

    createPlayer() {
        const startPos = this.levelData.playerStart;
        this.player = new Player(this, startPos.x, startPos.y);
        
        // Reset player health from game state
        this.player.health = this.gameState.playerHealth;
        this.player.maxHealth = this.gameState.playerMaxHealth;
    }

    createEnemies() {
        this.enemies = this.physics.add.group();
        
        this.levelData.enemies.forEach(enemyData => {
            let enemy;
            
            switch (enemyData.type) {
                case 'Guard':
                    enemy = new Guard(this, enemyData.x, enemyData.y);
                    break;
                case 'ArmoredGuard':
                    enemy = new ArmoredGuard(this, enemyData.x, enemyData.y);
                    break;
                case 'Bat':
                    enemy = new Bat(this, enemyData.x, enemyData.y);
                    break;
                default:
                    console.warn(`Unknown enemy type: ${enemyData.type}`);
                    return;
            }
            
            // Set player reference for AI
            enemy.setPlayer(this.player);
            
            // Add to group
            this.enemies.add(enemy);
        });
    }

    createItems() {
        this.items = this.physics.add.group();
        
        this.levelData.items.forEach(itemData => {
            let item;
            
            switch (itemData.type) {
                case 'HealthPotion':
                    item = new HealthPotion(this, itemData.x, itemData.y, itemData.subtype);
                    break;
                case 'LifeMedal':
                    item = new LifeMedal(this, itemData.x, itemData.y);
                    break;
                default:
                    console.warn(`Unknown item type: ${itemData.type}`);
                    return;
            }
            
            this.items.add(item);
        });
    }

    createTraps() {
        this.traps = {
            spikes: this.physics.add.group(),
            pits: this.physics.add.group(),
            blades: this.physics.add.group()
        };
        
        this.levelData.traps.forEach(trapData => {
            switch (trapData.type) {
                case 'spikes':
                    this.createSpikeTrap(trapData);
                    break;
                case 'pit':
                    this.createPitTrap(trapData);
                    break;
                case 'blade':
                    this.createBladeTrap(trapData);
                    break;
            }
        });
    }

    createSpikeTrap(trapData) {
        const spikesNeeded = Math.ceil(trapData.width / 32);
        
        for (let i = 0; i < spikesNeeded; i++) {
            const spike = this.physics.add.sprite(
                trapData.x + (i * 32), 
                trapData.y, 
                'spike'
            );
            spike.setImmovable(true);
            spike.body.setSize(30, 16);
            
            // Spike trap behavior
            spike.isActive = false;
            spike.activeTime = trapData.activeTime || TRAP_CONFIG.SPIKES.ACTIVE_TIME;
            spike.inactiveTime = trapData.inactiveTime || TRAP_CONFIG.SPIKES.INACTIVE_TIME;
            
            // Start the spike cycle
            this.startSpikeCycle(spike);
            
            this.traps.spikes.add(spike);
        }
    }

    startSpikeCycle(spike) {
        // Alternate between active and inactive
        const activate = () => {
            spike.isActive = true;
            spike.setTint(0xff6666);
            this.time.delayedCall(spike.activeTime, deactivate);
        };
        
        const deactivate = () => {
            spike.isActive = false;
            spike.clearTint();
            this.time.delayedCall(spike.inactiveTime, activate);
        };
        
        // Start with random delay
        this.time.delayedCall(Math.random() * 2000, activate);
    }

    createPitTrap(trapData) {
        // Create invisible deadly zone
        const pit = this.physics.add.sprite(trapData.x, trapData.y, null);
        pit.setVisible(false);
        pit.body.setSize(trapData.width, trapData.height);
        pit.body.setImmovable(true);
        
        this.traps.pits.add(pit);
    }

    createBladeTrap(trapData) {
        const blade = this.physics.add.sprite(trapData.x, trapData.y, 'blade');
        blade.setOrigin(0.5, 1); // Pivot at bottom
        blade.body.setSize(16, 32);
        blade.setImmovable(true);
        
        // Blade swing properties
        blade.swingRadius = trapData.swingRadius || 60;
        blade.swingSpeed = trapData.swingSpeed || 1.5;
        blade.centerX = trapData.x;
        blade.centerY = trapData.y;
        
        // Create swinging motion
        this.tweens.add({
            targets: blade,
            angle: { from: -blade.swingRadius, to: blade.swingRadius },
            duration: 2000 / blade.swingSpeed,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        this.traps.blades.add(blade);
    }

    createExitZone() {
        const exitData = this.levelData.exit;
        this.exitZone = this.physics.add.sprite(exitData.x, exitData.y, 'platform');
        this.exitZone.setTint(0x00ff00);
        this.exitZone.setAlpha(0.7);
        this.exitZone.body.setSize(exitData.width, exitData.height);
        this.exitZone.setImmovable(true);
    }

    createDecorations() {
        // Add torches at strategic positions for atmosphere
        const torchPositions = [
            { x: 150, y: 450 },
            { x: 600, y: 300 },
            { x: 1000, y: 200 },
            { x: 1400, y: 100 },
            { x: 300, y: 250 },
            { x: 800, y: 400 }
        ];

        torchPositions.forEach(pos => {
            const torch = this.add.image(pos.x, pos.y, 'torch');
            torch.setScale(1.5);
            
            // Create flickering animation
            this.tweens.add({
                targets: torch,
                alpha: { from: 0.8, to: 1.0 },
                duration: 800 + Math.random() * 400,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            
            // Add flame particle effect simulation
            this.time.addEvent({
                delay: 100 + Math.random() * 200,
                callback: () => {
                    if (Math.random() < 0.3) {
                        const flame = this.add.rectangle(pos.x + Math.random() * 8 - 4, pos.y - 8, 2, 4, 0xff4500);
                        flame.setAlpha(0.8);
                        
                        this.tweens.add({
                            targets: flame,
                            y: flame.y - 15,
                            alpha: 0,
                            duration: 500,
                            ease: 'Power2',
                            onComplete: () => flame.destroy()
                        });
                    }
                },
                loop: true
            });
        });

        // Add ambient stone decorations
        this.addStoneDecorations();
    }

    addStoneDecorations() {
        // Add decorative stone blocks and architectural elements
        const decorations = [
            { x: 50, y: 500, width: 64, height: 32, color: 0x8B4513 },
            { x: 250, y: 400, width: 32, height: 64, color: 0xDEB887 },
            { x: 500, y: 300, width: 48, height: 48, color: 0xA0522D },
            { x: 900, y: 150, width: 32, height: 80, color: 0x8B4513 },
            { x: 1300, y: 50, width: 64, height: 32, color: 0xDEB887 }
        ];

        decorations.forEach(dec => {
            const decoration = this.add.rectangle(dec.x, dec.y, dec.width, dec.height, dec.color);
            decoration.setAlpha(0.3);
            decoration.setStrokeStyle(2, 0xB8860B);
        });
    }

    setupCollisions() {
        // Player vs platforms
        this.physics.add.collider(this.player, this.platforms);
        
        // Player vs enemies
        this.physics.add.overlap(this.player, this.enemies, this.handlePlayerEnemyCollision, null, this);
        
        // Player attack vs enemies
        this.physics.add.overlap(this.player.getAttackBox(), this.enemies, this.handlePlayerAttackEnemy, null, this);
        
        // Player vs items
        this.physics.add.overlap(this.player, this.items, this.handlePlayerItemCollection, null, this);
        
        // Player vs traps
        this.physics.add.overlap(this.player, this.traps.spikes, this.handlePlayerSpikeTrap, null, this);
        this.physics.add.overlap(this.player, this.traps.pits, this.handlePlayerPitTrap, null, this);
        this.physics.add.overlap(this.player, this.traps.blades, this.handlePlayerBladeTrap, null, this);
        
        // Player vs exit
        this.physics.add.overlap(this.player, this.exitZone, this.handlePlayerExit, null, this);
        
        // Enemies vs platforms
        this.physics.add.collider(this.enemies, this.platforms);
        
        // Items vs platforms
        this.physics.add.collider(this.items, this.platforms);
    }

    handlePlayerEnemyCollision(player, enemy) {
        if (!player.isInvulnerable && enemy.health > 0) {
            const damage = enemy.damage || 20;
            const died = player.takeDamage(damage);
            
            if (died) {
                this.handlePlayerDeath();
            }
        }
    }

    handlePlayerAttackEnemy(attackBox, enemy) {
        if (attackBox.body.enable && enemy.health > 0) {
            enemy.takeDamage(PLAYER_CONFIG.ATTACK_DAMAGE);
            attackBox.body.enable = false; // Prevent multiple hits
        }
    }

    handlePlayerItemCollection(player, item) {
        item.collect(player);
    }

    handlePlayerSpikeTrap(player, spike) {
        if (spike.isActive && !player.isInvulnerable) {
            const died = player.takeDamage(TRAP_CONFIG.SPIKES.DAMAGE);
            if (died) {
                this.handlePlayerDeath();
            }
        }
    }

    handlePlayerPitTrap(player, pit) {
        // Instant death from pits - but only if not already invulnerable
        if (!player.isInvulnerable) {
            const died = player.takeDamage(TRAP_CONFIG.PITS.DAMAGE);
            if (died) {
                this.handlePlayerDeath();
            }
        }
    }

    handlePlayerBladeTrap(player, blade) {
        if (!player.isInvulnerable) {
            const died = player.takeDamage(TRAP_CONFIG.BLADES.DAMAGE);
            if (died) {
                this.handlePlayerDeath();
            }
        }
    }

    handlePlayerExit(player, exit) {
        this.completeLevel();
    }

    handlePlayerDeath() {
        // Handle death logic here
        this.time.delayedCall(2000, () => {
            this.game.events.emit('playerDeath');
        });
    }

    completeLevel() {
        // Calculate score bonus
        const timeBonus = Math.max(0, Math.floor(this.levelTimer / 1000) * 10);
        const totalScore = this.gameState.score + timeBonus;
        
        // Update game state
        Game.updateGameState(this, { score: totalScore });
        
        // Transition to level complete scene
        this.scene.start('LevelCompleteScene', {
            levelNumber: this.currentLevel,
            timeBonus: timeBonus,
            totalScore: totalScore
        });
    }

    createUI() {
        // Health bar background
        const healthBarBg = this.add.rectangle(70, 30, 104, 14, 0x800000);
        healthBarBg.setScrollFactor(0);
        
        // Health bar
        this.healthBar = this.add.rectangle(70, 30, 100, 10, 0x00ff00);
        this.healthBar.setScrollFactor(0);
        
        // Health text
        this.add.text(10, 20, 'HEALTH:', {
            fontSize: '14px',
            fontFamily: 'Courier New',
            fill: '#FFD700',
            stroke: '#654321',
            strokeThickness: 1
        }).setScrollFactor(0);
        
        // Score
        this.scoreText = this.add.text(10, 50, `SCORE: ${this.gameState.score}`, {
            fontSize: '14px',
            fontFamily: 'Courier New',
            fill: '#FFD700',
            stroke: '#654321',
            strokeThickness: 1
        }).setScrollFactor(0);
        
        // Level info
        this.levelText = this.add.text(10, 80, `LEVEL: ${this.currentLevel}`, {
            fontSize: '14px',
            fontFamily: 'Courier New',
            fill: '#FFD700',
            stroke: '#654321',
            strokeThickness: 1
        }).setScrollFactor(0);
        
        // Timer
        this.timeText = this.add.text(GAME_CONFIG.WIDTH - 10, 20, '', {
            fontSize: '14px',
            fontFamily: 'Courier New',
            fill: '#FFD700',
            stroke: '#654321',
            strokeThickness: 1
        }).setScrollFactor(0).setOrigin(1, 0);
        
        // Lives
        this.add.text(GAME_CONFIG.WIDTH - 10, 50, `LIVES: ${this.gameState.lives}`, {
            fontSize: '14px',
            fontFamily: 'Courier New',
            fill: '#FFD700',
            stroke: '#654321',
            strokeThickness: 1
        }).setScrollFactor(0).setOrigin(1, 0);
    }

    setupCamera() {
        // Follow player with camera
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(0, 0, this.levelData.width, this.levelData.height);
        
        // Set camera lerp for smooth following
        this.cameras.main.setLerp(0.1, 0.1);
        
        // Camera effects
        this.cameras.main.setDeadzone(100, 50);
    }

    update(time, delta) {
        // Update player
        if (this.player) {
            this.player.update(time, delta);
        }
        
        // Update enemies
        this.enemies.children.entries.forEach(enemy => {
            if (enemy.update) {
                enemy.update(time, delta);
            }
        });
        
        // Update items
        this.items.children.entries.forEach(item => {
            if (item.update) {
                item.update(time, delta);
            }
        });
        
        // Update UI
        this.updateUI(delta);
        
        // Check time limit
        this.updateTimer(delta);
    }

    updateUI(delta) {
        // Update health bar
        const healthPercent = this.player.health / this.player.maxHealth;
        this.healthBar.scaleX = healthPercent;
        
        // Update score
        this.scoreText.setText(`SCORE: ${this.gameState.score}`);
    }

    updateTimer(delta) {
        this.levelTimer -= delta;
        
        const minutes = Math.floor(this.levelTimer / 60000);
        const seconds = Math.floor((this.levelTimer % 60000) / 1000);
        
        this.timeText.setText(`TIME: ${minutes}:${seconds.toString().padStart(2, '0')}`);
        
        // Flash when time is running out
        if (this.levelTimer < 30000) { // 30 seconds
            this.timeText.setTint(this.levelTimer % 1000 < 500 ? 0xff0000 : 0xffffff);
        }
        
        // Time up
        if (this.levelTimer <= 0) {
            this.handlePlayerDeath();
        }
    }
}
