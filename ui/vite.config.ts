import { defineConfig, loadEnv, searchForWorkspaceRoot } from "vite"
import react from "@vitejs/plugin-react-swc"
import { PolyfillOptions, nodePolyfills } from "vite-plugin-node-polyfills"
import tailwindcss from "@tailwindcss/vite"

// Unfortunate, but needed due to https://github.com/davidmyersdev/vite-plugin-node-polyfills/issues/81
// Suspected to be because of the yarn workspace setup, but not sure
const nodePolyfillsFix = (options?: PolyfillOptions | undefined): Plugin => {
  return {
    ...nodePolyfills(options),
    /* @ts-ignore */
    resolveId(source: string) {
      const m = /^vite-plugin-node-polyfills\/shims\/(buffer|global|process)$/.exec(source)
      if (m) {
        return `./node_modules/vite-plugin-node-polyfills/shims/${m[1]}/dist/index.cjs`
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  return {
    optimizeDeps: {
      exclude: ["@aztec/noir-acvm_js", "@aztec/noir-noirc_abi"],
    },
    base: "./",
    server: {
      // Headers needed for bb WASM to work in multithreaded mode
      headers: {
        "Cross-Origin-Opener-Policy": "same-origin",
        "Cross-Origin-Embedder-Policy": "require-corp",
      },
    },
    plugins: [
      react(),
      tailwindcss(),
      nodePolyfillsFix({ include: ["buffer", "net", "path", "stream", "tty", "vm", "util"] }),
    ],
    define: {
      "process.env": JSON.stringify({
        API_URL: env.API_URL,
        BASE_RPC_URL: env.BASE_RPC_URL,
        ETHERSCAN_API_KEY: env.ETHERSCAN_API_KEY,
        NODE_DEBUG: env.NODE_DEBUG,
        REOWN_PROJECT_ID: env.REOWN_PROJECT_ID,
      }),
    },
  }
})
