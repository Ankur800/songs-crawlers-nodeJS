const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
const jsdom = require('jsdom');
const connectDB = require('./config/db');

// Connect to database
connectDB();

const Song = require('./models/Song');

const baseURL = 'https://songspk.mobi';

function makeGetRequest(url) {
    const http = new XMLHttpRequest();
    http.open('GET', url, false);
    http.send();
    return http.responseText;
}

exports.fetchResults = (link) => {
    const result = makeGetRequest(link); //got a page with some songs with ('a' + i)th character
    const dom = new jsdom.JSDOM(result);
    const numberOfSongs = dom.window.document.querySelectorAll(
        '.thumb-image a[href]'
    ).length;

    for (const i of Array(numberOfSongs).keys()) {
        //Particular Song

        const song = {
            name: '',
            parent_url: link,
            child_url: '',
            album: '',
            duration: '',
            singers: '',
            lyricist: '',
            music_director: '',
            download_320: '',
            download_128: '',
            image_url: '',
        };

        song.child_url =
            baseURL +
            dom.window.document.querySelectorAll('.thumb-image a[href]')[i]
                .href;
        const childResult = makeGetRequest(song.child_url);
        const childDom = new jsdom.JSDOM(childResult);

        let someRawData = childDom.window.document.querySelector(
            '.page-meta-wrapper'
        ).textContent;
        let currentDataToBeUsed = formatString(someRawData);
        //console.log(someRawData);

        //Download Links
        song.download_128 = childDom.window.document.querySelectorAll(
            '.page-down-btns a[href]'
        )[0].href;
        song.download_320 = childDom.window.document.querySelectorAll(
            '.page-down-btns a[href]'
        )[1].href;
        //console.log("Download-128: " + download_128);
        //console.log("Download-320: " + download_320);

        //Image URL
        song.image_url = childDom.window.document.querySelector(
            '.page-cover img'
        ).src;
        //console.log("IMAGE_ URL: " + imageURL);

        //Song Name
        let songNameData = childDom.window.document.querySelector('h1')
            .textContent;
        let tempName = songNameData.split('.MP3');
        const SONG_NAME = tempName[0].trim();
        const tempDataForFirstName = SONG_NAME.split('\n');
        const firstWordOfSong = tempDataForFirstName[0];
        //console.log("***********");
        console.log(SONG_NAME);
        song.name = SONG_NAME;

        //Raw Data
        if (currentDataToBeUsed.includes('Album')) {
            const temp = currentDataToBeUsed.split('Album');
            currentDataToBeUsed = temp[1];
        }

        //Album Name
        if (currentDataToBeUsed.includes('Duration')) {
            const temp = currentDataToBeUsed.split('Duration');
            const ALBUM = temp[0].trim();
            currentDataToBeUsed = temp[1];
            //console.log("ALBUM: " + ALBUM);
            song.album = ALBUM;
        }

        //Duration
        if (currentDataToBeUsed.includes('Singers')) {
            const temp = currentDataToBeUsed.split('Singers');
            const DURATION = temp[0].trim();
            currentDataToBeUsed = temp[1];
            //console.log("DURATION: " + DURATION);
            song.duration = DURATION;
        }

        //MUSIC DIRECTOR AND LYRICIST
        if (currentDataToBeUsed.includes('Music Director')) {
            //SINGERS
            const singersConatainingData = currentDataToBeUsed.split(
                'Music Director'
            );
            const SINGERS = singersConatainingData[0].trim();
            //console.log("Singers: " + SINGERS);
            song.singers = SINGERS;

            let directorContainingData = [];
            if (singersConatainingData[1].includes('Lyricist')) {
                directorContainingData = singersConatainingData[1].split(
                    'Lyricist'
                );
                const MUSIC_DIRECTOR = directorContainingData[0].trim();
                //console.log("Music Director: " + MUSIC_DIRECTOR);
                song.music_director = MUSIC_DIRECTOR;

                let lyricistContainingData = [];
                lyricistContainingData = directorContainingData[1].split(
                    firstWordOfSong
                );
                const LYRICIST = lyricistContainingData[0].trim();
                //console.log("LYRICIST: " + LYRICIST);
                song.lyricist = LYRICIST;
            } else {
                directorContainingData = singersConatainingData[1].split(
                    firstWordOfSong
                );
                const MUSIC_DIRECTOR = directorContainingData[0].trim();
                //console.log("Music Director: " + MUSIC_DIRECTOR);
                song.music_director = MUSIC_DIRECTOR;
            }
        } else {
            if (currentDataToBeUsed.includes('Lyricist')) {
                const singersConatainingData = currentDataToBeUsed.split(
                    'Lyricist'
                );
                const SINGERS = singersConatainingData[0].trim();
                //console.log("Singers: " + SINGERS);
                song.singers = SINGERS;

                let lyricistContainingData = [];
                lyricistContainingData = singersConatainingData[1].split(
                    firstWordOfSong
                );
                const LYRICIST = lyricistContainingData[0].trim();
                //console.log("LYRICIST: " + LYRICIST);
                song.lyricist = LYRICIST;
            } else {
                let singersConatainingData = [];
                singersConatainingData = currentDataToBeUsed.split(
                    firstWordOfSong
                );
                const SINGERS = singersConatainingData[0].trim();
                //console.log("SINGERS: " + SINGERS);
                song.singers = SINGERS;
            }
        }
        //console.log(song);
        const dbSong = new Song({
            name: song.name,
            parent_url: song.parent_url,
            child_url: song.child_url,
            album: song.album,
            duration: song.duration,
            singers: song.singers,
            lyricist: song.lyricist,
            music_director: song.music_director,
            download_128: song.download_128,
            download_320: song.download_320,
            image_url: song.image_url,
        });

        //console.log(dbSong);

        //await dbSong.save();
    }
};

function formatString(string) {
    while (string.charAt(0) === '\n' || string.charAt(0) === ' ') {
        string = string.substr(1);
    }
    const length = string.length;
    for (var i = 2; i < length; i++) {
        if (string.charAt(i) === '\n' && string.charAt(i - 1) === '\n') {
            string = string.substr(0, i) + string.substr(i + 1);
            i--;
        }
        if (string.charAt(i - 1) === '\n' && string.charAt(i) === ',') {
            string = string.substr(0, i - 1) + string.substr(i);
        }
        if (
            string.charAt(i - 2) === ',' &&
            string.charAt(i - 1) === ' ' &&
            string.charAt(i) === '\n'
        ) {
            string = string.substr(0, i - 1) + ' ' + string.substr(i + 1);
        }
    }

    return string;
}
