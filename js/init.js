function print(x) {
    console.log(x);
}

function init() {
    video = document.getElementById("webcam");
    canvas = document.getElementById("capture");
    canvas_a = document.getElementById("analyse");
    ctx_a = canvas_a.getContext('2d');
    ctx = canvas.getContext('2d');
    output = document.getElementById("output");

    navigator.getUserMedia =
        navigator.getUserMedia 
        || navigator.webkitGetUserMedia 
        || navigator.mozGetUserMedia 
        || navigator.msGetUserMedia 
        || navigator.oGetUserMedia;
    
    if (navigator.getUserMedia) {       
        navigator.getUserMedia({video: true}, handleVideo, videoError);
    }
    
    function handleVideo(stream) {
        var source;
        if (window.webkitURL) {

            source = window.webkitURL.createObjectURL(stream);

        } else {

            source = stream; // Opera and Firefox
        }
        video.src = source;
    }
    
    function videoError(e) {
        print("videoError():");
        print(e);
    }
}

function drawline(ctx, x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function circle(x, y, r) {
    ctx_a.beginPath();
    ctx_a.arc(x, y, r, 0, 2 * Math.PI, false);
    ctx_a.fillStyle = 'white';
    ctx_a.fill();
    ctx_a.lineWidth = 5;
    ctx_a.strokeStyle = '#003300';
    ctx_a.stroke();
}

function distance(x1, y1, x2, y2) {
    var a = x1 - x2
    var b = y1 - y2
    return Math.sqrt(a * a + b * b) 
}

function Node(x, y) {
    this.x = x;
    this.y = y;
    this.voisins = new Array();
    this.centerX = 0;
    this.centerY = 0;
    this.length = 0;
}

function ajouterVoisin(nodes, node, epsilonNode) {
    var voisin = false
    for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i]
        var d = distance(n.x, n.y, node.x, node.y)
        if (d < epsilonNode) {
            nodes[i].voisins.push(node);
            voisin = true;
            break;
        }
    }
    if (!voisin) {
        nodes.push(node)
    }
}

function analyze(data) {
    function isItPlain(x, y) {
        var a1 = get(data, x, y)
        var a2 = get(data, x - 1, y)
        var a3 = get(data, x + 1, y)
        var a4 = get(data, x, y - 1)
        var a5 = get(data, x, y + 1)
        var a6 = get(data, x - 1, y - 1)
        var a7 = get(data, x + 1, y + 1)
        var a8 = get(data, x - 1, y + 1)
        var a9 = get(data, x + 1, y - 1)
        return (data[a1] + data[a2] + data[a3] + data[a4] + data[a5]
               + data[a6] + data[a7] + data[a8] + data[a9]) / 9 > 50 
    }
    var deltaY = 10;
    var deltaX = 10;
    var epsilonNode = 100;
    var Y1 = 0;
    var Y2 = 0;
    var plain = 0;
    var empty = 0;
    var total = 0;
    var nodes = new Array();
    for (y = 2; y < canvas.height; y = y + deltaY) {
        for (x = 2; x < canvas.width; x = x + deltaX) {
            total += 1;
            var length = 3
            if (isItPlain(x, y)) {
                plain += 1;
                // circle(x, y, 3);
                var node = new Node(x, y);
                ajouterVoisin(nodes, node, epsilonNode);
            } else {
                empty += 1;
            }
        }
    }
    var maxLength = 0;
    for (var i in nodes) {
        var n = nodes[i];
        var v = n.voisins
        var sx = 0;
        var sy = 0;
        for (var j in v) {
            var nv = v[j];
            sx += nv.x;
            sy += nv.y;
        }
        var x = sx / v.length;
        var y = sy / v.length;
        nodes[i].centerX = x;
        nodes[i].centerY = y;
        var ln = v[v.length - 1];
        n.length = distance(n.x, n.y, ln.x, ln.y) / 2
        maxLength = Math.max(n.length, maxLength)
    }
    output.innerHTML = "\\begin{tikzpicture}[shorten >=1pt,auto,node distance=3cm, thick]\n"
    output.innerHTML += "\\tikzstyle\{main\}=\[circle,fill=blue\!20,draw,font=\\sffamily\\Large\\bfseries, minimum size=4mm\]\n\n";
    var outputTxt = "";
    for (var i in nodes) {
        var n = nodes[i];
        circle(n.centerX, n.centerY, maxLength);
        var x = parseFloat((n.centerX / 50).toFixed(1));
        var y = parseFloat((n.centerY / 50).toFixed(1));
        outputTxt += "\\node[main] (" + i + ") at (" + x + ","+ y + ") {" +  i + "};\n"
    }
    output.innerHTML += outputTxt;
    output.innerHTML += '\\end{tikzpicture}'
}

