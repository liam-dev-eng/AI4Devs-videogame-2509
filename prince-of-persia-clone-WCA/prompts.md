# Prompt Investigación:

# Rol

Actúa como un arquitecto de software y diseñador de videojuegos veterano, con un conocimiento profundo de los juegos de plataformas en 2D y del motor Phaser 3. 

# Tarea

Tu tarea es proporcionar una guía de diseño técnica exhaustiva para desarrollar un clon del juego clásico "Prince of Persia" (1989). El objetivo es desglosar los componentes esenciales del juego original y mapearlos a conceptos y estructuras de Phaser 3, HTML, CSS y JavaScript, sin escribir código específico.

Instrucciones Detalladas:

   1.  Análisis del Juego Original:

      - Desglosa las mecánicas de juego fundamentales (movimiento del personaje, física de salto y caída, sistema de combate, interacción con objetos como palancas y puertas, y el estricto límite de tiempo).    Describe la estructura de los niveles: diseño de plataformas, tipos de trampas (cuchillas, pisos falsos), y la progresión lineal con pantallas que se desplazan.

      - Especifica los elementos del HUD (salud, tiempo restante, vidas).

   2.  Arquitectura en Phaser 3:

        Define la estructura de Escenas (Scenes) que debería tener el proyecto (ej: Boot, Preload, MainMenu, Level01, GameOver, Victory).

        Explica cómo se gestionaría el estado global del juego (ej: variables de tiempo, salud, nivel actual) entre escenas.

    3. Diseño del Personaje Principal y Enemigos:

        Detalla los estados (state) del personaje (idle, running, jumping, falling, attacking, crouching, climbing) y cómo gestionar las transiciones entre ellos.

        Propón un sistema de animación utilizando Sprite Sheets y el Animation Manager de Phaser.

        Describe una máquina de estados básica para la IA de los enemigos (patrullar, perseguir, atacar).

   4. Sistema de Física y Colisiones:

        Especifica si se debe usar el sistema de física ARCADE o MATTER de Phaser 3 y justifica la elección para este tipo de juego.

        Detalla los diferentes grupos de colisión (Groups) necesarios (suelo, plataformas, trampas letales, enemigos, objetos interactivos, puertas) y cómo deben interactuar entre sí y con el personaje.

    5. Diseño de Niveles y Tilemaps:

        Explica el proceso de creación de niveles utilizando Tiled Map Editor y cómo importar esos mapas (Tilemap) en Phaser 3.

        Describe cómo separar las capas (Layers) para el fondo, la plataforma principal (con colisión), y las capas de objetos para situar trampas, enemigos y puntos de spawn.

    6. Gestión de Assets y UI:

        Proporciona una lista de los tipos de assets necesarios (spritesheets, imágenes de UI, fuentes, sonidos) y cómo se cargarían en la escena de Preload.

        Explica cómo se implementaría la interfaz de usuario (HUD) utilizando objetos de Phaser como Text y Container, o incluso integrando elementos DOM sobre el canvas si es necesario para partes complejas del menú.

    7. Consideraciones de Rendimiento y Mejores Prácticas:

        Ofrece recomendaciones para optimizar el rendimiento, como el uso de Object Pooling para enemigos y objetos, y la destrucción adecuada de escenas.


# Prompt Desarrollo: 

# Rol

Eres un desarrollador senior de videojuegos especializado en **Phaser 3** y JavaScript, con experiencia profunda en arquitectura de juegos 2D de plataformas y sistemas de estado.

# Tarea

Tu tarea es generar la estructura de archivos y el código fuente completo para un clon del juego "Prince of Persia" (versión 1989), siguiendo estrictamente la arquitectura definida en la guía de diseño técnica. El código debe estar listo para ejecutarse inmediatamente.

**Instrucciones Clave:**
1. **Código Completo:** Genera únicamente el código listo para usar y los nombres de los archivos necesarios. No proporciones explicaciones teóricas ni tutoriales paso a paso.
2. **Estructura de Carpetas:** Organiza todo el proyecto dentro de una carpeta raíz llamada `prince_of_persia_clone/`.
3. **Framework:** Utiliza exclusivamente el framework **Phaser 3** con física **ARCADE**.
4. **Estilo Visual:** Emplea un estilo de **pixel art** simple y funcional. Para los sprites y tilesets, genera descripciones de Placeholder en formato JSON si es necesario, pero asume que los assets gráficos básicos (player, guards, tiles) ya existen en una carpeta `assets/`.

