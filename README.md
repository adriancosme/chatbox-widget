# Lumina Stream Chatbox

Un widget de chatbox personalizado, premium y altamente configurable diseñado específicamente para **StreamElements** (compatible con Twitch). Este widget utiliza los principios de diseño de **Lumina Stream**, con soporte para animaciones de entrada, personalización completa de colores y tipografía, y soporte nativo para emotes de **7TV**.

---

## ✨ Características Principales

* **Glassmorphism Estilizado:** Fondo semi-transparente con efectos de cristal y desenfoque que se adaptan a cualquier fondo de stream.
* **Integración con 7TV:** Carga de forma dinámica los emotes de tu canal de 7TV ingresando tu ID de canal de Twitch.
* **Mensajes Moderados:** Soporte nativo para comandos de moderación de StreamElements (`delete-message` y `delete-messages`) para borrar mensajes inapropiados al instante.
* **Gran Nivel de Personalización:** Modifica fuentes, tamaños, colores de fondo, bordes, opacidades y sombras directamente desde el panel de StreamElements.
* **Animaciones de Entrada Flexibles:** Los mensajes pueden entrar desde abajo (Bottom), arriba (Top), izquierda (Left) o derecha (Right) con transiciones suaves.
* **Alineación de Burbujas:** Permite alinear el chat a la izquierda, al centro o a la derecha según la ubicación en tu diseño de stream.
* **Soporte de Emotes Gigantes:** Si un usuario envía un solo emote, este se renderizará automáticamente en un tamaño más grande para mayor impacto visual.

---

## 🛠️ Instalación en StreamElements

Sigue estos sencillos pasos para instalar el widget en tu overlay de StreamElements:

1. Ve a tu panel de control de [StreamElements](https://streamelements.com/) y abre tu **Editor de Overlays**.
2. Añade un nuevo elemento: **Static/Custom** $\rightarrow$ **Custom Widget**.
3. Selecciona el widget recién creado y abre la pestaña **Settings** (Configuración) a la izquierda, y luego haz clic en **Open Editor** (Abrir Editor).
4. Copia y pega el contenido de los archivos de este repositorio en sus respectivas pestañas dentro de StreamElements:
   * Contenido de [`widget.html`](./widget.html) $\rightarrow$ Pestaña **HTML**.
   * Contenido de [`widget.css`](./widget.css) $\rightarrow$ Pestaña **CSS**.
   * Contenido de [`widget.js`](./widget.js) $\rightarrow$ Pestaña **JS**.
   * Contenido de [`fields.json`](./fields.json) $\rightarrow$ Pestaña **FIELDS**.
5. Haz clic en **Done** (Hecho) y luego en **Save** (Guardar) arriba a la derecha.

---

## ⚙️ Opciones de Configuración (Pestaña "Settings")

Una vez instalado, verás las siguientes opciones en el menú lateral de StreamElements:

### 1. 7TV Configuration
* **Twitch User ID (For 7TV):** Tu ID numérico de canal de Twitch. Si lo ingresas, el chatbox descargará y renderizará automáticamente los emotes activos de 7TV en tu canal.

### 2. General Settings
* **Max Messages:** Límite máximo de mensajes visibles simultáneamente en pantalla (entre 10 y 100).
* **Bubble Alignment:** Alineación horizontal del chat (`Left`, `Center`, `Right`).

### 3. Animation Settings
* **Entrance Animation Direction:** Dirección desde la que aparecen los mensajes (`From Bottom`, `From Top`, `From Left`, `From Right`).

### 4. Theme Colors (Estilo del Chat)
* **Bubble Background Color & Opacity:** Define el color de fondo de cada mensaje y su nivel de transparencia.
* **Bubble Border Color & Opacity:** Define el borde sutil de las burbujas para simular el relieve del cristal.
* **Message Text Color:** Color del texto del mensaje.
* **Fallback Username Color:** Color del nombre del usuario si este no tiene un color personalizado en Twitch.
* **Username Shadow Color & Opacity:** Sombra brillante para destacar el nombre de usuario.

### 5. Theme Size
* **Bubble Corner Radius:** Nivel de redondeado de las esquinas de los mensajes (en píxeles).
* **Font Size:** Tamaño general de la fuente (en píxeles). El tamaño del nombre de usuario se escala automáticamente.

---

## ♿ Accesibilidad y Rendimiento

El diseño base sigue pautas de legibilidad optimizadas:
* Fuentes limpias y legibles usando la familia tipográfica **Inter**.
* Tamaños de fuente ajustables y altos niveles de contraste que previenen la fatiga visual.
* Control automatizado de memoria: limpia los nodos antiguos del DOM al superar el límite de `Max Messages` para mantener la transmisión fluida y libre de lags.
