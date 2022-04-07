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
- [ ] Replace the following placeholders (you can command/control + F for these):
  - [ ] `<Access Key>`
  - [ ] `<Secret Access Key>`
  - [ ] `<AWS Region>`
  - [ ] `<FROM NAME>`
  - [ ] `<FROM EMAIL>`
  - [ ] `<Company Name>`
  - [ ] `<Drift OAuth Access Token>`
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
