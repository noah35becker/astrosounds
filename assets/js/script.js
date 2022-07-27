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
const signWrapperEl = $('#sign-wrapper');



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

            $('#sign-wrapper img')
                .attr('src', `./assets/images/signs/${signName}.png`)
                .attr('alt', signName + ' symbol');
            $('#sign-wrapper h5').text(signName);
            $('#sign-wrapper #lucky-number span').text(horoscopeObj.luckyNum);
            $('#sign-wrapper #mood span').text(horoscopeObj.mood);
            $('#sign-wrapper #color span').text(horoscopeObj.color);

            extractFromText(horoscopeObj,"topics");
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



//LISTENERS

//Update # of days when month is (re-)selected
monthSelectorEl.on('change', function(event){
    event.preventDefault();
    setNumDays($(this).val());
});


//Upon birthday submission, begin the chain of API calls
$('#birthday-input').on('submit', function(event){
    event.preventDefault();
    $('#results-wrapper').attr('style', 'display: block');
    getHoroscope(monthSelectorEl.val(), daySelectorEl.val());
});


// required to load selects using materialize
$(document).ready(function(){
    $('select').formSelect();
  });


  
//INITIALIZE PAGE
monthSelectorEl.val(DateTime.now().toFormat('MMMM').toLowerCase()); // set initial month to today's
monthSelectorEl.trigger('change'); // initialize day dropdown w/ correct # of days for the initial month
daySelectorEl.val(+DateTime.now().toFormat('d')); // set initial day-of-month to today's
