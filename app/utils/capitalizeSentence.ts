export default function capitalizeSentence(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}