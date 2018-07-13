'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');
const Note = require('../models/notes');
const Tag = require('../models/tags');
const seedNotes = require('../db/seed/notes');
const seedTags = require('../db/seed/tags');
const expect = chai.expect;

chai.use(chaiHttp);



describe('tags tests', ()=>{

  before(function () {
    return mongoose.connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });   
  beforeEach(function () {
    const seedTheTags = Tag.insertMany(seedTags);
    const seedTheNotes = Note.insertMany(seedNotes);
    return Promise.all([seedTheNotes, seedTheTags]);
  });   
  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });   
  after(function () {
    return mongoose.disconnect();
  });

  describe('get tests', () => {
    it('should return a list of tags with valid info',()=>{
      return chai.request(app)
        .get('/api/tags')
        .then( res =>{
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a.a('array');
          return Tag.find()
            .then(data => {
              expect(res.body).to.have.length(data.length);
            });
        });
    });
    it('should return a one tag with correct id',()=>{
      let data;
      return Tag.findOne()
        .then(_data => {
          data = _data;
          return chai.request(app).get(`/api/tags/${data.id}`);
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
    it('should return a 400 error if tag id is invalid',()=>{
      const invalidId = '123-456';
      return chai.request(app).get(`/api/tags/${invalidId}`)
        .catch(error => {
          return error.response;
        })
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.eq('The `id` is not valid');
        });
    });
    it('should return a 404 error if tag id is valid but not in the db',()=>{
      return chai.request(app).get('/api/tags/DOESNOTEXIST')
        .catch(error => {
          return error.response;
        })
        .then(res => {
          expect(res).to.have.status(404);
        });
    });
  });
  describe('post tests', () => {
    it('should return a new tag when given valid data',()=>{
      const newTag = {
        'name':'Test'
      };
      let res;
      return chai.request(app)
        .post('/api/tags')
        .send(newTag)
        .then((_res)=>{
          res = _res;
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.keys('id', 'name', 'createdAt', 'updatedAt');
          return Tag.findById(res.body.id);
        })
        .then(data => {
          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(data.name);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });

    });
    it('should return 400 if missing name in request',()=>{
      const noNameTag = {
      };
      return chai.request(app).post('/api/tags')
        .send(noNameTag)
        .catch(error => {
          return error.response;
        })
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.eq('Missing `name` in request body');
        });
    });
  });
  describe('put tests', ()=>{
    it('should return an updated tag when given valid data', ()=>{
      const updatedTag = {
        'name': 'Improved'
      };
      return Tag
        .findOne()
        .then(data =>{
          updatedTag.id = data.id;
          return chai.request(app)
            .put(`/api/tags/${data.id}`)
            .send(updatedTag);
        })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.keys('id', 'name', 'createdAt', 'updatedAt');
          return Tag.findById(updatedTag.id)
            .then(data => {
              expect(updatedTag.id).to.equal(data.id);
              expect(updatedTag.name).to.equal(data.name);
            });
        });
    });
    it('should return 400 if missing name in request',()=>{
      const noNameTag = {
      };
      return chai.request(app).post('/api/tags')
        .send(noNameTag)
        .catch(error => {
          return error.response;
        })
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.eq('Missing `name` in request body');
        });
    });
    it('should return a 400 error if tag id is invalid',()=>{
      const invalidId = '123-456';
      return chai.request(app).get(`/api/tags/${invalidId}`)
        .catch(error => {
          return error.response;
        })
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.eq('The `id` is not valid');
        });
    });
    it('should return a 404 error if tag id is valid but not in the db',()=>{
      return chai.request(app).get('/api/tags/DOESNOTEXIST')
        .catch(error => {
          return error.response;
        })
        .then(res => {
          expect(res).to.have.status(404);
        });
    });
  });
  describe('delete tests', ()=>{
    it('should return a status of 204 and notes with id should be 0',()=>{
      const tagId = '222222222222222222222200';
      return Tag.findByIdAndRemove(tagId)
        .then(() => {
          return chai.request(app)
            .delete(`/api/tags/${tagId}`);
        })
        .then(res => {
          expect(res).to.have.status(204);
          expect(res.body).to.be.empty;
          return Tag.count({_id: tagId});
        })
        .then(count => {
          expect(count).to.equal(0);
          return Note.count({tags: tagId});
        })
        .then(count => {
          expect(count).to.equal(0);
        });
    });
    it('should return a 400 error if tag id is invalid',()=>{
      const invalidId = '123-456';
      return chai.request(app).get(`/api/tags/${invalidId}`)
        .catch(error => {
          return error.response;
        })
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.eq('The `id` is not valid');
        });    
    });
    it('should return a 404 error if tag id is valid but not in the db',()=>{
      return chai.request(app).get('/api/tags/DOESNOTEXIST')
        .catch(error => {
          return error.response;
        })
        .then(res => {
          expect(res).to.have.status(404);
        });
    });  
  });
});
