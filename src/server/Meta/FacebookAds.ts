import { getUserOAuthInformation, reauthenticateIfNeeded } from '../Auth/facebook';



export function fetchFacebookAdAccounts(userId: string): any {
    const oauthInfo = getUserOAuthInformation(userId);
    if (!oauthInfo || !oauthInfo.accessToken) {
        return { error: 'Not authorized. Please authorize the app first.' };
    }

    const url = `https://graph.facebook.com/v20.0/me/adaccounts?access_token=${oauthInfo.accessToken}`;
    const response = UrlFetchApp.fetch(url);
    if (response.getResponseCode() === 200) {
        return JSON.parse(response.getContentText());
    } else {
        console.error('Error fetching ad accounts:', response.getContentText());
        return { error: 'Failed to fetch ad accounts' };
    }
}

export function fetchFacebookAdsData(options: {
    adAccount: string;
    startDate: string;
    endDate: string;
    fields: string[];
    breakdown: string;
    identifier: string;
}) {
    if (!reauthenticateIfNeeded(options.identifier)) {
        return { error: 'Reauthentication required. Please reauthenticate.' };
    }

    try {
        const oauthInfo = getUserOAuthInformation(options.identifier);
        if (!oauthInfo || !oauthInfo.accessToken) {
            return { error: 'Not authorized. Please authorize the app first.' };
        }

        const url = `https://graph.facebook.com/v20.0/${options.adAccount}/insights`;
        const params = {
            access_token: oauthInfo.accessToken,
            time_range: JSON.stringify({ since: options.startDate, until: options.endDate }),
            fields: options.fields.join(','),
            level: 'ad',
            breakdowns: options.breakdown,
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

        const reportRunId = data.report_run_id;
        return { reportRunId };
    } catch (error) {
        const e = error as Error;
        console.error('Error fetching Facebook Ads data:', e);
        return { error: `Failed to fetch data: ${e.message}` };
    }
}

export function fetchFacebookReportStatus(reportRunId: string, identifier: string) {
    if (!reauthenticateIfNeeded(identifier)) {
        return { error: 'Reauthentication required. Please reauthenticate.' };
    }

    try {
        const oauthInfo = getUserOAuthInformation(identifier);
        if (!oauthInfo || !oauthInfo.accessToken) {
            return { error: 'Not authorized. Please authorize the app first.' };
        }

        const url = `https://graph.facebook.com/v20.0/${reportRunId}`;

        const response = UrlFetchApp.fetch(url, {
            method: 'get',
            headers: {
                Authorization: `Bearer ${oauthInfo.accessToken}`,
            },
            muteHttpExceptions: true,
        });

        const data = JSON.parse(response.getContentText());

        if (response.getResponseCode() !== 200) {
            return { error: data.error.message };
        }

        return data;
    } catch (error) {
        const e = error as Error;
        console.error('Error fetching Facebook Ads report status:', e);
        return { error: `Failed to fetch report status: ${e.message}` };
    }
}

export function fetchFacebookReportResults(reportRunId: string, identifier: string) {
    if (!reauthenticateIfNeeded(identifier)) {
        return { error: 'Reauthentication required. Please reauthenticate.' };
    }

    try {
        const oauthInfo = getUserOAuthInformation(identifier);
        if (!oauthInfo || !oauthInfo.accessToken) {
            return { error: 'Not authorized. Please authorize the app first.' };
        }

        const url = `https://graph.facebook.com/v20.0/${reportRunId}/insights`;

        const response = UrlFetchApp.fetch(url, {
            method: 'get',
            headers: {
                Authorization: `Bearer ${oauthInfo.accessToken}`,
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

        const allFields: string[] = Array.from(new Set(data.data.flatMap((entry: { [key: string]: any }) => Object.keys(entry))));
        const rows = data.data.map((entry: { [key: string]: any }) => allFields.map(field => entry[field] ?? ''));

        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Facebook Ads') || SpreadsheetApp.getActiveSpreadsheet().insertSheet('Facebook Ads');
        sheet.clearContents();

        sheet.appendRow(allFields);
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
