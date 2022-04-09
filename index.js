// Importing needed packages for this Nodejs Server
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const request = require('superagent');
const AWS = require('aws-sdk');
const emails = require('./functions');
const schedule = require('node-schedule');

const globalConfig = {
  // Amazon SES Authentication Information, for help gathering these, follow this tutorial: https://betterprogramming.pub/how-to-send-emails-with-node-js-using-amazon-ses-8ae38f6312e4#525e
  settings: {
    useLandingPages: true,
    oneClickConfirmationAndReport: false,
    protocol: 'https://',
    testMode: false,
    landingPageVerificationSpamThreshold: 2,
    landingPageReportSpamThreshold: 2
  },
  amazonSes: {
    accessKeyId: '',
    secretAccessKey: '',
    region: ''
  },
  emailSender: {
    fromName: '',
    fromEmail: ''
  },
  // Need a Drift Token? Here's how to get one: https://devdocs.drift.com/docs/quick-start
  drift: {
    oAuthAccessToken: '',
    verificationToken: ''
  },
  messaging: {
    company: {
      companyName: 'Company Name',
      websiteUrl: 'https://yourwebsite.com'
    },
    email: {
      landingPage: {
        subject: '[Action] Verify Your Email for Chat',
        context: `You're receiving this email because you're currently chatting with our support team.`,
        explainer: `To protect you and our other customers, for our support team to continue helping, we require you verify your email. You may do so by clicking the link below.`,
        confirmButton: `Confirm email address`,
        reportButton: `Report not me`
      },
      code: {
        subject: 'Your Verification Code for Chat: [CODE]',
        context: `You're receiving this email because you're currently chatting with our support team.`,
        code: `Your verification code is [CODE]`,
        returnToChat: `Return to your conversation in chat >`
      }
    },
    drift: {
      landingPage: {
        external: {
          chatAutoReply: 'We have sent a verification email to [EMAIL] in an effort to verify your identity. Please click the link in that email to complete this verification process.',
          thankYou: `<p><b>Success!</b> Thank you for verifying your email address.</p>`
        },
        internal: {
          noEmailError: `<p>Verification Process Could Not Be Performed: <b>No Email Collected</b></p><p>&nbsp;</p><p>Please collect the visitor's email and then run the /[SLASHCOMMAND] command again.</p>`,
          verificationMessage: `<p><b>Sent to [EMAIL]</b></p><p>&nbsp;</p><p>Once the customer verifies their email by clicking the link sent to them, a verification message will appear here.</p>`,
          verified: `<p><b>Success!</b> This user has verified their email.</p>`,
          reported: `<p><b>Problem!</b> The email owner has reported that they are not the ones chatting with you.</p>`
        }
      },
      code: {
        external: {
          chatAutoReply: 'We have sent a verification code to [EMAIL] in an effort to verify your identity. Please reply here with the code we sent to complete this verification process.'
        },
        internal: {
          noEmailError: `<p>Verification Process Could Not Be Performed: <b>No Email Collected</b></p><p>&nbsp;</p><p>Please collect the visitor's email and then run the /[SLASHCOMMAND] command again.</p>`,
          verificationMessage: `<p>Verification Code: <b>[CODE]</b></p><p>&nbsp;</p><p>This was sent to [EMAIL]</p><p><small>Please ask them for the code before proceeding. If they need it sent again you can use the slash command /[SLASHCOMMAND] again and a new code will be generated.</small></p>`
        }
      }
    }
  },
  command: {
    slashCommand: 'verify'
  },
  landingPage: {
    allPages: {
      companyName: 'Company Name',
      faviconUrl: ``
    },
    confirmationPage: {
      pageTitle: 'Support Chat Verification',
      headerMessage: `Hey 👋`,
      bodyMessage: `We're looking to verify that you are currently chatting with us through the live chat on our website. If this is you, click below and we'll take you right back to that conversation.`,
      confirmButton: `Yes, that's me`,
      notMeLink: `Not me, report now`
    },
    successPage: {
      pageTitle: 'Email Verified',
      withReturnUrl: {
        headerMessage: 'All set!',
        bodyMessage: `We'll redirect you back to your conversation in 3 seconds, if you're not redirected, <a href="[redirectUrl]">click here</a>.`
      },
      withoutReturnUrl: {
        headerMessage: 'All set!',
        bodyMessage: `You can close this tab and return to your chat with our team. Your email has been verified.`
      },
      alreadyVerified: {
        pageTitle: 'Already Verified',
        headerMessage: 'You already verified yourself.',
        bodyMessage: `We cannot process an additional verification as you have already verified your email within the past 4 hours.`
      }
    },
    notMePage: {
      pageTitle: 'Reported',
      headerMessage: 'Thank you.',
      bodyMessage: `We've reported that you are not the person chatting in to the agent managing the live chat conversation that prompted this email verification request. You may also <a href="[websiteUrl]">get in touch with us</a> if you'd like to.`,
      alreadyReported: {
        pageTitle: 'Already Reported',
        headerMessage: 'This conversation has been reported',
        bodyMessage: `We cannot process an additional report as this conversation as already been reported within the past 4 hours.`
      }
    }
  }
}

