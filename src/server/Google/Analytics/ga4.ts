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


interface View {
    id: string;
    name: string;
}

interface AnalyticsProperty {
    id: string;
    name: string;
}

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

export const listGoogleAnalyticsViews = (accountId: string, propertyId: string) => {
    try {
        if (!Analytics || !Analytics.Management || !Analytics.Management.Profiles) {
            return { error: 'Google Analytics API is not available' };
        }
        const profiles = (Analytics.Management.Profiles.list(accountId, propertyId) as any).items as View[];
        if (!profiles || profiles.length === 0) {
            return { error: 'No views found for the selected property' };
        }
        const viewData = profiles.map(profile => ({
            id: profile.id,
            name: profile.name,
        }));
        return { views: viewData };
    } catch (error) {
        const e = error as Error;
        return { error: `Failed to retrieve Google Analytics views: ${e.message}` };
    }
};

export const fetchGoogleAnalyticsData = (options: {
    accountId: string;
    propertyId: string;
    viewId: string;
    dimensions: string[];
    metrics: string[];
    startDate: string;
    endDate: string;
    sheetName: string;
}) => {
    try {
        if (!Analytics || !Analytics.Data || !Analytics.Data.Ga) {
            return { error: 'Google Analytics API is not available' };
        }
        const { viewId, dimensions, metrics, startDate, endDate } = options;
        const tableId = 'ga:' + viewId;
        const metricsString = metrics.join(',');
        const dimensionsString = dimensions.join(',');

        const report = Analytics.Data.Ga.get(tableId, startDate, endDate, metricsString, {
            dimensions: dimensionsString
        });

        // Return the full report for debugging purposes
        return { report };

    } catch (error) {
        const e = error as Error;
        return { error: `Failed to run report: ${e.message}` };
    }
};
