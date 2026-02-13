# minimo-vite-plugin

Minimal Vite plugin for Minimo projects.

It does 2 things:

1. Writes `public/hot` while Vite dev server is running.
2. Forces browser full reload when Blade/Markdown/PHP files change.

## Install

```bash
npm install -D minimo-vite-plugin vite
```

## Usage

```js
// vite.config.js
import { defineConfig } from 'vite';
import minimo from 'minimo-vite-plugin';

export default defineConfig({
  plugins: [minimo()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true
  },
  build: {
    manifest: true,
    outDir: 'public/build',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        app: 'resources/js/app.js'
      }
    }
  }
});
```

## Default watched files

- `views/**/*.blade.php`
- `views/**/*.blade.md`
- `views/**/*.md`
- `app/**/*.php`
- `packages/minimo-core/src/**/*.php`

## Options

```js
minimo({
  hotFile: 'public/hot',          // where to write the dev server URL
  watch: [/* globs */],           // extra/replacement watch globs
  shouldReload: (file) => true,   // custom matcher for full reload
  devServerUrl: 'http://127.0.0.1:5173' // force URL written to hot file
});
```

## Example with custom watch

```js
plugins: [
  minimo({
    watch: [
      'views/**/*.blade.php',
      'content/**/*.md',
      'app/**/*.php'
    ]
  })
]
```

## Notes

- This plugin is for `vite dev` behavior.
- It removes the hot file when the dev server stops.
- You still use normal Vite build output (`manifest.json`) for production/static builds.

## License

MIT
