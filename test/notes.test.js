'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');
const Note = require('../models/notes');
const seedNotes = require('../db/seed/notes');
const Folder = require('../models/folders');
const seedFolders = require('../db/seed/folders');
const Tag = require('../models/tags');
const seedTags = require('../db/seed/tags');
const expect = chai.expect;

chai.use(chaiHttp);

describe('notes tests', ()=>{
  before(function () {
    return mongoose.connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });   
  beforeEach(function () {
    const seedTheNotes = Note.insertMany(seedNotes);
    const seedTheFolders = Folder.insertMany(seedFolders);
    const seedTheTags = Tag.insertMany(seedTags);
    return Promise.all([
      seedTheNotes, seedTheTags, seedTheFolders
    ]);
  });   
  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });   
  after(function () {
    return mongoose.disconnect();
  });

  describe('get requests', ()=>{
    it('should return a list of all notes', ()=>{
      return chai.request(app)
        .get('/api/notes')
        .then( res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          return Note.find()
            .then(data => {
              expect(res.body).to.have.length(data.length);
            });  
        });
    });
    it('should return one note with the correct id', ()=>{
      let data;
      return Note.findOne()
        .then(_data => {
          data = _data;
          return chai.request(app).get(`/api/notes/${data.id}`);
        })
        .then((res) =>{
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.keys('id', 'title', 'content', 'createdAt', 'updatedAt', 'folderId', 'tags');
          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(data.title);
          expect(res.body.content).to.equal(data.content);
          expect(res.body.folderId.id).to.equal(data.folderId.toString());
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });
    it('should respond with 500 given an invalidid', ()=>{
      const invalidId = '123-456';
      return chai.request(app).get(`/api/notes/${invalidId}`)
        .catch(error => {
          return error.response;
        })
        .then(res => {
          expect(res).to.have.status(500);
          expect(res.body.message).to.eq('The `id` is not valid');
        });
    });
    it('should respond 404 for nonexistant id', ()=>{
      return chai.request(app).get('/api/notes/DOESNOTEXIST')
        .catch(error => {
          return error.response;
        })
        .then(res => {
          expect(res).to.have.status(404);
        });
    });
    it('should return a list of notes that contain the search term', ()=>{
      const searchTerm = 'government';
      return chai.request(app)
        .get(`/api/notes?searchTerm=${searchTerm}`)
        .then(res => {
          const size = res.body.length;
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(size);
          expect(res.body[0]).to.be.a('object');
        });
    });
    it('should return a list of notes that match folder filter', ()=>{
      const folderId = '111111111111111111111103';
      return chai.request(app)
        .get(`/api/notes?searchTerm=&${folderId}=`)
        .then(res => {
          const size = res.body.length;
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(size);
          expect(res.body[0]).to.be.a('object');
        });
    });
  });
  describe('POST /api/notes', ()=>{
    it('should return a new note when provided with valid data', ()=>{
      const newNote = {
        'title': 'This is a new note about cats',
        'content': 'Blah blah blah, cats are ok, but I am allergic',
        'folderId': '111111111111111111111102',
        'tagId': ['222222222222222222222202', '222222222222222222222203']
      };
      let res;
      return chai.request(app)
        .post('/api/notes')
        .send(newNote)
        .then((_res)=>{
          res = _res;
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.keys('id','title','content', 'createdAt', 'updatedAt', 'folderId', 'tags');
          return Note.findById(res.body.id);
        })
        .then(data =>{
          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(data.title);
          expect(res.body.content).to.equal(data.content);
          expect(res.body.folderId.toString()).to.equal(data.folderId.toString());
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });
    it('should respond 400 if title missing', ()=>{
      const noTitleNote = {
        'content': 'this will not work because I do not have a title',
        'folderId': '111111111111111111111102' 
      };
      return chai.request(app).post('/api/notes')
        .send(noTitleNote)
        .catch(error => {
          return error.response;
        })
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.eq('Missing `title` in request body');
        });
    });
    it('should return a status of 400 is folderId not valid', ()=>{
      const invalidFolderIdNote = {
        'title': 'This is a new note about cats',
        'content': 'Blah blah blah, cats are ok, but I am allergic',
        'folderId': '123-456',
        'tags': ['222222222222222222222202', '222222222222222222222203']
      };
      return chai.request(app).post('/api/notes/')
        .send(invalidFolderIdNote)
        .catch(error => {
          return error.response;
        })
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.eq('The `folderId` is not valid');
        });
    });
    it('should return a status of 400 if tagId not valid', ()=>{
      const invalidTagIdNote = {
        'title': 'This is a new note about cats',
        'content': 'Blah blah blah, cats are ok, but I am allergic',
        'folderId': '111111111111111111111102',
        'tagId': ['nope']
      };
      return chai.request(app).post('/api/notes/')
        .send(invalidTagIdNote)
        .catch(error => {
          return error.response;
        })
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.eq('The `tagId` is not valid');
        });
    });
  });
  describe('PUT /api/notes/:id', ()=>{
    it('should update a note and return it when provided with valid data', ()=>{
      const updatedNote = {
        'title': 'This is a new note about lizards',
        'content': 'Blah blah blah, cats are ok, but I am not allergic to lizzards',
        'folderId': '111111111111111111111102',
        'tagId': ['222222222222222222222202', '222222222222222222222203']
      };
      return Note
        .findOne()
        .then(data => {
          updatedNote.id=data.id;
          return chai.request(app)
            .put(`/api/notes/${data.id}`)
            .send(updatedNote);
        })
        .then((res) =>{
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.keys('id', 'title', 'content', 'createdAt', 'updatedAt', 'folderId', 'tags');
          return Note.findById(updatedNote.id)
            .then(data =>{
              expect(updatedNote.id).to.equal(data.id);
              expect(updatedNote.title).to.equal(data.title);
              expect(updatedNote.content).to.equal(data.content);
              expect(updatedNote.folderId.toString()).to.equal(data.folderId.toString());
            });
        });
    });
    it('should respond with 500 given an invalidid', ()=>{
      const invalidId = '123-456';
      return chai.request(app).get(`/api/notes/${invalidId}`)
        .catch(error => {
          return error.response;
        })
        .then(res => {
          expect(res).to.have.status(500);
          expect(res.body.message).to.eq('The `id` is not valid');
        });
    });
    it('should respond 404 for nonexistant id', ()=>{
      return chai.request(app).get('/api/notes/DOESNOTEXIST')
        .catch(error => {
          return error.response;
        })
        .then(res => {
          expect(res).to.have.status(404);
        });
    });
    it('should return a status of 400 is folderId not valid', ()=>{
      const invalidFolderIdNote = {
        'title': 'This is a new note about cats',
        'content': 'Blah blah blah, cats are ok, but I am allergic',
        'folderId': '123-456',
        'tagId': ['222222222222222222222202', '222222222222222222222203']
      };
      return chai.request(app).put('/api/notes/:id')
        .send(invalidFolderIdNote)
        .catch(error => {
          return error.response;
        })
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.eq('The `folderId` is not valid');
        });
    });
    it('should return a status of 400 if tagId not valid', ()=>{
      const invalidTagIdNote = {
        'title': 'This is a new note about cats',
        'content': 'Blah blah blah, cats are ok, but I am allergic',
        'folderId': '111111111111111111111102',
        'tagId': ['nope']
      };
      return chai.request(app).put('/api/notes/:id')
        .send(invalidTagIdNote)
        .catch(error => {
          return error.response;
        })
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.eq('The `tagId` is not valid');
        });
    });
  });
  describe('DELETE api/notes/:id', ()=>{
    it('should delete a note with the matching id', ()=>{
      let data;
      return Note
        .findOne()
        .then(_data => {
          data = _data;
          return chai.request(app).delete(`/api/notes/${data.id}`);
        })
        .then(res => {
          expect(res).to.have.status(204);
          return Note.findById(data.id);
        })
        .then(_data => {
          expect(_data).to.be.null;
        });
    });
  });
});
