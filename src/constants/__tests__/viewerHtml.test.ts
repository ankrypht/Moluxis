import { getViewerHtml } from "../viewerHtml";

describe("getViewerHtml", () => {
  it("should return a string containing essential HTML elements", () => {
    const html = getViewerHtml();
    expect(typeof html).toBe("string");
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("<html>");
    expect(html).toContain("<head>");
    expect(html).toContain("<body>");
    expect(html).toContain('<div id="container"></div>');
  });

  it("should contain the correct Content-Security-Policy", () => {
    const html = getViewerHtml();
    expect(html).toContain('http-equiv="Content-Security-Policy"');
    expect(html).toContain("https://3Dmol.csb.pitt.edu");
  });

  it("should include the 3Dmol.js script", () => {
    const html = getViewerHtml();
    expect(html).toContain('<script src="https://3Dmol.csb.pitt.edu/build/3Dmol-min.js"></script>');
  });

  it("should contain key JavaScript functions and logic", () => {
    const html = getViewerHtml();
    expect(html).toContain("function init()");
    expect(html).toContain("function applyStyle()");
    expect(html).toContain("window.loadStructure = function");
    expect(html).toContain("window.updateSettings = function");
    expect(html).toContain("window.ReactNativeWebView.postMessage");
    expect(html).toContain("window.addEventListener('message', messageHandler)");
    expect(html).toContain("const check3Dmol = setInterval");
  });

  it("should have dark theme styles", () => {
    const html = getViewerHtml();
    expect(html).toContain("background-color: #121212");
  });
});
