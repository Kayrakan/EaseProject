import { getUserOAuthInformation, reauthenticateIfNeeded } from '../Auth/facebook';
import { getPlatformSettings} from "../Properties/facebook/facebookProperties";

var ui = SpreadsheetApp.getUi();

const operatorMapping: { [key: string]: string } = {
    '>': 'GREATER_THAN',
    '>=': 'GREATER_THAN_OR_EQUAL',
    '=': 'EQUAL',
    '<>': 'NOT_EQUAL',
    '<': 'LESS_THAN',
    '<=': 'LESS_THAN_OR_EQUAL',
    'in_range': 'IN_RANGE',
    'not_in_range': 'NOT_IN_RANGE',
};


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
    filters: { filter: string, operator: string, value: string }[];
    identifier: string;
    level: string;  // Add this line
}) {
    if (!reauthenticateIfNeeded(options.identifier)) {
        ui.alert('authenticate error');
        return { error: 'Reauthentication required. Please reauthenticate.' };
    }

    try {
        const oauthInfo = getUserOAuthInformation(options.identifier);
        // ui.alert('user oauth info:' + JSON.stringify(oauthInfo));
        if (!oauthInfo || !oauthInfo.accessToken) {
            ui.alert('oauth access token error');
            return { error: 'Not authorized. Please authorize the app first.' };
        }

        const filterParams = options.filters.map(filter => {
            return {
                field: filter.filter,
                operator: operatorMapping[filter.operator],
                value: filter.value
            };
        });

        const url = `https://graph.facebook.com/v20.0/${options.adAccount}/insights`;
        // ui.alert('start date:' + options.startDate + 'end date' + options.endDate);
        // ui.alert(JSON.stringify({ since: options.startDate, until: options.endDate }));
        const params = {
            access_token: oauthInfo.accessToken,
            time_range: JSON.stringify({ since: options.startDate, until: options.endDate }),
            fields: options.fields.join(','),
            level: options.level,  // Add this line
            breakdowns: options.breakdown,
            filtering: JSON.stringify(filterParams),
            use_account_attribution_setting: true,

        };

        const response = UrlFetchApp.fetch(url, {
            method: 'get',
            payload: params,
            muteHttpExceptions: true,
        });
        // ui.alert('got response');

        const data = JSON.parse(response.getContentText());

        if (response.getResponseCode() !== 200) {
            ui.alert('not 200 response');
            return { error: data.error.message };
        }

        const reportRunId = data.report_run_id;
        return { reportRunId };
    } catch (error) {
        const e = error as Error;
        ui.alert('error occured pulling data: ' + e.message);
        console.error('Error fetching Facebook Ads data:', e);
        return { error: `Failed to fetch data: ${e.message}` };
    }
}



