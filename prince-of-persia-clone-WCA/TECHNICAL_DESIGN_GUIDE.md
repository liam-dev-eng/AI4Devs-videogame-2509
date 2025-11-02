# Guía de Diseño Técnica: Clon de Prince of Persia (1989)
## Arquitectura y Diseño para Phaser 3

---

## 1. Análisis del Juego Original

### 1.1 Mecánicas de Juego Fundamentales

#### Movimiento del Personaje
- **Movimiento Horizontal**: Caminar/correr hacia izquierda y derecha con aceleración y deceleración controladas.
- **Física de Salto y Caída**: 
  - Salto vertical controlado con altura máxima limitada por el tiempo de presión del botón.
  - Caída con gravedad constante y velocidad terminal.
  - Detección de aterrizaje preciso en plataformas.
- **Agacharse**: Reducción del hitbox del personaje para pasar por espacios bajos.
- **Escalar**: Sistema de agarre a paredes verticales, permitiendo movimiento vertical limitado.
- **Precisión Temporal**: El juego original usa animación cuadro por cuadro (frame-perfect), requiriendo sincronización precisa entre input y visualización.

#### Sistema de Combate
- **Ataques con Espada**: 
  - Ataques horizontales y verticales (alto/bajo).
  - Ventanas de invencibilidad temporal después de recibir daño.
  - Sistema de bloqueo/parada del enemigo.
- **Estados de Combate**: Preparación de ataque, ejecución, recuperación, y estado de defensa.
- **Daño por Contacto**: Enemigos infligen daño al tocar al jugador, además de sus ataques directos.

#### Interacción con Objetos
- **Palancas**: Objetos activables que cambian el estado del nivel (abrir/cerrar puertas, activar/desactivar trampas).
- **Puertas**: Bloqueos físicos que requieren activación de palanca o llave.
- **Objetos Coleccionables**: Pociones de salud, frutas (puntos), y medallones de vida extra.

#### Sistema de Tiempo
- **Límite de Tiempo Estricto**: Cronómetro global que cuenta regresivamente.
- **Penalizaciones**: Pérdida de vida o muerte si se agota el tiempo.
- **Múltiples Niveles con Tiempo Acumulado**: El tiempo restante se transfiere entre niveles.

### 1.2 Estructura de los Niveles

#### Diseño de Plataformas
- **Plataformas Estáticas**: Suelos sólidos y plataformas elevadas para saltar.
- **Plataformas Móviles**: Plataformas que se desplazan horizontal o verticalmente en ciclos.
- **Escaleras y Superficies Escalables**: Permiten movimiento vertical controlado.

#### Tipos de Trampas
- **Pisos Falsos**: Plataformas que colapsan después de un tiempo o al pisar.
- **Cuchillas Oscilantes**: Trampas con movimiento de péndulo que infligen daño al contacto.
- **Espigas**: Obstáculos estáticos o que emergen periódicamente.
- **Pozos Letales**: Vacíos que causan muerte instantánea por caída.
- **Puertas de Espigas**: Barreras que se activan/desactivan con palancas.

#### Progresión Linear
- **Pantallas Estáticas**: Cada nivel ocupa una pantalla fija con scroll horizontal/vertical controlado.
- **Transición entre Pantallas**: Al alcanzar el borde de la pantalla, se carga la siguiente sección del nivel o el siguiente nivel.
- **Checkpoints**: Puntos de reaparición tras muerte, aunque el original permite reaparición inmediata en el punto de inicio del nivel.

### 1.3 Elementos del HUD

- **Indicador de Salud**: Representación visual de la vida del jugador (número o barra).
- **Tiempo Restante**: Contador visible que muestra minutos y segundos restantes.
- **Vidas**: Contador de vidas extra (si se implementa sistema de continues).
- **Inventario Visual**: Indicadores de objetos recogidos (pociones, llaves).

---

## 2. Arquitectura en Phaser 3

### 2.1 Estructura de Escenas (Scenes)

#### Boot Scene
- **Propósito**: Inicialización mínima del motor Phaser.
- **Responsabilidades**:
  - Configuración inicial de la resolución del juego.
  - Configuración de escalado y modo de pantalla completa.
  - Registro de fuente personalizada si es necesaria.
  - Transición a Preload Scene.

