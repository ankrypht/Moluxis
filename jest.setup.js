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

// Global mock for expo-task-manager
jest.mock("expo-task-manager", () => {
  const definedTasks = new Map();
  return {
    defineTask: jest.fn((taskName, executor) => {
      definedTasks.set(taskName, executor);
    }),
    isTaskDefined: jest.fn((taskName) => definedTasks.has(taskName)),
    isTaskRegisteredAsync: jest.fn().mockResolvedValue(false),
    getTaskOptionsAsync: jest.fn().mockResolvedValue(null),
    getRegisteredTasksAsync: jest.fn().mockResolvedValue([]),
    unregisterTaskAsync: jest.fn().mockResolvedValue(undefined),
    unregisterAllTasksAsync: jest.fn().mockResolvedValue(undefined),
    isAvailableAsync: jest.fn().mockResolvedValue(true),
    _definedTasks: definedTasks,
  };
});

// Global mock for expo-background-task
jest.mock("expo-background-task", () => ({
  getStatusAsync: jest.fn().mockResolvedValue(2), // BackgroundTaskStatus.Available
  registerTaskAsync: jest.fn().mockResolvedValue(undefined),
  unregisterTaskAsync: jest.fn().mockResolvedValue(undefined),
  triggerTaskWorkerForTestingAsync: jest.fn().mockResolvedValue(true),
  addExpirationListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
  BackgroundTaskStatus: {
    Restricted: 1,
    Available: 2,
  },
  BackgroundTaskResult: {
    Success: 1,
    Failed: 2,
  },
}));
