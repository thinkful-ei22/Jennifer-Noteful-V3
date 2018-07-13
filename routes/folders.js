'use strict';

const express = require('express');
const Folder = require('../models/folders');
const router = express.Router();
const mongoose = require('mongoose');

// GET all /folders
//sort by name
router.get('/', (req, res, next) => {
  return Folder.find().sort({ name: 'asc' })     
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
// GET /folders by id
// Validate the id is a Mongo ObjectId
// Conditionally return a 200 response or a 404 Not Found
router.get('/:id', (req, res, next) => {
 
  const id = req.params.id;

  if(!(mongoose.Types.ObjectId.isValid(id))){
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }else{
    return Folder.findById(id)
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
  }});
// POST /folders to create a new folder
// Validate the incoming body has a name field
// Respond with a 201 status and location header
// Catch duplicate key error code 11000 and respond with a helpful error message (see below for sample code)
router.post('/', (req, res, next) => {
  const {name} = req.body;
  const newFolder = {
    name: name 
  };
  if (!newFolder.name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }
  return Folder.create(newFolder)
    .then(results => {
      if (results){
        res.location(`${req.originalUrl}/${res.id}`).status(201).json(results);
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
// PUT /folders by id to update a folder name
// Validate the incoming body has a name field
// Validate the id is a Mongo ObjectId
// Catch duplicate key error code 11000 and respond with a helpful error message
router.put('/:id', (req, res, next) => {
  const id = req.params.id;
  const {name} = req.body;
  const updatedFolder = {
    name: name
  };
  if (!updatedFolder.name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }
  return Folder.findByIdAndUpdate(id, updatedFolder)
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
// DELETE /folders by id which deletes the folder AND the related notes
// Respond with a 204 status
router.delete('/:id', (req, res, next) => {

  const id = req.params.id;
  return Folder.findByIdAndRemove(id)
    .then(()=>{
      res.status(204).end();
    });
});

module.exports = router;