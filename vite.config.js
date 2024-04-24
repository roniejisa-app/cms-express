import { resolve } from "path";
import { defineConfig, loadEnv } from "vite";
export default defineConfig({
    build: {
        outDir: "./public/admin",
        watch: true,
        copyPublicDir: false,
        minify: false,
        rollupOptions: {
            input: [
                resolve(__dirname, "./resources/css/media.scss"),
                resolve(__dirname, "./resources/css/admin.scss"),
                resolve(__dirname, "./resources/css/chat.scss"),
                resolve(__dirname, "./resources/css/r8/r8.scss"),
                resolve(__dirname, "./resources/js/media/media.js"),
                resolve(__dirname, "./resources/js/admin/admin.js"),
                // resolve(__dirname, "./resources/js/listener.js")
            ],
            output: {
                dir: resolve(__dirname, './public/admin'),
                // assetFileNames: function (file) {
                //     return files.includes(file.name)
                //         ? `[ext]/[name].[ext]`
                //         : `[ext]/[name]-[hash].[ext]`;
                // },
                // chunkFileNames: function (file) {
                // },
                // entryFileNames: function (file) {
                // }
                entryFileNames: `js/[name].js`,
                chunkFileNames: `js/[name].js`,
                assetFileNames: `[ext]/[name].[ext]`
            },
        }
    },
    server: {
        watch: {
            usePolling: true
        }
    }
});