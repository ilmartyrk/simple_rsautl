
const assert = require('assert');
const rsautl = require('../index');
const crypto = require('crypto');
const privateKey =
    '-----BEGIN RSA PRIVATE KEY-----\n' +
    'MIICXAIBAAKBgQDFCUgv5ujYHAt9O//kI77WwKJiHISlnPyY00iogZSTGbIPVRD0\n' +
    'J/Oyp8ATxtHk0GCYNEhAZo2JR8UCPn4gju5D5oOacSmP3Q3BQBu57wA3CGzPbzXA\n' +
    '1KHOUkhhFs5qgPb/k/eJ0k9E09PZ+1dx55Y5NCbbE5jAhDSI7iUU3dFbxQIDAQAB\n' +
    'AoGAKaC6ZZRtYSsbqkvA1lxO92QfaocH501xeIA6+47U6vckzWR1fn/qVrZmOEdr\n' +
    'FOKJZd613RVNldFZ6A137D0GTWcU7r+Qt5DMcKd3oh3ww8Iz4m/q2ASiICLumuUx\n' +
    '8P4ydcUiry4B89232rUqlj7BoCfztzdbbAKWl790Qb8KZsECQQDupUKNZD97o2mJ\n' +
    'hw0aPgk1sXJnkLR8R0xaW1onnmqcuBofj6VdHCm1CiIfWwHabeOIujYO1xg1CVni\n' +
    'I2G8PY1ZAkEA011nTOjduFncSB8hD7jwpLNdQWGG+XcA7pf6/nsiwmu26BoojxA8\n' +
    '4y8tsJ+rmTJD0ST/Cmb/psu8orFS7UmYTQJADw2xowWd04i9UYWJWAxtvEtTMiE4\n' +
    'oVZGBLUafMFLbFNYooEHJ1ZtcxQOjvfIqCSiY6+LVWhQCJhsaQ1eTud7EQJBANKJ\n' +
    'N1xkmHYJDGLKnyQKE6n6/+kgPFJBN6xxtpHGFdmTcZ3AcKYQhpXFaL2GTmdKqkKp\n' +
    'l2HFNuHuDvf/qZqytAECQCL7+PCWeykmBRYQa5ls+4gJQh8a+XeDL5D8QdbNm/I+\n' +
    'zu4JUrnSI0Gn2JLOve63tRlq/bK0QPVZpXVEBN32aSE=\n' +
    '-----END RSA PRIVATE KEY-----';

const publicKey =
    '-----BEGIN PUBLIC KEY-----\n' +
    'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDFCUgv5ujYHAt9O//kI77WwKJi\n' +
    'HISlnPyY00iogZSTGbIPVRD0J/Oyp8ATxtHk0GCYNEhAZo2JR8UCPn4gju5D5oOa\n' +
    'cSmP3Q3BQBu57wA3CGzPbzXA1KHOUkhhFs5qgPb/k/eJ0k9E09PZ+1dx55Y5NCbb\n' +
    'E5jAhDSI7iUU3dFbxQIDAQAB\n' +
    '-----END PUBLIC KEY-----';

describe('Tests', function() {
    it('encryptAndDecrypt', async () => {
        const testStr = 'This is test';

        const encrypted = await rsautl.encrypt(testStr, publicKey);
        const decrypted = await rsautl.decrypt(encrypted, privateKey);
        assert.equal(decrypted, testStr);
    });

    it('signAndVerify', async () => {
        const testStr = 'Sign me please';
        const signed = await rsautl.sign(testStr, privateKey);
        const verified = await  rsautl.verify(signed, publicKey);

        assert.equal(verified, testStr);
    });

    it('signAndVerifyRaw', async () => {
        const hash = crypto
            .createHash('sha256')
            .update(crypto.randomBytes(20).toString());
        const testStr = hash.digest();

        const signed = await rsautl.sign(testStr, privateKey);
        const verified = await rsautl.verify(signed, publicKey, {
            padding: null,
            encoding: null
        });

        assert.equal(Buffer.compare(verified,testStr), 0);
    });

    it('formatKey', async () => {
        const testStr = 'Unformatted keys';
        const unformattedPublicKey = publicKey.replace(/\n/gm, '');
        const unformattedPrivateKey = privateKey.replace(/\n/gm, '');

        assert.notEqual(unformattedPublicKey, publicKey);
        assert.notEqual(unformattedPrivateKey, privateKey);

        const encrypted = await rsautl.encrypt(testStr, unformattedPublicKey);
        const decrypted = await rsautl.decrypt(encrypted, unformattedPrivateKey);

        assert.equal(decrypted, testStr);
    });

    it('formatKeyWithWindowsLineEndings', async () => {
        const testStr = 'Keys with Windows line endings';
        const windowsPublicKey = publicKey.replace(/\n/gm, '\r\n');
        const windowsPrivateKey = privateKey.replace(/\n/gm, '\r\n');

        assert.notEqual(windowsPublicKey, publicKey);
        assert.notEqual(windowsPrivateKey, privateKey);

        const encrypted = await rsautl.encrypt(testStr, windowsPublicKey);
        const decrypted = await rsautl.decrypt(encrypted, windowsPrivateKey);

        assert.equal(decrypted, testStr);
    });
});
