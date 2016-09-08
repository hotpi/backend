import Promise from 'bluebird';

import xformT from './xformT';
import * from '../models';

const tree = {}

export function transform(operations, receivedOp) {
  receivedOp = operations.reduce( (prev, next) => {
    return xformT(prev, next);
  }, receivedOp)

  return receivedOp;
}

export function apply(operationFunction) {
  if (typeof operationFunction !== 'function') {
    return 'Error: first argument of apply must be a function';
  }

  return operationFunction(receivedOp); 
}

export function insertNode(receivedOp) {
  const { accessPath, node } = receivedOp 
  let insertAt = jumpToAccessPath(accessPath)
  let applied = [
    ...insertAt.slice(0, accessPath[receivedOp.accessPath.length-1] + 1),
    node,
    ...insertAt.slice(accessPath[receivedOp.accessPath.length-1] + 1),
  ]
  // translate back to the type of collection
  saveChanges(accessPath, applied, 'insert', node)
  // save to database
  return true; 
} 

export function deleteNode(receivedOp) {
  const { accessPath } = receivedOp 
  let deleteAt = jumpToAccessPath(accessPath)
  let deletedNode = deleteAt[accessPath[accessPath.length-1]]
  let applied = [
    ...deleteAt.slice(0, accessPath[accessPath.length-1]),
    ...deleteAt.slice(accessPath[accessPath.length-1] + 1)
    ]
  // translate back to the type of collection
  // save to database
  saveChanges(accessPath, applied, 'delete', deletedNode)

  return true;
}

function saveChanges(accessPath, changes, operation, node) {
  switch (accessPath.length) {
    case 1:
      const updatePromise = Patient.update({}, changes, { multi: true, upsert: true, overwrite: true }).execAsync()

      if (updatePromise.isFulfilled()) {
        return;
      }

      break;
    case 2:
      const updatePromise = Patient.update({ ID: getPatientList()[accessPath[0]].ID }, { notes: changes }, { overwrite: true }).execAsync()
      
      switch (operation) {  
        case  'insert':
          const note = new Note({
            ...node
          })

          const notePromise = note.saveAsync()

          if (notePromise.isFulfilled() && updatePromise.isFulfilled()) {
            return
          }        

          break;
        case 'delete':
          const deletedPromise = Note.remove({ ID: node.ID }).execAsync()
          
          if (deletedPromise.isFulfilled() && updatePromise.isFulfilled()) {
            return
          }

          break;
      } 
    case 3:
      const updatePromise = Note.update({ ID: getPatientNotes(getPatientList()[accessPath[0]].ID)[accessPath[1]].ID }, { noteLines: changes }, { overwrite: true }).execAsync()

      switch (operation) {
        case 'insert':
          const noteLine = new NoteLine({
            ...node
          })

          const noteLinePromise = noteLine.saveAsync()

          if (noteLinePromise.isFulfilled() && updatePromise.isFulfilled()) {
            return
          }

          break;
        case 'delete':
          const deletedPromise = NoteLine.remove({ ID: node.ID }).execAsync()
          
          if (deletedPromise.isFulfilled() && updatePromise.isFulfilled()) {
            return
          }

          break;
      }


    case 4:
      const updatePromise = NoteLine.update({ ID: getNoteNoteLines(getPatientNotes(getPatientList()[accessPath[0]].ID)[accessPath[1]].ID)[accessPath[3]].ID }, { text: changes }, { overwrite: true }).execAsync()
      
      if (updatePromise.isFulfilled()) {
        return
      }

      break;
    }
  }
}

// return level of the tree with their elements AND the name of its collection
function jumpToAccessPath(accessPath) {
  var patients = []
  var notes = []
  var noteLines = []
  var noteLineText = ''
  
  patients = getPatientList()
  
  if (accessPath.length > 1) {
    notes = getPatientNotes(patients[accessPath[0]].ID)
  }

  if (accessPath.length > 2) {
    noteLines = getNoteNoteLines(notes[accessPath[1]].ID)
  }

  if (accessPath.length > 3) {
    noteLineText = getNoteLineText(noteLines[accessPath[2]].ID)
  }

  switch (accessPath.length) {
    case 1: 
      if (typeof patients !== 'undefined') {
        return patients;
      }
    case 2:
      if (typeof notes !== 'undefined') {
        return notes;
      }

      break;
    case 3:
      if (typeof noteLines !== 'undefined') {
        return noteLines;
      }

      break;
    case 4:
      if (typeof noteLineText !== 'undefined') {
        return noteLineText;
      }

      break;
    default:
      //throw error
  }

}

function getPatientList() {
  const patientPromise = Patient.list()
  if (patientPromise.isFulfilled()) {
    patients = patientPromise.value()
  }

  return patients;
}

function getPatientNotes(patientId) {
  const patientNotesPromise = Patient.getPatientNotes(patientId)

  if (patientNotesPromise.isFulfilled()) {
    const notesPromise = Note.listOfPatientNotes(patientNotesPromise.value())
  } 

  if (notesPromise.isFulfilled()) {
    const notes = notesPromise.value()
  }

  return notes;
}

function getNoteNoteLines(noteId) {
  const noteNoteLinesPromise = Note.getNoteNoteLines(noteId)

  if (noteNoteLinesPromise.isFulfilled()) {
    const noteLinesPromise = NoteLine.listOfNoteNoteLines(noteNoteLinesPromise.value())
  }

  if (noteLinesPromise.isFulfilled()) {
    const noteLines = noteLinesPromise.value()
  }

  return noteLines;
}

function getNoteLineText(noteLineId) {
  const noteLinesTextPromise = NoteLine.getNoteLineText(noteLineId)

  if (noteLinesTextPromise.isFulfilled()) {
    const noteLinesText = noteLinesTextPromise.value()
  }

  return noteLinesText;
}