const AWS_SES = new AWS.SES(globalConfig.amazonSes);

// Email used to send verification code, this can be manually swapped with a template from Amazon SES
let sendEmail = (recipientEmail, emailName, emailDetails) => {
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
          Data: emails.build(emailName, globalConfig,emailDetails).body,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: emails.build(emailName, globalConfig,emailDetails).subject,
      }
    },
  };
  return AWS_SES.sendEmail(params).promise();
};

// Server PORT details
const PORT = process.env.PORT || 8080

// Starting Server
app.use(bodyParser.json())
app.listen(PORT, () => console.log(`Live on Port: ${PORT}`))

// This is the webhook to send Webhook Events to from Drift, here's how to have events sent here: https://devdocs.drift.com/docs/webhook-events-1
// You need to subscribe to the `new_command_message` event
// You need to add permissions: contact_read (allows us to get the email of the visitor), conversation_write (allows us to send the verification code into a private note in chat for agent's reference)
app.post('/messages', (req, res) => {

  // Confirming request has proper token, if in test mode, not requiring token
  if(!globalConfig.settings.testMode && req.body.token !== globalConfig.drift.verificationToken){

    // Rejecting request.
    res.status(500).end()

    return

  }

  // Confirming that the command message is `/verify` and not something else.
  if(!req.body.data.body.includes(`/${globalConfig.command.slashCommand}`) || req.body.data.author.type !== "user"){

    res.status(200).end()

    // Ending process as the command message did not match criteria
    return

  }

  // Saving Conversation ID and Generating Random 4 Digit Code
  const convoId = req.body.data.conversationId;
  const code = Math.floor(Math.random() * 10000);

  var tokens = [
    {
      placeholder: "[CONVOID]",
      value: convoId
    },
    {
      placeholder: "[CODE]",
      value: code
    },
    {
      placeholder: "[SLASHCOMMAND]",
      value: globalConfig.command.slashCommand
    }
  ]
  
  // Getting Conversation Details to Gather Visitor's ID
  request.get(`https://driftapi.com/conversations/${convoId}`)
      .set('Content-Type', 'application/json')
      .set(`Authorization`, `bearer ${globalConfig.drift.oAuthAccessToken}`)
      .send()
      .end((err, result) => {

          // Optional: Get URL of Conversation to Provide a Return to Conversation Link in Email
          request.get(`https://driftapi.com/conversations/${convoId}/messages`)
            .set('Content-Type', 'application/json')
            .set(`Authorization`, `bearer ${globalConfig.drift.oAuthAccessToken}`)
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
                // Setting hasReturnUrl which is used for email personalization
             var hasReturnUrl = true;
              
              // Checking if the URL already has parameters so we can either begin or append to the chain properly
              if(messageWithUrl.context.href.includes("?")){
                var returnUrl = `${messageWithUrl.context.href}&d_conversation=${convoId}`
              } else {
                var returnUrl = `${messageWithUrl.context.href}?d_conversation=${convoId}`
              }

              } 
              // Else condition to prevent error if return URL is not findable
              else { var returnUrl = "&nbsp;" 
               // Setting hasReturnUrl which is used for email personalization
              var hasReturnUrl = false;}


          // Using Visitor's ID to Request Their Email
          request.get(`https://driftapi.com/contacts/${result.body.data.contactId}`)
            .set('Content-Type', 'application/json')
            .set(`Authorization`, `bearer ${globalConfig.drift.oAuthAccessToken}`)
            .send()
            .end((error, contact) => {

              // Checking that there is an email on file that we can send verification code to
              if(!contact.body.data.attributes.email){
               
                // Letting agent know when there is no email, thus, no verification can be performed
                request.post(`https://driftapi.com/conversations/${convoId}/messages`)
                  .set('Content-Type', 'application/json')
                  .set(`Authorization`, `bearer ${globalConfig.drift.oAuthAccessToken}`)
                  .send({

                    "type":"private_note",
                    "body": globalConfig.settings.useLandingPages ? emails.tokens(globalConfig.messaging.drift.landingPage.internal.noEmailError, tokens) : emails.tokens(globalConfig.messaging.drift.code.internal.noEmailError, tokens)

                  })
                  .catch(err => console.log(err))
                
                  res.status(200).end()

                  // Ending process as the command message did not match criteria
                  return
                
              }

              tokens.push({"placeholder":"[EMAIL]","value": contact.body.data.attributes.email})

              // Sending Email with Verification Code to Visitor
              sendEmail(contact.body.data.attributes.email, globalConfig.settings.useLandingPages ? "verifyWithLandingPage" : "verifyWithCode", {code, hasReturnUrl, returnUrl, confirmLink: globalConfig.settings.oneClickConfirmationAndReport ? `${globalConfig.settings.protocol}${req.headers.host}/verifyMe/yes/${convoId}` : `${globalConfig.settings.protocol}${req.headers.host}/verifyMe/${convoId}`, reportLink: globalConfig.settings.oneClickConfirmationAndReport ? `${globalConfig.settings.protocol}${req.headers.host}/verifyMe/report/${convoId}` : `${globalConfig.settings.protocol}${req.headers.host}/verifyMe/${convoId}`})

              // Sending Verification Code Into Conversation As A Private Note
              request.post(`https://driftapi.com/conversations/${convoId}/messages`)
              .set('Content-Type', 'application/json')
              .set(`Authorization`, `bearer ${globalConfig.drift.oAuthAccessToken}`)
              .send({
                
                "type":"private_note",
                "body": globalConfig.settings.useLandingPages ? emails.tokens(globalConfig.messaging.drift.landingPage.internal.verificationMessage, tokens) : emails.tokens(globalConfig.messaging.drift.code.internal.verificationMessage, tokens)

              })
              .catch(err => console.log(err))

              // Sending A Note In The Conversation To Verify Send
              request.post(`https://driftapi.com/conversations/${convoId}/messages`)
              .set('Content-Type', 'application/json')
              .set(`Authorization`, `bearer ${globalConfig.drift.oAuthAccessToken}`)
              .send({
                
                "type":"chat",
                "body": globalConfig.settings.useLandingPages ? emails.tokens(globalConfig.messaging.drift.landingPage.external.chatAutoReply, tokens) : emails.tokens(globalConfig.messaging.drift.code.external.chatAutoReply, tokens)

              })
              .catch(err => console.log(err))

              })

            // Added closing bracket used when you're getting the return to conversation URL, remove if you've removed that.  
            })

        })

  // This will not do anything in this process. Only used/seen when testing locally.
  res.send(`Verification process executed.`)

})

