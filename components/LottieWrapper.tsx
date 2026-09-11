import { Platform } from 'react-native';

// Lottie animations are only supported on native. On web (and, for now, on
// native until lottie-react-native is re-enabled) render nothing to avoid
// lottie-react-native errors. Named functions provide a display name so the
// react/display-name lint rule is satisfied.
let LottieView: any;

if (Platform.OS === 'web') {
  LottieView = function LottieViewWeb() {
    return null;
  };
} else {
  LottieView = function LottieViewNative() {
    return null;
  };
}

export default LottieView;
