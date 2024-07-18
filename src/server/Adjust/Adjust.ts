// import { HttpClient, HttpRequest } from 'google-apps-script';
// import { PropertiesService } from 'google-apps-script';

// import { getConnectedPlatformSettings} from "../propertyService.ts";
// Adjust API URL
const ADJUST_API_URL = 'https://automate.adjust.com/reports-service/csv_report';
const ADJUST_EVENTS_URL = 'https://automate.adjust.com/reports-service/events';
var ui = SpreadsheetApp.getUi();

interface PullAdjustDataParams {
    apiKey: string;
    dimensions: string[];
    metrics: string[];
    startDate: string;
    endDate: string;
}

interface Event {
    id: string;
    name: string;
    short_name: string;
    section: string;
    formatting: string;
    increase_is_negative: boolean;
    description: string;
    app_token: string[];
    tokens: string[];
}

export function getAdjustOptions() {
    return {
        dimensions: [
            { value: 'hour', label: 'Hour' },
            { value: 'day', label: 'Day' },
            { value: 'week', label: 'Week' },
            { value: 'month', label: 'Month' },
            { value: 'year', label: 'Year' },
            { value: 'quarter', label: 'Quarter' },
            { value: 'os_name', label: 'Os_name' },
            { value: 'app', label: 'App' },
            { value: 'app_token', label: 'App_token' },
            { value: 'store_id', label: 'Store_id' },
            { value: 'store_type', label: 'Store_type' },
            { value: 'currency', label: 'Currency' },
            { value: 'device_type', label: 'Device_type' },
            { value: 'currency_code', label: 'Currency_code' },
            { value: 'campaign', label: 'Campaign' },
            { value: 'campaign_network', label: 'Campaign_network' },
            { value: 'campaign_id_network', label: 'Campaign_id_network' },
            { value: 'adgroup', label: 'Adgroup' },
            { value: 'adgroup_network', label: 'Adgroup_network' },
            { value: 'adgroup_id_network', label: 'Adgroup_id_network' },
            { value: 'source_network', label: 'Source_network' },
            { value: 'source_id_network', label: 'Source_id_network' },
            { value: 'creative', label: 'Creative' },
            { value: 'creative_network', label: 'Creative_network' },
            { value: 'creative_id_network', label: 'Creative_id_network' },
            { value: 'country', label: 'Country' },
            { value: 'country_code', label: 'Country_code' },
            { value: 'region', label: 'Region' },
            { value: 'partner_name', label: 'Partner_name' },
            { value: 'partner_id', label: 'Partner_id' },
            { value: 'partner', label: 'Partner' },
            { value: 'channel', label: 'Channel' },
            { value: 'platform', label: 'Platform' },


            // Add more dimensions as needed
        ],
        metrics: [
            { value: 'att_status_authorized', label: 'ATT - Authorized Users' },
            { value: 'att_status_non_determined', label: 'ATT - Not Determined Users' },
            { value: 'att_status_denied', label: 'ATT - Denied Users' },
            { value: 'att_status_restricted', label: 'ATT - Restricted Users' },
            { value: 'att_consent_rate', label: 'ATT Consent Rate' },
            { value: 'daus', label: 'Avg. DAUs' },
            { value: 'maus', label: 'Avg. MAUs' },
            { value: 'waus', label: 'Avg. WAUs' },
            { value: 'base_sessions', label: 'Base Sessions' },
            { value: 'cancels', label: 'Cancels' },
            { value: 'clicks', label: 'Clicks' },
            { value: 'attribution_clicks', label: 'Clicks (Attribution)' },
            { value: 'network_clicks', label: 'Clicks (Network)' },
            { value: 'click_conversion_rate', label: 'Click Conversion Rate (CCR)' },
            { value: 'ctr', label: 'Click Through Rate (CTR)' },
            { value: 'deattributions', label: 'Deattributions' },
            { value: '{event_slug}_events', label: 'Event' },
            { value: 'events', label: 'Total Events' },
            { value: 'first_reinstalls', label: 'First Reinstalls' },
            { value: 'first_uninstalls', label: 'First Uninstalls' },
            { value: 'gdpr_forgets', label: 'GDPR Forgets' },
            { value: 'impressions', label: 'Impressions' },
            { value: 'attribution_impressions', label: 'Impressions (Attribution)' },
            { value: 'network_impressions', label: 'Impressions (Network)' },
            { value: 'impression_conversion_rate', label: 'Impression Conversion Rate (ICR)' },
            { value: 'installs', label: 'Installs' },
            { value: 'network_installs', label: 'Installs (Network)' },
            { value: 'network_installs_diff', label: 'Installs Diff (Network)' },
            { value: 'installs_per_mile', label: 'Installs per Mile (IPM)' },
            { value: 'limit_ad_tracking_installs', label: 'Limit Ad Tracking Installs' },
            { value: 'limit_ad_tracking_install_rate', label: 'Limit Ad Tracking Rate' },
            { value: 'limit_ad_tracking_reattributions', label: 'Limit Ad Tracking Reattributions' },
            { value: 'limit_ad_tracking_reattribution_rate', label: 'Limit Ad Tracking Reattribution Rate' },
            { value: 'non_organic_installs', label: 'Non-Organic Installs' },
            { value: 'organic_installs', label: 'Organic Installs' },
            { value: 'reattributions', label: 'Reattribution' },
            { value: 'reattribution_reinstalls', label: 'Reattribution Reinstalls' },
            { value: 'reinstalls', label: 'Reinstalls' },
            { value: 'renewals', label: 'Renewals' },
            { value: 'sessions', label: 'Sessions' },
            { value: 'uninstalls', label: 'Uninstalls' },
            { value: 'uninstall_cohort', label: 'Uninstalls (Cohort)' },
            // Add more metrics as needed
        ],
    };
}


