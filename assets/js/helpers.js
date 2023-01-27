
// IMPORT
import {daySelectorEl} from './dom-elements.js';

// LUXON (managing dates and times)
export const DateTime = luxon.DateTime; // `luxon` is imported via a <script> tag in index.html
export const DUMMY_LEAP_YR = 2024; // assume that all birthdays occur in a leap year (to ensure Feb 29 functionality)


// Populate user input 'days' dropdown with correct # of days for given month
// (jQuery is imported via a <script> tag in index.html)
export function setNumDays(month) {
    let firstOfThisMonth = DateTime.fromFormat(
        `${month} 1 ${DUMMY_LEAP_YR}`,
        "MMMM d y"
    );
    let firstOfNextMonth = firstOfThisMonth.plus({months: 1});
    let daysInMonth = firstOfNextMonth
        .diff(firstOfThisMonth, "days")
        .toObject().days;
  
    let daySelected = daySelectorEl.val() || 1;  // ACCOUNT FOR HTML ELEMENT
  
    daySelectorEl.empty();
    for (let i = 1; i <= daysInMonth; i++)
        daySelectorEl.append($(`<option value='${i}'>${i}</option>`));

    if (daySelected <= daysInMonth)
        daySelectorEl.val(daySelected);

    materializeRefreshSelect();
}
  

// Return a given word in Title Case
export function wordToTitleCase(word) {
    return word[0].toUpperCase() + word.substring(1);
}


// Set year of copyright in footer
export function footerYr() {
    $("footer h6 span.yr").text(DateTime.now().toFormat("y"));
}


// Display error msg and auto-refresh page
export function errorMsg() {
    let secsTillRefresh = 4;
    
    // Update results wrapper to display error message
    $("#results-wrapper")
        .empty()
        .append($(
            `<h5 id="error-msg" class="red-text text-darken-4 center-align">
                System error
                <br/>
                The page will refresh in <span>${secsTillRefresh} second${secsTillRefresh > 1 ? "s" : ""}</span>
            </h5>`
        ));

    // Run countdown clock that shows seconds until refresh on page;
    // auto-refresh at end of countdown
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


// Required to load `select` dropdown elements using Materialize CSS framework
// (if this function is called repeatedly, even though it's based on $(document).ready(),
// it will refresh the `select` elements based on their current <option>s;
// see `setNumDays` above)
export function materializeRefreshSelect() {
    $(document).ready(function() {
        $("select").formSelect();
    });
}