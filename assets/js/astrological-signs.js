
// IMPORTS
import {DateTime, DUMMY_LEAP_YR} from './helpers.js';


// SIGNS
class Sign{
    constructor(name, lastDayOfLeapYr){
        this.name = name;
        this.lastDay = lastDayOfLeapYr;
    }
}

const signs = [
    new Sign("capricorn", 19),
    new Sign("aquarius", 49),
    new Sign("pisces", 80),
    new Sign("aries", 110),
    new Sign("taurus", 141),
    new Sign("gemini", 172),
    new Sign("cancer", 204),
    new Sign("leo", 235),
    new Sign("virgo", 266),
    new Sign("libra", 296),
    new Sign("scorpio", 326),
    new Sign("sagittarius", 356),
];



// Get name of sign based on month and day
export function getSignName(month, day){
    // turn <month, day> into <day of year>
    let dayOfYr = +DateTime.fromFormat(
        `${month} ${day} ${DUMMY_LEAP_YR}`,
        "MMMM d y"
    ).toFormat("o");
    
    // return sign based on day of year (excluding Winter Solstice thru end of yr)
    let sign = signs.find(elem => dayOfYr <= elem.lastDay);
    
    return sign ?
        sign.name
    :
        "capricorn"  // accounting for Winter Solstice thru the end of the year
    ;
}