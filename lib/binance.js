'use strict';
const log = require('./log');
const Events = require('events');
const request = require('./request');

// (async function () {
//     const ret = await request.send_s({ host: 'api.binance.com', path: '/api/v1/exchangeInfo' });
//     ret.symbols.forEach((symbol) => {
//         console.log(`${symbol.baseAsset}, ${symbol.quoteAsset}`);
//     });
//     console.log(ret.symbols.length);
// })();

module.exports = class Binance extends Events {
    constructor() {
        super();
        this.size = 30;
        this.init();
    }

    async init() {
        try {
            console.log('init binance');
            await this.load_symbols();
            await this.load_symbols_kline();
        }
        catch (err) {
            this.init();
        }
    }

    async load_symbols() {
        // TODO
        this.symbols = ['A', 'B', 'C', 'D'];

        // const symbols = new Set();
        // const info = await request.send({ host: 'api.binance.com', path: '/api/v1/exchangeInfo' });
        // Object.keys(info.symbols).forEach((symbol) => symbols.add(symbol.baseAsset));
        // symbols.delete('123');
        // this.symbols = [...symbols].sort((a, b) => {
        //     if (a > b) return 1;
        //     else return - 1;
        // });
    }

    async fetch_btc_in_usdt() {
        const ret = await request.send({
            host: 'api.binance.com'
            , path: '/api/v1/klines'
            , qs: {
                interval: '1m'
                , limit: this.size
                , symbol: 'BTCUSDT'
            }
        });

        return ret.data.map((datum) => datum[4]);
    }

    async fetch_eth_in_usdt() {
        const ret = await request.send({
            host: 'api.binance.com'
            , path: '/api/v1/klines'
            , qs: {
                interval: '1m'
                , limit: this.size
                , market: 'ETHUSDT'
            }
        });

        return ret.data.map((datum) => datum[4]);
    }

    async fetch_bnb_in_usdt() {
        const ret = await request.send({
            host: 'api.binance.com'
            , path: '/api/v1/klines'
            , qs: {
                interval: '1m'
                , limit: this.size
                , market: 'BNBUSDT'
            }
        });

        return ret.data.map((datum) => datum[4]);
    }

    async fetch_usdt_in_usdt() {
        return new Array(this.size).fill(1);
    }

    async load_symbols_kline() {
        try {
            // const btc_usdt = await this.fetch_btc_in_usdt();
            // const eth_usdt = await this.fetch_eth_in_usdt();
            // const bnb_usdt = await this.fetch_bnb_in_usdt();
            // const usdt_usdt = await this.fetch_usdt_in_usdt();

            for (let symbol of this.symbols) {
                // TODO
                this.emit('kline', {
                    symbol: symbol
                    , '05': [symbol].concat(this.randow_data(10))
                    , '10': [symbol].concat(this.randow_data(100))
                    , '15': [symbol].concat(this.randow_data(1000))
                    , '30': [symbol].concat(this.randow_data(10000))
                });

                // try {
                //     const promises = this.yield_opt(symbol).map((task) => request.send(task));
                //     const symbol_results = await Promise.all(promises);
                //
                //     const statistics_05 = new Array(7).fill(0);
                //     const statistics_10 = new Array(7).fill(0);
                //     const statistics_15 = new Array(7).fill(0);
                //     const statistics_30 = new Array(7).fill(0);
                //
                //     symbol_results.forEach((kline_result, index) => {
                //         let total_05 = 0;
                //         let total_10 = 0;
                //         let total_15 = 0;
                //         let total_30 = 0;
                //
                //         let multipl;
                //         if (index === 0) multipl = btc_usdt;
                //         else if (index === 1) multipl = eth_usdt;
                //         else if (index === 2) multipl = bnb_usdt;
                //         else multipl = usdt_usdt;
                //
                //         kline_result.forEach((datum, i) => {
                //             if (i >= 25) total_05 += datum[4] * datum[5] * multipl[index];
                //             if (i >= 20) total_10 += datum[4] * datum[5] * multipl[index];
                //             if (i >= 15) total_15 += datum[4] * datum[5] * multipl[index];
                //             total_30 += datum[4] * datum[5] * multipl[index];
                //         });
                //
                //         let offset;
                //         if (index === 0) offset = 1;
                //         else if (index === 1) offset = 2;
                //         else if (index === 2) offset = 3;
                //         else offset = 4;
                //
                //         statistics_05[index] = Number((total_05 / 10000).toFixed(1));
                //         statistics_10[index] = Number((total_10 / 10000).toFixed(1));
                //         statistics_15[index] = Number((total_15 / 10000).toFixed(1));
                //         statistics_30[index] = Number((total_30 / 10000).toFixed(1));
                //     });
                //
                //     {
                //         statistics_05[0] = symbol;
                //         statistics_10[0] = symbol;
                //         statistics_15[0] = symbol;
                //         statistics_30[0] = symbol;
                //
                //         const ts = Date.now();
                //         statistics_05[6] = ts;
                //         statistics_10[6] = ts;
                //         statistics_15[6] = ts;
                //         statistics_30[6] = ts;
                //
                //         statistics_05[5] = Number((statistics_05[1] + statistics_05[2] + statistics_05[3] + statistics_05[4]).toFixed(1));
                //         statistics_10[5] = Number((statistics_10[1] + statistics_10[2] + statistics_10[3] + statistics_05[4]).toFixed(1));
                //         statistics_15[5] = Number((statistics_15[1] + statistics_15[2] + statistics_15[3] + statistics_05[4]).toFixed(1));
                //         statistics_30[5] = Number((statistics_30[1] + statistics_30[2] + statistics_30[3] + statistics_05[4]).toFixed(1));
                //     }
                //
                //     console.log(`${new Date().toISOString()} ${symbol} ${statistics_05.join(', ')}`);
                //
                //     this.emit('kline', {
                //         symbol: symbol
                //         , '05': statistics_05
                //         , '10': statistics_10
                //         , '15': statistics_15
                //         , '30': statistics_30
                //     });
                // }
                // catch (err) {
                //     log.info({ lv: 'ERROR', message: err.message, desc: symbol });
                // }
            }
        }
        catch (err) {
            log.info({ lv: 'ERROR', message: err.message, desc: 'load_symbols_kline' });
        }
        finally {
            setTimeout(this.load_symbols_kline.bind(this), 1000);
        }
    }

    yield_opt(symbol) {
        return ['BTC', 'ETH', 'BNB', 'USDT'].map((platform) => {
            return {
                host: 'api.binance.com'
                , path: '/api/v1/klines'
                , qs: {
                    interval: '1m'
                    , limit: this.size
                    , symbol: `${symbol}${platform}`
                }
            }
        });
    }

    randow_data(seed) {
        return [
            Math.floor(Math.random() * 100)
            , Math.floor(Math.random() * 200)
            , Math.floor(Math.random() * 300)
            , Math.floor(Math.random() * 400)
            , Math.floor(Math.random() * seed)
            , Date.now()
        ]
    }
}