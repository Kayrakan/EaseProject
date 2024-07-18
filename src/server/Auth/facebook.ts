import { FacebookPlatformSettings, FbOAuthInformation, getPlatformSettings, savePlatformSettings, FbAccountSettings } from "../Properties/facebook/facebookProperties.ts";

interface OAuthRequest {
    parameter: {
        state: string;
        code?: string;
        error?: string;
    };
}
var ui = SpreadsheetApp.getUi();

export function getOAuthServiceFacebook() {
    return OAuth2.createService('Facebook')
        .setAuthorizationBaseUrl('https://www.facebook.com/dialog/oauth')
        .setTokenUrl('https://graph.facebook.com/oauth/access_token')
        .setClientId('462039139878744')
        .setClientSecret('c1cb0a7c0a1b2657121ff0000bb01287')
        .setCallbackFunction('authCallbackFacebook')
        .setPropertyStore(PropertiesService.getUserProperties())
        .setScope('public_profile,email')
        .setParam('config_id', '1499404937332395')
        .setParam('access_type', 'offline')
        .setParam('approval_prompt', 'force')
        .setRedirectUri('https://script.google.com/macros/d/1OLxMlcmo3aRmXjnhffrBOsYJxRmYujGPHXRfF31DmxdMkTJ3kx6G1YDq/usercallback');
}

export function authCallbackFacebook(request: OAuthRequest): GoogleAppsScript.HTML.HtmlOutput {
    const service = getOAuthServiceFacebook();
    const isAuthorized = service.handleCallback(request);

    if (isAuthorized) {
        const userInfo = fetchFacebookUserInfo(service.getAccessToken());
        if (userInfo) {
            addFacebookPlatform();
            saveUserOAuthInformation(userInfo, service); // Save OAuth information and user info
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

export function saveUserOAuthInformation(userInfo: any, service: GoogleAppsScript.OAuth2.OAuth2Service) {
    const oauthInformation: FbOAuthInformation = {
        accessToken: service.getAccessToken(),
        refreshToken: service.getRefreshToken ? service.getRefreshToken() : undefined,
        expiresIn: Date.now() + 3600 * 1000,  // Assuming 1 hour validity, you may adjust based on actual expiration time received
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
    } else {
        // If the user account exists, update the oauthInformation
        platformSettings.accounts[userAccountIndex].oauthInformation = oauthInformation;
    }

    savePlatformSettings(platformSettings);
}

export function getUserOAuthInformation(identifier: string): FbOAuthInformation | null {
    const platformSettings = getPlatformSettings();
    const userAccount = platformSettings.accounts.find(account => account.uniqueId === identifier || account.email === identifier);
    if (userAccount && userAccount.oauthInformation.expiresIn && userAccount.oauthInformation.expiresIn < Date.now()) {
        // Token has expired
        ui.alert('token expired');
        return null;
    }
    return userAccount ? userAccount.oauthInformation : null;
}


export function resetFacebookOAuth(userId: string) {
    ui.alert('getting service to reset')
    const service = getOAuthServiceFacebook();
    service.reset();
    ui.alert('service is reset, getting platform settings')

    let platformSettings: FacebookPlatformSettings = getPlatformSettings();
    ui.alert('platform settings ' + JSON.stringify(platformSettings));

    platformSettings.accounts = platformSettings.accounts.filter(account => account.uniqueId !== userId);
    ui.alert('new platforms settings' + JSON.stringify(platformSettings));

    savePlatformSettings(platformSettings);
}

export function getConnectedFacebookAccounts(): FbAccountSettings[] {
    const platformSettings = getPlatformSettings();
    return platformSettings.accounts;
}


export function reauthenticateIfNeeded(userId: string): boolean {
    const oauthInfo = getUserOAuthInformation(userId);
    if (!oauthInfo || !oauthInfo.accessToken || !oauthInfo.expiresIn || oauthInfo.expiresIn < Date.now()) {
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