**Especificaciones del Juego:**
- **Motor:** Phaser 3 (última versión estable).
- **Física:** Sistema ARCADE de Phaser (justificado para colisiones AABB simples y control determinístico frame-perfect).
- **Niveles:** Implementa al menos 2 niveles completos con estructura de tilemaps exportados desde Tiled (formato JSON).
- **Jugador:** Implementa todos los estados del personaje: IDLE, RUNNING, JUMPING, FALLING, ATTACKING, CROUCHING, CLIMBING, TAKING_DAMAGE, DYING.
- **Sistema de Tiempo:** Cronómetro global que cuenta regresivamente y se transfiere entre niveles.
- **Vida:** Sistema de salud con barra de vida. Puede recibir daño de enemigos y trampas. Ventanas de invencibilidad temporal.

**Arquitectura de Escenas Requerida:**
Implementa todas las siguientes escenas con sus responsabilidades específicas:

- **BootScene:** Configuración inicial de resolución, escalado, modo pantalla completa. Transición a PreloadScene.
- **PreloadScene:** Carga de todos los assets (imágenes, spritesheets, tilesets, audio, fuentes) con barra de progreso visual y manejo de errores. Inicializa GameManager. Transición a MainMenuScene.
- **MainMenuScene:** Pantalla de inicio con título del juego, opciones: Nuevo Juego, Continuar (si hay partida guardada), Configuración. Manejo de input y transición a Level01 o Config según selección.
- **LevelXXScene (Level01, Level02, etc.):** Escena principal de juego. Carga tilemap desde JSON, crea mundo físico y grupos de colisión. Instancia jugador, enemigos, trampas y objetos interactivos desde Object Layers del tilemap. Gestiona cronómetro, detecta condiciones de victoria/derrota. Transición a LevelCompleteScene, GameOverScene, o siguiente nivel.
- **LevelCompleteScene:** Muestra mensaje de éxito, estadísticas del nivel (tiempo usado, items recogidos). Opciones: continuar al siguiente nivel o volver al menú.
- **GameOverScene:** Muestra mensaje de derrota y causa (tiempo agotado, salud agotada). Opciones: reintentar nivel o volver al menú principal.
- **VictoryScene:** Pantalla final al completar todos los niveles. Animación de victoria, resumen final. Opciones: Nuevo Juego, Volver al menú.
- **PauseScene (opcional):** Menú de pausa que detiene tiempo y lógica del juego. Opciones: Reanudar, Reiniciar Nivel, Volver al Menú. Puede implementarse como overlay.

**Sistema de Estado Global - GameManager (Singleton Pattern):**
Crea un `GameManager` accesible globalmente que almacene:
- Tiempo total restante acumulado entre niveles
- Salud máxima del jugador (puede aumentar con medallones)
- Nivel actual de progresión
- Items recogidos (llaves, pociones, etc.)
- Configuraciones del usuario (volumen de audio, controles)

**Métodos principales del GameManager:**
- `saveGameState()`: Guarda progreso en localStorage
- `loadGameState()`: Carga progreso desde localStorage
- `resetGameState()`: Reinicia estado para nueva partida
- `updateTime()`: Actualiza y verifica tiempo restante
- `updateHealth()`: Gestiona cambios en salud del jugador
- `addItem()`: Registra recolección de items

**Sistema de Estados del Personaje - Máquina de Estados Finitos (FSM):**
Implementa una FSM para el jugador con los siguientes estados y transiciones:
- **IDLE:** Animación de respiración/espera
- **RUNNING:** Movimiento horizontal con aceleración/deceleración controladas
- **JUMPING:** Salto vertical con altura máxima limitada por tiempo de presión del botón
- **FALLING:** Caída libre con gravedad constante y velocidad terminal
- **ATTACKING:** Ejecución de ataque con espada, hitbox temporal activada en frame específico de animación
- **CROUCHING:** Agachado, hitbox reducida, puede atacar hacia abajo
- **CLIMBING:** Escalando pared, movimiento vertical controlado
- **TAKING_DAMAGE:** Invencibilidad temporal con animación de parpadeo, bloquea mayoría de transiciones
- **DYING:** Animación de muerte, transición a GameOverScene