#### Preload Scene
- **Propósito**: Carga de todos los assets necesarios.
- **Responsabilidades**:
  - Carga de imágenes, spritesheets, tilesets, audio, fuentes.
  - Barra de progreso visual para feedback al usuario.
  - Manejo de errores de carga.
  - Inicialización de estructuras de datos globales (Game Manager).
  - Transición a MainMenu Scene.

#### MainMenu Scene
- **Propósito**: Menú principal del juego.
- **Responsabilidades**:
  - Visualización del título del juego.
  - Opciones: Nuevo Juego, Continuar (si hay partida guardada), Configuración, Créditos.
  - Manejo de input para navegación entre opciones.
  - Transición a Level01 Scene o Config Scene según selección.

#### LevelXX Scene (Level01, Level02, etc.)
- **Propósito**: Escena principal de juego para cada nivel.
- **Responsabilidades**:
  - Carga del tilemap del nivel desde archivo JSON (exportado desde Tiled).
  - Creación del mundo físico y grupos de colisión.
  - Instanciación del jugador, enemigos, trampas y objetos interactivos.
  - Actualización del ciclo de juego (update loop).
  - Gestión del cronómetro del nivel.
  - Detección de condiciones de victoria/derrota.
  - Transición a LevelComplete Scene, GameOver Scene, o siguiente nivel.

#### LevelComplete Scene
- **Propósito**: Pantalla de transición entre niveles o victoria de nivel.
- **Responsabilidades**:
  - Mostrar mensaje de éxito.
  - Mostrar estadísticas del nivel (tiempo usado, items recogidos).
  - Opción de continuar al siguiente nivel o volver al menú.
  - Transición a siguiente LevelXX Scene o MainMenu Scene.

#### GameOver Scene
- **Propósito**: Pantalla de fin de juego por muerte o tiempo agotado.
- **Responsabilidades**:
  - Mostrar mensaje de derrota.
  - Mostrar causa (tiempo agotado, salud agotada).
  - Opciones: Reintentar nivel, Volver al menú principal.
  - Transición a LevelXX Scene (reintentar) o MainMenu Scene.

#### Victory Scene
- **Propósito**: Pantalla final al completar todos los niveles.
- **Responsabilidades**:
  - Animación de victoria.
  - Mostrar resumen final del juego.
  - Opciones: Nuevo Juego, Volver al menú.

#### Pause Scene
- **Propósito**: Menú de pausa durante el juego.
- **Responsabilidades**:
  - Pausar el tiempo y la lógica del juego.
  - Opciones: Reanudar, Reiniciar Nivel, Volver al Menú.
  - Puede implementarse como una escena superpuesta (overlay) o como pausa de la escena actual.

### 2.2 Gestión del Estado Global del Juego

#### Game Manager (Singleton Pattern)
- **Almacenamiento de Estado Persistente**:
  - Tiempo total restante acumulado entre niveles.
  - Salud máxima del jugador (puede aumentar con medallones).
  - Nivel actual de progresión.
  - Items recogidos (llaves, pociones, etc.).
  - Configuraciones del usuario (volumen de audio, controles personalizados).

#### Implementación Sugerida
- **Clase GameManager**: Objeto singleton accesible globalmente desde cualquier escena.
- **Métodos Principales**:
  - `saveGameState()`: Guarda el progreso en localStorage.
  - `loadGameState()`: Carga el progreso desde localStorage.
  - `resetGameState()`: Reinicia el estado para una nueva partida.
  - `updateTime()`: Actualiza y verifica el tiempo restante.
  - `updateHealth()`: Gestiona cambios en la salud del jugador.
  - `addItem()`: Registra la recolección de items.

#### Comunicación entre Escenas
- **Phaser Scene Data**: Pasar datos simples mediante `scene.start('SceneName', { data: value })`.
- **Game Manager**: Acceso compartido para estado complejo y persistente.
- **Eventos Globales**: Utilizar el EventEmitter de Phaser para comunicación desacoplada (ej: evento de "levelComplete" escuchado por múltiples sistemas).

