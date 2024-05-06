// templates/vite.config.ts
import { resolve } from "path";
import { defineConfig } from "file:///Users/zequez/Sync/projects/hoja/node_modules/.pnpm/vite@5.1.4_@types+node@20.11.21_terser@5.30.0/node_modules/vite/dist/node/index.js";
import UnoCSS from "file:///Users/zequez/Sync/projects/hoja/node_modules/.pnpm/unocss@0.59.0-beta.1_postcss@8.4.38_rollup@4.13.2_vite@5.1.4/node_modules/unocss/dist/vite.mjs";
import Icons from "file:///Users/zequez/Sync/projects/hoja/node_modules/.pnpm/unplugin-icons@0.18.5_@svgr+core@8.1.0/node_modules/unplugin-icons/dist/vite.js";
import preact from "file:///Users/zequez/Sync/projects/hoja/node_modules/.pnpm/@preact+preset-vite@2.8.1_@babel+core@7.24.3_preact@10.19.6_vite@5.1.4/node_modules/@preact/preset-vite/dist/esm/index.mjs";
import viteYaml from "file:///Users/zequez/Sync/projects/hoja/node_modules/.pnpm/@modyfi+vite-plugin-yaml@1.1.0_rollup@4.13.2_vite@5.1.4/node_modules/@modyfi/vite-plugin-yaml/dist/index.js";
var __vite_injected_original_dirname = "/Users/zequez/Sync/projects/hoja/templates";
var vite_config_default = defineConfig(({ mode }) => {
  return {
    resolve: {
      alias: {
        "@shared": resolve(__vite_injected_original_dirname, "../shared"),
        "@server": resolve(__vite_injected_original_dirname, "../server")
      }
    },
    server: {
      port: 5174
    },
    appType: "mpa",
    plugins: [
      viteYaml(),
      preact(),
      UnoCSS({ configFile: resolve(__vite_injected_original_dirname, "../uno.config.ts") }),
      Icons({ compiler: "jsx" })
    ],
    root: resolve(__vite_injected_original_dirname),
    base: "/templates",
    build: {
      outDir: resolve(__vite_injected_original_dirname, "../dist/templates"),
      emptyOutDir: true,
      rollupOptions: {
        input: {
          genesis: resolve(__vite_injected_original_dirname, "index.html"),
          editor: resolve(__vite_injected_original_dirname, "editor.html"),
          admin: resolve(__vite_injected_original_dirname, "admin.html")
        }
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidGVtcGxhdGVzL3ZpdGUuY29uZmlnLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL3plcXVlei9TeW5jL3Byb2plY3RzL2hvamEvdGVtcGxhdGVzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvemVxdWV6L1N5bmMvcHJvamVjdHMvaG9qYS90ZW1wbGF0ZXMvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL3plcXVlei9TeW5jL3Byb2plY3RzL2hvamEvdGVtcGxhdGVzL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgVW5vQ1NTIGZyb20gJ3Vub2Nzcy92aXRlJztcbmltcG9ydCBJY29ucyBmcm9tICd1bnBsdWdpbi1pY29ucy92aXRlJztcbmltcG9ydCBwcmVhY3QgZnJvbSAnQHByZWFjdC9wcmVzZXQtdml0ZSc7XG5pbXBvcnQgdml0ZVlhbWwgZnJvbSAnQG1vZHlmaS92aXRlLXBsdWdpbi15YW1sJztcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4ge1xuICByZXR1cm4ge1xuICAgIHJlc29sdmU6IHtcbiAgICAgIGFsaWFzOiB7XG4gICAgICAgICdAc2hhcmVkJzogcmVzb2x2ZShfX2Rpcm5hbWUsICcuLi9zaGFyZWQnKSxcbiAgICAgICAgJ0BzZXJ2ZXInOiByZXNvbHZlKF9fZGlybmFtZSwgJy4uL3NlcnZlcicpLFxuICAgICAgfSxcbiAgICB9LFxuICAgIHNlcnZlcjoge1xuICAgICAgcG9ydDogNTE3NCxcbiAgICB9LFxuICAgIGFwcFR5cGU6ICdtcGEnLFxuICAgIHBsdWdpbnM6IFtcbiAgICAgIHZpdGVZYW1sKCksXG4gICAgICBwcmVhY3QoKSxcbiAgICAgIFVub0NTUyh7IGNvbmZpZ0ZpbGU6IHJlc29sdmUoX19kaXJuYW1lLCAnLi4vdW5vLmNvbmZpZy50cycpIH0pLFxuICAgICAgSWNvbnMoeyBjb21waWxlcjogJ2pzeCcgfSksXG4gICAgXSxcbiAgICByb290OiByZXNvbHZlKF9fZGlybmFtZSksXG4gICAgYmFzZTogJy90ZW1wbGF0ZXMnLFxuICAgIGJ1aWxkOiB7XG4gICAgICBvdXREaXI6IHJlc29sdmUoX19kaXJuYW1lLCAnLi4vZGlzdC90ZW1wbGF0ZXMnKSxcbiAgICAgIGVtcHR5T3V0RGlyOiB0cnVlLFxuICAgICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgICBpbnB1dDoge1xuICAgICAgICAgIGdlbmVzaXM6IHJlc29sdmUoX19kaXJuYW1lLCAnaW5kZXguaHRtbCcpLFxuICAgICAgICAgIGVkaXRvcjogcmVzb2x2ZShfX2Rpcm5hbWUsICdlZGl0b3IuaHRtbCcpLFxuICAgICAgICAgIGFkbWluOiByZXNvbHZlKF9fZGlybmFtZSwgJ2FkbWluLmh0bWwnKSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfTtcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFnVCxTQUFTLGVBQWU7QUFDeFUsU0FBUyxvQkFBb0I7QUFDN0IsT0FBTyxZQUFZO0FBQ25CLE9BQU8sV0FBVztBQUNsQixPQUFPLFlBQVk7QUFDbkIsT0FBTyxjQUFjO0FBTHJCLElBQU0sbUNBQW1DO0FBT3pDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxNQUFNO0FBQ3hDLFNBQU87QUFBQSxJQUNMLFNBQVM7QUFBQSxNQUNQLE9BQU87QUFBQSxRQUNMLFdBQVcsUUFBUSxrQ0FBVyxXQUFXO0FBQUEsUUFDekMsV0FBVyxRQUFRLGtDQUFXLFdBQVc7QUFBQSxNQUMzQztBQUFBLElBQ0Y7QUFBQSxJQUNBLFFBQVE7QUFBQSxNQUNOLE1BQU07QUFBQSxJQUNSO0FBQUEsSUFDQSxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsTUFDUCxTQUFTO0FBQUEsTUFDVCxPQUFPO0FBQUEsTUFDUCxPQUFPLEVBQUUsWUFBWSxRQUFRLGtDQUFXLGtCQUFrQixFQUFFLENBQUM7QUFBQSxNQUM3RCxNQUFNLEVBQUUsVUFBVSxNQUFNLENBQUM7QUFBQSxJQUMzQjtBQUFBLElBQ0EsTUFBTSxRQUFRLGdDQUFTO0FBQUEsSUFDdkIsTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBLE1BQ0wsUUFBUSxRQUFRLGtDQUFXLG1CQUFtQjtBQUFBLE1BQzlDLGFBQWE7QUFBQSxNQUNiLGVBQWU7QUFBQSxRQUNiLE9BQU87QUFBQSxVQUNMLFNBQVMsUUFBUSxrQ0FBVyxZQUFZO0FBQUEsVUFDeEMsUUFBUSxRQUFRLGtDQUFXLGFBQWE7QUFBQSxVQUN4QyxPQUFPLFFBQVEsa0NBQVcsWUFBWTtBQUFBLFFBQ3hDO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
