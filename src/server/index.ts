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


//check google oauth
import {
  updateConnectedPlatforms,

} from './Auth/checkGoogleAuth.ts'

//property service
import {
  addConnectedPlatform,
  removeConnectedPlatform,
  getConnectedPlatformSettings,
  getConnectedPlatforms,
  deleteAllUserProperties
} from './propertyService.ts'

//facebook
import {
  getOAuthServiceFacebook,
  authCallbackFacebook,
  getFacebookOAuthURL,
  resetFacebookOAuth,
} from './Auth/facebook.ts'

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

  //facebook
  getOAuthServiceFacebook,
  authCallbackFacebook,
  getFacebookOAuthURL,
  resetFacebookOAuth,

  //property service
  addConnectedPlatform,
  removeConnectedPlatform,
  getConnectedPlatformSettings,
  getConnectedPlatforms,
  deleteAllUserProperties

};
