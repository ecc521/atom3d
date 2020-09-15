//import * as BABYLON from 'babylonjs';
window.periodicTable = require("./periodicTable.js").elements

periodicTable[28].additional =
`
Discovered During: Ancient Times<br>
Abundance in Universe: ${6e-6}%<br>
Abundance on Earth: 0.0068%<br>
Protons: ${periodicTable[28].number}<br>
Electrons: ${periodicTable[28].number}<br>
Valence Electrons: ${periodicTable[28].shells[periodicTable[28].shells.length - 1]}<br>
Isotopes: Both Cu-63 and Cu-65 are stable.<br>
Neutrons: Varies, most commonly 34 or 36.<br>

Uses:
Copper conducts heat and electricity EXTREMELY well (behind only silver)<br>
Therefore, due to it's reasonable cost, is used heavily in electrical circuits and motors<br>
- The cheaper, but significantly less conductive Aluminum is often used as an alternative. <br>
Copper has been a component of coined currencies, including that of the United States.<br>
Copper is also frequently used in alloys for jewelry, <br>
<a style="color: white" href="https://periodictable.com/Properties/A/UniverseAbundance.v.log.html" target="_blank">Abundance Source</a><br>
`

var canvas = document.getElementById("renderCanvas"); // Get the canvas element
var engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine

let genCanvas = document.createElement("canvas")
let ctx = genCanvas.getContext("2d")
function createText(text = "Electron", fontSize = 10, backgroundColor="#000000", textColor="#FFFFFF", font = "Arial") {
    genCanvas.height = fontSize * 10
    genCanvas.width = Math.ceil(ctx.measureText(text).width) * 30
    ctx.font = fontSize + "px " + font
    ctx.clearRect(0,0,genCanvas.width,genCanvas.height)
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, genCanvas.width, genCanvas.height)
    ctx.scale(-1,-1)
    ctx.fillStyle = textColor
    ctx.fillText(text, genCanvas.width / -2, genCanvas.height / -2)
    return genCanvas.toDataURL("img/png")
}

let startIndex = 28

window.electronPairing = true
window.countForDistance = periodicTable[startIndex].shells
window.paused = false

var createScene = function () {
    var scene = new BABYLON.Scene(engine);

    // Setup camera
    var camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 0, BABYLON.Vector3.Zero(), scene);
    camera.setPosition(new BABYLON.Vector3(-25, 50, -45));
    camera.attachControl(canvas, true);

    // Add lights to the scene
    var light1 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(1, 1, 0), scene);
    var light1 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(-0.8, -1, 0), scene);


    var nucleus = BABYLON.Mesh.CreateSphere("nucleus", 16, 4, scene);
	nucleus.position = new BABYLON.Vector3(0, 0, 0);
    var material = new BABYLON.StandardMaterial("nucleusmaterial", scene);
    nucleus.material = material;
    material.diffuseTexture = new BABYLON.Texture(createText("Nucleus", 100, "#884400"), scene);

    let electrons = []
    countForDistance.forEach((value, index) => {

        let offsetArray = []

        if (!electronPairing) {
            for (let i=0;i<value;i++) {
                offsetArray.push(2 * Math.PI * (i/value))
            }
        }
        else {
            let maxForDistance = [2, 8, 18, 32, 32, 32, 32]
            maxForDistance.length = countForDistance.length
            maxForDistance[maxForDistance.length - 1] = Math.min(maxForDistance[maxForDistance.length - 1], 8)
            if (maxForDistance.length > 1) {
                maxForDistance[maxForDistance.length - 2] = Math.min(maxForDistance[maxForDistance.length - 2], 18)
            }

            let noPairs = maxForDistance[index]/2
            for (let i=0;i<noPairs;i++) {
                offsetArray.push(2 * Math.PI * (i/noPairs))
            }
            let pairs = noPairs
            for (let i=0;i<pairs;i++) {
                offsetArray.push(2 * Math.PI * (i/noPairs) + (Math.PI * 0.05))
            }
            offsetArray = offsetArray.reverse()
        }

        for (let i=0;i<value;i++) {
            var electron = BABYLON.Mesh.CreateSphere("electron", 16, 0.7, scene);
            electron.distance = 3*(index+1) + 2
            electron.offset = offsetArray.pop()
            electron.speed = 20/(index+1)**2
            electron.randomness = 0.15
            electron.material = new BABYLON.StandardMaterial("electronmaterial", scene);
            electron.material.emissiveColor = new BABYLON.Color3(0, .5, 0.5)
            electron.material.diffuseTexture = new BABYLON.Texture(createText("Electron", 100, "#008888", "#000000"), scene);
            electron.parent = nucleus;
            electrons.push(electron)
        }
    })



    // Animations
    var alpha = 0;
    scene.beforeRender = function () {
        if (window.paused) {return}

        electrons.forEach((electron) => {
		    electron.position = new BABYLON.Vector3(electron.distance * Math.sin(electron.offset+alpha*electron.speed) + Math.random() * electron.randomness, electron.parent.position.y + Math.random() * electron.randomness, electron.distance * Math.cos(electron.offset+alpha*electron.speed) + Math.random() * electron.randomness);
        })

        alpha += 0.005;
    };

    return scene;
}


