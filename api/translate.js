export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "POST only" });
  }

  const apiKey = process.env.DEEPL_API_KEY;
  if (!apiKey) {
    return response.status(500).json({ error: "DEEPL_API_KEY is not set." });
  }

  const text = typeof request.body?.text === "string" ? request.body.text.trim() : "";
  if (!text) {
    return response.status(400).json({ error: "text is required." });
  }

  try {
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
    if (!deeplResponse.ok) {
      return response.status(deeplResponse.status).json({
        error: data.message || "DeepL API request failed."
      });
    }

    const translated = data.translations?.[0]?.text?.trim();
    if (!translated) {
      return response.status(502).json({ error: "DeepL returned no translation." });
    }

    return response.status(200).json({ en: cleanupEnglish(translated) });
  } catch (error) {
    return response.status(500).json({ error: error.message || "Translation failed." });
  }
}

function cleanupEnglish(text) {
  return text
    .replace(/^["'“”]+|["'“”]+$/g, "")
    .replace(/^Translated activity sentence:\s*/i, "")
    .trim();
}
