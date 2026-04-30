import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    optimizeDeps: {
      include: ["@react-spring/web", "react-tinder-card"]
    },
    plugins: [
      react(),
      {
        name: "local-translate-api",
        configureServer(server) {
          server.middlewares.use("/api/translate", async (request, response) => {
            if (request.method !== "POST") {
              response.statusCode = 405;
              response.setHeader("Content-Type", "application/json");
              response.end(JSON.stringify({ error: "POST only" }));
              return;
            }

            let body = "";
            request.on("data", (chunk) => {
              body += chunk;
            });

            request.on("end", async () => {
              try {
                const apiKey = env.DEEPL_API_KEY;
                if (!apiKey) {
                  response.statusCode = 500;
                  response.setHeader("Content-Type", "application/json");
                  response.end(JSON.stringify({ error: "DEEPL_API_KEY is not set." }));
                  return;
                }

                const text = JSON.parse(body || "{}").text?.trim();
                if (!text) {
                  response.statusCode = 400;
                  response.setHeader("Content-Type", "application/json");
                  response.end(JSON.stringify({ error: "text is required." }));
                  return;
                }

                const params = new URLSearchParams({
                  text,
                  source_lang: "JA",
                  target_lang: "EN-US"
                });

                const deeplResponse = await fetch("https://api-free.deepl.com/v2/translate", {
                  method: "POST",
                  headers: {
                    Authorization: `DeepL-Auth-Key ${apiKey}`,
                    "Content-Type": "application/x-www-form-urlencoded"
                  },
                  body: params
                });

                const data = await deeplResponse.json();
                response.statusCode = deeplResponse.status;
                response.setHeader("Content-Type", "application/json");
                response.end(JSON.stringify(
                  deeplResponse.ok
                    ? { en: data.translations?.[0]?.text?.trim() }
                    : { error: data.message || "DeepL API request failed." }
                ));
              } catch (error) {
                response.statusCode = 500;
                response.setHeader("Content-Type", "application/json");
                response.end(JSON.stringify({ error: error.message || "Translation failed." }));
              }
            });
          });
        }
      }
    ]
  };
});
