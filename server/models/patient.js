import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';

/**
 * Patient Schema
 */
const PatientSchema = new mongoose.Schema({
  ID: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  bedNumber: {
    type: Number,
    required: true
  },
  clinic: {
    type: String,
    required: true
  },
  station: {
    type: String,
    required: true
  },
  admissionDate: {
    type: Date    
  },
  dischargeDate: {
    type: Date    
  },
  birthday: {
    type: Date
  },
  notes: {
    type: Array,
    required: true,
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  updatedAt: {
    type: Date,
    default: Date.now(),
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
PatientSchema.method({
});

/**
 * Statics
 */
PatientSchema.statics = {
  /**
   * Get patient
   * @param {ObjectId} id - The objectId of patient.
   * @returns {Promise<Patient, APIError>}
   */
  get(id) {
    return this.find({ ID: id })
      .execAsync().then((patient) => {
        if (patient[0]) {
          return patient[0];
        }
        const err = new APIError('No such patient exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  getPatientNotes(id) {
    return this.find({ ID: id })
      .execAsync().then((patient) => {
        if (patient[0]) {
          return patient[0].notes;
        }
        const err = new APIError('No such patient exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },


  /**
   * List patients in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of patients to be skipped.
   * @param {number} limit - Limit number of patients to be returned.
   * @returns {Promise<Patient[]>}
   */
  list() {
    return this.find({}, { _id: 0 })
      .sort({ ID: 1 })
      .select('ID lastName firstName bedNumber clinic station admissionDate dischargeDate birthday notes createdAt updatedAt')
      .execAsync();
  }
};

/**
 * @typedef Patient
 */
export default mongoose.model('Patient', PatientSchema);
