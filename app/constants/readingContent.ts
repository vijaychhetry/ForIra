/**
 * Matra word reading content for the Read tab.
 *
 * See docs/superpowers/specs/2026-08-02-ira-hindi-2nd-standard-levelup-design.md
 * section 2.1 for the source word lists and level design.
 *
 * No audio/image `require()` calls yet -- device TTS (react-native-tts) is
 * used for audio and emoji are used as image placeholders until real
 * illustrations/pre-generated audio are added.
 */

export interface MatraWord {
  /** The Hindi word to read/display. */
  word: string;
  /** English meaning shown to help comprehension. */
  meaning: string;
  /** Character indices within `word` where this level's matra appears. */
  matraIndices: number[];
}

export interface MatraLevel {
  /** Stable id, also used as the AsyncStorage progress key (see useProgress.ts). */
  id: string;
  /** The matra (vowel sign) glyph itself, e.g. 'ा'. */
  matra: string;
  /** The standalone vowel this matra corresponds to, e.g. 'आ'. */
  vowel: string;
  /** Display name, e.g. 'आ की मात्रा'. */
  name: string;
  /** 8-10 words for this level. */
  words: MatraWord[];
  /** Id of the level that must be completed (80%+) before this one unlocks. */
  unlockAfter: string | null;
}

/** All matra glyphs used across every level, for the "mixed" review level. */
const ALL_MATRAS = ['ा', 'ि', 'ी', 'ु', 'ू', 'े', 'ै', 'ो', 'ौ'];

/** Returns every index in `word` where `char` occurs. */
function indicesOf(word: string, char: string): number[] {
  const result: number[] = [];
  for (let i = 0; i < word.length; i++) {
    if (word[i] === char) {
      result.push(i);
    }
  }
  return result;
}

/** Returns every index in `word` where any of `chars` occurs. */
function indicesOfAny(word: string, chars: string[]): number[] {
  const result: number[] = [];
  for (let i = 0; i < word.length; i++) {
    if (chars.includes(word[i])) {
      result.push(i);
    }
  }
  return result;
}

/** Builds MatraWord entries, auto-computing matraIndices for a single matra glyph. */
function buildWords(matra: string, entries: [string, string][]): MatraWord[] {
  return entries.map(([word, meaning]) => ({
    word,
    meaning,
    matraIndices: indicesOf(word, matra),
  }));
}

/** Builds MatraWord entries for the "mixed" level, matching against all known matras. */
function buildMixedWords(entries: [string, string][]): MatraWord[] {
  return entries.map(([word, meaning]) => ({
    word,
    meaning,
    matraIndices: indicesOfAny(word, ALL_MATRAS),
  }));
}

