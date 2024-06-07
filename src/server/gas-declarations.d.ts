declare namespace GoogleAppsScript {
    namespace AnalyticsAdmin {
        namespace Accounts {
            function list(): { accounts: { name: string; displayName: string }[] };
        }
        namespace Properties {
            function list(params: { pageSize: number; filter: string }): { properties: { name: string; displayName: string }[] };
        }
    }

    namespace AnalyticsData {
        namespace Properties {
            function getMetadata(name: string): {
                dimensions: { displayName: string; apiName: string }[];
                metrics: { displayName: string; apiName: string }[];
            };
            function runReport(request: any, property: string): {
                rows: { dimensionValues: any; metricValues: any }[];
                dimensionHeaders: { name: string }[];
                metricHeaders: { name: string }[];
            };
        }
        function newRunReportRequest(): any;
    }
}

declare var AnalyticsAdmin: typeof GoogleAppsScript.AnalyticsAdmin;
declare var AnalyticsData: typeof GoogleAppsScript.AnalyticsData;
