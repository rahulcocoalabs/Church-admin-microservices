module.exports = {
    apps : [
    {
      name: 'Accounts Church-admin Microservices',
      script: 'accounts.service.js',
      // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      //cron_restart
      env: {
        NODE_ENV: 'development',
        port : 3031
      }
    },
    {
      name: 'Users church-app Microservices',
      script: 'users.service.js',
      // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      //cron_restart
      env: {
        NODE_ENV: 'development',
        port : 3032
      }
    },
    // {
    //   name: 'Events church-app Microservices',
    //   script: 'events.service.js',
    //   // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
    //   instances: 1,
    //   autorestart: true,
    //   watch: false,
    //   max_memory_restart: '1G',
    //   //cron_restart
    //   env: {
    //     NODE_ENV: 'development',
    //     port : 3033
    //   }
    // },
    // {
    //   name: 'Groups church-app Microservices',
    //   script: 'groups.service.js',
    //   // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
    //   instances: 1,
    //   autorestart: true,
    //   watch: false,
    //   max_memory_restart: '1G',
    //   //cron_restart
    //   env: {
    //     NODE_ENV: 'development',
    //     port : 3034
    //   }
    // },
    {
      name: 'Masters Church-admin Microservices',
      script: 'masters.service.js',
      // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      //cron_restart
      env: {
        NODE_ENV: 'development',
        port : 3035
      }
    },
    // {
    //   name: 'Buy/sell church-app Microservices',
    //   script: 'buyorsell.service.js',
    //   // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
    //   instances: 1,
    //   autorestart: true,
    //   watch: false,
    //   max_memory_restart: '1G',
    //   //cron_restart
    //   env: {
    //     NODE_ENV: 'development',
    //     port : 3036
    //   }
    // },
    {
      name: 'Feeds church-app Microservices',
      script: 'feeds.service.js',
      // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      //cron_restart
      env:  {
        NODE_ENV: 'development',
        port : 3037
      }
    },
    // {
    //   name: 'Matrimony church-app Microservices',
    //   script: 'matrimonies.service.js',
    //   // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
    //   instances: 1,
    //   autorestart: true,
    //   watch: false,
    //   max_memory_restart: '1G',
    //   //cron_restart
    //   env: {
    //     NODE_ENV: 'development',
    //     port : 3038
    //   }
    // },
    // {
    //   name: 'Blood-donation church-app Microservices',
    //   script: 'bloodDonation.service.js',
    //   // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
    //   instances: 1,
    //   autorestart: true,
    //   watch: false,
    //   max_memory_restart: '1G',
    //   //cron_restart
    //   env: {
    //     NODE_ENV: 'development',
    //     port : 3039
    //   }
    // },
    // {
    //   name: 'Charity church-app Microservices',
    //   script: 'charities.service.js',
    //   // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
    //   instances: 1,
    //   autorestart: true,
    //   watch: false,
    //   max_memory_restart: '1G',
    //   //cron_restart
    //   env: {
    //     NODE_ENV: 'development',
    //     port : 3040
    //   }
    // }
    ]
  };