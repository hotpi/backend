import express from 'express';
import validate from 'express-validation';
// import expressJwt from 'express-jwt';
import paramValidation from '../../config/param-validation';
import otCtrl from '../controllers/ot';
// import config from '../../config/env';

const router = express.Router();  // eslint-disable-line new-cap

/** POST /api/auth/login - Returns token if correct username and password is provided */
/*router.route('/login')
  .post(validate(paramValidation.login), authCtrl.login);
*/

/** POST /sync/ - Returns token if correct username and password is provided */
router.route('/sendOp')
  .post(validate(paramValidation.sendOp), otCtrl.receiveOp);

router.route('/status/:uid/:revisionNr')
  .get(validate(paramValidation.status), otCtrl.status);

router.route('/subscribe')
  .get(otCtrl.subscribe)

router.route('/initialState')
  .get(otCtrl.initialState)

/** GET /api/auth/random-number - Protected route,
 * needs token returned by the above as header. Authorization: Bearer {token} */
/*router.route('/random-number')
  .get(expressJwt({ secret: config.jwtSecret }), authCtrl.getRandomNumber);*/

export default router;
