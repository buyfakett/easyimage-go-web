import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSass } from '@rsbuild/plugin-sass';
import path from 'path';
// @ts-ignore
import { APP_NAME } from "./src/config";

let ENV_url;

try {
    const { ENV_url: importedUrl } = require('./url.config');
    ENV_url = importedUrl;
} catch (error) {
    console.error('没有url.config.js文件:', error);
    ENV_url = '';
}

export default defineConfig({
    source: {
        entry: {
            index: './src/main.tsx'
        },
    },
    html: {
        title: APP_NAME,
        favicon: './public/easyimage-go.svg',
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './')
        }
    },
    plugins: [pluginReact(), pluginSass()],
    server: {
        proxy: {
            '/api': {
                target: ENV_url,
                changeOrigin: true,
            }
        }
    },
    output: {
        legalComments: 'none',
        distPath: {
            root: 'dist',
        },
        inlineScripts({ size }) {
            return size < 10 * 1000;
        },
    },
});