import Joi from 'joi';

export default {
  // POST /api/users
  createUser: {
    body: {
      username: Joi.string().required(),
      mobileNumber: Joi.string().regex(/^[1-9][0-9]{9}$/).required()
    }
  },

  // UPDATE /api/users/:userId
  updateUser: {
    body: {
      username: Joi.string().required(),
      mobileNumber: Joi.string().regex(/^[1-9][0-9]{9}$/).required()
    },
    params: {
      userId: Joi.string().hex().required()
    }
  },

  // POST /api/auth/login
  login: {
    body: {
      username: Joi.string().required(),
      password: Joi.string().required()
    }
  },

  // POST /sync/sendOp
  sendOp: {
    body: {
      operation: Joi.object({
        origin: Joi.number().integer().required(),
        type: Joi.string().valid('insert', 'delete').required(),
        accessPath: Joi.array().required(),
        node: Joi.object()
      }).required(),
      revisionNr: Joi.number().integer().required()
    }
  },

  // GET /sync/status/:revisionNr
  status: {
    body: {
      uid: Joi.number().integer()
    },
    params: {
      revisionNr: Joi.number().integer()
    }
  }

};
