import { StyleSheet } from 'react-native';

export const gameTileStyles = StyleSheet.create({
  levelHeader: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 16,
    width: '90%',
    elevation: 3,
  },
  levelTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 16,
  },
  rewardRow: {
    flexDirection: 'row',
    marginBottom: 16,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  reward: {
    fontSize: 24,
    marginHorizontal: 8,
    marginVertical: 4,
  },
  matchRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 10,
  },
  col: {
    width: '45%',
  },
  colTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  tile: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
    elevation: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedTile: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  matchedTile: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  icon: {
    fontSize: 32,
    marginBottom: 8,
  },
  enText: {
    fontSize: 18,
    color: '#1976D2',
    fontWeight: 'bold',
  },
  hiText: {
    fontSize: 18,
    color: '#D32F2F',
    fontWeight: 'bold',
  },
  congrats: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 16,
  },
  restartBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    elevation: 3,
  },
  restartBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  nextLevelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    elevation: 3,
  },
  nextLevelBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});