---

## 3. Diseño del Personaje Principal y Enemigos

### 3.1 Estados del Personaje

#### Máquina de Estados Finitos (FSM)
- **Estado IDLE**: Personaje en reposo, animación de respiración o espera.
- **Estado RUNNING**: Movimiento horizontal, animación de carrera.
- **Estado JUMPING**: Ascenso durante el salto, animación de salto ascendente.
- **Estado FALLING**: Caída libre, animación de caída o preparación para aterrizaje.
- **Estado ATTACKING**: Ejecución de ataque con espada, animación de ataque con hitbox temporal.
- **Estado CROUCHING**: Agachado, hitbox reducida, puede atacar hacia abajo.
- **Estado CLIMBING**: Escalando una pared, movimiento vertical controlado, animación de escalada.
- **Estado TAKING_DAMAGE**: Estado de invencibilidad temporal, animación de parpadeo, inmunidad a más daño.
- **Estado DYING**: Animación de muerte, transición a GameOver Scene.

#### Gestión de Transiciones
- **Sistema de Prioridad**: Algunos estados tienen prioridad (TAKING_DAMAGE y DYING bloquean la mayoría de transiciones).
- **Validación de Transiciones**: Verificar condiciones antes de cambiar de estado (ej: no saltar si está en el aire).
- **Eventos de Estado**: Emitir eventos al entrar/salir de estados para sincronizar sistemas (audio, efectos visuales).

### 3.2 Sistema de Animación

#### Sprite Sheets
- **Organización por Estado**: Cada estado tiene su propia secuencia de sprites en el spritesheet.
- **Dimensiones**: Sprites de tamaño consistente (ej: 32x48 píxeles para el personaje).
- **Formato**: Sprite sheet horizontal o cuadrícula con frames numerados.

#### Animation Manager de Phaser
- **Registro de Animaciones**: 
  - Una animación por estado del personaje.
  - Animaciones de transición opcionales (ej: inicio de salto, aterrizaje).
- **Configuración de Frame Rate**: Velocidad de reproducción (frames por segundo) diferente por animación (ej: ataque más rápido que caminar).
- **Repetición y Loop**: 
  - Animaciones de movimiento en loop (idle, running).
  - Animaciones de acción sin loop (attack, jump) que transicionan al estado siguiente al completarse.

#### Gestión de Animaciones
- **Cambio Automático**: El sistema de estados debe cambiar automáticamente la animación activa al cambiar de estado.
- **Análisis de Frame Events**: Utilizar eventos de animación para triggers precisos (ej: activar hitbox de ataque en el frame 3 de la animación de ataque).

### 3.3 Máquina de Estados para IA de Enemigos

#### Estados Básicos
- **Estado PATROLLING**: Movimiento predefinido en una ruta (de punto A a punto B y vuelta).
- **Estado IDLE**: Espera en una posición, puede cambiar a ALERT después de un tiempo.
- **Estado ALERT**: Detección del jugador en rango, preparación para perseguir.
- **Estado PURSUING**: Perseguir al jugador activamente, movimiento hacia la posición del jugador.
- **Estado ATTACKING**: Ejecutar ataque hacia el jugador, animación de ataque.
- **Estado RETREATING**: (Para enemigos avanzados) Retirada temporal después de recibir daño.
- **Estado DYING**: Animación de muerte antes de despawn.

#### Sistema de Detección
- **Zona de Detección Visual**: Área rectangular o circular delante del enemigo donde se detecta al jugador.
- **Línea de Vista**: Verificación de que no haya obstáculos entre enemigo y jugador.
- **Rango de Ataque**: Distancia mínima para cambiar de PURSUING a ATTACKING.

#### Comportamientos Específicos por Tipo de Enemigo
- **Guard (Básico)**: Patrulla simple, ataque directo al detectar jugador.
- **Armored Guard**: Requiere múltiples golpes, puede tener estado de bloqueo.
- **Spear Guard**: Mayor rango de ataque, comportamiento similar a Guard pero con hitbox extendida.
- **Spider**: Puede moverse por techos (inversión de gravedad), patrón de movimiento más errático.
- **Bat**: Movimiento aéreo, patrón de vuelo predefinido, ataque en picado.

