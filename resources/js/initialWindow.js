import { exitApplication } from './helper.js'

let opEastDOM = document.querySelector('#opEast');
let opNorthDOM = document.querySelector('#opNorth');
let btEastDOM = document.querySelector('#btEast');
let btNorthDOM = document.querySelector('#btNorth');

let coordinateForm = document.querySelector('.coordinateForm');
let tgtGrRadioDOM = document.querySelector('#tgtGrRadio');
let polarDistRadioDOM = document.querySelector('#polarDistRadio');
let nextBtn = document.querySelector('#nextBtn');
let clearTgtBtn = document.querySelector('#clearTgt');


/************************ EVENT HANDLER ************************ */
coordinateForm.addEventListener('click', function (event) {
    if (event.target && event.target.matches('input[type="radio"]')) {
        // First fetch the value which radio button was selected
        let optionSelected = event.target.value;
        appendTgtDetails(optionSelected);

    } else if (event.target && event.target.matches(`button[type="button"]`)) {
        if (event.target.name === 'clearTgt') {
            clearTgtValues();
        } else if (event.target.name === 'nextBtn') {
            processInitialCoordinates();
        } else if (event.target.name === 'exitBtn') {
            exitApplication();
        }
    }
});


const validation = setInterval(function () {
    if (tgtGrRadioDOM.checked) {
        validateInputData('tgtGr');
    } else if (polarDistRadioDOM.checked) {
        validateInputData('polarDist');
    }
}, 250);


/*************************** HELPER FUNCTION ******************** */

function clearTgtValues() {
    if (tgtGrRadioDOM.checked) {
        document.querySelector('#tgtEast').value = '';
        document.querySelector('#tgtNorth').value = '';
    } else if (polarDistRadioDOM.checked) {
        document.querySelector('#polarDist').value = '';
        document.querySelector('#otBgDeg').value = '';
        document.querySelector('#otBgMin').value = '';
    }
}

function appendTgtDetails(type) {
    let tgDetails = document.querySelector('#tgDetails');
    let markup = ``;
    if (type === 'tgtGr') {
        clearMarkup();
        markup = `
            <div class="form-group">
                <label for="tgtEast">Tgt GR</label>
                <span class="easting">Easting</span>
                <input type="number" id="tgtEast" placeholder="">
                <span class="northing">Northing</span>
                <input type="number" id="tgtNorth" placeholder="">
            </div>
            
    `;
    } else if (type === 'polarDist') {
        clearMarkup();
        markup = `
            <div class="form-group">
                <label for="polarDist">Polar Distance</label>
                <input type="number" id="polarDist" placeholder="">
            </div>
            <div class="form-group">
                <label for="otBg">Ot Bearing</label>
                <input type="number" id="otBgDeg" placeholder="DEG"><span class="symbol">&#176;</span>
                <input type="number" id="otBgMin" placeholder="MIN"><span class="symbol">&prime;</span>
            </div>
            
    `;
    }
    tgDetails.insertAdjacentHTML('beforeend', markup);
    // validateInputData(type);
    clearTgtBtn.disabled = false;
    // nextBtn.disabled = false;
}

function clearMarkup() {
    let tgDetails = document.querySelector('#tgDetails');
    tgDetails.textContent = '';
}

function validateInputData(type) {
    console.log(`Validating input data`);
    if (type === 'tgtGr') {
        let tgtEastDOM = document.querySelector('#tgtEast');
        let tgtNorthDOM = document.querySelector('#tgtNorth');
        if (opEastDOM.value !== "" &&
            opNorthDOM.value !== "" &&
            btEastDOM.value !== "" &&
            btNorthDOM.value !== "" &&
            tgtEastDOM.value !== "" &&
            tgtNorthDOM.value !== "") {
            nextBtn.disabled = false;
            }
    } else if (type === 'polarDist') {
        let polarDistDOM = document.querySelector('#polarDist');
        let otBgDegDOM = document.querySelector('#otBgDeg');
        let otBgMinDOM = document.querySelector('#otBgMin');
        if (opEastDOM.value !== "" &&
            opNorthDOM.value !== "" &&
            btEastDOM.value !== "" &&
            btNorthDOM.value !== "" &&
            polarDistDOM.value !== "" &&
            otBgDegDOM.value !== "" &&
            otBgMinDOM.value !== "") {
            nextBtn.disabled = false;
            }
    }
    
}




function processInitialCoordinates() {
    let opEast = +document.getElementById('opEast').value;
    let opNorth = +document.getElementById('opNorth').value;
    // console.log(`typeof opEast: ${typeof opEast} and typeof opNorth: ${typeof opNorth}`);
    let btEast = +document.getElementById('btEast').value;
    let btNorth = +document.getElementById('btNorth').value;
    let data = {
        requestType: 'forward',
        opEast: opEast,
        opNorth: opNorth,
        btEast: btEast,
        btNorth: btNorth
    }

    let tgtGrRadio = document.getElementById('tgtGrRadio');
    let polarDistRadio = document.getElementById('polarDistRadio');
    
    if (tgtGrRadio.checked) {
        data.tgtEast = +document.getElementById('tgtEast').value;
        data.tgtNorth = +document.getElementById('tgtNorth').value;
        // data.tgDetails = 'tgtGr';


    } else if (polarDistRadio.checked) {
        let dist = +document.getElementById('polarDist').value;
        let otBg = {
            otBgDeg: +document.getElementById('otBgDeg').value,
            otBgMin: +document.getElementById('otBgMin').value
        }

        let [tgtEast, tgtNorth] = tgtCoordinate(opEast, opNorth, dist, otBg);
        data.tgtEast = tgtEast;
        data.tgtNorth = tgtNorth;

        data.otBg = otBg;
        data.polarDist = dist;
        // data.tgDetails = 'polarDist';
    }
    clearInterval(validation);
    window.api.send('toMain', data);
}

// TGT details is in Polar distance form

function tgtCoordinate(opEast, opNorth, dist, otBg) {
    // otBg is in degree so first we have to convert it into radians
    let otBgDeg = +otBg.otBgDeg;
    let otBgMin = +otBg.otBgMin;
    // console.log(`Value of otBgDeg ${otBgDeg} and value of otBgMin is ${otBgMin}`);
    otBgDeg += (otBgMin / 60);
    // console.log(`otBgDeg ${otBgDeg}`);

    otBgDeg = otBgDeg * Math.PI / 180;
    console.log(`otBg in rads: ${otBg}`);
    let tgtEast = calculateTgtEast(opEast, dist, otBgDeg);
    let tgtNorth = calculateTgtNorth(opNorth, dist, otBgDeg);
    return [tgtEast, tgtNorth];
}

function calculateTgtEast(opEast, dist, otBg) {
    // console.log(typeof dist);
    // console.log(dist * Math.sin(otBg));
    return opEast + (dist * Math.sin(otBg))
}

function calculateTgtNorth( 
    opNorth, dist, otBg) {
    return opNorth + (dist * Math.cos(otBg));
}


