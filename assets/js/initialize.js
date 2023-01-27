
// IMPORTS
import {monthSelectorEl, daySelectorEl} from './dom-elements.js';
import {DateTime, materializeRefreshSelect, footerYr} from './helpers.js';
import {loadSearchHistory} from './search-history.js';



//INITIALIZE PAGE
monthSelectorEl.val(DateTime.now().toFormat("MMMM").toLowerCase()); // set initial month to today's
monthSelectorEl.trigger("change"); // initialize day dropdown w/ correct # of days for the initial month
daySelectorEl.val(+DateTime.now().toFormat("d")); // set initial day-of-month to today's
materializeRefreshSelect(); // render `select` elements using Materialize CSS framework

loadSearchHistory(); // load search history

footerYr(); // set footer's copyright year