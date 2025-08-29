import { Audio } from 'expo-av';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { hindiMatras } from '../constants/hindiLetters';

export default function MatraGameScreen() {
  const [currentMatra, setCurrentMatra] = useState<any>(null);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    generateNewQuestion();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const generateNewQuestion = () => {
    const randomMatra = hindiMatras[Math.floor(Math.random() * hindiMatras.length)];
    setCurrentMatra(randomMatra);
    setTotalQuestions(prev => prev + 1);
  };

  const playMatraSound = async () => {
    if (sound) {
      await sound.unloadAsync();
    }
    
    try {
      const { sound: newSound } = await Audio.Sound.createAsync(currentMatra.sound);
      setSound(newSound);
      await newSound.playAsync();
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  };

  const checkAnswer = (selectedMatra: string) => {
    if (selectedMatra === currentMatra.letter) {
      setScore(prev => prev + 1);
      Alert.alert('Correct! 🎉', `You got it right! The matra is ${currentMatra.letter}`);
    } else {
      Alert.alert('Incorrect! 😔', `The correct matra is ${currentMatra.letter}`);
    }
    
    setTimeout(() => {
      generateNewQuestion();
    }, 1500);
  };

  const getRandomOptions = () => {
    const allMatras = hindiMatras.map(m => m.letter);
    const options = [currentMatra.letter];
    
    while (options.length < 4) {
      const randomMatra = allMatras[Math.floor(Math.random() * allMatras.length)];
      if (!options.includes(randomMatra)) {
        options.push(randomMatra);
      }
    }
    
    return options.sort(() => Math.random() - 0.5);
  };

  if (!currentMatra) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Matra Game</Text>
        <Text style={styles.subtitle}>Listen and identify the correct matra</Text>
        
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>Score: {score}/{totalQuestions}</Text>
          <Text style={styles.accuracyText}>
            Accuracy: {totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0}%
          </Text>
        </View>
      </View>

      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>Listen to the matra:</Text>
        
        <TouchableOpacity style={styles.playButton} onPress={playMatraSound}>
          <Text style={styles.playButtonText}>🔊 Play Sound</Text>
        </TouchableOpacity>

        <Text style={styles.exampleText}>
          Example: {currentMatra.example}
        </Text>
      </View>

      <View style={styles.optionsContainer}>
        <Text style={styles.optionsTitle}>Select the correct matra:</Text>
        
        {getRandomOptions().map((matra, index) => (
          <TouchableOpacity
            key={index}
            style={styles.optionButton}
            onPress={() => checkAnswer(matra)}
          >
            <Text style={styles.optionText}>{matra}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>How to play:</Text>
        <Text style={styles.infoText}>1. Tap the play button to hear the matra sound</Text>
        <Text style={styles.infoText}>2. Select the correct matra from the options</Text>
        <Text style={styles.infoText}>3. Try to get the highest score!</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
    paddingTop: 60,
  },
  loading: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#9c27b0',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  scoreContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    elevation: 2,
    marginBottom: 20,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  accuracyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  questionContainer: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    alignItems: 'center',
  },
  questionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  playButton: {
    backgroundColor: '#9c27b0',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 15,
  },
  playButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  exampleText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  optionsContainer: {
    padding: 20,
  },
  optionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  optionButton: {
    backgroundColor: '#fff',
    padding: 20,
    marginVertical: 8,
    borderRadius: 10,
    elevation: 2,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#9c27b0',
  },
  infoContainer: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 10,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
}); 