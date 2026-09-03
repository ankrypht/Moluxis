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

  it("should have dark theme styles", () => {
    expect(VIEWER_HTML).toContain(`background-color: ${COLORS.background}`);
  });
});
