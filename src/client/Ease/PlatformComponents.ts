import GoogleAnalytics from './components/Platforms/Google/GoogleAnalytics';
import GoogleAds from './components/Platforms/Google/GoogleAds';
// import MetaAds from './components/Platforms/Meta/MetaAds';

// Import other platform components as needed

const platformComponents: { [key: string]: React.ComponentType } = {
    ga4: GoogleAnalytics,
    google_ads: GoogleAds,
    // meta_ads: MetaAds,
    // Add other mappings here
};

export default platformComponents;
