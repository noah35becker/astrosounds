
//GLOBAL VARIABLES

const DateTime = luxon.DateTime;

// variables for sign based on birth date and month
const DUMMY_LEAP_YR = 2024; // assume that all birthdays occur in a leap year (to ensure Feb 29 functionality)

// astrological signs
class Sign {
  constructor(name, lastDayOfLeapYr) {
    this.name = name;
    this.lastDay = lastDayOfLeapYr;
  }
}
const SIGNS = [
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

// variables for certain page elements
const monthSelectorEl = $('select[name="month"]');
const daySelectorEl = $('select[name="day"]');
const signWrapperEl = $("#sign-wrapper");

// search history variables
var searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];
const MAX_NUM_SEARCH_HISTORY = 4;

// variables for spotify search & link creation
const SPOTIFY_API_CALL_BUFFER = 2500; //2.5 seconds
const NUM_SPOTIFY_PLAYLISTS = 4;
const PLAYLIST_OPTIONS_PER_KEYWORD = 30;

// Materialize CSS framework: graphic for loading spinner
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
function setNumDays(month) {
  var firstOfThisMonth = DateTime.fromFormat(
    `${month} 1 ${DUMMY_LEAP_YR}`,
    "MMMM d y"
  );
  var firstOfNextMonth = firstOfThisMonth.plus({ months: 1 });
  var daysInMonth = firstOfNextMonth
    .diff(firstOfThisMonth, "days")
    .toObject().days;

  var daySelected = daySelectorEl.val() || 1;

  daySelectorEl.empty();
  for (i = 1; i <= daysInMonth; i++)
    daySelectorEl.append($(`<option value='${i}'>${i}</option>`));

  if (daySelected <= daysInMonth)
    daySelectorEl.val(daySelected);

  materializeRefreshSelect();
}

// Return a given word in Title Case
function wordToTitleCase(word) {
  chars = word.split("");
  chars[0] = chars[0].toUpperCase();
  return chars.join("");
}

// Get horoscope based on birthday (really, based on sign name)
function getHoroscope(month, day) {
  // get sign name based on birthdate
  var signName = getSignName(month, day);
  // call horoscope api (passing sign name)
  fetch(
    `https://sameer-kumar-aztro-v1.p.rapidapi.com/?sign=${signName}&day=today`,
    {
      method: "POST",
      headers: {
        "X-RapidAPI-Key": "0998422ae9msh631f094298f7caep1b0a7bjsnf6c1671b7893",
        "X-RapidAPI-Host": "sameer-kumar-aztro-v1.p.rapidapi.com",
      },
    }
  )
    .then(response => response.json())
    .then(data => {
        // create horoscope object from api call data
        var horoscopeObj = {
            color: data.color,
            desc: data.description,
            luckyNum: data.lucky_number,
            mood: data.mood,
        };
        // update sign wrapper to display data returned from api call
        $("#sign-wrapper img")
            .attr("src", `./assets/images/signs/${signName}.png`)
            .attr("alt", wordToTitleCase(signName) + " symbol");
        $("#sign-wrapper h5").text(signName);
        $("#sign-wrapper #lucky-number span").text(horoscopeObj.luckyNum);
        $("#sign-wrapper #mood span").text(horoscopeObj.mood);
        $("#sign-wrapper #color span").text(horoscopeObj.color);
        console.log(horoscopeObj);
        console.log(horoscopeObj.desc);
      // call extractFromText api (passing horoscope object)
      extractFromText(horoscopeObj);
    })
    .catch(err => errorMsg());
  // save date and month to search history
  saveSearchHistory(month, day);
}

// Get sign name based on month and day
function getSignName(month, day) {
  // turn <month, day> into <day of year>
  var dayOfYr = +DateTime.fromFormat(
    `${month} ${day} ${DUMMY_LEAP_YR}`,
    "MMMM d y"
  ).toFormat("o");
  // return sign based on day of year
  var sign = SIGNS.find(elem => dayOfYr <= elem.lastDay);
  if (sign)
    return sign.name;
  else
    return "capricorn";
}

