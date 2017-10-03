window.onload = function () {
    var mapStyle = document.getElementById("map").style;
    mapStyle.height = window.innerHeight;
    window.addEventListener("resize", function () {
        mapStyle.height = window.innerHeight;
    });
    document.getElementById("map").addEventListener("click", addUnit);
    var divs = document.getElementsByTagName("div");
    for (var i = 0; i < divs.length; i++) {
        divs[i].addEventListener("click", changeColor);
    }
};

var color = "";

function changeColor(event) {
    color = window.getComputedStyle(event.target, null).getPropertyValue("background-color");
    var divs = document.getElementsByTagName("div");
    for (var i = 0; i < divs.length; i++) {
        divs[i].style.border = "";
        divs[i].style.marginLeft = "2vh";
    }
    event.target.style.border = "1px solid black";
    event.target.style.marginLeft = "3vh";
}

function addUnit() {
    if (event.target.x || !color) return;
    var unit = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    var svg = document.getElementById("map");
    pt = svg.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;
    var svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
    unit.setAttribute("x", svgP.x);
    unit.setAttribute("y", svgP.y);
    var width;
    var height;
    if (event.ctrlKey || event.metaKey) {
        width = 25;
        height = 10;
    } else {
        width = 14;
        height = 14;
    }
    unit.setAttribute("width", width);
    unit.setAttribute("height", height);
    unit.setAttribute("fill", color);
    document.getElementById("map").appendChild(unit);

    unit.addEventListener("mousedown", function () { //remove unit
        event.stopPropagation();
        if (event.ctrlKey) {
            event.target.parentNode.removeChild(event.target);
        }
    });

    var oldPt;
    unit.addEventListener("mousedown", function () { //start dragging
        event.stopPropagation();
        svg.addEventListener("mousemove", drag);
        oldPt = svg.createSVGPoint();
        oldPt.x = event.clientX;
        oldPt.y = event.clientY;
        unit.addEventListener("mouseup", function () { //stop dragging
            event.stopPropagation();
            svg.removeEventListener("mousemove", drag);
        });
    });


    function drag() { //drag function
        var svg = document.getElementById("map");
        var oldSvgP = oldPt.matrixTransform(svg.getScreenCTM().inverse());
        var newPt = svg.createSVGPoint();
        newPt.x = event.clientX;
        newPt.y = event.clientY;
        var newSvgP = newPt.matrixTransform(svg.getScreenCTM().inverse());
        unit.setAttribute("x", (Number.parseFloat(unit.getAttribute("x")) + newSvgP.x - oldSvgP.x));
        unit.setAttribute("y", Number.parseFloat(unit.getAttribute("y")) + newSvgP.y - oldSvgP.y);
        oldPt.x = event.clientX;
        oldPt.y = event.clientY;
    }
}

