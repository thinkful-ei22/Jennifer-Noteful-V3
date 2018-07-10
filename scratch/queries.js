'use strict';

const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');

const Note = require('../models/notes');

// Find/Search for notes using Note.find
// mongoose.connect(MONGODB_URI)
//   .then(() => {
//     const searchTerm = 'Lady Gaga';
//     let filter = {};

//     if (searchTerm) {
//       filter.title = { $regex: searchTerm };
//     }

//     return Note.find(filter).sort({ updatedAt: 'desc' });
//   })    
//   .then(results => {
//     console.log(results);
//   })
//   .then(() => {
//     return mongoose.disconnect();
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });

// Find note by id using Note.findById
// mongoose.connect(MONGODB_URI)
//   .then(()=>{
//     const id = '000000000000000000000002';
//     return Note.findById(id);
//   })
//   .then(results => {
//     console.log(results);
//   })
//   .then(() => {
//     return mongoose.disconnect();
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });
// Create a new note using Note.create
// mongoose.connect(MONGODB_URI)
//   .then(()=>{
//     return Note.create({
//       title: 'testing',
//       content: 'cats and dogs can get along'
//     });
//   })
//   .then(() => {
//     return mongoose.disconnect();
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });
// Update a note by id using Note.findByIdAndUpdate
// mongoose.connect(MONGODB_URI)
//   .then(()=>{
//     const id = '5b450233d9e51972da013a15';
//     return Note.findByIdAndUpdate(id, {content: 'Cats and dogs might not like each other'});
//   })
//   .then(() => {
//     return mongoose.disconnect();
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });
// Delete a note by id using Note.findByIdAndRemove
// mongoose.connect(MONGODB_URI)
//   .then(()=>{
//     const id = '5b450233d9e51972da013a15';
//     return Note.findByIdAndRemove(id);
//   })
//   .then(() => {
//     return mongoose.disconnect();
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });