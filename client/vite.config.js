import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import fs from 'fs/promises';
import svgr from '@svgr/rollup';

// https://vitejs.dev/config/
export default defineConfig({
    resolve: {
        alias: {
            src: resolve(__dirname, 'src'),
        },
        extensions: ['.js', '.jsx', '.json'],
    },
    plugins: [
        react({
            include: '**/*.{jsx,js}',
            babel: {
                plugins: ['@babel/plugin-transform-react-jsx'],
            },
        }),
        svgr(),
    ],
    optimizeDeps: {
        include: ['@mui/icons-material'],
        esbuildOptions: {
            loader: {
                '.js': 'jsx',
            },
            plugins: [
                {
                    name: 'load-js-files-as-jsx',
                    setup(build) {
                        build.onLoad({ filter: /src\\.*\.js$/ }, async (args) => {
                            const contents = await fs.readFile(args.path, 'utf8');
                            return {
                                loader: 'jsx',
                                contents,
                            };
                        });
                    },
                },
            ],
        },
    },
    build: {
        outDir: 'dist', // Changed from 'build' to 'dist'
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom'],
                    mui: ['@mui/material', '@mui/icons-material'],
                },
            },
        },
    },
});
