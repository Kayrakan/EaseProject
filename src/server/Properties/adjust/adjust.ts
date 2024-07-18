interface AdjustApiKey {
    name: string;
    key: string;
}

interface AdjustPlatformSettings {
    id: string;
    name: string;
    description: string;
    icon: string;
    savedSettings: UserSavedSettings[];
    apiKeys: AdjustApiKey[];
    [key: string]: any;
}

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

var ui = SpreadsheetApp.getUi();

export function addConnectedPlatform(platform: string, settings: AdjustPlatformSettings, overwrite: boolean = false): AdjustPlatformSettings | null {
    const userProperties = PropertiesService.getUserProperties();
    const connectedPlatforms = getConnectedPlatforms();

    if (overwrite || !connectedPlatforms[platform]) {
        connectedPlatforms[platform] = settings;

        userProperties.setProperty('AdjustPlatform', JSON.stringify(connectedPlatforms));

        return connectedPlatforms[platform];
    }
    return null;
}

// Function to remove a connected platform

// Function to get settings of a specific connected platform
export function getConnectedPlatformSettings(platform: string): AdjustPlatformSettings | null {
    const connectedPlatforms = getConnectedPlatforms();
    Logger.log('getConnectedPlatformSettings: ' + JSON.stringify(connectedPlatforms));
    return connectedPlatforms[platform] || null;
}

// Function to get all connected platforms
export function getConnectedPlatforms(): { [platform: string]: AdjustPlatformSettings } {
    const userProperties = PropertiesService.getUserProperties();
    const platforms = userProperties.getProperty('AdjustPlatform');
    Logger.log('getConnectedPlatforms: ' + platforms);
    return platforms ? JSON.parse(platforms) : {};
}


export function saveAdjustApiKey(apiKey: string, apiName: string): AdjustPlatformSettings | null {
    Logger.log('api key saving start : ' + apiKey);
    const adjustSettings = getConnectedPlatformSettings('Adjust') || {
        id: 'adjust',
        name: 'Adjust',
        description: '',
        icon: 'adjustIcon',
        savedSettings: [],
        apiKeys: [],
    };

    if (!adjustSettings.apiKeys.some(api => api.key === apiKey)) {
        adjustSettings.apiKeys.push({ name: apiName, key: apiKey });
        Logger.log('pushed new settings: ' + JSON.stringify(adjustSettings));
    }
    const result = addConnectedPlatform('Adjust', adjustSettings, true);
    Logger.log('saveAdjustApiKey: ' + JSON.stringify(getConnectedPlatforms()));
    return result;
}



// Function to get all API keys
export function getAdjustApiKeys(): AdjustApiKey[] {
    const adjustSettings = getConnectedPlatformSettings('Adjust');
    Logger.log('getAdjustApiKeys: ' + JSON.stringify(adjustSettings));
    return adjustSettings ? adjustSettings.apiKeys : [];
}

// Function to delete an API key
export function deleteAdjustApiKey(apiKey: string): AdjustPlatformSettings | null {
    const adjustSettings = getConnectedPlatformSettings('Adjust');
    if (adjustSettings) {
        ui.alert('api keys:' + JSON.stringify(adjustSettings.apiKeys));
        Logger.log('deleteAdjustApiKey: ' + JSON.stringify(adjustSettings.apiKeys));
        adjustSettings.apiKeys = adjustSettings.apiKeys.filter(api => api.key !== apiKey);
        ui.alert('api keys:' + JSON.stringify(adjustSettings.apiKeys));
        const result = addConnectedPlatform('Adjust', adjustSettings, true);
        Logger.log('deleteAdjustApiKey: ' + JSON.stringify(getConnectedPlatforms()));
        return result;
    }
    return null;
}