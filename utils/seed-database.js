'use strict';

const mongoose = require('mongoose');

const { MONGODB_URI } = require('../config');
const Note = require('../models/notes');
const Folder = require('../models/folders');
const Tag = require('../models/tags');

const seedNotes = require('../db/seed/notes');
const seedFolders = require('../db/seed/folders');
const seedTags = require('../db/seed/tags');

mongoose.connect(MONGODB_URI)
  .then(() => mongoose.connection.db.dropDatabase())
  .then(() => {
    return Promise.all([
      Note.insertMany(seedNotes),
      Folder.insertMany(seedFolders),
      Tag.insertMany(seedTags),
      Folder.createIndexes(),
      Tag.createIndexes()
    ])
      .then(results => {
        console.info(`Inserted ${results[0].length} Notes`); 
        console.info(`Inserted ${results[1].length} Folders`);
        console.info(`Inserted ${results[2].length} Tags`);
      })
      .then(() => mongoose.disconnect())
      .catch(err => {
        console.error(err);
      });
  });