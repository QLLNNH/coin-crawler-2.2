'use strict';
const https = require('https');
const querystring = require('querystring');
const agent = new https.Agent({ keepAlive: true, maxSockets: 30 });
const timeout = 5 * 1000;

exports.send = (opt) => {
    return new Promise((fulfill, reject) => {
        return fulfill([[1521730500000, "0.06110900", "0.06116900", "0.06101300", "0.06111700", "79.52500000", 1521730559999, "4.85808723", 254, "41.50500000", "2.53649463", "0"], [1521730560000, "0.06111000", "0.06113300", "0.06103600", "0.06111200", "10.93800000", 1521730619999, "0.66837798", 48, "9.15100000", "0.55930517", "0"]]);
        const request = https.get({
            host: opt.host
            , path: `${opt.path}?${querystring.stringify(opt.qs)}`
            , agent: agent
        });

        request.setTimeout(timeout, () => {
            request.abort();
            return reject({
                lv: 'ERROR'
                , message: 'http timeout'
                , result: { status: 801, description: 'http timeout', data: null }
            });
        });

        request.on('error', (err) => reject({
            lv: 'ERROR'
            , message: err.message || err
            , result: { status: 802, description: 'http error', data: null }
        }));

        request.on('response', (res) => {
            if (res.statusCode !== 200) return reject({
                lv: 'ERROR'
                , message: `http response ${res.statusCode}`
                , result: { status: 803, description: `http response ${res.statusCode}`, data: null }
            });

            let count = 0, chunks = [];
            res.on('data', (chunk) => {
                chunks.push(chunk);
                count += chunk.length;
            });

            res.on('end', () => {
                try {
                    return fulfill(JSON.parse(Buffer.concat(chunks, count).toString('utf8')));
                }
                catch (err) {
                    return reject({
                        lv: 'ERROR'
                        , message: 'http response format error'
                        , result: { status: 804, description: 'http result format error', data: null }
                    });
                }
            });
        });
    });
}