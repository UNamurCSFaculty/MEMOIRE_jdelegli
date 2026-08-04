import { useEffect, useRef } from "react";
import { useUserPreferences } from "../../hooks/useUserPreferences";

export interface CaptionsProps {
  sendCaption: (caption: string) => void;
  emitCaptions: boolean;
}

export function getSpeechLocaleFromUserPrefs(lang: string | undefined): string {
  const map: Record<string, string> = {
    fr: "fr-FR",
    en: "en-US",
    nl: "nl-NL",
  };
  return map[lang ?? "fr"] ?? "fr-FR";
}

/**
 * Recognizes what the local user says and sends it to the other participants
 * through the data channels owned by the call hook. It displays nothing: each
 * caption is shown on the tile of the participant who said it.
 */
export default function Captions({ sendCaption, emitCaptions }: Readonly<CaptionsProps>) {
  const { userPreferences } = useUserPreferences();
  const lang = getSpeechLocaleFromUserPrefs(userPreferences?.general?.lang);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognition = useRef<any | null>(null);

  useEffect(() => {
    // a muted microphone must stop the recognizer, not merely drop what it
    // produces: it would otherwise keep listening for the whole call
    if (!emitCaptions) {
      return;
    }

    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      console.error("SpeechRecognition API is not supported in this browser.");
      return;
    }

    const SpeechRecognition =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    recognition.current = new SpeechRecognition();
    recognition.current.continuous = true;
    recognition.current.lang = lang;
    recognition.current.interimResults = true;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.current.onresult = (event: any) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      sendCaption(transcript);
    };

    recognition.current.start();

    return () => {
      recognition.current?.stop();
      recognition.current = null;
    };
  }, [emitCaptions, lang, sendCaption]);

  return null;
}
