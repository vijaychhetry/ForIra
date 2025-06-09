import { Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');
const TILE_SIZE = width * 0.36;

export const quiz2Styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 10,
    minHeight: 400,
  },
  rewardRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    marginBottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 30,
  },
  reward: {
    fontSize: 20,
    marginHorizontal: 2,
  },
  quizBlock: {
    alignItems: 'center',
    marginTop: 0,
    width: '100%',
    flex: 1,
    justifyContent: 'flex-start',
  },
  resultBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    width: '100%',
  },
  question: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 10,
    marginTop: 10,
    textAlign: 'center',
  },
  optionsGrid2x2: {
    marginVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  optionTile2x2: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    backgroundColor: '#fff',
    borderRadius: 18,
    marginHorizontal: 8,
    marginVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    paddingVertical: 0, // Remove extra vertical padding
    paddingHorizontal: 8,
    overflow: 'hidden',
  },
  optionText2x2: {
    fontSize: 36, // Larger for clarity
    color: '#1976d2',
    fontWeight: 'bold',
    textAlign: 'center',
    textAlignVertical: 'center', // Helps on Android
    includeFontPadding: false,   // Helps on Android
    lineHeight: 44, // Add lineHeight slightly larger than fontSize
    marginTop: 0,   // Remove any margin
    marginBottom: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
  tileImage2x2: {
    width: TILE_SIZE * 0.7,
    height: TILE_SIZE * 0.7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1976d2',
    backgroundColor: '#fff',
    resizeMode: 'contain',
  },
  nav: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navBtn: {
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 30,
    backgroundColor: '#1976d2',
    elevation: 2,
    minWidth: 120,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  navBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  score: {
    fontSize: 28,
    marginTop: 8,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
  },
});