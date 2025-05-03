function eventosRuta() {
    $('#form_basic').off('input').on('input', function () {
        var Nodo_inicial = $('#id_Nodo_Inicial').val();
        var Nodo_final = $('#id_Nodo_Final').val();
        if (Nodo_inicial != '' && Nodo_final != '') {
            ObtenerRuta();
            $('#id_Iniciar_Ruta_Normal').prop('disabled', false);
            $('#id_Iniciar_Ruta_Normal').addClass('btn_info');
            $('#id_Iniciar_Ruta_Normal').removeClass('btn_error');
            $('#id_Iniciar_Ruta_Normal').off('click').on('click', function () {
                ObtenerRuta('normal');
            });
            $('#id_Iniciar_Ruta_Dron').prop('disabled', false);
            $('#id_Iniciar_Ruta_Dron').addClass('btn_info');
            $('#id_Iniciar_Ruta_Dron').removeClass('btn_error');
            $('#id_Iniciar_Ruta_Dron').off('click').on('click', function () {
                ObtenerRuta('dron');
            });
        } else {
            $('#id_Iniciar_Ruta_Normal').prop('disabled', true);
            $('#id_Iniciar_Ruta_Normal').addClass('btn_error');
            $('#id_Iniciar_Ruta_Normal').removeClass('btn_info');
            $('#id_Iniciar_Ruta_Normal').off('click');
            $('#id_Iniciar_Ruta_Dron').prop('disabled', true);
            $('#id_Iniciar_Ruta_Dron').off('click');
            $('#id_Iniciar_Ruta_Dron').addClass('btn_error');
            $('#id_Iniciar_Ruta_Dron').removeClass('btn_info');

        }
    });
    $('#id_Actualizar_Rutas').off('click').on('click', function () {
        generarRutas();
    });
    $('#id_Nodo_Inicial').off('change').on('change', function () {
        updateNodesRoute('end');
    });

}
function updateNodesRoute(type_node) {
    let data_route = { 'function': 'start_nodes' };
    if (type_node == 'start') {
        $('#id_Nodo_Inicial').empty();
        $('#id_Nodo_Final').empty();
    } else {
        $('#id_Nodo_Final').empty();
        var Nodo_inicial = parseInt($('#id_Nodo_Inicial').val());
        data_route = { 'function': 'end_nodes', 'start_node': Nodo_inicial };
    }

    $.ajax({
        type: 'POST',
        headers: {
            'X-CSRFToken': getCSRFToken()
        },
        url: '/czml/generate_routes/',
        data: JSON.stringify(data_route),
        success: function (response) {
            if (type_node == 'start') {
                input = document.getElementById('id_Nodo_Inicial')
            } else {
                input = document.getElementById('id_Nodo_Final');
            }

            response_nodes = response.nodes;
            input.innerHTML = '<option value="">Seleccione un nodo</option>';
            Object.keys(response_nodes).forEach(node => {
                let option = document.createElement('option');
                option.value = response_nodes[node].pk;
                option.textContent = response_nodes[node].name;
                input.appendChild(option);
            });
        },
        error: function (error) {
            console.log(error);
        }
    });
}
function quitarDron() {
    Object.keys(viewer.entities._entities._array).forEach(obj => {
        if (viewer.entities._entities._array[obj].type === "dron") { viewer.entities.remove(viewer.entities._entities._array[obj]); }
    });
}
function ObtenerRuta(mode) {
    var Nodo_inicial = parseInt($('#id_Nodo_Inicial').val());
    var Nodo_final = parseInt($('#id_Nodo_Final').val());
    var data_route = { 'function': 'get', 'start_node': Nodo_inicial, 'end_node': Nodo_final };
    quitarDron();
    $.ajax({
        type: 'POST',
        headers: {
            'X-CSRFToken': getCSRFToken()
        },
        url: '/czml/generate_routes/',
        data: JSON.stringify(data_route),
        success: function (response) {
            info("Respuesta del servidor", response.message, "success", 5000);
            $('#id_Distancia').val(parseFloat(response.distance.toFixed(2)));
            if (mode == 'normal') {
                normalRoute(response.path);
            } else if (mode == 'dron') {
                firstVisionRoute(response.path);
            }

        },
        error: function (error) {
            console.log(error);
        }
    });
}
function normalRoute(path) {
    var path_length = path.length;
    var path_coordinates = [];
    var segundo = 0;
    for (var i = 0; i < path_length; i++) {
        Object.keys(nodes).forEach(node => {
            if (nodes[node].pk === path[i]) {
                console.log(nodes[node].name);
                if (i > 0) {
                    const start = Cesium.Cartesian3.fromDegrees(path_coordinates[i - 1][1], path_coordinates[i - 1][2], path_coordinates[i - 1][3]);
                    const end = Cesium.Cartesian3.fromDegrees(parseFloat(nodes[node].longitude.replace(",", ".")), parseFloat(nodes[node].latitude.replace(",", ".")), parseFloat(nodes[node].altitude.replace(",", ".")));
                    const d = Cesium.Cartesian3.distance(start, end);
                    const t = d * 14 / (10 * parseFloat($('#animacion').val()));
                    segundo += t;
                }
                path_coordinates.push([segundo, parseFloat(nodes[node].longitude.replace(",", ".")), parseFloat(nodes[node].latitude.replace(",", ".")), parseFloat(nodes[node].altitude.replace(",", "."))]);
            }
        });
    }
    console.log(path_coordinates);
    let now = new Date();
    let epochTime = now.toISOString();
    viewer.dataSources.removeAll();
    quitarDron();
    const start = Cesium.JulianDate.fromDate(new Date());
    const duration = path_coordinates[path_coordinates.length - 1][0];
    const stop = Cesium.JulianDate.addSeconds(start, duration, new Cesium.JulianDate());
    viewer.clock.startTime = start.clone();
    viewer.clock.stopTime = stop.clone();
    viewer.clock.currentTime = start.clone();
    viewer.clock.multiplier = 1.0;
    viewer.clock.clockRange = Cesium.ClockRange.CLAMPED;
    viewer.clock.shouldAnimate = true;
    const czml = [
        {
            id: "document",
            name: "CZML Path",
            version: "1.0",
            clock: {
                interval: `${epochTime}/${new Date(now.getTime() + segundo * 1000).toISOString()}`,
                currentTime: epochTime,
                multiplier: 10,
                range: "CLAMPED"
            },
        },
        {
            id: "path",
            name: 'Ruta', // Nombres de nodos en la descripción
            availability: `${epochTime}/${new Date(now.getTime() + segundo * 1000).toISOString()}`,
            path: {
                material: {
                    polylineOutline: {
                        color: { rgba: [169, 0, 0, 255] },
                        outlineColor: { rgba: [0, 0, 0, 225] },
                        outlineWidth: 5,
                    },
                },
                width: 8,
                leadTime: 10,
                trailTime: 1000,
                resolution: 5,
            },
            billboard: {
                image: "data:image/png;base64,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AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALlT/P5+DFKQRgyD4AAAAAElFTkSuQmCC",
                scale: 0.2,
                eyeOffset: { cartesian: [0.0, 0.0, -10.0] },
            },
            position: {
                epoch: epochTime,
                cartographicDegrees: path_coordinates.flat(),
            },
        },
    ];

    viewer.dataSources.add(Cesium.CzmlDataSource.load(czml)).then(dataSource => {
        viewer.trackedEntity = dataSource.entities.getById("path");
    });
}
function firstVisionRoute(path) {
    viewer.dataSources.removeAll();
    const path_length = path.length;
    const path_coordinates = [];
    let segundo = 0;

    for (let i = 0; i < path_length; i++) {
        for (const node in nodes) {
            if (nodes[node].pk === path[i]) {
                const lon = parseFloat(nodes[node].longitude.replace(",", "."));
                const lat = parseFloat(nodes[node].latitude.replace(",", "."));
                const alt = parseFloat(nodes[node].altitude.replace(",", ".")) + 0.20;

                if (i > 0) {
                    const prev = path_coordinates[i - 1];
                    const start = Cesium.Cartesian3.fromDegrees(prev[1], prev[2], prev[3]);
                    const end = Cesium.Cartesian3.fromDegrees(lon, lat, alt);
                    const distance = Cesium.Cartesian3.distance(start, end);
                    const time = distance / (10 * parseFloat($('#animacion').val()));
                    segundo += time;
                }

                path_coordinates.push([segundo, lon, lat, alt]);
                break;
            }
        }
    }

    const start = Cesium.JulianDate.fromDate(new Date());
    const duration = path_coordinates[path_coordinates.length - 1][0];
    const stop = Cesium.JulianDate.addSeconds(start, duration, new Cesium.JulianDate());

    viewer.clock.startTime = start.clone();
    viewer.clock.stopTime = stop.clone();
    viewer.clock.currentTime = start.clone();
    viewer.clock.multiplier = 1.0;
    viewer.clock.clockRange = Cesium.ClockRange.CLAMPED;
    viewer.clock.shouldAnimate = true;
    const times = path_coordinates.map(item => item[0]);
    const points = path_coordinates.map(item =>
        Cesium.Cartesian3.fromDegrees(item[1], item[2], item[3])
    );
    const delta = times[times.length - 1] - times[0];
    const firstTime = times[0];
    const lastTime = times[times.length - 1];

    const firstTangent = Cesium.Cartesian3.subtract(points[1], points[0], new Cesium.Cartesian3());
    Cesium.Cartesian3.normalize(firstTangent, firstTangent);  // Normaliza para suavidad
    Cesium.Cartesian3.multiplyByScalar(firstTangent, 1.0, firstTangent);  // Escala para controlar curvatura

    const lastTangent = Cesium.Cartesian3.subtract(points[points.length - 1], points[points.length - 2], new Cesium.Cartesian3());
    Cesium.Cartesian3.normalize(lastTangent, lastTangent);
    Cesium.Cartesian3.multiplyByScalar(lastTangent, 1.0, lastTangent);
    // Crear spline
    const positionSpline = new Cesium.CatmullRomSpline({
        times: times,
        points: points,
        firstTangent: firstTangent,
        lastTangent: lastTangent,
    });

    if(!$('#cb_corte').hasClass('on')){
        $('#cb_corte').trigger('click');
    }
    let alturaActual = 0;
    // CallbackPositionProperty
    const position = new Cesium.CallbackPositionProperty(function (time, result) {
        const splineTime = (delta * Cesium.JulianDate.secondsDifference(time, start)) / duration;
        if (splineTime < firstTime || splineTime > lastTime) return undefined;
        const position = positionSpline.evaluate(splineTime, result);
        const carto = Cesium.Cartographic.fromCartesian(position);
        let altura_plane = parseFloat(Cesium.Math.toDegrees(carto.height)/100).toFixed(2);
            
        if (altura_plane != alturaActual) {
            alturaActual = parseFloat(altura_plane).toFixed(2)
            console.log("Altura: " + altura_plane + '=>' + alturaActual);
            $('#alturaCorte').val(alturaActual-(-1.8));
            for (let primitive of viewer.scene.primitives._primitives) {
                if (primitive.tipo === 'Modelo' && primitive.clippingPlanes) {
                    primitive.clippingPlanes.get(0).distance = primitive.id === '3304544' ? altura_plane -(-8) : altura_plane -(-1.8);
                    primitive._clippingPlanes._enabled = true;
                }
            }
        }
        return positionSpline.evaluate(splineTime, result);
    }, false);

    const orientation = new Cesium.VelocityOrientationProperty(position);

    // Añadir entidad animada (modelo 3D)
    const entity = viewer.entities.add({
        type: 'dron',
        availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({ start, stop })]),
        position: position,
        orientation: orientation,
        model: {
            uri: "/static/modelo3d/CesiumDrone.glb",
            scale: 0.15,
        },
        path: {
            material: new Cesium.PolylineGlowMaterialProperty({
                glowPower: 0.1,
                color: Cesium.Color.YELLOW,
            }),
            width: 3,
            resolution: 0.01,
            leadTime: 1,
            trailTime: 2,
        },
        trackingReferenceFrame: Cesium.TrackingReferenceFrame.INERTIAL,
        viewFrom: new Cesium.Cartesian3(-8, 3, 1),
    });
    viewer.trackedEntity = entity;
}
function generarRutas() {
    info('Respuesta del servidor', 'Generando rutas...', "warning", 30000);
    $.ajax({
        type: 'POST',
        headers: {
            'X-CSRFToken': getCSRFToken()
        },
        url: '/czml/generate_routes/',
        data: JSON.stringify({ 'function': 'generate' }),
        success: function (response) {
            updateNodesRoute('start');
            info('Respuesta del servidor', 'Rutas Generadas', "success", 5000);

        },
        error: function (error) {
            info('Respuesta del servidor', error, "warning", 5000);
        }
    });
}