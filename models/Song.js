const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
    name: String,
    parent_url: String,
    child_url: String,
    album: String,
    duration: String,
    singers: String,
    lyricist: String,
    music_director: String,
    download_128: String,
    download_320: String,
    image_url: String,
});

module.exports = Song = mongoose.model('Song', songSchema);
