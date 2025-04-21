/*Lista de funciones para manejar eventos de nodos en CesiumJS
      Activos al seleccionar el contexto nodo
        DetectarNodos (LEFT_CLICK):
            Selecciona un nodo en caso de que exista uno en la posición clickeada
            Si no hay un nodo, crea un marcador temporal en la posición clickeada
        edicionNodo (SELECT):
            Muestra la información del nodo seleccionado en el formulario
            Si el nodo no existe, añade la información del marcador temporal
        updateNodo (SELECT):
            Actualiza la información del nodo seleccionado
        createMarker (SELECT):
            Crea un nuevo nodo en la posición clickeada
        filterMarkersByCategory (SELECT):
            Filtra los nodos por categoría
        consultar de nodo (SELECT)
        configuraciones:
          Filtro de nodo por categoria (SELECT)
          Cambiar imagen de nodo (SELECT)
    
*/


function updateOptions() {
    Object.keys(categories).forEach(category => {
        if (categories[category].count > 0) {
            $('#category-' + categories[category].pk).show();
        } else {
            $('#category-' + categories[category].pk).hide();
        }
    });
}

function filterMarkersByCategory(checkbox, pk) {
    if (checkbox.classList.contains('on')) {
        checkbox.classList.replace('on', 'off');
    } else {
        checkbox.classList.replace('off', 'on');
    }
    Object.keys(categories).forEach(category => {
        if (categories[category].pk == pk) {
            categories[category].show = !categories[category].show;
        }
    });
    changeNodes();
}

function changeNodes() {
    Object.keys(categories).forEach(category => {
        if (categories[category].context == 'nodos') {
            Object.keys(markers).forEach(marker => {
                if (markers[marker].category == categories[category].name) {
                    markers[marker].show = categories[category].show;
                }
            });
        }
    });
}

function updateNodo(id_nodo, name, newUrl, category, latitude, longitude, altitude) {
    let nodoActual = (markers[id_nodo]) ? markers[id_nodo] : clickMarkerTemp;
    nodoActual.position = Cesium.Cartesian3.fromDegrees(longitude, latitude, altitude);
    nodoActual.billboard.image = newUrl;
    nodoActual.category = category;
    nodoActual.label.text._value = (category == 21) ? "" : name;
    edges.forEach(edge => {
        if (edge.id_start_node == id_nodo || edge.id_end_node == id_nodo) {
            let nodes_ed = [];
            if (edge.id_start_node == id_nodo) {
                nodes.forEach(node => {
                    if (node.pk == edge.id_end_node) {
                        nodes_ed.push({
                            'pk': edge.id_start_node,
                            'latitude': parseFloat(latitude.replace(",", ".")),
                            'longitude': parseFloat(longitude.replace(",", ".")),
                            'altitude': parseFloat(altitude.replace(",", "."))
                        });
                        nodes_ed.push({
                            'pk': edge.id_end_node,
                            'latitude': parseFloat(node.latitude.replace(",", ".")),
                            'longitude': parseFloat(node.longitude.replace(",", ".")),
                            'altitude': parseFloat(node.altitude.replace(",", "."))
                        });
                    }
                });
            } else {
                if (edge.id_end_node == id_nodo) {
                    nodes.forEach(node => {
                        if (node.pk == edge.id_start_node) {
                            nodes_ed.push({
                                'pk': edge.id_start_node,
                                'latitude': parseFloat(node.latitude.replace(",", ".")),
                                'longitude': parseFloat(node.longitude.replace(",", ".")),
                                'altitude': parseFloat(node.altitude.replace(",", "."))
                            });
                            nodes_ed.push({
                                'pk': edge.id_end_node,
                                'latitude': parseFloat(latitude.replace(",", ".")),
                                'longitude': parseFloat(longitude.replace(",", ".")),
                                'altitude': parseFloat(altitude.replace(",", "."))
                            });
                        }
                    });
                }
            }

            let start = Cesium.Cartesian3.fromDegrees(nodes_ed[0].longitude, nodes_ed[0].latitude, nodes_ed[0].altitude);
            let end = Cesium.Cartesian3.fromDegrees(nodes_ed[1].longitude, nodes_ed[1].latitude, nodes_ed[1].altitude);

            let d = Cesium.Cartesian3.distance(start, end);
            $.ajax({
                type: "PUT",
                url: urls['caminos'],
                data: JSON.stringify({
                    'Punto_Inicial': nodes_ed[0].pk,
                    'Punto_Final': nodes_ed[1].pk,
                    'Distancia': d.toFixed(2),
                }),
                success: function (response) {
                    info('Respuesta del servidor', response.message, 'success', 'caminos');
                },
                error: function (xhr, status, error) {
                    info('Error en la solicitud', error, 'error', 'caminos');
                }
            });
            edgesC[edge.pk].polyline.positions = Cesium.Cartesian3.fromDegreesArrayHeights([
                nodes_ed[0].longitude, nodes_ed[0].latitude, nodes_ed[0].altitude,
                nodes_ed[1].longitude, nodes_ed[1].latitude, nodes_ed[1].altitude
            ]),
                edgesC[edge.pk].distancia = d.toFixed(2);
            markers_edges[edge.pk].label.text._value = `${d.toFixed(2)} m`;
        }
    });
}


