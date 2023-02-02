var width = 8;
var height = 8;

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
    // (Hue/Saturation) (Upper/Lower) (Left/Right) 
    var Hue_UL = 30;
    var Hue_UR = 300;
    var Hue_LL = 100;
    var Hue_LR = 200;
    
    var Saturation_UL = 100;
    var Saturation_UR = 70;
    var Saturation_LL = 50;
    var Saturation_LR = 70;

    var RGB_UL = hslToRgb(Hue_UL / 360, Saturation_UL / 100, 0.5);
    var RGB_UR = hslToRgb(Hue_UR / 360, Saturation_UR / 100, 0.5);
    var RGB_LL = hslToRgb(Hue_LL / 360, Saturation_LL / 100, 0.5);
    var RGB_LR = hslToRgb(Hue_LR / 360, Saturation_LR / 100, 0.5);

    var Influence_UL = (1 - x / (width - 1)) * (1 - y / (height - 1));
    var Influence_UR =      x / (width - 1)  * (1 - y / (height - 1));
    var Influence_LL = (1 - x / (width - 1)) *      y / (height - 1);
    var Influence_LR =      x / (width - 1)  *      y / (height - 1);

    // RGB Bilinear Interpolation
    // https://math.stackexchange.com/a/3230385
    var R = Influence_UL * RGB_UL[0] + 
            Influence_UR * RGB_UR[0] + 
            Influence_LL * RGB_LL[0] + 
            Influence_LR * RGB_LR[0];

    var G = Influence_UL * RGB_UL[1] + 
            Influence_UR * RGB_UR[1] + 
            Influence_LL * RGB_LL[1] + 
            Influence_LR * RGB_LR[1];

    var B = Influence_UL * RGB_UL[2] + 
            Influence_UR * RGB_UR[2] + 
            Influence_LL * RGB_LL[2] + 
            Influence_LR * RGB_LR[2];

    return "rgb(" + R + ", " + G + ", " + B + ")"

    // HSL Bilinear Interpolation
    // var H = Influence_UL * Hue_UL + 
    //         Influence_UR * Hue_UR + 
    //         Influence_LL * Hue_LL + 
    //         Influence_LR * Hue_LR;

    // var S = Influence_UL * Saturation_UL + 
    //         Influence_UR * Saturation_UR + 
    //         Influence_LL * Saturation_LL + 
    //         Influence_LR * Saturation_LR;

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



