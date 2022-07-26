//GLOBAL VARIABLES

const DateTime = luxon.DateTime;

const DUMMY_LEAP_YR = 2024; // assume that all birthdays occur in a leap year (to ensure Feb 29 functionality)

class Sign{
    constructor(name, lastDayOfLeapYr){
        this.name = name;
        this.lastDay = lastDayOfLeapYr;
    }
}
const SIGNS = [
    new Sign('capricorn', 19),
    new Sign('aquarius', 49),
    new Sign('pisces', 80),
    new Sign('aries', 110),
    new Sign('taurus', 141),
    new Sign('gemini', 172),
    new Sign('cancer', 204),
    new Sign('leo', 235),
    new Sign('virgo', 266),
    new Sign('libra', 296),
    new Sign('scorpio', 326),
    new Sign('sagittarius', 356)
];

const monthSelectorEl = $('select[name="month"]');
const daySelectorEl = $('select[name="day"]');



//FUNCTIONS

// Populate user input 'days' dropdown with correct # of days for given month
function setNumDays(month){
    var firstOfThisMonth = DateTime.fromFormat(`${month} 1 ${DUMMY_LEAP_YR}`, 'MMMM d y');
    var firstOfNextMonth = firstOfThisMonth.plus({months: 1});
    var daysInMonth = firstOfNextMonth.diff(firstOfThisMonth, 'days').toObject().days;

    var daySelected = daySelectorEl.val() || 1;
    
    daySelectorEl.empty();
    for (i = 1; i <= daysInMonth; i++)
        daySelectorEl.append($(`<option value='${i}'>${i}</option>`));

    if (daySelected <= daysInMonth)
        daySelectorEl.val(daySelected);
}


// Get horoscope based on sign name
function getHoroscope(month, day){
    var signName = getSignName(month, day);

    fetch('https://sameer-kumar-aztro-v1.p.rapidapi.com/?sign=' + signName + '&day=today',
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
            var horoscopeObj = { 
                color: data.color,
                desc: data.description,
                luckyNum: data.lucky_number,
                mood: data.mood
            };
            extractFromText(horoscopeObj,"topics");
//             extractFromText(horoscopeObj,"feelings");
        })
        .catch(error =>
            console.log('system error') //UPDATE LATER with something that the user can actually see (a modal?)
        );
}


// Get sign name based on month and day
function getSignName(month, day){
    var dayOfYr = +DateTime.fromFormat(`${month} ${day} ${DUMMY_LEAP_YR}`, 'MMMM d y').toFormat('o');

    var sign = SIGNS.find(elem => dayOfYr <= elem.lastDay);

    if (sign)
        return sign.name;
    else
        return 'capricorn';
}

// Get key feelings or topics given text input, extractType options = ["topics","feelings"]
function extractFromText(horoscopeObj, extractType) {
  const options = {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "X-RapidAPI-Key": "db93cfc0d2mshb30b8e666594cd2p1659b8jsn866b6f92afba",
      "X-RapidAPI-Host": "textprobe.p.rapidapi.com",
    },
    body: '{"text":"' + horoscopeObj.desc + '"}',
  };

  fetch("https://textprobe.p.rapidapi.com/" + extractType, options)
    .then((response) => response.json())
    .then((data) => {
      if(extractType=="topics"){
       console.log(data);
        var keywords= data.keywords;
        keywords.push(horoscopeObj.color);
        keywords.push(horoscopeObj.luckyNum);
        keywords.push(horoscopeObj.mood);
        console.log(keywords);
        return keywords;
      }
      else if (extractType=="feelings"){
        var feelings = [data.emotion_prediction];
        feelings.push(horoscopeObj.mood);
        console.log(feelings);
        return feelings;
      }
    })
    .catch((err) => console.error(err));
}

//call keyword API
extractFromText(horoscopeObj, extractType);

//return an array from keywords and feelings
var keywordsArray = Object.getOwnPropertyNames(keywords);
var feelingsArray = Object.getOwnPropertyNames(feelings);


//generate a unique query string to search spotify with 
var uniqueQueryString;
for (i=0; i <= keywordsArray.length; i++){
    uniqueQueryString = "https://spotify-scraper.p.rapidapi.com/v1/search?" + keywordsArray[i] + options;
    console.log(uniqueQueryString);
}

//spotify search function 
function spotifySearch(){
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': '00173b333cmsh7f497d732d65894p1a0c45jsn8fad42dfb52d',
            'X-RapidAPI-Host': 'spotify-scraper.p.rapidapi.com'
        }
    };
    fetch(uniqueQueryString, options)
	.then(response => response.json())
	.then(response => console.log(response))
	.catch(err => console.error(err));
    let response.json = spotifySearchResults
}

// call spotify search function 
spotifySearch();

// parse json with random function 
function randomizeSpotifyResults(){
    return spotifySearchResults[parseInt(Math.random()*playlist.items)];
    console.log("shareUrL" + "description");

}


// append results to DOM
document.createElement();



// 
//LISTENERS
//Update # of days when month is (re-)selected
monthSelectorEl.on('change', function(event){
    event.preventDefault();
    setNumDays($(this).val());
});


//Upon birthday submission, begin the chain of API calls
$('#birthday-input').on('submit', function(event){
    event.preventDefault();
    getHoroscope(monthSelectorEl.val(), daySelectorEl.val());
});



//INITIALIZE PAGE
monthSelectorEl.val(DateTime.now().toFormat('MMMM').toLowerCase()); // set initial month to today's
monthSelectorEl.trigger('change'); // initialize day dropdown w/ correct # of days for the initial month
daySelectorEl.val(+DateTime.now().toFormat('d')); // set initial day-of-month to today's

  // separate keywords into searchable strings

  // search spotify with keywords from generator 
 



  
