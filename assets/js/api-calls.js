
// IMPORTS
import getSignName from './get-sign-name.js';
import {saveSearchHistory} from './search-history.js';
import {wordToTitleCase, errorMsg} from './helpers.js';



// SPOTIFY VARS
const SPOTIFY_API_CALL_BUFFER = 2500; // 2.5 secs
export const NUM_SPOTIFY_PLAYLISTS = 4;
const PLAYLIST_OPTIONS_PER_KEYWORD = 30;



export default async function apiChain(month, day){
    const horoscope = await getHoroscope(month, day);
    const keywords = await extractFromText(horoscope);
    const randomKeywords = randKeywords(keywords);
    spotifySearch(randomKeywords);
}


// Get horoscope based on birthday (really, based on sign name)
// (jQuery is imported via a <script> tag in index.html)
async function getHoroscope(month, day){
    // save date and month to search history
    saveSearchHistory(month, day);
    
    // get sign name based on birthdate
    const signName = getSignName(month, day);
    
    try{
        const horoscopeApiData = await fetch(
            `https://sameer-kumar-aztro-v1.p.rapidapi.com/?sign=${signName}&day=today`,
            {
                method: "POST",
                headers: {
                    "X-RapidAPI-Key": "0998422ae9msh631f094298f7caep1b0a7bjsnf6c1671b7893",
                    "X-RapidAPI-Host": "sameer-kumar-aztro-v1.p.rapidapi.com",
                },
            }
        );
        
        const data = await horoscopeApiData.json();
        
        const horoscope = {
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
        $("#sign-wrapper #lucky-number span").text(horoscope.luckyNum);
        $("#sign-wrapper #mood span").text(horoscope.mood);
        $("#sign-wrapper #color span").text(horoscope.color);  

        return horoscope;
    }catch{
        errorMsg();
    }
}


// Break down text from horoscope into keywords
async function extractFromText(horoscope){
    try{
        const keywordExtractorApiData = await fetch(  // call text extractor api, with horoscope description as search term
            "https://textprobe.p.rapidapi.com/topics",
            {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    "X-RapidAPI-Key": "db93cfc0d2mshb30b8e666594cd2p1659b8jsn866b6f92afba",
                    "X-RapidAPI-Host": "textprobe.p.rapidapi.com",
                },
                body: JSON.stringify({text: horoscope.desc})
            }
        );
        
        const data = await keywordExtractorApiData.json();
        
        return data.keywords;
    }catch{
        errorMsg();   
    }
}


// Select random subset of keywords out of total array of keywords
function randKeywords(keywords){
    const selectionOfKeywords = [];
    
    // get length of keywords array (initialized here because it changes when the array is spliced below)
    const keywordsLength = keywords.length;

    // while i < max # of playlists, and i < # of keywords
    // (the latter in case there are fewer keywords available than the max # of playlists)
    for (let i = 0; i < NUM_SPOTIFY_PLAYLISTS && i < keywordsLength; i++){
        // get random index of keywords and append word at that index to selected keywords array; also remove that word from the array, so it doesn't get randomly selected more than once
        const keyword = keywords.splice(Math.floor(Math.random() * keywords.length), 1)[0];
    
        if (keyword === 'problem') // omit the keyword 'problem', which breaks the spotify API call
            i--;
        else
            selectionOfKeywords.push(keyword);
    }

    return selectionOfKeywords;
}


// Spotify search function, using array of keywords as parameter
function spotifySearch(subsetOfKeywords){
    // Create link li inside #playlists ul
    function createSpotifyLink(playlistOptions){
        // from array of playlist options, choose random index and select that playlist
        const chosenPlaylist = playlistOptions[Math.floor(Math.random() * playlistOptions.length)];
        
        // append playlist item to #playlists ul
        $("#playlists").append($(
            `<li class="playlist-item">
                <a href="${chosenPlaylist.shareUrl}" class="row valign-wrapper" target="_blank">
                    <img class="responsive-img col s2" src="./assets/images/spotify.png" alt="Spotify logo" />
                    <h5 class="col s10 no-margin teal-text text-darken-2">${chosenPlaylist.name}</h5>
                </a>
            </li>`
        ));
    }

    // initalize Spotify API call time buffer (API limits to one call per second)
    let apiCallBuffer = SPOTIFY_API_CALL_BUFFER; //initialize to this val (rather than having the first API call run immediately) in case user clicks "Get Sounds" repeatedly in quick succession
    
    // for each random keyword
    subsetOfKeywords.forEach((term, index) => {
      
      setTimeout(async () => {
            try{
                // call spotify API, with random keyword as search term
                const spotifySearchApiData = await fetch(
                    `https://spotify-scraper.p.rapidapi.com/v1/search?term=${term}`,
                    {
                        method: "GET",
                        headers: {
                            "X-RapidAPI-Key": "0998422ae9msh631f094298f7caep1b0a7bjsnf6c1671b7893",
                            "X-RapidAPI-Host": "spotify-scraper.p.rapidapi.com",
                        },
                    }
                );
                const data = await spotifySearchApiData.json();
                
                if (index === subsetOfKeywords.length - 1){  // after the final Spotify API call, remove the loading graphic and show #try-again
                    $("#loading-graphic").empty();
                    $("#try-again").attr("style", "display: block");
                }
                    
                    // send a subset of the API's returned playlists to `createSpotifyLink`,
                    // a random playlist of which will be appended to the #playlists ul
                    createSpotifyLink(
                        data.playlists.items.slice(0, PLAYLIST_OPTIONS_PER_KEYWORD)
                    );
            }catch{
                errorMsg();
            }
        }, apiCallBuffer);
      
      apiCallBuffer += SPOTIFY_API_CALL_BUFFER;  // increment API call buffer, in order to stagger successive calls
    });
}