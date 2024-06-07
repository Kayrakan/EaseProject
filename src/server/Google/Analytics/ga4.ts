export const listGoogleAnalyticsAccounts = () => {
    try {
        const adminService = AnalyticsAdmin.Accounts.list();
        if (!adminService || !adminService.accounts) {
            return { error: 'No Google Analytics accounts found' };
        }
        const accounts = adminService.accounts.map(account => ({
            id: account.name, // Use name as id since it contains 'accounts/' prefix
            name: account.displayName, // Assuming displayName is the name of the account
        }));
        return { accounts };
    } catch (error) {
        const e = error as Error;
        return { error: `Failed to retrieve Google Analytics accounts: ${e.message}` };
    }
};

export const listGoogleAnalyticsProperties = (accountId: string) => {
    try {
        const response = AnalyticsAdmin.Properties.list({
            pageSize: 100,
            filter: `parent:accounts/${accountId}`
        });

        if (!response.properties || response.properties.length === 0) {
            return { error: 'No Google Analytics properties found for the selected account' };
        }

        const propertyData = response.properties.map(property => ({
            id: property.name.split('/').pop()!, // Extract ID from the name
            name: property.displayName
        }));

        return { properties: propertyData };
    } catch (error) {
        const e = error as Error;
        return { error: `Failed to retrieve Google Analytics properties: ${e.message}` };
    }
};

export const getGoogleAnalyticsPropertyMetadata = (propertyId: string) => {
    try {
        const response = AnalyticsData.Properties.getMetadata(`properties/${propertyId}/metadata`);
        if (!response || !response.dimensions || !response.metrics) {
            return { error: 'No metadata found' };
        }
        const dimensions = response.dimensions.map(item => ({
            uiName: item.displayName,
            apiName: item.apiName
        }));
        const metrics = response.metrics.map(item => ({
            uiName: item.displayName,
            apiName: item.apiName
        }));
        return { dimensions, metrics };
    } catch (error) {
        const e = error as Error;
        return { error: `Failed to retrieve Google Analytics property metadata: ${e.message}` };
    }
};

export const fetchGoogleAnalyticsData = (options: {
    propertyId: string;
    dimensions: string[];
    metrics: string[];
    startDate: string;
    endDate: string;
    sheetName: string;
}) => {
    try {
        const { propertyId, dimensions, metrics, startDate, endDate, sheetName } = options;

        const requestData = {
            dimensions: dimensions.map(dimension => ({ name: dimension })),
            metrics: metrics.map(metric => ({ name: metric })),
            dateRanges: [{ startDate, endDate }],
        };

        const request = AnalyticsData.newRunReportRequest();
        request.dimensions = requestData.dimensions;
        request.metrics = requestData.metrics;
        request.dateRanges = requestData.dateRanges;

        const report = AnalyticsData.Properties.runReport(request, `properties/${propertyId}`);

        if (!report.rows) {
            return { error: 'No data returned' };
        }

        // Ensure dimensionHeaders and metricHeaders are present
        if (!report.dimensionHeaders || !report.metricHeaders) {
            return { error: 'Missing headers in the report response' };
        }

        // Write data to Google Sheet
        const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
        let sheet = spreadsheet.getSheetByName(sheetName);

        if (!sheet) {
            sheet = spreadsheet.insertSheet(sheetName);
        } else {
            sheet.clearContents();
        }

        const dimensionHeaders = report.dimensionHeaders.map(dh => dh.name);
        const metricHeaders = report.metricHeaders.map(mh => mh.name);
        const headers = [...dimensionHeaders, ...metricHeaders];

        sheet.appendRow(headers);

        const rows = report.rows.map(row => {
            const dimensionValues = row.dimensionValues.map((dv: { value: string }) => dv.value);
            const metricValues = row.metricValues.map((mv: { value: string }) => mv.value);
            return [...dimensionValues, ...metricValues];
        });

        sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);

        return { data: rows };
    } catch (error) {
        const e = error as Error;
        return { error: `Failed to run report: ${e.message}` };
    }
};