---

## 4. Sistema de Física y Colisiones

### 4.1 Elección del Sistema de Física: ARCADE

#### Justificación
- **Simplicidad y Rendimiento**: ARCADE es más ligero y eficiente para juegos 2D de plataformas sin necesidad de física compleja.
- **Precisión Suficiente**: El juego requiere colisiones AABB (Axis-Aligned Bounding Box) simples y detección de solapamiento, perfectamente manejadas por ARCADE.
- **Control Determinístico**: ARCADE permite control granular de la velocidad y aceleración, esencial para la sensación "frame-perfect" del juego original.
- **Menos Overhead**: MATTER es más potente pero añade complejidad y overhead innecesario para este tipo de juego.

#### Limitaciones y Soluciones
- **Rotación**: ARCADE no maneja rotación compleja, pero el juego original no la requiere.
- **Fuerzas y Torque**: No necesario para el movimiento del personaje controlado por input directo.

### 4.2 Grupos de Colisión (Groups)

#### Definición de Grupos
Cada grupo debe ser un `Phaser.Physics.Arcade.Group` con propiedades físicas específicas.

#### Grupo: SUELO (Ground)
- **Tipo**: Plataformas sólidas y suelos del nivel.
- **Propiedades**: 
  - Estático o con velocidad cero.
  - Colisión completa (impassable).
- **Interacción con Jugador**: Colisión que detiene la caída y permite caminar.

#### Grupo: PLATAFORMAS_MOVILES (MovingPlatforms)
- **Tipo**: Plataformas que se desplazan.
- **Propiedades**:
  - Movimiento automático (horizontal o vertical, cíclico).
  - Colisión completa.
- **Interacción con Jugador**: 
  - El jugador debe "montar" la plataforma, moviéndose con ella.
  - Implementar sistema de "platform parenting" o ajustar la velocidad del jugador cuando está en contacto.

#### Grupo: TRAMPAS_LETALES (DeadlyTraps)
- **Tipo**: Espigas, cuchillas, pozos.
- **Propiedades**:
  - Área de daño instantáneo o con timer.
  - Pueden ser estáticas o móviles.
- **Interacción con Jugador**:
  - Overlap detection (no colisión física que bloquea movimiento).
  - Trigger de daño o muerte al solaparse.

#### Grupo: ENEMIGOS (Enemies)
- **Tipo**: Todos los tipos de enemigos.
- **Propiedades**:
  - Física dinámica (pueden caer, saltar).
  - Hitbox de colisión para interacción física.
  - Hitbox de ataque separada (overlap) para detectar golpes del jugador.
- **Interacciones**:
  - Colisión con SUELO para aterrizaje.
  - Overlap con jugador para infligir daño.
  - Overlap con arma del jugador para recibir daño.

#### Grupo: OBJETOS_INTERACTIVOS (InteractiveObjects)
- **Tipo**: Palancas, puertas, llaves.
- **Propiedades**:
  - Estáticos o con animación.
  - Overlap detection para activación.
- **Interacción con Jugador**:
  - Detección de solapamiento + input (ej: presionar tecla cerca de palanca).
  - Cambio de estado del objeto y efectos en el nivel (ej: abrir puerta).

#### Grupo: PUERTAS (Doors)
- **Tipo**: Puertas normales y puertas de espigas.
- **Propiedades**:
  - Pueden estar abiertas (sin colisión) o cerradas (colisión completa).
  - Estado controlado por palancas o llaves.
- **Interacción con Jugador**:
  - Si está cerrada, bloquea el paso.
  - Si está abierta, permite paso libre o requiere overlap + input para transición de nivel.

#### Grupo: ITEMS_COLECCIONABLES (Collectibles)
- **Tipo**: Pociones, frutas, medallones.
- **Propiedades**:
  - Overlap detection únicamente (no bloquean movimiento).
  - Desaparecen al ser recogidos.
- **Interacción con Jugador**:
  - Overlap automático para recolección.
  - Efecto inmediato (salud, puntos) o cambio de estado (medallón aumenta salud máxima).

