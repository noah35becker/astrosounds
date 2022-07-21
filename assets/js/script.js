//GLOBAL VARIABLES

const DateTime = luxon.DateTime;

const DUMMY_LEAP_YR = 2024; // assume that all birthdays occur in a leap year (to ensure Feb 29 functionality)

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

//FUNCTIONS

// Get horoscope based on sign name
function getHoroscope(month, day) {
  var signName = getSignName(getDayOfYr(month, day));

  fetch(
    "https://sameer-kumar-aztro-v1.p.rapidapi.com/?sign=" +
      signName +
      "&day=today",
    {
      method: "POST",
      headers: {
        "X-RapidAPI-Key": "0998422ae9msh631f094298f7caep1b0a7bjsnf6c1671b7893",
        "X-RapidAPI-Host": "sameer-kumar-aztro-v1.p.rapidapi.com",
      },
    }
  )
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      return {
        color: data.color,
        desc: data.description,
        luckyNum: data.lucky_number,
        mood: data.mood,
      };
    })
    .catch((error) => console.log("system error"));
}

// Get sign name based on month and day
function getSignName(month, day) {
  var dayOfYr = +DateTime.fromFormat(
    `${month} ${day} ${DUMMY_LEAP_YR}`,
    "MMMM d y"
  ).toFormat("o");

  var sign = SIGNS.find((elem) => dayOfYr <= elem.lastDay);

  if (sign) return sign.name;
  else return "capricorn";
}

// Get key phrases given text input
function getKeyPhrases(inputText) {
  const options = {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'X-RapidAPI-Key': 'db93cfc0d2mshb30b8e666594cd2p1659b8jsn866b6f92afba',
      'X-RapidAPI-Host': 'textprobe.p.rapidapi.com'
    },
    body: '{"text":"Artificial intelligence is a hot area in the financial world right now.   In 2014, Google bought DeepMind with an acquisition price of more than $500 million.  Google is an even better investment than it was before, and investors are excited.  With my windfall, I purchased a yacht that is about 10m."}'
  };
  
  fetch('https://textprobe.p.rapidapi.com/topics', options)
    .then(response => response.json())
    .then(response => console.log(response))
    .catch(err => console.error(err));
}

getKeyPhrases("hello");
