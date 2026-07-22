# C1 · Key Word Transformations

Aplicación web para practicar transformaciones de oraciones del examen C1 de inglés.

## Estructura del proyecto

```
c1-transformaciones/
├── index.html          ← página principal
├── css/
│   └── styles.css      ← todos los estilos
├── js/
│   └── app.js          ← lógica del juego
├── data/
│   └── questions.js    ← banco de preguntas ← EDITA AQUÍ
└── README.md
```

## Cómo usarlo en VS Code

1. Abre la carpeta en VS Code: `File → Open Folder`
2. Instala la extensión **Live Server** (ritwickdey.LiveServer)
3. Haz clic derecho en `index.html` → **Open with Live Server**
4. Se abrirá en el navegador con recarga automática al guardar

## Añadir nuevas preguntas

Edita `data/questions.js` y añade objetos al array `ALL_QUESTIONS`:

```js
{
  tanda: 3,                                    // número de tanda
  original: "She didn't know anyone at the party.",
  keyword: "STRANGERS",
  before: "Everyone at the party",
  after: "her.",
  solution: "was a stranger to"                // 2–6 palabras
},
```

## Sistema de puntuación

| Resultado | Puntos |
|-----------|--------|
| Respuesta exacta | **2 pts** |
| Al menos la mitad de las palabras correctas (en orden) | **1 pt** |
| Menos de la mitad correctas | **0 pts** |

## Sesiones aleatorias

Cada vez que inicias o pulsas "Nueva sesión", el sistema selecciona **10 preguntas aleatorias** del banco total. Así nunca repites el mismo orden.

"Repasar falladas / parciales" crea una sesión nueva solo con las preguntas que obtuvieron 0 o 1 punto.
