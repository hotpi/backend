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
const lock = new EventEmitter()

var uid = 0
var history = []
const pendingOperations = []
var wait = false

const acknowledge = {
  acknowledge: true
}

const notify = (operation, uid, res) => {
  if (!res.headersSent) {
    /*console.log('-------sending op---------')
    console.log('----------------')
    console.log('----------------')
    console.log('----------------')
    console.log(operation)
    console.log(history)*/
    if (operation.origin === uid) {
      res.json(acknowledge)
    } else {
      res.json(operation)
    }
    
    return;
  }
}

lock.on('unlocked', () => {
  // console.log('------pending operations list------')
  // console.log(pendingOperations)
  if (pendingOperations.length > 0) {
    // console.log('unlocked, applying next op')
    let next = pendingOperations.shift()
    // console.log('---------------wait-------------')
    // console.log(wait)

    if (next.type !== 'no-op') {
      applyAndNotify(next)    
    } else {      
      lock.emit('unlocked') 
    } 
  }
  wait = pendingOperations.length !== 0
})

function applyAndNotify(operation) {
  apply(operation.type === 'insert' ? insertNode : deleteNode)(operation)
    .then((promises) => {
      // console.log('-------after save promises--------')
      // console.log(promises)
      Promise.all(promises).then( () => {
        lock.emit('unlocked')
      }).catch((err) => {
        console.log('something happened: ' + err)
        throw new Error(err)
      })
    })
}

function receiveOp(req, res, next) {
  const { revisionNr, operation } = req.body
  var transformedOperation = operation

  //console.log('--------------operation received---------------')
  //console.log(operation)
  if (revisionNr < history.length) {
    transformedOperation = transform(history.slice(revisionNr), operation)
  }
  //console.log('--------------transformed operation---------------')
  //console.log(transformedOperation)

  if (!wait && transformedOperation.type !== 'no-op') {
    wait = true
    applyAndNotify(operation)
  } else {
    // console.log('---------------new pending operation ------------')
    // console.log(pendingOperations)
    pendingOperations.push(transformedOperation)
    // console.log('------------------------------------')
    // console.log(pendingOperations)
  }  
  //console.log('-----------history------------')
  //console.log(history)
  history.push(transformedOperation)
  broadcaster.emit('newOp')
  res.send({'ok': 'ok'})
}

function status(req, res, next) {
  const broadcast = () => {
    notify(history[revisionNr], uid, res)
  }

  const { revisionNr, uid } = req.params
  var sent = false

  if (revisionNr === history.length) {
    broadcaster.once('newOp', broadcast)
  } else if (revisionNr < history.length) {
    notify(history[revisionNr], uid, res)
  }
 
  setTimeout(() => { 
    if (!res.headersSent) {
      broadcaster.removeListener('newOp', broadcast)
      res.json({ empty: true })
    }
  }, 10000)
  return;

}

function initialState(req, res, next) {
  Patient.list().then((patients) => {
      return Note.list().then((notes) => ({ patients, notes }))
    })
    .then(({ patients, notes }) => {
      return NoteLine.list().then((noteLines) => ({ patients, notes, noteLines }))
    })
    .then(({ patients, notes, noteLines }) => {
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
    return object
  })
  const formattedObject = {}

  formattedArray.forEach((object) => {
    formattedObject[object.ID] = { ...object._doc }
  })

  return formattedObject;
}

function subscribe(req, res, next) {
  res.json({ 
    uid: ++uid,
    revisionNr: history.length
  })
}

export default { receiveOp, status, subscribe, initialState };
