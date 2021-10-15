import postcss from "rollup-plugin-postcss";
import typescript from "rollup-plugin-typescript2";

export default {
  input: "./src/index.ts",
  output: [
    {
      file: "dist/bundle.js",
      format: "cjs",
      exports: "auto"
    },
    {
      file: "dist/bundle.es.js",
      format: "es"
    }
  ],
  plugins: [
    postcss({
      extensions: [".css"]
    }),
    typescript({
      typescript: require("typescript"),
      tsconfig: "src/tsconfig.json"
    })
  ]
};
