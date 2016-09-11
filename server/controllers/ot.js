import jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
import Promise from 'bluebird';
import { transform, apply, insertNode, deleteNode } from '../helpers/otOperations';
import EventEmitter from 'events';

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
      resolve(new Response(JSON.stringify({empty: 'true'}), {ok: true}))
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
      if (op.origin === uid) {
        res.json(acknowledge)
      } else {
        res.json(op)
      }
    })

    return;
  } 
}

function subscribe(req, res, next) {
  res.json({ uid: ++uid })
}

export default { receiveOp, status, subscribe };