**Gestión de Transiciones:**
- Sistema de prioridad: TAKING_DAMAGE y DYING bloquean mayoría de transiciones
- Validación de transiciones antes de cambiar estado (ej: no saltar si está en el aire)
- Emitir eventos al entrar/salir de estados para sincronizar sistemas (audio, efectos visuales)

**Grupos de Colisión (Phaser.Physics.Arcade.Group) - Implementar Todos:**
Crea los siguientes grupos con sus propiedades e interacciones específicas:

1. **SUELO (Ground):** Plataformas sólidas estáticas. Colisión completa con jugador que detiene caída y permite caminar.
2. **PLATAFORMAS_MOVILES (MovingPlatforms):** Plataformas con movimiento cíclico horizontal/vertical. Colisión completa. Implementa sistema de "platform parenting" para que jugador se mueva con la plataforma.
3. **TRAMPAS_LETALES (DeadlyTraps):** Espigas, cuchillas, pozos. Overlap detection (no bloquea movimiento). Trigger de daño o muerte al solaparse.
4. **ENEMIGOS (Enemies):** Todos los tipos de enemigos. Física dinámica. Colisión con SUELO. Overlap con jugador para daño por contacto. Overlap con arma del jugador para recibir daño.
5. **OBJETOS_INTERACTIVOS (InteractiveObjects):** Palancas, llaves. Overlap detection + input para activación.
6. **PUERTAS (Doors):** Puertas normales y puertas de espigas. Colisión si cerrada (bloquea paso), overlap si abierta (para transición de nivel).
7. **ITEMS_COLECCIONABLES (Collectibles):** Pociones, frutas, medallones. Overlap detection única (no bloquea movimiento). Desaparecen al recogerse.
8. **PAREDES_ESCALABLES (ClimbableWalls):** Superficies verticales escalables. Overlap detection para activar modo escalada.

**Matriz de Colisiones - Implementar:**
- Jugador vs SUELO: Colisión (bloquea movimiento vertical)
- Jugador vs PLATAFORMAS_MOVILES: Colisión (con sistema de montar plataforma)
- Jugador vs TRAMPAS_LETALES: Overlap (daño instantáneo)
- Jugador vs ENEMIGOS: Overlap (daño por contacto)
- Jugador vs OBJETOS_INTERACTIVOS: Overlap (activación con input)
- Jugador vs PUERTAS: Colisión si cerrada, overlap si abierta
- Jugador vs ITEMS_COLECCIONABLES: Overlap (recolección automática)
- Jugador vs PAREDES_ESCALABLES: Overlap (activación modo escalada)
- Arma del Jugador vs ENEMIGOS: Overlap (solo durante estado ATTACKING)
- ENEMIGOS vs SUELO: Colisión
- ENEMIGOS vs PLATAFORMAS_MOVILES: Colisión

**Diseño de Niveles y Tilemaps:**
Estructura de capas requerida en Tiled (exportar como JSON):

**Tile Layers:**
- **BACKGROUND:** Elementos decorativos sin colisión, renderizado primero
- **PLATFORMS:** Estructura física del nivel (suelos, plataformas, paredes). Capa de colisión activada, convierte tiles en cuerpos físicos estáticos
- **FOREGROUND:** Decoraciones frontales sin colisión, renderizado último

**Object Layers:**
- **SPAWN_POINTS:** Objetos "PlayerSpawn" (posición inicial jugador), "EnemySpawn" (con propiedad tipo: guard, bat, spider, etc.), "ItemSpawn"
- **TRAPS:** Objetos "Spike" (propiedades: activado/desactivado, intervalo), "Pit" (área letal), "Blade" (ruta de movimiento, velocidad)
- **INTERACTIVES:** Objetos "Lever" (palancas, con ID para vincular puertas), "Door" (con ID vinculado a palanca o requerimiento de llave), "Key" (con ID de puerta asociada)
- **BOUNDARIES:** Objetos "LevelExit" (completa nivel), "Checkpoint" (puntos de reaparición), "Boundary" (límites invisibles del nivel)

**Proceso de Carga en LevelXXScene:**
1. Cargar tileset (imagen asociada)
2. Cargar tilemap (JSON exportado desde Tiled)
3. Crear capas y configurar colisiones en capa PLATFORMS
4. Procesar Object Layers: iterar sobre objetos e instanciar entidades según tipo y propiedades

