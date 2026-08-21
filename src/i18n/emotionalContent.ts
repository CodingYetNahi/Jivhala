import type { Locale } from './resources'
const english = {
  emotions: [
    'Happy',
    'Loved',
    'Missing you',
    'Excited',
    'Calm',
    'Lonely',
    'Stressed',
    'Sad',
    'Upset',
    'Need reassurance',
    'Need affection',
    'Need to talk',
    'Need some space',
  ],
  needs: [
    'Listen to me',
    'Reassure me',
    'Talk when you are free',
    'Send me a message',
    'Give me some space',
    'Check on me later',
    'Just stay with me',
  ],
  responses: [
    'I’m here',
    'Sending you a hug',
    'Want to talk?',
    'I can listen',
    'You matter to me',
    'I’ll give you some space',
    'I’ll check on you later',
  ],
}
export const emotionalContent: Record<Locale, typeof english> = {
  en: english,
  hi: english,
  mr: english,
  kn: english,
  ta: english,
}
