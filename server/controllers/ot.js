import Promise from 'bluebird';
import jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
import { transform, apply, insertNode, deleteNode } from '../helpers/otOperations';
import EventEmitter from 'events';

import Patient from '../models/patient';
import Note from '../models/note';
import NoteLine from '../models/noteLine';

const config = require('../../config/env');

const broadcaster = new EventEmitter()
var uid = 0
var history = []

const acknowledge = {
  acknowledge: true
}

const timeout = (ms, promise) => {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      resolve(JSON.stringify({empty: 'true'}))
    }, ms)
    promise.then(resolve, reject)
  })
}

const getBroadcast = () => {
  return timeout(10000, new Promise( (resolve, reject) => {
    // set timeout
    broadcaster.on('opReceived', (op) => {
      resolve(op)
    }) 
  }))
}

function receiveOp(req, res, next) {
  const { revisionNr, operation } = req.body
  var transformedOperation = operation
  
  if (revisionNr < history.length) {
    transformedOperation = transform(history.slice(revisionNr), operation)
  }

  apply(transformedOperation.type === 'insert' ? insertNode : deleteNode)(transformedOperation)
  history.push(transformedOperation)
  broadcaster.emit('opReceived', transformedOperation)
  res.send({'ok': 'ok'})
}

function status(req, res, next) {
  const { revisionNr, uid } = req.params

  if (revisionNr === history.length) {
    getBroadcast().then((op) => {
      if (typeof op.empty === 'undefined'){
        return res.json({ empty: true })
      }

      if (op.origin === uid) {
        res.json(acknowledge)
      } else {
        res.json(op)
      }
    })
  } 
}

function initialState(req, res, next) {
  Patient.list().then((patients) => {
      return Note.list().then((notes) => ({ patients, notes }))
    })
    .then(({ patients, notes }) => {
      return NoteLine.list().then((noteLines) => ({ patients, notes, noteLines }))
    })
    .then(({ patients, notes, noteLines }) => {
      console.log(patients, notes, noteLines)
      patients = {...formatResponse(patients)}
      notes = {...formatResponse(notes)}
      noteLines = {...formatResponse(noteLines)}
      const response = {
        patients,
        notes,
        noteLines
      }
      res.json(response)
    })
}

function formatResponse(objectToFormat) {
  const formattedArray = objectToFormat.map( object => {
    const { ID } = object
    console.log(object)
    
    return object
  })
  const formattedObject = {}
  formattedArray.forEach((object) => {
    formattedObject[object.ID] = { ...object._doc }
  })
  console.log(formattedObject)
  return formattedObject;
}

function subscribe(req, res, next) {
  res.json({ 
    uid: ++uid,
    revisionNr: history.length
  })
}

export default { receiveOp, status, subscribe, initialState };
