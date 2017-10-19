var slideArray = [];

window.onload = function () {  //onload function
    document.getElementById("map").addEventListener("click", addUnit);
    for (let div of document.getElementsByTagName("div")) {
        if (div.parentNode.getAttribute("class") === "colorRow") {
            div.addEventListener("click", changeColor);
        }
    }
    addButtonEventListeners(); //add event listeners for reset, delete, and clear buttons
};

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

function addButtonEventListeners() {
    document.getElementsByTagName("select")[0].addEventListener("change", function (event) { //change slide based on select dropdown
        setCurrentOption();
        if (document.getElementsByTagName("select")[0].options.length - 1 !== selectedOption) { //check if the current option is the last option
            updateMap();
        }
    });

    document.getElementById("delete").addEventListener("click", function () { //delete a slide
        clickAnimation(event.target);
        var options = Array.from(document.getElementsByTagName("select")[0].children);
        if (options.length === 1) {
            return;
        }
        slideArray.splice(selectedOption, 1); //remove the selected slide from the slide array
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
        clickAnimation(event.target);
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
        clickAnimation(event.target);
    });

    function clickAnimation(target) {
        target.style.backgroundColor = "rgba(128, 128, 128, 0.5)";
        var int = setInterval(fade, 10);
        var opacity = 0.5;
        function fade() {
            target.style.backgroundColor = "rgba(128, 128, 128, " + opacity + ")";
            opacity -= 0.01;
            if (opacity <= 0) {
                clearInterval(int);
            }
        }

    }
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


function updateMap() { //removes all units, then adds units from the slide corresponding to the selected option
    clearMap();
    for (let el of slideArray[selectedOption]) {
        el.addEventListener("mousedown", removeUnit); //add standard unit event listeners
        el.addEventListener("mousedown", startDrag);
        document.getElementById("map").appendChild(el);
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
        if (div.parentNode.getAttribute("class") === "colorRow") {
            div.style.border = "";
            div.style.width = "15vh";
            div.style.height = "15vh";
            div.style.lineHeight = "15vh";
            div.style.marginTop = "0vh";
            if (div.getAttribute("id") === "france") {
                div.style.marginLeft = "9.5vh";
            } else {
                div.style.marginLeft = "2vh";
            }
        }
    }
    event.target.style.border = "1px solid black"; //make the target div look fancy
    event.target.style.width = "16vh";
    event.target.style.height = "16vh";
    event.target.style.lineHeight = "16vh";
    event.target.style.marginLeft = (Number.parseInt(event.target.style.marginLeft) - .5) + "vh";
    event.target.style.marginTop = (Number.parseInt(event.target.style.marginTop || 0) - .5) + "vh";
}

function addUnit() { //append a new unit to the map
    if (event.target.getAttribute("class") === "unit" || !color) return; //if x is a unit or a color is not selected, then return
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
