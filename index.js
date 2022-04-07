// Importing needed packages for this Nodejs Server
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const request = require('superagent');
const AWS = require('aws-sdk');

// Amazon SES Authentication Information, for help gathering these, follow this tutorial: https://betterprogramming.pub/how-to-send-emails-with-node-js-using-amazon-ses-8ae38f6312e4#525e
const SES_CONFIG = {
  accessKeyId: '<Access Key>',
  secretAccessKey: '<Secret Access Key>',
  region: '<AWS Region>',
};
const AWS_SES = new AWS.SES(SES_CONFIG);
// Email used to send verification code, this can be manually swapped with a template from Amazon SES
let sendEmail = (recipientEmail, verCode) => {
  let params = {
    Source: "'<FROM NAME>' <<FROM EMAIL>>", // Be sure to encase the email in <>. Example: "'Your Company' <support@yourcompany.com>"
    Destination: {
      ToAddresses: [
        recipientEmail
      ],
    },
    ReplyToAddresses: [],
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: `<h1>Your verification code is ${verCode}.</h1> 
          <p>Please send this code to the support agent helping you to verify you own this email.</p>
          <p>- <Company Name></p>`,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: `Verification Code for Chat: <Company Name>`,
      }
    },
  };
  return AWS_SES.sendEmail(params).promise();
};

// Server PORT details
const PORT = process.env.PORT || 8080

// Drift Authenication
const CONVERSATION_API_BASE = 'https://driftapi.com/v1/conversations'
const TOKEN = "<Drift OAuth Access Token>" // Need a Drift Token? Here's how to get one: https://devdocs.drift.com/docs/quick-start

// Starting Server
app.use(bodyParser.json())
app.listen(PORT, () => console.log(`Testing app listening on port ${PORT}!`))

// This is the webhook to send Webhook Events to from Drift, here's how to have events sent here: https://devdocs.drift.com/docs/webhook-events-1
// You need to subscribe to the `new_command_message` event
// You need to add permissions: contact_read (allows us to get the email of the visitor), conversation_write (allows us to send the verification code into a private note in chat for agent's reference)
app.post('/messages', (req, res) => {

  // Confirming that the command message is `/verify` and not something else. You can also change this to adjust form `/verify` to whichever command you'd like
  if(!req.body.data.body.includes("/verify")){    
    // Ending request
    return
    // This will not do anything in this process. Only used/seen when testing locally.
    res.send(`Not requesting verification.`)
  }

  // Saving Conversation ID and Generating Random 4 Digit Code
  const convoId = req.body.data.conversationId;
  const code = Math.floor(Math.random() * 10000);
  
  // Getting Conversation Details to Gather Visitor's ID
  request.get(`https://driftapi.com/conversations/${convoId}`)
      .set('Content-Type', 'application/json')
      .set(`Authorization`, `bearer ${TOKEN}`)
      .send()
      .end((err, result) => {

          // Using Visitor's ID to Request Their Email
          request.get(`https://driftapi.com/contacts/${result.body.data.contactId}`)
            .set('Content-Type', 'application/json')
            .set(`Authorization`, `bearer ${TOKEN}`)
            .send()
            .end((error, contact) => {
            
              // Checking that there is an email on file that we can send verification code to
              if(!contact.body.data.attributes.email){
               
                // Letting agent know when there is no email, thus, no verification can be performed
                request.post(CONVERSATION_API_BASE + `/${convoId}/messages`)
                  .set('Content-Type', 'application/json')
                  .set(`Authorization`, `bearer ${TOKEN}`)
                  .send({

                    "type":"private_note",
                    "body": `<p>Verification Process Could Not Be Performed: <b>No Email Collected</b></p><p>&nbsp;</p><p>Please collect the visitor's email and then run the /verify command again.</p>`

                  })
                  .catch(err => console.log(err))
                
                // Ending process as verification is not possible without email
                return
                // This will not do anything in this process. Only used/seen when testing locally.
                res.send(`No email collected, unable to run verification process.`)
                
              }

              // Sending Email with Verification Code to Visitor
              sendEmail(contact.body.data.attributes.email, code)

              // Sending Verification Code Into Conversation As A Private Note
              request.post(CONVERSATION_API_BASE + `/${convoId}/messages`)
              .set('Content-Type', 'application/json')
              .set(`Authorization`, `bearer ${TOKEN}`)
              .send({
                
                "type":"private_note",
                "body": `<p>Verification Code: <b>${code}</b></p><p>&nbsp;</p><p>This was sent to ${contact.body.data.attributes.email}</p><p><small>Please ask them for the code before proceeding. If they need it sent again you can use the slash command again and a new code will be generated.</small></p>`

              })
              .catch(err => console.log(err))

              // Sending A Note In The Conversation To Verify Send
              request.post(CONVERSATION_API_BASE + `/${convoId}/messages`)
              .set('Content-Type', 'application/json')
              .set(`Authorization`, `bearer ${TOKEN}`)
              .send({
                
                "type":"chat",
                "body": `We have sent a verification code to ${contact.body.data.attributes.email} in an effort to verify your identity. Please reply here with the code we sent to complete this verification process.`

              })
              .catch(err => console.log(err))

              })

        })

  // This will not do anything in this process. Only used/seen when testing locally.
  res.send(`Verification process executed.`)

})
