import { defineConfig } from 'tsup'

export default defineConfig({
    entry: ['api/index.ts', 'src/index.ts'],
    format: ['esm'],
    target: 'node18',
    clean: true,
    minify: false,
    sourcemap: true,
    bundle: true,
    external: [
        'pino-pretty',
    ],
})