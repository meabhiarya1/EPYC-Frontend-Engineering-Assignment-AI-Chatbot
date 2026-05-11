import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: "src/index.js",
      name: "EpycAiAgentWidget",
      fileName: "epyc-ai-agent-widget",
    },
    rollupOptions: {
      external: ["react", "react-dom", "lucide-react"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "lucide-react": "lucideReact",
        },
      },
    },
  },
});
