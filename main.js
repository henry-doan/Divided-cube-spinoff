/********************************************************
 * See tutorial at:
 * http://www.petercollingridge.appspot.com/3D-tutorial
*********************************************************/

var backgroundColour = color(255, 255, 255);
var nodeColour = color(40, 168, 107);
var edgeColour = color(34, 68, 204);
var nodeSize = 8;
var edgeThickness = 2;
var showNodes = false;

var createCuboid = function(x, y, z, w, h, d) {
    var nodes = [[x,   y,   z  ],
                 [x,   y,   z+d],
                 [x,   y+h, z  ],
                 [x,   y+h, z+d],
                 [x+w, y,   z  ],
                 [x+w, y,   z+d],
                 [x+w, y+h, z  ],
                 [x+w, y+h, z+d]];
    var edges = [[0, 1], [1, 3], [3, 2], [2, 0],
                 [4, 5], [5, 7], [7, 6], [6, 4],
                 [0, 4], [1, 5], [2, 6], [3, 7]];
    return { 'nodes': nodes, 'edges': edges };
};

// Find the weighted average of two vectors with weight of w
var findWeightedAverage = function(v1, v2, w) {
    var v = [];
    var w2 = 1 - w;

    for (var i = 0; i < v1.length; i++) {
       v.push(v1[i] * w + v2[i] * w2);
    }
    
    return v;
};

// Push item to array in hash accessed by key
var specialPush = function(hash, key, item) {
    if (hash[key]) {
        hash[key].push(item);
    } else {
        hash[key] = [item];
    }
};

var divideShape = function(obj) {
    var nodes = [];
    var edges = [];
    
    // Mapping of old nodes to new nodes
    var newNodes = {};
    
    for (var i = 0; i < obj.edges.length; i++) {
        var n1 = obj.edges[i][0];
        var n2 = obj.edges[i][1];
        var p1 = obj.nodes[n1];
        var p2 = obj.nodes[n2];
        
        var n = nodes.length;
        specialPush(newNodes, n1, n);
        specialPush(newNodes, n2, n + 1);
        
        var node1 = findWeightedAverage(p1, p2, 0.7);
        var node2 = findWeightedAverage(p1, p2, 0.3);

        nodes.push(node1);
        nodes.push(node2);
        edges.push([n, n + 1]);
    }
    
    //debug(newNodes);
    
    // Add new edges
    for (var n in newNodes) {
        var nodeArray = newNodes[n];
        var n = nodeArray.length;
        if (n > 1) {
            for (var i = 0; i < n; i++) {
                edges.push([nodeArray[i], nodeArray[(i + 1) % n]]);
            }   
        }
    }
    
    return { 'nodes': nodes, 'edges': edges };
};

var cube = createCuboid(-120, -120, -120, 240, 240, 240);

for (var i = 0; i < 3; i++) {
    cube = divideShape(cube);
}

var objects = [cube];

// Rotate shape around the z-axis
var rotateZ3D = function(theta, nodes) {
    var sin_t = sin(theta);
    var cos_t = cos(theta);
    
    for (var n=0; n<nodes.length; n++) {
        var node = nodes[n];
        var x = node[0];
        var y = node[1];
        node[0] = x * cos_t - y * sin_t;
        node[1] = y * cos_t + x * sin_t;
    }
};

var rotateY3D = function(theta, nodes) {
    var sin_t = sin(theta);
    var cos_t = cos(theta);
    
    for (var n=0; n<nodes.length; n++) {
        var node = nodes[n];
        var x = node[0];
        var z = node[2];
        node[0] = x * cos_t - z * sin_t;
        node[2] = z * cos_t + x * sin_t;
    }
};

var rotateX3D = function(theta, nodes) {
    var sin_t = sin(theta);
    var cos_t = cos(theta);
    
    for (var n=0; n<nodes.length; n++) {
        var node = nodes[n];
        var y = node[1];
        var z = node[2];
        node[1] = y * cos_t - z * sin_t;
        node[2] = z * cos_t + y * sin_t;
    }
};

rotateX3D(20, cube.nodes);
rotateY3D(30, cube.nodes);

var draw = function() {
    background(backgroundColour);
    var nodes, edges;
    
    // Draw edges
    strokeWeight(edgeThickness);
    
    for (var obj = 0; obj < objects.length; obj++) {
        nodes = objects[obj].nodes;
        edges = objects[obj].edges;

        for (var e = 0; e < edges.length; e++) {
            var n0 = edges[e][0];
            var n1 = edges[e][1];
            var node0 = nodes[n0];
            var node1 = nodes[n1];
            var midZ = (node0[2] + node1[2]);
            var p = (midZ + 400) / 800;
            var c = lerpColor(edgeColour, backgroundColour, p);
            
            //stroke(c);
            stroke(edgeColour);
            line(node0[0], node0[1], node1[0], node1[1]);
        }   
    }

    // Draw nodes
    if (showNodes) {
        fill(nodeColour);
        noStroke();
        for (var obj = 0; obj < objects.length; obj++) {
            nodes = objects[obj].nodes;
    
            for (var n = 0; n < nodes.length; n++) {
                var node = nodes[n];
                ellipse(node[0], node[1], nodeSize, nodeSize);
            }
        }   
    }

};

var mouseDragged = function() {
    var dx = mouseX - pmouseX;
    var dy = mouseY - pmouseY;
    
    for (var obj = 0; obj < objects.length; obj++) {
        var nodes = objects[obj].nodes;
        rotateY3D(dx, nodes);
        rotateX3D(dy, nodes);
    }
};

translate(200, 200);
