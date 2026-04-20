export const getViewerHtml = () => `
<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' https://3Dmol.csb.pitt.edu; style-src 'unsafe-inline'; img-src 'self' data: blob: https://3Dmol.csb.pitt.edu; connect-src *; worker-src blob:;">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script src="https://3Dmol.csb.pitt.edu/build/3Dmol-min.js"></script>
  <style>
    /* Dark Theme Background */
    body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; background-color: #121212; }
    #container { width: 100%; height: 100%; position: relative; }
  </style>
</head>
<body>
  <div id="container"></div>
  <script>
    let viewer = null;
    let currentModel = null;
    let currentStyle = 'ballStick';
    let showLabels = false;
    let isAnimating = false;
    let animationId = null;

    function init() {
      try {
        let element = document.getElementById('container');
        if (!element) return;
        
        // Set 3D Viewer background to match app dark theme
        let config = { backgroundColor: '#121212' };
        
        if (typeof $3Dmol === 'undefined') {
           console.error('3Dmol is not defined');
           return;
        }
        
        viewer = $3Dmol.createViewer(element, config);
        
        // Notify React Native that we are ready
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'WEBVIEW_READY' }));
      } catch (e) {
        console.error('Init error:', e);
      }
    }

    function animate() {
      if (isAnimating && viewer) {
        viewer.rotate(0.8, 'y'); // Rotate 0.8 degree around Y axis
        animationId = requestAnimationFrame(animate);
      }
    }

    function toggleAnimation(status) {
      isAnimating = !!status;
      if (isAnimating) {
        if (!animationId) animate();
      } else {
        if (animationId) {
          cancelAnimationFrame(animationId);
          animationId = null;
        }
      }
    }

    function applyStyle() {
      if (!currentModel || !viewer) return;
      
      try {
        let styleObj = {};
        
        switch(currentStyle) {
          case 'stick':
            styleObj = { stick: { radius: 0.2 } };
            break;
          case 'wireframe':
            styleObj = { stick: { radius: 0.05 } };
            break;
          case 'sphere':
            styleObj = { sphere: { scale: 0.8 } };
            break;
          case 'ballStick':
          default:
            styleObj = { stick: { radius: 0.15 }, sphere: { scale: 0.25 } };
            break;
        }

        viewer.setStyle({}, styleObj);
        
        viewer.removeAllLabels();
        if (showLabels) {
          let atoms = currentModel.selectedAtoms({});
          for (let i = 0; i < atoms.length; i++) {
            let atom = atoms[i];
            viewer.addLabel(atom.elem, {
              position: atom,
              backgroundColor: '#000000', 
              backgroundOpacity: 0.7,
              fontColor: 'white', 
              fontSize: 12,
              borderThickness: 1,
              borderColor: '#555'
            });
          }
        }
        
        viewer.render();
      } catch (e) {
        console.error('Apply style error:', e);
      }
    }

    window.loadStructure = function(structureData, format, style, labels, animateStatus) {
      if (style) currentStyle = style;
      if (labels !== undefined) showLabels = labels;
      
      if (!viewer) init();
      if (!viewer) return;
      
      try {
        viewer.clear();
        
        // If it's a CIF file, assemble the unit cell first
        let options = {};
        currentModel = viewer.addModel(structureData, format, options);

        viewer.zoomTo();
        applyStyle();
        if (animateStatus !== undefined) toggleAnimation(animateStatus);
      } catch (e) {
        console.error('Load structure error:', e);
      }
    }

    window.updateSettings = function(style, labels, animateStatus) {
      currentStyle = style;
      showLabels = labels;
      applyStyle();
      if (animateStatus !== undefined) toggleAnimation(animateStatus);
    }

    const messageHandler = (event) => {
      try {
        const message = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

        // Structural validation
        if (!message || typeof message !== 'object') return;

        if (message.type === 'LOAD_STRUCTURE') {
          // Pass the new format and style/labels
          window.loadStructure(message.data, message.format, message.style, message.labels, message.animate);
        } else if (message.type === 'UPDATE_SETTINGS') {
          window.updateSettings(message.style, message.labels, message.animate);
        }
      } catch (err) {
        console.error('Message listener error:', err);
      }
    };

    window.addEventListener('message', messageHandler);
    document.addEventListener('message', messageHandler);

    // Ensure 3Dmol is loaded before initializing
    const check3Dmol = setInterval(() => {
      if (typeof $3Dmol !== 'undefined') {
        clearInterval(check3Dmol);
        init();
      }
    }, 100);

    // Timeout after 5 seconds
    setTimeout(() => clearInterval(check3Dmol), 5000);
  </script>
</body>
</html>
`;