#### Grupo: PAREDES_ESCALABLES (ClimbableWalls)
- **Tipo**: Superficies verticales que permiten escalar.
- **Propiedades**:
  - Overlap detection para detectar cuando el jugador está "tocando" la pared.
  - Marca visual o datos en el tilemap para identificar estas áreas.
- **Interacción con Jugador**:
  - Cuando el jugador está en contacto y presiona tecla de escalar, cambia a estado CLIMBING.

### 4.3 Matriz de Colisiones

#### Configuración de Colisiones y Overlaps
- **Jugador vs SUELO**: Colisión (bloquea movimiento vertical).
- **Jugador vs PLATAFORMAS_MOVILES**: Colisión (con sistema de "montar" plataforma).
- **Jugador vs TRAMPAS_LETALES**: Overlap (daño instantáneo).
- **Jugador vs ENEMIGOS**: Overlap (daño por contacto), colisión opcional para empuje.
- **Jugador vs OBJETOS_INTERACTIVOS**: Overlap (activación con input).
- **Jugador vs PUERTAS**: Colisión si está cerrada, overlap si está abierta (para transición).
- **Jugador vs ITEMS_COLECCIONABLES**: Overlap (recolección automática).
- **Jugador vs PAREDES_ESCALABLES**: Overlap (activación de modo escalada).
- **Arma del Jugador vs ENEMIGOS**: Overlap (solo durante estado ATTACKING del jugador).
- **ENEMIGOS vs SUELO**: Colisión (para que los enemigos no caigan).
- **ENEMIGOS vs PLATAFORMAS_MOVILES**: Colisión (para movimiento con plataformas).

---

## 5. Diseño de Niveles y Tilemaps

### 5.1 Proceso de Creación con Tiled Map Editor

#### Configuración del Mapa
- **Orientación**: Ortogonal (no isométrico).
- **Dimensiones**: 
  - Tamaño de tile: 16x16 o 32x32 píxeles (recomendado 32x32 para mejor visualización).
  - Tamaño del mapa: Definido por número de tiles (ej: 50 tiles de ancho x 20 tiles de alto).
- **Formato de Exportación**: JSON (formato nativo de Tiled) para compatibilidad con Phaser 3.

#### Estructura de Capas (Layers)

##### Capa: BACKGROUND (Fondo)
- **Propósito**: Elementos visuales decorativos sin colisión.
- **Contenido**: Texturas de fondo, elementos atmosféricos.
- **Propiedades en Phaser**: Renderizado primero, sin interacción física.

##### Capa: PLATFORMS (Plataformas Principales)
- **Propósito**: Estructura física del nivel (suelos, plataformas, paredes).
- **Contenido**: Tiles que forman el terreno jugable.
- **Propiedades en Phaser**: 
  - Capa de colisión activada.
  - Convierte tiles en cuerpos físicos estáticos (Static Group).

##### Capa: FOREGROUND (Primer Plano)
- **Propósito**: Elementos decorativos que aparecen delante del jugador pero sin colisión.
- **Contenido**: Detalles visuales, decoraciones frontales.
- **Propiedades en Phaser**: Renderizado último, sin física.

##### Capa de Objetos: SPAWN_POINTS (Puntos de Spawn)
- **Tipo**: Object Layer en Tiled.
- **Contenido**: 
  - Objeto "PlayerSpawn" (posición inicial del jugador).
  - Objetos "EnemySpawn" para cada enemigo (con propiedad de tipo: guard, bat, etc.).
  - Objetos "ItemSpawn" para items coleccionables.
- **Propiedades**: Coordenadas X, Y en píxeles dentro del mapa.

##### Capa de Objetos: TRAPS (Trampas)
- **Tipo**: Object Layer.
- **Contenido**: 
  - Objetos "Spike" (con propiedades: activado/desactivado, intervalo si es periódico).
  - Objetos "Pit" (coordenadas del área letal).
  - Objetos "Blade" (con propiedades: ruta de movimiento, velocidad).
- **Propiedades**: Posición, dimensiones, y propiedades personalizadas (custom properties) en Tiled.

