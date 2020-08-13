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
    // {
    //   name: 'Pasters church-app Microservices',
    //   script: 'pasters.service.js',
    //   // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
    //   instances: 1,
    //   autorestart: true,
    //   watch: false,
    //   max_memory_restart: '1G',
    //   //cron_restart
    //   env: {
    //     NODE_ENV: 'development',
    //     port : 3002
    //   }
    // },
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
    //     port : 3003
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
    //     port : 3004
    //   }
    // },
    // {
    //   name: 'Masters church-app Microservices',
    //   script: 'masters.service.js',
    //   // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
    //   instances: 1,
    //   autorestart: true,
    //   watch: false,
    //   max_memory_restart: '1G',
    //   //cron_restart
    //   env: {
    //     NODE_ENV: 'development',
    //     port : 3005
    //   }
    // },
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
    //     port : 3006
    //   }
    // },
    // {
    //   name: 'Feeds church-app Microservices',
    //   script: 'feeds.service.js',
    //   // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
    //   instances: 1,
    //   autorestart: true,
    //   watch: false,
    //   max_memory_restart: '1G',
    //   //cron_restart
    //   env: {
    //     NODE_ENV: 'development',
    //     port : 3007
    //   }
    // },
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
    //     port : 3008
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
    //     port : 3009
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
    //     port : 3010
    //   }
    // }
    ]
  };