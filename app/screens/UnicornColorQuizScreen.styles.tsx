import { StyleSheet } from 'react-native';

export const unicornQuizStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f6fa',
  },
  rewardRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  reward: {
    fontSize: 24,
    marginHorizontal: 8,
  },
  quizBlock: {
    flex: 1,
    alignItems: 'center',
  },
  question: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#9c27b0',
    marginBottom: 20,
    textAlign: 'center',
  },
  optionsGrid2x2: {
    width: '100%',
    marginTop: 20,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  optionTile2x2: {
    width: '45%',
    aspectRatio: 1.5,
    backgroundColor: '#fff',
    margin: 5,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  english: {
    fontSize: 18,
    color: '#333',
    marginBottom: 5,
  },
  audioBtn: {
    padding: 5,
  },
  audioIcon: {
    fontSize: 20,
  },
  feedback: {
    fontSize: 20,
    marginTop: 20,
    color: '#4caf50',
  },
  nav: {
    marginTop: 20,
  },
  navBtn: {
    backgroundColor: '#9c27b0',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 2,
  },
  navBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#9c27b0',
    marginBottom: 20,
  },
  score: {
    fontSize: 24,
    color: '#333',
    marginBottom: 20,
  },
}); 