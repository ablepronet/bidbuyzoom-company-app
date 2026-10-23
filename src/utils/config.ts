/**
 * Which servers the app talks to. Use 'staging' for testing and switch to 'production'
 * only for App Store / Google Play release builds.
 */
const APP_ENV: 'local' | 'staging' | 'production' = 'production';

const environments = {
  local: {
    base_url: 'http://172.16.2.27:3004/api/',
    image_base_url: 'http://172.16.2.27:3004/',
    web_base_url: 'http://172.16.2.27:3000',
    socketUrl: 'http://172.16.2.27:3004/',
    tearm: 'http://172.16.2.27:3004/api/cms/terms-and-conditions',
    privacy: 'http://172.16.2.27:3004/api/cms/privacy-policy',
  },
  staging: {
    base_url: 'https://staging-api.bidbuyzoom.com/api/',
    image_base_url: 'https://staging-api.bidbuyzoom.com/',
    web_base_url: 'https://staging.bidbuyzoom.com',
    socketUrl: 'https://staging-api.bidbuyzoom.com/',
    tearm: 'https://staging-api.bidbuyzoom.com/api/cms/terms-and-conditions',
    privacy: 'https://staging-api.bidbuyzoom.com/api/cms/privacy-policy',
  },
  production: {
    base_url: 'https://api.bidbuyzoom.com/api/',
    image_base_url: 'https://api.bidbuyzoom.com/',
    web_base_url: 'https://app.bidbuyzoom.com',
    socketUrl: 'https://api.bidbuyzoom.com/',
    tearm: 'https://api.bidbuyzoom.com/api/cms/terms-and-conditions',
    privacy: 'https://api.bidbuyzoom.com/api/cms/privacy-policy',
  },
};

export default environments[APP_ENV];