export function fetchFacebookReportStatus(reportRunId: string, identifier: string) {
    if (!reauthenticateIfNeeded(identifier)) {
        ui.alert('auth error report status')

        return { error: 'Reauthentication required. Please reauthenticate.' };
    }

    try {
        const oauthInfo = getUserOAuthInformation(identifier);
        if (!oauthInfo || !oauthInfo.accessToken) {
            ui.alert('oauth error report status')

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
            ui.alert('report status not 200')
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

const availableFields = [
    { value: 'account_currency', label: 'account_currency' },
    { value: 'account_id', label: 'account_id' },
    { value: 'account_name', label: 'account_name' },
    { value: 'ad_id', label: 'ad_id' },
    { value: 'ad_name', label: 'ad_name' },
    { value: 'adset_id', label: 'adset_id' },
    { value: 'adset_name', label: 'adset_name' },
    { value: 'attribution_setting', label: 'attribution_setting' },
    { value: 'auction_bid', label: 'auction_bid' },
    { value: 'auction_competitiveness', label: 'auction_competitiveness' },
    { value: 'auction_max_competitor_bid', label: 'auction_max_competitor_bid' },
    { value: 'buying_type', label: 'buying_type' },
    { value: 'campaign_id', label: 'campaign_id' },
    { value: 'campaign_name', label: 'campaign_name' },
    { value: 'canvas_avg_view_percent', label: 'canvas_avg_view_percent' },
    { value: 'canvas_avg_view_time', label: 'canvas_avg_view_time' },
    { value: 'clicks', label: 'clicks' },
    { value: 'cost_per_dda_countby_convs', label: 'cost_per_dda_countby_convs' },
    { value: 'cost_per_inline_link_click', label: 'cost_per_inline_link_click' },
    { value: 'cost_per_inline_post_engagement', label: 'cost_per_inline_post_engagement' },
    { value: 'cost_per_unique_click', label: 'cost_per_unique_click' },
    { value: 'cost_per_unique_inline_link_click', label: 'cost_per_unique_inline_link_click' },
    { value: 'cpc', label: 'cpc' },
    { value: 'cpm', label: 'cpm' },
    { value: 'cpp', label: 'cpp' },
    { value: 'created_time', label: 'created_time' },
    { value: 'ctr', label: 'ctr' },
    { value: 'date_start', label: 'date_start' },
    { value: 'date_stop', label: 'date_stop' },
    { value: 'dda_countby_convs', label: 'dda_countby_convs' },
    { value: 'dda_results', label: 'dda_results' },
    { value: 'frequency', label: 'frequency' },
    { value: 'full_view_impressions', label: 'full_view_impressions' },
    { value: 'full_view_reach', label: 'full_view_reach' },
    { value: 'impressions', label: 'impressions' },
    { value: 'inline_link_click_ctr', label: 'inline_link_click_ctr' },
    { value: 'inline_link_clicks', label: 'inline_link_clicks' },
    { value: 'inline_post_engagement', label: 'inline_post_engagement' },
    { value: 'instagram_upcoming_event_reminders_set', label: 'instagram_upcoming_event_reminders_set' },
    { value: 'instant_experience_clicks_to_open', label: 'instant_experience_clicks_to_open' },
    { value: 'instant_experience_clicks_to_start', label: 'instant_experience_clicks_to_start' },
    { value: 'objective', label: 'objective' },
    { value: 'optimization_goal', label: 'optimization_goal' },
    { value: 'qualifying_question_qualify_answer_rate', label: 'qualifying_question_qualify_answer_rate' },
    { value: 'reach', label: 'reach' },
    { value: 'shops_assisted_purchases', label: 'shops_assisted_purchases' },
    { value: 'social_spend', label: 'social_spend' },
    { value: 'spend', label: 'spend' },
    { value: 'updated_time', label: 'updated_time' },
    { value: 'video_play_curve_actions', label: 'video_play_curve_actions' },
    { value: 'video_play_retention_0_to_15s_actions', label: 'video_play_retention_0_to_15s_actions' },
    { value: 'video_play_retention_20_to_60s_actions', label: 'video_play_retention_20_to_60s_actions' },
    { value: 'video_play_retention_graph_actions', label: 'video_play_retention_graph_actions' },
    { value: 'wish_bid', label: 'wish_bid' }
    // Add more fields as necessary
];

export function fetchFacebookAvailableFields(identifier: string) {
    const platformSettings = getPlatformSettings();
    const userAccount = platformSettings.accounts.find(account => account.uniqueId === identifier);

    if (!userAccount) {
        return { error: 'User account not found.' };
    }

    const oauthInfo = userAccount.oauthInformation;
    if (!reauthenticateIfNeeded(identifier)) {
        return { error: 'Reauthentication required. Please reauthenticate.' };
    }

    try {
        if (!oauthInfo || !oauthInfo.accessToken) {
            return { error: 'Not authorized. Please authorize the app first.' };
        }

        return { fields: availableFields };
    } catch (error) {
        const e = error as Error;
        console.error('Error fetching Facebook available fields:', e);
        return { error: `Failed to fetch available fields: ${e.message}` };
    }
}