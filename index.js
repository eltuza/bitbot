'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const converter = require('./converter');

const app = express()

app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

const APP_TOKEN = process.env.BITBOT_PAGE_TOKEN;

// Index route
app.get('/', function (req, res) {
  res.send('Yo dawg! I am BitBot')
})

// for Facebook verification
app.post('/webhook/', function (req, res) {
  let messaging_events = req.body.entry[0].messaging
  for (let i = 0; i < messaging_events.length; i++) {
      let event = req.body.entry[0].messaging[i]
      let sender = event.sender.id
      if (event.message && event.message.text) {

        let message = event.message.text;
        const result = converter.evaluate(message);

        sendTextMessage(sender, result)
      }
  }
  res.sendStatus(200)
})

// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
})

function sendTextMessage(sender, text) {
  let messageData = { text:text }
  request({
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: { access_token: APP_TOKEN },
      method: 'POST',
      json: {
          recipient: { id: sender },
          message: messageData,
      }
  }, function(error, response, body) {
      if (error) {
          console.log('Error sending messages: ', error)
      } else if (response.body.error) {
          console.log('Error: ', response.body.error)
      }
  })
}
