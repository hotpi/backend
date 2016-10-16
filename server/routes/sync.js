import express from 'express';
import validate from 'express-validation';
import paramValidation from '../../config/param-validation';
import otCtrl from '../controllers/ot';

const router = express.Router();  // eslint-disable-line new-cap

router.route('/sendOp')
  .post(validate(paramValidation.sendOp), otCtrl.receiveOp);

router.route('/status/:uid/:revisionNr')
  .get(validate(paramValidation.status), otCtrl.status);

router.route('/subscribe')
  .get(otCtrl.subscribe)

router.route('/initialState')
  .get(otCtrl.initialState)

export default router;
