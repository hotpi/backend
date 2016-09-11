import Promise from 'bluebird';

import xformT from './xformT';
import Patient from '../models/patient';
import Note from '../models/note';
import NoteLine from '../models/noteLine';

const tree = {}

export function transform(operations, receivedOp) {
  console.log('transform')
  receivedOp = operations.reduce( (prev, next) => {
    return xformT(prev, next);
  }, receivedOp)

  return receivedOp[0];
  
}

export function apply(operationFunction) {
  console.log('apply')

  if (typeof operationFunction !== 'function') {
    return 'Error: first argument of apply must be a function';
  }

  return operationFunction; 
}

export function insertNode(receivedOp) {
  console.log('insert')

  const { accessPath, node } = receivedOp 
  let insertAt = jumpToAccessPath(accessPath)
    .then((treeLevel) => {
      let applied = [
        ...treeLevel.slice(0, accessPath[receivedOp.accessPath.length-1] + 1),
        node,
        ...treeLevel.slice(accessPath[receivedOp.accessPath.length-1] + 1),
      ]
      // translate back to the type of collection
      return saveChanges(accessPath, applied, 'insert', node)
    })
    .then((something) => {
      console.log(something)
    })
  // save to database
  return true; 
} 

export function deleteNode(receivedOp) {
  console.log('delete')
  const { accessPath } = receivedOp 
  let deleteAt = jumpToAccessPath(accessPath)
    .then((treeLevel) => {
      let deletedNode = treeLevel[accessPath[accessPath.length-1]]
      
      let applied = [
        ...treeLevel.slice(0, accessPath[accessPath.length-1]),
        ...treeLevel.slice(accessPath[accessPath.length-1] + 1)
        ]
      
      return saveChanges(accessPath, applied, 'delete', deletedNode)
    })
    .then(({ updated, saved }) => {
      console.log(updated, saved)
    })
  // translate back to the type of collection
  // save to database

  return true;
}

function saveChanges(accessPath, changes, operation, node) {
  console.log('save')
  getPatientList().then(patients => {
    switch (accessPath.length) {
      case 1:
        var updatePromise = Patient.update({}, changes, { multi: true, upsert: true, overwrite: true }).execAsync()

        return updatePromise
      case 2:
        var updatePromise = Patient.update({ ID: patients[accessPath[0]].ID }, { notes: changes }, { overwrite: true }).execAsync()
        
        switch (operation) {  
          case  'insert':
            const note = new Note({
              ...node
            })

            var savePromise = note.saveAsync()

            return { savePromise, updatePromise }
          case 'delete':
            var deletedPromise = Note.remove({ ID: node.ID }).execAsync()
            
            return { deletedPromise, updatePromise }
        } 
      case 3:
        var updatePromise = Note.update({ ID: getPatientNotes(getPatientList()[accessPath[0]].ID)[accessPath[1]].ID }, { noteLines: changes }, { overwrite: true }).execAsync()

        switch (operation) {
          case 'insert':
            const noteLine = new NoteLine({
              ...node
            })

            var savePromise = noteLine.saveAsync()

            return { savePromise, updatePromise }
          case 'delete':
            var deletedPromise = NoteLine.remove({ ID: node.ID }).execAsync()
            
            return { deletedPromise, updatePromise }
        }


      case 4:
        var updatePromise = NoteLine.update({ ID: getNoteNoteLines(getPatientNotes(getPatientList()[accessPath[0]].ID)[accessPath[1]].ID)[accessPath[3]].ID }, { text: changes }, { overwrite: true }).execAsync()
        
        return { updatePromise }
    }
  })
}

// return level of the tree with their elements AND the name of its collection
function jumpToAccessPath(accessPath) {
  console.log('jump')
  var patients = []
  var notes = []
  var noteLines = []
  var noteLineText = ''
  
  return getPatientList()
    .then((patients) => {
      console.log(accessPath)
        if (accessPath.length > 1) {
         let prom = getPatientNotes(patients[accessPath[0]].ID).then((notes) => {
          console.log(notes)
          return { patients, notes }
        })
         console.log(prom)
         return prom
        }

        return { patients }
      })
    .then(({ patients, notes }) => {
        console.log(notes)

        if (accessPath.length > 2) {
          return getNoteNoteLines(notes[accessPath[1]].ID).then((noteLines) => ({ patients, notes, noteLines}))
        }

        if (typeof notes === 'undefined') {
          return { patients }
        }


        return { patients, notes }
      })
    .then(({ patients, notes, noteLines }) => {
        if (accessPath.length > 3) {
          return getNoteLineText(noteLines[accessPath[2]].ID).then((noteLineText) => ({ patients, notes, noteLines, noteLineText }))
        }

        if (typeof notes === 'undefined') {
          return { patients }
        }

        if (typeof noteLines === 'undefined') {
          return { patients, notes }
        }

        return { patients, notes, noteLines }
      })
    .then(({ patients, notes, noteLines, noteLineText }) => {     
    
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
      })
      

}

function getPatientList() {
  console.log('patientList')
  const patientPromise = Patient.list().then((patients) => patients)
  
  return patientPromise;
}

function getPatientNotes(patientId) {
  console.log('patientNotes')
  const notesPromise = Patient.getPatientNotes(patientId).then((notes) => {
    return Note.listOfPatientNotes(notes);
  })
    .then((notes) => {
      console.log(notes)
      return notes
    })
    
  return notesPromise;
}

function getNoteNoteLines(noteId) {
  console.log('noteNoteLines')
  const noteLinesPromise = Note.getNoteNoteLines(noteId).then((notelines) => {
    return NoteLine.listOfNoteNoteLines(noteLines);
  })

  return noteLinesPromise;
}

function getNoteLineText(noteLineId) {
  console.log('noteLineText')
  const noteLinesTextPromise = NoteLine.getNoteLineText(noteLineId).then((text) => {
    return text;
  })

  return noteLinesTextPromise;
}