**Sistema de IA de Enemigos - Máquina de Estados:**
Estados básicos para cada enemigo:
- **PATROLLING:** Movimiento predefinido en ruta (punto A a B y vuelta)
- **IDLE:** Espera, puede cambiar a ALERT después de tiempo
- **ALERT:** Detección del jugador en rango (zona de detección visual + línea de vista)
- **PURSUING:** Perseguir al jugador activamente
- **ATTACKING:** Ejecutar ataque hacia jugador (cuando está en rango de ataque)
- **DYING:** Animación de muerte antes de despawn

**Comportamientos Específicos:**
- **Guard:** Patrulla simple, ataque directo al detectar jugador
- **ArmoredGuard:** Requiere múltiples golpes, puede tener estado de bloqueo
- **SpearGuard:** Mayor rango de ataque, hitbox extendida
- **Spider:** Movimiento por techos (inversión de gravedad), patrón errático
- **Bat:** Movimiento aéreo, patrón de vuelo predefinido, ataque en picado

**Elementos de Juego a Implementar:**

**Items:**
- `health_potion_small`: Restaura pequeña cantidad de salud
- `health_potion_large`: Restaura toda la salud
- `life_medal`: Aumenta salud máxima del jugador permanentemente
- `key`: Permite abrir puertas asociadas (usar IDs de vinculación)

**Enemigos (Grupos):**
- `guards`: Enemigos básicos con patrulla simple
- `armored_guards`: Requieren múltiples golpes o estrategia específica
- `spear_guards`: Mayor rango de ataque y daño
- `spiders`: Se mueven por techos y suelos
- `bats`: Vuelan en patrones predecibles

**Trampas (Grupos):**
- `spikes`: Se activan/desactivan en intervalos. Daño al contacto
- `pits`: Pozos letales. Muerte instantánea si el jugador cae
- `blades`: Se mueven en patrones (péndulo). Daño al contacto

**Sistema de HUD:**
Implementa HUD in-game usando `Phaser.GameObjects.Container` con `setScrollFactor(0, 0)`:
- **Barra de Salud:** Fondo (rectángulo) + relleno (rectángulo con ancho variable según salud) + texto numérico opcional (salud actual/máxima)
- **Cronómetro:** `Phaser.GameObjects.Text` mostrando minutos y segundos restantes, actualizado cada segundo
- **Iconos de Items:** Mostrar items en inventario (llaves, pociones)
- Actualizar elementos en método `update()` de GameScene

**Sistema de Audio:**
- Cargar música de fondo para cada nivel (loop)
- Efectos de sonido: pasos, salto, ataque espada, golpe recibido, muerte, palanca activada, puerta abriéndose, item recogido, trampa activada
- Implementar AudioManager para gestión centralizada (pool de sonidos, volumen dinámico)

**Object Pooling:**
Implementa un PoolManager para optimización:
- Pool de instancias por tipo de enemigo
- Al spawnear, activar del pool en lugar de crear nuevo
- Al morir, desactivar y devolver al pool
- Métodos: `get(type)`, `release(object)`, `prewarm(count)`

**Estructura de Archivos Requerida:**
```
prince_of_persia_clone/
├── index.html
├── src/
│   ├── main.js
│   ├── managers/
│   │   ├── GameManager.js
│   │   ├── AudioManager.js
│   │   └── PoolManager.js
│   ├── scenes/
│   │   ├── BootScene.js
│   │   ├── PreloadScene.js
│   │   ├── MainMenuScene.js
│   │   ├── Level01Scene.js
│   │   ├── Level02Scene.js
│   │   ├── LevelCompleteScene.js
│   │   ├── GameOverScene.js
│   │   └── VictoryScene.js
│   ├── entities/
│   │   ├── Player.js
│   │   ├── enemies/
│   │   │   ├── BaseEnemy.js
│   │   │   ├── Guard.js
│   │   │   ├── ArmoredGuard.js
│   │   │   ├── SpearGuard.js
│   │   │   ├── Spider.js
│   │   │   └── Bat.js
│   │   ├── items/
│   │   │   ├── BaseItem.js
│   │   │   ├── HealthPotion.js
│   │   │   ├── LifeMedal.js
│   │   │   └── Key.js
│   │   ├── traps/
│   │   │   ├── Spike.js
│   │   │   ├── Pit.js
│   │   │   └── Blade.js
│   │   └── interactive/
│   │       ├── Lever.js
│   │       └── Door.js
│   ├── levels/
│   │   ├── level1.json
│   │   └── level2.json
│   └── utils/
│       ├── constants.js
│       └── helpers.js
└── assets/
    ├── sprites/
    ├── tiles/
    └── audio/
```

