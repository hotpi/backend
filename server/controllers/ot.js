import jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
import Promise from 'bluebird';
import { transform, apply, insertNode, deleteNode } from '../helpers/otOperations';
import EventEmitter from 'events';

const config = require('../../config/env');

const broadcaster = new EventEmitter
var uid = 0
var history = []

const acknowledge = {
  acknowledge: true
}

const getBroadcast = () => {
  return new Promise( (resolve, reject) => {
    broadcaster.on('opReceived', (op) => {
      resolve(op)
    }) 
  }
}

function receiveOp(req, res, next) {
  const { revisionNr, operation } = req.body
  var transformedOperation = operation
  
  if (revisionNr < history.length) {
    transformedOperation = transform(history.slice(revisionNr), operation)
  }

  apply(transformedOperation.type === 'insert' ? insertNode : deleteNode)(transformedOperation)
  history.push(transformedOperation)
  handleBroadcast(transformedOperation)
  broadcaster.emit('opReceived', op)
}

function status(req, res, next) {
  const { revisionNr } = req.params
  const { uid } = req.body

  if (revisionNr === history.length) {
    getBroadcast().then((op) => {
      if (op.origin === uid) {
        res.json(acknowledge)
      } else {
        res.json(op)
      }
    })
  } 
}

function subscribe(req, res, next) {
  res.json(++uid)
}

export default { receiveOp, status, subscribe };
