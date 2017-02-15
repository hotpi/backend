import Promise from 'bluebird';

import xformT from './xformT';
import Patient from '../models/patient';
import Note from '../models/note';
import NoteLine from '../models/noteLine';
import EventEmitter from 'events';

import { patients, notes, noteLines } from '../controllers/ot';

export function transform(operations, receivedOp) {
  var transformedOperation = operations.reduce( (prev, next) => {
    return xformT(prev[0], next);
  }, [receivedOp, null])
  console.log('--transformed--')
  return transformedOperation[0];

}

export function apply(operationFunction) {
  if (typeof operationFunction !== 'function') {
    return 'Error: first argument of apply must be a function';
  }

  return operationFunction; 
}

export function getAccessPath(objectAccessPath) {
  console.log(objectAccessPath)
  if (objectAccessPath.length === 1) {
    return [objectAccessPath[0]['0']];
  } else if (objectAccessPath.length === 2) {
    return [objectAccessPath[0]['0'], objectAccessPath[1]['1']]
  } else if (objectAccessPath.length === 3) {
    return [objectAccessPath[0]['0'], objectAccessPath[1]['1'], objectAccessPath[2]['2']]
  }

  return [objectAccessPath[0]['0'], objectAccessPath[1]['1'], objectAccessPath[2]['2'], objectAccessPath[3]['3']]
}

export function insertNode(receivedOp) {
  const { accessPath, node } = receivedOp 
  // console.log(receivedOp)
  var newAccessPath = getAccessPath(accessPath) 
  
  var treeLevel = jumpToAccessPath(newAccessPath)
  console.log(treeLevel)
  
  if (treeLevel && typeof node.ID === undefined) {
    treeLevel = [
      ...treeLevel.slice(0, newAccessPath[newAccessPath.length-1]),
      node,
      ...treeLevel.slice(newAccessPath[newAccessPath.length-1]),
    ] 
  } else if (treeLevel && newAccessPath.length === 4) {
    treeLevel = treeLevel.slice(0, newAccessPath[newAccessPath.length-1]) + 
    node +
      treeLevel.slice(newAccessPath[newAccessPath.length-1]) 
  } else if (treeLevel && typeof node.ID !== undefined) {
    treeLevel = [
      ...treeLevel.slice(0, newAccessPath[newAccessPath.length-1]),
      node.ID,
      ...treeLevel.slice(newAccessPath[newAccessPath.length-1]),
    ] 
  } 
  else {
    treeLevel = [node]
  }

  console.log(node)
  console.log(treeLevel)
  saveChanges(newAccessPath, treeLevel, node)

  return;
} 

export function deleteNode(receivedOp) {
  const { accessPath } = receivedOp 

  var newAccessPath = getAccessPath(accessPath)
  var treeLevel = jumpToAccessPath(newAccessPath)
  console.log(treeLevel)

  if (newAccessPath.length < 4) {
    treeLevel = [
      ...treeLevel.slice(0, newAccessPath[newAccessPath.length-1]),
      ...treeLevel.slice(newAccessPath[newAccessPath.length-1] + 1)
    ]
  } else {
    treeLevel = treeLevel.slice(0, newAccessPath[newAccessPath.length-1]) +
      treeLevel.slice(newAccessPath[newAccessPath.length-1] + 1)
  }

  console.log(treeLevel)
  saveChanges(newAccessPath, treeLevel)
  return; //saveChanges(newAccessPath, applied, 'delete', deletedNode)
}

function saveChanges(accessPath, changes, newNode) {
  accessPath.reduce((prev, curr, index) => {
    switch (index) {
      case 0:
        if (accessPath.length === 1) {
          
          if (!newNode) {
            let currentPatients = Object.keys(patients).sort((a, b) => sortAlphabetically(a, b))
            delete patients[currentPatients[accessPath[0]]]
          } else {
            patients[changes[accessPath[0]]] = newNode            
          }

        }

        return Object.keys(patients).sort((a, b) => sortAlphabetically(a, b))
      case 1:
        if (accessPath.length === 2) {
          
          if (!newNode) {
            let currentNotes = patients[prev[accessPath[0]]].notes 
            delete notes[currentNotes[accessPath[1]]]
          } else {
            notes[changes[accessPath[1]]] = newNode
          }

          patients[prev[accessPath[0]]].notes = changes
        }

        return patients[prev[accessPath[0]]].notes
      case 2:
        if (accessPath.length === 3) {
          
          if (!newNode) {
            let currentNoteLines = notes[prev[accessPath[1]]].noteLines
            delete noteLines[currentNoteLines[accessPath[2]]]
          } else {
            noteLines[changes[accessPath[2]]] = newNode
          }

          notes[prev[accessPath[1]]].noteLines = changes
        }
        return notes[prev[accessPath[1]]].noteLines
      case 3:
        noteLines[prev[accessPath[2]]].text = changes
        return noteLines[prev[accessPath[2]]].text
    }
  }, {})
}

// return level of the tree with their elements AND the name of its collection
function jumpToAccessPath(accessPath) {
   return accessPath.reduce((prev, curr, index) => {
      switch (index) {
        case 0:
          return Object.keys(patients).sort((a, b) => sortAlphabetically(a, b))
        case 1: 
          return patients[prev[accessPath[0]]].notes
        case 2: 
          return notes[prev[accessPath[1]]].noteLines
        case 3:
          return noteLines[prev[accessPath[2]]].text
      }
    }, {})
 }

const sortAlphabetically = (a, b) => {
  if (a < b) {
    return -1;
  } else if (a > b) {
    return 1;
  } 

  return 0;
}
