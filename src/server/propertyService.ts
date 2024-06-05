interface PlatformSettings {
    id: string;
    name: string;
    description: string;
    icon: string;
    [key: string]: any; // Additional settings specific to the platform
}

// Function to add a connected platform
export function addConnectedPlatform(platform: string, settings: PlatformSettings, overwrite: boolean = true): void {
    const userProperties = PropertiesService.getUserProperties();
    const connectedPlatforms = getConnectedPlatforms();

    if (overwrite || !connectedPlatforms[platform]) {
        connectedPlatforms[platform] = settings;
        userProperties.setProperty('connectedPlatforms', JSON.stringify(connectedPlatforms));
    }
}

// Function to remove a connected platform
export function removeConnectedPlatform(platform: string): void {
    const userProperties = PropertiesService.getUserProperties();
    const connectedPlatforms = getConnectedPlatforms();
    delete connectedPlatforms[platform];
    userProperties.setProperty('connectedPlatforms', JSON.stringify(connectedPlatforms));
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