import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
import { debugLogger } from '../../config/winston';

/**
 * History Schema
 */
const opHistorySchema = new mongoose.Schema({
  history: {
    type: []
  },
  revisionNumber: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * Methods
 */
opHistorySchema.method({
});

/**
 * Statics
 */
opHistorySchema.statics = {
  /**
   * Get note
   * @param {ObjectId} id - The objectId of note.
   * @returns {Promise<History, APIError>}
   */
  getLatest() {
    return this.find({}, { _id: 0, history: 1 })
      .sort({ createdAt: -1 })
      .limit(1)
      .exec()
  },
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
  }
};

/**
 * @typedef Note
 */
export default mongoose.model('OpHistory', opHistorySchema);
