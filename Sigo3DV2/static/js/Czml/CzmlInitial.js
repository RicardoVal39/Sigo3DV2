//Inicializador de Cesium
'use strict';
Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhZDQ5ODMwNy0yYjIyLTQ3ZDctYjY2YS1iY2IzZGFmM2Q5NTUiLCJpZCI6OTk3NDYsImlhdCI6MTY1NjY4NTQwM30.uNoXX34-Jem827D7O2Omir1A7XCH9I5wp9hvqDvtXso";
const viewer = new Cesium.Viewer("cesium_admin", {
    selectionIndicator: false,  
    infoBox: false,             
    baseLayerPicker: false,
    timeline: true,
    geocoder: true,
    homeButton: false,
    sceneModePicker: false,
    navigationHelpButton: false,
    animation: true,
    shouldAnimate: true,
    shadows: true,

});
viewer.scene.globe.depthTestAgainstTerrain = true;

viewer.scene.debugShowFramesPerSecond = true;
zoomToCoordinates(4.07509719418385, -73.58627207266032, 100); 
const scene = viewer.scene;
const handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
window.startup = async function (Cesium, models) {
    try {
        async function processInBatches(items, batchSize, callback) {
            for (let i = 0; i < items.length; i += batchSize) {
                const batch = items.slice(i, i + batchSize);
                await Promise.all(batch.map(callback));
            }
        }
        async function loadImagery(modelo) {
            try {
                let imagery = await Cesium.IonImageryProvider.fromAssetId(modelo.id_object);
                imagery.id = modelo.id_object;
                imagery.name = modelo.name;
                imagery.customAttributes = { tipo: modelo.type };
                viewer.imageryLayers.addImageryProvider(imagery);
            } catch (error) {
                console.error("Error cargando imagery:", modelo.name, error);
            }
        }
        async function loadModel(modelo) {
            try {
                let position = Cesium.Cartesian3.fromDegrees(
                    parseFloat(modelo.location.longitude.replace(",", ".")),
                    parseFloat(modelo.location.latitude.replace(",", ".")),
                    parseFloat(modelo.location.altitude.replace(",", "."))
                );
                let tileset = await Cesium.Cesium3DTileset.fromIonAssetId(modelo.id_object);
                tileset.id = modelo.id_object;
                tileset.name = modelo.name;
                tileset.maximumScreenSpaceError = 10;

                const hpRoll = new Cesium.HeadingPitchRoll(
                    Cesium.Math.toRadians(parseFloat(modelo.heading.replace(",", "."))),
                    Cesium.Math.toRadians(parseFloat(modelo.pitch.replace(",", "."))),
                    Cesium.Math.toRadians(parseFloat(modelo.roll.replace(",", ".")))
                );

                let modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(
                    position,
                    hpRoll,
                    Cesium.Ellipsoid.WGS84,
                    Cesium.Transforms.eastNorthUpToFixedFrame
                );
                Cesium.Matrix4.setUniformScale(modelMatrix, parseFloat(modelo.scale.replace(",", ".")), modelMatrix);
                tileset._root.transform = modelMatrix;
                tileset.allowPicking = true;
                tileset.tipo = modelo.type;

                tileset._clippingPlanes = new Cesium.ClippingPlaneCollection({
                    planes: [new Cesium.ClippingPlane(Cesium.Cartesian3.UNIT_Z, 100)],
                    unionClippingRegions: true,
                    enabled: true
                });
                tileset._clippingPlanes._planes[0]._normal._cartesian3.z = -1;

                viewer.scene.primitives.add(tileset);
            } catch (error) {
                console.error("Error cargando modelo:", modelo.name, error);
            }
        }
        const activos = models.filter(m => m.is_activated === "True");
        const imageryModels = activos.filter(m => m.type == "Imagen");
        const model3D = activos.filter(m => m.type === "Modelo");
        await Promise.all(imageryModels.map(loadImagery));
        await processInBatches(model3D, 5, loadModel);

    } catch (error) {
        console.error(error);
    }

    Sandcastle.finishedLoading();
};
if (typeof Cesium !== 'undefined') {
    window.startupCalled = true;
    window.startup(Cesium,models).catch((error) => {
        "use strict";
        console.error("startup_error: ",error);
    });
}    

let keyboardListener = null;
function KeyboardControl(mode,context) {
    document.removeEventListener('keydown', keyboardListener);
    if (mode) {
        keyboardListener = function (e) {
            const step_location = parseFloat($('#direccion').val())/100000;
            const step_rotation = $('#altura').val();
            const step_scale = $('#altura').val();

            function updateField(id, delta) {
                const input = document.getElementById(id);
                if (!input) return;
                let value = parseFloat(input.value || 0);
                value += delta;
                input.value = value.toFixed(7);
                $('#form_basic').trigger('input');
            }
            if (context === "objetos_czml") {
                if (e.ctrlKey && e.code === 'ArrowLeft') updateField('id_Heading', -step_rotation);
                if (e.ctrlKey && e.code === 'ArrowRight') updateField('id_Heading', step_rotation);

                if (e.shiftKey && e.code === 'ArrowDown') updateField('id_Pitch', step_rotation);
                if (e.shiftKey && e.code === 'ArrowUp') updateField('id_Pitch', -step_rotation);

                if (e.shiftKey && e.code === 'ArrowLeft') updateField('id_Roll', -step_rotation);
                if (e.shiftKey && e.code === 'ArrowRight') updateField('id_Roll', step_rotation);

                if (e.ctrlKey && e.code === 'ArrowUp') updateField('id_Scale', step_scale);
                if (e.ctrlKey && e.code === 'ArrowDown') updateField('id_Scale', -step_scale);
            }

            if (!e.shiftKey && !e.ctrlKey && e.code === 'ArrowRight') updateField('id_Latitud', -step_location);
            if (!e.shiftKey && !e.ctrlKey && e.code === 'ArrowLeft') updateField('id_Latitud', step_location);

            if (!e.shiftKey && !e.ctrlKey && e.code === 'ArrowUp') updateField('id_Longitud', step_location);
            if (!e.shiftKey && !e.ctrlKey && e.code === 'ArrowDown') updateField('id_Longitud', -step_location);

            if (e.code === 'KeyQ') updateField('id_Altitud', step_scale);
            if (e.code === 'KeyE') updateField('id_Altitud', -step_scale);
            
        };
        document.addEventListener('keydown', keyboardListener);
    } else {
        document.removeEventListener('keydown', keyboardListener);
    }
}