function createMarker(id_node, longitude, latitude, altitude, name, url, category) {
    longitude = parseFloat(longitude.replace(",", "."));
    latitude = parseFloat(latitude.replace(",", "."));
    altitude = parseFloat(altitude.replace(",", "."));
    label = (category == 'Camino') ? "" : name;
    width_node = (category == 'Camino') ? 15 : 20;
    distance = (category == 'Camino') ? 200 : 500;
    let marker = viewer.entities.add({
        pk: id_node,
        name: name,
        category: category,
        position: Cesium.Cartesian3.fromDegrees(longitude, latitude, altitude),
        tipo: "Nodo",
        billboard: {
            image: url,
            width: width_node,
            height: width_node,
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, distance)

        },
        label: {
            text: `${label}`,
            font: "15pt sans-serif", // Fuente moderna y más grande
            fillColor: Cesium.Color.WHITE, // Texto blanco
            outlineColor: Cesium.Color.BLACK, // Borde negro para mejor contraste
            outlineWidth: 0, // Borde más grueso
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            showBackground: true,  // Agregar fondo semitransparente
            backgroundColor: new Cesium.Color(0, 0, 0, 0.2), // Fondo negro con transparencia
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -40), // Ajustar mejor el texto
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, distance)
        }
    });
    Object.keys(categories).forEach(c => {
        if (categories[c].name === category) {
            categories[c].count += 1;
        }
    });
    //   zoomToCoordinates(latitude, longitude, altitude);
    marker.show = true;
    markers[id_node] = marker;
    updateOptions();
}
for (let nodo of nodes) {
    createMarker(nodo.pk, nodo.longitude, nodo.latitude, nodo.altitude, nodo.name, nodo.category_icon, nodo.category)
}
function edicionNodo(valor, cartesian) {//true si es cambio de nodo, false si es creción de nodo
    btn_save = $('#id_save');
    if (valor) {
        id_node_location = valor;
        btn_save.text('Actualizar');
        btn_save.removeClass('btn_save');
        btn_save.addClass('btn_update');
        btn_save.off('click').on('click', function () {
            enviarForm('update');
        });
        $('#id_delete').show();
        $('#id_delete').off('click').on('click', function () {
            enviarForm('delete');
            delete markers[valor];
            let nodoDel = viewer.entities.values.find(entidad => entidad.pk === valor);
            if (nodoDel) {
                viewer.entities.remove(nodoDel);
            }
            edges.forEach(edge => {
                if (edge.id_start_node == valor || edge.id_end_node == valor) {
                    let edgeDel = edgesC[edge.pk];
                    if (edgeDel) {
                        viewer.entities.remove(edgeDel);
                    }
                    let edgeLabelDel = markers_edges[edge.pk];
                    if (edgeLabelDel) {
                        viewer.entities.remove(edgeLabelDel);
                    }
                }
            });
        });
        nodes.forEach(node => {
            if (node.pk == valor) {
                let latitude = parseFloat(node.latitude.replace(",", "."));
                let longitude = parseFloat(node.longitude.replace(",", "."));
                let altitude = parseFloat(node.altitude.replace(",", "."));
                $('#id_Nombre').val(node.name);
                $('#id_Categoría').val(node.category_pk);
                $('#id_Latitud').val(latitude);
                $('#id_Longitud').val(longitude);
                $('#id_Altitud').val(altitude);
                $('#form_basic').off('input').on('input', function () {
                    let selectedCategory = $('#id_Categoría').val();  // Obtener la categoría seleccionada
                    let name = $('#id_Nombre').val();
                    latitude = $('#id_Latitud').val();
                    longitude = $('#id_Longitud').val();
                    altitude = $('#id_Altitud').val();
                    let category = categories.find(cat => cat.pk == selectedCategory);  // Buscar la categoría
                    let newUrl = category.icon;
                    node.name = name;
                    node.longitude = longitude;
                    node.latitude = latitude;
                    node.altitude = altitude;
                    node.category = category.name;
                    node.category_pk = category.pk;
                    updateNodo(node.pk, name, newUrl, selectedCategory, latitude, longitude, altitude);
                });
                //zoomToCoordinates(latitude, longitude, altitude);
                // flyAround(latitude, longitude, altitude);
            }
        });
    } else {
        $('#id_delete').hide();
        btn_save.removeClass('btn_update');
        btn_save.addClass('btn_save');
        if (!Cesium.defined(cartesian)) {
            return; // Si no se encuentra un punto, no hace nada
        }
        // Convertir a coordenadas geográficas
        let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        let longitude = Cesium.Math.toDegrees(cartographic.longitude);
        let latitude = Cesium.Math.toDegrees(cartographic.latitude);
        let altitude = cartographic.height+1.5;
        $('#id_Nombre').val('Temp');
        $('#id_Categoría').val(21);
        $('#id_Latitud').val(latitude);
        $('#id_Longitud').val(longitude);
        $('#id_Altitud').val(altitude);
        // Crea un nuevo marcador temporal en el punto clickeado
        clickMarkerTemp = viewer.entities.add({
            position: cartesian,
            billboard: {
                image: categories.find(cat => cat.pk == 21).icon,
                width: 32,
                height: 32
            },
            label: {
                text: `Temp`,
                font: "15pt sans-serif",
                fillColor: Cesium.Color.WHITE,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 3,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                showBackground: true,
                backgroundColor: new Cesium.Color(0, 0, 0, 0.2),
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                pixelOffset: new Cesium.Cartesian2(0, -40), // Ajustar mejor el texto
                distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 150.0)
            }
        });
        $('#form_basic').off('input').on('input', function () {
            let selectedCategory = $('#id_Categoría').val();  // Obtener la categoría seleccionada
            let name = $('#id_Nombre').val();
            latitude = $('#id_Latitud').val();
            longitude = $('#id_Longitud').val();
            altitude = $('#id_Altitud').val();
            let category = categories.find(cat => cat.pk == selectedCategory);  // Buscar la categoría
            if (category) {
                let newUrl = category.icon;
                updateNodo(null, name, newUrl, selectedCategory, latitude, longitude, altitude);
            }
        });

        $('#id_save').text('Crear');
        $('#id_save').off('click').on('click', function () {
            id = Math.max(...Object.values(nodes).map(n => Number(n.pk))) + 1;
            id_node_location = id;
            enviarForm('post');
            let name = $('#id_Nombre').val();
            let selectedCategory = $('#id_Categoría').val();  // Obtener la categoría seleccionada
            let category = categories.find(cat => cat.pk == selectedCategory);
            latitude = $('#id_Latitud').val();
            longitude = $('#id_Longitud').val();
            altitude = $('#id_Altitud').val();
            if (clickMarkerTemp) {
                viewer.entities.remove(clickMarkerTemp);
            }
            let cartesian = Cesium.Cartesian3.fromDegrees(longitude, latitude, altitude);
            edicionNodo(id, cartesian)
            createMarker(id, longitude, latitude, altitude, name, category.icon, category.name)
            nodes.push({
                'pk': id,
                'name': name,
                'category': category.name,
                'category_pk': category.pk,
                'category_icon': category.icon,
                'longitude': longitude,
                'latitude': latitude,
                'altitude': altitude,
            });
            Object.keys(categories).forEach(category => {
                if (categories[category].pk == selectedCategory) {
                    categories[category].count = categories[category].count + 1;
                }
            });

        });
    }

}

// Evento de clic para seleccionar un nodo
function DetectarNodos() {
    KeyboardControl(true, 'nodos');
    handler.setInputAction(function (click) {
        if (clickMarkerTemp) {
            viewer.entities.remove(clickMarkerTemp);
        }
        const pickedObject = scene.pick(click.position);
        if (Cesium.defined(pickedObject)) {
            if (pickedObject.id && pickedObject.id.tipo === "Nodo") {
                objectSelected = pickedObject.id;
                id_object = objectSelected.pk;
                edicionNodo(id_object);
                return;
            }
            const cartesian = viewer.scene.pickPosition(click.position);
            if (Cesium.defined(cartesian)) {
                id_object = 0;
                edicionNodo(false, cartesian);
                return;
            }
        }
        const cartesian = viewer.scene.globe.pick(
            viewer.camera.getPickRay(click.position),
            viewer.scene
        );

        if (Cesium.defined(cartesian)) {
            id_object = 0;
            edicionNodo(false, cartesian);  // Crear nodo en el suelo
        }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}