function toQueryString(params: { [key: string]: string }) {
    return Object.keys(params)
        .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(params[key]))
        .join('&');
}

function parseCSV(data: string): string[][] {
    const rows = data.trim().split('\n');
    return rows.map(row => row.split(','));
}


export function pullAdjustData(params: PullAdjustDataParams) {
    const { apiKey, dimensions, metrics, startDate, endDate } = params;

    const queryParams = toQueryString({
        dimensions: dimensions.join(','),
        metrics: metrics.join(','),
        date_period: `${startDate}:${endDate}`,
    });

    const url = `${ADJUST_API_URL}?${queryParams}`;

    try {
        const response = UrlFetchApp.fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`
            },
            muteHttpExceptions: true,
        });

        if (response.getResponseCode() !== 200) {
            Logger.log(`Error response code: ${response.getResponseCode()} - ${response.getContentText()}`);
            throw new Error(`Error, failed to fetch data. response code: ${response.getResponseCode()} - ${response.getContentText()}`);
        }

        const data = response.getContentText();
        const parsedData = parseCSV(data);

        const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
        const sheet = spreadsheet.getActiveSheet();

        sheet.clear();
        sheet.getRange(1, 1, parsedData.length, parsedData[0].length).setValues(parsedData);

        return 'Data written to spreadsheet successfully';
    } catch (error) {
        if (error instanceof Error) {
            return error.message;
        } else {
            Logger.log('Unknown error occurred');
            throw new Error('Failed to fetch data from Adjust: Unknown error');
        }
    }
}

export function fetchEvents(apiKey: string): Event[] {
    ui.alert('getting Platform Settings');

    try {
        ui.alert('api key' + apiKey);

        const url = `${ADJUST_EVENTS_URL}`;

        ui.alert('getting events');
        const response = UrlFetchApp.fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`
            },
            muteHttpExceptions: true,
        });

        if (response.getResponseCode() !== 200) {
            Logger.log(`Error response code: ${response.getResponseCode()} - ${response.getContentText()}`);
            throw new Error(`Error response code: ${response.getResponseCode()} - ${response.getContentText()}`);
        }

        ui.alert('returning events');
        ui.alert(response.getContentText());

        return JSON.parse(response.getContentText()) as Event[];
    } catch (error) {
        if (error instanceof Error) {
            ui.alert('error occurred: ' + error.message);
            Logger.log(`Error fetching Adjust events: ${error.message}`);
            throw new Error(`Failed to fetch events from Adjust: ${error.message}`);
        } else {
            Logger.log('Unknown error occurred');
            throw new Error('Failed to fetch events from Adjust: Unknown error');
        }
    }
}

