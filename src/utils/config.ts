export default {
  local: {
    base_url: 'http://172.16.2.162:8000/api/',
    image_base_url: 'http://172.16.2.162:8000/',
    socketUrl: 'http://172.16.2.162:3000/',
    tearm:
      'http://172.16.2.162/global-ride/public/api/cms/terms-and-conditions',
    privacy: 'http://172.16.2.162/global-ride/public/api/cms/privacy-policy',
  },
  production: {
    base_url: 'https://global-ride.devtechnosys.tech/api/',
    image_base_url: 'https://global-ride.devtechnosys.tech/storage/',
    socketUrl: 'https://global-ride.devtechnosys.tech/',
    tearm:
      'https://global-ride.devtechnosys.tech/api/cms/terms-and-conditions',
    privacy: 'https://global-ride.devtechnosys.tech/api/cms/privacy-policy',
  },
  staging: {
    base_url: 'https://staging-api.bidbuyzoom.com/api/',
    image_base_url: 'https://staging-api.bidbuyzoom.com/',
    socketUrl: 'https://global-ride.devtechnosys.tech/',
    tearm:
      'https://global-ride.devtechnosys.tech/api/cms/terms-and-conditions',
    privacy: 'https://global-ride.devtechnosys.tech/api/cms/privacy-policy',
  },
}['staging'];