##### Capa de Objetos: INTERACTIVES (Objetos Interactivos)
- **Tipo**: Object Layer.
- **Contenido**: 
  - Objetos "Lever" (palancas, con ID para vincular con puertas).
  - Objetos "Door" (puertas, con ID vinculado a palanca o requerimiento de llave).
  - Objetos "Key" (llaves coleccionables con ID de puerta asociada).
- **Propiedades**: Posición, tipo, y IDs de vinculación.

##### Capa de Objetos: BOUNDARIES (Límites y Transiciones)
- **Tipo**: Object Layer.
- **Contenido**: 
  - Objetos "LevelExit" (área que al ser alcanzada por el jugador, completa el nivel).
  - Objetos "Checkpoint" (puntos de reaparición).
  - Objetos "Boundary" (límites invisibles del nivel para prevenir caídas infinitas).
- **Propiedades**: Posición, dimensiones, y propiedades de destino (siguiente nivel, checkpoint ID).

### 5.2 Importación de Mapas en Phaser 3

#### Proceso de Carga
1. **Cargar Tileset**: Imagen de tileset asociada al mapa.
2. **Cargar Tilemap**: Archivo JSON exportado desde Tiled.
3. **Crear Capas**: Instanciar cada capa del mapa en Phaser.
4. **Configurar Colisiones**: 
   - Marcar tiles específicos en la capa PLATFORMS como colisionables.
   - Convertir la capa en un grupo de colisión estático.
5. **Procesar Object Layers**:
   - Iterar sobre objetos en cada Object Layer.
   - Instanciar entidades correspondientes (jugador, enemigos, trampas) según tipo y propiedades.
   - Configurar posiciones y estados iniciales desde datos del objeto.

#### Sistema de Coordenadas
- **Tiled Coordinates**: Tiled usa píxeles para Object Layers, pero tiles para Tile Layers.
- **Conversión en Phaser**: Convertir coordenadas de objetos de Tiled a posición en el mundo de Phaser (considerando el tamaño de tile y offset).

---

## 6. Gestión de Assets y UI

### 6.1 Tipos de Assets Necesarios

#### Spritesheets
- **Player Spritesheet**: 
  - Todas las animaciones del personaje (idle, run, jump, fall, attack, crouch, climb, damage, death).
  - Dimensiones sugeridas: múltiplo de frame size (ej: 320x480 para 10 frames de 32x48).
- **Enemy Spritesheets**:
  - Guard spritesheet (idle, walk, attack, death).
  - Armored Guard spritesheet.
  - Spear Guard spritesheet.
  - Spider spritesheet (incluye animación invertida para movimiento en techo).
  - Bat spritesheet (vuelo, ataque en picado).
- **Items Spritesheets**:
  - Health potion (animación de brillo opcional).
  - Life medal.
  - Key.
  - Fruit (coleccionables de puntos).

#### Tilesets
- **Main Tileset**: Suelos, paredes, plataformas básicas (formato: cuadrícula de tiles 32x32).
- **Trap Tileset**: Tiles para espigas, cuchillas, pozos.
- **Decoration Tileset**: Elementos decorativos sin colisión.
- **Background Tileset**: Texturas de fondo (pueden ser más grandes que 32x32).

#### Imágenes de UI
- **HUD Elements**:
  - Barra de salud (fondo y relleno).
  - Iconos de items.
  - Marcos/bordes para el HUD.
- **Menu Assets**:
  - Título del juego.
  - Botones (normal, hover, pressed).
  - Fondo del menú.
- **Iconos**: Iconos para controles, configuración, etc.

#### Fuentes
- **Font Bitmap**: Fuente en formato de imagen (opcional, para estilo pixel art).
- **Web Fonts**: Fuente TrueType/OpenType (ej: "Press Start 2P" para estilo retro) cargada vía CSS o Phaser.

#### Audio
- **Música**:
  - Tema principal del menú.
  - Música de fondo para cada nivel (loop).
  - Música de victoria/derrota.
- **Efectos de Sonido**:
  - Pasos del jugador.
  - Salto.
  - Ataque con espada.
  - Golpe recibido.
  - Muerte.
  - Sonido de palanca activada.
  - Sonido de puerta abriéndose.
  - Sonido de item recogido.
  - Sonido de trampa activada.
  - Sonidos de enemigos (pasos, ataques, muerte).

