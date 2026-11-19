import { renderHook } from "@testing-library/react-native";
import { BackHandler } from "react-native";
import {
  useAppBackHandler,
  UseAppBackHandlerOptions,
} from "../useAppBackHandler";

describe("useAppBackHandler", () => {
  let backSpy: jest.SpyInstance;
  let defaultOptions: UseAppBackHandlerOptions;

  beforeEach(() => {
    jest.clearAllMocks();
    backSpy = jest.spyOn(BackHandler, "addEventListener");

    defaultOptions = {
      hasActiveAlert: false,
      onCloseAlert: jest.fn(),
      showUpdateModal: false,
      onCloseUpdateModal: jest.fn(),
      showWhatsNewModal: false,
      onCloseWhatsNewModal: jest.fn(),
      showDevTestModal: false,
      onCloseDevTestModal: jest.fn(),
      showShareModal: false,
      onCloseShareModal: jest.fn(),
      showHistoryModal: false,
      onCloseHistoryModal: jest.fn(),
      showAboutModal: false,
      onCloseAboutModal: jest.fn(),
      isMeasuring: false,
      onCloseMeasure: jest.fn(),
      showInfo: false,
      onCloseInfo: jest.fn(),
      showDisplayOptions: false,
      onCloseDisplayOptions: jest.fn(),
      showControls: true,
      onExitZenMode: jest.fn(),
      showSuggestions: false,
      onCloseSuggestions: jest.fn(),
      canClearToShowcase: false,
      onClearToShowcase: jest.fn(),
    };
  });

  afterEach(() => {
    backSpy.mockRestore();
  });

  it("does not register BackHandler listener when canGoBack is false", () => {
    renderHook(() => useAppBackHandler(defaultOptions));
    expect(backSpy).not.toHaveBeenCalled();
  });

  it("registers BackHandler listener when canClearToShowcase is true", () => {
    renderHook(() =>
      useAppBackHandler({
        ...defaultOptions,
        canClearToShowcase: true,
      }),
    );
    expect(backSpy).toHaveBeenCalledWith(
      "hardwareBackPress",
      expect.any(Function),
    );
  });

  it("prioritizes hasActiveAlert over showHistoryModal and onClearToShowcase", () => {
    renderHook(() =>
      useAppBackHandler({
        ...defaultOptions,
        hasActiveAlert: true,
        showHistoryModal: true,
        canClearToShowcase: true,
      }),
    );

    const handler = backSpy.mock.calls[0][1];
    const result = handler();

    expect(result).toBe(true);
    expect(defaultOptions.onCloseAlert).toHaveBeenCalledTimes(1);
    expect(defaultOptions.onCloseHistoryModal).not.toHaveBeenCalled();
    expect(defaultOptions.onClearToShowcase).not.toHaveBeenCalled();
  });

  it("prioritizes showUpdateModal over onClearToShowcase", () => {
    renderHook(() =>
      useAppBackHandler({
        ...defaultOptions,
        showUpdateModal: true,
        canClearToShowcase: true,
      }),
    );

    const handler = backSpy.mock.calls[0][1];
    const result = handler();

    expect(result).toBe(true);
    expect(defaultOptions.onCloseUpdateModal).toHaveBeenCalledTimes(1);
    expect(defaultOptions.onClearToShowcase).not.toHaveBeenCalled();
  });

  it("prioritizes showWhatsNewModal over onClearToShowcase", () => {
    renderHook(() =>
      useAppBackHandler({
        ...defaultOptions,
        showWhatsNewModal: true,
        canClearToShowcase: true,
      }),
    );

    const handler = backSpy.mock.calls[0][1];
    const result = handler();

    expect(result).toBe(true);
    expect(defaultOptions.onCloseWhatsNewModal).toHaveBeenCalledTimes(1);
    expect(defaultOptions.onClearToShowcase).not.toHaveBeenCalled();
  });

  it("prioritizes showDevTestModal over onClearToShowcase", () => {
    renderHook(() =>
      useAppBackHandler({
        ...defaultOptions,
        showDevTestModal: true,
        canClearToShowcase: true,
      }),
    );

    const handler = backSpy.mock.calls[0][1];
    const result = handler();

    expect(result).toBe(true);
    expect(defaultOptions.onCloseDevTestModal).toHaveBeenCalledTimes(1);
    expect(defaultOptions.onClearToShowcase).not.toHaveBeenCalled();
  });

  it("calls onClearToShowcase when only canClearToShowcase is active", () => {
    renderHook(() =>
      useAppBackHandler({
        ...defaultOptions,
        canClearToShowcase: true,
      }),
    );

    const handler = backSpy.mock.calls[0][1];
    const result = handler();

    expect(result).toBe(true);
    expect(defaultOptions.onClearToShowcase).toHaveBeenCalledTimes(1);
  });

  it("removes subscription when unmounted", () => {
    const removeMock = jest.fn();
    backSpy.mockReturnValue({ remove: removeMock });

    const { unmount } = renderHook(() =>
      useAppBackHandler({
        ...defaultOptions,
        canClearToShowcase: true,
      }),
    );

    unmount();
    expect(removeMock).toHaveBeenCalledTimes(1);
  });
});
