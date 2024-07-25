import {
  onOpen,
  openDialog,
  openDialogBootstrap,
  openDialogMUI,
  openEase,
  openDialogTailwindCSS,
  openAboutSidebar,
} from './ui';

import { getSheetsData, addSheet, deleteSheet, setActiveSheet, getCurrentUser } from './sheets';


//ga4
import {
  listGoogleAnalyticsAccounts,
  listGoogleAnalyticsProperties,
  getGoogleAnalyticsPropertyMetadata,
  fetchGoogleAnalyticsData,
} from './Google/Analytics/ga4';

//facebook ads
import {
  fetchFacebookAdsData,
  fetchFacebookReportStatus,
  fetchFacebookReportResults,
  getFacebookAvailableFields,
  fetchFacebookAdAccounts,
  fetchFacebookAvailableFields,
} from './Meta/FacebookAds.ts';


//adjust
import {
  getAdjustOptions,
  pullAdjustData,
  fetchEvents,
} from './Adjust/Adjust.ts';

import {
  saveAdjustApiKey,
  getAdjustApiKeys,
  deleteAdjustApiKey,
} from './Properties/adjust/adjust.ts';


//check google oauth
import {
  updateConnectedPlatforms,
  authorizeServices,

} from './Auth/checkGoogleAuth.ts';

//property service
import {
  addConnectedPlatform,
  removeConnectedPlatform,
  getConnectedPlatformSettings,
  getConnectedPlatforms,
  deleteAllUserProperties,
  addGa4UserSavedSettings,
  removeGa4UserSavedSettings,
} from './propertyService.ts';

//facebook properties
import {
  getSavedTemplates,
  saveTemplate,
  deleteTemplate,
} from './Properties/facebook/facebookProperties.ts';

//facebook
import {
  getOAuthServiceFacebook,
  authCallbackFacebook,
  getFacebookOAuthURL,
  resetFacebookOAuth,
  getConnectedFacebookAccounts,
} from './Auth/facebook.ts';



import { storeUserOauthInfo, getUserOauthInfo } from './firebaseService';

// Example functions to store and retrieve OAuth tokens
function storeGoogleAnalyticsToken(userId: string, token: string) {
  return storeUserOauthInfo(userId, 'google_analytics', { token });
}

function getGoogleAnalyticsToken(userId: string) {
  return getUserOauthInfo(userId, 'google_analytics');
}


// Public functions must be exported as named exports
export {
  onOpen,
  openDialog,
  openDialogBootstrap,
  openDialogMUI,
  openEase,
  openDialogTailwindCSS,
  openAboutSidebar,
  getSheetsData,
  addSheet,
  deleteSheet,
  setActiveSheet,
  getCurrentUser,

  //ga4
  listGoogleAnalyticsAccounts,
  listGoogleAnalyticsProperties,
  getGoogleAnalyticsPropertyMetadata,
  fetchGoogleAnalyticsData,

  storeGoogleAnalyticsToken,
  getGoogleAnalyticsToken,

  //check google oauth
  updateConnectedPlatforms,
  authorizeServices,

  //facebook oauth
  getOAuthServiceFacebook,
  authCallbackFacebook,
  getFacebookOAuthURL,
  resetFacebookOAuth,
  getConnectedFacebookAccounts,

  //facebook ads
  fetchFacebookAdsData,
  fetchFacebookReportStatus,
  fetchFacebookReportResults,
  getFacebookAvailableFields,
  fetchFacebookAdAccounts,
  fetchFacebookAvailableFields,


  //property service
  addConnectedPlatform,
  removeConnectedPlatform,
  getConnectedPlatformSettings,
  getConnectedPlatforms,
  deleteAllUserProperties,
  addGa4UserSavedSettings,
  removeGa4UserSavedSettings,

  //adjust
  getAdjustOptions,
  pullAdjustData,
  fetchEvents,

  //adjust properties
  saveAdjustApiKey,
  getAdjustApiKeys,
  deleteAdjustApiKey,

  //facebook properties
  getSavedTemplates,
  saveTemplate,
  deleteTemplate,
};
