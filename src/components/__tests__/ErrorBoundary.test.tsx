import React from "react";
import { Text, View } from "react-native";
import { render, fireEvent } from "@testing-library/react-native";
import { ErrorBoundary } from "../ErrorBoundary";

const GoodComponent = () => (
  <View testID="good-component">
    <Text>All systems nominal</Text>
  </View>
);

const BadComponent: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error("Simulated molecular crash");
  }
  return (
    <View testID="recovered-component">
      <Text>Recovered state</Text>
    </View>
  );
};

describe("ErrorBoundary", () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it("renders children normally when there is no error", () => {
    const { getByTestId, queryByTestId } = render(
      <ErrorBoundary>
        <GoodComponent />
      </ErrorBoundary>,
    );

    expect(getByTestId("good-component")).toBeTruthy();
    expect(queryByTestId("error-boundary-fallback")).toBeNull();
  });

  it("renders themed fallback UI when a child throws an error", () => {
    const { getByTestId, getByText } = render(
      <ErrorBoundary>
        <BadComponent shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(getByTestId("error-boundary-fallback")).toBeTruthy();
    expect(getByText("Something went wrong")).toBeTruthy();
    expect(getByTestId("error-boundary-retry-button")).toBeTruthy();
    expect(consoleSpy).toHaveBeenCalled();
  });

  it("resets state and remounts children when Try Again button is pressed", () => {
    let throwError = true;

    const DynamicComponent = () => {
      if (throwError) {
        throw new Error("Crash on first try");
      }
      return (
        <View testID="good-after-retry">
          <Text>Success</Text>
        </View>
      );
    };

    const { getByTestId, queryByTestId } = render(
      <ErrorBoundary>
        <DynamicComponent />
      </ErrorBoundary>,
    );

    expect(getByTestId("error-boundary-fallback")).toBeTruthy();

    // Fix the condition and press retry
    throwError = false;
    fireEvent.press(getByTestId("error-boundary-retry-button"));

    expect(queryByTestId("error-boundary-fallback")).toBeNull();
    expect(getByTestId("good-after-retry")).toBeTruthy();
  });

  it("uses custom fallback prop when provided", () => {
    const customFallback = (error: Error | null, reset: () => void) => (
      <View testID="custom-fallback">
        <Text>{error?.message}</Text>
      </View>
    );

    const { getByTestId, getByText } = render(
      <ErrorBoundary fallback={customFallback}>
        <BadComponent shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(getByTestId("custom-fallback")).toBeTruthy();
    expect(getByText("Simulated molecular crash")).toBeTruthy();
  });
});
