import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const kit = path.resolve(import.meta.dirname, "./src/kit")

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // Исходники кита перенесены внутрь проекта, но их внутренние импорты
      // остались прежними (`@/lib/utils`, `@/components/ui/button`), а экран
      // задач импортирует кит по его опубликованному имени. Оба алиаса ведут в
      // одну папку — благодаря этому ни один скопированный файл не пришлось
      // править, и обновить их из монорепозитория можно простым копированием.
      "@scrambled/ui-kit/icons": path.resolve(kit, "icons.ts"),
      "@scrambled/ui-kit": path.resolve(kit, "index.ts"),
      "@": kit,

      // Те же подмены, что в сборке кита: пакеты тянут CJS-сборку
      // `use-sync-external-store`, которая ломает ESM-бандл.
      "use-sync-external-store/shim/with-selector.js": path.resolve(
        kit,
        "lib/use-sync-external-store-with-selector-shim.ts"
      ),
      "use-sync-external-store/shim/index.js": path.resolve(
        kit,
        "lib/use-sync-external-store-shim.ts"
      ),
      "use-sync-external-store/with-selector.js": path.resolve(
        kit,
        "lib/use-sync-external-store-with-selector-shim.ts"
      ),
    },
  },
  server: {
    host: "127.0.0.1",
    port: 5174,
  },
})
