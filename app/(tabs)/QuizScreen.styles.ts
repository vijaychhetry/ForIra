import { StyleSheet } from 'react-native';

export const quizScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  question: {
    marginBottom: 16,
    textAlign: 'center',
  },
  quizImage: {
    width: 100,
    height: 100,
    marginBottom: 16,
    alignSelf: 'center',
  },
  quizImageSmall: {
    width: 80,
    height: 80,
    margin: 8,
  },
  imageOptionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  imageOption: {
    margin: 4,
    borderRadius: 8,
    borderColor: '#ccc',
    borderWidth: 2,
    overflow: 'hidden',
  },
  rewardRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
    minHeight: 32,
  },
  reward: {
    fontSize: 22, // smaller size for the top reward unicorn
    marginHorizontal: 2,
  },
  score: {
    marginTop: 16,
    fontSize: 18,
    textAlign: 'center',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 12,
  },
  optionTile: {
    width: 100, // slightly bigger for more padding
    height: 100,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    margin: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    paddingVertical: 8, // add vertical padding
    paddingHorizontal: 4, // add horizontal padding
    overflow: 'hidden',
  },
  optionText: {
    fontSize: 48, // bigger font for clarity
    color: '#222',
    fontWeight: 'bold',
    lineHeight: 56, // ensure enough line height for Devanagari
    textAlign: 'center',
    includeFontPadding: false, // helps on Android
    textAlignVertical: 'center', // helps on Android
  },
});