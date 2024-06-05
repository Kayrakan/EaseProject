
export function getOAuthServiceFacebook(): GoogleAppsScript.OAuth2.OAuth2Service {
    return OAuth2.createService('Facebook')
        .setAuthorizationBaseUrl('https://www.facebook.com/dialog/oauth')
        .setTokenUrl('https://graph.facebook.com/oauth/access_token')
        .setClientId('YOUR_FACEBOOK_APP_ID')
        .setClientSecret('YOUR_FACEBOOK_APP_SECRET')
        .setCallbackFunction('authCallbackFacebook')
        .setPropertyStore(PropertiesService.getUserProperties())
        .setScope('public_profile,email')
        .setRedirectUri('https://script.google.com/macros/d/YOUR_SCRIPT_ID/usercallback');
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
        return 'You are already authorized.';
    }
}