// Break down text from horoscope into keywords
function extractFromText(horoscopeObj) {
  // initialize fetch method, headers, body
  const options = {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "X-RapidAPI-Key": "db93cfc0d2mshb30b8e666594cd2p1659b8jsn866b6f92afba",
      "X-RapidAPI-Host": "textprobe.p.rapidapi.com",
    },
    body: '{"text":"' + horoscopeObj.desc + '"}',
  };
  // call text extractor api, with horoscope description as search term
  fetch("https://textprobe.p.rapidapi.com/topics", options)
    .then(response => response.json())
    // pass extracted keywords to spotify search function
    .then(data => {
      console.log([...data.keywords]);
      spotifySearch(data.keywords);
    })
    .catch(err => errorMsg());
}

// Spotify search function, using array of keywords as parameter
function spotifySearch(keywords) {
  // initialize fetch method, headers
  const options = {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": "0998422ae9msh631f094298f7caep1b0a7bjsnf6c1671b7893",
      "X-RapidAPI-Host": "spotify-scraper.p.rapidapi.com",
    },
  };
  // get random subset of keywords
  var randomKeywords = randKeywords(keywords);
  console.log(randomKeywords);
  // create api call buffer (api limits to one call per sec)
  var apiCallBuffer = SPOTIFY_API_CALL_BUFFER; //initialize to this val (rather than having the first API call run immediately) in case user clicks "Get Sounds" repeatedly in quick succession
  // for each random keyword
  randomKeywords.forEach((term, index) => {
    // call spotify scraper, with random keyword as search term
    setTimeout(() => {
      fetch(
        `https://spotify-scraper.p.rapidapi.com/v1/search?term=${term}`,
        options
      )
        .then(response => response.json())
        .then(data => {
          if (index === randomKeywords.length - 1) {
            // after the final Spotify API call, remove the loading graphic and show #try-again
            $("#loading-graphic").empty();
            $("#try-again").attr("style", "display: block");
          }
          // call createSpotifyLink function to append a playlist to #playlists ul (passing a subset of the returned playlists for the given keyword)
          createSpotifyLink(
            data.playlists.items.slice(0, PLAYLIST_OPTIONS_PER_KEYWORD)
          );
        })
        .catch(err => errorMsg());
    }, apiCallBuffer);
    // increment api call buffer
    apiCallBuffer += SPOTIFY_API_CALL_BUFFER;
  });
}

// Select random keyword from array of keywords
function randKeywords(keywords) {
  // initialize empty array of selected words
  var selectionOfKeywords = [];
  
  // get length of keywords array (set here because it changes when the array is spliced below)
  const keywordsLength = keywords.length;

  // while i < max # of playlists, and i < # of keywords (the latter in case there are fewer keywords available than the max # of playlists)
  for (i = 0; i < NUM_SPOTIFY_PLAYLISTS && i < keywordsLength; i++){
    // get random index of keywords and append word at that index to selected keywords array; also remove that word from the array, so it doesn't get randomly selected more than once
    var keyword = keywords.splice(Math.floor(Math.random() * keywords.length), 1)[0];

    if (keyword === 'problem') // omit the keyword 'problem', which breaks the spotify api call
      i--;
    else
      selectionOfKeywords.push(keyword);
  }
  // return the random subset of keywords
  return selectionOfKeywords;
}

// Create link li inside #playlists ul
function createSpotifyLink(playlistOptions) {
  console.log(playlistOptions);
  // from array of playlist options, choose random index and select that playlist
  var chosenPlaylist =
    playlistOptions[Math.floor(Math.random() * playlistOptions.length)];
  // append playlist button to playlists ul
  $("#playlists").append(
    $(
      `<li class="playlist-item">
                <a href="${chosenPlaylist.shareUrl}" class="row valign-wrapper" target="_blank">
                <img class="responsive-img col s2" src="./assets/images/spotify.png" alt="Spotify logo"/>
                <h5 class="col s10 no-margin teal-text text-darken-2">${chosenPlaylist.name}</h5>
            </a>
        </li>`
    )
  );
}

// Save searched birthday history to localStorage
function saveSearchHistory(newMonth, newDay) {
  // if searched birthday is already present in search history, move it to the top of the search history list
  var trulyNewItem = true;
  for (i = 0; i < searchHistory.length; i++)
    if (
      newMonth === searchHistory[i].month &&
      newDay === searchHistory[i].day
    ) {
      trulyNewItem = false;
      searchHistory.unshift(searchHistory.splice(i, 1)[0]);
      break;
    }
  // otherwise, if the searched birthday is new to the search history, append to front of search history
  if (trulyNewItem) {
    searchHistory.unshift({
      month: newMonth,
      day: newDay,
    });
    // if search history is now too long, remove its last item
    if (searchHistory.length > MAX_NUM_SEARCH_HISTORY)
      searchHistory.pop();
  }
  // save to localStorage and reload search history on page
  localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
  loadSearchHistory();
}

