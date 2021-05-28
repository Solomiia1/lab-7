var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb+srv://Admin:Admin123@cluster0.ajfkp.mongodb.net/mudb');
console.log("mongodb connect...")
module.exports = mongoose;
