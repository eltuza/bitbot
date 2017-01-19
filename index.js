'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const auth = require('./auth');

const app = express()

app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

const token = auth.page_token;

// Index route
app.get('/', function (req, res) {
    res.send('Hello world, I am a chat bot ' + token)
})

// for Facebook verification
app.post('/webhook/', function (req, res) {
  console.log(req)
  console.log(req.body);
  let messaging_events = req.body.entry[0].messaging
  for (let i = 0; i < messaging_events.length; i++) {
      let event = req.body.entry[0].messaging[i]
      let sender = event.sender.id
      if (event.message && event.message.text) {
          let text = event.message.text
          sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200))
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
