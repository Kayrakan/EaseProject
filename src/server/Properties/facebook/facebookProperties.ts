

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
    dateTaken?: number;
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
    selectedAccount: SelectOption | null; // this will be the ad account, for example: act_955477841883144
    selectedFields: SelectOption[]; // Array of selected fields
    selectedBreakdowns: SelectOption[]; // Array of selected breakdowns
    filterSettings: { filter: string, operator: string, value: string }[]; // Filter settings
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
        // ui.alert('Saving new platform settings: ' + JSON.stringify(settings));

        PropertiesService.getScriptProperties().setProperty('facebook', JSON.stringify(settings));

        // ui.alert('Platform settings saved successfully.');
    } catch (error) {
        const errorMessage = (error instanceof Error) ? error.message : 'An unknown error occurred';
        ui.alert('Error saving platform settings: ' + errorMessage);
        console.error('Error saving platform settings:', error);
    }
}

export function getSavedTemplates(): FbUserSavedSettings[] {
    const platformSettings = getPlatformSettings();
    const userAccount = platformSettings.accounts.find(account => account.email === Session.getActiveUser().getEmail());
    return userAccount ? userAccount.savedSettings : [];
}


export function saveTemplate(template: FbUserSavedSettings) {
    const platformSettings = getPlatformSettings();
    const userEmail = Session.getActiveUser().getEmail();
    let userAccount = platformSettings.accounts.find(account => account.email === userEmail);

    if (!userAccount) {
        userAccount = {
            name: userEmail,
            email: userEmail,
            uniqueId: '',
            date: new Date().toISOString(),
            oauthInformation: { accessToken: '' },
            savedSettings: [],
            customSettings: {},
        };
        platformSettings.accounts.push(userAccount);
    }

    userAccount.savedSettings.push(template);
    savePlatformSettings(platformSettings);
    ui.alert('Template saved successfully.');
}


export function deleteTemplate(templateId: string) {
    const platformSettings = getPlatformSettings();
    const userEmail = Session.getActiveUser().getEmail();
    const userAccount = platformSettings.accounts.find(account => account.email === userEmail);

    if (userAccount) {
        userAccount.savedSettings = userAccount.savedSettings.filter(setting => setting.id !== templateId);
        savePlatformSettings(platformSettings);
        ui.alert('Template deleted successfully.');
    } else {
        ui.alert('User account not found.');
    }
}