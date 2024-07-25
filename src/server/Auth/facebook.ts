import { FacebookPlatformSettings, FbOAuthInformation, getPlatformSettings, savePlatformSettings, FbAccountSettings } from "../Properties/facebook/facebookProperties.ts";

interface OAuthRequest {
    parameter: {
        state: string;
        code?: string;
        error?: string;
    };
}
var ui = SpreadsheetApp.getUi();
const FACEBOOK_GRAPH_API_VERSION = "v20.0";
const FACEBOOK_APP_ID = "462039139878744";
const FACEBOOK_APP_SECRET = "c1cb0a7c0a1b2657121ff0000bb01287"
export function getOAuthServiceFacebook() {
    return OAuth2.createService('Facebook')
        .setAuthorizationBaseUrl('https://www.facebook.com/dialog/oauth')
        .setTokenUrl('https://graph.facebook.com/oauth/access_token')
        .setClientId('462039139878744')
        .setClientSecret('c1cb0a7c0a1b2657121ff0000bb01287')
        .setCallbackFunction('authCallbackFacebook')
        .setPropertyStore(PropertiesService.getUserProperties())
        .setScope('public_profile,email, ads_management,ads_read,read_insights')
        .setParam('config_id', '1499404937332395')
        .setParam('access_type', 'offline')
        .setParam('approval_prompt', 'force')
        .setRedirectUri('https://script.google.com/macros/d/1OLxMlcmo3aRmXjnhffrBOsYJxRmYujGPHXRfF31DmxdMkTJ3kx6G1YDq/usercallback');
}


function getLongLivedFacebookToken(shortLivedToken: string) {
    try {
        const longLivedOath = exchangeForLongLivedToken(shortLivedToken);
        return longLivedOath;
    } catch (error: unknown) {
        if (error instanceof Error) {
            ui.alert('couldnt get long lived token ' + error.message)
            throw new Error('Error exchanging token: ' + error.message);
        } else {
            ui.alert('couldnt get long lived token ' + String(error))

            throw new Error('Error exchanging token: ' + String(error));
        }
    }
}

function exchangeForLongLivedToken(shortLivedToken: string) {
    const url = `https://graph.facebook.com/${FACEBOOK_GRAPH_API_VERSION}/oauth/access_token?grant_type=fb_exchange_token&client_id=${FACEBOOK_APP_ID}&client_secret=${FACEBOOK_APP_SECRET}&fb_exchange_token=${shortLivedToken}`;
    const response = UrlFetchApp.fetch(url);
    const resultOauth = JSON.parse(response.getContentText());
    // ui.alert('result long token : ' + JSON.stringify(resultOauth));
    if (resultOauth.access_token) {
        return resultOauth;
    } else {
        throw new Error('Failed to exchange token: ' + resultOauth.error.message);
    }
}

export function authCallbackFacebook(request: OAuthRequest): GoogleAppsScript.HTML.HtmlOutput {
    const service = getOAuthServiceFacebook();
    const isAuthorized = service.handleCallback(request);

    if (isAuthorized) {
        const shortLivedToken = service.getAccessToken();
        // ui.alert('short lived token ' + shortLivedToken);
        const longLivedOath = getLongLivedFacebookToken(shortLivedToken);
        // ui.alert('long lived token ' + JSON.stringify(longLivedOath));

        const userInfo = fetchFacebookUserInfo(longLivedOath.access_token);
        if (userInfo) {
            addFacebookPlatform();
            saveUserOAuthInformation(userInfo, service, longLivedOath); // Save OAuth information and user info
            return HtmlService.createHtmlOutput('Success! You can close this tab.');
        } else {
            return HtmlService.createHtmlOutput('Failed to retrieve user information.');
        }
    } else {
        return HtmlService.createHtmlOutput('Denied. You can close this tab');
    }
}

export function addFacebookPlatform(): FacebookPlatformSettings | null {
    const userProperties = PropertiesService.getUserProperties();
    const facebookPlatformString = userProperties.getProperty('facebook');

    if (!facebookPlatformString) {
        const facebookPlatform: FacebookPlatformSettings = {
            id: 'facebook',
            name: 'Facebook',
            description: '',
            icon: 'facebookIcon',
            accounts: [] // Initialize with an empty accounts list
        };
        userProperties.setProperty('facebook', JSON.stringify(facebookPlatform));
        return facebookPlatform;
    }
    return null; // Platform already exists
}

export function updateFacebookPlatform(settings: Partial<FacebookPlatformSettings>, overwrite: boolean = false): FacebookPlatformSettings | null {
    const userProperties = PropertiesService.getUserProperties();
    const facebookPlatformString = userProperties.getProperty('facebook');

    if (facebookPlatformString) {
        let facebookPlatform: FacebookPlatformSettings = JSON.parse(facebookPlatformString);

        if (overwrite) {
            facebookPlatform = { ...facebookPlatform, ...settings };
        } else {
            facebookPlatform = {
                ...facebookPlatform,
                ...settings,
                accounts: settings.accounts ? settings.accounts : facebookPlatform.accounts
            };
        }

        userProperties.setProperty('facebook', JSON.stringify(facebookPlatform));
        return facebookPlatform;
    }
    return null; // Platform does not exist
}


