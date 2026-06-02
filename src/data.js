export const DREAMS = [
  {
    id: 1,
    raw: "I was going down these stairs and they just kept going and there was fog everywhere violet fog I think and each step behind me just disappeared I couldn't go back and there was something warm pulling me down it wasn't scary just... inevitable",
    title: "The Infinite Staircase",
    mood: "Surreal",
    moodColor: "#a78bfa",
    timestamp: "2026-06-01T03:17:00",
    duration: "2m 14s",
    structured:
      "I descended a staircase that dissolved behind each step, spiraling into violet fog. The descent felt inevitable — warm, wordless, and without return.",
    tags: ["descent", "fog", "inevitability"],
    entities: ["Staircase", "Violet Fog", "Warmth"],
    moodScore: 0.72,
  },
  {
    id: 2,
    raw: "my brother was there in this cathedral and everything was made of frozen light and when he spoke the walls would crack but not break and then I realized his voice was coming from me",
    title: "Glass Cathedral",
    mood: "Haunting",
    moodColor: "#93c5fd",
    timestamp: "2026-05-31T05:44:00",
    duration: "1m 48s",
    structured:
      "A cathedral of frozen light. My brother stood at the altar — but when he spoke, the voice was mine.",
    tags: ["brother", "cathedral", "voice"],
    entities: ["Brother", "Cathedral", "Frozen Light"],
    moodScore: 0.45,
  },
  {
    id: 3,
    raw: "white room. just a white room but it was breathing like expanding contracting like lungs and I was part of the furniture somehow and outside the window there were two moons and it felt completely normal",
    title: "The Room That Breathes",
    mood: "Lucid",
    moodColor: "#6ee7b7",
    timestamp: "2026-05-29T06:02:00",
    duration: "3m 02s",
    structured:
      "A white room breathed like a living thing. I was not in the room — I was the room. Two moons hung in the window. Somehow, familiar.",
    tags: ["breathing", "moons", "transformation"],
    entities: ["White Room", "Two Moons", "Furniture"],
    moodScore: 0.88,
  },
  {
    id: 4,
    raw: "there was a river made of ink and I was floating on my back looking up at the sky and the stars were spelling out words I couldn't read and then a hand reached up from the water and held mine and it was warm",
    title: "The River of Ink",
    mood: "Ethereal",
    moodColor: "#fbbf24",
    timestamp: "2026-05-27T04:30:00",
    duration: "2m 55s",
    structured:
      "I floated on a river of black ink, gazing upward as stars rearranged themselves into unreadable words. A hand surfaced from beneath — warm, knowing — and held mine without explanation.",
    tags: ["river", "stars", "touch"],
    entities: ["Ink River", "Star Words", "Mysterious Hand"],
    moodScore: 0.91,
  },
  {
    id: 5,
    raw: "I was in a library but the books were all alive and they were whispering to each other and one of them opened and I fell inside and I was in a forest made entirely of paper trees and the leaves were pages from my own journal",
    title: "The Living Library",
    mood: "Wonder",
    moodColor: "#34d399",
    timestamp: "2026-05-25T02:15:00",
    duration: "3m 30s",
    structured:
      "The books whispered among themselves. One opened and I fell through — into a paper forest where every leaf was a page torn from my own journal, fluttering in an impossible wind.",
    tags: ["library", "books", "forest"],
    entities: ["Living Books", "Paper Forest", "Journal Pages"],
    moodScore: 0.85,
  },
];

export const MOCK_TRANSCRIPTION =
  "I was standing at the edge of a lake that was perfectly still like glass and the sky was lavender and there were these enormous trees growing upside down from the clouds their roots dangling in the air and I could hear someone humming a melody I recognized but couldn't place";

export const MOCK_STRUCTURED =
  "I stood at the edge of a mirror-still lake beneath a lavender sky. Above, enormous trees grew inverted from the clouds, their roots reaching downward like fingers. A melody drifted through the air — haunting, familiar, yet impossible to name.";

export const MOCK_TITLE = "The Upside-Down Forest";
export const MOCK_TAGS = ["lake", "inverted trees", "melody"];
export const MOCK_MOOD = "Ethereal";
export const MOCK_MOOD_COLOR = "#fbbf24";

export const formatTimestamp = (isoString) => {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `Today at ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}`;

  const isYesterday = new Date(now - 86400000).toDateString() === date.toDateString();
  if (isYesterday) return `Yesterday at ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};