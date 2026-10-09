import { VIEWER_HTML } from "../viewerHtml";
import { COLORS } from "../colors";

describe("VIEWER_HTML", () => {
  it("should be a string containing essential HTML elements", () => {
    expect(typeof VIEWER_HTML).toBe("string");
    expect(VIEWER_HTML).toContain("<!DOCTYPE html>");
    expect(VIEWER_HTML).toContain("<html>");
    expect(VIEWER_HTML).toContain("<head>");
    expect(VIEWER_HTML).toContain("<body>");
    expect(VIEWER_HTML).toContain('<div id="container"></div>');
  });

  it("should contain the correct Content-Security-Policy", () => {
    expect(VIEWER_HTML).toContain('http-equiv="Content-Security-Policy"');
    expect(VIEWER_HTML).toContain("https://3Dmol.csb.pitt.edu");
  });

  it("should include the 3Dmol.js script", () => {
    expect(VIEWER_HTML).toContain(
      '<script src="https://3Dmol.csb.pitt.edu/build/3Dmol-min.js"></script>',
    );
  });

  it("should contain key JavaScript functions and logic", () => {
    expect(VIEWER_HTML).toContain("function init()");
    expect(VIEWER_HTML).toContain("function applyStyle()");
    expect(VIEWER_HTML).toContain("window.loadStructure = function");
    expect(VIEWER_HTML).toContain("window.updateSettings = function");
    expect(VIEWER_HTML).toContain("window.ReactNativeWebView.postMessage");
    expect(VIEWER_HTML).toContain(
      "window.addEventListener('message', messageHandler)",
    );
    expect(VIEWER_HTML).toContain("const check3Dmol = setInterval");
  });

  it("should use a 30fps throttled requestAnimationFrame animation loop instead of unthrottled spin intervals", () => {
    expect(VIEWER_HTML).toContain("function animationLoop(timestamp)");
    expect(VIEWER_HTML).toContain(
      "window.requestAnimationFrame(animationLoop)",
    );
    expect(VIEWER_HTML).toContain(
      "window.cancelAnimationFrame(animationFrameId)",
    );
    expect(VIEWER_HTML).toContain("function startAnimation()");
    expect(VIEWER_HTML).toContain("function stopAnimation()");
    expect(VIEWER_HTML).toContain("const TARGET_FPS = 30");
    expect(VIEWER_HTML).toContain("viewer.rotate(deltaAngle, 'vy')");
  });

  it("should configure 3Dmol with antialias: false to prevent offscreen FBO overhead and shader compilation stalls", () => {
    expect(VIEWER_HTML).toContain("antialias: false");
  });

  it("should handle PAUSE_ANIMATION and RESUME_ANIMATION messages safely", () => {
    expect(VIEWER_HTML).toContain("message.type === 'PAUSE_ANIMATION'");
    expect(VIEWER_HTML).toContain("stopAnimation()");
    expect(VIEWER_HTML).toContain("message.type === 'RESUME_ANIMATION'");
    expect(VIEWER_HTML).toContain("startAnimation()");
  });

  it("should have dark theme styles", () => {
    expect(VIEWER_HTML).toContain(`background-color: ${COLORS.background}`);
  });
});
