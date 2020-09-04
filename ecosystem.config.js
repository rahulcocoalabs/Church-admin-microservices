module.exports = {
    apps : [
    {
      name: 'Accounts church-admin Microservices',
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
      name: 'Users church-admin Microservices',
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
    {
      name: 'Events church-admin Microservices',
      script: 'events.service.js',
      // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      //cron_restart
      env: {
        NODE_ENV: 'development',
        port : 3033
      }
    },
    // {
    //   name: 'Groups church-admin Microservices',
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
    //   name: 'Buy/sell church-admin Microservices',
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
      name: 'Feeds church-admin Microservices',
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
    {
      name: 'Matrimony church-admin Microservices',
      script: 'matrimonies.service.js',
      // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      //cron_restart
      env: {
        NODE_ENV: 'development',
        port : 3038
      }
    },
    {
      name: 'Blood-donation church-admin Microservices',
      script: 'blooddonation.service.js',
      // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      //cron_restart
      env: {
        NODE_ENV: 'development',
        port : 3039
      }
    },
    {
      name: 'Charity church-admin Microservices',
      script: 'charities.service.js',
      // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      //cron_restart
      env: {
        NODE_ENV: 'development',
        port : 3040
      }
    },
    {
      name: 'Urogulf church-admin Microservices',
      script: 'urogulf.service.js',
      // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      //cron_restart
      env: {
        NODE_ENV: 'development',
        port : 3041
      }
    },
    {
      name: 'Sermons church-admin Microservices',
      script: 'sermons.service.js',
      // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      //cron_restart
      env: {
        NODE_ENV: 'development',
        port : 3042
      }
    },
    {
      name: 'LivePrayers church-admin Microservices',
      script: 'livePrayer.service.js',
      // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      //cron_restart
      env: {
        NODE_ENV: 'development',
        port : 3043
      }
    },
    {
      name: 'Ngos church-admin Microservices',
      script: 'ngos.service.js',
      // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      //cron_restart
      env: {
        NODE_ENV: 'development',
        port : 3044
      }
    },
    {
      name: 'Location church-admin Microservices',
      script: 'locations.service.js',
      // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      //cron_restart
      env: {
        NODE_ENV: 'development',
        port : 3045
      }
    }
    ]
  };