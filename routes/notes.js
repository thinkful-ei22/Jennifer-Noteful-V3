'use strict';

const express = require('express');
const Note = require('../models/notes');
const router = express.Router();
const mongoose = require('mongoose');

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
   
  const {searchTerm} = req.query;
  
  let filter = {};
  
  if (searchTerm) {
    filter.title = { $regex: searchTerm };
    filter.content = {$regex: searchTerm};
    return Note.find({$or: [{title: filter.title}, {content: filter.content}]}).sort({ updatedAt: 'desc' })     
      .then(results => {
        return results;
      })
      .then(result => {
        if(result){
          res.json(result);
        }else{
          next();
        }
      })
      .catch(err => {
        next(err);
      });
  }
  return Note.find().sort({ updatedAt: 'desc' })     
    .then(results => {
      return results;
    })
    .then(result => {
      if(result){
        res.json(result);
      }else{
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});


/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {
 
  const id = req.params.id;
  if(!(mongoose.Types.ObjectId.isValid(id))){
    return next('.');
  }
  return Note.findById(id)
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {
  const {title, content} = req.body;
  const newNote = {
    title: title, 
    content: content, 
  };
  if (!newNote.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }
  return Note.create(newNote)
    .then(results => {
      if (results){
        res.location(`${req.originalUrl}/${res.id}`).status(201).json(results);
      } else {
        next();
      }
    })
    .catch(err => next(err));
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {
  const id = req.params.id;
  const {title, content} = req.body;
  const updatedNote = {
    title: title, 
    content: content, 
  };
  if (!updatedNote.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  return Note.findByIdAndUpdate(id, updatedNote)
    .then(results => {
      if (results){
        res.json(results);
      } else {
        next();
      }
    })
    .catch(err => next(err));
});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {

  const id = req.params.id;
  return Note.findByIdAndRemove(id)
    .then(()=>{
      res.status(204).end();
    });
});

module.exports = router;