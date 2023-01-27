
// IMPORTS
import {daySelectorEl, monthSelectorEl, loadingGraphic} from './dom-elements.js';
import {DateTime, setNumDays, wordToTitleCase} from './helpers.js';
import {NUM_SPOTIFY_PLAYLISTS, getHoroscope} from './api-calls.js';



// LISTENERS

// Clicking 'Get Sounds' inside #try-again is the same as clicking the Get Sounds button
$("#try-again a").on("click", () => {
    $("#birthday-input").trigger("submit");
});
  

// Update # of days when month is (re-)selected
monthSelectorEl.on("change", function(event){
    event.preventDefault();
    setNumDays($(this).val());
});

  
// Upon birthday submission, begin the chain of API calls
$("#birthday-input").on("submit", event => {
    event.preventDefault();
    
    // read submitted values
    const submittedMonth = monthSelectorEl.val();
    const submittedDay = daySelectorEl.val();
    
    // set text in results header
    $("#todays-date span").text(DateTime.now().toFormat("MMMM d"));
    $("#searched-birthday span").text(
        `${wordToTitleCase(submittedMonth)} ${submittedDay}`
    );

    // hide playlist's #try-again text, and empty the #playlists ul
    $("#try-again").attr("style", "display: none");
    $("#playlists").empty();
    
    // show loading graphic
    $("#loading-graphic").append(loadingGraphic);
    
    // show results wrapper (if hidden)
    $("#results-wrapper").attr("style", "display: block");
    
    // update text of music header, based on multiple playlists vs. just one
    $('#music-header').text(`${NUM_SPOTIFY_PLAYLISTS > 1 ? 'Playlists' : 'A playlist'} for your horoscope`);
    
    // initialize chain of API calls
    getHoroscope(submittedMonth, submittedDay);
});
  

// Upon clicking a search history button, submit that birthday again
$("#birthday-history-list").on("click", ".birthday-btn", function(){
    // update selector element values to history button's day and month
    monthSelectorEl.val($(this).attr("data-month"));
    daySelectorEl.val($(this).attr("data-day"));
    
    // update number of days in day selector, and submit the birthday
    monthSelectorEl.trigger("change");
    $("#birthday-input").trigger("submit");
});