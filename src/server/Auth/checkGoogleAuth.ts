import { addConnectedPlatform, removeConnectedPlatform, getConnectedPlatformSettings } from '../propertyService';

const servicesToCheck = [
    // {id:'drive', name: 'Google Drive', scope: 'https://www.googleapis.com/auth/drive', platformSettings: { id: 'drive', name: 'Google drive', description: 'Google drive data', icon: 'icon-url' } },
    // {id:'sheets',  name: 'Google Sheets', scope: 'https://www.googleapis.com/auth/spreadsheets', platformSettings: { id: 'sheets', name: 'Google sheets', description: 'Google sheets data', icon: 'icon-url' } },
    // {id: 'calender',  name: 'Google Calendar', scope: 'https://www.googleapis.com/auth/calendar', platformSettings: { id: 'calender', name: 'Google calender', description: 'Google calender data', icon: 'icon-url' }},
    {id: 'analytics',  name: 'Google Analytics', scope: 'https://www.googleapis.com/auth/analytics.readonly', platformSettings: { id: 'analytics', name: 'Google Analytics', description: 'Google Analytics data', icon: 'icon-url' } }
];

// Function to check authorization for a specific service
function checkAuthorization(serviceName: string): boolean {
    const authInfo = ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL);
    if (authInfo.getAuthorizationStatus() === ScriptApp.AuthorizationStatus.REQUIRED) {
        return false;
    }

    try {
        switch (serviceName) {
            case 'Google Drive':
                DriveApp.getFiles();
                break;
            case 'Google Sheets':
                SpreadsheetApp.getActiveSpreadsheet();
                break;
            case 'Google Calendar':
                CalendarApp.getCalendarsByName('Default');
                break;
            case 'Google Analytics':
                (Analytics as any).Data.Ga.get('ga:XXXXXX', '7daysAgo', 'today', 'ga:sessions');
                break;
            default:
                throw new Error(`Unknown service: ${serviceName}`);
        }
        return true;
    } catch (e) {
        const error = e as Error;
        if (error.message.includes('Authorization is required')) {
            return false;
        } else {
            throw error;
        }
    }
}

// Function to update connected platforms based on authorization status
function updateConnectedPlatforms() {
    servicesToCheck.forEach(service => {
        const authorized = checkAuthorization(service.name);
        const existingSettings = getConnectedPlatformSettings(service.name);
        if (authorized) {
            if (!existingSettings) {
                addConnectedPlatform(service.name, service.platformSettings, false);
            }
        } else {
            if (existingSettings) {
                removeConnectedPlatform(service.name);
            }
        }
    });
}

// Function to trigger authorization for all services if not authorized
function checkAndTriggerAuthorization() {
    const requiredScopes: string[] = [];

    servicesToCheck.forEach(service => {
        const authorized = checkAuthorization(service.name);
        if (!authorized) {
            requiredScopes.push(service.scope);
        }
    });

    if (requiredScopes.length > 0) {
        const authInfo = ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL);
        const authUrl = authInfo.getAuthorizationUrl();
        const ui = SpreadsheetApp.getUi();
        ui.alert(`Authorization is required for the following services: ${requiredScopes.join(', ')}.\n\nPlease authorize the script by visiting the following URL: ${authUrl}`);
    }
}

// Function to be called from the Google Apps Script editor or a custom menu
export function authorizeServices() {
    checkAndTriggerAuthorization();
}

// Example usage in a custom menu
export function onOpenOauth() {
    const ui = SpreadsheetApp.getUi();
    ui.createMenu('Authorize')
        .addItem('Authorize Services', 'authorizeServices')
        .addToUi();

    // Update connected platforms based on authorization status
    updateConnectedPlatforms();
}
