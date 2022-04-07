# Email Identity Verification for Drift

This is free to use code that provides a template for leveraging [Drift's Open Developer API](https://devdocs.drift.com/docs/quick-start) to verify a visitor's email address without the agent needing to leave the conversation or use another service in the process.

## [View Demo Video of This in Action](https://video.drift.com/v/abbRsIWZ5qO/)

### Prerequisites:

- Amazon Web Services Simple Email Sending

*You can use this with another email sender, however, you will have to adjust the code to leverage your email sender of choice.*

### Quick Start Guide:

- [ ] Download this code and open it in a code editor (e.g., [Visual Studio Code](https://code.visualstudio.com/))
- [ ] Locate/create a programmatic user in AWS for SES ([Guide](https://betterprogramming.pub/how-to-send-emails-with-node-js-using-amazon-ses-8ae38f6312e4#:~:text=Creating%20an%20AWS%20IAM%20user%20with%20SES%20permissions))
- [ ] Replace the following placeholders (you can command/control + F for these):
  - [ ] <Access Key>
  - [ ] <Secret Access Key>
  - [ ] <AWS Region>
  - [ ] <FROM NAME>
  - [ ] <FROM EMAIL>
  - [ ] <Company Name>
  - [ ] <Drift OAuth Access Token>
- [ ] Test & Deploy!
  
### How do I test?
