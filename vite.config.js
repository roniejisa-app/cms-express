import { resolve } from 'path'
import { defineConfig } from 'vite'
const name = process.env.BUILD_TARGET
// Parse command-line arguments

function preserveDirectoryStructure() {
    return {
        name: 'preserve-directory-structure',
        generateBundle(options, bundle) {
            console.log(options)
            for (const [fileName, chunkInfo] of Object.entries(bundle)) {
                // console.log(fileName, chunkInfo);
                // if (chunkInfo.type === 'asset' && fileName.endsWith('.css')) {
                //   const originalPath = cssFiles.find(file => file.path.endsWith(fileName.replace(/assets\//, '')))?.name;
                //   if (originalPath) {
                //     const newFileName = path.join('assets', originalPath);
                //     bundle[newFileName] = chunkInfo;
                //     delete bundle[fileName];
                //   }
                // }
            }
        },
    }
}
const plugins = {
    admin: {
        files: {
            css: [
                resolve(__dirname, './resources/css/admin.scss'),
                resolve(__dirname, './resources/css/r8/r8.scss'),
                resolve(__dirname, './resources/css/chat.scss'),
            ],
            js: [resolve(__dirname, './resources/js/admin/admin.js')],
        },
        dir: resolve(__dirname, './public/core/admin'),
    },
    media: {
        files: {
            css: [resolve(__dirname, './resources/css/media.scss')],
            js: [resolve(__dirname, './resources/js/media/media.js')],
        },
        dir: resolve(__dirname, './public/core/media'),
    },
    meet: {
        files: {
            css: [resolve(__dirname, './resources/css/meet.scss')],
            js: [resolve(__dirname, './resources/js/admin/livestream.js')],
        },
        dir: resolve(__dirname, './public/core/meet'),
    },
    pages: {
        files: {
            css: [
                resolve(
                    __dirname,
                    './platform/plugins/pages/resources/css/custom.scss'
                ),
            ],
            js: [
                resolve(
                    __dirname,
                    './platform/plugins/pages/resources/js/grapes.js'
                ),
            ],
        },
        dir: resolve(__dirname, './public/core/plugins/pages'),
    },
    login: {
        files: {
            css: [resolve(__dirname, './resources/css/admin/login.scss')],
            js: [],
        },
        dir: resolve(__dirname, './public/core/login'),
    },
}

const getDir = (type) => {
    return plugins[type].dir
}

const getFile = (type) => {
    return [...plugins[type].files.css, ...plugins[type].files.js]
}

export default defineConfig({
    resolve: {
        alias: {
            '@': resolve(__dirname, 'public'),
        },
    },
    build: {
        outDir: './public/admin',
        watch: true,
        copyPublicDir: false,
        chunkSizeWarningLimit: 2000,
        minify: true,
        rollupOptions: {
            input: getFile(name),
            output: {
                dir: getDir(name),
                entryFileNames: `js/[name].js`,
                chunkFileNames: `js/[name].js`,
                assetFileNames: `[ext]/[name].[ext]`,
            },
        },
    },
    server: {
        watch: {
            usePolling: true,
        },
    },
})
