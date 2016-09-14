import Joi from 'joi';

export default {
   // POST /sync/sendOp
  sendOp: {
    body: {
      operation: Joi.object({
        origin: Joi.number().integer().required(),
        type: Joi.string().valid('insert', 'delete', 'no-op').required(),
        node: Joi.alternatives().try(Joi.object(), Joi.string()),
        action: Joi.object().required()
      }).required(),
      revisionNr: Joi.number().integer().required()
    }
  },

  // GET /sync/status/:revisionNr
  status: {
    params: {
      uid: Joi.number().integer(),
      revisionNr: Joi.number().integer()
    }
  }

};
