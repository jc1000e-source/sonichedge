export const GENRES = [
  { value: 'rap', label: 'Rap', emoji: '🎤' },
  { value: 'country', label: 'Country', emoji: '🤠' },
  { value: 'pop', label: 'Pop', emoji: '🎵' },
  { value: 'rock', label: 'Rock', emoji: '🎸' },
  { value: 'edm', label: 'EDM', emoji: '🎧' },
  { value: 'anthem', label: 'Anthem', emoji: '🏆' },
  { value: 'cinematic', label: 'Cinematic', emoji: '🎬' },
  { value: 'lofi', label: 'Lo-Fi', emoji: '🌙' },
  { value: 'hype_announcer', label: 'Hype Announcer', emoji: '📣' },
  { value: 'jazz', label: 'Jazz', emoji: '🎺' },
] as const

export type Genre = typeof GENRES[number]['value']
