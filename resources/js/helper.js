export const convertDMSToDegree = (angle) => {
    return angle.degree + (angle.minutes / 60) + (angle.seconds / 3600);
}

export const convertDegreeToDMS = (angle) => {
    let dms = {
        degree: 0,
        minutes: 0,
        seconds: 0
    };
    let angleStr = (angle + '').split('.');
    dms['degree'] = +angleStr[0];
    if (angleStr.length > 1) {
        let divisor = Math.pow(10, angleStr[1].length);
        let minutes = (Number(angleStr[1]) / divisor) * 60;
        dms['minutes'] = Math.floor(minutes);
        angleStr = (minutes + '').split('.');
        divisor = Math.pow(10, angleStr[1].length);
        let seconds = (Number(angleStr[1]) / divisor) * 60;
        dms['seconds'] = Math.floor(seconds);
    }
    return dms;
}

export const exitApplication = () => {
    let data = {
        requestType: 'exit'
    }
    window.api.send('toMain', data);
}