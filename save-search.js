var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// schema for saving a recent search
var SaveSearchSchema = Schema({
  term: { type: String, required: true },
  when: { type: Date, required: true }
  
});

// create a model from this schema
var saveSearch = mongoose.model('search-histories',SaveSearchSchema);


module.exports = saveSearch;