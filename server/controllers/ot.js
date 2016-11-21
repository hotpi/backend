import Promise from 'bluebird';
import jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
import { transform, apply, insertNode, deleteNode } from '../helpers/otOperations';
import EventEmitter from 'events';

import Patient from '../models/patient';
import Note from '../models/note';
import NoteLine from '../models/noteLine';
import OpHistory from '../models/ot';

import { otLogger } from '../../config/winston';
import { debugLogger } from '../../config/winston';

const config = require('../../config/env');

const broadcaster = new EventEmitter()
const lock = new EventEmitter()
var history = []
var uid = 0

OpHistory.getLatest().then( (latestHistory) => {
  debugLogger.debug('-latestHistory-', { latestHistory: latestHistory[0].history })
  history = latestHistory[0].history || []
}).catch( (err) => { debugLogger.debug('error', { error: err })})

setInterval( () => {
  debugLogger.debug('-history in RAM-', { history: history })
  debugLogger.debug('-latestRevisionNumber in RAM-', { revisionNumber: history.length })

  let db = new OpHistory({
    history: history,
    revisionNumber: history.length
  })

  db.save()
}, 5000)
  
const pendingOperations = []
var wait = false

const acknowledge = {
  acknowledge: true
}

const notify = (operation, uid, res) => {
  if (!res.headersSent) {
    otLogger.info('[BROADCASTER]: Sending op to listening clients', { operation: operation, history: history })

    if (operation.origin === uid) {
      res.json(acknowledge)
    } else {
      res.json(operation)
    }
    
    return;
  }
}

lock.on('unlocked', () => {
  otLogger.info('[LOCK]: Pending operations list', { pendingOperations: pendingOperations })
  if (pendingOperations.length > 0) {
    let next = pendingOperations.shift()
    otLogger.info('[LOCK]: Unlocked, applying next op', { nextOperation: next, needsToLockAgain: wait })
    
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
      otLogger.info('[CONTROL ALGORITHM]: Applied', { afterSavePromises: promises })
      Promise.all(promises).then( () => {
        otLogger.info('[CONTROL ALGORITHM]: Saving complete')
        lock.emit('unlocked')
      }).catch((err) => {
        otLogger.info('[CONTROL ALGORITHM]: Saving failed', { error: new Error(err) })
        throw new Error(err)
      })
    })
}

function receiveOp(req, res, next) {
  const { revisionNr, operation } = req.body
  var transformedOperation = operation
  otLogger.info('[CONTROL ALGORITHM]: New operation', { newOperation: transformedOperation })
  
  if (revisionNr < history.length) {
    otLogger.info('[CONTROL ALGORITHM]: Operation needs to be transformed')
    transformedOperation = transform(history.slice(revisionNr), operation)
    otLogger.info('[CONTROL ALGORITHM]: Operation transformed', { transformedOperation: transformedOperation })
  }

  if (!wait && transformedOperation.type !== 'no-op') {
    wait = true
    applyAndNotify(operation)
  } else {
    pendingOperations.push(transformedOperation)
    otLogger.info('[LOCK]: Locked, queueing operation', { pendingOperations: pendingOperations })
  }  
  otLogger.debug('---history loaded----', { history: history } )
  history.push(transformedOperation)

  otLogger.info('[CONTROL ALGORITHM]: History ', { history: history })
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
