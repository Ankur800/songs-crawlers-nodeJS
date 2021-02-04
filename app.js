const fs = require('fs');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const songsFetcher = require('./songs_fetcher');

const baseURL = 'https://songspk.mobi';

const fileData = fs.readFileSync('crawlsonglinks.txt', 'utf8');
const links = fileData.split('\n');

if (cluster.isMaster) {
    console.log(`I'm Master ${process.pid}`);

    // for (let i = 0; i < numCPUs; i++) {
    //     //Forking all 8 CPUs
    //     cluster.fork();
    // }
    for (const i of Array(numCPUs).keys()) {
        cluster.fork();
    }
} else {
    const wokerID = cluster.worker.id;
    songsFetcher.fetchResults(links[wokerID - 1]);
    songsFetcher.fetchResults(links[wokerID + 7]);
    songsFetcher.fetchResults(links[wokerID + 15]);
    if (wokerID === 1) {
        songsFetcher.fetchResults(links[24]);
    }
    if (wokerID === 2) {
        songsFetcher.fetchResults(links[25]);
    }

    //console.log(`I'm worker ${process.pid}`);
    process.exit();
}
