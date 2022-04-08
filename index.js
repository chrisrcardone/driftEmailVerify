// Importing needed packages for this Nodejs Server
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const request = require('superagent');
const AWS = require('aws-sdk');

const globalConfig = {
  // Amazon SES Authentication Information, for help gathering these, follow this tutorial: https://betterprogramming.pub/how-to-send-emails-with-node-js-using-amazon-ses-8ae38f6312e4#525e
  amazonSes: {
    accessKeyId: '',
    secretAccessKey: '',
    region: ''
  },
  emailSender: {
    fromName: 'Your Company',
    fromEmail: 'support@yourcompany.com' // Must be a verified identity in your Amazon SES
  },
  // Need a Drift Token? Here's how to get one: https://devdocs.drift.com/docs/quick-start
  drift: {
    oAuthAccessToken: ''
  },
  messaging: {
    returnToConversationLink: 'Click here to jump right back into your conversation with our team.',
    // [CODE] will be auto replaced with their verification code, do not remove this. The token may only be used once.
    verificationCodePreText: 'Your verification code is [CODE].',
    emailCta: 'Please send this code to the support agent helping you to verify you own this email.',
    // [CODE] will be auto replaced with their verification code, do not remove this. The token may only be used once.
    emailSubject: 'Your Verification Code for Chat: [CODE]',
    // [EMAIL] will be auto replaced with their email address, you can remove this. The token may only be used once.
    autoReplyInChat: 'We have sent a verification code to [EMAIL] in an effort to verify your identity. Please reply here with the code we sent to complete this verification process.',
    emailSignature: '- CompanyName',
    // [SLASHCOMMAND] will be replaced with the slash command you set under globalConfig.command.slashCommand, this token may only be used once.
    noEmailAgentFacingError: `<p>Verification Process Could Not Be Performed: <b>No Email Collected</b></p><p>&nbsp;</p><p>Please collect the visitor's email and then run the /[SLASHCOMMAND] command again.</p>`,
    // The tokens [EMAIL], [CODE], and [SLASHCOMMAND] are usable here, they may each be used once. Email replaces with email code was sent to, Code with verification code, and Slash Command with your configured slash command.
    agentFacingVerificationMessage: `<p>Verification Code: <b>[CODE]</b></p><p>&nbsp;</p><p>This was sent to [EMAIL]</p><p><small>Please ask them for the code before proceeding. If they need it sent again you can use the slash command /[SLASHCOMMAND] again and a new code will be generated.</small></p>`
  },
  command: {
    slashCommand: 'verify'
  }
}

const SES_CONFIG = {
  accessKeyId: globalConfig.amazonSes.accessKeyId,
  secretAccessKey: globalConfig.amazonSes.secretAccessKey,
  region: globalConfig.amazonSes.region
};
const AWS_SES = new AWS.SES(SES_CONFIG);

// Email used to send verification code, this can be manually swapped with a template from Amazon SES
let sendEmail = (recipientEmail, verCode, returnUrl) => {
  let params = {
    Source: `'${globalConfig.emailSender.fromName}' <${globalConfig.emailSender.fromEmail}>`,
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
          Data: `<h1>${globalConfig.messaging.verificationCodePreText.replace("[CODE]", verCode)}</h1> 
          <p>${globalConfig.messaging.emailCta}</p>
          ${returnUrl}
          <p>${globalConfig.messaging.emailSignature}</p>`,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: globalConfig.messaging.emailSubject.replace("[CODE]", verCode),
      }
    },
  };
  return AWS_SES.sendEmail(params).promise();
};

// Server PORT details
const PORT = process.env.PORT || 8080

// Drift Authenication
const CONVERSATION_API_BASE = 'https://driftapi.com/v1/conversations'
const TOKEN = globalConfig.drift.oAuthAccessToken

// Starting Server
app.use(bodyParser.json())
app.listen(PORT, () => console.log(`Live on Port: ${PORT}`))

// This is the webhook to send Webhook Events to from Drift, here's how to have events sent here: https://devdocs.drift.com/docs/webhook-events-1
// You need to subscribe to the `new_command_message` event
// You need to add permissions: contact_read (allows us to get the email of the visitor), conversation_write (allows us to send the verification code into a private note in chat for agent's reference)
app.post('/messages', (req, res) => {

  // Confirming that the command message is `/verify` and not something else.
  if(!req.body.data.body.includes(`/${globalConfig.command.slashCommand}`)){
    // Ending process as the command message did not match criteria
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

          // Optional: Get URL of Conversation to Provide a Return to Conversation Link in Email
          request.get(`https://driftapi.com/conversations/${convoId}/messages`)
            .set('Content-Type', 'application/json')
            .set(`Authorization`, `bearer ${TOKEN}`)
            .send()
            .end((ohno, transcript) => {

              // Attempting to find a message that has a URL attached to it, this URL would be where the END USER sent the message from (Drift doesn't store a URL for agents chats)
              var messageWithUrl = transcript.body.data.messages.find(object => {
                // Placing in a try/catch to avoid undefined errors
                try{
                  if(object.context.href != undefined) {
                    return true;
                  }
                } catch (e) {
                  return false;
                }
              })

              // If we weren't able to find one with a URL, this will leave the `returnUrl` value blank and it will not populate in the email
              if(messageWithUrl){
              
              // Checking if the URL already has parameters so we can either begin or append to the chain properly
              if(messageWithUrl.context.href.includes("?")){
                var returnUrl = `<p><a href="${messageWithUrl.context.href}&d_conversation=${convoId}">${globalConfig.messaging.returnToConversationLink}</a></p>`
              } else {
                var returnUrl = `<p><a href="${messageWithUrl.context.href}?d_conversation=${convoId}">${globalConfig.messaging.returnToConversationLink}</a></p>`
              }

              } 
              // Else condition to prevent error if return URL is not findable
              else { var returnUrl = "&nbsp;" }


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
                    "body": globalConfig.messaging.noEmailAgentFacingError.replace("[SLASHCOMMAND]", globalConfig.command.slashCommand)

                  })
                  .catch(err => console.log(err))
                
                // Ending process as verification is not possible without email
                return

                // This will not do anything in this process. Only used/seen when testing locally.
                res.status(500)
                
              }

              // Sending Email with Verification Code to Visitor
              sendEmail(contact.body.data.attributes.email, code, returnUrl)

              // Sending Verification Code Into Conversation As A Private Note
              request.post(CONVERSATION_API_BASE + `/${convoId}/messages`)
              .set('Content-Type', 'application/json')
              .set(`Authorization`, `bearer ${TOKEN}`)
              .send({
                
                "type":"private_note",
                "body": globalConfig.messaging.agentFacingVerificationMessage.replace("[EMAIL]", contact.body.data.attributes.email).replace("[SLASHCOMMAND]", globalConfig.command.slashCommand).replace("[CODE]", code)

              })
              .catch(err => console.log(err))

              // Sending A Note In The Conversation To Verify Send
              request.post(CONVERSATION_API_BASE + `/${convoId}/messages`)
              .set('Content-Type', 'application/json')
              .set(`Authorization`, `bearer ${TOKEN}`)
              .send({
                
                "type":"chat",
                "body": globalConfig.messaging.autoReplyInChat.replace("[EMAIL]", contact.body.data.attributes.email)

              })
              .catch(err => console.log(err))

              })

            // Added closing bracket used when you're getting the return to conversation URL, remove if you've removed that.  
            })

        })

  // This will not do anything in this process. Only used/seen when testing locally.
  res.send(`Verification process executed.`)

})
