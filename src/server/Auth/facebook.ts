
// export function getOAuthServiceFacebook(): GoogleAppsScript.OAuth2.OAuth2Service {
//     return OAuth2.createService('Facebook')
//         .setAuthorizationBaseUrl('https://www.facebook.com/dialog/oauth')
//         .setTokenUrl('https://graph.facebook.com/oauth/access_token')
//         .setClientId('1594536744456554')
//         .setClientSecret('aab0100b016a8db38a480b536c1ed647')
//         .setCallbackFunction('authCallbackFacebook')
//         .setPropertyStore(PropertiesService.getUserProperties())
//         .setScope('public_profile,email')
//         .setRedirectUri('https://script.google.com/macros/d/1OLxMlcmo3aRmXjnhffrBOsYJxRmYujGPHXRfF31DmxdMkTJ3kx6G1YDq/usercallback');
// }

export function getOAuthServiceFacebook() {
    return OAuth2.createService('Facebook')
        .setAuthorizationBaseUrl('https://www.facebook.com/dialog/oauth')
        .setTokenUrl('https://graph.facebook.com/oauth/access_token')
        .setClientId('1523023348248961')
        .setClientSecret('816a83bffc098be8398a174636f260db')
        .setCallbackFunction('authCallbackFacebook')
        .setPropertyStore(PropertiesService.getUserProperties())
        .setScope('public_profile,email')
        .setParam('config_id', '1196584401710095')
        .setParam('display', 'popup')
        .setRedirectUri('https://script.google.com/macros/d/1OLxMlcmo3aRmXjnhffrBOsYJxRmYujGPHXRfF31DmxdMkTJ3kx6G1YDq/usercallback');
}


export function authCallbackFacebook(request: object): GoogleAppsScript.HTML.HtmlOutput {
    const service = getOAuthServiceFacebook();
    const isAuthorized = service.handleCallback(request);
    if (isAuthorized) {
        return HtmlService.createHtmlOutput('Success! You can close this tab.');
    } else {
        return HtmlService.createHtmlOutput('Denied. You can close this tab');
    }
}

export function getFacebookOAuthURL(): string {
    const service = getOAuthServiceFacebook();
    if (!service.hasAccess()) {
        return service.getAuthorizationUrl();
    } else {
        return 'ALREADY_AUTHORIZED';
    }
}

export function resetFacebookOAuth() {
    const service = getOAuthServiceFacebook();
    service.reset();
}

