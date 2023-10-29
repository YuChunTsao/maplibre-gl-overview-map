import { defineConfig, loadEnv } from "vite";
import { resolve } from "path";
import dts from "vite-plugin-dts";

export default ({ mode }) => {
  process.env = Object.assign(process.env, loadEnv(mode, process.cwd(), ""));

  if (process.env.VITE_BUILD_ENV === "library") {
    // Library Mode
    return defineConfig({
      build: {
        outDir: "dist/lib",
        minify: true,
        lib: {
          entry: resolve(__dirname, "./src/maplibre-gl-overview-map.ts"),
          name: "maplibre-gl-overview-map",
          fileName: "maplibre-gl-overview-map",
        },
        rollupOptions: {
          output: {
            assetFileNames: `maplibre-gl-overview-map.css`,
          },
        },
      },
      plugins: [dts()],
    });
  } else if (process.env.VITE_BUILD_ENV === "production") {
    // For github page
    return defineConfig({
      base: "/maplibre-gl-overview-map/",
      build: {
        outDir: "dist/example",
        minify: true,
      },
    });
  } else {
    return defineConfig({
      base: "",
      build: {
        outDir: "dist/example",
        minify: true,
      },
    });
  }
};
