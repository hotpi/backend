import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';

/**
 * NoteLine Schema
 */
const NoteLineSchema = new mongoose.Schema({
  ID: {
    type: String,
    required: true
  },
  text: {
    type: String,
    default: ''
  },
  important: {
    set: {
      type: Boolean,
      default: false,
      required: true
    },
    color: {
      type: String,
      default: 'grey',
      required: true
    },
    value: {
      type: Number,
      default: 0,
      required: true
    }
  },
  highlight: {
    set: {
      type: Boolean,
      default: false,
      required: true
    },
    color: {
      type: String,
      default: 'grey',
      required: true
    },
    value: {
      type: Number,
      default: 0,
      required: true
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
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
NoteLineSchema.method({
});

/**
 * Statics
 */
NoteLineSchema.statics = {
  /**
   * Get noteLine
   * @param {ObjectId} id - The objectId of NoteLine.
   * @returns {Promise<NoteLine, APIError>}
   */
  get(id) {
    return this.find({ ID: id })
      .execAsync().then((noteLine) => {
        if (noteLine[0]) {
          return noteLine[0];
        }
        const err = new APIError('No such noteLine exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  getNoteLineText(id) {
    return this.find({ ID: id })
      .execAsync().then( (noteLine) => {
        if (noteLine[0]) {
          return noteLine[0].text;
        }
        const err = new APIError('No such noteLine exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      })
  },

  /**
   * List noteLines in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of noteLines to be skipped.
   * @param {number} limit - Limit number of noteLines to be returned.
   * @returns {Promise<NoteLine[]>}
   */
  list() {
    return this.find({}, { _id: 0 })
      .sort({ createdAt: -1 })
      .select('ID text important highlight createdAt updateAt')
      .execAsync();
  },

  listOfNoteNoteLines(ids) {
    return this.find({ 
      ID: { $in: ids }
    })
    .execAsync().then( (notelines) => {
      if (notelines) {
        return notelines;
      }
      const err = new APIError('No such noteline exists!', httpStatus.NOT_FOUND);
      return Promise.reject(err);
    })
  }
};

/**
 * @typedef NoteLine
 */
export default mongoose.model('NoteLine', NoteLineSchema);
