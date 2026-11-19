import { renderHook, act } from "@testing-library/react-native";
import { Animated } from "react-native";
import {
  useBottomSheetAnimation,
  useDialogScaleAnimation,
  BottomSheetAnimationOptions,
} from "../useModalAnimation";

describe("useModalAnimation", () => {
  let parallelSpy: jest.SpyInstance;
  let springSpy: jest.SpyInstance;
  let timingSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    parallelSpy = jest.spyOn(Animated, "parallel");
    springSpy = jest.spyOn(Animated, "spring");
    timingSpy = jest.spyOn(Animated, "timing");
  });

  afterEach(() => {
    parallelSpy.mockRestore();
    springSpy.mockRestore();
    timingSpy.mockRestore();
  });

  describe("useBottomSheetAnimation", () => {
    it("initializes with offscreen slide distance and zero opacity when visible is false", () => {
      const { result } = renderHook(() =>
        useBottomSheetAnimation({
          visible: false,
          height: 600,
          heightRatio: 0.8,
        }),
      );

      // sheetHeight = 600 * 0.8 = 480
      expect(result.current.sheetHeight).toBe(480);
      expect(result.current.slideDistance).toBe(480);
      expect((result.current.slideAnim as any)._value).toBe(480);
      expect((result.current.fadeAnim as any)._value).toBe(0);
      expect(parallelSpy).not.toHaveBeenCalled();
    });

    it("triggers entrance animation when mounted with visible: true", () => {
      const { result } = renderHook(() =>
        useBottomSheetAnimation({
          visible: true,
          height: 800,
          heightRatio: 0.75,
        }),
      );

      expect(parallelSpy).toHaveBeenCalledTimes(1);
      expect(timingSpy).toHaveBeenCalledWith(
        result.current.fadeAnim,
        expect.objectContaining({
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      );
      expect(springSpy).toHaveBeenCalledWith(
        result.current.slideAnim,
        expect.objectContaining({
          toValue: 0,
          useNativeDriver: true,
          friction: 9,
          tension: 65,
          overshootClamping: true,
        }),
      );
    });

    it("does NOT replay entrance animation or snap offscreen on screen rotation while visible", () => {
      let initialOptions: BottomSheetAnimationOptions = {
        visible: true,
        height: 700,
        isLandscape: false,
        heightRatio: 0.75,
      };

      const { result, rerender } = renderHook(
        (props: BottomSheetAnimationOptions) => useBottomSheetAnimation(props),
        { initialProps: initialOptions },
      );

      expect(parallelSpy).toHaveBeenCalledTimes(1);
      const initialParallelCalls = parallelSpy.mock.calls.length;

      // Spy on slideAnim.setValue
      const setValueSpy = jest.spyOn(result.current.slideAnim, "setValue");

      // Rotate to landscape
      act(() => {
        rerender({
          visible: true,
          height: 700,
          isLandscape: true,
          heightRatio: 0.75,
        });
      });

      // parallel should NOT have been called again
      expect(parallelSpy).toHaveBeenCalledTimes(initialParallelCalls);
      // setValue should NOT have been called to reset slideAnim offscreen
      expect(setValueSpy).not.toHaveBeenCalled();

      // But sheetHeight should reflect landscape dimensions
      expect(result.current.sheetHeight).toBe(700);

      // Rotate back to portrait
      act(() => {
        rerender({
          visible: true,
          height: 700,
          isLandscape: false,
          heightRatio: 0.75,
        });
      });

      expect(parallelSpy).toHaveBeenCalledTimes(initialParallelCalls);
      expect(setValueSpy).not.toHaveBeenCalled();
      expect(result.current.sheetHeight).toBe(Math.round(700 * 0.75));
    });

    it("triggers entrance animation when visible transitions from false to true", () => {
      const { rerender } = renderHook(
        (props: BottomSheetAnimationOptions) => useBottomSheetAnimation(props),
        {
          initialProps: {
            visible: false,
            height: 700,
          },
        },
      );

      expect(parallelSpy).not.toHaveBeenCalled();

      act(() => {
        rerender({
          visible: true,
          height: 700,
        });
      });

      expect(parallelSpy).toHaveBeenCalledTimes(1);
    });

    it("uses updated slideDistance when opened after rotation occurred while hidden", () => {
      const initialProps: BottomSheetAnimationOptions = {
        visible: false,
        height: 700,
        isLandscape: false,
        heightRatio: 0.5,
      };

      const { result, rerender } = renderHook(
        (props: BottomSheetAnimationOptions) => useBottomSheetAnimation(props),
        { initialProps },
      );

      // In portrait: sheetHeight = 700 * 0.5 = 350 -> slideDistance = 350
      expect(result.current.slideDistance).toBe(350);

      // Rotation happens while hidden
      act(() => {
        rerender({
          visible: false,
          height: 400,
          isLandscape: true,
        });
      });

      const landscapeSlideDistance = result.current.slideDistance;
      const setValueSpy = jest.spyOn(result.current.slideAnim, "setValue");

      // Now open modal in landscape
      act(() => {
        rerender({
          visible: true,
          height: 400,
          isLandscape: true,
        });
      });

      expect(parallelSpy).toHaveBeenCalledTimes(1);
      expect(setValueSpy).toHaveBeenCalledWith(landscapeSlideDistance);
    });

    it("stops animation on unmount", () => {
      const stopMock = jest.fn();
      parallelSpy.mockReturnValue({
        start: jest.fn(),
        stop: stopMock,
        reset: jest.fn(),
      });

      const { unmount } = renderHook(() =>
        useBottomSheetAnimation({ visible: true }),
      );

      unmount();
      expect(stopMock).toHaveBeenCalled();
    });
  });

  describe("useDialogScaleAnimation", () => {
    it("does not trigger animation when visible is false", () => {
      const { result } = renderHook(() => useDialogScaleAnimation(false));
      expect((result.current.fadeAnim as any)._value).toBe(0);
      expect((result.current.scaleAnim as any)._value).toBe(0.94);
      expect(parallelSpy).not.toHaveBeenCalled();
    });

    it("triggers scale and fade entrance animation when visible is true", () => {
      const { result } = renderHook(() => useDialogScaleAnimation(true));
      expect(parallelSpy).toHaveBeenCalledTimes(1);
      expect(timingSpy).toHaveBeenCalledWith(
        result.current.fadeAnim,
        expect.objectContaining({
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      );
      expect(springSpy).toHaveBeenCalledWith(
        result.current.scaleAnim,
        expect.objectContaining({
          toValue: 1,
          friction: 8,
          tension: 80,
          useNativeDriver: true,
        }),
      );
    });
  });
});