export const matraLevels: MatraLevel[] = [
  {
    id: 'matra_aa',
    matra: 'ा',
    vowel: 'आ',
    name: 'आ की मात्रा',
    unlockAfter: null,
    words: buildWords('ा', [
      ['काम', 'work'],
      ['नाम', 'name'],
      ['दाल', 'lentils'],
      ['माल', 'goods'],
      ['राम', 'Ram (name)'],
      ['हाथ', 'hand'],
      ['चाय', 'tea'],
      ['बात', 'talk'],
    ]),
  },
  {
    id: 'matra_i',
    matra: 'ि',
    vowel: 'इ',
    name: 'इ की मात्रा',
    unlockAfter: 'matra_aa',
    words: buildWords('ि', [
      ['दिन', 'day'],
      ['किला', 'fort'],
      ['मिला', 'found/met'],
      ['गिर', 'fall'],
      ['बिल', 'bill'],
      ['चिड़िया', 'bird'],
      ['तिल', 'sesame seed'],
      ['हिल', 'hill/shake'],
    ]),
  },
  {
    id: 'matra_ii',
    matra: 'ी',
    vowel: 'ई',
    name: 'ई की मात्रा',
    unlockAfter: 'matra_i',
    words: buildWords('ी', [
      ['नदी', 'river'],
      ['मछली', 'fish'],
      ['गली', 'lane'],
      ['पानी', 'water'],
      ['रोटी', 'bread'],
      ['चीनी', 'sugar'],
      ['बीज', 'seed'],
      ['सीता', 'Sita (name)'],
    ]),
  },
  {
    id: 'matra_u',
    matra: 'ु',
    vowel: 'उ',
    name: 'उ की मात्रा',
    unlockAfter: 'matra_ii',
    words: buildWords('ु', [
      ['गुम', 'lost'],
      ['सुन', 'listen'],
      ['कुल', 'total/family'],
      ['तुम', 'you'],
      ['गुलाब', 'rose'],
      ['मुर्गा', 'rooster'],
      ['पुल', 'bridge'],
      ['बुक', 'book'],
    ]),
  },
  {
    id: 'matra_uu',
    matra: 'ू',
    vowel: 'ऊ',
    name: 'ऊ की मात्रा',
    unlockAfter: 'matra_u',
    words: buildWords('ू', [
      ['फूल', 'flower'],
      ['धूल', 'dust'],
      ['सूरज', 'sun'],
      ['झूला', 'swing'],
      ['चूहा', 'mouse'],
      ['दूध', 'milk'],
      ['भूल', 'mistake'],
      ['पूरा', 'complete'],
    ]),
  },
  {
    id: 'matra_e',
    matra: 'े',
    vowel: 'ए',
    name: 'ए की मात्रा',
    unlockAfter: 'matra_uu',
    words: buildWords('े', [
      ['पेड़', 'tree'],
      ['मेला', 'fair'],
      ['खेल', 'game'],
      ['रेल', 'train'],
      ['देश', 'country'],
      ['शेर', 'lion'],
      ['केला', 'banana'],
      ['बेटा', 'son'],
    ]),
  },
  {
    id: 'matra_ai',
    matra: 'ै',
    vowel: 'ऐ',
    name: 'ऐ की मात्रा',
    unlockAfter: 'matra_e',
    words: buildWords('ै', [
      ['पैर', 'foot/leg'],
      ['कैसा', 'how'],
      ['बैल', 'ox'],
      ['तैरना', 'to swim'],
      ['भैंस', 'buffalo'],
      ['मैदान', 'field/ground'],
      ['हैरान', 'surprised'],
      ['वैसा', 'like that'],
    ]),
  },
  {
    id: 'matra_o',
    matra: 'ो',
    vowel: 'ओ',
    name: 'ओ की मात्रा',
    unlockAfter: 'matra_ai',
    words: buildWords('ो', [
      ['बोल', 'speak'],
      ['रोटी', 'bread'],
      ['गोल', 'round'],
      ['मोर', 'peacock'],
      ['तोता', 'parrot'],
      ['सोना', 'gold/sleep'],
      ['खोल', 'shell/open'],
      ['धोबी', 'washerman'],
    ]),
  },
  {
    id: 'matra_au',
    matra: 'ौ',
    vowel: 'औ',
    name: 'औ की मात्रा',
    unlockAfter: 'matra_o',
    words: buildWords('ौ', [
      ['मौसम', 'weather'],
      ['कौन', 'who'],
      ['चौक', 'square/junction'],
      ['फौज', 'army'],
      ['दौड़', 'race/run'],
      ['सौ', 'hundred'],
      ['नौकर', 'servant'],
      ['कौआ', 'crow'],
    ]),
  },
  {
    id: 'matra_mixed',
    matra: '',
    vowel: 'मिश्रित',
    name: 'मिश्रित मात्राएँ',
    unlockAfter: 'matra_au',
    words: buildMixedWords([
      ['किताब', 'book'],
      ['गुड़िया', 'doll'],
      ['खिलौना', 'toy'],
      ['तितली', 'butterfly'],
      ['सुनहरा', 'golden'],
      ['मीठा', 'sweet'],
      ['गुलाबी', 'pink'],
      ['पतीला', 'pot'],
      ['हथौड़ा', 'hammer'],
      ['सवेरा', 'morning'],
    ]),
  },
];