var scene = createScene(); //Call the createScene function

engine.runRenderLoop(function () { // Register a render loop to repeatedly render the scene
    scene.render();
});


window.addEventListener("resize", function () { // Watch for browser/canvas resize events
    engine.resize();
});









//Some UI.
let pause = document.createElement("button")
pause.id = "pause"
pause.innerHTML = "Pause"
pause.addEventListener("click", function() {
    window.paused = !window.paused
    if (window.paused) {pause.innerHTML = "Play"}
    else {pause.innerHTML = "Pause"}
})
document.body.appendChild(pause)


let selector = document.createElement("select")
selector.id = "selector"
periodicTable.forEach((element, index) => {
    let option = document.createElement("option")
    if (index === startIndex) {option.selected = "selected"}
    option.value = index
    option.innerHTML = element.name
    selector.appendChild(option)
})
document.body.appendChild(selector)
selector.addEventListener("change", function() {
    let index = Number(selector.value)
    let element = periodicTable[index]
    setInfo(index)
    window.countForDistance = element.shells
    scene = createScene()
})


let infoWindow = document.createElement("div")
infoWindow.id = "infoWindow"
document.body.appendChild(infoWindow)


function setInfo(index) {
    let element = periodicTable[index]
    let info =
`
Name: ${element.name}<br>
Symbol: ${element.symbol}<br>
Atomic Number: ${element.number}<br>
Atomic Mass: ${element.atomic_mass}<br>
Shells: ${element.shells.join(", ")}<br>
Orbitals (Not Shown): ${element.electron_configuration}<br>
Discovered By/In: ${element.discovered_by}<br>
Appearance: ${element.appearance}<br>
Category: ${element.category}<br>
Period: ${element.period}<br>
Melting Point: ${element.melt}°K<br>
Boiling Point: ${element.boil}°K<br>
Density: ${element.density}g/cm<sup>3</sup> (Room Temp)<br>
Phase: ${element.phase} (Room Temp)<br>
Source for <a style="color:white" href="https://github.com/Bowserinator/Periodic-Table-JSON" target="blank">General Data</a><br>
${element.additional?"<br>Additional Data: <br>" + element.additional:""}
`
    infoWindow.innerHTML = info
}
setInfo(startIndex)

let toggleInfo = document.createElement("button")
toggleInfo.id = "toggleInfo"
toggleInfo.innerHTML = "Hide Info"
toggleInfo.addEventListener("click", function() {
    if (infoWindow.style.display === "none") {
        infoWindow.style.display = ""
        toggleInfo.innerHTML = "Hide Info"
    }
    else {
        infoWindow.style.display = "none"
        toggleInfo.innerHTML = "Show Info"
    }
})
document.body.appendChild(toggleInfo)



let togglePairing = document.createElement("button")
togglePairing.id = "togglePairing"
togglePairing.innerHTML = "Disable Electron Pairing"
togglePairing.addEventListener("click", function() {
    window.electronPairing = !window.electronPairing
    scene = createScene()
    if (window.electronPairing) {togglePairing.innerHTML = "Disable Electron Pairing"}
    else {togglePairing.innerHTML = "Enable Electron Pairing"}
})
document.body.appendChild(togglePairing)
