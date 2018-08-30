'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _awsSdk = require('aws-sdk');

var _awsSdk2 = _interopRequireDefault(_awsSdk);

var _ghostStorageBase = require('ghost-storage-base');

var _ghostStorageBase2 = _interopRequireDefault(_ghostStorageBase);

var _path = require('path');

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _fs = require('fs');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var readFileAsync = (0, _bluebird.promisify)(_fs.readFile);

var stripLeadingSlash = function stripLeadingSlash(s) {
  return s.indexOf('/') === 0 ? s.substring(1) : s;
};

class Store extends _ghostStorageBase2.default {
  constructor() {
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    super(config);

    _awsSdk2.default.config.setPromisesDependency(_bluebird2.default);

    var accessKeyId = config.accessKeyId,
        assetHost = config.assetHost,
        bucket = config.bucket,
        pathPrefix = config.pathPrefix,
        region = config.region,
        secretAccessKey = config.secretAccessKey,
        endpoint = config.endpoint,
        serverSideEncryption = config.serverSideEncryption;

    // Compatible with the aws-sdk's default environment variables

    this.accessKeyId = process.env.AWS_ACCESS_KEY_ID || accessKeyId;
    this.secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || secretAccessKey;
    this.region = process.env.AWS_DEFAULT_REGION || region;

    this.bucket = process.env.GHOST_STORAGE_ADAPTER_S3_PATH_BUCKET || bucket;

    // Optional configurations
    this.host = process.env.GHOST_STORAGE_ADAPTER_S3_ASSET_HOST || assetHost || `https://s3${this.region === 'us-east-1' ? '' : `-${this.region}`}.amazonaws.com/${this.bucket}`;
    this.pathPrefix = stripLeadingSlash(process.env.GHOST_STORAGE_ADAPTER_S3_PATH_PREFIX || pathPrefix || '');
    this.endpoint = process.env.GHOST_STORAGE_ADAPTER_S3_ENDPOINT || endpoint || '';
    this.serverSideEncryption = process.env.GHOST_STORAGE_ADAPTER_S3_SSE || serverSideEncryption || '';
  }

  delete(fileName, targetDir) {
    var _this = this;

    var directory = targetDir || this.getTargetDir(this.pathPrefix);

    return new _bluebird2.default(function (resolve, reject) {
      return _this.s3().deleteObject({
        Bucket: _this.bucket,
        Key: stripLeadingSlash((0, _path.join)(directory, fileName))
      }).promise().then(function () {
        return resolve(true);
      }).catch(function () {
        return resolve(false);
      });
    });
  }

  exists(fileName, targetDir) {
    var _this2 = this;

    return new _bluebird2.default(function (resolve, reject) {
      return _this2.s3().getObject({
        Bucket: _this2.bucket,
        Key: stripLeadingSlash((0, _path.join)(targetDir, fileName))
      }).promise().then(function () {
        return resolve(true);
      }).catch(function () {
        return resolve(false);
      });
    });
  }

  s3() {
    var options = {
      accessKeyId: this.accessKeyId,
      bucket: this.bucket,
      region: this.region,
      secretAccessKey: this.secretAccessKey
    };
    if (this.endpoint !== '') {
      options.endpoint = this.endpoint;
    }
    return new _awsSdk2.default.S3(options);
  }

  save(image, targetDir) {
    var _this3 = this;

    var directory = targetDir || this.getTargetDir(this.pathPrefix);

    return new _bluebird2.default(function (resolve, reject) {
      _bluebird2.default.all([_this3.getUniqueFileName(image, directory), readFileAsync(image.path)]).then(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            fileName = _ref2[0],
            file = _ref2[1];

        var config = {
          ACL: 'public-read',
          Body: file,
          Bucket: _this3.bucket,
          CacheControl: `max-age=${30 * 24 * 60 * 60}`,
          ContentType: image.type,
          Key: stripLeadingSlash(fileName)
        };

        if (_this3.serverSideEncryption !== '') {
          config.ServerSideEncryption = _this3.serverSideEncryption;
        }

        console.log('*********** S3.save', {
          config,
          filename: `${_this3.host}/${fileName}`
        });

        _this3.s3().putObject(config).promise().then(function () {
          return resolve(`${_this3.host}/${fileName}`);
        });
      }).catch(function (error) {
        return reject(error);
      });
    });
  }

  serve() {
    var _this4 = this;

    return function (req, res, next) {
      _this4.s3().getObject({
        Bucket: _this4.bucket,
        Key: stripLeadingSlash(req.path)
      }).on('httpHeaders', function (statusCode, headers, response) {
        res.set(headers);
      }).createReadStream().on('error', function (err) {
        res.status(404);
        next(err);
      }).pipe(res);
    };
  }

  read(options) {
    var _this5 = this;

    options = options || {};

    return new _bluebird2.default(function (resolve, reject) {
      // remove trailing slashes
      var path = (options.path || '').replace(/\/$|\\$/, '');

      // check if path is stored in s3 handled by us
      if (!path.startsWith(_this5.host)) {
        reject(new Error(`${path} is not stored in s3`));
      }

      path = path.substring(_this5.host.length);

      console.log('********** S3.path', { path });

      _this5.s3().getObject({
        Bucket: _this5.bucket,
        Key: stripLeadingSlash(path)
      }).promise().then(function (data) {
        console.log('********** S3.getObject', {
          bucket: _this5.bucket,
          key: stripLeadingSlash(path)
        });
        resolve(data.Body);
      }).catch(function (error) {
        return reject(error);
      });
    });
  }
}

exports.default = Store;
module.exports = exports['default'];
