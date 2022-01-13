const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fsPromise = require('fs/promises');
const path = require('path');
const os = require('os');

const tempFile = () => {
    const now = new Date();
    const name = [now.getFullYear(), now.getMonth(), now.getDate(),
                '-',
                process.pid,
                '-',
                (Math.random() * 0x100000000 + 1).toString(36)
    ].join('');
    const dir = path.resolve(os.tmpdir());

    return path.join(dir, name);
}

module.exports = async function (options, data, key) {
    const tmpFile = tempFile();

    try {
        let padding = '';
        if (options.padding) {
            padding = '-' + options.padding;
        }
        let cmdline = `${options.opensslPath} rsautl -${options.operation} ${padding} -inkey ${tmpFile}`;
        if (options.operation === 'encrypt' || options.operation === 'verify') {
            cmdline += ' -pubin';
        }
        await fsPromise.writeFile(tmpFile, key);

        const execOpts = { encoding: 'utf8' };

        if (Object.keys(options).indexOf('encoding') > -1) {
            execOpts.encoding = options.encoding;
        }

        if (options.operation === 'encrypt' || options.operation === 'sign') {
            execOpts.encoding = 'base64';
        }
        const proc = exec(cmdline, execOpts);
        if (options.operation === 'decrypt' || options.operation === 'verify') {
            proc.child.stdin.write(Buffer.from(data, 'base64'));
        } else {
            proc.child.stdin.write(data);
        }

        proc.child.stdin.end();
        const { stdout, stderr } = await proc;

        await fsPromise.unlink(tmpFile);

        return stdout;
    } catch (err) {
        console.log('CAtCH', err);
        await fsPromise.unlink(tmpFile);

        return err.message
    }
};
