export const viewerHtml = `
<!DOCTYPE html>
<html>
<head>
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

    function init() {
      let element = document.getElementById('container');
      // Set 3D Viewer background to match app dark theme
      let config = { backgroundColor: '#121212' };
      viewer = $3Dmol.createViewer(element, config);
    }

    function applyStyle() {
      if (!currentModel) return;
      
      let styleObj = {};
      
      switch(currentStyle) {
        case 'stick':
          styleObj = { stick: {} };
          break;
        case 'wireframe':
          styleObj = { line: {} };
          break;
        case 'sphere':
          styleObj = { sphere: {} };
          break;
        case 'ballStick':
        default:
          styleObj = { stick: {radius: 0.15}, sphere: {scale: 0.25} };
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
            backgroundColor: '#333333', 
            backgroundOpacity: 0.9,
            fontColor: 'white', 
            fontSize: 14,
            borderThickness: 1,
            borderColor: '#555'
          });
        }
      }
      
      viewer.render();
    }

    window.loadStructure = function(sdfData) {
      if (!viewer) init();
      viewer.clear();
      currentModel = viewer.addModel(sdfData, "sdf");
      viewer.zoomTo();
      applyStyle();
    }

    window.updateSettings = function(style, labels) {
      currentStyle = style;
      showLabels = labels;
      applyStyle();
    }

    init();
  </script>
</body>
</html>
`;
