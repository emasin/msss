module.exports = {
  apps : [{
    name: "MSSS BE",
    script: "./dist/main.js",
    max_memory_restart: "3G",
    kill_timeout: 5000,
    env: {
      NODE_ENV: "dev",
    },
    env_staging:{
      NODE_ENV:"staging"
    },
    env_production: {
      NODE_ENV: "production",
    }
  }]
}
