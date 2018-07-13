'use strict';

const express = require('express');
const Note = require('../models/notes');
const router = express.Router();
const mongoose = require('mongoose');

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
   
  const {searchTerm, folderId, tagId} = req.query;
  
  let filter = {};
  
  if (searchTerm) {
    filter.title = { $regex: searchTerm, $options: 'i' };
    filter.content = {$regex: searchTerm, $options: 'i' };
    return Note
      .find({$or: [{title: filter.title}, {content: filter.content}]})
      .populate('folderId tags')
      .sort({ updatedAt: 'desc' })     
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
  if (folderId) {
    filter.folderId = { folderId };
    return Note
      .find({folderId: folderId})
      .populate('folderId tags')
      .sort({ updatedAt: 'desc' })    
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
  if(tagId){
    filter.tags = { tagId };
    return Note
      .find({tags: tagId})
      .populate('folderId tags')
      .sort({ updatedAt: 'desc' })    
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
  return Note.find()
    .populate('folderId tags')
    .sort({ updatedAt: 'desc' })     
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
    const err = new Error('The `id` is not valid');
    err.status = 500;
    return next(err);
  }
  return Note.findById(id)
    .populate('folderId tags')
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
  const {title, content, folderId, tagId} = req.body;
  const newNote = {
    title: title, 
    content: content,
    folderId: folderId,
    tags: tagId
  };
  if (!newNote.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }
  if(!folderId){
    newNote.folderId = null;
  }
  if(!tagId){
    newNote.tags= [];
  }
  if(folderId && !(mongoose.Types.ObjectId.isValid(folderId))){
    const err = new Error('The `folderId` is not valid');
    err.status = 400;
    return next(err);
  }
  if(tagId){
    tagId.forEach(tag => {
      if(!mongoose.Types.ObjectId.isValid(tag)){
        const err = new Error('The `tagId` is not valid');
        err.status = 400;
        return next(err);
      }
    });
  }
  return Note.create(newNote)
    .then(results => {
      if (results){
        res.location(`${req.originalUrl}/${res.id}`).status(201).json(results);
      } else {
        next();
      }
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The note title already exists');
        err.status = 400;
      }
      next(err);
    });
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {
  const id = req.params.id;
  const {title, content, folderId, tagId} = req.body;
  const updatedNote = {
    title: title, 
    content: content, 
    folderId: folderId,
    tags: tagId
  };
  if (!updatedNote.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  } 
  if(folderId && !(mongoose.Types.ObjectId.isValid(folderId))){
    const err = new Error('The `folderId` is not valid');
    err.status = 400;
    return next(err);
  }
  if(tagId){
    tagId.forEach(tag => {
      if(!mongoose.Types.ObjectId.isValid(tag)){
        const err = new Error('The `tagId` is not valid');
        err.status = 400;
        return next(err);
      }
    });
  }
  return Note
    .findByIdAndUpdate(id, updatedNote)
    .populate('folderId tags')
    .then(results => {
      if (results){
        res.status(200).json(results);
      } else {
        next();
      }
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The folder name already exists');
        err.status = 400;
      }
      next(err);
    });
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