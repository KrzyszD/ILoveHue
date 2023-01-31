var width = 6;
var height = 6;

var movableCorners = false;

var len = width * height;
var tbl = document.getElementById("base");

// https://stackoverflow.com/a/14644462
for (let y = 0; y < height; y++) {
    const tr = tbl.insertRow();
    for (let x = 0; x < width; x++) {
        const td = tr.insertCell();
        

        // The color square that will move
        const newSquare = document.createElement("div");

        newSquare.classList.add("colorSquare");
        newSquare.classList.add("square");
        newSquare.draggable = false;

        if (!(!movableCorners && (x === 0 || x === width - 1) && (y === 0 || y === height - 1))) {
            newSquare.draggable = true;
            newSquare.addEventListener("dragstart", drag);
        } else {
            newSquare.innerHTML = "&#11044";
        }

        newSquare.id = "square" + "tile" + (x + y * width);
        newSquare.dataset.counter = (x + y * width);
        newSquare.style.background = calcHSL(x, y);


        // Grid tile that holds the color Squares
        const newTile = document.createElement("div");

        newTile.classList.add("tile");
        newTile.classList.add("square");

        if (!(!movableCorners && (x === 0 || x === width - 1) && (y === 0 || y === height - 1))) {
            newTile.addEventListener("dragover", allowDrop);
            newTile.addEventListener("drop", drop);
        }
        
        newTile.appendChild(newSquare);
        newTile.id = "tile" + (x + y * width);
        newTile.dataset.counter = (x + y * width);

        td.appendChild(newTile);
    }
}

function calcHSL(x, y){ 
    // (Upper/Lower) (Left/Right) (Hue/Saturation)
    var ULH = 0;
    var URH = 300;
    var LLH = 100;
    var LRH = 200;
    
    var ULS = 100;
    var URS = 80;
    var LLS = 50;
    var LRS = 100;

    var ULRGB = hslToRgb(ULH / 360, ULS / 100, 0.5);
    var URRGB = hslToRgb(URH / 360, URS / 100, 0.5);
    var LLRGB = hslToRgb(LLH / 360, LLS / 100, 0.5);
    var LRRGB = hslToRgb(LRH / 360, LRS / 100, 0.5);

    // RGB Bilinear Interpolation
    // https://math.stackexchange.com/a/3230385
    var R = (1 - x / (width - 1)) * (1 - y / (height - 1)) * ULRGB[0] + 
                 x / (width - 1)  * (1 - y / (height - 1)) * URRGB[0] + 
            (1 - x / (width - 1)) *      y / (height - 1)  * LLRGB[0] + 
                 x / (width - 1)  *      y / (height - 1)  * LRRGB[0];

    var G = (1 - x / (width - 1)) * (1 - y / (height - 1)) * ULRGB[1] + 
                 x / (width - 1)  * (1 - y / (height - 1)) * URRGB[1] + 
            (1 - x / (width - 1)) *      y / (height - 1)  * LLRGB[1] + 
                 x / (width - 1)  *      y / (height - 1)  * LRRGB[1];

    var B = (1 - x / (width - 1)) * (1 - y / (height - 1)) * ULRGB[2] + 
                 x / (width - 1)  * (1 - y / (height - 1)) * URRGB[2] + 
            (1 - x / (width - 1)) *      y / (height - 1)  * LLRGB[2] + 
                 x / (width - 1)  *      y / (height - 1)  * LRRGB[2];

    return "rgb(" + R + ", " + G + ", " + B + ")"

    // HSL Bilinear Interpolation
    // var H = (1 - x / (width - 1)) * (1 - y / (height - 1)) * ULH + 
    //              x / (width - 1)  * (1 - y / (height - 1)) * URH + 
    //         (1 - x / (width - 1)) *      y / (height - 1)  * LLH + 
    //              x / (width - 1)  *      y / (height - 1)  * LRH;

    // var S = (1 - x / (width - 1)) * (1 - y / (height - 1)) * ULS + 
    //              x / (width - 1)  * (1 - y / (height - 1)) * URS + 
    //         (1 - x / (width - 1)) *      y / (height - 1)  * LLS + 
    //              x / (width - 1)  *      y / (height - 1)  * LRS;

    // return "hsl(" + H + ", " + S + "%, 50%)"
}

// https://stackoverflow.com/a/9493060
function hslToRgb(h, s, l){
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        var hue2rgb = function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function allowDrop(ev) {
    ev.preventDefault();
    ev.dataTransfer.dropEffect = "move";
}

function drag(ev) {
    ev.dataTransfer.setData("id", ev.target.id);
    ev.dataTransfer.setData("source", ev.target.parentElement.id);
}

function drop(ev) {
    ev.preventDefault();

    var sourceTile = document.getElementById(ev.dataTransfer.getData("source"));
    var targetTile = document.getElementById(ev.target.parentElement.id); 

    if (sourceTile == null){
        return;
    }

    targetTile.removeChild(ev.target);
    sourceTile.appendChild(ev.target);

    var colorTile = ev.dataTransfer.getData("id");
    targetTile.appendChild(document.getElementById(colorTile));

    checkOrder();
}

function checkOrder(){

    var ordered = document.getElementById("ordered");
    ordered.style.visibility = "visible";

    var tiles = document.getElementsByClassName("tile");
    for (var i = 0; i < tiles.length; i++){
        if (tiles[i].dataset.counter != tiles[i].firstChild.dataset.counter){
            ordered.style.visibility = "hidden";
            break;
        }
    }
}



