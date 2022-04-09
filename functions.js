function tokens(value, tokenValues) {

    var finalValue = String(value);

    tokenValues.forEach(token => {
        finalValue = finalValue.replaceAll(token.placeholder, token.value)
    })
    
    return finalValue;

}

function build(emailName, globalConfig, emailDetails) {

    var Tokens = [
        {
            "placeholder": "[EMAIL]",
            "value": emailDetails.email
        },
        {
            "placeholder": "[CONVOID]",
            "value": emailDetails.convoId
        },
        {
            "placeholder": "[CONFIRMLINK]",
            "value": emailDetails.confirmLink
        },
        {
            "placeholder": "[REPORTLINK]",
            "value": emailDetails.reportLink
        },
        {
            "placeholder": "[CODE]",
            "value": emailDetails.code
        },
        {
            "placeholder": "[RETURNURL]",
            "value": emailDetails.returnUrl
        }
    ]

    if(emailName === "verifyWithLandingPage") {
        return { 
            subject: tokens(globalConfig.messaging.email.landingPage.subject, Tokens),
            body: tokens(`<!DOCTYPE html>
        <html lang="en" dir="ltr" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" style="color-scheme:light dark;supported-color-schemes:light dark;">
        <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width,initial-scale=1 user-scalable=yes">
        <meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no">
        <meta name="x-apple-disable-message-reformatting">
        <meta name="color-scheme" content="light dark">
        <meta name="supported-color-schemes" content="light dark">
        <title></title>
        <!--[if mso]> <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
        <![endif]-->
        <!--[if mso]>
        <style>table,tr,td,p,span,a{mso-line-height-rule:exactly !important;line-height:120% !important;mso-table-lspace:0 !important;mso-table-rspace:0 !important;}
        </style>
        <![endif]-->
        <style>a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important;font-size:inherit!important;font-family:inherit!important;font-weight:inherit!important;line-height:inherit!important;}u+#body a{color:inherit!important;text-decoration:none!important;font-size:inherit!important;font-family:inherit!important;font-weight:inherit!important;line-height:inherit!important;}#MessageViewBody a{color:inherit!important;text-decoration:none!important;font-size:inherit!important;
        font-family:inherit!important;font-weight:inherit!important;line-height:inherit!important;}:root{color-scheme:light dark;supported-color-schemes:light dark;}tr{vertical-align:middle;}p,a,li{color:#000000;font-size:16px;mso-line-height-rule:exactly;line-height:24px;font-family:Arial,sans-serif;}p:first-child{margin-top:0!important;}p:last-child{margin-bottom:0!important;}a{text-decoration:underline;font-weight:bold;color:#0000ff}@media only screen and (max-width:599px){.full-width-mobile{width:100%!important;height:auto!important;}.mobile-padding{padding-left:10px!important;padding-right:10px!important;}.mobile-stack{display:block!important;width:100%!important;}}@media (prefers-color-scheme:dark){body,div,table,tr,td{background-color:#000000!important;color:#ffffff!important;}.content{background-color:#222222!important;}p,li{color:#B3BDC4!important;}a{color:#84cfe2!important;}}
        </style>
        </head>
        <body class="body" style="background-color:#f4f4f4;"><div role="article" aria-roledescription="email" aria-label="Your Email" lang="en" dir="ltr" style="font-size:16px;font-size:1rem;font-size:max(16px,1rem);background-color:#f4f4f4;">
        <table align="center" role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;max-width:600px;width:100%;background-color:#f4f4f4;"><tr style="vertical-align:middle;" valign="middle"><td>
        <!--[if mso]>
        <table align="center" role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse:collapse;"><tr><td align="center">
        <!--<![endif]-->
        </td></tr><tr style="vertical-align:middle;" valign="middle"><td align="center" style="padding:30px 0;">
        <table align="center" role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse:collapse;max-width:600px;width:100%;background-color:#fffffe;"><tr style="vertical-align:middle;" valign="middle"><td align="center" style="padding:30px;" class="content">
        <table align="center" role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse:collapse;max-width:600px;width:100%;background-color:#fffffe;"><tr style="vertical-align:middle;" valign="middle"><td class="content"><p style="color:#000000;font-size:16px;mso-line-height-rule:exactly;line-height:24px;font-family:Arial,sans-serif;margin-top:0!important;">${globalConfig.messaging.email.landingPage.context}</p><p style="color:#000000;font-size:16px;mso-line-height-rule:exactly;line-height:24px;font-family:Arial,sans-serif;">${globalConfig.messaging.email.landingPage.explainer}</p><p style="color:#000000;font-size:16px;mso-line-height-rule:exactly;line-height:24px;font-family:Arial,sans-serif;"><a href="${emailDetails.confirmLink}" style="font-size:16px;mso-line-height-rule:exactly;line-height:24px;font-family:Arial,sans-serif;text-decoration:underline;font-weight:bold;color:#0000ff;">${globalConfig.messaging.email.landingPage.confirmButton}</a></p><p style="color:#000000;font-size:16px;mso-line-height-rule:exactly;line-height:24px;font-family:Arial,sans-serif;"><a href="${emailDetails.reportLink}" style="font-size:16px;mso-line-height-rule:exactly;line-height:24px;font-family:Arial,sans-serif;text-decoration:underline;font-weight:bold;color:lightgrey;">${globalConfig.messaging.email.landingPage.reportButton}</a></p><p style="color:#000000;font-size:16px;mso-line-height-rule:exactly;line-height:24px;font-family:Arial,sans-serif;margin-bottom:0!important;">&mdash; ${globalConfig.messaging.company.companyName}</p>
        </td></tr></table>
        </td></tr></table>
        </td></tr>
        <!--[if mso]>
        </td></tr></table>
        <!--<![endif]--></table></div>
        </body>
        </html>`,Tokens)}
    } else if (emailName === "verifyWithCode"){
        if(emailDetails.hasReturnUrl){

            return {
                subject: tokens(globalConfig.messaging.email.code.subject, Tokens),
                body: tokens(`<!DOCTYPE html>
            <html lang="en" dir="ltr" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" style="color-scheme:light dark;supported-color-schemes:light dark;">
            <head>
            <meta charset="utf-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width,initial-scale=1 user-scalable=yes">
            <meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no">
            <meta name="x-apple-disable-message-reformatting">
            <meta name="color-scheme" content="light dark">
            <meta name="supported-color-schemes" content="light dark">
            <title></title>
            <!--[if mso]> <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
            <![endif]-->
            <!--[if mso]>
            <style>table,tr,td,p,span,a{mso-line-height-rule:exactly !important;line-height:120% !important;mso-table-lspace:0 !important;mso-table-rspace:0 !important;}
            </style>
            <![endif]-->
            <style>a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important;font-size:inherit!important;font-family:inherit!important;font-weight:inherit!important;line-height:inherit!important;}u+#body a{color:inherit!important;text-decoration:none!important;font-size:inherit!important;font-family:inherit!important;font-weight:inherit!important;line-height:inherit!important;}#MessageViewBody a{color:inherit!important;text-decoration:none!important;font-size:inherit!important;
            font-family:inherit!important;font-weight:inherit!important;line-height:inherit!important;}:root{color-scheme:light dark;supported-color-schemes:light dark;}tr{vertical-align:middle;}p,a,li{color:#000000;font-size:16px;mso-line-height-rule:exactly;line-height:24px;font-family:Arial,sans-serif;}p:first-child{margin-top:0!important;}p:last-child{margin-bottom:0!important;}a{text-decoration:underline;font-weight:bold;color:#0000ff}@media only screen and (max-width:599px){.full-width-mobile{width:100%!important;height:auto!important;}.mobile-padding{padding-left:10px!important;padding-right:10px!important;}.mobile-stack{display:block!important;width:100%!important;}}@media (prefers-color-scheme:dark){body,div,table,tr,td{background-color:#000000!important;color:#ffffff!important;}.content{background-color:#222222!important;}p,li{color:#B3BDC4!important;}a{color:#84cfe2!important;}}
            </style>
            </head>
            <body class="body" style="background-color:#f4f4f4;"><div role="article" aria-roledescription="email" aria-label="Your Email" lang="en" dir="ltr" style="font-size:16px;font-size:1rem;font-size:max(16px,1rem);background-color:#f4f4f4;">
            <table align="center" role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;max-width:600px;width:100%;background-color:#f4f4f4;"><tr style="vertical-align:middle;" valign="middle"><td>
            <!--[if mso]>
            <table align="center" role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse:collapse;"><tr><td align="center">
            <!--<![endif]-->
            </td></tr><tr style="vertical-align:middle;" valign="middle"><td align="center" style="padding:30px 0;">
            <table align="center" role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse:collapse;max-width:600px;width:100%;background-color:#fffffe;"><tr style="vertical-align:middle;" valign="middle"><td align="center" style="padding:30px;" class="content">
            <table align="center" role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse:collapse;max-width:600px;width:100%;background-color:#fffffe;"><tr style="vertical-align:middle;" valign="middle"><td class="content"><p style="color:#000000;font-size:16px;mso-line-height-rule:exactly;line-height:24px;font-family:Arial,sans-serif;margin-top:0!important;">${globalConfig.messaging.email.code.context}</p><p style="color:#000000;font-size:24px;mso-line-height-rule:exactly;line-height:32px;font-family:Arial,sans-serif;font-weight:bold;">${globalConfig.messaging.email.code.code.replace("[CODE]", emailDetails.code)}</p><p style="color:#000000;font-size:16px;mso-line-height-rule:exactly;line-height:24px;font-family:Arial,sans-serif;"><a href="${emailDetails.returnUrl}" style="font-size:16px;mso-line-height-rule:exactly;line-height:24px;font-family:Arial,sans-serif;text-decoration:underline;font-weight:bold;color:#0000ff;">${globalConfig.messaging.email.code.returnToChat}</a></p><p style="color:#000000;font-size:16px;mso-line-height-rule:exactly;line-height:24px;font-family:Arial,sans-serif;margin-bottom:0!important;">&mdash; <a href="${globalConfig.messaging.company.websiteUrl}" style="font-size:16px;mso-line-height-rule:exactly;line-height:24px;font-family:Arial,sans-serif;text-decoration:underline;font-weight:bold;color:#0000ff;">${globalConfig.messaging.company.companyName}</a></p>
            </td></tr></table>
            </td></tr></table>
            </td></tr>
            <!--[if mso]>
            </td></tr></table>
            <!--<![endif]--></table></div>
            </body>
            </html>`, Tokens)}

        } else {

            return {
                subject: `${globalConfig.messaging.email.code.subject.replace("[CODE]", emailDetails.code)}`,
                body: `<!DOCTYPE html>
            <html lang="en" dir="ltr" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" style="color-scheme:light dark;supported-color-schemes:light dark;">
            <head>
            <meta charset="utf-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width,initial-scale=1 user-scalable=yes">
            <meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no">
            <meta name="x-apple-disable-message-reformatting">
            <meta name="color-scheme" content="light dark">
            <meta name="supported-color-schemes" content="light dark">
            <title></title>
            <!--[if mso]> <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
            <![endif]-->
            <!--[if mso]>
            <style>table,tr,td,p,span,a{mso-line-height-rule:exactly !important;line-height:120% !important;mso-table-lspace:0 !important;mso-table-rspace:0 !important;}
            </style>
            <![endif]-->
            <style>a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important;font-size:inherit!important;font-family:inherit!important;font-weight:inherit!important;line-height:inherit!important;}u+#body a{color:inherit!important;text-decoration:none!important;font-size:inherit!important;font-family:inherit!important;font-weight:inherit!important;line-height:inherit!important;}#MessageViewBody a{color:inherit!important;text-decoration:none!important;font-size:inherit!important;
            font-family:inherit!important;font-weight:inherit!important;line-height:inherit!important;}:root{color-scheme:light dark;supported-color-schemes:light dark;}tr{vertical-align:middle;}p,a,li{color:#000000;font-size:16px;mso-line-height-rule:exactly;line-height:24px;font-family:Arial,sans-serif;}p:first-child{margin-top:0!important;}p:last-child{margin-bottom:0!important;}a{text-decoration:underline;font-weight:bold;color:#0000ff}@media only screen and (max-width:599px){.full-width-mobile{width:100%!important;height:auto!important;}.mobile-padding{padding-left:10px!important;padding-right:10px!important;}.mobile-stack{display:block!important;width:100%!important;}}@media (prefers-color-scheme:dark){body,div,table,tr,td{background-color:#000000!important;color:#ffffff!important;}.content{background-color:#222222!important;}p,li{color:#B3BDC4!important;}a{color:#84cfe2!important;}}
            </style>
            </head>
            <body class="body" style="background-color:#f4f4f4;"><div role="article" aria-roledescription="email" aria-label="Your Email" lang="en" dir="ltr" style="font-size:16px;font-size:1rem;font-size:max(16px,1rem);background-color:#f4f4f4;">
            <table align="center" role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;max-width:600px;width:100%;background-color:#f4f4f4;"><tr style="vertical-align:middle;" valign="middle"><td>
            <!--[if mso]>
            <table align="center" role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse:collapse;"><tr><td align="center">
            <!--<![endif]-->
            </td></tr><tr style="vertical-align:middle;" valign="middle"><td align="center" style="padding:30px 0;">
            <table align="center" role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse:collapse;max-width:600px;width:100%;background-color:#fffffe;"><tr style="vertical-align:middle;" valign="middle"><td align="center" style="padding:30px;" class="content">
            <table align="center" role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse:collapse;max-width:600px;width:100%;background-color:#fffffe;"><tr style="vertical-align:middle;" valign="middle"><td class="content"><p style="color:#000000;font-size:16px;mso-line-height-rule:exactly;line-height:24px;font-family:Arial,sans-serif;margin-top:0!important;">${globalConfig.messaging.email.code.context}</p><p style="color:#000000;font-size:24px;mso-line-height-rule:exactly;line-height:32px;font-family:Arial,sans-serif;font-weight:bold;">${globalConfig.messaging.email.code.code.replace("[CODE]", emailDetails.code)}</p><p style="color:#000000;font-size:16px;mso-line-height-rule:exactly;line-height:24px;font-family:Arial,sans-serif;margin-bottom:0!important;">&mdash; <a href="${globalConfig.messaging.company.websiteUrl}" style="font-size:16px;mso-line-height-rule:exactly;line-height:24px;font-family:Arial,sans-serif;text-decoration:underline;font-weight:bold;color:#0000ff;">${globalConfig.messaging.company.companyName}</a></p>
            </td></tr></table>
            </td></tr></table>
            </td></tr>
            <!--[if mso]>
            </td></tr></table>
            <!--<![endif]--></table></div>
            </body>
            </html>`}

        }
    }

}

module.exports = { build, tokens }
