/**
 * Speech Recognition Helper
 * 
 * Wraps the Web Speech API (SpeechRecognition) into a reusable singleton.
 * This gives us real-time transcript updates during voice recording.
 * 
 * Browser support: Chrome, Edge, Safari (not Firefox yet)
 */
let recognition = null;

/**
 * Get or create the SpeechRecognition instance.
 * Returns null if the browser doesn't support it.
 */
export function getSpeechRecognition() {
  // Already created — return cached instance
  if (recognition) return recognition;

  // Check browser support
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    console.warn("Speech Recognition API not supported in this browser.");
    return null;
  }

  // Create and configure the recognition instance
  recognition = new SpeechRecognition();
  recognition.continuous = true;       // Keep listening until we stop
  recognition.interimResults = true;   // Get partial results as user speaks
  recognition.lang = "en-US";          // Language — could be made configurable
  recognition.maxAlternatives = 1;     // We only need the top result

  return recognition;
}

/**
 * Check if speech recognition is available in this browser.
 */
export function isSpeechRecognitionSupported() {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}