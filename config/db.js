const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        mongoose.connect('mongodb://localhost:27017/songDB', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        //console.log('MongoDB Connected...');
    } catch (err) {
        console.log(err.message);
        process.exit(1);
    }
};

module.exports = connectDB;