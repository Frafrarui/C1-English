# Práctica de Inglés C1 (estilo Cambridge Advanced)

Aplicación web local para practicar exámenes de inglés C1. Los exámenes se
definen como archivos JSON en `data/exams/`, por lo que añadir uno nuevo no
requiere tocar código: basta con crear un archivo nuevo siguiendo el mismo
esquema.

## Puesta en marcha

```bash
npm install
npm start
```

Luego abre [http://localhost:3000](http://localhost:3000).

Para desarrollo con recarga automática al guardar cambios:

```bash
npm run dev
```

## Estructura del proyecto

```
server.js               Configuración de Express y rutas
lib/examService.js      Carga de exámenes desde JSON y lógica de corrección
data/exams/*.json        Un archivo JSON por examen
views/                   Plantillas EJS (menú, examen, pregunta)
public/css/style.css     Estilos
public/js/exam.js        Interactividad: pestañas + envío/corrección vía fetch
```

## Cómo añadir un examen nuevo

1. Crea un archivo `data/exams/examN.json` (el `id` del examen es el nombre
   de archivo sin extensión).
2. Sigue este esquema:

```jsonc
{
  "id": "exam2",
  "title": "Examen 2",
  "description": "Texto opcional que aparece en el menú",
  "sections": {
    "useOfEnglish": {
      "title": "Use of English",
      "parts": [
        {
          "partNumber": 1,
          "type": "multiple-choice-cloze",   // solo informativo
          "instructions": "Instrucciones de la parte",
          "text": "Texto con huecos (1)___ ...",   // opcional
          "questions": [
            {
              "id": "ue1_1",              // único en todo el examen
              "number": 1,
              "options": [                 // si hay "options" -> radio buttons
                { "label": "A", "text": "opción A" },
                { "label": "B", "text": "opción B" }
              ],
              "answer": "A"                // debe coincidir con un "label"
            }
          ]
        }
      ]
    },
    "reading": {
      "title": "Reading",
      "parts": [ /* mismo formato que arriba, con "prompt" en cada pregunta */ ]
    },
    "listening": {
      "title": "Listening",
      "note": "Texto opcional (p. ej. recordatorio de reproducir el audio externamente)",
      "parts": [ /* mismo formato, sin necesidad de audio */ ]
    }
  }
}
```

### Reglas clave del esquema

- **Pregunta de opción múltiple**: incluye `options` (array de
  `{ "label", "text" }`). Se renderiza como radio buttons.
- **Pregunta de respuesta abierta** (open cloze, word formation, key word
  transformation): omite `options`. Se renderiza como campo de texto y la
  corrección ignora mayúsculas/minúsculas y espacios al inicio/final.
- **Respuestas alternativas válidas**: añade `"acceptedAnswers": ["otra", "válida"]`
  junto a `answer` si una pregunta abierta admite más de una respuesta correcta.
- **`id` de pregunta**: debe ser único dentro del examen (se usa para
  identificar la respuesta del usuario y mostrar la corrección).
- **Listening**: no incluyas reproductor de audio; solo preguntas y
  opciones, ya que el audio se reproduce externamente (p. ej. desde el móvil).

Una vez tengas el texto y las preguntas de un examen real, puedes pasármelo
tal cual (texto + preguntas + opciones + respuestas correctas) y yo lo
convierto a este formato JSON.

## Cómo funciona la corrección

1. El usuario responde a las preguntas de las tres secciones (navegables
   mediante pestañas, todas visibles en una sola página por examen).
2. Al pulsar "Finalizar y corregir", el frontend envía todas las respuestas
   a `POST /api/exam/:examId/submit`.
3. El servidor compara las respuestas con las almacenadas en el JSON
   (las respuestas correctas nunca se envían al navegador antes de corregir)
   y devuelve la puntuación total, por sección y el detalle por pregunta.
4. El frontend resalta cada pregunta como correcta/incorrecta y muestra un
   resumen de puntuación.
