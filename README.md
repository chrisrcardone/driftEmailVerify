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
        "body":"/verify"
    }
}
```

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

# Customizations

## Messaging Customizations

*The message customizations outlined above are changable within `globalConfig.messaging`.*

| Token | Description |
| ----------- | ----------- |
| `[EMAIL]` | The email of the visitor chatting via Drift |
| `[CODE]` | The verification code sent to the visitors email |
| `[SLASHCOMMAND]` | The slash command that this Nodejs Server is listening for to run this command, this is set under `globalConfig.command.slashCommand` |

| Variable      | Description | Available Tokens |
| ----------- | ----------- | ----------- |
| `returnToConversationLink`      | This is the **hyperlink text** that appears within the email which will link them back to the page they began their conversation on and will launch open the Drift Widget with the conversation ready.       | None |
| `verificationCodePreText`   | This is the messaging within the `<h1>` tag at the beginning of the verification email. (See below for an email outline)       | `[CODE]` |
| `emailCta` | This is the messaging within the `<p>` tag that directly follows the `<h1>` with the verification code. (See below for an email outline) | None |
| `autoReplyInChat` | This is the auto message sent **from the bot** to the visitor chatting with the agent to confirm the email has been sent. | `[EMAIL]` |
| `emailSignature` | This is the last `<p>` tag of the verification email. | None |
| `noEmailAgentFacingError` | This is the error message sent to the agent in the chat as a private note (not visible to visitor) informing them no email could be sent as none was collected | `[SLASHCOMMAND]` |
| `agentFacingVerificationMessage` | This is the private message (not visbile to visitor) sent to the agent in the conversation view providing them the verification code so they may compare with the one the visitor will send back. | `[CODE]`, `[EMAIL]`, `[SLASHCOMMAND]` |

## Email Example

Subject: *controlled by `globalConfig.messaging.emailSubject`*

# Your verification code is [CODE]. (this is controlled by `verificationCodePreText`)

Please send this code to the support agent helping you to verify you own this email. (this is controlled by `emailCta`)

Click here to jump right back into your conversation with our team. (this is controlled by `returnToConversationLink`)

Best, Company Name (this is controlled by `emailSignature`)
