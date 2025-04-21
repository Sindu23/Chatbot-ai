import { useState } from "react";

const recognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

export const useVoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };

  const listen = (onResult) => {
    if (!recognitionAPI) {
      alert("Speech Recognition not supported in this browser.");
      return;
    }

    const recognition = new recognitionAPI();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsListening(true);
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript); 
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  return { isListening, listen, speak };
};