**Tareas Específicas por Archivo:**

- **index.html:** Punto de entrada. Carga Phaser CDN y main.js
- **main.js:** Configuración del objeto de configuración de Phaser 3. Registra todas las escenas. Inicializa GameManager.
- **BootScene.js:** Configuración inicial de resolución (recomendado 800x600 o 1024x768), escalado, modo pantalla completa. Transición a PreloadScene.
- **PreloadScene.js:** Precarga de todos los assets con barra de progreso visual. Fases: assets críticos → nivel actual → comunes → siguiente nivel (opcional). Inicializa GameManager. Transición a MainMenuScene.
- **MainMenuScene.js:** Pantalla de inicio simple con título y botones. Manejo de input (teclado/mouse). Transición a Level01Scene o Config según selección.
- **LevelXXScene.js:** Escena principal. Carga tilemap desde JSON. Crea todos los grupos de colisión. Procesa Object Layers para instanciar jugador, enemigos, items, trampas, objetos interactivos. Implementa matriz de colisiones. Gestiona cronómetro. Detecta condiciones de victoria/derrota. Transición a otras escenas según resultado.
- **LevelCompleteScene.js:** Muestra mensaje de éxito y estadísticas. Opciones para continuar o volver al menú.
- **GameOverScene.js:** Muestra mensaje de derrota y causa. Opciones: reintentar nivel o volver al menú.
- **VictoryScene.js:** Pantalla final con animación y resumen.
- **GameManager.js:** Singleton pattern. Almacena y gestiona estado global del juego. Métodos de guardado/carga en localStorage.
- **Player.js:** Clase dedicada que extiende `Phaser.Physics.Arcade.Sprite`. Implementa FSM con todos los estados. Métodos: `update()`, `move()`, `jump()`, `attack()`, `crouch()`, `climb()`, `takeDamage()`, `setState()`. Registra animaciones por estado usando Animation Manager. Sistema de invencibilidad temporal con parpadeo.
- **BaseEnemy.js:** Clase base que extiende `Phaser.Physics.Arcade.Sprite`. Implementa FSM básica de IA. Métodos de detección de jugador (zona de detección, línea de vista).
- **Guard.js, ArmoredGuard.js, etc.:** Clases específicas que extienden BaseEnemy con comportamientos únicos.
- **BaseItem.js:** Clase base para items. Overlap detection con jugador.
- **HealthPotion.js, LifeMedal.js, Key.js:** Clases específicas con efectos únicos.
- **Spike.js, Pit.js, Blade.js:** Clases para trampas con comportamientos específicos.
- **Lever.js, Door.js:** Clases para objetos interactivos con sistema de vinculación por IDs.
- **level1.json, level2.json:** Ejemplos de datos de nivel en formato Tiled JSON con todas las capas requeridas (BACKGROUND, PLATFORMS, FOREGROUND, Object Layers: SPAWN_POINTS, TRAPS, INTERACTIVES, BOUNDARIES).
- **constants.js:** Almacena todas las constantes: `PLAYER_SPEED`, `JUMP_VELOCITY`, `GRAVITY`, `DAMAGE_VALUES`, `INVINCIBILITY_DURATION`, `TIME_LIMIT_PER_LEVEL`, etc.
- **helpers.js:** Funciones auxiliares (conversión de coordenadas Tiled a Phaser, utilidades de colisión, etc.).

**Optimizaciones Requeridas:**
- Destrucción adecuada en método `shutdown()` de cada escena: remover event listeners, detener timers/tweens, liberar referencias
- Usar Object Pooling para enemigos y efectos visuales
- Marcar grupos estáticos correctamente
- Desactivar física innecesaria en decoraciones
- Establecer límites de cámara para evitar renderizar fuera del nivel

**Debug Mode:**
Implementa modo debug opcional (activar con flag) que renderiza:
- Hitboxes de todos los objetos físicos
- Zonas de detección de enemigos
- Información de FPS y número de objetos activos

Comienza a generar la estructura y el código ahora. El primer archivo a crear es `prince-of-persia-clone-WCA/index.html`.


#Prompt corrección graficos y jugabilidad

   Anaiza que no haya ningun error de jugabilidad, y mejora los graficos estilo 8-bit