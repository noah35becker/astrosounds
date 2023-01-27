
const localStorageVarName = 'astrosoundsSearchHistory';

const searchHistory = JSON.parse(localStorage.getItem(localStorageVarName)) || [];

const MAX_NUM_SEARCH_HISTORY = 4;


// Save searched birthday history to localStorage
export function saveSearchHistory(newMonth, newDay) {
    // if searched birthday is already present in search history, move it to the top of the search history list
    let trulyNewItem = true;
    for (let i = 0; i < searchHistory.length; i++)
        if (
            newMonth === searchHistory[i].month &&
            newDay === searchHistory[i].day
        ){
            trulyNewItem = false;
            searchHistory.unshift(searchHistory.splice(i, 1)[0]);
            break;
        }

    // otherwise, if the searched birthday is new to the search history, append to top of search history list
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
    localStorage.setItem(localStorageVarName, JSON.stringify(searchHistory));
    loadSearchHistory();
  }

  
// Load search history onto page
// (jQuery is imported via a <script> tag in index.html)
export function loadSearchHistory() {
    $("#birthday-history-list").empty();
    
    searchHistory.forEach(item =>
        $("#birthday-history-list").append(
            `<li class="collection-item no-padding">
                <button data-month=${item.month} data-day=${item.day} class="birthday-btn btn waves-effect waves-light brown lighten-1">${item.month} ${item.day}</button>
            </li>`
        )
    );
}