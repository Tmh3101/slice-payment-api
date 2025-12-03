import { defineConfig } from 'tsup'

export default defineConfig([
    // Local development build
    {
        entry: ['src/index.ts'],
        format: ['esm'],
        target: 'node18',
        outDir: 'dist/src',
        clean: true,
        minify: false,
        sourcemap: true,
        bundle: true,
        external: ['pino-pretty'],
    },
    // Vercel serverless build
    {
        entry: ['api/index.ts'],
        format: ['esm'],
        target: 'node18',
        outDir: 'dist/api',
        clean: false,
        minify: true,
        sourcemap: false,
        bundle: true,
        noExternal: [/.*/],
        external: ['pino-pretty'],
    },
])