// barakhadiHelpers.ts
// Helper functions for Barakhadi sound management

// Barakhadi sound mapping - maps syllable to sound file
export const barakhadiSounds: { [key: string]: any } = {
  // क (ka) combinations
  'क': require('../../assets/sounds/barakhadi_sounds/01_क.mp3'),
  'का': require('../../assets/sounds/barakhadi_sounds/02_का.mp3'),
  'कि': require('../../assets/sounds/barakhadi_sounds/03_कि.mp3'),
  'की': require('../../assets/sounds/barakhadi_sounds/04_की.mp3'),
  'कु': require('../../assets/sounds/barakhadi_sounds/05_कु.mp3'),
  'कू': require('../../assets/sounds/barakhadi_sounds/06_कू.mp3'),
  'कृ': require('../../assets/sounds/barakhadi_sounds/07_कृ.mp3'),
  'के': require('../../assets/sounds/barakhadi_sounds/08_के.mp3'),
  'कै': require('../../assets/sounds/barakhadi_sounds/09_कै.mp3'),
  'को': require('../../assets/sounds/barakhadi_sounds/10_को.mp3'),
  'कौ': require('../../assets/sounds/barakhadi_sounds/11_कौ.mp3'),
  'कं': require('../../assets/sounds/barakhadi_sounds/12_कं.mp3'),
  'कः': require('../../assets/sounds/barakhadi_sounds/13_कः.mp3'),

  // ख (kha) combinations
  'ख': require('../../assets/sounds/barakhadi_sounds/14_ख.mp3'),
  'खा': require('../../assets/sounds/barakhadi_sounds/15_खा.mp3'),
  'खि': require('../../assets/sounds/barakhadi_sounds/16_खि.mp3'),
  'खी': require('../../assets/sounds/barakhadi_sounds/17_खी.mp3'),
  'खु': require('../../assets/sounds/barakhadi_sounds/18_खु.mp3'),
  'खू': require('../../assets/sounds/barakhadi_sounds/19_खू.mp3'),
  'खृ': require('../../assets/sounds/barakhadi_sounds/20_खृ.mp3'),
  'खे': require('../../assets/sounds/barakhadi_sounds/21_खे.mp3'),
  'खै': require('../../assets/sounds/barakhadi_sounds/22_खै.mp3'),
  'खो': require('../../assets/sounds/barakhadi_sounds/23_खो.mp3'),
  'खौ': require('../../assets/sounds/barakhadi_sounds/24_खौ.mp3'),
  'खं': require('../../assets/sounds/barakhadi_sounds/25_खं.mp3'),
  'खः': require('../../assets/sounds/barakhadi_sounds/26_खः.mp3'),

  // ग (ga) combinations
  'ग': require('../../assets/sounds/barakhadi_sounds/27_ग.mp3'),
  'गा': require('../../assets/sounds/barakhadi_sounds/28_गा.mp3'),
  'गि': require('../../assets/sounds/barakhadi_sounds/29_गि.mp3'),
  'गी': require('../../assets/sounds/barakhadi_sounds/30_गी.mp3'),
  'गु': require('../../assets/sounds/barakhadi_sounds/31_गु.mp3'),
  'गू': require('../../assets/sounds/barakhadi_sounds/32_गू.mp3'),
  'गृ': require('../../assets/sounds/barakhadi_sounds/33_गृ.mp3'),
  'गे': require('../../assets/sounds/barakhadi_sounds/34_गे.mp3'),
  'गै': require('../../assets/sounds/barakhadi_sounds/35_गै.mp3'),
  'गो': require('../../assets/sounds/barakhadi_sounds/36_गो.mp3'),
  'गौ': require('../../assets/sounds/barakhadi_sounds/37_गौ.mp3'),
  'गं': require('../../assets/sounds/barakhadi_sounds/38_गं.mp3'),
  'गः': require('../../assets/sounds/barakhadi_sounds/39_गः.mp3'),

  // घ (gha) combinations
  'घ': require('../../assets/sounds/barakhadi_sounds/40_घ.mp3'),
  'घा': require('../../assets/sounds/barakhadi_sounds/41_घा.mp3'),
  'घि': require('../../assets/sounds/barakhadi_sounds/42_घि.mp3'),
  'घी': require('../../assets/sounds/barakhadi_sounds/43_घी.mp3'),
  'घु': require('../../assets/sounds/barakhadi_sounds/44_घु.mp3'),
  'घू': require('../../assets/sounds/barakhadi_sounds/45_घू.mp3'),
  'घृ': require('../../assets/sounds/barakhadi_sounds/46_घृ.mp3'),
  'घे': require('../../assets/sounds/barakhadi_sounds/47_घे.mp3'),
  'घै': require('../../assets/sounds/barakhadi_sounds/48_घै.mp3'),
  'घो': require('../../assets/sounds/barakhadi_sounds/49_घो.mp3'),
  'घौ': require('../../assets/sounds/barakhadi_sounds/50_घौ.mp3'),
  'घं': require('../../assets/sounds/barakhadi_sounds/51_घं.mp3'),
  'घः': require('../../assets/sounds/barakhadi_sounds/52_घः.mp3'),

  // ङ (nga) combinations
  'ङ': require('../../assets/sounds/barakhadi_sounds/53_ङ.mp3'),
  'ङा': require('../../assets/sounds/barakhadi_sounds/54_ङा.mp3'),
  'ङि': require('../../assets/sounds/barakhadi_sounds/55_ङि.mp3'),
  'ङी': require('../../assets/sounds/barakhadi_sounds/56_ङी.mp3'),
  'ङु': require('../../assets/sounds/barakhadi_sounds/57_ङु.mp3'),
  'ङू': require('../../assets/sounds/barakhadi_sounds/58_ङू.mp3'),
  'ङृ': require('../../assets/sounds/barakhadi_sounds/59_ङृ.mp3'),
  'ङे': require('../../assets/sounds/barakhadi_sounds/60_ङे.mp3'),
  'ङै': require('../../assets/sounds/barakhadi_sounds/61_ङै.mp3'),
  'ङो': require('../../assets/sounds/barakhadi_sounds/62_ङो.mp3'),
  'ङौ': require('../../assets/sounds/barakhadi_sounds/63_ङौ.mp3'),
  'ङं': require('../../assets/sounds/barakhadi_sounds/64_ङं.mp3'),
  'ङः': require('../../assets/sounds/barakhadi_sounds/65_ङः.mp3'),
};

/**
 * Get sound source for a given Barakhadi syllable
 * @param syllable - The Barakhadi syllable (e.g., 'का', 'कि', etc.)
 * @returns The sound source or null if not found
 */
export function getBarakhadiSound(syllable: string): any {
  return barakhadiSounds[syllable] || null;
}

/**
 * Check if a Barakhadi sound exists
 * @param syllable - The Barakhadi syllable
 * @returns True if sound exists, false otherwise
 */
export function hasBarakhadiSound(syllable: string): boolean {
  return syllable in barakhadiSounds;
} 