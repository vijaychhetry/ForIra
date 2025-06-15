import { Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');
const TILE_WIDTH = width * 0.85;

export const tabTileStyles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#f5f6fa',
  },
  container: {
    width: '100%',
    alignItems: 'center',
  },
  tile: {
    width: TILE_WIDTH,
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 24,
    marginVertical: 10,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  emoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 6,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#e3f2fd',
    textAlign: 'center',
    marginTop: 2,
  },
});