// LANDING PAGES

let verifiedConvoIds = []
let reportedConvoIds = []

app.get('/verifyMe/yes/:convoId', function(req, res) {

  if(!globalConfig.settings.useLandingPages){
    
    res.status(400).end()
    return

  }

  const convoId = req.params.convoId;

  verifiedConvoIds.push(convoId)

  if(verifiedConvoIds.filter((id) => (id === convoId)).length > globalConfig.settings.landingPageVerificationSpamThreshold){

    res.send(`<!doctype html>
                <html lang="en">
                  <head>
                    <link rel="icon" href="${globalConfig.landingPage.allPages.faviconUrl}">
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <meta name="robots" content="noindex">
                
                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">
                
                    <title>${globalConfig.landingPage.successPage.alreadyVerified.pageTitle} | ${globalConfig.landingPage.allPages.companyName}</title>
                  </head>
                  <body>
                
                <div class="container-sm">
                    <div class="card m-auto mt-5">
                  <h5 class="card-header">${globalConfig.landingPage.allPages.companyName}</h5>
                  <div class="card-body">
                    <h5 class="card-title">${globalConfig.landingPage.successPage.alreadyVerified.headerMessage}</h5>
                    <p class="card-text">${globalConfig.landingPage.successPage.alreadyVerified.bodyMessage}</p>
                  </div>
                </div>
                </div>
                                
                   
                  </body>
                  
                </html>`)

  } else {


    request.post(`https://driftapi.com/conversations/${convoId}/messages`)
    .set('Content-Type', 'application/json')
    .set(`Authorization`, `bearer ${globalConfig.drift.oAuthAccessToken}`)
    .send({
      
      "type":"chat",
      "body": `${globalConfig.messaging.drift.landingPage.external.thankYou}`

    })
    .catch(err => console.log(err))


  request.post(`https://driftapi.com/conversations/${convoId}/messages`)
    .set('Content-Type', 'application/json')
    .set(`Authorization`, `bearer ${globalConfig.drift.oAuthAccessToken}`)
    .send({
      
      "type":"private_note",
      "body": `${globalConfig.messaging.drift.landingPage.internal.verified}`

    })
    .catch(err => console.log(err))

    request.get(`https://driftapi.com/conversations/${convoId}/messages`)
            .set('Content-Type', 'application/json')
            .set(`Authorization`, `bearer ${globalConfig.drift.oAuthAccessToken}`)
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

                var urlToRedirect = `${messageWithUrl.context.href}&d_conversation=${convoId}`

              } else {
                
                var urlToRedirect = `${messageWithUrl.context.href}?d_conversation=${convoId}`
              
              }

              res.redirect(urlToRedirect)

              } 
              // Else condition to prevent error if return URL is not findable
              else { 

                res.send(`<!doctype html>
                <html lang="en">
                  <head>
                    <link rel="icon" href="${globalConfig.landingPage.allPages.faviconUrl}">
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <meta name="robots" content="noindex">
                
                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">
                
                    <title>${globalConfig.landingPage.successPage.pageTitle} | ${globalConfig.landingPage.allPages.companyName}</title>
                  </head>
                  <body>
                
                <div class="container-sm">
                    <div class="card m-auto mt-5">
                  <h5 class="card-header">${globalConfig.landingPage.allPages.companyName}</h5>
                  <div class="card-body">
                    <h5 class="card-title">${globalConfig.landingPage.successPage.withoutReturnUrl.headerMessage}</h5>
                    <p class="card-text">${globalConfig.landingPage.successPage.withoutReturnUrl.bodyMessage}</p>
                  </div>
                </div>
                </div>
                                
                   
                  </body>
                  
                </html>`)


               }
            
            })

  
          }

})

