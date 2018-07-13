'use strict';

const express = require('express');
const Tag = require('../models/tags');
const Note = require('../models/notes');
const router = express.Router();
const mongoose = require('mongoose');

//get all tags
router.get('/', (req, res, next)=>{
  return Tag.find().sort({name: 'asc'})
    .then(results => {
      if(results){
        res.json(results);
      } else {
        next();
      }   
    })
    .catch(err => {
      next(err);
    });
});

//get tag by id
router.get('/:id', (req, res, next)=>{
  const id = req.params.id;
  if(!mongoose.Types.ObjectId.isValid(id)){
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }else{
    return Tag.findById(id)
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
  }});
//create a tag
router.post('/', (req, res, next)=>{
  const {name} = req.body;
  const newTag = {
    name: name
  };
  if(!newTag.name){
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }
  return Tag.create(newTag)
    .then(result => {
      if(result){
        res.location(`${req.originalUrl}/${res.id}`).status(201).json(result);
      }else{
        next();
      }
    })
    .catch(err =>{
      if (err.code === 11000) {
        err = new Error('The tag name already exists');
        err.status = 400;
      }
      next(err);
    });
});
//update a tag
router.put('/:id', (req, res, next)=>{
  const id = req.params.id;
  const {name} = req.body;
  const updatedTag = {
    name: name
  };
  if(!updatedTag.name){
    const err = new Error('Missing `name` in request body');
    err.status=400;
    return next(err);
  }
  return Tag.findByIdAndUpdate(id, updatedTag)
    .then(result =>{
      if(result){
        res.status(200).json(result);
      }else{
        next();
      }
    })
    .catch(err =>{
      if(err.code === 11000){
        err = new Error('The tag name already exists');
        err.status(400);
      }
      next(err);
    });     
});
//delete a tag
router.delete('/:id', (req, res, next) => {
  const id = req.params.id;
  return Tag.findByIdAndRemove(id)
    .then(()=>{})//should this come before the return?
  //loop through notes (updateMany()? forEach?)
  //check if tags array contains id
  //remove id from tags array
    .then(()=>{
      res.status(204).end();
    });
});


module.exports =router;