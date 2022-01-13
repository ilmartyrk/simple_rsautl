const fs = require('fs');
const run = require('./lib/runner');

const defaults = {
    opensslPath : '/usr/bin/openssl',
    padding : 'pkcs'
};

const verifyOptions = (options) => {
    if (fs.existsSync !== undefined && !fs.existsSync(options.opensslPath)) {
        throw new Error(options.opensslPath + ': No such file or directory');
    }

    if (options.padding !== 'pkcs' && options.padding !== 'raw' && !!options.padding) {
        throw new Error('Unsupported padding: ' + options.padding);
    }
}

const formatKey = (key) => {
    if (key.indexOf('-----BEGIN') === -1 || key.indexOf('-----END') === -1) {
        return key;
    }

    const begin = key.substring(0, key.indexOf('KEY-----') + 'KEY-----'.length);
    const end = key.substring(key.indexOf('-----END'));
    const body = key.substring(begin.length, key.length - end.length).replace(/(\r\n|\n|\r)/gm, '');

    key = begin + '\n';
    for (let i = 0; i < body.length; i += 64) {
        if (body.length - i < 64) {
            key += body.substring(i);
        } else {
            key += body.substring(i, i + 64);
        }
        key += '\n';
    }
    key += end;

    return key;
}

const operation = async (name, data, key, options) => {
    options = options || {};

    for (let attr in defaults) {
        if (!options || Object.keys(options).indexOf(attr) === -1) options[attr] = defaults[attr];
    }

    options.operation = name;

    try {
        verifyOptions(options);
        return run(options, data, formatKey(key));
    } catch (err) {
        return callback(err);
    }
}

exports.encrypt = function encrypt (data, key, options) { return operation('encrypt', data, key, options); };
exports.decrypt = function decrypt (data, key, options) { return operation('decrypt', data, key, options); };
exports.sign = function sign (data, key, options) { return operation('sign', data, key, options); };
exports.verify = function verify (data, key, options) { return operation('verify', data, key, options); };
