// filepath: c:\VijayWS\ForIra\ForIra\components\LottieWrapper.tsx
// @ts-ignore
import { Platform } from 'react-native';

let LottieView: any;
  console.log("platform", Platform.OS);

if (Platform.OS === 'web') {
  // On web, render nothing to avoid lottie-react-native errors
  LottieView = () => null;
} else {
  // Use lottie-react-native for native
  console.log("platform", Platform.OS);
  // LottieView = () => require('lottie-react-native').default;

 LottieView = () => null;// require('lottie-react-native').default;
}

export default LottieView;