declare namespace GoogleAppsScript {
    namespace OAuth2 {
        interface OAuth2Service {
            setAuthorizationBaseUrl(url: string): OAuth2Service;
            setTokenUrl(url: string): OAuth2Service;
            setClientId(clientId: string): OAuth2Service;
            setClientSecret(clientSecret: string): OAuth2Service;
            setCallbackFunction(callbackFunctionName: string): OAuth2Service;
            setPropertyStore(propertyStore: GoogleAppsScript.Properties.PropertiesService): OAuth2Service;
            setScope(scope: string): OAuth2Service;
            setRedirectUri(redirectUri: string): OAuth2Service;
            handleCallback(callbackRequest: object): boolean;
            getAuthorizationUrl(): string;
            hasAccess(): boolean;
            getAccessToken(): string;
            getRefreshToken(): string;
            getExpirationTime(): number;
            reset(): void;
            getTokenType(): string; // Add this line

        }

        function createService(serviceName: string): OAuth2Service;
    }
}

declare var OAuth2: GoogleAppsScript.OAuth2;
