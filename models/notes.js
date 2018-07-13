'use strict';

const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: String,
  folderId:{type: mongoose.Schema.Types.ObjectId, ref: 'Folder' },
  tags: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tag'}]
});

noteSchema.set('timestamps', true);  //assigns createdAt and updatedAt

noteSchema.set('toObject', {
  virtuals: true,     // include built-in virtual `id`
  versionKey: false,  // remove `__v` version key
  transform: (doc, ret) => {
    delete ret._id;
    ret.folderId = doc.folderId; // delete `_id`
  }
});

module.exports = mongoose.model('Note', noteSchema); //collection will be "notes"