'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');
const Folder = require('../models/folders');
const seedFolders = require('../db/seed/folders');
const expect = chai.expect;

chai.use(chaiHttp);

describe('folders tests', ()=>{
  before(function () {
    return mongoose.connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });   
  beforeEach(function () {
    return Folder.insertMany(seedFolders);
  });   
  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });   
  after(function () {
    return mongoose.disconnect();
  });


  
});