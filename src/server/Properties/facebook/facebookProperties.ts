

export interface FacebookPlatformSettings {
    id: string;
    name: string;
    description: string;
    icon: string;
    accounts: FbAccountSettings[]; // List of accounts for this platform
}

export interface FbOAuthInformation {
    accessToken: string;
    refreshToken?: string;
    expiresIn?: number;
    tokenType?: string;
}

export interface FbAccountSettings {
    name: string,
    email: string,
    uniqueId: string;
    date: string;
    oauthInformation: FbOAuthInformation; // OAuth information object
    customSettings?: { [key: string]: any }; // Any custom settings specific to the account
    savedSettings: FbUserSavedSettings[]; // List of saved settings for this account
}

interface SelectOption {
    value: string;
    label: string;
}

export interface FbUserSavedSettings {
    id: string;
    name: string;
    description: string;
    selectedAccount: SelectOption | null;
    selectedProperty: SelectOption | null;
    selectedDimensions: SelectOption[];
    selectedMetrics: SelectOption[];
    startDate: string;
    endDate: string;
    datePreset: string;
    sheetName: string;
}



var ui = SpreadsheetApp.getUi();

export function getPlatformSettings(): FacebookPlatformSettings {
    const settings = PropertiesService.getScriptProperties().getProperty('facebook');
    return settings ? JSON.parse(settings) : { id: '', name: '', description: '', icon: '', accounts: [] };
}


export function savePlatformSettings(settings: FacebookPlatformSettings) {
    try {
        ui.alert('Saving new platform settings: ' + JSON.stringify(settings));

        PropertiesService.getScriptProperties().setProperty('facebook', JSON.stringify(settings));

        ui.alert('Platform settings saved successfully.');
    } catch (error) {
        const errorMessage = (error instanceof Error) ? error.message : 'An unknown error occurred';
        ui.alert('Error saving platform settings: ' + errorMessage);
        console.error('Error saving platform settings:', error);
    }
}



// function getStoredOAuthInformation(userId: string) {
//     const storedInfo = PropertiesService.getUserProperties().getProperty('oauthInfo_' + userId);
//     return storedInfo ? JSON.parse(storedInfo) : null;
// }
//
// function makeAuthorizedRequest(userId: string, url: string) {
//     const oauthInfo = getStoredOAuthInformation(userId);
//     if (oauthInfo) {
//         const service = getOAuthServiceFacebook(userId);
//         setOAuthInfoToService(service, oauthInfo);
//         const response = UrlFetchApp.fetch(url, {
//             headers: {
//                 Authorization: 'Bearer ' + service.getAccessToken()
//             }
//         });
//         Logger.log(response.getContentText());
//     } else {
//         Logger.log('User is not authorized.');
//     }
// }