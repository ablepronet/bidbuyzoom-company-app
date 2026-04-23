import {get} from 'react-native/Libraries/NativeComponent/NativeComponentRegistry';
import config from '../utils/config';

export const BASE_URL = config?.base_url;
export const IMAGE_BASE_URL = config.image_base_url;
export const SOCKET_URL = config.socketUrl;
export const TEARM_CONDITION = config.tearm;
export const PRIVACY_POLICY = config.privacy;
export const HELP = 'https://staging.bidbuyzoom.com/help'

const apiEndPoints = {
  login: 'login',
  signup: 'sign-up',
  forgotPassword: 'forgot-password',
  getUserProfile: 'profile',
  getDashboardData: 'mobile/dashboard',
  verification: 'verify-login-2fa',
  verifyEmailOtp: 'verify-email-otp',
  resendEmailOtp: 'resend-email-otp',
  catalogData: 'mobile/catalog-list',
  getCatalogDetails:"mobile/catalog-item",
  getCatalogFields: 'mobile/catalog-fields',
  updateCatalogDetails: 'mobile/catalog-item/update',
  addCatalogData: 'mobile/catalog-item/add',
  lotImport:"lot-import",
  mobileBulkUpload:"catalog/mobile-bulk-upload"
};

export default apiEndPoints;