### 6.2 Carga de Assets en Preload Scene

#### Organización del Preload
- **Fase 1 - Assets Críticos**: 
  - Logo/título para mostrar durante carga.
  - Fuentes básicas.
- **Fase 2 - Assets de Nivel Actual**: 
  - Spritesheets del jugador y enemigos del nivel.
  - Tileset y tilemap del nivel.
  - Audio del nivel.
- **Fase 3 - Assets Comunes**: 
  - UI assets.
  - Sonidos comunes.
- **Fase 4 - Assets de Siguiente Nivel** (precarga opcional para transiciones fluidas).

#### Sistema de Progreso
- **Barra de Progreso Visual**: Actualizar barra basada en eventos de carga de Phaser.
- **Contador de Porcentaje**: Mostrar porcentaje de carga.
- **Mensajes Informativos**: Mostrar qué asset se está cargando actualmente.

### 6.3 Implementación de la Interfaz de Usuario (HUD)

#### HUD In-Game (Durante Juego)

##### Opción A: HUD con Objetos Phaser
- **Ventajas**: Todo renderizado en el mismo contexto, mejor rendimiento, integración nativa con el juego.
- **Implementación**:
  - **Container para HUD**: `Phaser.GameObjects.Container` que agrupa todos los elementos del HUD.
  - **Barra de Salud**: 
    - Fondo (rectángulo) + relleno (rectángulo con ancho variable según salud).
    - Texto numérico opcional mostrando salud actual/máxima.
  - **Cronómetro**: `Phaser.GameObjects.Text` actualizado cada frame o segundo.
  - **Iconos de Items**: `Phaser.GameObjects.Image` o `Sprite` mostrando items en inventario.
  - **Posicionamiento**: Fijar el Container en posición de pantalla (ej: esquina superior izquierda) usando `setScrollFactor(0, 0)`.
- **Actualización**: Actualizar elementos del HUD en el método `update()` de la Game Scene.

##### Opción B: HUD con Elementos DOM
- **Ventajas**: Más flexible para UI compleja, fácil de estilizar con CSS, mejor para formularios.
- **Implementación**:
  - Crear elementos HTML (`<div>`, `<span>`, etc.) posicionados sobre el canvas de Phaser.
  - Usar CSS para posicionamiento absoluto y estilo.
  - Usar JavaScript para actualizar contenido de elementos DOM.
  - Sincronizar con el ciclo de actualización de Phaser mediante eventos o polling.
- **Consideraciones**: 
  - Asegurar que elementos DOM no interfieran con eventos de input del juego.
  - Posicionar correctamente para diferentes resoluciones.

##### Recomendación Híbrida
- **HUD Principal**: Usar objetos Phaser (barra de salud, tiempo) para mejor integración.
- **Menús Complejos**: Usar DOM para menús de configuración o inventarios detallados.

#### Menús (Main Menu, Pause Menu)
- **Implementación con Phaser**:
  - Botones como `Phaser.GameObjects.Image` o `Container` con zonas clickeables.
  - Texto con `Phaser.GameObjects.Text`.
  - Manejo de input con `setInteractive()` y eventos `pointerdown`/`pointerup`.
- **Implementación con DOM**:
  - Estructura HTML completa con estilos CSS.
  - Event listeners de JavaScript para interacción.
  - Mostrar/ocultar menú controlando visibilidad CSS o agregando/removiendo del DOM.

---

## 7. Consideraciones de Rendimiento y Mejores Prácticas

### 7.1 Object Pooling

#### Concepto
Reutilizar objetos en lugar de crear y destruir constantemente, reduciendo garbage collection.

#### Aplicación en el Juego
- **Enemigos**: 
  - Pool de instancias de cada tipo de enemigo.
  - Al spawnear un enemigo, activar uno del pool en lugar de crear nuevo.
  - Al morir un enemigo, desactivar y devolver al pool en lugar de destruir.
- **Proyectiles** (si se implementan): Pool similar para proyectiles de enemigos.
- **Partículas/Efectos**: Pool para efectos visuales temporales (sangre, chispas, etc.).

