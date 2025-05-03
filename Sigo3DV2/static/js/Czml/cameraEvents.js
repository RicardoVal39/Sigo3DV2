/*Lista de funciones para eventos de la camara
    Funciones para camara:
      mover camara (left_click)
      zoom in (roll_up)
      zoom out (roll_down)
      rotar camara (right_click)
      zoomToCoordinates(SELECT)
      configuraciones:
        Capa nodo (SELECT)
        Capa modelo (SELECT)
        Capa camino (SELECT)
    */

/*Controles de la camara predeterminados*/
/*Enfocar el marco de Cesium */
// canvas.setAttribute("tabindex", "0");
// canvas.onclick = () => canvas.focus();

// const ellipsoid = scene.globe.ellipsoid;
// scene.screenSpaceCameraController.enableRotate = false;
// // scene.screenSpaceCameraController.enableTranslate = false;
// // scene.screenSpaceCameraController.enableZoom = false;
// // scene.screenSpaceCameraController.enableTilt = false;
// // scene.screenSpaceCameraController.enableLook = false;

// let startMousePosition;
// let mousePosition;

// // Manejador de eventos de entrada
// const handler = new Cesium.ScreenSpaceEventHandler(canvas);


// handler.setInputAction((touch) => {
//   if (!touchStartPosition) return;

//   const dx = touch.position.x - touchStartPosition.x;
//   const dy = touch.position.y - touchStartPosition.y;
//   const moveFactor = 0.01;

//   viewer.camera.moveRight(-dx * moveFactor);
//   viewer.camera.moveUp(dy * moveFactor);

//   touchStartPosition = touch.position;
// }, Cesium.ScreenSpaceEventType.PINCH_MOVE);

// handler.setInputAction(() => {
//   touchStartPosition = null;
// }, Cesium.ScreenSpaceEventType.PINCH_END);

// // Control con teclado en PC
// function getFlagForKeyCode(code) {
//   switch (code) {
//     case "KeyW": return "zoomIn";
//     case "KeyS": return "zoomOut";
//     case "KeyQ": return "moveUp";
//     case "KeyE": return "moveDown";
//     case "KeyD": return "moveRight";
//     case "KeyA": return "moveLeft";
//     default: return undefined;
//   }
// }
// document.addEventListener("keydown", (e) => {
//   const flagName = getFlagForKeyCode(e.code);
//   if (flagName) flags[flagName] = true;
// }, false);

// document.addEventListener("keyup", (e) => {
//   const flagName = getFlagForKeyCode(e.code);
//   if (flagName) flags[flagName] = false;
// }, false);


// // Animación en cada frame
// viewer.clock.onTick.addEventListener(() => {
//     const camera = viewer.camera;
//     if (flags.looking) {
//       const width = canvas.clientWidth;
//       const height = canvas.clientHeight;
//       const x = (mousePosition.x - startMousePosition.x) / width;
//       const y = -(mousePosition.y - startMousePosition.y) / height;
//       const lookFactor = 0.2;
//       camera.lookRight(x * lookFactor);
//       camera.lookUp(y * lookFactor);
//     }
  
//     const cameraHeight = ellipsoid.cartesianToCartographic(camera.position).height;
//     const moveRate = 0.2;
  
//     if (flags.zoomIn) camera.moveForward(1);
//     if (flags.zoomOut) camera.moveBackward(1);
//     if (flags.moveUp) camera.moveUp(moveRate);
//     if (flags.moveDown) camera.moveDown(moveRate);
//     if (flags.moveLeft) camera.moveLeft(moveRate);
//     if (flags.moveRight) camera.moveRight(moveRate);
//   });
function zoomToCoordinates(latitude, longitude,altitude) {
    const destination = Cesium.Cartesian3.fromDegrees((longitude-0.0007), (latitude-(-0.0004)), (altitude-(-100)));
    viewer.camera.flyTo({
        destination: destination,
        orientation: {
            heading: Cesium.Math.toRadians(120.0),
            pitch: Cesium.Math.toRadians(-45.0),
            roll: 0.0
        },
        duration: 2 
    });
}
function zoomToCoordinatesRoom(latitude, longitude,altitude,orientation) {
    const destination = Cesium.Cartesian3.fromDegrees((longitude), (latitude), (altitude));
    viewer.camera.flyTo({
        destination: destination,
        orientation: {
            heading: Cesium.Math.toRadians(parseFloat(orientation)),
            pitch: Cesium.Math.toRadians(-60.0),
            roll: 0.0
        },
        duration: 2 
    });
}
function rastrearUbicacion(mostrar) {
  /* funcion que realiza el rastreo de la persona, es decir sigue la ubicacion de la persona mientras recorre el campus
  permitiendo le ver desde el dispositivo los edificios, salones o lugares que lo rodean y la informacion de estos 
  el parametro mostrar es un booleano que indica si se debe mostrar la ubicacion de la persona en el mapa a los demas usuarios
  */
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        function(position) {
            var lat = position.coords.latitude;
            var lon = position.coords.longitude;
            var height = 10; // Altura de la vista en metros
            const position_u = Cesium.Cartesian3.fromDegrees(lon, lat, height);

            // // Llamar a la función para hacer zoom a la ubicación
            // zoomToCoordinates(lat, lon, height-10);
            clickMarkerTemp = viewer.entities.add({
                position: position_u,
                billboard: {
                    image: "/static/logos/iconos/ubicacion actual.png",
                    width: 32,
                    height: 32
                },
                label: {
                    text: `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`,
                    font: "8pt Arial",
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    outlineWidth: 2,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    pixelOffset: new Cesium.Cartesian2(0, -32) // Ajuste para que la etiqueta no se superponga al marcador
                }
            });
        },
        function(error) {
            console.error("Error obteniendo la ubicación:", error);
        },
        {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 500,
        }
    );
  } else {
    console.error("Geolocalización no soportada en este navegador.");
  }
}
rastrearUbicacion(true);

function flyAround(latitude, longitude, altitude) {
    const cameraHeight = altitude + 50;
    const radius = 100;
    const meterToDegree = 1 / 111320;
    let startTime = Cesium.JulianDate.now();

    function animate(clock) {
        const elapsedTime = Cesium.JulianDate.secondsDifference(Cesium.JulianDate.now(), startTime);
        
        if (elapsedTime >= 10) {
            viewer.clock.onTick.removeEventListener(animate);
            return;
        }
        const angle = Cesium.Math.toRadians(elapsedTime * 20);
        const offsetLongitude = (radius * Math.cos(angle)) * meterToDegree;
        const offsetLatitude = (radius * Math.sin(angle)) * meterToDegree;

        const position = Cesium.Cartesian3.fromDegrees(
            longitude - offsetLongitude,
            latitude - offsetLatitude,
            cameraHeight
        );
        const heading = Cesium.Math.toRadians(90) - angle;

        viewer.camera.setView({
            destination: position,
            orientation: {
                heading: heading,  
                pitch: Cesium.Math.toRadians(-30), 
                roll: 0.0
            }
        });
    }
    viewer.clock.onTick.addEventListener(animate);
}
