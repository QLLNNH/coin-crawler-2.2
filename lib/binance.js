'use strict';
const log = require('./log');
const Events = require('events');
const request = require('./request');

module.exports = class Binance extends Events {

    constructor() {
        super();
        this.size = 30;
        this.break_symbols = [];
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
        const symbols = new Set();
        const info = await request.send({ host: 'api.binance.com', path: '/api/v1/exchangeInfo' });
        info.symbols.forEach((symbol) => symbols.add(symbol.baseAsset));
        symbols.delete('123');
        this.symbols = [...symbols].sort((a, b) => {
            if (a > b) return 1;
            else return - 1;
        });
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

        return ret.map((datum) => + datum[4]);
    }

    async fetch_eth_in_usdt() {
        const ret = await request.send({
            host: 'api.binance.com'
            , path: '/api/v1/klines'
            , qs: {
                interval: '1m'
                , limit: this.size
                , symbol: 'ETHUSDT'
            }
        });

        return ret.map((datum) => + datum[4]);
    }

    async fetch_bnb_in_usdt() {
        const ret = await request.send({
            host: 'api.binance.com'
            , path: '/api/v1/klines'
            , qs: {
                interval: '1m'
                , limit: this.size
                , symbol: 'BNBUSDT'
            }
        });

        return ret.map((datum) => + datum[4]);
    }

    async fetch_usdt_in_usdt() {
        return new Array(this.size).fill(1);
    }

    async load_symbols_kline() {
        try {
            console.time('task');
            const btc_usdt = await this.fetch_btc_in_usdt();
            const eth_usdt = await this.fetch_eth_in_usdt();
            const bnb_usdt = await this.fetch_bnb_in_usdt();
            const usdt_usdt = await this.fetch_usdt_in_usdt();

            for (let symbol of this.symbols) {
                try {
                    if (this.break_symbols.includes(symbol)) continue;

                    let error_amount = 0;
                    const statistics_05 = new Array(7).fill(0);
                    const statistics_10 = new Array(7).fill(0);
                    const statistics_15 = new Array(7).fill(0);
                    const statistics_30 = new Array(7).fill(0);

                    const promises = this.yield_opt(symbol).map((task) => request.send(task));
                    const symbol_results = await Promise.all(promises);

                    symbol_results.forEach((kline_result, index) => {
                        if (Array.isArray(kline_result)) {
                            let total_05 = 0;
                            let total_10 = 0;
                            let total_15 = 0;
                            let total_30 = 0;

                            let multipl;
                            if (index === 0) multipl = btc_usdt;
                            else if (index === 1) multipl = eth_usdt;
                            else if (index === 2) multipl = bnb_usdt;
                            else multipl = usdt_usdt;

                            kline_result.forEach((datum, i) => {
                                if (i >= 25) total_05 += datum[4] * datum[5] * multipl[index];
                                if (i >= 20) total_10 += datum[4] * datum[5] * multipl[index];
                                if (i >= 15) total_15 += datum[4] * datum[5] * multipl[index];
                                total_30 += datum[4] * datum[5] * multipl[index];
                            });

                            let offset;
                            if (index === 0) offset = 1;
                            else if (index === 1) offset = 2;
                            else if (index === 2) offset = 3;
                            else offset = 4;

                            statistics_05[offset] = Number((total_05 / 10000).toFixed(1));
                            statistics_10[offset] = Number((total_10 / 10000).toFixed(1));
                            statistics_15[offset] = Number((total_15 / 10000).toFixed(1));
                            statistics_30[offset] = Number((total_30 / 10000).toFixed(1));
                        }
                        else error_amount ++;
                    });

                    {
                        statistics_05[0] = symbol;
                        statistics_10[0] = symbol;
                        statistics_15[0] = symbol;
                        statistics_30[0] = symbol;

                        const ts = Date.now();
                        statistics_05[6] = ts;
                        statistics_10[6] = ts;
                        statistics_15[6] = ts;
                        statistics_30[6] = ts;

                        statistics_05[5] = Number((statistics_05[1] + statistics_05[2] + statistics_05[3] + statistics_05[4]).toFixed(1));
                        statistics_10[5] = Number((statistics_10[1] + statistics_10[2] + statistics_10[3] + statistics_10[4]).toFixed(1));
                        statistics_15[5] = Number((statistics_15[1] + statistics_15[2] + statistics_15[3] + statistics_15[4]).toFixed(1));
                        statistics_30[5] = Number((statistics_30[1] + statistics_30[2] + statistics_30[3] + statistics_30[4]).toFixed(1));
                    }

                    if (error_amount !== 4) {
                        console.log(`${new Date().toISOString()} ${symbol} ${statistics_05.join(', ')}`);

                        this.emit('kline', {
                            symbol: symbol
                            , '05': statistics_05
                            , '10': statistics_10
                            , '15': statistics_15
                            , '30': statistics_30
                        });
                    }
                    else {
                        this.break_symbols.push(symbol);
                        console.log(`${symbol} 在四个平台都无交易，移除该交易对`);
                    }
                }
                catch (err) {
                    log.info({ lv: 'ERROR', message: err.message, desc: symbol });
                }
            }
        }
        catch (err) {
            log.info({ lv: 'ERROR', message: err.message, desc: 'load_symbols_kline' });
        }
        finally {
            console.timeEnd('task');
            setTimeout(this.load_symbols_kline.bind(this), 30 * 1000);
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