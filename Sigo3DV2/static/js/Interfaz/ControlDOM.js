/* 
    lista de funciones para manejar la creacion de elementos del DOM
    Crear formulario (contexto): genera un formulario con los campos necesarios para el contexto

    Enviar formulario (accion): envia los datos del formulario al servidor
    Mostrar (id,div): muestra un div con el id especificado
    Ocultar (id,div): oculta un div con el id especificado
    Generar formulario (contexto): genera un formulario con los campos necesarios para el contexto
    Obtener token CSRF (): obtiene el token CSRF de las cookies
    Enviar formulario (accion): envia los datos del formulario al servidor
    Filtrar Czml (checkbox): filtra los elementos del mapa segun el checkbox seleccionado



*/



function closeModal() {
    $('#modalInfo').hide();
}

function consultaDatos(context, div) {
    $('.sidebar .nav-item').removeClass('active');
    if (context_act === context) {
        context_act = '';
        let container = document.getElementById('form_basic');
        container.innerHTML = '';
        $('#info_object').hide();
        $('#search_results').hide();

    } else {
        viewer.dataSources.removeAll();
        quitarDron();

        context_act = context;
        div.classList.add("active");
        generarFormulario(context);
        $('#search_results').hide();
        $('#info_object').hide();
        KeyboardControl(false);
        switch (context) {
            case 'nodos':
                DetectarNodos();
                info("Herramienta de creación de nodos", "Seleccione un nodo para editarlo o cree uno nuevo.", "info", 10000);
                break;
            case 'objetos_czml':
                DetectarObjetos();
                info("Herramienta de creación de objetos", "Busque los edificios o aulas con el buscador e interactúe con los modelos 3D.", "info", 10000);
                break;
            case 'caminos':
                crearCaminos();
                info("Herramienta de creación de caminos", "Seleccione un nodo inicial y luego uno final para crear un camino. Si desea eliminar un camino, selecciónelo y haga clic en 'Eliminar'.", "info", 10000);
                break;
            case 'rutas':
                eventosRuta();
                info("Herramienta de creación de rutas", "Si ha realizado cambios en los caminos, haga clic en 'Generar rutas'. Luego seleccione un nodo inicial, uno final y el tipo de visualización.", "info", 10000);
                break;
        }
    }
    if (clickMarkerTemp) {
        viewer.entities.remove(clickMarkerTemp);
    }

}
function mostrar(id, div) {
    $('#' + id).removeClass('d-none');
    $('#' + id).removeClass('off');
    div.classList.add("active");
    div.onclick = function () {
        ocultar(id, div);
    };
}
function ocultar(id, div) {
    $('#' + id).addClass('d-none');
    $('#' + id).addClass('off');
    div.classList.remove("active");
    div.onclick = function () {
        mostrar(id, div);
    };
}
function generarFormulario(context) {
    $('#info_object').hide();
    $('#search_results').hide();
    KeyboardControl(false);
    id_object = null;
    id_node_location = null;
    let container = document.getElementById('form_basic');
    container.innerHTML = '';
    let title = document.createElement('h3');
    title.textContent = context;
    container.appendChild(title);
    if (!forms[context]) return;

    let form = document.createElement('form');
    form.id = 'form_basic_obj';
    form.classList.add('scroll-white');
    Object.keys(forms[context]).forEach(field => {
        let label = document.createElement('label');
        label.textContent = forms[context][field].label;
        let input;
        switch (forms[context][field].type) {
            case 'select':
                input = document.createElement('select');
                let option = document.createElement('option');
                option.value = "";
                option.textContent = "Seleccionar...";
                input.appendChild(option);
                console.log(field);
                switch (field) {
                    case 'Categoria':
                    case 'Categoria_nodo':
                        Object.keys(categories).forEach(category => {
                            if (categories[category].context !== context) return;
                            let option = document.createElement('option');
                            option.value = categories[category].pk;
                            option.textContent = categories[category].name;
                            input.appendChild(option);
                        });
                        break;
                    case 'Nodo_Inicial':
                        updateNodesRoute('start');
                        break;
                    case 'Nodo_Final':
                        break;
                    case 'Nodo':
                    default:
                        Object.keys(nodes).forEach(node => {
                            let option = document.createElement('option');
                            option.value = nodes[node].pk;
                            option.textContent = nodes[node].pk + " - " + nodes[node].name;
                            input.appendChild(option);
                        });
                        break;
                }
                break;
            case 'file':
                input = document.createElement('input');
                input.type = 'file';
                break;
            case 'number':
                input = document.createElement('input');
                input.type = 'number';
                break;

            case 'button':
                input = document.createElement('button');
                input.type = 'button';
                input.classList.add('btn_form');
                input.classList.add(forms[context][field].class);
                input.textContent = forms[context][field].label;
                break;
            default:
                input = document.createElement('input');
                input.type = forms[context][field];
                break;
        }

        input.name = field;
        input.id = "id_" + field;

        form.appendChild(label);
        form.appendChild(input);
        form.appendChild(document.createElement('br'));
    });
    let button_delete = document.createElement('button');
    button_delete.id = 'id_delete';
    button_delete.classList.add('btn_form');
    button_delete.classList.add('btn_delete');
    button_delete.textContent = 'Eliminar';
    button_delete.type = 'button';

    let button = document.createElement('button');
    button.id = 'id_save';
    button.classList.add('btn_form');
    button.classList.add('btn_save');
    button.textContent = 'Guardar';
    button.type = 'button';

    form.appendChild(button);
    form.appendChild(button_delete);
    container.appendChild(form);
    if (context === 'nodos' || context === 'objetos_czml') {
        $('#id_Latitud')[0].step = parseFloat($('#direccion').val()) / 1000000;
        $('#id_Longitud')[0].step = parseFloat($('#direccion').val()) / 1000000;
        $('#id_Altitud')[0].step = parseFloat($('#altura').val());
    }
    if (context === 'objetos_czml') {
        $('#id_Heading')[0].step = parseFloat($('#altura').val());
        $('#id_Pitch')[0].step = parseFloat($('#altura').val());
        $('#id_Roll')[0].step = parseFloat($('#altura').val());
        $('#id_Scale')[0].step = parseFloat($('#altura').val());

    }
    let search_container = document.getElementById('search_results');
    search_container.innerHTML = '';
    let search_title = document.createElement('h3');
    input = document.createElement('input');
    input.name = "KeyWordSearch";
    input.id = "KeyWordSearch";
    input.type = "text";
    input.placeholder = "Buscar...";
    input.classList.add('search_input');
    let timeout = null;
    switch (context) {
        case 'nodos':
            search_title.textContent = 'Búsqueda de nodos';
            search_container.appendChild(search_title);
            search_container.appendChild(input);
            div = document.createElement('div');
            div.id = 'search_results_div';
            div.classList.add('search_results_div');
            div.classList.add('scroll-black');
            search_container.appendChild(div);
            $('#KeyWordSearch').off('input').on('input', function () {
                clearTimeout(timeout);
                let searchTerm = $(this).val().toLowerCase();
                timeout = setTimeout(() => {
                    $.ajax({
                        url: urls[context],
                        type: 'POST',
                        headers: {
                            'X-CSRFToken': getCSRFToken()
                        },
                        data: JSON.stringify({
                            'function': 'search',
                            'keyword': searchTerm
                        }),
                        success: function (response) {
                            $('#search_results_div').empty();
                            const nodes_category = {};
                            response.nodes.forEach(node => {
                                if (!nodes_category[node.category_node_name]) {
                                    nodes_category[node.category_node_name] = [];
                                }
                                nodes_category[node.category_node_name].push(node);
                            });
                            console.log(nodes_category);
                            let tabs = '<div class="floors-tabs scroll-black">';
                            Object.keys(nodes_category).sort().forEach(category => {
                                tabs += `<button class="floor-tab scroll-black" data-floor="${category}">${category}</button>`;
                            });
                            tabs += '</div>';
                            let floorRoomsHTML = '<div id="nodes_by_category" class="scroll-black"></div>';
                            let info_object = `
                                            ${tabs}
                                            ${floorRoomsHTML}
                                        `;
                            $('#search_results_div').append(info_object);
                            const showRooms = (floor) => {
                                const container = document.getElementById('nodes_by_category');
                                const roomsHTML = nodes_category[floor].map(r => `
                                                    <div class="search_result_item_node" id="room${r.pk}" onclick="consultarNodo(${r.pk}, ${r.longitud}, ${r.latitud}, ${r.altitud})">
                                                        <h3>${r.name}</h3>
                                                    </div>
                                                `).join('');
                                container.innerHTML = `${roomsHTML}`;
                            };
                            $('#btn_return').off('click').on('click', function () {
                                $('#info_object').hide();
                                $('#search_results').show();
                            });
                            document.querySelectorAll('.floor-tab').forEach(button => {
                                button.addEventListener('click', () => {
                                    document.querySelectorAll('.floor-tab').forEach(btn => btn.classList.remove('active'));
                                    button.classList.add('active');
                                    showRooms(button.dataset.floor);
                                });
                            });
                            const firstFloor = Object.keys(nodes_category).sort()[0];
                            document.querySelector(`.floor-tab[data-floor="${firstFloor}"]`).classList.add('active');
                            showRooms(firstFloor);
                            $('#search_results').show();
                        },
                        error: function (xhr, status, error) {
                            console.error("Error en la petición:", status, error);
                        }
                    });
                }, 150);
            });
            $('#KeyWordSearch').trigger('input');
            break;
        case 'objetos_czml':
            search_title.textContent = 'Búsqueda de objetos';
            search_container.appendChild(search_title);
            search_container.appendChild(input);
            div = document.createElement('div');
            div.id = 'search_results_div';
            div.classList.add('search_results_div');
            div.classList.add('scroll-black');
            search_container.appendChild(div);
            timeout = null;

            $('#KeyWordSearch').off('input').on('input', function () {
                clearTimeout(timeout);
                let searchTerm = $(this).val().toLowerCase();
                timeout = setTimeout(() => {
                    $.ajax({
                        url: urls[context],
                        type: 'POST',
                        headers: {
                            'X-CSRFToken': getCSRFToken()
                        },
                        data: JSON.stringify({
                            'function': 'search',
                            'keyword': searchTerm
                        }),
                        success: function (response) {
                            $('#search_results_div').empty();
                            console.log(response.objects);
                            response.objects.forEach(item => {
                                let resultHTML = `
                                <div id="object${item.id}" class="search_result_item">
                                    <img src="${item.image_object}" class="search_result_image">
                                    <div class="search_result_content">
                                    <h3>${item.name_presentation}</h3>
                                    <span><b>ID:</b> ${item.id}</span>
                                    <span><b>Ref:</b> ${item.name}</span>
                                    <span><b>Categoria:</b> ${item.category_object}</span>
                                    <span><b>Aulas:</b> ${item.count_rooms}</span>
                                    <a href="/admin/czml/czmlobject/${item.id}/change/" target="_blank">Editar información</a>
                                    </div>
                                </div>
                                `;
                                $('#search_results_div').append(resultHTML);
                                $('#object' + item.id).off('click').on('click', function () {
                                    viewer.scene.primitives._primitives.forEach(entity => {
                                        console.log((entity.id_object === item.id) ? item.id : 0);
                                        if (entity.id_object === item.id) {
                                            selectObject(entity, false)
                                        }
                                    });
                                    if (item.count_rooms > 0) {
                                        const floors = {};
                                        item.rooms.forEach(room => {
                                            if (!floors[room.floor]) {
                                                floors[room.floor] = [];
                                            }
                                            floors[room.floor].push(room);
                                        });
                                        let tabs = '<div class="floors-tabs">';
                                        Object.keys(floors).sort().forEach(floor => {
                                            tabs += `<button class="floor-tab" data-floor="${floor}">PISO ${floor}</button>`;
                                        });
                                        tabs += '</div>';
                                        let floorRoomsHTML = '<div id="rooms_by_floor" class="scroll-black"></div>';
                                        let info_object = `
                                            <div class="subtitle_object">
                                                <p>${item.name}</p> <span>${item.id}</span>
                                            </div>
                                            <h3>${item.name_presentation}</h3>
                                            <p>${item.description}</p>
                                            ${tabs}
                                            ${floorRoomsHTML}
                                            <button id="btn_return" class="btn_form btn_return">Volver</button>
                                        `;

                                        let container = document.getElementById('info_object');
                                        container.innerHTML = '';
                                        $('#info_object').append(info_object);
                                        $('#search_results').hide();
                                        $('#info_object').show();
                                        const showRooms = (floor) => {
                                            const container = document.getElementById('rooms_by_floor');
                                            const roomsHTML = floors[floor].map(r => `
                                                <div class="room-item" id="room${r.id}" onclick="zoomToCoordinatesRoom(${r.location.latitud}, ${r.location.longitud}, ${r.location.altitud}, ${r.orientation})">
                                                    <img src="${r.url}" class="search_result_image">
                                                    <div class="search_result_content">
                                                        <h3>${r.name}</h3>
                                                        <span><b>ID:</b> ${r.id}</span>
                                                        <span><b>Tipo:</b> ${r.type_room}</span>
                                                    </div>
                                                </div>
                                                `).join('');
                                            container.innerHTML = `${roomsHTML}`;
                                        };
                                        $('#btn_return').off('click').on('click', function () {
                                            $('#info_object').hide();
                                            $('#search_results').show();
                                        });
                                        document.querySelectorAll('.floor-tab').forEach(button => {
                                            button.addEventListener('click', () => {
                                                document.querySelectorAll('.floor-tab').forEach(btn => btn.classList.remove('active'));
                                                button.classList.add('active');
                                                showRooms(button.dataset.floor);
                                            });
                                        });
                                        const firstFloor = Object.keys(floors).sort()[0];
                                        document.querySelector(`.floor-tab[data-floor="${firstFloor}"]`).classList.add('active');
                                        showRooms(firstFloor);
                                    }
                                });
                            });
                            $('#search_results').show();
                        },
                        error: function (xhr, status, error) {
                            console.error("Error en la petición:", status, error);
                        }
                    });
                }, 150);
            });
            $('#KeyWordSearch').trigger('input');
            break;
        case 'caminos':
            search_title.textContent = 'Elije el nodo inicial';
            search_container.appendChild(search_title);
            search_container.appendChild(input);
            div = document.createElement('div');
            div.id = 'search_results_div';
            div.classList.add('search_results_div');
            div.classList.add('scroll-black');
            search_container.appendChild(div);
            $('#KeyWordSearch').off('input').on('input', function () {
                let searchTerm = $(this).val().toLowerCase();
                $('#search_results_div').empty();
                if (searchTerm.length > 0) {
                    Object.keys(nodes).forEach(node => {
                        if (nodes[node].name.toLowerCase().includes(searchTerm)) {
                            let resultItem = document.createElement('div');
                            resultItem.textContent = nodes[node].name;

                            resultItem.classList.add('search_result_item');
                            resultItem.onclick = function () {
                                id_object = nodes[node].pk;
                                id_node_location = nodes[node].pk_location;
                                zoomToCoordinates(nodes[node].location.latitude, nodes[node].location.longitude, nodes[node].location.altitude);
                                $('#id_Latitud').val(nodes[node].location.latitude);
                                $('#id_Longitud').val(nodes[node].location.longitude);
                                $('#id_Altitud').val(nodes[node].location.altitude);
                                $('#id_Nombre').val(nodes[node].name);
                                $('#id_Categoria').val(nodes[node].category.pk);
                                $('#id_Tipo').val(nodes[node].type);
                                $('#id_Heading').val(nodes[node].heading);
                                $('#id_Pitch').val(nodes[node].pitch);
                                $('#id_Roll').val(nodes[node].roll);
                                $('#id_Scale').val(nodes[node].scale);
                            };
                            div.appendChild(resultItem);
                        }
                    });
                }
            });
            break;
        case 'rutas':
            search_title.textContent = 'Elije el nodo inicial';
            search_container.appendChild(search_title);
            search_container.appendChild(input);
            div = document.createElement('div');
            div.id = 'search_results_div';
            div.classList.add('search_results_div');
            div.classList.add('scroll-black');
            search_container.appendChild(div);
            $('#KeyWordSearch').off('input').on('input', function () {
                let searchTerm = $(this).val().toLowerCase();
                $('#search_results_div').empty();
                if (searchTerm.length > 0) {

                }
            });
            break;
    }

}

