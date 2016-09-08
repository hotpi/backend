import express from 'express';
import validate from 'express-validation';
// import expressJwt from 'express-jwt';
import paramValidation from '../../config/param-validation';
import authCtrl from '../controllers/auth';
// import config from '../../config/env';

const router = express.Router();  // eslint-disable-line new-cap

/** POST /api/auth/login - Returns token if correct username and password is provided */
/*router.route('/login')
  .post(validate(paramValidation.login), authCtrl.login);
*/

/** POST /sync/ - Returns token if correct username and password is provided */
router.route('/sendOp')
  .post(validate(paramValidation.receiveOp), otCtrl.receiveOp);

router.route('/status/:revisionNr')
  .get(validate(paramValidation.status), otCtrl.status);

router.route('/subscribe')
  .get(otCtrl.subscribe)
/** GET /api/auth/random-number - Protected route,
 * needs token returned by the above as header. Authorization: Bearer {token} */
/*router.route('/random-number')
  .get(expressJwt({ secret: config.jwtSecret }), authCtrl.getRandomNumber);*/

export default router;
