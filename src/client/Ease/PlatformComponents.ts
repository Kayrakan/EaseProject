import GoogleAnalytics from './components/Platforms/Google/GoogleAnalytics';
import GoogleAds from './components/Platforms/Google/GoogleAds';
// Import other platform components as needed

const platformComponents: { [key: string]: React.ComponentType } = {
    ga4: GoogleAnalytics,
    google_ads: GoogleAds,
    // Add other mappings here
};

export default platformComponents;
