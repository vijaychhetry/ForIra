// filepath: IRA-Hindi/screens/MatchScreen.js
import { Audio } from 'expo-av';
import { useEffect, useState } from 'react';
import { Animated, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { gameTileStyles } from './GameTile.styles';

// Define different themes for each level
const themes = {
  1: { name: 'Weekdays', icon: '📅', color: '#4CAF50' },
  2: { name: 'Animals', icon: '🐘', color: '#FF9800' },
  3: { name: 'Fruits', icon: '🍎', color: '#E91E63' },
  4: { name: 'Colors', icon: '🎨', color: '#9C27B0' },
};

// Define different word sets for each level
const wordSets = {
  1: [
    { en: 'Monday', hi: 'सोमवार', icon: '🌞' },
    { en: 'Tuesday', hi: 'मंगलवार', icon: '🚀' },
    { en: 'Wednesday', hi: 'बुधवार', icon: '🐪' },
    { en: 'Thursday', hi: 'गुरुवार', icon: '🌳' },
    { en: 'Friday', hi: 'शुक्रवार', icon: '🌸' },
    { en: 'Saturday', hi: 'शनिवार', icon: '🎈' },
    { en: 'Sunday', hi: 'रविवार', icon: '☀️' },
  ],
  2: [
    { en: 'Elephant', hi: 'हाथी', icon: '🐘' },
    { en: 'Lion', hi: 'शेर', icon: '🦁' },
    { en: 'Tiger', hi: 'बाघ', icon: '🐯' },
    { en: 'Monkey', hi: 'बंदर', icon: '🐒' },
    { en: 'Giraffe', hi: 'जिराफ', icon: '🦒' },
    { en: 'Zebra', hi: 'ज़ेबरा', icon: '🦓' },
    { en: 'Bear', hi: 'भालू', icon: '🐻' },
  ],
  3: [
    { en: 'Apple', hi: 'सेब', icon: '🍎' },
    { en: 'Banana', hi: 'केला', icon: '🍌' },
    { en: 'Orange', hi: 'संतरा', icon: '🍊' },
    { en: 'Mango', hi: 'आम', icon: '🥭' },
    { en: 'Grapes', hi: 'अंगूर', icon: '🍇' },
    { en: 'Pineapple', hi: 'अनानास', icon: '🍍' },
    { en: 'Watermelon', hi: 'तरबूज़', icon: '🍉' },
  ],
  4: [
    { en: 'Red', hi: 'लाल', icon: '🔴' },
    { en: 'Blue', hi: 'नीला', icon: '🔵' },
    { en: 'Green', hi: 'हरा', icon: '🟢' },
    { en: 'Yellow', hi: 'पीला', icon: '🟡' },
    { en: 'Purple', hi: 'बैंगनी', icon: '🟣' },
    { en: 'Orange', hi: 'नारंगी', icon: '🟠' },
    { en: 'Pink', hi: 'गुलाबी', icon: '💗' },
  ],
};

function shuffle(arr) {
  return arr.slice().sort(() => Math.random() - 0.5);
}

export default function MatchScreen() {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [english, setEnglish] = useState(shuffle(wordSets[1]));
  const [hindi, setHindi] = useState(shuffle(wordSets[1]));
  const [selectedEn, setSelectedEn] = useState(null);
  const [selectedHi, setSelectedHi] = useState(null);
  const [matches, setMatches] = useState([]);
  const [reward, setReward] = useState([]);
  const [correctSound, setCorrectSound] = useState(null);
  const [wrongSound, setWrongSound] = useState(null);
  const [levelCompleteSound, setLevelCompleteSound] = useState(null);
  const [bounceAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    // Load sounds when component mounts
    const loadSounds = async () => {
      const { sound: correct } = await Audio.Sound.createAsync(
        require('../../assets/sounds/game/correct.mp3')
      );
      const { sound: wrong } = await Audio.Sound.createAsync(
        require('../../assets/sounds/game/wrong.mp3')
      );
      const { sound: levelComplete } = await Audio.Sound.createAsync(
        require('../../assets/sounds/game/level-complete.mp3')
      );
      setCorrectSound(correct);
      setWrongSound(wrong);
      setLevelCompleteSound(levelComplete);
    };

    loadSounds();

    // Cleanup sounds when component unmounts
    return () => {
      correctSound?.unloadAsync();
      wrongSound?.unloadAsync();
      levelCompleteSound?.unloadAsync();
    };
  }, []);

  const playSound = async (sound) => {
    try {
      if (sound) {
        await sound.setPositionAsync(0);
        await sound.playAsync();
      }
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  };

  const animateBounce = () => {
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(bounceAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSelectEn = (idx) => {
    setSelectedEn(idx);
    if (selectedHi !== null) checkMatch(idx, selectedHi);
  };

  const handleSelectHi = (idx) => {
    setSelectedHi(idx);
    if (selectedEn !== null) checkMatch(selectedEn, idx);
  };

  const checkMatch = (enIdx, hiIdx) => {
    const enDay = english[enIdx];
    const hiDay = hindi[hiIdx];
    if (enDay.en === hiDay.en) {
      setMatches([...matches, enDay.en]);
      setReward(r => [...r, '🌹']);
      playSound(correctSound);
      animateBounce();
    } else {
      playSound(wrongSound);
    }
    setTimeout(() => {
      setSelectedEn(null);
      setSelectedHi(null);
    }, 600);
  };

  const allMatched = matches.length === wordSets[currentLevel].length;

  const handleRestart = () => {
    setEnglish(shuffle(wordSets[currentLevel]));
    setHindi(shuffle(wordSets[currentLevel]));
    setMatches([]);
    setReward([]);
    setSelectedEn(null);
    setSelectedHi(null);
  };

  const handleNextLevel = () => {
    if (currentLevel < 4) {
      const nextLevel = currentLevel + 1;
      setCurrentLevel(nextLevel);
      setEnglish(shuffle(wordSets[nextLevel]));
      setHindi(shuffle(wordSets[nextLevel]));
      setMatches([]);
      setReward([]);
      setSelectedEn(null);
      setSelectedHi(null);
      playSound(levelCompleteSound);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f6fa' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-start', alignItems: 'center', paddingTop: 20, paddingBottom: 30 }}>
        <View style={[gameTileStyles.levelHeader, { backgroundColor: themes[currentLevel].color }]}>
          <Text style={gameTileStyles.levelTitle}>
            {themes[currentLevel].icon} Level {currentLevel}: {themes[currentLevel].name}
          </Text>
        </View>
        <View style={gameTileStyles.rewardRow}>
          {reward.map((r, i) => (
            <Animated.Text 
              key={i} 
              style={[
                gameTileStyles.reward,
                { transform: [{ scale: bounceAnim }] }
              ]}
            >
              {r}
            </Animated.Text>
          ))}
        </View>
        <View style={gameTileStyles.matchRow}>
          <View style={gameTileStyles.col}>
            <Text style={gameTileStyles.colTitle}>English</Text>
            {english.map((day, idx) => (
              <TouchableOpacity
                key={day.en}
                style={[
                  gameTileStyles.tile,
                  selectedEn === idx && gameTileStyles.selectedTile,
                  matches.includes(day.en) && gameTileStyles.matchedTile,
                ]}
                disabled={matches.includes(day.en)}
                onPress={() => handleSelectEn(idx)}
              >
                <Text style={gameTileStyles.icon}>{day.icon}</Text>
                <Text style={gameTileStyles.enText}>{day.en}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={gameTileStyles.col}>
            <Text style={gameTileStyles.colTitle}>हिंदी</Text>
            {hindi.map((day, idx) => (
              <TouchableOpacity
                key={day.hi}
                style={[
                  gameTileStyles.tile,
                  selectedHi === idx && gameTileStyles.selectedTile,
                  matches.includes(day.en) && gameTileStyles.matchedTile,
                ]}
                disabled={matches.includes(day.en)}
                onPress={() => handleSelectHi(idx)}
              >
                <Text style={gameTileStyles.icon}>{day.icon}</Text>
                <Text style={gameTileStyles.hiText}>{day.hi}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        {allMatched && (
          <View style={{ alignItems: 'center', marginTop: 24 }}>
            <Text style={gameTileStyles.congrats}>🎉 Level {currentLevel} Complete! 🎉</Text>
            {currentLevel < 4 ? (
              <TouchableOpacity 
                style={[gameTileStyles.nextLevelBtn, { backgroundColor: themes[currentLevel].color }]} 
                onPress={handleNextLevel}
              >
                <Text style={gameTileStyles.nextLevelBtnText}>Next Level</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={[gameTileStyles.restartBtn, { backgroundColor: themes[currentLevel].color }]} 
                onPress={handleRestart}
              >
                <Text style={gameTileStyles.restartBtnText}>Play Again</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}