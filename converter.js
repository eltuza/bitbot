'use strict'
const request = require('request')

const BITCOINVERTER_BASE_URL = 'https://apiv2.bitcoinaverage.com/convert/global?';
const DEFAULT_FIAT_SYMBOL = 'USD';
const BTC_SYMBOL = 'BTC';

// Cases:
//
// 1 BTC
// BTC USD
// BTC
// USD BTC
// 2 BTC USD

function isTicker(token) {
  return typeof token === 'string' &&
    token.length === 3 &&
    ! /^\d+$/.test(token);
}

function Conversion(fromTicker, toTicker, amount) {
  this.fromTicker = fromTicker;
  this.toTicker = toTicker || fromTicker.toLowerCase() ? 'usd' : BTC_SYMBOL : DEFAULT_FIAT_SYMBOL;
  this.amount = amount || 1;
}

function processToken(token) {
  // TODO: Create a hash of valid tokens to compare.
  if (token.length === 3) {
    return new Conversion(token.toUpperCase());
  } else if (token.length === 6) {
    return new Conversion(token.slice(0, 3).toUpperCase(), token.slice(3).toUpperCase())
  } else if (/^\d+$/.test(token)) {
    return new Conversion(BTC_SYMBOL, DEFAULT_FIAT_SYMBOL, token);
  } else {
    return null;
  }
}

module.exports = {
  evaluate: function(message) {
    var tokens = message.split(' ');
    let target;
    if (tokens.length === 1) {
      var token = tokens[0];

      // TODO: Create a hash of valid tokens to compare.
      var conversion = processToken(token);
      if (!conversion) {
        return `Can't process your input: ${token}`;
      }

      target = `${BITCOINVERTER_BASE_URL}from=${conversion.fromTicker}&to=${conversion.toTicker}`;
      // Check if symbol or number.
      // if (isNaN(tokens[0])) {
      //   // Ticker
      //   const ticker = tokens[0];
      //   target = `${BITCOINVERTER_BASE_URL}from=${BTC_SYMBOL}&to=${ticker}`;
      // } else {
      //   const amount = tokens[0];
      //   target = `${BITCOINVERTER_BASE_URL}from=${BTC_SYMBOL}&to=${DEFAULT_FIAT_SYMBOL}&amount=${amount}`;
      // }

    } else if (tokens.length === 2) {
      const token1 = tokens[0];
      const token2 = tokens[1];

      var conversion;
      if (isTicker(token1)) {
        conversion = new Conversion(
          token1,
          isTicker(token2) ? token : undefined,
          isTicker(token2) ? undefined : token2
        )
      } else if(/^\d+$/.test(token1)) {
        // Seria un numero siempre?
        conversion = processToken(token2);
        conversion.amount = token1;
      } else {
        return `Can't interpret ${tokens.join(' ')}`;
      }

      target = `${BITCOINVERTER_BASE_URL}from=${conversion.fromTicker}&to=${conversion.toTicker}&amount=${conversion.amount}`;
      console.log(target);
    } else {
      return `Can't interpret ${tokens.join(' ')}`;
    }

    request({
      url: target,
      method: 'GET',
    }, function(error, response, body) {
      if (error) {
        console.log('Error sending messages: ', error);
        return `Can't send message to service. Try again later or report the issue.`;
      } else if (response.body.error) {
        console.log('Error: ', response.body.error)
        return `Can't understand your input. Write <b>help</b> to see instructions.`;
      } else {
        return 'Mh...something went wrong. Please report this issue.'
        console.log(response.body);
      }
    })
  }
}
