let voices: SpeechSynthesisVoice[] = [];

export async function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const load = () => {
      voices = speechSynthesis.getVoices();
      if (voices.length > 0) {
        resolve(voices);
      }
    };

    // Already loaded?
    const loadedVoices = speechSynthesis.getVoices();
    if (loadedVoices.length > 0) {
      voices = loadedVoices;
      return resolve(voices);
    }

    speechSynthesis.onvoiceschanged = load;
    setTimeout(load, 100); // fallback trigger
  });
}

const langMap: Record<string, string> = {
  fr: "fr-FR",
  en: "en-US",
  nl: "nl-NL",
};

export async function speakText(text: string, lang: string | undefined, isEnabled: boolean) {
  if (!isEnabled || !text || typeof window === "undefined") return;

  await loadVoices(); // ensure voices are loaded

  const mappedLang = langMap[lang ?? "fr"] ?? "fr-FR";

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = mappedLang;

  // Try to find a matching voice
  const match = voices.find((v) => v.lang === mappedLang);
  if (match) {
    utterance.voice = match;
  } else {
    console.error(`[TTS] No voice found for language ${mappedLang}`);
  }

  if (speechSynthesis.speaking) {
    speechSynthesis.cancel(); // cancel anything in progress
  }

  window.speechSynthesis.speak(utterance);
}
