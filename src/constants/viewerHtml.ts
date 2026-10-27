import { COLORS } from "./colors";
import { THREE_DMOL_SCRIPT } from "./threeDmolScript";

export const VIEWER_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval'; style-src 'unsafe-inline'; img-src 'self' data: blob:; connect-src *; worker-src blob:; child-src blob:;">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    /* Dark Theme Background */
    body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; background-color: ${COLORS.background}; }
    #container { width: 100%; height: 100%; position: relative; }
  </style>
  <script>
${THREE_DMOL_SCRIPT}
  </script>
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
    let isMeasurementMode = false;
    let currentMeasurementMode = 'distance';
    let measurementShapes = [];
    let measurementLabels = [];
    let elementLabels = [];

    let animationFrameId = null;
    let lastFrameTime = 0;
    const TARGET_FPS = 30;
    const FRAME_INTERVAL = 1000 / TARGET_FPS;
    const ROTATION_SPEED_DEG_PER_SEC = 35;
    let isUserDragging = false;
    let isReadyNotified = false;

    function notifyReady() {
      if (isReadyNotified) return;
      if (window.ReactNativeWebView && typeof window.ReactNativeWebView.postMessage === 'function') {
        isReadyNotified = true;
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
        
        if (viewer) return;

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
        
        // Remove only element labels, preserving any active measurement labels
        for (let i = 0; i < elementLabels.length; i++) {
          try {
            viewer.removeLabel(elementLabels[i]);
          } catch (e) {}
        }
        elementLabels = [];

        if (showLabels) {
          let atoms = currentModel.selectedAtoms({});
          let maxLabels = Math.min(atoms.length, 300);
          for (let i = 0; i < maxLabels; i++) {
            let atom = atoms[i];
            let lbl = viewer.addLabel(atom.elem, {
              position: atom,
              backgroundColor: '${COLORS.surface}', 
              backgroundOpacity: 0.85,
              fontColor: '${COLORS.textPrimary}', 
              fontSize: 14,
              inFront: true,
              borderThickness: 1,
              borderColor: '${COLORS.border}'
            });
            if (lbl) elementLabels.push(lbl);
          }
        }
        
        viewer.render();
        if (lastMeasurementCall && lastMeasurementCall.atoms && lastMeasurementCall.atoms.length) {
          drawMeasurements(lastMeasurementCall.mode, lastMeasurementCall.atoms, lastMeasurementCall.label);
        }
      } catch (e) {
        console.error('Apply style error:', e);
      }
    }

    function setupAtomPicking() {
      if (!viewer) return;
      try {
        viewer.setClickable({}, isMeasurementMode, function(atom) {
          if (!isMeasurementMode || !atom) return;
          if (window.ReactNativeWebView && typeof window.ReactNativeWebView.postMessage === 'function') {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'ATOM_PICKED',
              atom: {
                serial: atom.serial !== undefined ? atom.serial : (atom.index !== undefined ? atom.index + 1 : 1),
                index: atom.index !== undefined ? atom.index : 0,
                elem: atom.elem || 'C',
                x: atom.x,
                y: atom.y,
                z: atom.z
              }
            }));
          }
        });
      } catch (e) {
        console.error('setupAtomPicking error:', e);
      }
    }

    let lastMeasurementCall = null;

    function getDynamicAtomMeshRadius(atom) {
      var vdw = 1.7;
      if (currentModel && atom && atom.index !== undefined) {
        try {
          var modelAtoms = currentModel.selectedAtoms({ index: atom.index });
          if (modelAtoms && modelAtoms.length > 0 && modelAtoms[0].radius) {
            vdw = modelAtoms[0].radius;
          }
        } catch(e) {}
      }
      if (!vdw || vdw === 1.7) {
        var elem = (atom && atom.elem ? atom.elem.toUpperCase() : 'C');
        var vdwMap = {
          H: 1.2, HE: 1.4, LI: 1.82, BE: 1.53, B: 1.92,
          C: 1.7, N: 1.55, O: 1.52, F: 1.47, NE: 1.54,
          NA: 2.27, MG: 1.73, AL: 1.84, SI: 2.1, P: 1.8,
          S: 1.8, CL: 1.75, AR: 1.88, K: 2.75, CA: 2.31,
          BR: 1.85, I: 1.98
        };
        vdw = vdwMap[elem] || 1.7;
      }

      if (currentStyle === 'sphere') {
        return (vdw * 0.8) + 0.12;
      } else if (currentStyle === 'stick') {
        return 0.32;
      } else if (currentStyle === 'wireframe') {
        return 0.22;
      } else {
        // ballStick: spheres are vdw * 0.25. Add slight clearance so the wireframe hugs the atom closely
        return (vdw * 0.25) + 0.08;
      }
    }

    function clearMeasurementVisuals(preserveState) {
      if (!viewer) return;
      try {
        if (!preserveState) {
          lastMeasurementCall = null;
        }
        for (let i = 0; i < measurementShapes.length; i++) {
          try {
            viewer.removeShape(measurementShapes[i]);
          } catch (e) {}
        }
        measurementShapes = [];
        for (let j = 0; j < measurementLabels.length; j++) {
          try {
            viewer.removeLabel(measurementLabels[j]);
          } catch (e) {}
        }
        measurementLabels = [];
        viewer.render();
      } catch (e) {
        console.error('clearMeasurementVisuals error:', e);
      }
    }

    function drawMeasurements(mode, atoms, label) {
      if (!viewer || !atoms || !atoms.length) return;
      try {
        clearMeasurementVisuals(true);
        lastMeasurementCall = { mode: mode, atoms: atoms, label: label };

        const atomColors = ['#06B6D4', '#10B981', '#F59E0B', '#F43F5E'];

        for (let i = 0; i < atoms.length; i++) {
          const atom = atoms[i];
          const color = atomColors[i % atomColors.length];
          const radius = getDynamicAtomMeshRadius(atom);
          const sphere = viewer.addSphere({
            center: { x: atom.x, y: atom.y, z: atom.z },
            radius: radius,
            color: color,
            wireframe: true
          });
          if (sphere) measurementShapes.push(sphere);
        }

        if (atoms.length >= 2) {
          for (let k = 0; k < atoms.length - 1; k++) {
            const p1 = atoms[k];
            const p2 = atoms[k + 1];
            let strut = null;
            try {
              if (typeof viewer.addCylinder === 'function') {
                strut = viewer.addCylinder({
                  start: { x: p1.x, y: p1.y, z: p1.z },
                  end: { x: p2.x, y: p2.y, z: p2.z },
                  radius: 0.06,
                  color: '#10B981',
                  dashed: true
                });
              }
            } catch(e) {}
            if (!strut && typeof viewer.addLine === 'function') {
              try {
                strut = viewer.addLine({
                  dashed: true,
                  start: { x: p1.x, y: p1.y, z: p1.z },
                  end: { x: p2.x, y: p2.y, z: p2.z },
                  color: '#10B981'
                });
              } catch(e) {}
            }
            if (strut) measurementShapes.push(strut);
          }
        }

        if (label && atoms.length >= 2) {
          let labelPos = { x: 0, y: 0, z: 0 };
          if (mode === 'angle' && atoms.length >= 3) {
            const b = atoms[1];
            const a = atoms[0];
            const c = atoms[2];
            const midX = (a.x + c.x) / 2;
            const midY = (a.y + c.y) / 2;
            const midZ = (a.z + c.z) / 2;
            const dirX = midX - b.x;
            const dirY = midY - b.y;
            const dirZ = midZ - b.z;
            const len = Math.sqrt(dirX * dirX + dirY * dirY + dirZ * dirZ);
            if (len > 0.001) {
              const offset = 0.55 / len;
              labelPos = { x: b.x + dirX * offset, y: b.y + dirY * offset, z: b.z + dirZ * offset };
            } else {
              labelPos = { x: b.x, y: b.y + 0.5, z: b.z };
            }
          } else if (mode === 'dihedral' && atoms.length >= 4) {
            labelPos = {
              x: (atoms[1].x + atoms[2].x) / 2,
              y: (atoms[1].y + atoms[2].y) / 2,
              z: (atoms[1].z + atoms[2].z) / 2
            };
          } else {
            labelPos = {
              x: (atoms[0].x + atoms[1].x) / 2,
              y: (atoms[0].y + atoms[1].y) / 2,
              z: (atoms[0].z + atoms[1].z) / 2
            };
          }

          const lbl = viewer.addLabel(label, {
            position: labelPos,
            fontSize: 16,
            inFront: true,
            fontColor: '#FFFFFF',
            backgroundColor: '#18181B',
            backgroundOpacity: 0.92,
            borderColor: '#10B981',
            borderThickness: 1
          });
          if (lbl) measurementLabels.push(lbl);
        }

        viewer.render();
      } catch (e) {
        console.error('drawMeasurements error:', e);
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
        clearMeasurementVisuals();
        elementLabels = [];
        viewer.clear();
        
        // If it's a CIF file, assemble the unit cell first
        let options = {};
        currentModel = viewer.addModel(structureData, format, options);

        viewer.zoomTo();
        viewer.zoom(0.8); // Zoom out slightly to give padding
        applyStyle();
        setupAtomPicking();
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
        } else if (message.type === 'SET_MEASUREMENT_MODE') {
          isMeasurementMode = !!message.active;
          if (message.mode) currentMeasurementMode = message.mode;
          setupAtomPicking();
          if (!isMeasurementMode) {
            clearMeasurementVisuals();
          }
        } else if (message.type === 'DRAW_MEASUREMENTS') {
          drawMeasurements(message.mode || currentMeasurementMode, message.atoms, message.label);
        } else if (message.type === 'CLEAR_MEASUREMENTS') {
          clearMeasurementVisuals();
        } else if (message.type === 'CAPTURE_SNAPSHOT') {
          try {
            if (viewer) {
              viewer.render();
              var dataUri = viewer.pngURI();
              if (window.ReactNativeWebView && typeof window.ReactNativeWebView.postMessage === 'function') {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'SNAPSHOT_RESULT',
                  dataUri: dataUri
                }));
              }
            } else {
              if (window.ReactNativeWebView && typeof window.ReactNativeWebView.postMessage === 'function') {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'SNAPSHOT_ERROR',
                  error: 'Viewer not initialized'
                }));
              }
            }
          } catch (captureErr) {
            console.error('Snapshot capture error:', captureErr);
            if (window.ReactNativeWebView && typeof window.ReactNativeWebView.postMessage === 'function') {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'SNAPSHOT_ERROR',
                error: String(captureErr)
              }));
            }
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

    // Initialize immediately if bundled 3Dmol is ready
    if (typeof $3Dmol !== 'undefined') {
      init();
    } else {
      // Ensure 3Dmol is loaded before initializing (fallback)
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
    }
  </script>
</body>
</html>
`;
