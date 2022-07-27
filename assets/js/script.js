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

const SPOTIFY_API_CALL_BUFFER = 2200; //2.2 seconds
const NUM_SPOTIFY_PLAYLISTS = 1;
const PLAYLIST_OPTIONS_MULTIPLIER = 5;

const basicLoader = $(
`<div class="preloader-wrapper big active">
    <div class="spinner-layer spinner-blue">
        <div class="circle-clipper left">
            <div class="circle"></div>
        </div>
        <div class="gap-patch">
            <div class="circle"></div>
        </div>
        <div class="circle-clipper right">
            <div class="circle"></div>
        </div>
    </div>

    <div class="spinner-layer spinner-red">
        <div class="circle-clipper left">
            <div class="circle"></div>
        </div>
        <div class="gap-patch">
            <div class="circle"></div>
        </div>
        <div class="circle-clipper right">
            <div class="circle"></div>
        </div>
    </div>

    <div class="spinner-layer spinner-yellow">
        <div class="circle-clipper left">
            <div class="circle"></div>
        </div>
        <div class="gap-patch">
            <div class="circle"></div>
        </div>
        <div class="circle-clipper right">
            <div class="circle"></div>
        </div>
    </div>

    <div class="spinner-layer spinner-green">
        <div class="circle-clipper left">
            <div class="circle"></div>
        </div>
        <div class="gap-patch">
            <div class="circle">
            </div>
        </div>
        <div class="circle-clipper right">
            <div class="circle"></div>
        </div>
    </div>
</div>`
);



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
    $('body').append(basicLoader);
    
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
            extractFromText(horoscopeObj);
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


// Break down text from horoscope into keywords
function extractFromText(horoscopeObj) {
    const options = {
    method: "POST",
    headers: {
        "content-type": "application/json",
        "X-RapidAPI-Key": "db93cfc0d2mshb30b8e666594cd2p1659b8jsn866b6f92afba",
        "X-RapidAPI-Host": "textprobe.p.rapidapi.com",
    },
    body: '{"text":"' + horoscopeObj.desc + '"}',
    };

    fetch("https://textprobe.p.rapidapi.com/topics", options)
        .then(response => response.json())
        .then(data => spotifySearch(data.keywords))
        .catch(err => console.error(err)
    );
}


//spotify search function 
function spotifySearch(keywords){
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': '00173b333cmsh7f497d732d65894p1a0c45jsn8fad42dfb52d',
            'X-RapidAPI-Host': 'spotify-scraper.p.rapidapi.com'
        }
    };

    var randomKeywords = randKeywords(keywords);
    console.log(randomKeywords);

    var apiCallBuffer = 0;

    randomKeywords.forEach(term => {

        setTimeout(() => {
            console.log(term);
            fetch("https://spotify-scraper.p.rapidapi.com/v1/search?term=" + term, options)
                .then(response => response.json())
                .then(data => {console.log(data); createSpotifyLink(data.playlists.items.slice(0, NUM_SPOTIFY_PLAYLISTS * PLAYLIST_OPTIONS_MULTIPLIER));})
                .catch(err => console.error(err))
        }, apiCallBuffer);
        apiCallBuffer += SPOTIFY_API_CALL_BUFFER;
    });
}


function randKeywords(keywords) {
    var selectionOfKeywords = [];
    for (i = 0; i < NUM_SPOTIFY_PLAYLISTS && i < keywords.length; i++)
        selectionOfKeywords.push(keywords.splice(Math.floor(Math.random() * keywords.length), 1)[0]);
    
    return selectionOfKeywords;
}


function createSpotifyLink(playlists){
    var thisPlaylist = playlists.splice(Math.floor(Math.random() * playlists.length), 1)[0];
    
    $('#playlists').append($(
        `<li class="playlist-item">
                <a href="${thisPlaylist.shareUrl}" class="row valign-wrapper" target="_blank">
                <img class="responsive-img col s2" src="./assets/images/spotify.png" alt="spotify logo"/>
                <h5 class="col s10 no-margin teal-text text-darken-2">${thisPlaylist.name}</h5>
            </a>
        </li>`
    ));
}



//LISTENERS

//Clicking 'Get Sounds' inside #try-again is the same as clicking the Get Sounds button
$('#try-again a').on('click', function(){
    $('#birthday-input').trigger('submit');
});


//Update # of days when month is (re-)selected
monthSelectorEl.on('change', function(event){
    event.preventDefault();
    setNumDays($(this).val());
});


//Upon birthday submission, begin the chain of API calls
$('#birthday-input').on('submit', function(event){
    event.preventDefault();

    $('#playlists').empty();

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
