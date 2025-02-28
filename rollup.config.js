import { terser } from "rollup-plugin-terser";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";

export default {
  input: "src/notiffi.js",
  output: {
    file: "./notiffi/notiffi.min.js",
    format: "iife",
    name: "Notiffi",
  },
  plugins: [terser(), resolve(), commonjs()],
};
