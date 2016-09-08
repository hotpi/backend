import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';

/**
 * Note Schema
 */
const NoteSchema = new mongoose.Schema({
  ID: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    default: 'new'
  },
  noteLines: {
    type: Array,
    required: true,
    default: []
  }
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

/**
 * Methods
 */
NoteSchema.method({
});

/**
 * Statics
 */
NoteSchema.statics = {
  /**
   * Get note
   * @param {ObjectId} id - The objectId of note.
   * @returns {Promise<Note, APIError>}
   */
  get(id) {
    return this.find({ ID: id })
      .execAsync().then((note) => {
        if (note) {
          return note;
        }
        const err = new APIError('No such note exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  getNoteNoteLines(id) {
    return this.find({ ID: id })
      .execAsync().then((note) => {
        if (note) {
          return note.noteLines;
        }
        const err = new APIError('No such note exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  }

  /**
   * List notes in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of notes to be skipped.
   * @param {number} limit - Limit number of notes to be returned.
   * @returns {Promise<Note[]>}
   */
  list({ skip = 0, limit = 50 } = {}) {
    return this.find()
      .sort({ createdAt: -1 })
      .execAsync();
  },

  listOfPatientNotes(ids) {
    return Promise.resolve().then(() => {
        return ids.map( id => {
        this.find({ ID: id })
        .execAsync().then( (note) => {
          if (note) {
            return note;
          }
          const err = new APIError('No such note exists!', httpStatus.NOT_FOUND);
          return Promise.reject(err);
        })
      })
    })
  }
};

/**
 * @typedef Note
 */
export default mongoose.model('Note', NoteSchema);
