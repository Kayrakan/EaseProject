
interface PlatformSettings {
    [key: string]: any;
}

// Function to store platform-specific settings
export function storePlatformSettings(platform: string, settings: PlatformSettings): void {
    const userProperties = PropertiesService.getUserProperties();
    const allSettings = getAllSettings();
    allSettings[platform] = settings;
    userProperties.setProperty('platformSettings', JSON.stringify(allSettings));
}

// Function to retrieve platform-specific settings
export function getPlatformSettings(platform: string): PlatformSettings {
    const allSettings = getAllSettings();
    return allSettings[platform] || {};
}

// Function to get all settings
export function getAllSettings(): { [platform: string]: PlatformSettings } {
    const userProperties = PropertiesService.getUserProperties();
    const settings = userProperties.getProperty('platformSettings');
    return settings ? JSON.parse(settings) : {};
}
