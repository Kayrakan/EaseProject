import { getOAuthServiceFacebook } from '../Auth/facebook';

// var ui = SpreadsheetApp.getUi();
export function fetchFacebookAdsData(options: {
    adAccount: string;
    startDate: string;
    endDate: string;
    fields: string[];
}) {
    try {
        const service = getOAuthServiceFacebook();
        if (!service.hasAccess()) {
            return { error: 'Not authorized. Please authorize the app first.' };
        }

        const url = `https://graph.facebook.com/v20.0/act_${options.adAccount}/insights`;
        const params = {
            access_token: service.getAccessToken(),
            time_range: JSON.stringify({ since: options.startDate, until: options.endDate }),
            fields: options.fields.join(','),
            level: 'ad'  // Specify the level you want to fetch data for (ad, adset, campaign)
        };

        const response = UrlFetchApp.fetch(url, {
            method: 'get',
            payload: params,
            muteHttpExceptions: true,
        });

        const data = JSON.parse(response.getContentText());

        if (response.getResponseCode() !== 200) {
            return { error: data.error.message };
        }
        // ui.alert('report id return')

        const reportRunId = data.report_run_id;
        return { reportRunId };
    } catch (error) {
        const e = error as Error;
        console.error('Error fetching Facebook Ads data:', e);
        return { error: `Failed to fetch data: ${e.message}` };
    }
}

export function fetchFacebookReportStatus(reportRunId: string) {
    try {
        const service = getOAuthServiceFacebook();
        if (!service.hasAccess()) {
            return { error: 'Not authorized. Please authorize the app first.' };
        }


        const url = `https://graph.facebook.com/v20.0/${reportRunId}`;
        // ui.alert('status check')

        const response = UrlFetchApp.fetch(url, {
            method: 'get',
            headers: {
                Authorization: `Bearer ${service.getAccessToken()}`,
            },
            muteHttpExceptions: true,
        });
        // ui.alert('status check2')

        const data = JSON.parse(response.getContentText());
        // ui.alert('status check data ')


        if (response.getResponseCode() !== 200) {
            // ui.alert('status check not 200')

            return { error: data.error.message };
        }

        // ui.alert('return data')

        return data;
    } catch (error) {
        const e = error as Error;
        console.error('Error fetching Facebook Ads report status:', e);
        return { error: `Failed to fetch report status: ${e.message}` };
    }
}

export function fetchFacebookReportResults(reportRunId: string) {
    try {
        const service = getOAuthServiceFacebook();
        if (!service.hasAccess()) {
            return { error: 'Not authorized. Please authorize the app first.' };
        }

        const url = `https://graph.facebook.com/v20.0/${reportRunId}/insights`;

        const response = UrlFetchApp.fetch(url, {
            method: 'get',
            headers: {
                Authorization: `Bearer ${service.getAccessToken()}`,
            },
            muteHttpExceptions: true,
        });

        const data = JSON.parse(response.getContentText());

        if (response.getResponseCode() !== 200) {
            return { error: data.error.message };
        }

        if (!data.data || data.data.length === 0) {
            return { error: 'No data returned' };
        }

        // Get all unique keys (columns) from the response data
        const allFields: string[] = Array.from(new Set(data.data.flatMap((entry: { [key: string]: any }) => Object.keys(entry))));
        const rows = data.data.map((entry: { [key: string]: any }) => allFields.map(field => entry[field] ?? ''));

        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Facebook Ads') || SpreadsheetApp.getActiveSpreadsheet().insertSheet('Facebook Ads');
        sheet.clearContents();

        // Write the headers
        sheet.appendRow(allFields);
        // Write the data
        sheet.getRange(2, 1, rows.length, allFields.length).setValues(rows);

        return { data: rows };
    } catch (error) {
        const e = error as Error;
        console.error('Error fetching Facebook Ads report results:', e);
        return { error: `Failed to fetch report results: ${e.message}` };
    }
}





export function getFacebookAvailableFields() {
    return {
        fields: [
            'impressions',
            'clicks',
            'spend',
            'ctr',
            'cpm',
            // Add more fields as necessary
        ],
    };
}
