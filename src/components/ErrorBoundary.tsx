import React, { Component, ErrorInfo, ReactNode } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants/colors";
import { triggerImpactLight } from "../utils/haptics";

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error | null, reset: () => void) => ReactNode;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  resetKey: number;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      resetKey: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error(
      "ErrorBoundary caught an unhandled rendering error:",
      error,
      errorInfo,
    );
  }

  handleReset = (): void => {
    triggerImpactLight();
    this.setState((prev) => ({
      hasError: false,
      error: null,
      resetKey: prev.resetKey + 1,
    }));
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleReset);
      }

      return (
        <View style={styles.container} testID="error-boundary-fallback">
          <View style={styles.card}>
            <View style={styles.iconCircle}>
              <Ionicons name="alert-circle" size={38} color={COLORS.emerald} />
            </View>

            <Text allowFontScaling={false} style={styles.title}>
              Something went wrong
            </Text>

            <Text allowFontScaling={false} style={styles.subtitle}>
              An unexpected render error occurred. Tap below to reload the
              molecular explorer.
            </Text>

            {__DEV__ && this.state.error && (
              <ScrollView
                style={styles.devErrorScroll}
                contentContainerStyle={styles.devErrorContent}
                nestedScrollEnabled
              >
                <Text allowFontScaling={false} style={styles.devErrorText}>
                  {this.state.error.toString()}
                </Text>
              </ScrollView>
            )}

            <TouchableOpacity
              style={styles.retryButton}
              onPress={this.handleReset}
              activeOpacity={0.8}
              testID="error-boundary-retry-button"
            >
              <Ionicons
                name="refresh"
                size={18}
                color="#FFFFFF"
                style={styles.retryIcon}
              />
              <Text allowFontScaling={false} style={styles.retryText}>
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <React.Fragment key={this.state.resetKey}>
        {this.props.children}
      </React.Fragment>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.25)",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textMuted,
    textAlign: "center",
    marginBottom: 20,
  },
  devErrorScroll: {
    width: "100%",
    maxHeight: 120,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
    marginBottom: 20,
  },
  devErrorContent: {
    padding: 10,
  },
  devErrorText: {
    fontSize: 11,
    fontFamily: "monospace",
    color: COLORS.danger,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.emerald,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: "100%",
    shadowColor: COLORS.emerald,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  retryIcon: {
    marginRight: 8,
  },
  retryText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
