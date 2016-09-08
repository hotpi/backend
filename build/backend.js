require("source-map-support").install();
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/static/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _bluebird = __webpack_require__(2);
	
	var _bluebird2 = _interopRequireDefault(_bluebird);
	
	var _mongoose = __webpack_require__(3);
	
	var _mongoose2 = _interopRequireDefault(_mongoose);
	
	var _express = __webpack_require__(10);
	
	var _express2 = _interopRequireDefault(_express);
	
	var _env = __webpack_require__(4);
	
	var _env2 = _interopRequireDefault(_env);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	// promisify mongoose
	_bluebird2.default.promisifyAll(_mongoose2.default);
	
	// connect to mongo db
	_mongoose2.default.connect(_env2.default.db, { server: { socketOptions: { keepAlive: 1 } } });
	_mongoose2.default.connection.on('error', function () {
	  throw new Error('unable to connect to database: ' + _env2.default.db);
	});
	
	var debug = __webpack_require__(26)('bachelorarbeit-node-server:index');
	console.log(_env2.default);
	// listen on port config.port
	_express2.default.listen(_env2.default.port, function () {
	  debug('server started on port ' + _env2.default.port + ' (' + _env2.default.env + ')');
	});
	
	exports.default = _express2.default;

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = require("bluebird");

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = require("mongoose");

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(__dirname) {'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var _path = __webpack_require__(5);
	
	var _path2 = _interopRequireDefault(_path);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var env = process.env.NODE_ENV || 'development';
	var config = __webpack_require__(6)("./" + env).default;
	
	var defaults = {
	  root: _path2.default.join(__dirname, '/..')
	};
	
	exports.default = _extends({}, defaults, config);
	/* WEBPACK VAR INJECTION */}.call(exports, "/"))

/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = require("path");

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var map = {
		"./development": 7,
		"./development.js": 7,
		"./index": 4,
		"./index.js": 4,
		"./production": 8,
		"./production.js": 8,
		"./test": 9,
		"./test.js": 9
	};
	function webpackContext(req) {
		return __webpack_require__(webpackContextResolve(req));
	};
	function webpackContextResolve(req) {
		return map[req] || (function() { throw new Error("Cannot find module '" + req + "'.") }());
	};
	webpackContext.keys = function webpackContextKeys() {
		return Object.keys(map);
	};
	webpackContext.resolve = webpackContextResolve;
	module.exports = webpackContext;
	webpackContext.id = 6;