#### Implementación Sugerida
- **Pool Manager**: Clase dedicada que gestiona múltiples pools.
- **Métodos**: `get(type)`, `release(object)`, `prewarm(count)` para crear instancias iniciales.
- **Límite de Pool**: Establecer máximo de objetos en pool para prevenir crecimiento excesivo.

### 7.2 Destrucción Adecuada de Escenas

#### Buenas Prácticas
- **Limpieza en `shutdown()`**: 
  - Remover event listeners.
  - Detener timers y tweens.
  - Liberar referencias a objetos grandes.
- **Destrucción de Objetos**: 
  - Destruir sprites, grupos, y objetos de Phaser explícitamente cuando ya no se necesiten.
  - Usar `destroy()` en lugar de solo ocultar objetos que no se reutilizarán.
- **Gestión de Audio**: 
  - Detener y destruir sonidos al salir de la escena (excepto música de fondo que puede persistir).
  - Limpiar referencias a Audio objects.

#### Prevención de Memory Leaks
- **Eliminar Referencias Globales**: Asegurar que las escenas no mantengan referencias a objetos después de `shutdown()`.
- **Caché de Texturas**: Phaser gestiona automáticamente, pero evitar cargar la misma textura múltiples veces.

### 7.3 Optimizaciones Adicionales

#### Renderizado
- **Culling**: Phaser 3 hace culling automático de objetos fuera de cámara, pero asegurar que objetos muy lejanos estén desactivados o en grupos no renderizados.
- **Sprite Batching**: Agrupar sprites estáticos en un solo objeto compuesto cuando sea posible.
- **Camara Boundaries**: Establecer límites de la cámara para evitar renderizar áreas fuera del nivel.

#### Física
- **Grupos Estáticos**: Marcar grupos estáticos correctamente para optimización interna de Phaser.
- **Desactivar Física Innecesaria**: Desactivar física de objetos que no interactúan (ej: decoraciones de fondo).
- **Límite de Bodies Activos**: Limitar número de cuerpos físicos activos simultáneamente si es posible.

#### Audio
- **Sprites de Audio**: Combinar múltiples efectos de sonido cortos en un sprite de audio para reducir overhead.
- **Pool de Sonidos**: Reutilizar instancias de sonido en lugar de crear nuevas para cada reproducción.
- **Volumen Dinámico**: Reducir volumen o desactivar sonidos lejanos al jugador.

#### Actualización (Update Loop)
- **Actualización Selectiva**: 
  - Actualizar solo objetos visibles o cercanos al jugador.
  - Usar flags para marcar objetos que necesitan actualización cada frame.
- **Throttling**: Reducir frecuencia de actualización para sistemas no críticos (ej: IA de enemigos lejanos actualizada cada N frames).

### 7.4 Estructura de Código y Mantenibilidad

#### Modularidad
- **Separación de Responsabilidades**: 
  - Clases dedicadas para cada entidad (Player, Guard, etc.).
  - Managers separados (AudioManager, UIManager, GameManager).
  - Utilidades en archivos separados (helpers, constants).
- **Escenas Modulares**: Dividir lógica compleja de Game Scene en sistemas más pequeños si es necesario.

#### Configuración Centralizada
- **Archivo de Constantes**: Todas las constantes del juego (velocidades, daños, tiempos) en un solo archivo.
- **Configuración de Niveles**: Datos de niveles en archivos JSON separados, fácilmente editables.

#### Debugging y Testing
- **Modo Debug**: 
  - Renderizar hitboxes y zonas de detección cuando esté activo.
  - Mostrar información de FPS, número de objetos activos, etc.
- **Logging Condicional**: Sistema de logging que se puede desactivar en producción.

---

## Conclusión

Esta guía proporciona una arquitectura completa y escalable para desarrollar un clon fiel de "Prince of Persia" (1989) utilizando Phaser 3. La estructura modular, el uso eficiente de los sistemas de Phaser, y las prácticas de optimización asegurarán un juego funcional, performante y mantenible. Cada componente puede ser implementado de manera independiente, facilitando el desarrollo iterativo y la colaboración en equipo.
