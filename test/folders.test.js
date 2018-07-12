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

  describe('GET all, GET by id /api/folders/:id', ()=>{
    it('should return a list of all folders', ()=>{
      return chai.request(app)
        .get('/api/folders')
        .then( res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          return Folder.find()
            .then(data => {
              expect(res.body).to.have.length(data.length);
            });  
        });
    });
    it('should return one note with the correct id', ()=>{
      let data;
      return Folder.findOne()
        .then(_data => {
          data = _data;
          return chai.request(app).get(`/api/folders/${data.id}`);
        })
        .then((res) =>{
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.keys('id', 'name', 'createdAt', 'updatedAt');
          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(data.name);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });
    it('should respond with 400 given an invalidid', ()=>{
      const invalidId = '123-456';
      return chai.request(app).get(`/api/folders/${invalidId}`)
        .catch(error => {
          return error.response;
        })
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.eq('The `id` is not valid');
        });
    });
    it('should respond 404 for nonexistant id', ()=>{
      return chai.request(app).get('/api/folders/DOESNOTEXIST')
        .catch(error => {
          return error.response;
        })
        .then(res => {
          expect(res).to.have.status(404);
        });
    });
  });
  describe('POST /api/folders', ()=>{
    it('should return a new folder when provided with valid data', ()=>{
      const newFolder = {
        'name': 'Later',
      };
      let res;
      return chai.request(app)
        .post('/api/folders')
        .send(newFolder)
        .then((_res)=>{
          res = _res;
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.keys('id', 'name', 'createdAt', 'updatedAt');
          return Folder.findById(res.body.id);
        })
        .then(data =>{
          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(data.name);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });
  });
  describe('PUT /api/folders/:id', ()=>{
    it('should update a folder and return it when provided with valid data', ()=>{
      const updatedFolder = {
        'name': 'New'
      };
      return Folder
        .findOne()
        .then(data => {
          updatedFolder.id=data.id;
          return chai.request(app)
            .put(`/api/folders/${data.id}`)
            .send(updatedFolder);
        })
        .then((res) =>{
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.keys('id', 'name', 'createdAt', 'updatedAt');
          return Folder.findById(updatedFolder.id)
            .then(data =>{
              expect(updatedFolder.id).to.equal(data.id);
              expect(updatedFolder.name).to.equal(data.name);
            });
        });
    });
  });
  describe('DELETE api/folder/:id', ()=>{
    it('should delete a folder with the matching id', ()=>{
      let data;
      return Folder
        .findOne()
        .then(_data => {
          data = _data;
          return chai.request(app).delete(`/api/folders/${data.id}`);
        })
        .then(res => {
          expect(res).to.have.status(204);
          return Folder.findById(data.id);
        })
        .then(_data => {
          expect(_data).to.be.null;
        });
    });
  });
});