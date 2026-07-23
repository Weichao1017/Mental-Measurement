# 数据安全与恢复预案（家庭沙龙问卷 / 收集本）

> 适用：assessment.ai1017.com 的「老师后端回收作答」收集本数据。
> 本文件不含任何密钥。看板密钥（ownerKey）只在你自己保存的看板链接里，切勿写进仓库。

## 一、数据在哪

| 位置 | 内容 | 说明 |
|---|---|---|
| `ash-root:/www/wwwroot/assessment.ai1017.com/api/data/collections/` | **生产数据** | `<id>.json` = 收集本元信息（含 ownerKey 的 sha256）；`<id>.ndjson` = 作答，一行一份 |
| `ash-root:/www/backup/mm-collections-snapshots/` | **服务器备份** | 每 15 分钟一个 tar.gz，保留约 30 天 |
| 本机 `~/mm-问卷备份/` | **离线副本（每 2 小时自动拉取）** | `latest/` 最新原始数据、`snapshots/` 历史快照（留 120 份）、`可读存档/` md+csv、`pull.log` 日志 |

作答本身是 base64url 编码的 payload（`d` 字段），解码后才是逐题答案。

## 二、备份机制（已实测在跑）

- 脚本：`/usr/local/bin/mm-collections-backup.sh`
- 定时：`/etc/cron.d/mm-collections-backup` → `*/15 * * * *`（每 15 分钟）
- 保留：最近 2880 份（约 30 天）
- **只读源、只写备份目录**，绝不修改生产数据
- **校验后才轮转**：新包 `gzip -t` 不通过就删掉它并退出，绝不让坏包挤掉好备份

自查一行命令（随时可跑）：

```bash
ssh ash-root 'ls -1t /www/backup/mm-collections-snapshots/*.tar.gz | head -3; echo "总数: $(ls -1 /www/backup/mm-collections-snapshots/*.tar.gz | wc -l)"; echo "生产份数: $(wc -l < /www/wwwroot/assessment.ai1017.com/api/data/collections/JG8J7YvoAn2c.ndjson)"'
```

## 三、恢复预案

### A. 作答数据损坏/丢失 → 从备份恢复（已演练验证可行）

```bash
# 1) 先看有哪些备份，挑一个出事前的时间点
ssh ash-root 'ls -1t /www/backup/mm-collections-snapshots/*.tar.gz | head -20'

# 2) 解到临时目录先看（不要直接盖生产）
ssh ash-root 'rm -rf /tmp/mm-restore && mkdir -p /tmp/mm-restore && tar -xzf /www/backup/mm-collections-snapshots/<选中的>.tar.gz -C /tmp/mm-restore && wc -l /tmp/mm-restore/collections/*.ndjson'

# 3) 确认无误后再恢复；恢复前务必先把现状另存一份
ssh ash-root 'cp -r /www/wwwroot/assessment.ai1017.com/api/data/collections /tmp/collections-before-restore-$(date +%s)'
# 然后再从 /tmp/mm-restore/collections/ 拷回目标文件
```

> 恢复后作答链接与看板链接**都不需要更换**（collectionId 不变）。

### B. 看板链接/密钥丢了 → 重建 meta 换新 ownerKey

服务器只存 ownerKey 的 sha256，原始密钥找不回。但可以就地重建同一个 collectionId 的 meta，
生成新的 ownerKey：**旧的作答链接继续有效，已收集的作答不受影响**，只是看板链接换新。
（做法：用 node 生成新随机 ownerKey → 写 sha256 进该 id 的 `.json` → 原子替换。`.ndjson` 一个字节都不要动。）

### C. 收集本 meta 被误删（作答文件还在）

同 B：重建同 id 的 `.json`（battery 填 `["salon-warmup"]`），作答链接立即恢复可用，
`.ndjson` 里已有的作答会重新出现在看板里。

## 四、红线（吃过亏的）

1. **`api/data/` 一律只读，绝不 rm/改写任何文件**——哪怕看起来像测试数据。
   2026-07-18 曾误删客户真实收集本，服务器是 XFS、无快照，救不回来。
2. 删任何东西前必须能第一手证明「这是我建的」；证不了就不动。
3. 部署**不会**碰数据：`deploy.sh` 只做 `git pull + npm ci + build + pm2 reload`，
   且 `api/.gitignore` 里有 `data/`，git 永远拉不到也覆盖不了它。
4. 改问卷结构有铁律：分享 payload 的答案是**按题号位置编码**的，
   **题号只增不删、不重排**；要下线某题就设 `hidden: true` 保留位置，
   否则已收集数据会整体错位。新题必须取比现有全部题号更大的 index。

## 五、本机自动离线备份（已装好，无需手动）

- 脚本：`~/bin/mm-pull-backup.sh`
- 定时：LaunchAgent `~/Library/LaunchAgents/com.weichao.mm-questionnaire-backup.plist`
  → **每 2 小时**跑一次 + **每次登录**跑一次（Mac 睡眠错过的，唤醒后补跑）
- 落地：`~/mm-问卷备份/`（`latest/` + `snapshots/` 留 120 份 + `可读存档/` + `pull.log`）
- 拉取失败（网络/SSH 闪断）会自动重试 3 次；仍失败则**保留既有备份不动**并记 FAIL 日志

> ⚠️ 备份根目录刻意**不放** `~/Documents`、`~/Downloads`、`~/Desktop`：
> 这三个是 macOS TCC 受保护目录，launchd 后台任务在里面会「手动能跑、定时静默失败」
> （已实际踩到并验证）。

随时手动补一次 / 查状态：

```bash
~/bin/mm-pull-backup.sh                 # 立刻拉一次
tail -5 ~/mm-问卷备份/pull.log           # 看最近几次结果
launchctl list | grep mm-questionnaire  # 看定时任务是否在册（第二列 0 = 上次成功）
```

重新生成可读存档（md 全文 + csv 汇总）：

```bash
cd "/Users/weichaowang/Ash for Chinese/Mental-Measurement"
npx tsx scripts/export-responses.mts ~/mm-问卷备份/latest ~/mm-问卷备份/可读存档
```
