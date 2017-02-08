'use strict'
const converter = require('./converter');

const FACEBOOK_MESSAGES_URL = 'https://graph.facebook.com/v2.6/me/messages';

/**
 * Constructor for the bot module.
 * @param {[string]} appToken Facebook app access token.
 * @constructor
 */
function BitBot(appToken) {
  this.APP_TOKEN = appToken;
  this.commands = {};
  this.handlers = {};
}

BitBot.MESSAGE_EVENT = 'message';
BitBot.POSTBACK_EVENT = 'postback';


/**
 * Processes the webhook requests to the bot and returns a response.
 */
BitBot.prototype.middleware = function (req, res) {
  let messaging_events = req.body.entry[0].messaging
  for (let i = 0; i < messaging_events.length; i++) {
      let event = req.body.entry[0].messaging[i]
      let sender = event.sender.id

      if (event.message && event.message.text) {
        let message = event.message.text;

        // TODO: Check if we have a payload and call handler.

        // TODO: Here try to interpret message within list of registered commands through 'listen';

        // If no commands interpreted so far, call the message handler
        this.handlers[MESSAGE_EVENT] && this.handlers[MESSAGE_EVENT](message, sender);
      }
  }
  res.sendStatus(200)
};

/**
 * Listens for specific commands.
 * Adds the commands to a list, and on each new message we check if the commands exist in order to take action
 */
BitBot.prototype.listen = function(message, handler) {
  this.commands[message]
}

/**
 * Registers a handler for a specific event type
 * @param  {string} event   The event type to register.
 * @param  {func} handler   The handler for that event.
 */
BitBot.prototype.on = function(event, handler) {
  if (event in this.handlers) {
    throw `Handler for ${event} is already registered.`;
  }

  this.handlers[event] = handler;
}

BitBot.prototype.unsuscribe = function(event) {
  this.handlers[event] = null;
  delete this.handlers[event];
}

BitBot.prototype.sendTextMessage = function(text, sender) {
  let messageData = { text: text }
  request({
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: { access_token: this.APP_TOKEN },
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

BitBot.prototype.sendButtonsMessage = function(sender, altcoin) {
  // let messageData = { text:text }
  request({
      url: FACEBOOK_MESSAGES_URL,
      qs: { access_token: this.APP_TOKEN },
      method: 'POST',
      json: {
          recipient: { id: sender },
          message: {
            "attachment":{
              "type": "template",
              "payload":{
                "template_type":"button",
                "text": `What do you want to convert ${altcoin} to?`,
                "buttons":[
                  {
                    "type":"web_url",
                    "url":"https://petersapparel.parseapp.com",
                    "title":"Show Website"
                  },
                  {
                    "type":"postback",
                    "title":"Start Chatting",
                    "payload":"USER_DEFINED_PAYLOAD"
                  }
                ]
              }
            }
          },
      }
  }, function(error, response, body) {
      if (error) {
          console.log('Error sending messages: ', error)
      } else if (response.body.error) {
          console.log('Error: ', response.body.error)
      }
  })
}


module.exports = BitBot;