app.get('/verifyMe/report/:convoId', function(req, res) {

  if(!globalConfig.settings.useLandingPages){
    
    res.status(400).end()
    return

  }

  const convoId = req.params.convoId;
  reportedConvoIds.push(convoId)

  if(reportedConvoIds.filter((id) => (id === convoId)).length > globalConfig.settings.landingPageReportSpamThreshold){

    res.send(`<!doctype html>
                <html lang="en">
                  <head>
                    <link rel="icon" href="${globalConfig.landingPage.allPages.faviconUrl}">
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <meta name="robots" content="noindex">
                
                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">
                
                    <title>${globalConfig.landingPage.notMePage.alreadyReported.pageTitle} | ${globalConfig.landingPage.allPages.companyName}</title>
                  </head>
                  <body>
                
                <div class="container-sm">
                    <div class="card m-auto mt-5">
                  <h5 class="card-header">${globalConfig.landingPage.allPages.companyName}</h5>
                  <div class="card-body">
                    <h5 class="card-title">${globalConfig.landingPage.notMePage.alreadyReported.headerMessage}</h5>
                    <p class="card-text">${globalConfig.landingPage.notMePage.alreadyReported.bodyMessage}</p>
                  </div>
                </div>
                </div>
                                
                   
                  </body>
                  
                </html>`)

  } else {


  request.post(`https://driftapi.com/conversations/${convoId}/messages`)
    .set('Content-Type', 'application/json')
    .set(`Authorization`, `bearer ${globalConfig.drift.oAuthAccessToken}`)
    .send({
      
      "type":"private_note",
      "body": `${globalConfig.messaging.drift.landingPage.internal.reported}`

    })
    .catch(err => console.log(err))

    res.send(`<!doctype html>
    <html lang="en">
      <head>
        <link rel="icon" href="${globalConfig.landingPage.allPages.faviconUrl}">
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="robots" content="noindex">
    
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">
    
        <title>${globalConfig.landingPage.notMePage.pageTitle} | ${globalConfig.landingPage.allPages.companyName}</title>
      </head>
      <body>
    
    <div class="container-sm">
        <div class="card m-auto mt-5">
      <h5 class="card-header">${globalConfig.landingPage.allPages.companyName}</h5>
      <div class="card-body">
        <h5 class="card-title">${globalConfig.landingPage.notMePage.headerMessage}</h5>
        <p class="card-text">${globalConfig.landingPage.notMePage.bodyMessage.replace("[websiteUrl]", globalConfig.messaging.company.websiteUrl)}</p>
      </div>
    </div>
    </div>
    
       
      </body>
      
    </html>`)
  
  }


})

