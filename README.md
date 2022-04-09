# Email Identity Verification for Drift

This is free to use code that provides a template for leveraging [Drift's Open Developer API](https://devdocs.drift.com/docs/quick-start) to verify a visitor's email address without the agent needing to leave the conversation or use another service in the process.

## [View Demo Video of This in Action](https://video.drift.com/v/abbRsIWZ5qO/)

### Prerequisite:

- Amazon Web Services Simple Email Sending

*You can use this with another email sender, however, you will have to adjust the code to leverage your email sender of choice.*

### Quick Start Guide:

- [ ] Download this code and open it in a code editor (e.g., [Visual Studio Code](https://code.visualstudio.com/))
- [ ] Locate/create a programmatic user in AWS for SES ([Guide](https://betterprogramming.pub/how-to-send-emails-with-node-js-using-amazon-ses-8ae38f6312e4#:~:text=Creating%20an%20AWS%20IAM%20user%20with%20SES%20permissions))
- [ ] Create a Drift Developer App ([Guide Guide](https://devdocs.drift.com/docs/quick-start)) and keep your OAuth Access Token handy
- [ ] Add the permissions `contact_read` and `conversation_write` to your Drift Developer App's scopes
- [ ] Fill out values in `globalConfig`
- [ ] Run `npm install` to download required modules
- [ ] Test, test, test
- [ ] Add your verification token from Drift to `globalConfig.drift.verificationToken` (to find this go to dev.drift.com > your app [click "Manage" button on hover] > App Credentials) 
- [ ] Deploy code then input the hosted URL for this new Webhook Endpoint (should look like: api.yourdomain.com/messages) into your [Drift Developer App under Webhooks](https://devdocs.drift.com/docs/webhook-events-1) and subscribe to the webhook event `new_command_message`
- [ ] Run a live test in Drift
- [ ] Enable your team in Drift to leverage `/verify` when they'd like to send a verification code to the visitor they're chatting with before executing their request
  
### How do I test?
#### Prerequisite:
- Downloaded the code files already
- Ran `npm install` to download required modules
- Replaced the placeholders with their respective values
- Have [Postman](https://www.postman.com/) installed
- Have added the permissions `contact_read` and `conversation_write` to your Drift Developer App
- Have `globalConfig.settings.testMode` set to true

To simulate what an agent using the shortcut `/verify` would look like and that it is functioning properly before deploying, you may follow these steps:

- [ ] Begin a conversation in Drift through your widget and input **your email address** (an email will be sent, don't use a conversation with a customer!), note down the conversation ID (you can find this at the end of the URL in your browser's URL bar: `https://app.drift.com/conversations/<Conversation ID>`)
- [ ] Open your terminal and change directory (cd) to the folder where you're storing these code files and run `node index.js`
- [ ] Open Postman and create a POST request for `localhost:8080/messages` (or, whichever port you're running the node server on, this will be called out in the terminal app once the server is running)
- [ ] Click the "Body" tab > Select "Raw" > Adjust content type to "JSON"
- [ ] Paste the request body template into the Body of your request, swap out the placeholder for your test conversation's `Conversation ID`, and click Send

```
{
    "data":{
        "conversationId":"<Conversation ID>",
        "body":"/verify",
        "author": {
          "type":"user"
        }
    }
}
```

# Global Config Guide

| Token      | Required | Description | Tokens Usable |
| ----- | --- | ----------- | ---- |
| `settings.useLandingPages` | **Yes** | If `true` your visitors will be sent to a landing page to click a button to complete verification. If `false` your visitors will be sent a verification code to send back in the chat. | n/a |
| `settings.oneClickConfirmationAndReport` | *If `settings.useLandingPages` is `true`, yes.* | If `true` the link sent to your visitors via email will complete verification in one-click. If `false` they will need to click the link and click a button on the landing page to complete verification (more secure choice). | n/a |
| `settings.protocol` | **Yes** | The protocol you're running your server on, this will also be the protocol the links sent to your visitors will be sent in. The value of this should either be `https://` or `http://`. | n/a |
| `settings.testMode` | No | If `true`, we will not require that the API calls contain a verification token in them. This should be `false` once you deploy the code. | n/a |
| `settings.landingPageVerificationSpamThreshold` | *If `settings.useLandingPages` is `true`, yes.* | The number of times a conversation can be verified before the verification process is haulted. Recommended value is `2` to prevent spamming your Drift API. | n/a |
| `settings.landingPageReportSpamThreshold` | *If `settings.useLandingPages` is `true`, yes.* | The number of times a conversation can be reported as "not me" before the reporting process is haulted. Recommended value is `2` to prevent spamming your Drift API. | n/a |
| `amazonSes.accessKeyId` | **Yes** | Your access key for Amazon SES, to get one [follow this guide](https://betterprogramming.pub/how-to-send-emails-with-node-js-using-amazon-ses-8ae38f6312e4#525e). | n/a |
| `amazonSes.secretAccessKey` | **Yes** | Your secret access key for Amazon SES, to get one [follow this guide](https://betterprogramming.pub/how-to-send-emails-with-node-js-using-amazon-ses-8ae38f6312e4#525e). | n/a |
| `amazonSes.region` | **Yes** | Your region for Amazon SES, to find yours [follow this guide](https://betterprogramming.pub/how-to-send-emails-with-node-js-using-amazon-ses-8ae38f6312e4#525e). | n/a |
| `emailSender.fromName` | **Yes** | The name emails sent to your visitors are sent from. | n/a |
| `emailSender.fromEmail` | **Yes** | The email your emails sent to visitors are sent from. | n/a |
| `drift.oAuthAccessToken` | **Yes** | Your oAuth Access Token for Drift, you'll need to have created a developer app to have one. [Follow this guide if you need to do that](https://devdocs.drift.com/docs/quick-start). | n/a |
| `drift.verificationToken` | **Yes** | Your verification token for your Drift Developer App, this ensures API calls are truly coming from Drift. To find this go to dev.drift.com > your app [click "Manage" button on hover] > App Credentials | n/a |
| `messaging.company.companyName` | **Yes** | This will appear in all emails and landing pages. | n/a |
| `messaging.company.websiteUrl` | **Yes** | This will be the URL that your company name hyperlinks to in email signatures. | n/a |
| `messaging.email.landingPage.subject` | *If `settings.useLandingPages` is `true`, yes.* | The subject line of your verification emails sent to visitors when you have the Landing Pages setting set to `true` | `[EMAIL]`, `[SLASHCOMMAND]`, `[CONVOID]` |
| `messaging.email.landingPage.context` | *If `settings.useLandingPages` is `true`, yes.* | A context message that explains why they are receiving this. This is the first line of the email. | `[EMAIL]`, `[SLASHCOMMAND]`, `[CONVOID]` |
| `messaging.email.landingPage.confirmButton` | *If `settings.useLandingPages` is `true`, yes.* | Text used for the Confirm button in the email. | `[EMAIL]`, `[SLASHCOMMAND]`, `[CONVOID]` |
| `messaging.email.landingPage.reportButton` | *If `settings.useLandingPages` is `true`, yes.* | Text used for the report not me button in the email. | `[EMAIL]`, `[SLASHCOMMAND]`, `[CONVOID]` |
| `messaging.email.code.subject` | *If `settings.useLandingPages` is `false`, yes.* | The subject line of your verification emails sent to visitors when you have the Landing Pages setting set to `false` | `[CODE]`, `[EMAIL]`, `[SLASHCOMMAND]`, `[CONVOID]` |
| `messaging.email.code.context` | *If `settings.useLandingPages` is `false`, yes.* | A context message that explains why they are receiving this. This is the first line of the email. | `[CODE]`, `[EMAIL]`, `[SLASHCOMMAND]`, `[CONVOID]` |
| `messaging.email.code.code` | *If `settings.useLandingPages` is `false`, yes.* | The second line of the email that provides the visitor the code they need to send back to the agent they're chatting with. | `[CODE]`, `[EMAIL]`, `[SLASHCOMMAND]`, `[CONVOID]` |
| `messaging.email.code.returnToChat` | *If `settings.useLandingPages` is `false`, yes.* | The text used for the hyperlink to return to the conversation. This will only show in the email if we're able to find a href associated with a visitor message in the first 50 messages of the conversation. | `[CODE]`, `[EMAIL]`, `[SLASHCOMMAND]`, `[CONVOID]` |
| `drift.landingPage.external.chatAutoReply` | *If `settings.useLandingPages` is `true`, yes.* | The auto message sent to the visitor from the bot confirming that they have been sent the link to click. | `[EMAIL]`, `[SLASHCOMMAND]`, `[CONVOID]` |
| `drift.landingPage.external.thankYou` | *If `settings.useLandingPages` is `true`, yes.* | The auto message sent to the visitor from the bot confirming they have successfully verified themselves. | `[EMAIL]`, `[SLASHCOMMAND]`, `[CONVOID]` |
| `drift.landingPage.internal.noEmailError` | *If `settings.useLandingPages` is `true`, yes.* | [Not Visible to Visitor] Message sent to agent informing them that verification cannot occur as there isn't an email saved for the visitor. | `[SLASHCOMMAND]`, `[CONVOID]` |
| `drift.landingPage.internal.verificationMessage` | *If `settings.useLandingPages` is `true`, yes.* | [Not Visible to Visitor] Message sent to agent informing the verification email has been sent. | `[EMAIL]`, `[SLASHCOMMAND]`, `[CONVOID]` |
| `drift.landingPage.internal.verified` | *If `settings.useLandingPages` is `true`, yes.* | [Not Visible to Visitor] Message sent to agent informing the verification has been completed successfully. | `[EMAIL]`, `[SLASHCOMMAND]`, `[CONVOID]` |
| `drift.landingPage.internal.reported` | *If `settings.useLandingPages` is `true`, yes.* | [Not Visible to Visitor] Message sent to agent informing them that the "Report Not Me" button has been selected by the individual who opened the verification email. Nothing is sent to the visitor. | `[EMAIL]`, `[SLASHCOMMAND]`, `[CONVOID]` |
| `drift.landingPage.external.chatAutoReply` | *If `settings.useLandingPages` is `false`, yes.* | The auto message sent to the visitor from the bot confirming that they have been sent verification code and must provide it to continue. | `[EMAIL]`, `[SLASHCOMMAND]`, `[CONVOID]` |
| `drift.code.internal.noEmailError` | *If `settings.useLandingPages` is `false`, yes.* | [Not Visible to Visitor] Message sent to agent informing them that verification cannot occur as there isn't an email saved for the visitor. | `[SLASHCOMMAND]`, `[CONVOID]` |
| `drift.code.internal.verificationMessage` | *If `settings.useLandingPages` is `false`, yes.* | [Not Visible to Visitor] Message sent to agent informing the verification email has been sent and providing them the verification code so they may verify the code the visitor sends back. | `[CODE]`, `[EMAIL]`, `[SLASHCOMMAND]`, `[CONVOID]` |
| `command.slashCommand` | **Yes** | The `/` command we'll listen for from Drift ([learn more](https://gethelp.drift.com/s/article/What-Slash-Commands-are-Available-in-Drift)) | n/a |
| `landingPage.allPages.companyName` | *If `settings.useLandingPages` is `true`, yes.* | The company name used in the header and page title for all landing pages. | n/a |
| `landingPage.allPages.faviconUrl` | No | The favicon used for all landing pages. | n/a |
| `landingPage.confirmationPage.pageTitle` | *If `settings.useLandingPages` is `true` and `settings.oneClickConfirmationAndReport` is `false`, yes.* | The page title of the page visitors are sent to when they click the verification email's link when one-click is not enabled. | n/a |
| `landingPage.confirmationPage.headerMessage` | *If `settings.useLandingPages` is `true` and `settings.oneClickConfirmationAndReport` is `false`, yes.* | The header message on the page visitors are sent to when they click the verification email's link when one-click is not enabled. | n/a |
| `landingPage.confirmationPage.bodyMessage` | *If `settings.useLandingPages` is `true` and `settings.oneClickConfirmationAndReport` is `false`, yes.* | The body message on the page visitors are sent to when they click the verification email's link when one-click is not enabled. | n/a |
| `landingPage.confirmationPage.confirmButton` | *If `settings.useLandingPages` is `true` and `settings.oneClickConfirmationAndReport` is `false`, yes.* | The text in the confirmation button on the verification confirmation page. | n/a |
| `landingPage.confirmationPage.notMeLink` | *If `settings.useLandingPages` is `true` and `settings.oneClickConfirmationAndReport` is `false`, yes.* | The text in the report not me link on the verification confirmation page. | n/a |
| `landingPage.successPage.pageTitle` | *If `settings.useLandingPages` is `true`, yes.* | Title of the verification success page that visitors without a redirect/return URL will see. | n/a |
| `landingPage.successPage.withReturnUrl.headerMessage` | No | (Deprecated) This value is no longer in use. | n/a |
| `landingPage.successPage.withReturnUrl.bodyMessage` | No | (Deprecated) This value is no longer in use. | `[redirectUrl]` |
| `landingPage.successPage.withoutReturnUrl.headerMessage` | *If `settings.useLandingPages` is `true`, yes.* | The header message that visitors without Return URLs will see. This page should inform them to close the tab and return to where they were chatting. | n/a |
| `landingPage.successPage.withoutReturnUrl.bodyMessage` | *If `settings.useLandingPages` is `true`, yes.* | The body message that visitors without Return URLs will see. This page should inform them to close the tab and return to where they were chatting. | n/a |
| `landingPage.successPage.alreadyVerified.pageTitle` | *If `settings.useLandingPages` is `true`, yes.* | The page title that is used when a visitor is attempting to verify themselves for the 3rd time within a 4 hour time period. This page informs them their verification cannot be processed. | n/a |
| `landingPage.successPage.alreadyVerified.headerMessage` | *If `settings.useLandingPages` is `true`, yes.* | The header message that is used when a visitor is attempting to verify themselves for the 3rd time within a 4 hour time period. This page informs them their verification cannot be processed. | n/a |
| `landingPage.successPage.alreadyVerified.pageTitle` | *If `settings.useLandingPages` is `true`, yes.* | The body message that is used when a visitor is attempting to verify themselves for the 3rd time within a 4 hour time period. This page informs them their verification cannot be processed. | n/a |
| `landingPage.notMePage.pageTitle` | *If `settings.useLandingPages` is `true`, yes.* | The page title of the page a visitor will land on when they've opted to report that it is not them who is chatting. | n/a |
| `landingPage.notMePage.headerMessage` | *If `settings.useLandingPages` is `true`, yes.* | The header message on the page a visitor will land on when they've opted to report that it is not them who is chatting. | n/a |
| `landingPage.notMePage.bodyMessage` | *If `settings.useLandingPages` is `true`, yes.* | The body message on the page a visitor will land on when they've opted to report that it is not them who is chatting. | `[websiteUrl]` |
| `landingPage.notMePage.alreadyReported.pageTitle` | *If `settings.useLandingPages` is `true`, yes.* | The page title that is used when a visitor is attempting to report a conversation's verification request as not them for the 3rd time within a 4 hour time period. This page informs them their report cannot be processed. | n/a |
| `landingPage.notMePage.alreadyReported.headerMessage` | *If `settings.useLandingPages` is `true`, yes.* | The header message that is used when a visitor is attempting to report a conversation's verification request as not them for the 3rd time within a 4 hour time period. This page informs them their report cannot be processed. | n/a |
| `landingPage.notMePage.alreadyReported.bodyMessage` | *If `settings.useLandingPages` is `true`, yes.* | The body message that is used when a visitor is attempting to report a conversation's verification request as not them for the 3rd time within a 4 hour time period. This page informs them their report cannot be processed. | n/a |

### Tokens:
- `[EMAIL]`: the visitors email address
- `[CODE]`: the verification code generated and sent to visitor (if `globalConfig.setting.useLandingPages` is `false`)
- `[SLASHCOMMAND]`: the slash command you set in `globalConfig.command.slashcommand`
- `[CONVOID]`: the conversation ID
- `[websiteUrl]`: the website URL you set in `globalConfig.messaging.company.websiteUrl`
- `[redirectUrl]`: (Deprecated - visitors are now auto redirected) the URL for the visitor to return to in order to continue chatting


## What next?

To help your reps move faster, enable them with saved replies that they send when asking if sending a verification code would be okay, you can do this with [Saved Replied in Drift](https://gethelp.drift.com/s/article/How-to-Create-and-Manage-Saved-Replies). Here are some examples:

> To protect you and other customers, we'll need to verify your identity before moving forward. We do this by sending a verification code to your email. Would you like me to send the verification code?

> I'll need to verify your identity before moving forward. Would it be okay if I send a verification code to your email?


## FAQs
| Question      | Answer |
| ----------- | ----------- |
| Can email verification be done through a playbook?      | No, API calls cannot occur during a playbook, it will hault the playbook flow. This must be triggered by a user.       |
| What should we do if someone chats in after hours?   | This is meant for real-time verification. During after hours, you should use the [ticket creation skill](https://gethelp.drift.com/s/article/Bot-Skill-Article-Lookup-and-Ticket-Creation) and communicate with them via email.        |
| How do I control what email the verification code is sent to? | We'll send the code to the email of the visitor, you can check and change this [in the sidebar](https://gethelp.drift.com/s/article/Conversation-View) manaually should your agents need to. |
| Why should I host this myself? | Currently, there isn't a version of this in the app directory. Nevertheless, by self-hosting you mitigate the need to provide access to your Drift Account to any 3rd party providers. |

## Content Examples

### Landing Page: Conversation reported over spam threshold set in `globalConfig.settings.landingPageReportSpamThreshold`
<img width="1359" alt="Screen Shot 2022-04-08 at 11 40 24 PM" src="https://user-images.githubusercontent.com/35717678/162554999-c3b0f88e-fa17-475c-add4-56ef5f020612.png">

### Landing Page: Conversation verified over spam threshold set in `globalConfig.settings.landingPageVerificationSpamThreshold`
<img width="1362" alt="Screen Shot 2022-04-08 at 11 31 06 PM" src="https://user-images.githubusercontent.com/35717678/162555002-19044c1c-c8d4-4bb7-85d1-a9c4cf5b428e.png">

### Landing Page: Successful "Not Me" Report (notMePage)
<img width="1361" alt="Screen Shot 2022-04-08 at 11 30 24 PM" src="https://user-images.githubusercontent.com/35717678/162555003-9ed547b2-b7fc-45b8-99a9-bdb41559f00c.png">

### Landing Page: Confirmation Page (email links to this when `globalConfig.settings.oneClickConfirmationAndReport` is `false`)
<img width="1359" alt="Screen Shot 2022-04-08 at 11 30 12 PM" src="https://user-images.githubusercontent.com/35717678/162555004-f7d27a03-88cc-4b81-8048-69f6ba8293c6.png">

### Email: Verification via Code Email (sends when `globalConfig.settings.useLandingPages` is `false`)
<img width="644" alt="Screen Shot 2022-04-08 at 11 29 49 PM" src="https://user-images.githubusercontent.com/35717678/162555005-8f6284ca-59b8-4077-8da9-b04666b8eeac.png">

### Email: Verification via Landing Page Email (sends when `globalConfig.settings.useLandingPages` is `true`)
<img width="643" alt="Screen Shot 2022-04-08 at 11 28 22 PM" src="https://user-images.githubusercontent.com/35717678/162555006-1844b480-a4a0-4847-b4c4-a6c2d49bb18d.png">
