/*Lista de funciones para manejar eventos de los objetos 3d
    Seleccionar objeto (left_click)
    Mostrar información del objeto (mouse_move)
    buscar objeto (SELECT)
    */

let selectedTileset = null;
let model_selected = null;
function selectObject(primitive, invocado) { //invocado = true si se invoca desde el mapa, false si se invoca desde la lista de objetos
    if (selectedTileset == null) {
        selectedTileset = primitive;// Se asigna el modelo 3D seleccionado a la variable selectedTileset
    } else {

        // Si ya hay un modelo 3D seleccionado, se actualiza su posición y escala, si no hay cambios, pasa al anterior estado y selecciona el nuevo modelo 3D
        let latitude = parseFloat(model_selected.location.latitude.replace(",", "."));
        let longitude = parseFloat(model_selected.location.longitude.replace(",", "."));
        let altitude = parseFloat(model_selected.location.altitude.replace(",", "."));
        let heading = parseFloat(model_selected.heading.replace(",", "."));
        let pitch = parseFloat(model_selected.pitch.replace(",", "."));
        let roll = parseFloat(model_selected.roll.replace(",", "."));
        let scale = parseFloat(model_selected.scale.replace(",", "."));
        selectedTileset.position = Cesium.Cartesian3.fromDegrees(longitude, latitude, altitude);
        const hpRoll = new Cesium.HeadingPitchRoll(
            Cesium.Math.toRadians(heading),
            Cesium.Math.toRadians(pitch),
            Cesium.Math.toRadians(roll)
        );
        let modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(
            selectedTileset.position,
            hpRoll,
            Cesium.Ellipsoid.WGS84,
            Cesium.Transforms.eastNorthUpToFixedFrame
        );
        Cesium.Matrix4.setUniformScale(modelMatrix, scale, modelMatrix);
        selectedTileset._root.transform = modelMatrix;
        selectedTileset = primitive;
    }
    let id = selectedTileset.id_object;
    models.forEach(model => {// Se recorre la lista de modelos 3D para encontrar el modelo 3D seleccionado y se actualizan los valores de la interfaz de usuario
        if (model.id_object == id) {
            model_selected = model;
            if (invocado === true) {
                $('#KeyWordSearch').val(model.name);
                $('#KeyWordSearch').trigger('input');
                $('#info_object').hide();
                info('Objetos 3D', 'Obteniendo informacion de ' + model.name, 'info', 6000);// Se muestra un mensaje de éxito al seleccionar el modelo 3D
                setTimeout(() => {
                    $("#object" + model.pk).trigger('click');// Se simula el click en el objeto de la lista para mostrar la información del objeto 3D seleccionado
                    $('#search_results').hide();
                }, 1000);
            }
            let latitude = parseFloat(model.location.latitude.replace(",", "."));
            let longitude = parseFloat(model.location.longitude.replace(",", "."));
            let altitude = parseFloat(model.location.altitude.replace(",", "."));
            let heading = parseFloat(model.heading.replace(",", "."));
            let pitch = parseFloat(model.pitch.replace(",", "."));
            let roll = parseFloat(model.roll.replace(",", "."));
            let scale = parseFloat(model.scale.replace(",", "."));
            $('#id_Nombre').val(model.name);
            $('#id_Categoria').val(model.category_object);
            $('#id_Latitud').val(latitude);
            $('#id_Longitud').val(longitude);
            $('#id_Altitud').val(altitude);
            $('#id_Heading').val(heading);
            $('#id_Pitch').val(pitch);
            $('#id_Roll').val(roll);
            $('#id_Scale').val(scale);
            id_object = model.pk;
            id_node_location = model.location.pk;
            zoomToCoordinates(latitude, longitude, altitude);// Se hace zoom a la ubicación del modelo 3D seleccionado
            KeyboardControl(true, 'objetos_czml');
            //flyAround(latitude, longitude,altitude);// funcion de paneo de la camara al rededor del objeto 3D seleccionado
            $('#form_basic').off('input').on('input', function () {// Se actualizan los valores de la interfaz de usuario al cambiar los valores de los inputs
                let latitude = parseFloat($('#id_Latitud').val().replace(",", "."));
                let longitude = parseFloat($('#id_Longitud').val().replace(",", "."));
                let altitude = parseFloat($('#id_Altitud').val().replace(",", "."));
                let heading = parseFloat($('#id_Heading').val().replace(",", "."));
                let pitch = parseFloat($('#id_Pitch').val().replace(",", "."));
                let roll = parseFloat($('#id_Roll').val().replace(",", "."));
                let scale = 0;
                if ($('#id_Scale').val() == "" || $('#id_Scale').val() == 0) {
                    console.log("Scale: " + model.scale + '=>' + $('#id_Scale').val());
                    scale = 0.5;
                } else {
                    scale = parseFloat($('#id_Scale').val().replace(",", "."));
                }
                if (!isNaN(latitude) && !isNaN(longitude) && !isNaN(altitude)) {// Se verifica que los valores de latitud, longitud y altitud sean números válidos y se actualiza en el mapa0
                    selectedTileset.position = Cesium.Cartesian3.fromDegrees(longitude, latitude, altitude);
                    const hpRoll = new Cesium.HeadingPitchRoll(
                        Cesium.Math.toRadians(heading),
                        Cesium.Math.toRadians(pitch),  // Pitch fijo
                        Cesium.Math.toRadians(roll)    // Roll fijo
                    );
                    let modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(
                        selectedTileset.position,
                        hpRoll,
                        Cesium.Ellipsoid.WGS84,
                        Cesium.Transforms.eastNorthUpToFixedFrame
                    );
                    Cesium.Matrix4.setUniformScale(modelMatrix, scale, modelMatrix);
                    selectedTileset._root.transform = modelMatrix;

                }
            });
        }
    });
}

function DetectarObjetos() {
    $('#id_save').off('click').on('click', function () {// Se guarda el modelo 3D seleccionado en la base de datos
        enviarForm('update');
        model_selected.name = $('#id_Nombre').val();
        model_selected.category_object = $('#id_Categoria').val();
        model_selected.location.longitude = $('#id_Longitud').val();
        model_selected.location.latitude = $('#id_Latitud').val();
        model_selected.location.altitude = $('#id_Altitud').val();
        model_selected.heading = $('#id_Heading').val();
        model_selected.pitch = $('#id_Pitch').val();
        model_selected.roll = $('#id_Roll').val();
        model_selected.scale = $('#id_Scale').val();
    });
    $('#id_delete').hide();
    handler.setInputAction(function (click) {// Se detecta el click en el modelo 3D y se selecciona el modelo 3D
        const pickedObject = scene.pick(click.position);
        if (Cesium.defined(pickedObject) && pickedObject.primitive) {
            selectObject(pickedObject.primitive, true);
        }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}
