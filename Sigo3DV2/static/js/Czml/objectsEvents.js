/*Lista de funciones para manejar eventos de los objetos 3d
    Seleccionar objeto (left_click)
    Mostrar información del objeto (mouse_move)
    buscar objeto (SELECT)
    */

let selectedTileset = null;  

function DetectarObjetos(){
    $('#id_save').off('click').on('click', function() {
        enviarForm('update');
    });
    $('#id_delete').hide();
    handler.setInputAction(function (click) {
        const pickedObject = scene.pick(click.position);
        console.log("elemento detectado",pickedObject);
        if (Cesium.defined(pickedObject) && pickedObject.primitive) {
            objectSelected = pickedObject.primitive;
            selectedTileset = pickedObject.primitive;
            models.forEach(model => {
                if (model.id_object == objectSelected.id) {
                    $('#KeyWordSearch').val(model.name);
                    $('#KeyWordSearch').trigger('input');
                    $('#info_object').hide();
                    setTimeout(() => {
                        $("#object"+model.pk).trigger('click');
                    },400);
                        let latitude = parseFloat(model.location.latitude.replace(",", "."));   
                    let longitude = parseFloat(model.location.longitude.replace(",", "."));
                    let altitude = parseFloat(model.location.altitude.replace(",", "."));
                    let heading = parseFloat(model.heading.replace(",", "."));   
                    let pitch = parseFloat(model.pitch.replace(",", "."));
                    let roll = parseFloat(model.roll.replace(",", "."));
                    let scale = parseFloat(model.scale.replace(",", "."));
                    $('#id_Nombre').val(model.name);
                    $('#id_Tipo').val(model.type);
                    $('#id_Latitud').val(latitude);
                    $('#id_Longitud').val(longitude);
                    $('#id_Altitud').val(altitude);    
                    $('#id_Heading').val(heading);
                    $('#id_Pitch').val(pitch);
                    $('#id_Roll').val(roll);   
                    $('#id_Scale').val(scale);   
                    console.log("Modelo seleccionado:", model);
                    id_object = model.pk;
                    id_node_location = model.location.pk;
                    //zoomToCoordinates(latitude, longitude,altitude);
                    KeyboardControl(true,'objetos_czml');
                    //flyAround(latitude, longitude,altitude);
                    $('#form_basic').off('input').on('input', function() {
                        let latitude = parseFloat($('#id_Latitud').val().replace(",", "."));
                        let longitude = parseFloat($('#id_Longitud').val().replace(",", "."));
                        let altitude = parseFloat($('#id_Altitud').val().replace(",", "."));
                        let heading = parseFloat($('#id_Heading').val().replace(",", "."));
                        let pitch = parseFloat($('#id_Pitch').val().replace(",", "."));
                        let roll = parseFloat($('#id_Roll').val().replace(",", "."));
                        let scale = parseFloat($('#id_Scale').val().replace(",", "."));

                        if (!isNaN(latitude) && !isNaN(longitude) && !isNaN(altitude)) {
                            objectSelected.position = Cesium.Cartesian3.fromDegrees(longitude, latitude, altitude);
                            const hpRoll = new Cesium.HeadingPitchRoll(
                                Cesium.Math.toRadians(heading), 
                                Cesium.Math.toRadians(pitch),  // Pitch fijo
                                Cesium.Math.toRadians(roll)    // Roll fijo
                            );
                            let modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(
                                objectSelected.position,
                                hpRoll,
                                Cesium.Ellipsoid.WGS84,
                                Cesium.Transforms.eastNorthUpToFixedFrame
                            );
                            Cesium.Matrix4.setUniformScale(modelMatrix,scale, modelMatrix);
                            selectedTileset._root.transform = modelMatrix;
                            model.name = $('#id_Nombre').val();
                            model.type = $('#id_Tipo').val();
                            model.location.longitude = $('#id_Longitud').val();
                            model.location.latitude = $('#id_Latitud').val();
                            model.location.altitude = $('#id_Altitud').val();
                            model.heading = $('#id_Heading').val();
                            model.pitch = $('#id_Pitch').val(); 
                            model.roll = $('#id_Roll').val();
                            model.scale = $('#id_Scale').val();
                        }
                    });
                }
            });
            
        } 
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}
