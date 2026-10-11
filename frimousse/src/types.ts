import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes, HTMLInputAttributes } from 'svelte/elements';

type Resolve<T> = T extends (...args: unknown[]) => unknown ? T : { [K in keyof T]: T[K] };

// The few Emojibase shapes Frimousse reads, kept local so the published types don't depend on `emojibase`.
export type EmojibaseLocale =
  | 'bn'
  | 'da'
  | 'de'
  | 'en-gb'
  | 'en'
  | 'es-mx'
  | 'es'
  | 'et'
  | 'fi'
  | 'fr'
  | 'hi'
  | 'hu'
  | 'it'
  | 'ja'
  | 'ko'
  | 'lt'
  | 'ms'
  | 'nb'
  | 'nl'
  | 'pl'
  | 'pt'
  | 'ru'
  | 'sv'
  | 'th'
  | 'uk'
  | 'vi'
  | 'zh-hant'
  | 'zh';

type EmojibaseSkinToneKey = 'light' | 'medium-light' | 'medium' | 'medium-dark' | 'dark';

export type EmojibaseEmoji = {
  emoji: string;
  label: string;
  group?: number;
  subgroup?: number;
  version: number;
  tags?: string[];
  skins?: { emoji: string; tone?: number | number[] }[];
};

export type EmojibaseEmojiWithGroup = EmojibaseEmoji & { group: number };

type EmojibaseMessage = { key: string; message: string; order: number };

export type EmojibaseMessagesDataset = {
  groups: EmojibaseMessage[];
  subgroups: EmojibaseMessage[];
  skinTones: { key: EmojibaseSkinToneKey; message: string }[];
};

export type Locale = EmojibaseLocale | (string & {});

export type SkinTone = 'none' | EmojibaseSkinToneKey;

export type SkinToneVariation = {
  skinTone: SkinTone;
  emoji: string;
};

export type Emoji = Resolve<EmojiPickerEmoji>;

export type EmojiDetails = Resolve<EmojiDataEmoji>;

export type Category = Resolve<EmojiPickerCategory>;

export type EmojiDataEmoji = {
  emoji: string;
  category: number;
  label: string;
  version: number;
  tags: string[];
  countryFlag?: true | undefined;
  skins?: Record<Exclude<SkinTone, 'none'>, string> | undefined;
  aliases?: string[];
};

export type EmojiDataCategory = {
  index: number;
  label: string;
};

export type EmojiData = {
  locale: Locale;
  emojis: EmojiDataEmoji[];
  categories: EmojiDataCategory[];
  skinTones: Record<Exclude<SkinTone, 'none'>, string>;
};

export type EmojiDataResolverOptions = {
  emojiVersion?: number;
  emojibaseUrl?: string;

  /**
   * Aborted when the picker unmounts or needs to load data again.
   */
  signal?: AbortSignal;
};

export type EmojiDataResolver = (
  locale: Locale,
  options: EmojiDataResolverOptions,
) => EmojiData | Promise<EmojiData>;

/**
 * A persistent cache of emoji data, created by `createEmojiDataCache`.
 */
export type EmojiDataCache<M = undefined> = {
  /**
   * Returns a cached entry, or `null` if missing or invalid.
   */
  get: (locale: Locale) => { data: EmojiData; metadata: M } | null;

  /**
   * Stores data and optional metadata for a locale.
   */
  set: (
    locale: Locale,
    data: EmojiData,
    ...metadata: undefined extends M ? [metadata?: M] : [metadata: M]
  ) => void;

  /**
   * Removes the entry for a locale.
   */
  delete: (locale: Locale) => void;

  /**
   * Removes all entries in this cache's namespace.
   */
  clear: () => void;
};

export type EmojiPickerEmoji = {
  emoji: string;
  label: string;
};

export type EmojiPickerCategory = {
  label: string;
};

export type EmojiPickerDataRow = {
  categoryIndex: number;
  emojis: EmojiPickerEmoji[];
};

export type EmojiPickerDataCategory = {
  label: string;
  rowsCount: number;
  startRowIndex: number;
};

export type EmojiPickerData = {
  count: number;
  categories: EmojiPickerDataCategory[];
  categoriesStartRowIndices: number[];
  rows: EmojiPickerDataRow[];
  skinTones: Record<Exclude<SkinTone, 'none'>, string>;
};

/**
 * Attributes Frimousse puts on an inner element. Spread them on the element
 * your snippet renders.
 */
export type EmojiPickerAttributes<T extends EventTarget> = HTMLAttributes<T> &
  Record<`frimousse-${string}` | `data-${string}`, string | number | undefined>;

export type EmojiPickerListCategoryHeaderProps = {
  /**
   * The category for this sticky header.
   */
  category: Category;

  /**
   * The attributes to spread on the header element.
   */
  props: EmojiPickerAttributes<HTMLDivElement>;
};

export type EmojiPickerListRowProps = {
  /**
   * The attributes to spread on the row element.
   */
  props: EmojiPickerAttributes<HTMLDivElement>;

  /**
   * The emojis of the row.
   */
  children: Snippet;
};

