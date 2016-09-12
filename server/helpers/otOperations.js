import Promise from 'bluebird';

import xformT from './xformT';
import Patient from '../models/patient';
import Note from '../models/note';
import NoteLine from '../models/noteLine';
import EventEmitter from 'events';

const tree = {}
var wait = false
const waitingList = []
const lock = new EventEmitter()

lock.on('locked', (operationFunction, receivedOp) => {
  console.log('waiting')
  waitingList.push([operationFunction, receivedOp])
})

lock.on('unlocked', () => {
  wait = false
  console.log('------waiting List size------')
  console.log(waitingList)
  if (waitingList.length > 0) {
    console.log('unlocked, applying next op')
    let next = waitingList.shift()
    next[0] === 'insert' ? 
      insertNode(next[1]) :
      deleteNode(next[1])    
  }
})

export function transform(operations, receivedOp) {
  var transformedOperation = operations.reduce( (prev, next) => {
    return xformT(prev, next);
  }, receivedOp)
  console.log(receivedOp)

  return transformedOperation[0];

}

export function apply(operationFunction) {
  if (typeof operationFunction !== 'function') {
    return 'Error: first argument of apply must be a function';
  }

  return operationFunction; 
}

export function getAccessPath(objectAccessPath) {
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
  console.log('------wait--------')
  console.log(wait)

  if (wait) {
    lock.emit('locked', 'insert', receivedOp)
    return true;
  }

  var newAccessPath = getAccessPath(accessPath) 
  wait = true;
  
  let insertAt = jumpToAccessPath(newAccessPath)
    .then((treeLevel) => {
      console.log('-----treeLevel------')
      console.log(treeLevel)

      let applied = [
        ...treeLevel.slice(0, newAccessPath[newAccessPath.length-1] + 1),
        node,
        ...treeLevel.slice(newAccessPath[newAccessPath.length-1] + 1),
      ]

      console.log('-------applied op-------')
      console.log(receivedOp)
      console.log('-----after applied------')
      console.log(applied)
      // translate back to the type of collection
      return saveChanges(newAccessPath, applied, 'insert', node)
    })
    .then((promises) => {
      console.log('-------after save promises--------')
      console.log(promises)
      Promise.all(promises).then( () => {
        lock.emit('unlocked')
      }).catch((err) => console.log(`something happened: ${`err`}`))
    })
  // save to database
  return true; 
} 

export function deleteNode(receivedOp) {
  const { accessPath } = receivedOp 

  if (wait) {
    lock.emit('locked', 'delete', receivedOp)
    return true;
  }

  var newAccessPath = getAccessPath(accessPath)
  wait = true;

  let deleteAt = jumpToAccessPath(newAccessPath)
    .then((treeLevel) => {
      let deletedNode = treeLevel[newAccessPath[newAccessPath.length-1]]
      
      let applied = [
        ...treeLevel.slice(0, newAccessPath[newAccessPath.length-1]),
        ...treeLevel.slice(newAccessPath[newAccessPath.length-1] + 1)
        ]
      
      return saveChanges(newAccessPath, applied, 'delete', deletedNode)
    })
    .then(promises => {
      console.log('------after delete promises------')
      console.log(promises)
      Promise.all(promises).then( () => {

        lock.emit('unlocked')
      })
    })
  // translate back to the type of collection
  // save to database

  return true;
}

function saveChanges(accessPath, changes, operation, node) {
   return getPatientList().then(patients => {
      if (accessPath.length > 1) {
        return getPatientNotes(patients[accessPath[0]].ID).then(notes => ({ patients, notes }))      
      }
      return { patients }
    })
    .then(({ patients, notes }) => {
      if (accessPath.length > 2) {
        return getNoteNoteLines(notes[accessPath[1]].ID).then(noteLines => ({ patients, notes, noteLines }))
      }
      if (accessPath.length > 1) {
        return { patients, notes }
      }

      return { patients }
    })
    .then(({ patients, notes, noteLines }) => {
      if (accessPath.length === 1) {
        var updatePromise = Patient.update({}, changes, { multi: true, upsert: true, overwrite: true }).execAsync()

        return [updatePromise];
      } else if (accessPath.length === 2) {

        var updatePromise = Patient.update({ ID: patients[accessPath[0]].ID }, { 
          notes: changes.map(note => note.ID) 
        }).execAsync()
        
        switch (operation) {  
          case  'insert':
            const note = new Note({
              ...node
            })

            var savePromise = note.saveAsync()

            return [ updatePromise, savePromise ];
          case 'delete':
            var deletedPromise = Note.remove({ ID: node.ID }).execAsync()
            
            return [ updatePromise, deletedPromise ];
        } 
        
      } else if (accessPath.length === 3) {
        console.log('saving Changes of a note')
        var updatePromise = Note.update({ ID: notes[accessPath[1]].ID }, { 
          noteLines: changes.map(noteLine => noteLine.ID)
        }).execAsync()

        switch (operation) {
          case 'insert':
            const noteLine = new NoteLine({
              ...node
            })

            console.log(noteLine)

            var savePromise = noteLine.saveAsync()

            return [ updatePromise, savePromise ];
          case 'delete':
            var deletedPromise = NoteLine.remove({ ID: node.ID }).execAsync()
            
            return [ updatePromise, deletedPromise ]
        }
        
      } else if (accessPath.length === 4) {
        var newText = changes.reduce((prev, curr) => {
          return prev+curr
        }, '')
        var updatePromise = NoteLine.update({ ID: noteLines[accessPath[2]].ID }, {
          text: newText 
        }).execAsync()
        
        return [ updatePromise ]

      }       
    })
}


// return level of the tree with their elements AND the name of its collection
function jumpToAccessPath(accessPath) {
  var patients = []
  var notes = []
  var noteLines = []
  var noteLineText = ''
  
  return getPatientList()
    .then((patients) => {
        if (accessPath.length > 1) {
          let prom = getPatientNotes(patients[accessPath[0]].ID).then((notes) => {
            console.log('------------------patient-------------')
            console.log(patients[accessPath[0]])
            console.log('-------------------returning notes --------------')
            return { patients, notes }
          })
          return prom
        }

        return { patients }
      })
    .then(({ patients, notes }) => {
        console.log('-------------------jumpToAccessPath notes---------------')
        console.log(notes)
        console.log('------------------------jumpToAccessPath in accessPath-------------')
        console.log(accessPath)
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
  const patientPromise = Patient.list().then((patients) => {
    return patients
  })
  
  return patientPromise;
}

function getPatientNotes(patientId) {
  const notesPromise = Patient.getPatientNotes(patientId).then((notes) => {
    return Note.listOfPatientNotes(notes);
  })
    .then((notes) => {
      return notes;
    })
    
  return notesPromise;
}

function getNoteNoteLines(noteId) {
  const noteLinesPromise = Note.getNoteNoteLines(noteId).then((noteLines) => {
    return NoteLine.listOfNoteNoteLines(noteLines);
  })
    .then((noteLines) => {
      return noteLines;
    })

  return noteLinesPromise;
}

function getNoteLineText(noteLineId) {
  const noteLinesTextPromise = NoteLine.getNoteLineText(noteLineId).then((text) => {
    return text;
  })

  return noteLinesTextPromise;
}
