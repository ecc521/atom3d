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
    let textWidth = Math.ceil(ctx.measureText(text).width)
    genCanvas.width = textWidth * 30
    ctx.font = fontSize + "px " + font
    ctx.clearRect(0,0,genCanvas.width,genCanvas.height)
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, genCanvas.width, genCanvas.height)
    ctx.scale(-1,-1)
    ctx.fillStyle = textColor
    ctx.fillText(text, genCanvas.width * -0.85, genCanvas.height * -0.5)
    ctx.fillText(text, genCanvas.width * -0.35, genCanvas.height * -0.5)
    return genCanvas.toDataURL("img/png")
}

let startIndex = Number(window.location.hash.slice(1))
//If we don't have an element explicitly set, default to copper.
if (window.location.hash.length < 2 || !periodicTable[startIndex]) {startIndex = 28}

window.electronPairing = false
window.element = periodicTable[startIndex]
window.paused = false

var createScene = function () {
    if (window.paused) {pause.click()}
    var scene = new BABYLON.Scene(engine);

    // Setup camera
    var camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 0, BABYLON.Vector3.Zero(), scene);
    camera.setPosition(new BABYLON.Vector3(-35, 40, -45));
    camera.attachControl(canvas, true);
    window.camera = camera

    // Add lights to the scene
    var light1 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(1, 1, 0), scene);
    var light1 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(-0.8, -1, 0), scene);

    let nucleusSize = 5

    //Adjust size of nucleus based on element.
    nucleusSize /= window.periodicTable.length ** 0.33676424447995346
    nucleusSize *= window.element.number ** 0.33676424447995346

    nucleusSize += 1

    var nucleus = BABYLON.Mesh.CreateSphere("nucleus", 16, nucleusSize, scene);
	nucleus.position = new BABYLON.Vector3(0, 0, 0);
    var material = new BABYLON.StandardMaterial("nucleusmaterial", scene);
    nucleus.material = material;
    nucleus.material.alpha = 0.5
    material.diffuseTexture = new BABYLON.Texture(createText("Nucleus", 100, "#884400"), scene);


    //Generate particles inside nucleus.
    let protonTexture = new BABYLON.Texture(createText("Proton", 100, "#AA0000", "#000000"), scene);
    let neutronTexture = new BABYLON.Texture(createText("Neutron", 100, "#AAAAAA", "#000000"), scene);

    let nucleusParticleSize = 1

    let neutronsAndProtons = [
        window.element.number,
        Math.round(window.element.atomic_mass - window.element.number) //Neutron estimation.
    ]
    neutronsAndProtons.forEach((value, index) => {
        texture = index?neutronTexture:protonTexture
        for (let i=0;i<value;i++) {
            var particle = BABYLON.Mesh.CreateSphere("particle", 16, nucleusParticleSize, scene);
            particle.material = new BABYLON.StandardMaterial("particlematerial", scene);

            let reducedNucleusSize = nucleusSize * 0.75 //Speed up selection.
            let pos = new BABYLON.Vector3()
            function setPos() {
                pos.x = (Math.random() * reducedNucleusSize) - reducedNucleusSize/2
                pos.y = (Math.random() * reducedNucleusSize) - reducedNucleusSize/2
                pos.z = (Math.random() * reducedNucleusSize) - reducedNucleusSize/2

                let distance = BABYLON.Vector3.Distance(pos, nucleus.position)
                if (distance + nucleusParticleSize/2 > nucleusSize / 2) {
                    setPos()
                }
                else {
                    particle.position = pos
                }
            }
            setPos()

            particle.material.diffuseTexture = texture
            particle.parent = nucleus;
        }
    })


    //Ribbon from https://www.babylonjs-playground.com/#2E9DTS#9, edited to remove curvature.

    // material
    var mat = new BABYLON.StandardMaterial("mat1", scene);
    mat.alpha = 0.8;
    mat.diffuseColor = new BABYLON.Color3(0.5, 0.5, 1.0);
    mat.emissiveColor = new BABYLON.Color3.Black();
    mat.backFaceCulling = false;

    var createRibbon = function(mesh, path1, path2) {
        var positions = [];
        var indices = [];
        var normals = [];

        // process Arrays into positions & indices
        var i = 0;
        while (i < path1.length-2 && i < path2.length-2) {
            positions.push(path1[i], path1[i+1], path1[i+2]);
            positions.push(path2[i], path2[i+1], path2[i+2]);
            i += 3;
        }

        for (var i = 0; i < positions.length/3-2; i++) {
            if (i%2 == 0) {
                indices.push(i, i+1, i+2);
            }
            else {
                indices.push(i+2, i+1, i);
            }
        }

        BABYLON.VertexData.ComputeNormals(positions, indices, normals);

        mesh.setVerticesData(BABYLON.VertexBuffer.PositionKind, positions, false);
        mesh.setVerticesData(BABYLON.VertexBuffer.NormalKind, normals, false);
        mesh.setIndices(indices);
    };


    // tubular ribbon
    path1 = [];
    path2 = [];
    for (var i = 0; i <= 60; i++) {
        path1.push(Math.cos(Math.PI * 2 *i/60), 1, Math.sin(Math.PI * 2 *i/60));
        path2.push(Math.cos(Math.PI * 2 *i/60), 0, Math.sin(Math.PI * 2 *i/60));
    }



    let electrons = []
    let electronTexture = new BABYLON.Texture(createText("Electron", 100, "#00AAAA", "#000000"), scene);
    window.element.shells.forEach((value, index) => {
        let electronDistance = 3*(index+1) + 2

        let offsetArray = []

        if (!electronPairing) {
            for (let i=0;i<value;i++) {
                offsetArray.push(2 * Math.PI * (i/value))
            }
        }
        else {
            //TODO: Sublevels.
            let maxForDistance = [2, 8, 18, 32, 32, 32, 32]
            maxForDistance.length = window.element.shells.length
            maxForDistance[maxForDistance.length - 1] = Math.min(maxForDistance[maxForDistance.length - 1], 8)
            if (maxForDistance.length > 1) {
                maxForDistance[maxForDistance.length - 2] = Math.min(maxForDistance[maxForDistance.length - 2], 18)
            }

            let noPairs = maxForDistance[index]/2
            for (let i=0;i<noPairs;i++) {
                offsetArray.push(2 * Math.PI * (i/noPairs))
            }
            let pairs = noPairs
            //The distance between pairs will be 1/10th the normal difference.
            //Note: When the normal difference is small, such as sparsely filled outer layers, this does bad.
            for (let i=0;i<pairs;i++) {
                offsetArray.push(2 * Math.PI * (i/noPairs) + (Math.PI * (0.015/noPairs)) * electronDistance)
            }
            offsetArray = offsetArray.reverse()
        }


        var mesh4 = new BABYLON.Mesh("mesh4", scene);
        mesh4.material = mat;
        let height = 0.08
        let radius = electronDistance
        mesh4.position.y -= height/2
        createRibbon(mesh4, path1.map((value, index) => {
            if (index % 3 === 1) {return value * height}
            else {return value * radius}
        }), path2.map((value, index) => {
            if (index % 3 === 1) {
                return value
            }
            else {return value * radius}
        }));


        for (let i=0;i<value;i++) {
            var electron = BABYLON.Mesh.CreateSphere("electron", 16, 0.7, scene);
            electron.distance = electronDistance
            electron.offset = offsetArray.pop()
            electron.speed = 20/(index+1)**2
            electron.randomness = 0.15
            electron.material = new BABYLON.StandardMaterial("electronmaterial", scene);
            electron.material.diffuseTexture = electronTexture
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

        nucleus.rotate(new BABYLON.Vector3(0, 1, 0), Math.PI / 1000, BABYLON.Space.LOCAL);

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
    window.location.hash = index
    window.element = periodicTable[index]
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
togglePairing.innerHTML = "Enable Electron Pairing (Beta)"
togglePairing.addEventListener("click", function() {
    window.electronPairing = !window.electronPairing
    scene = createScene()
    if (window.electronPairing) {togglePairing.innerHTML = "Disable Electron Pairing"}
    else {togglePairing.innerHTML = "Enable Electron Pairing (Beta)"}
})
document.body.appendChild(togglePairing)

window.onhashchange = function() {
    let index = Number(window.location.hash.slice(1))
    if (periodicTable[index]) {
        let element = periodicTable[index]
        selector.value = index
        setInfo(index)
        window.element = periodicTable[index]
        scene = createScene()
    }
}




let sizes = [16,24,32,64,96,160,196]
sizes.forEach((size) => {
    let favicon = document.createElement("link")
    favicon.rel = "shortcut icon"
    favicon.type = "image/png"
    favicon.sizes = size + "x" + size
    favicon.href = `icons/${size}x${size}-oxygen-2D.png`
    document.head.appendChild(favicon)
})


if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('sw.js');
    });
}