export type EmojiPickerListEmojiProps = {
  /**
   * The emoji for this button, its label, and whether the emoji is currently
   * active (either hovered or selected via keyboard navigation).
   */
  emoji: Resolve<Emoji & { isActive: boolean }>;

  /**
   * The attributes and event handlers to spread on the button element.
   */
  props: EmojiPickerAttributes<HTMLButtonElement> & HTMLButtonAttributes;
};

export interface EmojiPickerListProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  ref?: HTMLDivElement | null;

  /**
   * Renders a sticky category header in the list.
   *
   * All category headers should be of the same size.
   */
  categoryHeader?: Snippet<[EmojiPickerListCategoryHeaderProps]>;

  /**
   * Renders a row of emojis in the list.
   *
   * All rows should be of the same size.
   */
  row?: Snippet<[EmojiPickerListRowProps]>;

  /**
   * Renders an emoji button in the list.
   *
   * All emojis should be of the same size.
   */
  emoji?: Snippet<[EmojiPickerListEmojiProps]>;
}

export interface EmojiPickerRootProps extends HTMLAttributes<HTMLDivElement> {
  ref?: HTMLDivElement | null;

  /**
   * A callback invoked when an emoji is selected.
   */
  onEmojiSelect?: (emoji: Emoji) => void;

  /**
   * The locale of the emoji picker.
   *
   * Custom locales can be used with `resolveEmojiData`.
   *
   * @default "en"
   */
  locale?: Locale;

  /**
   * Returns emoji data for the current locale, synchronously or asynchronously.
   * Custom data is used as-is, without version or country-flag filtering.
   * Delegate to `defaultEmojiDataResolver` to use Emojibase data.
   *
   * Runs on mount and when `locale`, `emojiVersion`, or `emojibaseUrl` changes.
   * Changing the function alone doesn't reload data.
   *
   * @default defaultEmojiDataResolver
   */
  resolveEmojiData?: EmojiDataResolver;

  /**
   * The skin tone of the emoji picker. Use `bind:skinTone` to keep it in sync
   * when it changes from inside the picker.
   *
   * @default "none"
   */
  skinTone?: SkinTone;

  /**
   * The number of columns in the list.
   *
   * @default 9
   */
  columns?: number;

  /**
   * Which {@link https://emojipedia.org/emoji-versions | Emoji version} to use,
   * to manually control which emojis are visible regardless of the current
   * browser's supported Emoji versions.
   *
   * @default The most recent version supported by the current browser
   */
  emojiVersion?: number;

  /**
   * The base URL of where the {@link https://emojibase.dev/docs/datasets/ | Emojibase data}
   * should be fetched from, used as follows: `${emojibaseUrl}/${locale}/${file}.json`.
   *
   * @default "https://cdn.jsdelivr.net/npm/emojibase-data"
   */
  emojibaseUrl?: string;

  /**
   * Whether the category headers should be sticky.
   *
   * @default true
   */
  sticky?: boolean;
}

export interface EmojiPickerViewportProps extends HTMLAttributes<HTMLDivElement> {
  ref?: HTMLDivElement | null;
}

export interface EmojiPickerSearchProps extends HTMLInputAttributes {
  ref?: HTMLInputElement | null;

  /**
   * The search value. Pass it to set an initial value, or use `bind:value`
   * to control it.
   */
  value?: string;
}

export interface EmojiPickerSkinToneSelectorProps extends Omit<HTMLButtonAttributes, 'children'> {
  ref?: HTMLButtonElement | null;

  /**
   * The emoji to use as visual for the skin tone variations.
   *
   * @default "✋"
   */
  emoji?: string;
}

export type EmojiPickerLoadingProps = HTMLAttributes<HTMLSpanElement>;

export type EmojiPickerEmptyRenderProps = {
  /**
   * The current search value.
   */
  search: string;
};

export interface EmojiPickerEmptyProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /**
   * The content to render when no emoji is found for the current search. It
   * receives the current search value.
   */
  children?: Snippet<[EmojiPickerEmptyRenderProps]>;
}

export type EmojiPickerActiveEmojiRenderProps = {
  /**
   * The currently active emoji (either hovered or selected
   * via keyboard navigation).
   */
  emoji?: Emoji;
};

export type EmojiPickerActiveEmojiProps = {
  /**
   * Receives the currently active emoji (either hovered or selected via
   * keyboard navigation).
   */
  children: Snippet<[EmojiPickerActiveEmojiRenderProps]>;
};

export type EmojiPickerSkinToneRenderProps = {
  /**
   * The current skin tone.
   */
  skinTone: SkinTone;

  /**
   * A function to change the current skin tone.
   */
  setSkinTone: (skinTone: SkinTone) => void;

  /**
   * The skin tone variations of the specified emoji.
   */
  skinToneVariations: SkinToneVariation[];
};

export type EmojiPickerSkinToneProps = {
  /**
   * The emoji to use as visual for the skin tone variations.
   *
   * @default "✋"
   */
  emoji?: string;

  /**
   * Receives the current skin tone and a function to change it, as well as
   * the skin tone variations of the specified emoji.
   */
  children: Snippet<[EmojiPickerSkinToneRenderProps]>;
};