// Load search history on page
function loadSearchHistory() {
  $("#birthday-history-list").empty();
  searchHistory.forEach(item =>
    $("#birthday-history-list").append(
      `<li class="collection-item no-padding">
        <button data-month=${item.month} data-day=${item.day} class="birthday-btn btn waves-effect waves-light brown lighten-1">${item.month} ${item.day}</button>
      </li>`
    )
  );
}

// Set year of copyright in footer
function footerYr() {
  $("footer h6 span.yr").text(DateTime.now().toFormat("y"));
}

// Display error msg and auto-refresh page
function errorMsg() {
  var secsTillRefresh = 4;
  // Update results wrapper to display error message
  $("#results-wrapper")
    .empty()
    .append(
      $(
        `<h5 id="error-msg" class="red-text text-darken-4 center-align">
            System error
            <br/>
            The page will refresh in <span>${secsTillRefresh} second${secsTillRefresh > 1 ? "s" : ""}</span>
        </h5>`
      )
    );
  // Run countdown clock that shows seconds until refresh on page; auto-refresh at end of countdown
  setInterval(() => {
    secsTillRefresh--;

    if (secsTillRefresh === 0)
      window.location.reload();
    else
      $("#error-msg span").text(
        `${secsTillRefresh} second${secsTillRefresh > 1 ? "s" : ""}`
      );
  }, 1000);
}

// Required to load 'select' elements using Materialize CSS framework
function materializeRefreshSelect() {
  $(document).ready(function () {
    $("select").formSelect();
  });
}


//LISTENERS

// Clicking 'Get Sounds' inside #try-again is the same as clicking the Get Sounds button
$("#try-again a").on("click", function () {
  $("#birthday-input").trigger("submit");
});

// Update # of days when month is (re-)selected
monthSelectorEl.on("change", function (event) {
  event.preventDefault();
  setNumDays($(this).val());
});

// Upon birthday submission, begin the chain of API calls
$("#birthday-input").on("submit", function (event) {
  event.preventDefault();
  // read submitted values
  var submittedMonth = monthSelectorEl.val();
  var submittedDay = daySelectorEl.val();
  // set values in results header
  $("#todays-date span").text(DateTime.now().toFormat("MMMM d"));
  $("#searched-birthday span").text(
    `${wordToTitleCase(submittedMonth)} ${submittedDay}`
  );
  // hide playlist #try-again text, and empty the playlists ul
  $("#try-again").attr("style", "display: none");
  $("#playlists").empty();
  // show loading graphic
  $("#loading-graphic").append(loadingGraphic);
  // show results wrapper (if hidden)
  $("#results-wrapper").attr("style", "display: block");
  // update text of music header, based on multiple playlists vs. just one
  $('#music-header').text(`${NUM_SPOTIFY_PLAYLISTS > 1 ? 'Playlists' : 'A playlist'} for your horoscope`);
  // call horoscope function
  getHoroscope(submittedMonth, submittedDay);
});

// Upon clicking a search history button, submit that birthday again
$("#birthday-history-list").on("click", ".birthday-btn", function () {
  // update selector element values to history button's day and month
  monthSelectorEl.val($(this).attr("data-month"));
  daySelectorEl.val($(this).attr("data-day"));
  // update number of days in day selector, and submit the birthday
  monthSelectorEl.trigger("change");
  $("#birthday-input").trigger("submit");
});


//INITIALIZE PAGE
monthSelectorEl.val(DateTime.now().toFormat("MMMM").toLowerCase()); // set initial month to today's
monthSelectorEl.trigger("change"); // initialize day dropdown w/ correct # of days for the initial month
daySelectorEl.val(+DateTime.now().toFormat("d")); // set initial day-of-month to today's
materializeRefreshSelect(); // load select elements using Materialize CSS framework
loadSearchHistory(); // load search history
footerYr(); // set footer's copyright year
