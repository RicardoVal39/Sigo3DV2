/*Lista de funciones para manejar eventos de camios en el mapa
    crear camino (left_click x2 (inicio y fin))
    detectar camino (mouse_move)
    eliminar camino (right_click)
    buscar camino (SELECT)
    */

function crearCaminos(){
    $('#id_Distancia').prop('readonly', true);
    $('#id_Punto_Inicial').prop('readonly', true);
    $('#id_Punto_Final').prop('readonly', true);
    nodos_camino = [];
    handler.setInputAction(function (click) {
        if (clickMarkerTemp) {
            viewer.entities.remove(clickMarkerTemp);
        }
        const pickedObject = scene.pick(click.position);
    
        if (Cesium.defined(pickedObject) && pickedObject.id ) {
            btn_save = $('#id_save');
            btn_save.text('Crear');
            btn_save.removeClass('btn_update');
            btn_save.addClass('btn_save');
            btn_save.hide();
            
            $('#id_delete').hide();
            if(pickedObject.id.tipo === "Nodo"){
                nodes.forEach(node => {
                    if (node.pk == pickedObject.id.pk) {
                        let latitude = parseFloat(node.latitude.replace(",", "."));
                        let longitude = parseFloat(node.longitude.replace(",", "."));
                        let altitude = parseFloat(node.altitude.replace(",", "."));
                        let pk = node.pk;
                        nodos_camino.push({ pk , latitude, longitude, altitude });
                    }
                });
                if(nodos_camino.length===2){
                    if($('#id_Punto_Inicial').val()== pickedObject.id.pk ){
                        console.log("repitio nodo");
                        nodos_camino.pop();
                        console.log(nodos_camino);
                    }else{
                        console.log("Nodo final:", pickedObject.id.pk ," - " , pickedObject.id.name);    
                        $('#id_Punto_Final').val(pickedObject.id.pk);
                        id= Math.max(...Object.keys(edgesC).map(Number))+1;  
                        createPathBetweenNodes(nodos_camino,id);
                        // $('#id_save').show();
                        enviarForm('post');             
                        edges.push({
                            'pk': id,
                            'id_start_node': $('#id_Punto_Inicial').val(),
                            'id_end_node': $('#id_Punto_Final').val(),
                            'distance': $('#id_Distancia').val(),
                        });
                        // $('#id_save').text('Crear');
                        // $('#id_save').off('click').on('click', function() {
                            
                            
                        //     // edgesC[id] = 
                        // });
                        nodos_camino = [];
                    }
                }else{
                    $('#id_Punto_Final').val(0);
                    console.log("Nodo inicial:", pickedObject.id.pk ," - " , pickedObject.id.name);
                    $('#id_Punto_Inicial').val(pickedObject.id.pk);
                }       
            }
            if(pickedObject.id.tipo === "Camino"){   
                nodos_camino = [];
                $('#id_save').hide();
                $('#id_delete').show();
                $('#id_delete').off('click').on('click', function() {
                    enviarForm('delete');
                    let edgeDel = edgesC[pickedObject.id.pk];
                    edgesC[pickedObject.id.pk] = null;
                    if (edgeDel) {
                        viewer.entities.remove(edgeDel);
                    }
                    let edgeLabelDel = markers_edges[pickedObject.id.pk];
                    if (edgeLabelDel) {
                        viewer.entities.remove(edgeLabelDel);
                    }
                    $('#id_Punto_Inicial').val(0);
                    $('#id_Punto_Final').val(0);
                    $('#id_Distancia').val(0);
                    $('#id_save').text('Crear');
                    $('#id_save').off('click');
                    $('#id_save').removeClass('btn_update');
                    $('#id_save').addClass('btn_save');
                    $('#id_delete').hide();
                });
                $('#id_Punto_Inicial').val(pickedObject.id.NodoInicial);
                $('#id_Punto_Final').val(pickedObject.id.NodoFinal);
                $('#id_Distancia').val(pickedObject.id.distancia);
            }  
        } 
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}
for (let edge of edges) {
    let nodos_camino = [];

    nodes.forEach(node => {
        if (node.pk == edge.id_start_node) {
            let latitude = parseFloat(node.latitude.replace(",", "."));
            let longitude = parseFloat(node.longitude.replace(",", "."));
            let altitude = parseFloat(node.altitude.replace(",", "."));
            let pk = node.pk;
            nodos_camino.push({ pk , latitude, longitude, altitude });
        }
    });
    nodes.forEach(node => {
        if (node.pk == edge.id_end_node) {
            let latitude = parseFloat(node.latitude.replace(",", "."));
            let longitude = parseFloat(node.longitude.replace(",", "."));
            let altitude = parseFloat(node.altitude.replace(",", "."));
            let pk = node.pk;
            nodos_camino.push({ pk , latitude, longitude, altitude });
        }
    });
    createPathBetweenNodes(nodos_camino, edge.pk);
    nodos_camino =[]

}
function createPathBetweenNodes(nodes,id_edge) {
    const start = Cesium.Cartesian3.fromDegrees(nodes[0].longitude, nodes[0].latitude, nodes[0].altitude);
    const end = Cesium.Cartesian3.fromDegrees(nodes[1].longitude, nodes[1].latitude, nodes[1].altitude);
    const d = Cesium.Cartesian3.distance(start,end);
    let tempPath = viewer.entities.add({
        NodoInicial: nodes[0].pk,
        NodoFinal: nodes[1].pk,
        pk: id_edge,
        tipo: "Camino",
        distancia: d.toFixed(2),
        polyline: {
            positions: Cesium.Cartesian3.fromDegreesArrayHeights([
                nodes[0].longitude, nodes[0].latitude, nodes[0].altitude, 
                nodes[1].longitude, nodes[1].latitude, nodes[1].altitude  
            ]),
            width: 5, 
            material: new Cesium.PolylineGlowMaterialProperty({
                glowPower: 0.2, 
                color: Cesium.Color.fromCssColorString("#8B008B") 
            })
        }
    });    
    edgesC[id_edge] = tempPath;  
    // console.log(`Camino creado entre nodos: ${JSON.stringify(nodes)}`);
    // Añade un label con la distancia en el punto medio del camino
    const midpoint = Cesium.Cartesian3.midpoint(start, end, new Cesium.Cartesian3());
    $('#id_Distancia').val(d.toFixed(2));
    markers_edges[id_edge]=viewer.entities.add({
        position: midpoint,
        label: {
            text: `${d.toFixed(2)} m`, // Muestra la distancia con 2 decimales
            font: "16px sans-serif",
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM, // Ajusta la posición del label
            pixelOffset: new Cesium.Cartesian2(0, -10), // Desplaza ligeramente el texto
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 15.0)
        }
    });
}
function updateEdge(start_Node, end_Node,id_edge){
    const start = Cesium.Cartesian3.fromDegrees(start_Node.longitude, start_Node.latitude, start_Node.altitude);
    const end = Cesium.Cartesian3.fromDegrees(end_Node.longitude, end_Node.latitude, end_Node.altitude);
    const d = Cesium.Cartesian3.distance(start,end);
    edgesC[id_edge].polyline.positions = Cesium.Cartesian3.fromDegreesArrayHeights([
        start_Node.longitude, start_Node.latitude, start_Node.altitude, 
        end_Node.longitude, end_Node.latitude, end_Node.altitude  
    ]);
    edgesC[id_edge].distancia = d.toFixed(2);
}