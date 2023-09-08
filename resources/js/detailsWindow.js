import { convertDMSToDegree, convertDegreeToDMS } from './helper.js';

let opEastDOM = document.querySelector('#opEast');
let opNorthDOM = document.querySelector('#opNorth');
let btEastDOM = document.querySelector('#btEast');
let btNorthDOM = document.querySelector('#btNorth');
let tgtEastDOM = document.querySelector('#tgtEast');
let tgtNorthDOM = document.querySelector('#tgtNorth');
let response = {};


let calculateBtn = document.querySelector('#calculateBtn');
let editBtn = document.querySelector('#editBtn');
let backBtn = document.querySelector('#backBtn');
let nextBtn = document.querySelector('#nextBtn');

/******************** WINDOW INITIALIZATION ******************* */

window.api.receive('fromMain', (data) => {
    init(data);
});

function init(data) {
    opEastDOM.value = data.opEast;
    opNorthDOM.value = data.opNorth;
    btEastDOM.value = data.btEast;
    btNorthDOM.value = data.btNorth;
    tgtEastDOM.value = data.tgtEast;
    tgtNorthDOM.value = data.tgtNorth;
}

/********************* EVENT REGISTRATION ********************** */

calculateBtn.addEventListener('click', calculate);
editBtn.addEventListener('click', editGr);
backBtn.addEventListener('click', toPreviousWindow);
nextBtn.addEventListener('click', toFinalWindow);


/******************** EVENT HANDLER *************************** */

function calculate() {
    // Step 1: Disable all input taking fields
    opEastDOM.disabled = true;
    opNorthDOM.disabled = true;
    btEastDOM.disabled = true;
    btNorthDOM.disabled = true;
    tgtEastDOM.disabled = true;
    tgtNorthDOM.disabled = true;
    editBtn.disabled = false;

    // Step 2: Fetch the values from all inputs. Why because their might be a chance that user might edit GR details
    let opEast = +document.querySelector('#opEast').value;
    let opNorth = +document.querySelector('#opNorth').value;
    let btEast = +document.querySelector('#btEast').value;
    let btNorth = +document.querySelector('#btNorth').value;
    let tgtEast = +document.querySelector('#tgtEast').value;
    let tgtNorth = +document.querySelector('#tgtNorth').value;

    // Step 3: process the passed coordinates 
    processCoordinates(opEast, opNorth, btEast, btNorth, tgtEast, tgtNorth);
    console.log(response);

    // Step 4: Append the result to html
    appendResult();

    // Step 5: Enable the next button so that user can move to final window
    nextBtn.disabled = false;
}

function editGr() {
    opEastDOM.disabled = false;
    opNorthDOM.disabled = false;
    btEastDOM.disabled = false;
    btNorthDOM.disabled = false;
    tgtEastDOM.disabled = false;
    tgtNorthDOM.disabled = false;
    nextBtn.disabled = true;
    editBtn.disabled = true;
}

function toPreviousWindow() {
    let data = {
        requestType: 'previous window'
    }
    window.api.send('toInitialWindow', data);
}

function toFinalWindow() {
    console.log('This is response object to be sent');
    console.log(response);
    window.api.send('toFinalWindow', response);
}

/******************** HELPER FUNCTIONS *************************** */

function processCoordinates(opEast, opNorth, btEast, btNorth, tgtEast, tgtNorth) {

    // Step 1: Initialize response object with basic details
    response.opEast = opEast;
    response.opNorth = opNorth;
    response.btEast = btEast;
    response.btNorth = btNorth;
    response.tgtEast = tgtEast;
    response.tgtNorth = tgtNorth;

    // Step 2: Do the required Calculations
    // calculate OT Dist
    response.otDist = calculateRange(tgtEast, tgtNorth, opEast, opNorth);
    // Calculate OSCAR
    response.oscar = calculateBearing(tgtEast, tgtNorth, opEast, opNorth);
    // Calculate BT Range
    response.rangeBt = calculateRange(tgtEast, tgtNorth, btEast, btNorth);
    // Calculate BT Bearing
    response.btBearing = calculateBearing(tgtEast, tgtNorth, btEast, btNorth);
    // Calculate OT Factor
    response.otFactor = calculateOtFactor(response.otDist);
    // Calculate Apex Angle
    response.apexAngle = calculateApexAngle(response.oscar, response.btBearing);
    // Calculate Zone Seen
    response.zoneSeen = calculateZoneSeen(response.apexAngle);
}

function calculateRange(tgtE, tgtN, refE, refN) {
    let range = Math.pow((tgtE - refE), 2) + Math.pow((tgtN - refN), 2);
    range = Math.sqrt(range);
    return Math.ceil(range);
}

