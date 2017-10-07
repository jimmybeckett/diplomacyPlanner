var selectedOption = 0; //programmatically represents the option currently selected
function setCurrentOption() { //set selectedOption to the currently selected option
    var select = document.getElementsByTagName("select")[0];
    selectedOption = Number.parseInt(select.options[select.selectedIndex].value);
}
function setOption(optionVal) { //set selectedOption to a specified option
    var options = Array.from(document.getElementsByTagName("select")[0].children);
    for (let el of options) {
        if (el.getAttribute("selected") === "selected") { //if an option is selected
            el.removeAttribute("selected"); //deselect it
        }
        if (el.getAttribute("value") === optionVal.toString()) { //if an option has value OptionVal
            el.setAttribute("selected", "selected"); //select it
        }
    }
    setCurrentOption();
}

var slideArray = [];

window.onload = function () {  //onload function
    var map = document.getElementById("map");
    map.style.height = window.innerHeight; //set height, width sets automatically in proportion to height
    map.addEventListener("resize", function () {
        map.style.height = window.innerHeight;
    });
    map.addEventListener("click", addUnit);
    for (let div of document.getElementsByTagName("div")) {
        div.addEventListener("click", changeColor);
    }
    addButtonEventListeners(); //add event listeners for reset, delete, and clear buttons
};

function updateMap() { //removes all units, then adds units from the slide corresponding to the selected option
    clearMap();
    for (let el of slideArray[selectedOption]) {
        el.addEventListener("mousedown", removeUnit); //add standard unit event listeners
        el.addEventListener("mousedown", startDrag);
        document.getElementById("map").appendChild(el);
    }
}

function addButtonEventListeners() {
    document.getElementsByTagName("select")[0].addEventListener("change", function (event) { //change slide based on select dropdown
        setCurrentOption();
        if (document.getElementsByTagName("select")[0].options.length - 1 !== selectedOption) { //check if the current option is the last option
            updateMap();
        }
    });

    document.getElementById("delete").addEventListener("click", function () { //delete a slide
        slideArray.splice(selectedOption, 1); //remove the selected slide from the slide array
        var options = Array.from(document.getElementsByTagName("select")[0].children);
        options[options.length - 1].parentNode.removeChild(options[options.length - 1]);
        setOption(selectedOption - 1);
        updateMap();
    });

    document.getElementById("save").addEventListener("click", function () { //save a slide
        save();
        if (document.getElementsByTagName("select")[0].options.length - 1 === selectedOption) { //check if the current option is the last option
            appendOption();
        }
        setOption(selectedOption + 1);
    });

    document.getElementById("reset").addEventListener("click", function () { //clear all slides except the 0th
        setOption(0);
        updateMap();
        slideArray.splice(1); //remove all but the first element
        var options = Array.from(document.getElementsByTagName("select")[0]);
        for (let i = options.length - 1; i >= 1; i--) {
            options[i].parentNode.removeChild(options[i]);
        }
        optionIndex = 0; //so next time "save" is clicked the next option will be 1
    });
}

function save() { //add a new slide to the slideArray
    var entry = [];
    for (let el of document.getElementById("map").children) {
        if (el.className.baseVal.toString() === "unit") {
            entry.push(el.cloneNode(false)); //add unit to the new entry
        }
    }
    slideArray[selectedOption] = entry; //add the new entry into the slideArray
}

var color = "";

function clearMap() { //remove all units from the map
    var children = Array.from(document.getElementById("map").children);
    for (let i = 0; i < children.length; i++) {
        if (children[i].className.baseVal.toString() === "unit") {
            document.getElementById("map").removeChild(children[i]);
        }
    }
}

var optionIndex = 0;
function appendOption() { //add a new option to the select list, increase the option number by 1
    var option = document.createElement("option");
    option.setAttribute("value", ++optionIndex); //set option to option + 1, and increment option
    option.innerHTML = optionIndex;
    document.getElementsByTagName("select")[0].appendChild(option);
}

function changeColor(event) { //change the color of units being placed
    color = window.getComputedStyle(event.target, null).getPropertyValue("background-color"); //set color to the color of the element clicked
    for (var div of document.getElementsByTagName("div")) { //set all divs to basic appearance
        div.style.border = "";
        div.style.marginLeft = "2vh";
    }
    event.target.style.border = "1px solid black"; //make the target div look fancy
    event.target.style.marginLeft = "3vh";
}

function addUnit() { //append a new unit to the map
    if (event.target.x || !color) return; //if x is a rectange (event.target.x === true) or a color is not selected, then return
    var unit = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    var svg = document.getElementById("map");
    pt = svg.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;
    var svgP = pt.matrixTransform(svg.getScreenCTM().inverse()); //turn screen coordinates (in px) into SVG coordinates
    unit.setAttribute("x", svgP.x);
    unit.setAttribute("y", svgP.y);
    unit.setAttribute("class", "unit");
    var width;
    var height;
    if (event.ctrlKey || event.metaKey) { //make unit a fleet
        width = 25;
        height = 10;
    } else { //make unit an army
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
    if (event.ctrlKey) { //Prevents both dragging and removing
        event.target.parentNode.removeChild(event.target);
    }
}

var oldPt;
function startDrag() { //start dragging
    if (event.ctrlKey) return; //Prevents both dragging and removing
    var unit = event.target;
    var svg = document.getElementById("map");
    svg.addEventListener("mousemove", drag);
    oldPt = svg.createSVGPoint(); //oldPt is the last known location of the mouse
    oldPt.x = event.clientX;
    oldPt.y = event.clientY;
    unit.addEventListener("mouseup", function () { //stop dragging
        svg.removeEventListener("mousemove", drag);
    });
    function drag() { //drag function
        var svg = document.getElementById("map");
        var oldSvgPt = oldPt.matrixTransform(svg.getScreenCTM().inverse()); //turn screen coordinates (in px) into SVG coordinates
        var newPt = svg.createSVGPoint(); //place where unit has just been dragged
        newPt.x = event.clientX;
        newPt.y = event.clientY;
        var newSvgP = newPt.matrixTransform(svg.getScreenCTM().inverse());
        unit.setAttribute("x", (Number.parseFloat(unit.getAttribute("x")) + newSvgP.x - oldSvgPt.x)); //transform unit in the x direction the difference between old and new points
        unit.setAttribute("y", Number.parseFloat(unit.getAttribute("y")) + newSvgP.y - oldSvgPt.y); //transform unit in the y direction
        oldPt.x = event.clientX; //set last known location to current location
        oldPt.y = event.clientY;
    }
};



