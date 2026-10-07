import * as StoreReview from "expo-store-review";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useRef } from "react";

export const SEARCH_COUNT_KEY = "@moluxis_search_count";
export const PROMPT_THRESHOLDS = [3, 10, 30, 100]; // Logarithmic thresholds to avoid excessive prompting

/**
 * Hook to manage in-app review requests following Google Play guidelines.
 */
export const useStoreReview = () => {
  const isProcessingRef = useRef(false);

  const incrementSearchCountAndReview = useCallback(async () => {
    // Prevent overlapping concurrent executions
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    try {
      // Get current count of successful searches
      const currentCountStr = await AsyncStorage.getItem(SEARCH_COUNT_KEY);
      const parsed = currentCountStr ? parseInt(currentCountStr, 10) : 0;
      const currentCount = Number.isFinite(parsed) ? parsed : 0;
      const nextCount = currentCount + 1;

      // Persist the new count
      await AsyncStorage.setItem(SEARCH_COUNT_KEY, nextCount.toString());

      // Trigger review prompt at specific thresholds
      // This follows "enough experience" guideline and "don't prompt excessively"
      if (PROMPT_THRESHOLDS.includes(nextCount)) {
        // Check if the device/platform supports in-app reviews before prompting
        const isAvailable = await StoreReview.isAvailableAsync();
        const hasAction = await StoreReview.hasAction();

        if (isAvailable && hasAction) {
          // requestReview() automatically surfaces the Google Play card as-is
          // and respects the internal Play Store mechanism for removal and quotas.
          await StoreReview.requestReview();
        }
      }
    } catch (error) {
      // Silently handle errors to ensure app stability
      console.warn("Store Review error:", error);
    } finally {
      isProcessingRef.current = false;
    }
  }, []);

  return { incrementSearchCountAndReview };
};
