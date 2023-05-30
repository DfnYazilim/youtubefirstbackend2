const mongoose = require('mongoose')

const connectDB = () => {
    let db = mongoose.connect(process.env.CONNECTION_STRING, {'useNewUrlParser': true})
    return db;
}

module.exports = connectDB
