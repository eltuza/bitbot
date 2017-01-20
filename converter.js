'use strict'
const request = require('request')

const BITCOINVERTER_BASE_URL = 'https://apiv2.bitcoinaverage.com/convert/global?';
const DEFAULT_FIAT_SYMBOL = 'USD';
const BTC_SYMBOL = 'BTC';

module.exports = {
  evaluate: function(message) {
    var tokens = message.split(' ');

    if (tokens.length === 1) {
      // Check if symbol or number.
      if (isNaN(tokens[0])) {
        // Ticker
        const ticker = tokens[0];
        const target = `${BITCOINVERTER_BASE_URL}from=${BTC_SYMBOL}&to=${ticker}`;
      } else {
        const amount = tokens[0];
        const target = `${BITCOINVERTER_BASE_URL}from=${BTC_SYMBOL}&to=${DEFAULT_FIAT_SYMBOL}&amount=${amount}`;
      }

    } else if (tokens.length === 2) {
      const amount = token[0];
      const tickers = token[1];

      let tickFrom, tickTo;

      if (tickers.length === 6) {
        tickFrom = tickers.slice(0, 3).toUpperCase();
        tickTo = tickers.slice(3).toUpperCase();
      } else if (tickers.length === 3) {
        tickFrom = BTC_SYMBOL;
        tickTo = tickers;
      } else {
        return `Can't interpret ${tickers.join(' ')}`;
      }
      const target = `${BITCOINVERTER_BASE_URL}from=${tickFrom}&to=${tickTo}&amount=${amount}`;
      console.log(target);
    } else {
      return `Can't interpret ${tickers.join(' ')}`;
    }

    request({
      url: target,
      method: 'GET',
    }, function(error, response, body) {
      if (error) {
        console.log('Error sending messages: ', error)
      } else if (response.body.error) {
        console.log('Error: ', response.body.error)
      } else {
        console.log(response.body);
      }
    })
  }
}
