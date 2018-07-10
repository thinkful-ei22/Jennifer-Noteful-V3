'use strict';

const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: String,
});

noteSchema.set('timestamps', true);  //assigns createdAt and updatedAt

module.exports = mongoose.model('Note', noteSchema); //collection will be "notes"