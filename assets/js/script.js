
//GLOBAL VARIABLES

const DateTime = luxon.DateTime;

const DUMMY_LEAP_YR = 2024; // ensures functionality for Feb 29 birthdays

class Sign{
    constructor(name, startDayOfLpYr, endDayOfLpYr){
        this.name = name;
        this.startDay = startDayOfLpYr;
        this.endDay = endDayOfLpYr;
    }
}
const SIGNS = [
    new Sign('aries', 81, 110),
    new Sign('taurus', 111, 141),
    new Sign('gemini', 142, 172),
    new Sign('cancer', 173, 204),
    new Sign('leo', 205, 235),
    new Sign('virgo', 236, 266),
    new Sign('libra', 267, 296),
    new Sign('scorpio', 297, 326),
    new Sign('sagittarius', 327, 356),
    new Sign('capricorn', 357, 19), //WILL REQ SPECIAL HANDLING
    new Sign('aquarius', 20, 49),
    new Sign('pisces', 50, 80)
];


//FUNCTIONS

// Get horoscope based on sign name
function getHoroscope(sign){
    fetch('https://sameer-kumar-aztro-v1.p.rapidapi.com/?sign=' + sign + '&day=today',
        {
            method: 'POST',
            headers: {
                'X-RapidAPI-Key': '0998422ae9msh631f094298f7caep1b0a7bjsnf6c1671b7893',
                'X-RapidAPI-Host': 'sameer-kumar-aztro-v1.p.rapidapi.com'
            }
        }
    )
        .then(response => response.json())
        .then(data => {
            console.log(data);
            return {
                color: data.color,
                desc: data.description,
                luckyNum: data.lucky_number,
                mood: data.mood
            };
        })
        .catch(error =>
            console.log('system error')
        );

}


// Get sign name based on day of yr
function getSignName(dayOfYr){
    var sign = SIGNS.find(sign => dayOfYr >= sign.startDay && dayOfYr <= sign.endDay);

    if (sign)
        return sign.name;
    else
        return 'capricorn';
}