export function getFacebookOAuthURL(): string {
    const service = getOAuthServiceFacebook();
    // if (!service.hasAccess()) {
    return service.getAuthorizationUrl();
    // } else {
    //     return 'ALREADY_AUTHORIZED';
    // }
}

function fetchFacebookUserInfo(accessToken: string) {
    const url = `https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`;
    const response = UrlFetchApp.fetch(url);
    if (response.getResponseCode() === 200) {
        return JSON.parse(response.getContentText());
    } else {
        console.error('Error fetching user info:', response.getContentText());
        return null;
    }
}

export function saveUserOAuthInformation(userInfo: any, service: GoogleAppsScript.OAuth2.OAuth2Service, longLivedOath: any) {
    const oauthInformation: FbOAuthInformation = {
        accessToken: longLivedOath.access_token,
        refreshToken: service.getRefreshToken ? service.getRefreshToken() : undefined,
        dateTaken: Date.now(),  // Assuming 1 hour validity, you may adjust based on actual expiration time received
        expiresIn: longLivedOath.expires_in
        // tokenType: service.getTokenType(),
    };

    let platformSettings: FacebookPlatformSettings = getPlatformSettings();
    let userAccountIndex = platformSettings.accounts.findIndex(account => account.email === userInfo.email);

    if (userAccountIndex === -1) {
        // If the user account does not exist, create a new one
        const newUserAccount: FbAccountSettings = {
            name: userInfo.name,
            email: userInfo.email,
            uniqueId: userInfo.id,
            date: new Date().toISOString(),
            oauthInformation: oauthInformation,
            customSettings: {},
            savedSettings: []
        };
        platformSettings.accounts.push(newUserAccount);
        // ui.alert('new oauth is created: ' + newUserAccount);
    } else {
        // If the user account exists, update the oauthInformation
        // ui.alert('old oauth' + JSON.stringify(platformSettings.accounts[userAccountIndex].oauthInformation));
        // ui.alert('long new oauth' + JSON.stringify(oauthInformation));
        platformSettings.accounts[userAccountIndex].oauthInformation = oauthInformation;
        // ui.alert('new oauth settings saved' + JSON.stringify(platformSettings.accounts[userAccountIndex].oauthInformation));

    }

    savePlatformSettings(platformSettings);
}

export function getUserOAuthInformation(identifier: string): FbOAuthInformation | null {
    const platformSettings = getPlatformSettings();
    const userAccount = platformSettings.accounts.find(account => account.uniqueId === identifier || account.email === identifier);

    if (!userAccount) {
        ui.alert('User account not found.');
        return null;
    }

    // ui.alert('oauth platform user Account :' + JSON.stringify(userAccount));

    // Ensure oauthInformation and its properties are defined
    if (!userAccount.oauthInformation || userAccount.oauthInformation.dateTaken === undefined || userAccount.oauthInformation.expiresIn === undefined) {
        ui.alert('OAuth information or required properties are missing.');
        return null;
    }

    const currentTime = Date.now(); // Current time in milliseconds
    const tokenAge = currentTime - userAccount.oauthInformation.dateTaken; // Token age in milliseconds

    const expiresInMilliseconds = userAccount.oauthInformation.expiresIn * 1000; // Convert expiresIn from seconds to milliseconds

    // ui.alert('Current time: ' + currentTime);
    // ui.alert('Token age: ' + tokenAge);
    // ui.alert('Expires in: ' + expiresInMilliseconds);

    // Check if token has expired
    if (tokenAge > expiresInMilliseconds) {
        ui.alert('Token has expired.');
        return null;
    }

    return userAccount.oauthInformation;
}



export function resetFacebookOAuth(userId: string) {
    // ui.alert('getting service to reset')
    const service = getOAuthServiceFacebook();
    service.reset();
    // ui.alert('service is reset, getting platform settings')

    let platformSettings: FacebookPlatformSettings = getPlatformSettings();
    // ui.alert('platform settings ' + JSON.stringify(platformSettings));

    platformSettings.accounts = platformSettings.accounts.filter(account => account.uniqueId !== userId);
    // ui.alert('new platforms settings' + JSON.stringify(platformSettings));

    savePlatformSettings(platformSettings);
}

export function getConnectedFacebookAccounts(): FbAccountSettings[] {
    const platformSettings = getPlatformSettings();
    return platformSettings.accounts;
}


export function reauthenticateIfNeeded(userId: string): boolean {
    const oauthInfo = getUserOAuthInformation(userId);
    if (!oauthInfo || !oauthInfo.accessToken ) {
        const url = getFacebookOAuthURL();
        // Trigger reauthentication flow
        ui.showModalDialog(HtmlService.createHtmlOutput(`
            <html>
            <head>
                <script>
                    function redirect() {
                        window.location.href = "${url}";
                    }
                    window.onload = redirect;
                </script>
            </head>
            <body>
                <p>Your session has expired. Please reauthenticate.</p>
            </body>
            </html>
        `).setWidth(400).setHeight(200), 'Reauthentication Required');
        return false;
    }
    return true;
}