function clear(canvas, ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function greyscale(pixelData) {
    var bytesPerPixel = 4;
    
    for(var y = 0; y < canvas.height; y++) {
        for(var x = 0; x < canvas.width; x++) {
            // Get the index of the first byte of the pixel.
            var startIdx = (y * bytesPerPixel * canvas.width) + (x * bytesPerPixel);

            // Get the RGB values.
            var red = pixelData[startIdx];
            var green = pixelData[startIdx + 1];
            var blue = pixelData[startIdx + 2];

            // Convert to grayscale.  An explanation of the ratios
            // can be found here: http://en.wikipedia.org/wiki/Grayscale
            var grayScale = (red * 0.3) + (green * 0.59) + (blue * .11);  
            
            // Set each RGB value to the same grayscale value.
            pixelData[startIdx] = grayScale;
            pixelData[startIdx + 1] = grayScale;
            pixelData[startIdx + 2] = grayScale;
        }
    }
}

function get(data, x, y) {
    return (y * canvas.width * 4) + (x * 4)
}

function convolution(data, m, x, y) {
    var somme = 0;
    for (i = 0; i < m.length; i++) {
        for (j = 0; j < m[0].length; j++) {
            var val;
            var a = x - i + 1;
            var b = y - j + 1;
            if (a < 0 || b < 0 || b > canvas.height || a > canvas.width)
                val = 0;
            else {
                var id = get(data, a, b);
                val = data[id];
            }
            somme += val * m[i][j];
        }
    }
    return somme;
}

function cloneTab(obj) {
    var copy = new Uint8ClampedArray(obj.length);
    for (var i = 0; i < obj.length; i++) {
        copy[i] = obj[i];
    }
    return copy
}

function contour(imageData) {

    var data = imageData.data
    var data2 = cloneTab(data)

    //sobel transform
    var m1 = [[1, 2, 1], [0, 0, 0], [-1, -2, -1]];
    var m2 = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];

    var a = 0;
    var b = 0;
    var c = 0;

    for (var y = 0; y < canvas.height; y++) {
        for (var x = 0; x < canvas.width; x++) {
            var id = get(data, x, y);
            var somme1 = convolution(data, m1, x, y);
            var somme2 = convolution(data, m2, x, y);
            var somme = Math.sqrt(somme1 * somme1 + somme2 * somme2);
            if (somme > 255) 
                somme = 255
            else if (somme < 0)
                somme = 0
            data2[id] = somme;
            data2[id + 1] = somme;
            data2[id + 2] = somme;
        }
    }
    for (var i in data2) {
        imageData.data[i] = data2[i]
    }
}

function invert(data) {
    var min = 0;
    var max = 255;
    var mid = max / 2;
    for (var y = 0; y < canvas.height; y++) {
        for (var x = 0; x < canvas.width; x++) {
            var id = get(data, x, y);
            var val = data[id];

            if (data[id] < mid) {
                data[id] = max - val;
                data[id + 1] = max - val; 
                data[id + 2] = max - val;
            } else {
                data[id] = min + val;
                data[id + 1] = min + val;
                data[id + 2] = min + val;
            }    
        }
    }
}

function clicked() {
    ctx.drawImage(video, 0, 0, 500, 375);
    imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    greyscale(imageData.data)
    contour(imageData);
    //invert(imageData.data);
    ctx.putImageData(imageData, 0, 0);
    try {
        analyze(imageData.data);
    } catch (err) {
        alert("Erreur lors de l'analyse, centez le dessin du graphe");
    }
}

