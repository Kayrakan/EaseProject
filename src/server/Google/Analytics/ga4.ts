// interface AnalyticsAccount {
//     id: string;
//     name: string;
//     displayName: string;
//     created: string;
//     updated: string;
//     permissions: {
//         effective: string[];
//     };
//     childLink: {
//         type: string;
//         href: string;
//     };
// }

// interface AccountsListResponse {
//     items: AnalyticsAccount[];
//     nextLink?: string;
// }


interface AnalyticsProperty {
    id: string;
    name: string;
}

interface GAReportRequest {
    viewId: string;
    dateRanges: { startDate: string; endDate: string }[];
    dimensions: { name: string }[];
    metrics: { expression: string }[];
}

// List all Google Analytics accounts

export const listGoogleAnalyticsAccounts = () => {
    try {
        if (!Analytics || !Analytics.Management || !Analytics.Management.Accounts) {
            return { error: 'Google Analytics API is not available' };
        }
        const accountsResponse = Analytics.Management.Accounts.list();
        const accounts = accountsResponse.items;

        if (!accounts || accounts.length === 0) {
            return { error: 'No Google Analytics accounts found' };
        }

        return { accountsResponse };
    } catch (error) {
        const e = error as Error;
        return { error: `Failed to retrieve Google Analytics accounts: ${e.message}` };
    }
};

// List all properties for a given Google Analytics account
export const listGoogleAnalyticsProperties = (accountId: string) => {
    try {
        if (!Analytics || !Analytics.Management || !Analytics.Management.Webproperties) {
            return { error: 'Google Analytics API is not available' };
        }
        const properties = (Analytics.Management.Webproperties.list(accountId) as any).items as AnalyticsProperty[];
        if (!properties || properties.length === 0) {
            return { error: 'No Google Analytics properties found for the selected account' };
        }
        const propertyData = properties.map(property => ({
            id: property.id,
            name: property.name,
        }));
        return { properties: propertyData };
    } catch (error) {
        const e = error as Error;
        return { error: `Failed to retrieve Google Analytics properties: ${e.message}` };
    }
};

// Retrieve metadata (dimensions and metrics) for Google Analytics
export const getGoogleAnalyticsPropertyMetadata = () => {
    try {
        if (!Analytics || !Analytics.Metadata || !Analytics.Metadata.Columns) {
            return { error: 'Google Analytics API is not available' };
        }
        const columns = (Analytics.Metadata.Columns.list('ga') as any).items as any[];
        if (!columns) {
            return { error: 'No metadata found' };
        }
        const dimensions = columns
            .filter(item => item.attributes.type === 'DIMENSION')
            .map(item => ({ uiName: item.attributes.uiName, apiName: item.id }));
        const metrics = columns
            .filter(item => item.attributes.type === 'METRIC')
            .map(item => ({ uiName: item.attributes.uiName, apiName: item.id }));
        return { dimensions, metrics };
    } catch (error) {
        const e = error as Error;
        return { error: `Failed to retrieve Google Analytics property metadata: ${e.message}` };
    }
};

// Run a report and write the data to a specified sheet
export const fetchGoogleAnalyticsData = (options: {
    accountId: string;
    propertyId: string;
    dimensions: string[];
    metrics: string[];
    startDate: string;
    endDate: string;
    sheetName: string;
}) => {
    try {
        if (!Analyticsreporting || !Analyticsreporting.Reports) {
            return { error: 'Google Analytics Reporting API is not available' };
        }
        const { propertyId, dimensions, metrics, startDate, endDate, sheetName } = options;
        const reportRequest: GAReportRequest = {
            viewId: propertyId,
            dateRanges: [{ startDate, endDate }],
            dimensions: dimensions.map(dimension => ({ name: dimension })),
            metrics: metrics.map(metric => ({ expression: metric }))
        };

        const response = Analyticsreporting.Reports.batchGet({ reportRequests: [reportRequest] });
        if (!response.reports || !response.reports[0].data || !response.reports[0].data.rows) {
            return { error: 'No data returned' };
        }

        const rows = response.reports[0].data.rows.map(row => [
            ...(row.dimensions || []),
            ...((row.metrics && row.metrics[0] && row.metrics[0].values) ? row.metrics[0].values : [])
        ]);

        // Write data to the specified Google Sheet
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName) || SpreadsheetApp.getActiveSpreadsheet().insertSheet(sheetName);
        sheet.clearContents();
        sheet.getRange(1, 1, rows.length, rows[0].length).setValues(rows);

        return { data: rows };
    } catch (error) {
        const e = error as Error;
        return { error: `Failed to run report: ${e.message}` };
    }
};
