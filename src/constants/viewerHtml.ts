import { COLORS } from "./colors";

export const VIEWER_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' https://3Dmol.csb.pitt.edu; style-src 'unsafe-inline'; img-src 'self' data: blob: https://3Dmol.csb.pitt.edu; connect-src *; worker-src blob:;">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script src="https://3Dmol.csb.pitt.edu/build/3Dmol-min.js"></script>
  <style>
    /* Dark Theme Background */
    body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; background-color: ${COLORS.background}; }
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
    let pendingLoad = null;

    let animationFrameId = null;
    let lastFrameTime = 0;
    const TARGET_FPS = 30;
    const FRAME_INTERVAL = 1000 / TARGET_FPS;
    const ROTATION_SPEED_DEG_PER_SEC = 35;
    let isUserDragging = false;

    function notifyReady() {
      if (window.ReactNativeWebView && typeof window.ReactNativeWebView.postMessage === 'function') {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'WEBVIEW_READY' }));
      } else {
        setTimeout(notifyReady, 50);
      }
    }

    function animationLoop(timestamp) {
      if (!isAnimating || isUserDragging || !viewer || !currentModel) {
        animationFrameId = null;
        return;
      }

      if (!lastFrameTime) {
        lastFrameTime = timestamp;
      }

      const elapsed = timestamp - lastFrameTime;

      if (elapsed >= FRAME_INTERVAL) {
        const safeElapsed = Math.min(elapsed, 100);
        const deltaAngle = (ROTATION_SPEED_DEG_PER_SEC * safeElapsed) / 1000;
        try {
          viewer.rotate(deltaAngle, 'vy');
        } catch (e) {
          console.error('Rotation error:', e);
        }
        lastFrameTime = timestamp - (elapsed % FRAME_INTERVAL);
      }

      animationFrameId = window.requestAnimationFrame(animationLoop);
    }

    function startAnimation() {
      if (viewer && typeof viewer.spin === 'function') {
        viewer.spin(false);
      }
      if (!isAnimating || isUserDragging || !viewer || !currentModel) return;
      if (animationFrameId !== null) return;
      lastFrameTime = 0;
      animationFrameId = window.requestAnimationFrame(animationLoop);
    }

    function stopAnimation() {
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      lastFrameTime = 0;
      if (viewer && typeof viewer.spin === 'function') {
        viewer.spin(false);
      }
    }

    function toggleAnimation(status) {
      isAnimating = !!status;
      if (isAnimating) {
        startAnimation();
      } else {
        stopAnimation();
      }
    }

    function init() {
      try {
        let element = document.getElementById('container');
        if (!element) return;
        
        if (typeof $3Dmol === 'undefined') {
           return;
        }
        
        if (!viewer) {
          // Set 3D Viewer background to match app dark theme.
          // Explicitly set antialias: false to prevent 3Dmol from creating extra offscreen
          // FBOs and running post-processing screenaa shaders, eliminating PowerVR GPU stalls.
          let config = { 
            backgroundColor: '${COLORS.background}',
            antialias: false
          };
          viewer = $3Dmol.createViewer(element, config);
          
          let canvas = element.querySelector('canvas');
          if (canvas) {
            canvas.addEventListener('webglcontextlost', function(e) {
              e.preventDefault();
              stopAnimation();
            }, false);
            canvas.addEventListener('webglcontextrestored', function() {
              if (isAnimating && !isUserDragging) {
                startAnimation();
              }
            }, false);
          }
        }
        
        // Notify React Native that we are ready
        notifyReady();

        if (pendingLoad) {
          let pending = pendingLoad;
          pendingLoad = null;
          window.loadStructure(pending.structureData, pending.format, pending.style, pending.labels, pending.animateStatus);
        }
      } catch (e) {
        console.error('Init error:', e);
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
          let maxLabels = Math.min(atoms.length, 300);
          for (let i = 0; i < maxLabels; i++) {
            let atom = atoms[i];
            viewer.addLabel(atom.elem, {
              position: atom,
              backgroundColor: '${COLORS.surface}', 
              backgroundOpacity: 0.8,
              fontColor: '${COLORS.textPrimary}', 
              fontSize: 12,
              borderThickness: 1,
              borderColor: '${COLORS.border}'
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
      
      if (!viewer) {
        pendingLoad = { structureData: structureData, format: format, style: style, labels: labels, animateStatus: animateStatus };
        init();
        return;
      }
      
      try {
        stopAnimation();
        viewer.clear();
        
        // If it's a CIF file, assemble the unit cell first
        let options = {};
        currentModel = viewer.addModel(structureData, format, options);

        viewer.zoomTo();
        viewer.zoom(0.8); // Zoom out slightly to give padding
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
        } else if (message.type === 'PAUSE_ANIMATION') {
          stopAnimation();
        } else if (message.type === 'RESUME_ANIMATION') {
          if (isAnimating && !isUserDragging) {
            startAnimation();
          }
        }
      } catch (err) {
        console.error('Message listener error:', err);
      }
    };

    window.addEventListener('message', messageHandler);
    document.addEventListener('message', messageHandler);

    document.addEventListener('touchstart', function(e) {
       isUserDragging = true;
       stopAnimation();
    }, { passive: true });

    document.addEventListener('touchend', function(e) {
       isUserDragging = false;
       if (isAnimating) {
         startAnimation();
       }
    }, { passive: true });

    document.addEventListener('touchcancel', function(e) {
       isUserDragging = false;
       if (isAnimating) {
         startAnimation();
       }
    }, { passive: true });

    document.addEventListener('visibilitychange', function() {
      if (document.hidden) {
        stopAnimation();
      } else if (isAnimating && !isUserDragging) {
        startAnimation();
      }
    });

    window.addEventListener('blur', function() {
      stopAnimation();
    });

    window.addEventListener('focus', function() {
      if (isAnimating && !isUserDragging) {
        startAnimation();
      }
    });

    // Ensure 3Dmol is loaded before initializing
    const check3Dmol = setInterval(() => {
      if (typeof $3Dmol !== 'undefined') {
        clearInterval(check3Dmol);
        init();
      }
    }, 100);

    window.addEventListener('load', function() {
      if (typeof $3Dmol !== 'undefined') {
        clearInterval(check3Dmol);
        init();
      }
    });

    // Timeout after 30 seconds
    setTimeout(() => clearInterval(check3Dmol), 30000);
  </script>
</body>
</html>
`;
