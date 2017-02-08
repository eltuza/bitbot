'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')

const BitBot = require('./bitbot');

const app = express()

app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

const APP_TOKEN = process.env.BITBOT_PAGE_TOKEN;

const bitbot = new BitBot(APP_TOKEN);

// Index route
app.get('/', function (req, res) {
  res.send('Yo dawg! I am BitBot')
})

// Chatbot messages entry point.
app.post('/webhook/', bitbot.middleware);

// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
})

// On general messages, we try to interpret the tokens and perform a conversion.
bitbot.on(BitBot.MESSAGE_EVENT, function(message, sender) {
  // converter.evaluate returns a promise
  converter
    .evaluate(message)
    .then(function(result) {
      bitbot.sendTextMessage(result, sender)
    }, function(error) {
      console.log(error);
      bitbot.sendTextMessage(error, sender);
    });
});

// TODO: Register postback events
// TODO: Register specific commands with followups.
// TODO: Integrate redis to follow up conversations depending previous messages.

