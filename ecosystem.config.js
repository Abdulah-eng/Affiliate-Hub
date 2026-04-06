module.exports = {
  apps: [
    {
      name: 'affiliate-hub',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      cwd: './',
      instances: 1, // Can be changed to 'max' for cluster mode
      exec_mode: 'fork', // Can be changed to 'cluster' when instances > 1
      watch: false,
      env: {
        NODE_ENV: 'production',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
