# Huerta Hoy Garden Stories

Creá una app web móvil-first (instalable como PWA) llamada "Huerta Hoy" para amantes de huertas y plantas, en español rioplatense.

Estilo: simple y atrapante, verde oscuro y tonos tierra, fotos grandes, bordes redondeados.

Funciones (solo estas):

1. Registro y login con email, nombre de usuario único y contraseña segura (mínimo 8 caracteres, con letras y números). Usar Supabase Auth.

2. Feed de inicio tipo Instagram con entradas de diario y consultas, ordenado de más nuevo a más viejo.

3. Mi diario: lista de mis huertas/plantas, cada una con línea de tiempo de fotos por fecha.

4. Nueva entrada: foto, fecha, nota corta, etiqueta huerta o planta.

5. Nueva consulta: foto, pregunta y nombre de la planta.

6. Detalle con likes y comentarios.

7. Perfil con foto, usuario y mis diarios.

8. Botón de reportar y bloquear en cada publicación.

Guardar fotos en Supabase Storage. Solo fotos por ahora, sin video.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e67095ed-db10-44ea-b01b-264b37373375).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
