// Global mock for @expo/vector-icons to prevent asset loading in Jest
jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { View } = require("react-native");

  const createMockIcon = (name) => {
    const MockIcon = (props) => React.createElement(View, props);
    MockIcon.displayName = `MockIcon(${name})`;
    return MockIcon;
  };

  return {
    Ionicons: createMockIcon("Ionicons"),
    MaterialIcons: createMockIcon("MaterialIcons"),
    FontAwesome: createMockIcon("FontAwesome"),
    Feather: createMockIcon("Feather"),
    AntDesign: createMockIcon("AntDesign"),
    Entypo: createMockIcon("Entypo"),
    MaterialCommunityIcons: createMockIcon("MaterialCommunityIcons"),
  };
});
