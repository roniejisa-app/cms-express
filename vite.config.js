import { resolve } from 'path'
import { defineConfig, loadEnv } from 'vite'
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

const scssFiles = [
    resolve(__dirname, './resources/css/media.scss'),
    resolve(__dirname, './resources/css/admin.scss'),
    resolve(__dirname, './resources/css/chat.scss'),
    resolve(__dirname, './resources/css/meet.scss'),
    resolve(__dirname, './resources/css/r8/r8.scss'),
    resolve(__dirname, './platform/plugins/pages/resources/css/custom.scss'),
]
const jsFiles = [
    resolve(__dirname, './resources/js/media/media.js'),
    resolve(__dirname, './resources/js/admin/admin.js'),
    resolve(__dirname, './resources/js/admin/livestream.js'),
    resolve(__dirname, './platform/plugins/pages/resources/js/grapes.js'),
]
console.log(resolve(__dirname, './utils'))
export default defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'public'),
        },
    },
    build: {
        outDir: './public/admin',
        watch: true,
        copyPublicDir: false,
        minify: true,
        rollupOptions: {
            input: [
                // resolve(__dirname, "./resources/js/listener.js")
                ...scssFiles,
                ...jsFiles,
            ],
            output: {
                dir: resolve(__dirname, './public/core'),
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
