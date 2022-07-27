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

var searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
const MAX_NUM_SEARCH_HISTORY = 4;

const SPOTIFY_API_CALL_BUFFER = 2200; //2.2 seconds
const NUM_SPOTIFY_PLAYLISTS = 1;
const PLAYLIST_OPTIONS_PER_KEYWORD = 15;

const loadingGraphic = $(
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
    
    materializeRefreshSelect();
}


// Get horoscope based on sign name
function getHoroscope(month, day){
    var signName = getSignName(month, day);

    fetch(`https://sameer-kumar-aztro-v1.p.rapidapi.com/?sign=${signName}&day=today`, {
        method: 'POST',
        headers: {
            'X-RapidAPI-Key': '0998422ae9msh631f094298f7caep1b0a7bjsnf6c1671b7893',
            'X-RapidAPI-Host': 'sameer-kumar-aztro-v1.p.rapidapi.com'
        }
    })
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
                .attr('alt', titleCaseSignName(signName) + ' symbol');
            $('#sign-wrapper h5').text(signName);
            $('#sign-wrapper #lucky-number span').text(horoscopeObj.luckyNum);
            $('#sign-wrapper #mood span').text(horoscopeObj.mood);
            $('#sign-wrapper #color span').text(horoscopeObj.color);

            extractFromText(horoscopeObj);
        })
        .catch(err => errorMsg())
    ;

    saveSearchHistory(month, day);
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


// Change sign name to Title Case (for sign image's alt attribute)
function titleCaseSignName(signName){
    chars = signName.split('');
    chars[0] = chars[0].toUpperCase();
    return chars.join('');
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
        .catch(err => errorMsg())
    ;
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

    var apiCallBuffer = SPOTIFY_API_CALL_BUFFER; //initialize to this val (rather than having the first API call run immed.) in case user clicks "Get Sounds" repeatedly in quick succession
    randomKeywords.forEach((term, index) => {
        setTimeout(() => {
            fetch(`https://spotify-scraper.p.rapidapi.com/v1/search?term=${term}`, options)
                .then(response => response.json())
                .then(data => {                    
                    if (index === randomKeywords.length - 1){ // after the final Spotify API call, remove the loading graphic and show #try-again
                        $('#loading-graphic').empty();
                        $('#try-again').attr('style', 'display: block');
                    }

                    createSpotifyLink(data.playlists.items.slice(0, PLAYLIST_OPTIONS_PER_KEYWORD));
                })
                .catch(err => errorMsg())
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


function createSpotifyLink(playlistOptions){
    var chosenPlaylist = playlistOptions[Math.floor(Math.random() * playlistOptions.length)];
    
    $('#playlists').append($(
        `<li class="playlist-item">
                <a href="${chosenPlaylist.shareUrl}" class="row valign-wrapper" target="_blank">
                <img class="responsive-img col s2" src="./assets/images/spotify.png" alt="Spotify logo"/>
                <h5 class="col s10 no-margin teal-text text-darken-2">${chosenPlaylist.name}</h5>
            </a>
        </li>`
    ));
}


//Save searched birthday history to localStorage
function saveSearchHistory(newMonth, newDay){
    var trulyNewItem = true;
    
    for (i = 0; i < searchHistory.length; i++)
        if (newMonth === searchHistory[i].month && newDay === searchHistory[i].day){
            trulyNewItem = false;
            searchHistory.unshift(searchHistory.splice(i, 1)[0]);
            break;
        }
    
    if (trulyNewItem){
        searchHistory.unshift({
            month: newMonth,
            day: newDay
        });
        
        if (searchHistory.length > MAX_NUM_SEARCH_HISTORY)
            searchHistory.pop();
    }

    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    loadSearchHistory();
}


// Load search history on page
function loadSearchHistory(){
    $('#birthday-history-list').empty();
    searchHistory.forEach(item => 
        $('#birthday-history-list').append(
            `<li class="collection-item no-padding">
                <button data-month=${item.month} data-day=${item.day} class="birthday-btn btn waves-effect waves-light brown lighten-1">${item.month} ${item.day}</button>
            </li>`
        )
    );
}


// Set year of copyright footer
function footerYr(){
    $('footer h6 span.yr').text(DateTime.now().toFormat('y'));
}


//Display error msg and auto-refresh page
function errorMsg(){
    var secsTillRefresh = 4;
    
    $('#results-wrapper')
        .empty()
        .append($(
            `<h5 id="error-msg" class="red-text text-darken-4 center-align">
                System error
                <br/>
                The page will refresh in <span>${secsTillRefresh} seconds</span>
            </h5>`
        ))
    ;
    
    setInterval(() => {
        secsTillRefresh--;

        if (secsTillRefresh === 0)
            window.location.reload();
        else
            $('#error-msg span').text(`${secsTillRefresh} second${secsTillRefresh > 1 ? 's' : ''}`);
    }, 1000);
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

    $('#results-wrapper').attr('style', 'display: block');
        $('#try-again').attr('style', 'display: none');
        $('#playlists').empty();
        $('#loading-graphic').append(loadingGraphic);

    getHoroscope(monthSelectorEl.val(), daySelectorEl.val());
});


//Upon clicking a search history button, submit that birthday again
$('#birthday-history-list').on('click', '.birthday-btn', function(){
    monthSelectorEl.val($(this).attr('data-month'));
    daySelectorEl.val($(this).attr('data-day'));
    
    monthSelectorEl.trigger('change');
    $('#birthday-input').trigger('submit');
})


//Required to load 'select' elements using Materialize
function materializeRefreshSelect(){
    $(document).ready(function(){
        $('select').formSelect();
    });
}


  
//INITIALIZE PAGE
monthSelectorEl.val(DateTime.now().toFormat('MMMM').toLowerCase()); // set initial month to today's
monthSelectorEl.trigger('change'); // initialize day dropdown w/ correct # of days for the initial month
daySelectorEl.val(+DateTime.now().toFormat('d')); // set initial day-of-month to today's
materializeRefreshSelect();

loadSearchHistory();

footerYr();
