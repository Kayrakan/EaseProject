import GoogleAnalytics from './components/Platforms/Google/GoogleAnalytics';
import GoogleAds from './components/Platforms/Google/GoogleAds';
import FacebookAds from "./components/Platforms/Meta/FacebookAds";
// import MetaAds from './components/Platforms/Meta/MetaAds';
import Adjust from './components/Platforms/Adjust/Adjust';

// Import other platform components as needed

const platformComponents: { [key: string]: React.ComponentType } = {
    ga4: GoogleAnalytics,
    google_ads: GoogleAds,
    facebook: FacebookAds,
    // Add other mappings here
    adjust: Adjust,

};

export default platformComponents;
