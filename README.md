## RSA utility for Node

A thin wrapper for OpenSSL's rsautl(1) for those precious few cases where native bindings won't work. This is a complete rewrite based on https://www.npmjs.com/package/rsautl


### Installation

```bash
$ npm install simple_rsautl
```


### Usage

```javascript
const rsautl = require('simple_rsautl');

const privateKey = '...';
const publicKey = '...';

try {
    const encrypted = await rsautl.encrypt('Encrypt me please!', publicKey);

    const decrypted = await rsautl.decrypt(encrypted, privateKey);
    console.log(decrypted); // Encrypt me please!

    const signed = await rsautl.sign('Sign me please!', privateKey);
    const verified = await rsautl.verify(signed, publicKey);
    console.log(verified); // Sign me please!
});
} catch (err) {
    return console.error(err);
}

```


### Notes

This code writes private keys to temporary files in order for openssl(1) to read them. Make sure your tempfs is based in memory. If you can, use native binding implementations.