app.get('/verifyMe/:convoId', function(req, res) {

  if(!globalConfig.settings.useLandingPages){
    
    res.status(400).end()
    return

  }

  res.send(`<!doctype html>
  <html lang="en">
    <head>
      <link rel="icon" href="${globalConfig.landingPage.allPages.faviconUrl}">
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <meta name="robots" content="noindex">
  
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">
  
      <title>${globalConfig.landingPage.confirmationPage.pageTitle} | ${globalConfig.landingPage.allPages.companyName}</title>
    </head>
    <body>
      <div class="container-sm">
      <div class="card m-auto mt-5">
    <h5 class="card-header">${globalConfig.landingPage.allPages.companyName}</h5>
    <div class="card-body">
      <h5 class="card-title">${globalConfig.landingPage.confirmationPage.headerMessage}</h5>
      <p class="card-text">${globalConfig.landingPage.confirmationPage.bodyMessage}</p>
      <p><a href="/verifyMe/yes/${req.params.convoId}" class="btn btn-primary">${globalConfig.landingPage.confirmationPage.confirmButton}</a></p>
      <a href="/verifyMe/report/${req.params.convoId}" id="notMe">${globalConfig.landingPage.confirmationPage.notMeLink}</a>
    </div>
  </div>
  </div>
    
     
    </body>
  </html>`)

})

// Scheduled job every 24-hours to clear stored conversation IDs
const job = schedule.scheduleJob('15 0,4,8,12,16,20 * * *', function(){

  verifiedConvoIds = []
  console.log("Verified Conversation IDs Cleared")

  reportedConvoIds = []
  console.log("Reported Conversation IDs Cleared")
  
});
