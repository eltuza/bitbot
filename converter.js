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


// Talk:
// Sell / Buy
// what Exchange?
// Price right?
// Add commission
//
function isTicker(token) {
  return typeof token === 'string' &&
    token.length === 3 &&
    ! /^\d+$/.test(token);
}

function Conversion(fromTicker, toTicker, amount) {
  this.fromTicker = fromTicker.toUpperCase();
  this.toTicker = toTicker ? toTicker.toUpperCase() : fromTicker.toLowerCase() === 'usd' ? BTC_SYMBOL : DEFAULT_FIAT_SYMBOL;
  this.amount = amount || 1;
}

function processToken(token) {
  // TODO: Create a hash of valid tokens to compare.
  if (token.length === 3) {
    return new Conversion(token);
  } else if (token.length === 6) {
    return new Conversion(token.slice(0, 3), token.slice(3))
  } else if (/^\d+$/.test(token)) {
    return new Conversion(BTC_SYMBOL, DEFAULT_FIAT_SYMBOL, token);
  } else {
    return null;
  }
}

module.exports = {
  // Returns a promise that resolves to the conversion results.
  evaluate: function(message) {
    var tokens = message.split(' ');
    let target;
    var conversion;
    if (tokens.length === 1) {
      var token = tokens[0];

      // TODO: Create a hash of valid tokens to compare.
      conversion = processToken(token);
      if (!conversion) {
        return Promise.reject(`Can't process your input: ${token}`);
      }

      target = `${BITCOINVERTER_BASE_URL}from=${conversion.fromTicker}&to=${conversion.toTicker}`;
    } else if (tokens.length === 2) {
      const token1 = tokens[0];
      const token2 = tokens[1];

      if (isTicker(token1)) {
        conversion = new Conversion(
          token1,
          isTicker(token2) ? token2 : undefined,
          isTicker(token2) ? undefined : token2
        )
      } else if(/^\d+$/.test(token1)) {
        // Seria un numero siempre?
        conversion = processToken(token2);
        conversion.amount = token1;
      } else {
        return Promise.reject(`Can't interpret ${tokens.join(' ')}`);
      }

      target = `${BITCOINVERTER_BASE_URL}from=${conversion.fromTicker}&to=${conversion.toTicker}&amount=${conversion.amount}`;
      console.log(target);
    } else if (tokens.length === 3) {
      // We have all args. Check that we get an amount and two tickers in order.

      // TODO: implement
      return;
    } else {
      return Promise.reject(`Can't interpret ${tokens.join(' ')}`);
    }

    return new Promise(function(resolve, reject) {
      request({
        url: target,
        method: 'GET',
      }, function(error, response, body) {
        if (error) {
          console.log('Error sending messages: ', error);
          reject(`Can't send message to service. Try again later or report the issue.`);
        } else if (response.body.error) {
          console.log('Error: ', response.body.error)
          reject(`Can't understand your input. Write <b>help</b> to see instructions.`);
        } else {
          var resp = response.body;
          if (typeof resp !== 'object') {
            try {
              resp = JSON.parse(resp);
            } catch (e) {
              reject(`I can't interpret the result at the time. Sorry!`);
            }
          }

          if (!resp.price) {
            reject(`I can't interpret the result at the time. Sorry!`);
          } else {
            resolve(`${conversion.amount} ${conversion.fromTicker} is ${resp.price} ${conversion.toTicker}`);
          }
          console.log(resp);
        }
      })
    });
  }
}
