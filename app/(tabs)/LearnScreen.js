// filepath: IRA-Hindi/screens/LearnScreen.js
import { Audio } from 'expo-av';
import { useState } from 'react';
import { Button, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const letters = [
  { letter: 'अ', word: 'अनार', image: require('../../assets/images/अ.png'), sound: require('../../assets/sounds/01_अ.mp3') },
  { letter: 'आ', word: 'आम', image: require('../../assets/images/आ.png'), sound: require('../../assets/sounds/02_आ.mp3') },
  { letter: 'इ', word: 'इमली', image: require('../../assets/images/इ.png'), sound: require('../../assets/sounds/03_इ.mp3') },
  { letter: 'ई', word: 'ईख', image: require('../../assets/images/ई.png'), sound: require('../../assets/sounds/04_ई.mp3') },
  { letter: 'उ', word: 'उल्लू', image: require('../../assets/images/उ.png'), sound: require('../../assets/sounds/05_उ.mp3') },
  { letter: 'ऊ', word: 'ऊन', image: require('../../assets/images/ऊ.png'), sound: require('../../assets/sounds/06_ऊ.mp3') },
  { letter: 'ए', word: 'एड़ी', image: require('../../assets/images/ए.png'), sound: require('../../assets/sounds/07_ए.mp3') },
  { letter: 'ऐ', word: 'ऐनक', image: require('../../assets/images/ऐ.png'), sound: require('../../assets/sounds/08_ऐ.mp3') },
  { letter: 'ओ', word: 'ओखली', image: require('../../assets/images/ओ.png'), sound: require('../../assets/sounds/09_ओ.mp3') },
  { letter: 'औ', word: 'औरत', image: require('../../assets/images/औ.png'), sound: require('../../assets/sounds/10_औ.mp3') },
  { letter: 'अं', word: 'अंगूर', image: require('../../assets/images/अं.png'), sound: require('../../assets/sounds/11_अं.mp3') },
  { letter: 'अः', word: 'अः', image: require('../../assets/images/अः.png'), sound: require('../../assets/sounds/12_अः.mp3') },
  // { letter: 'क', word: 'कबूतर', image: require('../../assets/images/kabootar.png'), sound: require('../../assets/sounds/13_क.mp3') },
  // { letter: 'ख', word: 'खरगोश', image: require('../../assets/images/khargosh.png'), sound: require('../../assets/sounds/14_ख.mp3') },
  // { letter: 'ग', word: 'गमला', image: require('../../assets/images/gamla.png'), sound: require('../../assets/sounds/15_ग.mp3') },
  // { letter: 'घ', word: 'घड़ी', image: require('../../assets/images/ghadi.png'), sound: require('../../assets/sounds/16_घ.mp3') },
  // { letter: 'ङ', word: 'ङग', image: require('../../assets/images/ng.png'), sound: require('../../assets/sounds/17_ङ.mp3') },
  // { letter: 'च', word: 'चमच', image: require('../../assets/images/chamach.png'), sound: require('../../assets/sounds/18_च.mp3') },
  // { letter: 'छ', word: 'छाता', image: require('../../assets/images/chhata.png'), sound: require('../../assets/sounds/19_छ.mp3') },
  // { letter: 'ज', word: 'जग', image: require('../../assets/images/jag.png'), sound: require('../../assets/sounds/20_ज.mp3') },
  // { letter: 'झ', word: 'झंडा', image: require('../../assets/images/jhanda.png'), sound: require('../../assets/sounds/21_झ.mp3') },
  // { letter: 'ञ', word: 'ञ', image: require('../../assets/images/nya.png'), sound: require('../../assets/sounds/22_ञ.mp3') },
  // { letter: 'ट', word: 'टमाटर', image: require('../../assets/images/tamatar.png'), sound: require('../../assets/sounds/23_ट.mp3') },
  // { letter: 'ठ', word: 'ठठेरा', image: require('../../assets/images/thathera.png'), sound: require('../../assets/sounds/24_ठ.mp3') },
  // { letter: 'ड', word: 'डमरू', image: require('../../assets/images/damaru.png'), sound: require('../../assets/sounds/25_ड.mp3') },
  // { letter: 'ढ', word: 'ढोल', image: require('../../assets/images/dhol.png'), sound: require('../../assets/sounds/26_ढ.mp3') },
  // { letter: 'ण', word: 'ण', image: require('../../assets/images/n.png'), sound: require('../../assets/sounds/27_ण.mp3') },
  // { letter: 'त', word: 'तरबूज', image: require('../../assets/images/tarbuj.png'), sound: require('../../assets/sounds/28_त.mp3') },
  // { letter: 'थ', word: 'थरमस', image: require('../../assets/images/tharmas.png'), sound: require('../../assets/sounds/29_थ.mp3') },
  // { letter: 'द', word: 'दवात', image: require('../../assets/images/dawat.png'), sound: require('../../assets/sounds/30_द.mp3') },
  // { letter: 'ध', word: 'धनुष', image: require('../../assets/images/dhanush.png'), sound: require('../../assets/sounds/31_ध.mp3') },
  // { letter: 'न', word: 'नल', image: require('../../assets/images/nal.png'), sound: require('../../assets/sounds/32_न.mp3') },
  // { letter: 'प', word: 'पतंग', image: require('../../assets/images/patang.png'), sound: require('../../assets/sounds/33_प.mp3') },
  // { letter: 'फ', word: 'फल', image: require('../../assets/images/phil.png'), sound: require('../../assets/sounds/34_फ.mp3') },
  // { letter: 'ब', word: 'बतख', image: require('../../assets/images/batakh.png'), sound: require('../../assets/sounds/35_ब.mp3') },
  // { letter: 'भ', word: 'भालू', image: require('../../assets/images/bhalu.png'), sound: require('../../assets/sounds/36_भ.mp3') },
  // { letter: 'म', word: 'मछली', image: require('../../assets/images/machhli.png'), sound: require('../../assets/sounds/37_म.mp3') },
  // { letter: 'य', word: 'यज्ञ', image: require('../../assets/images/yagya.png'), sound: require('../../assets/sounds/38_य.mp3') },
  // { letter: 'र', word: 'रथ', image: require('../../assets/images/rath.png'), sound: require('../../assets/sounds/39_र.mp3') },
  // { letter: 'ल', word: 'लट्टू', image: require('../../assets/images/lattu.png'), sound: require('../../assets/sounds/40_ल.mp3') },
  // { letter: 'व', word: 'वायु', image: commonImage, sound: require('../../assets/sounds/41_व.mp3') },
  // { letter: 'श', word: 'शेर', image: commonImage, sound: require('../../assets/sounds/42_श.mp3') },
  // { letter: 'ष', word: 'षट्कोण', image: commonImage, sound: require('../../assets/sounds/43_ष.mp3') },
  // { letter: 'स', word: 'सपेरा', image: commonImage, sound: require('../../assets/sounds/44_स.mp3') },
  // { letter: 'ह', word: 'हाथी', image: commonImage, sound: require('../../assets/sounds/45_ह.mp3') },
  // { letter: 'क्ष', word: 'क्षत्रिय', image: commonImage, sound: require('../../assets/sounds/46_क्ष.mp3') },
  // { letter: 'त्र', word: 'त्रिशूल', image: commonImage, sound: require('../../assets/sounds/47_त्र.mp3') },
  // { letter: 'ज्ञ', word: 'ज्ञानी', image: commonImage, sound: require('../../assets/sounds/48_ज्ञ.mp3') },
];

export default function LearnScreen() {
  const [index, setIndex] = useState(0);

  const playSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(letters[index].sound);
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (e) {
      console.log('Error playing sound:', e);
    }
  };

  if (letters.length === 0) {
    return (
      <View style={styles.container}>
        <Text>No letters available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={playSound}>
        <Text style={styles.letter}>{letters[index].letter}</Text>
      </TouchableOpacity>
      <Text style={styles.word}>{letters[index].letter} - {letters[index].word}</Text>
      <Image source={letters[index].image} style={styles.image} />
      <View style={styles.nav}>
        <Button title="Prev" onPress={() => setIndex(i => Math.max(i - 1, 0))} />
        <Button title="Next" onPress={() => setIndex(i => Math.min(i + 1, letters.length - 1))} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  letter: { fontSize: 80, margin: 20, color: 'red' },
  word: { fontSize: 32, margin: 10 },
  image: { width: 120, height: 120, margin: 10 },
  nav: { flexDirection: 'row', gap: 20, marginTop: 20 },
});

//https://hindi.la.utexas.edu/resources/pronouncing-the-hindi-alphabet/