/***/ },
/* 7 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = {
	  env: 'development',
	  jwtSecret: '0a6b944d-d2fb-46fc-a85e-0295c986cd9f',
	  db: 'mongodb://localhost/bachelorarbeit',
	  port: 3001
	};

/***/ },
/* 8 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = {
	  env: 'production',
	  jwtSecret: '0a6b944d-d2fb-46fc-a85e-0295c986cd9f',
	  db: 'mongodb://localhost/bachelorarbeit',
	  port: 3001
	};

/***/ },
/* 9 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = {
	  env: 'test',
	  jwtSecret: '0a6b944d-d2fb-46fc-a85e-0295c986cd9f',
	  db: 'mongodb://localhost/bachelorarbeit',
	  port: 3001
	};

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _express = __webpack_require__(11);
	
	var _express2 = _interopRequireDefault(_express);
	
	var _morgan = __webpack_require__(12);
	
	var _morgan2 = _interopRequireDefault(_morgan);
	
	var _bodyParser = __webpack_require__(13);
	
	var _bodyParser2 = _interopRequireDefault(_bodyParser);
	
	var _cookieParser = __webpack_require__(14);
	
	var _cookieParser2 = _interopRequireDefault(_cookieParser);
	
	var _compression = __webpack_require__(15);
	
	var _compression2 = _interopRequireDefault(_compression);
	
	var _methodOverride = __webpack_require__(16);
	
	var _methodOverride2 = _interopRequireDefault(_methodOverride);
	
	var _cors = __webpack_require__(17);
	
	var _cors2 = _interopRequireDefault(_cors);
	
	var _httpStatus = __webpack_require__(18);
	
	var _httpStatus2 = _interopRequireDefault(_httpStatus);
	
	var _expressWinston = __webpack_require__(19);
	
	var _expressWinston2 = _interopRequireDefault(_expressWinston);
	
	var _expressValidation = __webpack_require__(20);
	
	var _expressValidation2 = _interopRequireDefault(_expressValidation);
	
	var _helmet = __webpack_require__(21);
	
	var _helmet2 = _interopRequireDefault(_helmet);
	
	var _winston = __webpack_require__(22);
	
	var _winston2 = _interopRequireDefault(_winston);
	
	var _routes = __webpack_require__(24);
	
	var _routes2 = _interopRequireDefault(_routes);
	
	var _env = __webpack_require__(4);
	
	var _env2 = _interopRequireDefault(_env);
	
	var _APIError = __webpack_require__(25);
	
	var _APIError2 = _interopRequireDefault(_APIError);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var app = (0, _express2.default)();
	
	if (_env2.default.env === 'development') {
	  app.use((0, _morgan2.default)('dev'));
	}
	
	// parse body params and attache them to req.body
	app.use(_bodyParser2.default.json());
	app.use(_bodyParser2.default.urlencoded({ extended: true }));
	
	app.use((0, _cookieParser2.default)());
	app.use((0, _compression2.default)());
	app.use((0, _methodOverride2.default)());
	
	// secure apps by setting various HTTP headers
	app.use((0, _helmet2.default)());
	
	// enable CORS - Cross Origin Resource Sharing
	app.use((0, _cors2.default)());
	
	// enable detailed API logging in dev env
	if (_env2.default.env === 'development') {
	  _expressWinston2.default.requestWhitelist.push('body');
	  _expressWinston2.default.responseWhitelist.push('body');
	  app.use(_expressWinston2.default.logger({
	    winstonInstance: _winston2.default,
	    meta: true, // optional: log meta data about request (defaults to true)
	    msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms',
	    colorStatus: true // Color the status code (default green, 3XX cyan, 4XX yellow, 5XX red).
	  }));
	}
	
	// mount all routes on /api path
	app.use('/', _routes2.default);
	
	// if error is not an instanceOf APIError, convert it.
	app.use(function (err, req, res, next) {
	  if (err instanceof _expressValidation2.default.ValidationError) {
	    // validation error contains errors which is an array of error each containing message[]
	    var unifiedErrorMessage = err.errors.map(function (error) {
	      return error.messages.join('. ');
	    }).join(' and ');
	    var error = new _APIError2.default(unifiedErrorMessage, err.status, true);
	    return next(error);
	  } else if (!(err instanceof _APIError2.default)) {
	    var apiError = new _APIError2.default(err.message, err.status, err.isPublic);
	    return next(apiError);
	  }
	  return next(err);
	});
	
	// catch 404 and forward to error handler
	app.use(function (req, res, next) {
	  var err = new _APIError2.default('API not found', _httpStatus2.default.NOT_FOUND);
	  return next(err);
	});
	
	// log error in winston transports except when executing test suite
	if (_env2.default.env !== 'test') {
	  app.use(_expressWinston2.default.errorLogger({
	    winstonInstance: _winston2.default
	  }));
	}
	
	// error handler, send stacktrace only during development
	app.use(function (err, req, res, next) {
	  return (// eslint-disable-line no-unused-vars
	    res.status(err.status).json({
	      message: err.isPublic ? err.message : _httpStatus2.default[err.status],
	      stack: _env2.default.env === 'development' ? err.stack : {}
	    })
	  );
	});
	
	exports.default = app;

/***/ },
/* 11 */
/***/ function(module, exports) {

	module.exports = require("express");

/***/ },
/* 12 */
/***/ function(module, exports) {

	module.exports = require("morgan");

/***/ },
/* 13 */
/***/ function(module, exports) {

	module.exports = require("body-parser");

/***/ },
/* 14 */
/***/ function(module, exports) {

	module.exports = require("cookie-parser");

/***/ },
/* 15 */
/***/ function(module, exports) {

	module.exports = require("compression");

/***/ },
/* 16 */
/***/ function(module, exports) {

	module.exports = require("method-override");

/***/ },
/* 17 */
/***/ function(module, exports) {

	module.exports = require("cors");

/***/ },
/* 18 */
/***/ function(module, exports) {

	module.exports = require("http-status");

/***/ },
/* 19 */
/***/ function(module, exports) {

	module.exports = require("express-winston");

/***/ },
/* 20 */
/***/ function(module, exports) {

	module.exports = require("express-validation");

/***/ },
/* 21 */
/***/ function(module, exports) {

	module.exports = require("helmet");

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _winston = __webpack_require__(23);
	
	var _winston2 = _interopRequireDefault(_winston);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var logger = new _winston2.default.Logger({
	  transports: [new _winston2.default.transports.Console({
	    json: true,
	    colorize: true
	  })]
	});
	
	exports.default = logger;

/***/ },
/* 23 */
/***/ function(module, exports) {

	module.exports = require("winston");

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _express = __webpack_require__(11);
	
	var _express2 = _interopRequireDefault(_express);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	//import userRoutes from './user';
	//import authRoutes from './auth'; /* Not needed */
	
	var router = _express2.default.Router(); // eslint-disable-line new-cap
	
	/** GET /health-check - Check service health */
	router.get('/health-check', function (req, res) {
	  return res.send('OK');
	});
	
	// mount user routes at /users
	//router.use('/users', userRoutes);
	
	// mount auth routes at /auth
	//router.use('/auth', authRoutes);
	
	exports.default = router;

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _httpStatus = __webpack_require__(18);
	
	var _httpStatus2 = _interopRequireDefault(_httpStatus);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	/**
	 * @extends Error
	 */
	var ExtendableError = function (_Error) {
	  _inherits(ExtendableError, _Error);
	
	  function ExtendableError(message, status, isPublic) {
	    _classCallCheck(this, ExtendableError);
	
	    var _this = _possibleConstructorReturn(this, (ExtendableError.__proto__ || Object.getPrototypeOf(ExtendableError)).call(this, message));
	
	    _this.name = _this.constructor.name;
	    _this.message = message;
	    _this.status = status;
	    _this.isPublic = isPublic;
	    _this.isOperational = true; // This is required since bluebird 4 doesn't append it anymore.
	    Error.captureStackTrace(_this, _this.constructor.name);
	    return _this;
	  }
	
	  return ExtendableError;
	}(Error);
	
	/**
	 * Class representing an API error.
	 * @extends ExtendableError
	 */
	
	
	var APIError = function (_ExtendableError) {
	  _inherits(APIError, _ExtendableError);
	
	  /**
	   * Creates an API error.
	   * @param {string} message - Error message.
	   * @param {number} status - HTTP status code of error.
	   * @param {boolean} isPublic - Whether the message should be visible to user or not.
	   */
	  function APIError(message) {
	    var status = arguments.length <= 1 || arguments[1] === undefined ? _httpStatus2.default.INTERNAL_SERVER_ERROR : arguments[1];
	    var isPublic = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];
	
	    _classCallCheck(this, APIError);
	
	    return _possibleConstructorReturn(this, (APIError.__proto__ || Object.getPrototypeOf(APIError)).call(this, message, status, isPublic));
	  }
	
	  return APIError;
	}(ExtendableError);
	
	exports.default = APIError;

/***/ },
/* 26 */
/***/ function(module, exports) {

	module.exports = require("debug");

/***/ }
/******/ ]);
//# sourceMappingURL=backend.js.map