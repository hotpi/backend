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
    default: []
  },
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
      .exec().then((note) => {
        if (note[0]) {
          return note[0];
        }
        const err = new APIError('No such note exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  getNoteNoteLines(id) {
    return this.find({ ID: id })
      .exec().then((note) => {
        if (note[0]) {
          return note[0].noteLines;
        }
        const err = new APIError('No such note exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  }
,
  /**
   * List notes in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of notes to be skipped.
   * @param {number} limit - Limit number of notes to be returned.
   * @returns {Promise<Note[]>}
   */
  list() {
    return this.find({}, { _id: 0 })
      .sort({ createdAt: -1 })
      .select('ID type noteLines createdAt updatedAt')
      .exec();
  },

  listOfPatientNotes(ids) {
    return this.find({ 
        ID: { $in: ids }
      })
      .exec().then( (notes) => {
        if (notes) {
          return notes;
        }
        const err = new APIError('No such note exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      })
  }
};

/**
 * @typedef Note
 */
export default mongoose.model('Note', NoteSchema);
