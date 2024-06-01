import { resolve } from 'path'
import { defineConfig, loadEnv } from 'vite'
const minimist = require('minimist');

// Parse command-line arguments
const args = minimist(process.argv.slice(2));
const target = args._[0] || 'default';
// const cssResources = globSync(
//     process.cwd() + '/resources/css/**/*.scss'
// ).map((file) => resolve(process.cwd(), file))
// const fileJSResources = globSync(process.cwd() + '/resources/js/**/*.js').map(
//     (file) => resolve(process.cwd(), file)
// )

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
}

const getDir = (type) => {
    return plugins[type].dir
}

const getFile = (type) => {
    return [...plugins[type].files.css, ...plugins[type].files.js]
}

const scssFiles = [
    resolve(__dirname, './resources/css/media.scss'),
    resolve(__dirname, './resources/css/admin.scss'),
    resolve(__dirname, './resources/css/chat.scss'),
    resolve(__dirname, './resources/css/meet.scss'),
    resolve(__dirname, './resources/css/r8/r8.scss'),
    // resolve(__dirname, './platform/plugins/pages/resources/css/custom.scss'),
]
const jsFiles = [
    resolve(__dirname, './resources/js/media/media.js'),
    resolve(__dirname, './resources/js/admin/admin.js'),
    resolve(__dirname, './resources/js/listener.js'),
    // resolve(__dirname, './resources/js/admin/livestream.js'),
    // resolve(__dirname, './platform/plugins/pages/resources/js/grapes.js'),
]

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
            // input: [
            //     ...scssFiles,
            //     ...jsFiles,
            // ],
            input: getFile(type),
            output: {
                // dir: resolve(__dirname, './public/core'),
                dir: getDir(type),
                // assetFileNames: function (file) {
                //     console.log(file);
                //     return file
                //         ? `[ext]/[name].[ext]`
                //         : `[ext]/[name]-[hash].[ext]`;
                // },
                // chunkFileNames: function (file) {
                // },
                // entryFileNames: function (file) {
                // }
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
