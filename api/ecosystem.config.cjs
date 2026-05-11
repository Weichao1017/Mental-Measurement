// PM2 守护配置
// 用法（在服务器上）：
//   cd /www/wwwroot/assessment.ai1017.com/api
//   pm2 start ecosystem.config.cjs
//   pm2 save  # 持久化重启列表

module.exports = {
  apps: [
    {
      name: "mental-measurement-api",
      script: "node_modules/.bin/tsx",
      args: "src/index.ts",
      cwd: "/www/wwwroot/assessment.ai1017.com/api",
      env_file: ".env",
      autorestart: true,
      max_memory_restart: "256M",
      error_file: "/www/wwwlogs/mental-measurement-api.error.log",
      out_file: "/www/wwwlogs/mental-measurement-api.out.log",
      time: true,
    },
  ],
};