function calculateBearing(tgtE, tgtN, refE, refN) {
    let diffE = tgtE - refE;
    let diffN = tgtN - refN;
    // let bearing = {
    //     degree: 0,
    //     minutes: 0,
    //     seconds: 0
    // };
    let degree;
    // let minutes;
    // let seconds;
    if (diffE >= 0 && diffN >= 0) {
        // calculate tan inverse of diffE / diffN

        diffE = Math.abs(diffE);
        diffN = Math.abs(diffN);
        degree = Math.atan(diffE / diffN) * 180 / Math.PI;
    } else if (diffE > 0 && diffN < 0) {
        // 180 - tan inverse of diffE / diffN

        diffE = Math.abs(diffE);
        diffN = Math.abs(diffN);
        degree = 180 - (Math.atan(diffE / diffN) * 180 / Math.PI);
    } else if (diffE < 0 && diffN > 0) {
        // 360 - tan inverse of diffE / diffN

        diffE = Math.abs(diffE);
        console.log(diffE);
        diffN = Math.abs(diffN);
        console.log(diffN);
        console.log(Math.atan(diffE / diffN));
        console.log(Math.atan(diffE / diffN) * 180 / Math.PI);
        degree = 360 - (Math.atan(diffE / diffN) * 180 / Math.PI);
        console.log(degree);
    } else {
        // 180 + tan inverse of diffE / diffN

        diffE = Math.abs(diffE);
        diffN = Math.abs(diffN);
        degree = 180 + (Math.atan(diffE / diffN) * 180 / Math.PI);
    }
    // bearing['degree'] = Math.floor(degree);
    // let bearingStr = (degree + '').split('.');
    // if (bearingStr.length > 1) {
    //     let divisor = Math.pow(10, bearingStr[1].length);
    //     minutes = (Number(bearingStr[1]) / divisor) * 60;
    //     bearing['minutes'] = Math.floor(minutes);
    //     bearingStr = (minutes + '').split('.');
    //     divisor = Math.pow(10, bearingStr[1].length);
    //     seconds = (Number(bearingStr[1]) / divisor) * 60;
    //     bearing['seconds'] = Math.floor(seconds);
    // }
    // return bearing;
    return convertDegreeToDMS(degree);
}


// function tgtCoordinate(btEast, btNorth, dist, otBg) {
//     // otBg is in degree to first we have to convert it into radians
//     let otBgDeg = +otBg.otBgDeg;
//     let otBgMin = +otBg.otBgMin;
//     console.log(`Value of otBgDeg ${otBgDeg} and value of otBgMin is ${otBgMin}`);
//     otBgDeg += (otBgMin / 60);
//     console.log(`otBgDeg ${otBgDeg}`);

//     otBgDeg = otBgDeg * Math.PI / 180;
//     console.log(`otBg in rads: ${otBg}`);
//     let tgtEast = calculateTgtEast(btEast, dist, otBgDeg);
//     let tgtNorth = calculateTgtNorth(btNorth, dist, otBgDeg);
//     return [tgtEast, tgtNorth];
// }

// function calculateTgtEast(btEast, dist, otBg) {
//     // console.log(typeof dist);
//     // console.log(dist * Math.sin(otBg));
//     return btEast + (dist * Math.sin(otBg))
// }

// function calculateTgtNorth(btNorth, dist, otBg) {
//     return btNorth + (dist * Math.cos(otBg));
// }

function calculateOtFactor(otDist) {
    return Math.ceil((otDist / 1000) * 17);
}

function calculateApexAngle(oscar, btBearing) {
    let oscarDeg = convertDMSToDegree(oscar);
    console.log(`oscar in degrees ${oscarDeg}`);
    let btBearingDeg = convertDMSToDegree(btBearing);
    console.log(`btBearing in degrees ${btBearingDeg}`);
    let apexAngle = oscarDeg - btBearingDeg;
    apexAngle = Math.abs(apexAngle);
    if (apexAngle > 90) {
        apexAngle = 180 - apexAngle;
    }
    console.log(`Apex angle in degrees ${apexAngle}`);
    apexAngle = convertDegreeToDMS(apexAngle);
    console.log(apexAngle);
    return apexAngle;
}

function calculateZoneSeen(apexAngle) {
    let apexAngleDeg = convertDMSToDegree(apexAngle);
    // let zoneSeen = document.querySelector('#zoneSeen');
    console.log(apexAngleDeg);
    if (apexAngleDeg > 0 && apexAngleDeg < 25) {
        return `No range zone seen`;
    } else if (apexAngleDeg >= 25 && apexAngleDeg < 45) {
        return `Half range zone seen`;
    } else if (apexAngleDeg >= 45 && apexAngleDeg < 60) {
        return `Three quarters zone seen`;
    } else if (apexAngleDeg >= 60 && apexAngleDeg < 90) {
        return `Full range zone seen`;
    }
}

// function convertDMSToDegree(angle) {
//     return angle.degree + (angle.minutes / 60) + (angle.seconds / 3600);
// }

// function convertDegreeToDMS(angle) {
//     let dms = {
//         degree: 0,
//         minutes: 0,
//         seconds: 0
//     };
//     let angleStr = (angle + '').split('.');
//     dms['degree'] = +angleStr[0];
//     if (angleStr.length > 1) {
//         let divisor = Math.pow(10, angleStr[1].length);
//         minutes = (Number(angleStr[1]) / divisor) * 60;
//         dms['minutes'] = Math.floor(minutes);
//         angleStr = (minutes + '').split('.');
//         divisor = Math.pow(10, angleStr[1].length);
//         seconds = (Number(angleStr[1]) / divisor) * 60;
//         dms['seconds'] = Math.floor(seconds);
//     }
//     return dms;
// }

function appendResult() {
    document.querySelector('#btDist').value = response.rangeBt;
    document.querySelector('#otDist').value = response.otDist;
    document.querySelector('#oscarDeg').value = response.oscar.degree;
    document.querySelector('#oscarMin').value = response.oscar.minutes;
    // document.querySelector('#oscarSec').value = response.oscar.seconds;
    document.querySelector('#btBearingDeg').value = response.btBearing.degree;
    document.querySelector('#btBearingMin').value = response.btBearing.minutes;
    // document.querySelector('#btBearingSec').value = response.btBearing.seconds;
    document.querySelector('#apexAngleDeg').value = response.apexAngle.degree;
    document.querySelector('#apexAngleMin').value = response.apexAngle.minutes;
    // document.querySelector('#apexAngleSec').value = response.apexAngle.seconds;
    document.querySelector('#otFactor').value = response.otFactor;
    document.querySelector('#zoneSeen').value = response.zoneSeen;
}
