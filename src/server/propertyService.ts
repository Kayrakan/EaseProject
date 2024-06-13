interface PlatformSettings {
    id: string;
    name: string;
    description: string;
    icon: string;
    savedSettings: UserSavedSettings[]; // Add this line
    [key: string]: any; // Additional settings specific to the platform
}

// interface PlatformSettings {
//     id: string;
//     name: string;
//     description: string;
//     icon: string;
//     savedSettings: UserSavedSettings[]; // Add this line
//     [key: string]: any; // Additional settings specific to the platform
// }

interface SelectOption {
    value: string;
    label: string;
}


interface UserSavedSettings {
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



// Function to add a connected platform
export function addConnectedPlatform(platform: string, settings: PlatformSettings, overwrite: boolean = false): GoogleAppsScript.Properties.Properties {
    const userProperties = PropertiesService.getUserProperties();
    const connectedPlatforms = getConnectedPlatforms();

    if (overwrite || !connectedPlatforms[platform]) {
        connectedPlatforms[platform] = settings;
        return userProperties.setProperty('connectedPlatforms', JSON.stringify(connectedPlatforms));
    }
    return userProperties || null;
}

export function addGa4UserSavedSettings(setting: UserSavedSettings): void {
    const ga4Settings = getConnectedPlatformSettings('Google Analytics') || { id: 'analytics', name: 'Google Analytics', description: '', icon: '', savedSettings: [] };
    ga4Settings.savedSettings.push(setting);
    addConnectedPlatform('Google Analytics', ga4Settings, true);
}

export function removeGa4UserSavedSettings(settingId: string): GoogleAppsScript.Properties.Properties | null {
    const ga4Settings = getConnectedPlatformSettings('Google Analytics');
    if (ga4Settings) {
        ga4Settings.savedSettings = ga4Settings.savedSettings.filter(setting => setting.id !== settingId);
        return addConnectedPlatform('Google Analytics', ga4Settings, true);
    }
    return ga4Settings;
}



// Function to remove a connected platform
export function removeConnectedPlatform(platform: string): string {
    const userProperties = PropertiesService.getUserProperties();
    const connectedPlatforms = getConnectedPlatforms();
    delete connectedPlatforms[platform];
    userProperties.setProperty('connectedPlatforms', JSON.stringify(connectedPlatforms));
    return 'succesfully deleted';
}

// Function to get settings of a specific connected platform
export function getConnectedPlatformSettings(platform: string): PlatformSettings | null {
    const connectedPlatforms = getConnectedPlatforms();
    return connectedPlatforms[platform] || null;
}

// Function to get all connected platforms
export function getConnectedPlatforms(): { [platform: string]: PlatformSettings } {
    const userProperties = PropertiesService.getUserProperties();
    const platforms = userProperties.getProperty('connectedPlatforms');
    return platforms ? JSON.parse(platforms) : {};
}

export function deleteAllUserProperties() {
    const userProperties = PropertiesService.getUserProperties();
    userProperties.deleteAllProperties();
    Logger.log('All user properties have been deleted.');
}

// function getAllConnectedPlatforms() {
//     return getConnectedPlatforms();
// }