export default {
  local: {
    base_url: 'http://172.16.2.162:8000/api/',
    image_base_url: 'http://172.16.2.162:8000/',
    web_base_url: 'http://172.16.2.162:8000',
    socketUrl: 'http://172.16.2.162:3000/',
    tearm:
      'http://172.16.2.162/global-ride/public/api/cms/terms-and-conditions',
    privacy: 'http://172.16.2.162/global-ride/public/api/cms/privacy-policy',
  },
  production: {
    base_url: 'https://global-ride.devtechnosys.tech/api/',
    image_base_url: 'https://global-ride.devtechnosys.tech/storage/',
    web_base_url: 'https://bidbuyzoom.com',
    socketUrl: 'https://global-ride.devtechnosys.tech/',
    tearm:
      'https://global-ride.devtechnosys.tech/api/cms/terms-and-conditions',
    privacy: 'https://global-ride.devtechnosys.tech/api/cms/privacy-policy',
  },
  staging: {
    base_url: 'https://api.bidbuyzoom.com/api/',
    image_base_url: 'https://api.bidbuyzoom.com/',
    web_base_url: 'https://app.bidbuyzoom.com',
    socketUrl: 'https://api.bidbuyzoom.com/',
    tearm:
      'https://api.bidbuyzoom.com/api/cms/terms-and-conditions',
    privacy: 'https://api.bidbuyzoom.com/api/cms/privacy-policy',
  },
}['staging'];
