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
    var selectedOption = 0;
    var mapArray = [];
    document.getElementsByTagName("select")[0].addEventListener("change", function (event) {
        selectedOption = Number.parseInt(event.target.options[event.target.selectedIndex].value);
        if (document.getElementsByTagName("select")[0].options.length - 1 !== selectedOption) {
            clearMap();
            for (var i = 0; i < mapArray[selectedOption].length; i++) {
                document.getElementById("map").appendChild(mapArray[selectedOption][i]);
                mapArray[selectedOption][i].addEventListener("mousedown", removeUnit);
                mapArray[selectedOption][i].addEventListener("mousedown", startDrag);
            }
        }
    });
    document.getElementById("delete").addEventListener("click", function () {
        mapArray.splice(selectedOption, 1);
        clearMap();
        for (var i = 0; i < mapArray[selectedOption - 1].length; i++) {
            document.getElementById("map").appendChild(mapArray[selectedOption + 1][i]);
        }
        var myNode = document.getElementsByTagName("select")[0];
        while (myNode.firstChild) {
            myNode.removeChild(myNode.firstChild);
        }
        optionIndex = -1;
        while(optionIndex < selectedOption + 2) {
            var option = appendOption();
            if (optionIndex == selectedOption) {
                option.setAttribute("selected", "selected");
            }
            
        }
    });
    document.getElementById("save").addEventListener("click", function () {
        save();
        if (document.getElementsByTagName("select")[0].options.length - 1 === selectedOption) {
            appendOption();
        }
        var options = document.getElementsByTagName("select")[0];
        for (var i = 0; i < options.length; i++) {
            if (options[i].getAttribute("selected") === "selected") {
                options[i].setAttribute("selected", "");
            }
        }
        document.getElementsByTagName("select")[0].options[document.getElementsByTagName("select")[0].length - 1].setAttribute("selected", "selected");
        selectedOption = Number.parseInt(document.getElementsByTagName("select")[0].options[document.getElementsByTagName("select")[0].selectedIndex].value);
    });
    document.getElementById("clear").addEventListener("click", function () {
        clearMap();
        for (var i = 0; i < mapArray[0].length; i++) {
            document.getElementById("map").appendChild(mapArray[0][i]);
        }
        var temp = mapArray[0];
        mapArray = [];
        mapArray.push(temp);
        var options = document.getElementsByTagName("select")[0];
        for (var i = options.length - 1; i >= 1; i--) {
            options[i].parentNode.removeChild(options[i]);
        }
        document.getElementsByTagName("select")[0].options[0].setAttribute("selected", "selected");
        selectedOption = 0;
        optionIndex = 0;
    });
    function save() {
        var entry = [];
        var mapElements = document.getElementById("map").children;
        for (var i = 0; i < mapElements.length; i++) {
            if (mapElements[i].className.baseVal.toString() === "unit") {
                entry.push(mapElements[i].cloneNode(false));
            }
        }
        mapArray[selectedOption] = entry;
    }
};



var color = "";

function clearMap() {
    var mapElements = document.getElementById("map").children;
    for (var i = mapElements.length - 1; i >= 0; i--) {
        if (mapElements[i].className.baseVal.toString() === "unit") {
            document.getElementById("map").removeChild(mapElements[i]);
        }
    }
}

var optionIndex = 0;
function appendOption() {
    var option = document.createElement("option");
    option.setAttribute("value", ++optionIndex);
    option.innerHTML = optionIndex;
    document.getElementsByTagName("select")[0].appendChild(option);
    return option;
}

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
    unit.setAttribute("class", "unit");
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
    unit.addEventListener("mousedown", removeUnit);
    unit.addEventListener("mousedown", startDrag);
    document.getElementById("map").appendChild(unit);
}

function removeUnit() { //remove unit
    if (event.ctrlKey) {
        event.target.parentNode.removeChild(event.target);
    }
}

var oldPt;
function startDrag() { //start dragging
    if (event.ctrlKey) return;
    var unit = event.target;
    var svg = document.getElementById("map");
    svg.addEventListener("mousemove", drag);
    oldPt = svg.createSVGPoint();
    oldPt.x = event.clientX;
    oldPt.y = event.clientY;
    unit.addEventListener("mouseup", function () { //stop dragging
        event.stopPropagation();
        svg.removeEventListener("mousemove", drag);
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

};