function getCSRFToken() {
    let cookieValue = null;
    let cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim();
        if (cookie.startsWith('csrftoken=')) {
            cookieValue = cookie.substring(10);
            break;
        }
    }
    return cookieValue;
}
function enviarForm(action) {
    let form = document.getElementById('form_basic_obj');
    let data = {};
    let formData = new FormData(form);
    for (let key of formData.keys()) {
        data[key] = formData.get(key);
    }
    switch (action) {
        case 'delete':
            data['action'] = 'delete';
            method_form = 'DELETE';
            break;
        case 'update':
            data['action'] = 'update';
            method_form = 'PUT';
            break;
        case 'post':
            data['action'] = 'post';
            method_form = 'POST';
            break;

    }
    if (id_node_location) {
        if (context_act === 'objetos_czml') {
            data['pk'] = id_object;
            data['pk_location'] = id_node_location;
        } else if (context_act === 'nodos') {
            data['pk'] = id_node_location;
        }
    }
    data['function'] = 'save';
    console.log(data);
    $.ajax({
        url: urls[context_act],
        type: method_form,
        headers: {
            'X-CSRFToken': getCSRFToken()
        },
        data: JSON.stringify(data),
        success: function (response) {
            info("Respuesta del servidor", response.message, "success", 10000);
        },
        error: function (xhr, status, error) {
            console.error("Error en la petición:", status, error);
        }
    });
}
function filtrarCzml(checkbox) {
    if (checkbox) {
        if (checkbox.classList.contains('on')) {
            checkbox.classList.replace('on', 'off');
        } else {
            checkbox.classList.replace('off', 'on');
        }
    }
    if ($('#cb_objetos').hasClass('on')) {
        objects = viewer.scene.primitives._primitives;
        for (let objeto of objects) {
            if (objeto.tipo === 'Modelo') {
                objeto.show = true;
            }
        }
    } else {
        objects = viewer.scene.primitives._primitives;
        for (let objeto of objects) {
            if (objeto.tipo === 'Modelo') {
                objeto.show = false;
            }
        }
    }
    if ($('#cb_nodos').hasClass('on')) {
        for (let nodo of nodes) {
            markers[nodo.pk].show = true;
        }
        changeNodes();
    } else {
        for (let nodo of nodes) {
            markers[nodo.pk].show = false;
        }
    }
    if ($('#cb_shadows').hasClass('on')) {
        viewer.shadows = true;
    } else {
        viewer.shadows = false;
    }
    if ($('#cb_caminos').hasClass('on')) {
        for (let edge of edges) {
            edgesC[edge.pk].show = true;
        }
    } else {
        for (let edge of edges) {
            edgesC[edge.pk].show = false;
        }
    }
    if ($('#cb_corte').hasClass('on')) {
        $('#alturaCorte').off('input').on('input', function () {
            if (this.value === "") {
                this.value = 0;
            }
            alturaCorte = parseFloat(this.value);
            for (let primitive of viewer.scene.primitives._primitives) {
                if (primitive.tipo === 'Modelo') {
                    if (primitive.clippingPlanes) {
                        console.log(primitive.clippingPlanes.get(0).distance);
                        if (primitive.id_object === "3304544") {
                            
                            primitive.clippingPlanes.get(0).distance = alturaCorte + 6.5;
                        } else {
                            primitive.clippingPlanes.get(0).distance = alturaCorte;
                        }
                        primitive._clippingPlanes._enabled = true;
                    }
                }
            }
            alturaCorte += 1.7;
            viewer.entities.values.forEach(entity => {
                let pos;
                if (entity.position && Cesium.defined(entity.position.getValue)) {
                    pos = entity.position.getValue(viewer.clock.currentTime);
                } else if (entity.polyline && entity.polyline.positions && Cesium.defined(entity.polyline.positions.getValue)) {
                    let positions = entity.polyline.positions.getValue(viewer.clock.currentTime);
                    if (positions.length > 0) {
                        const alturas = positions.map(p => Cesium.Cartographic.fromCartesian(p).height);
                        const altMax = Math.max(...alturas);
                        if (altMax > alturaCorte) {
                            entity.show = false;
                            return;
                        }
                    }
                }
            
                if (pos) {
                    const carto = Cesium.Cartographic.fromCartesian(pos);
                    if (carto.height > alturaCorte) {
                        entity.show = false;
                        return;
                    }
                }
            
                entity.show = true;
            });
        });
        $('#alturaCorte').trigger('input');
    } else {
        $('#alturaCorte').off('input');
        for (let primitive of viewer.scene.primitives._primitives) {
            if (primitive instanceof Cesium.Cesium3DTileset && primitive.clippingPlanes) {
                primitive._clippingPlanes._enabled = false;
            }
        }
    }

}
filtrarCzml()