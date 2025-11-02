// Game Constants
const GAME_CONFIG = {
    WIDTH: 800,
    HEIGHT: 600,
    SCALE: 3, // Escalado más grande para efecto 8-bit
    GRAVITY: 800,
    PIXEL_ART: true
};

const PLAYER_CONFIG = {
    SPEED: 150,
    JUMP_VELOCITY: -400,
    MAX_HEALTH: 100,
    ATTACK_DAMAGE: 25,
    ATTACK_RANGE: 40,
    INVULNERABILITY_TIME: 1000 // milliseconds
};

const ENEMY_CONFIG = {
    GUARD: {
        SPEED: 50,
        HEALTH: 50,
        DAMAGE: 20,
        PATROL_DISTANCE: 100,
        ATTACK_RANGE: 35,
        ATTACK_COOLDOWN: 1500
    },
    ARMORED_GUARD: {
        SPEED: 30,
        HEALTH: 100,
        DAMAGE: 30,
        PATROL_DISTANCE: 80,
        ATTACK_RANGE: 40,
        ATTACK_COOLDOWN: 2000
    },
    BAT: {
        SPEED: 80,
        HEALTH: 25,
        DAMAGE: 15,
        FLY_HEIGHT: 100,
        ATTACK_RANGE: 30
    }
};

const ITEM_CONFIG = {
    HEALTH_POTION_SMALL: {
        HEAL_AMOUNT: 25
    },
    HEALTH_POTION_LARGE: {
        HEAL_AMOUNT: 50
    },
    LIFE_MEDAL: {
        MAX_HEALTH_INCREASE: 25
    }
};

const TRAP_CONFIG = {
    SPIKES: {
        DAMAGE: 40,
        ACTIVE_TIME: 2000,
        INACTIVE_TIME: 3000
    },
    BLADES: {
        DAMAGE: 50,
        SWING_SPEED: 100
    },
    PITS: {
        DAMAGE: 9999 // Instant death
    }
};

const PHYSICS_CONFIG = {
    WORLD_BOUNDS: {
        WIDTH: 2000,
        HEIGHT: 600
    },
    TILE_SIZE: 32,
    COLLISION_CATEGORIES: {
        PLAYER: 1,
        ENEMIES: 2,
        ITEMS: 4,
        TRAPS: 8,
        PLATFORMS: 16
    }
};

const ANIMATION_CONFIG = {
    FRAME_RATE: 8,
    REPEAT: -1
};

const LEVEL_CONFIG = {
    TOTAL_LEVELS: 10,
    LEVEL_TIME_LIMIT: 300000 // 5 minutes in milliseconds
};

const COLORS = {
    PRIMARY: 0x8FA4B8,
    SECONDARY: 0x6B7D8F,
    HEALTH_BAR: 0x00FF00,
    HEALTH_BAR_BG: 0x8B0000,
    UI_TEXT: 0xFFD700,
    BACKGROUND: 0x4A5A6B,
    DUNGEON_WALL: 0x8FA4B8,
    PERSIAN_GOLD: 0xFFD700,
    STONE_LIGHT: 0x9BB0C4,
    STONE_MEDIUM: 0x8FA4B8,
    STONE_DARK: 0x6B7D8F,
    STONE_DARKER: 0x4A5A6B,
    FLAME_RED: 0xFF4500,
    FLAME_ORANGE: 0xFF6B00,
    FLAME_YELLOW: 0xFFD700,
    PRINCE_TUNIC: 0xF5F5DC,
    PRINCE_SKIN: 0xDEB887,
    GUARD_RED: 0x8B0000
};

const KEYS = {
    LEFT: 'LEFT',
    RIGHT: 'RIGHT',
    UP: 'UP',
    DOWN: 'DOWN',
    SPACE: 'SPACE',
    SHIFT: 'SHIFT'
};

const SOUNDS = {
    JUMP: 'jump',
    ATTACK: 'attack',
    HURT: 'hurt',
    COLLECT: 'collect',
    ENEMY_DEATH: 'enemy_death',
    LEVEL_COMPLETE: 'level_complete'
};
