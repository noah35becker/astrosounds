


function getHoroscope(sign){

    fetch('https://sameer-kumar-aztro-v1.p.rapidapi.com/?sign=' + sign + '&day=today',
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
            console.log(data);
            return {
                color: data.color,
                desc: data.description,
                luckyNum: data.lucky_number,
                mood: data.mood
            };
        })
        .catch(error =>
            console.log('system error')
        );

}



//TESTER CODE
var horoscope = getHoroscope('sagittarius');
