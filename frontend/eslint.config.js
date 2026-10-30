import js from "@eslint/js";
import reactRefresh from "eslint-plugin-react-refresh";
export default [
  { ignores: ["dist"] },
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx}"],
    plugins: { "react-refresh": reactRefresh },
    rules: { "react-refresh/only-export-components": "off" },
  },
];
