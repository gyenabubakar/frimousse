/** "EmojiPicker.Root" → "emojipicker.root", "Custom data sources" → "custom-data-sources". */
export function slug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9.\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}
