import { registerRootComponent } from "expo";
import { Text, TextInput } from "react-native";

import App from "./App";

// Disable font scaling globally in every text related thing
if ((Text as any).defaultProps) {
  (Text as any).defaultProps.allowFontScaling = false;
} else {
  (Text as any).defaultProps = { allowFontScaling: false };
}

if ((TextInput as any).defaultProps) {
  (TextInput as any).defaultProps.allowFontScaling = false;
} else {
  (TextInput as any).defaultProps = { allowFontScaling: false };
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
