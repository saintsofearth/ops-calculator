import { convertDMSToDegree, exitApplication } from './helper.js';

let opEast = document.querySelector('#opEast');
let opNorth = document.querySelector('#opNorth');
let btEast = document.querySelector('#btEast');
let btNorth = document.querySelector('#btNorth');
let tgtEast = document.querySelector('#tgtEast');
let tgtNorth = document.querySelector('#tgtNorth');
let apexAngleDeg = document.querySelector('#apexAngleDeg');
let apexAngleMin = document.querySelector('#apexAngleMin');
let zoneSeen = document.querySelector('#zoneSeen');
let otFactor = document.querySelector('#otFactor');
let correctionListDOM = document.querySelector('#correctionList');

let correctionBtnDOM = document.querySelector('#correctionBtn');
let backBtnDOM = document.querySelector('#backBtn');
let exitBtnDOM = document.querySelector('#exitBtn');
let newMissionBtnDOM = document.querySelector('#newMissionBtn');


let correctionCount = 1;
let maxCorrection = 4;
let previousSelection = '';
let correctionValue = 400;
let maxCorrectionDist = 1600;
let initialCorrectionDist = 0;

window.api.receive('fromMain', (data) => {
    console.log(data);
    init(data);
    calculateSubTen();
});


function init(data) {
    opEast.value = data.opEast;
    opNorth.value = data.opNorth;
    btEast.value = data.btEast;
    btNorth.value = data.btNorth;
    tgtEast.value = data.tgtEast;
    tgtNorth.value = data.tgtNorth;
    apexAngleDeg.value = data.apexAngle.degree;
    apexAngleMin.value = data.apexAngle.minutes;
    zoneSeen.value = data.zoneSeen;
    otFactor.value = data.otFactor;
}

/********************* EVENT HANDLERS ********************* */

correctionBtnDOM.addEventListener('click', calculateCorrection);
exitBtnDOM.addEventListener('click', exitApplication);
backBtnDOM.addEventListener('click', toPreviousWindow);
newMissionBtnDOM.addEventListener('click', createNewMission);


/********************* HELPER FUNCTIONS ********************* */

function calculateCorrection() {
    // Step 1: select the DOM elements that are responsible in calculation of correction
    let leftRadioDOM = document.querySelector('#leftRadio');
    let rightRadioDOM = document.querySelector('#rightRadio');
    let corrDegDOM = document.querySelector('#corrDeg');
    let corrMinDOM = document.querySelector('#corrMin');
    let overRadioDOM = document.querySelector('#overRadio');
    let shortRadioDOM = document.querySelector('#shortRadio');
    let doubtfulRadioDOM = document.querySelector('#doubtfulRadio');


    /******************************************************************************************************
     * While determining correction we see two corrections
     * 1. Horizontal correction 
     * 2. Vertical correction
     * 
     * Horizontal correction:
     *  We determine horizontal correction by using new DEG and MIN input values * OT factor, we also check wether it is left correction or  right correction.
     * 
     * Vertical correction: 
     * 
     */

    // Step 2: Determine horizontal range correction
    let angle = {
        degree: +corrDegDOM.value,
        minutes: +corrMinDOM.value,
        seconds: 0
    }
    angle = convertDMSToDegree(angle);
    console.log(`DMS to Degree ${angle}`);

    let horizontalRangeCorrection = angle * Number(otFactor.value);
    if (leftRadioDOM.checked) {
        horizontalRangeCorrection = "Right " + horizontalRangeCorrection;
    } else if (rightRadioDOM.checked) {
        horizontalRangeCorrection = "left " + horizontalRangeCorrection;
    }
    // Step 3: Determine vertical range correction
    let currentSelection = '';
    let message = '';
    let verticalRangeCorrection = '';

    if (overRadioDOM.checked) {
        currentSelection = overRadioDOM.value;
        message = 'DROP';
    } else if (shortRadioDOM.checked) {
        currentSelection = shortRadioDOM.value;
        message = 'ADD';
    } else if (doubtfulRadioDOM.checked) {
        currentSelection = doubtfulRadioDOM.value;
        message = 'DOUBTFUL';
    }
    verticalRangeCorrection = determineCorrection(currentSelection);

    // Step 5: Append the result
    document.querySelector('#correctionCommand').value = message;
    document.querySelector('#correctionValue').value = verticalRangeCorrection;
    document.querySelector('#horizontalCorrection').value = horizontalRangeCorrection;
    let corrString = '';
    corrString += `${message} ${verticalRangeCorrection} ${horizontalRangeCorrection}`;
    // console.log(corrString);
    let markup = `
    <li class="correction-summary--item">${corrString}</li>
    `;
    correctionListDOM.insertAdjacentHTML('afterbegin', markup);
}

function determineCorrection(currentSelection) {
    if ((currentSelection === previousSelection) || (correctionCount === 1)) {
        previousSelection = currentSelection;
        if (correctionValue === 400) {
            if (correctionCount < maxCorrection) {
                // previousSelection = currentSelection;
                correctionCount++;
                return `${correctionValue}`;
            } else {
                return 'Check your GR';
            }
        } else {
            correctionValue /= 2;
            return `${correctionValue}`;
        }
    } else if (currentSelection !== previousSelection) {
        correctionValue /= 2;
        previousSelection = currentSelection;
        return `${correctionValue}`;
    }
}


function calculateSubTen() {
    let subTen = [0, 0, 0, 0, 0, 0];
    // Initializing 1 deg value with OT factor
    subTen[3] = +otFactor.value;

    // forward for-loop to calculate subTen from 1 deg onwards
    for (let i = 4; i < 6; i++) {
        subTen[i] = subTen[i - 1] + (Number(otFactor.value) / 2);
    }

    // backward for-loop to calculate subTen from 1 deg to 15 min
    for (let i = 2; i >= 0; i--) {
        subTen[i] = subTen[i + 1] - (Number(otFactor.value) / 4);
    }
    console.log(subTen);
    appendSubTen(subTen);
}

function appendSubTen(subTen) {
    let subTenEntriesDOM = document.querySelector('#subTenEntriesDOM');
    for (let i = 0; i < subTen.length; i++) {
        let markup = `
            <td>${subTen[i]}</td>
        `;
        subTenEntriesDOM.insertAdjacentHTML('beforeend', markup);
    }
}


function toPreviousWindow() {
    window.api.send('toDetailWindow', 'detailsWindow');
}

function createNewMission() {
    let data = {
        requestType: 'new mission'
    };
    window.api.send('toInitialWindow', data);
}