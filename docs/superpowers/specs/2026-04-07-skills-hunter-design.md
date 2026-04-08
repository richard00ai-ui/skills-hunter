# Skills Hunter — MVP 设计文档

**日期：** 2026-04-07
**状态：** 草稿 v2，待用户确认

---

## 1. 产品概述

Skills Hunter 是一个面向探索型 AI 开发者的 skill 发现与收集平台，类似 Product Hunt。用户可以发现热门 skills、按分类浏览、投票，并在每个 skill 下参与社区讨论。

**目标用户：** 使用 Claude Code、Cursor 等 AI 编程工具的开发者，想要发现和探索优质 skills。

---

## 2. MVP 功能范围

### 包含
- 首页：热榜（时间衰减排名）+ 分类目录导航
- 搜索：按名称 + 描述全文搜索，结果页支持按分类筛选
- Skill 卡片：视觉优先，展示名称、描述、标签、投票数、评论数、GitHub Stars
- Skill 详情页：完整信息 + 安装命令（一键复制）+ 评论区
- 用户系统：注册 / 登录（邮箱 + GitHub OAuth）
- 投票：登录用户每个 skill 可投一票，可撤销
- 评论：登录用户可在 skill 详情页发表评论
- 分类目录：预设固定分类，支持按分类筛选
- 数据抓取：手动触发脚本，从指定 GitHub 仓库批量导入 skills

### 不包含（下一迭代）
- 独立论坛版块
- 定时自动抓取 / 增量更新
- 用户个人主页
- skill 提交审核流程

---

## 3. 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | Next.js 14（App Router） |
| 样式 | Tailwind CSS |
| 数据库 + Auth | Supabase（PostgreSQL + Auth） |
| 部署 | Vercel |
| GitHub 数据抓取 | Node.js 脚本，使用 GitHub REST API |

---

## 4. 数据模型

### skills 表
```
id            uuid, primary key
skill_id      text, UNIQUE       -- 自然唯一键，格式为 {repo}/{name}，如 obra/superpowers/brainstorming
name          text               -- skill 名称，如 brainstorming
repo          text               -- 来源仓库，如 obra/superpowers
description   text               -- 来自 SKILL.md 的 description 字段
install_cmd   text               -- 安装命令，如 npx skills add obra/superpowers
category_id   uuid, FK           -- 所属固定分类（单个）
tags          text[]             -- 标签数组（多个）
github_stars  integer            -- 抓取时的 GitHub star 数
last_updated  timestamptz        -- GitHub 上的最近更新时间
created_at    timestamptz        -- 入库时间
vote_count    integer default 0  -- 投票总数（冗余字段，加速查询）
comment_count integer default 0  -- 评论总数（冗余字段，加速查询）
```

### categories 表（预设，人工维护）
```
id    uuid, primary key
name  text    -- 如：代码、写作、设计、研究、效率
slug  text    -- URL 用，如：code、writing、design
```

### votes 表
```
id         uuid, primary key
user_id    uuid, FK → users
skill_id   uuid, FK → skills
created_at timestamptz
UNIQUE(user_id, skill_id)   -- 每人每 skill 只能投一票
```

### comments 表
```
id         uuid, primary key
user_id    uuid, FK → users
skill_id   uuid, FK → skills
content    text
created_at timestamptz
```

---

## 5. 热榜排名算法

采用类 Hacker News 时间衰减公式：

```
score = votes / (age_hours + 2)^1.5
```

- `votes`：该 skill 的累计投票数
- `age_hours`：skill 入库后经过的小时数
- 新入库的 skill 天然有加分，随时间热度下降
- 分数在查询时实时计算（通过 Supabase SQL View），不存储 score 字段，避免时间衰减导致的数据过期问题
- `skills` 表去掉 `score` 字段，改为创建一个 `skills_ranked` view，供首页直接查询

---

## 6. 页面结构

### 首页 `/`
- 顶部导航：Logo、分类导航、登录 / 注册按钮
- 左栏（主区域）：热榜 skill 列表，按实时 score 降序，分页展示（每页 20 条）
- 右栏（侧边）：分类目录快速入口 + 本周新增数量

### 搜索结果页 `/search?q=`
- 按名称 + 描述全文搜索（Supabase 内置 `to_tsvector` 全文检索）
- 支持按分类筛选，支持按「最热」/ 「最新」排序

### 分类页 `/category/[slug]`
- 展示该分类下所有 skills，支持按「最热」/ 「最新」切换排序

### Skill 详情页 `/skill/[id]`
- 顶部：名称、描述、标签、投票按钮、GitHub Stars
- 中部：来源仓库链接、安装命令（一键复制）、最近更新时间、作者
- 底部：评论区（需登录才能发评论，匿名可浏览）

### 登录页 `/login`
- 邮箱 + 密码
- GitHub OAuth 登录

---

## 7. GitHub 数据抓取脚本

**运行方式：** 手动执行 `node scripts/crawl.js`

**流程：**
1. 读取配置文件 `scripts/sources.json`（记录要抓取的仓库列表，由用户维护）
2. 对每个仓库，调用 GitHub API 获取：
   - 仓库 star 数、最近更新时间
   - `skills/` 目录下所有子目录
   - 每个子目录的 `SKILL.md` 文件，解析 frontmatter 提取 `name`、`description`
3. 构造安装命令：`npx skills add {owner}/{repo}`
4. 写入 Supabase，以 `skill_id`（`{repo}/{name}`）为唯一键做 upsert：已存在则更新 stars 和 updated 时间，不存在则新增

**sources.json 示例：**
```json
[
  "obra/superpowers",
  "anthropics/skills"
]
```

---

## 8. 固定分类（初始版本）

初始版本预设 6 个分类：

| 分类 | slug | 说明 |
|------|------|------|
| 代码开发 | code | 编程、调试、重构相关 |
| 写作文档 | writing | 文档、提案、内容创作 |
| 设计 | design | UI、视觉、交互设计 |
| 研究分析 | research | 调研、数据分析 |
| 效率工具 | productivity | 流程自动化、任务管理 |
| 其他 | other | 不属于以上分类 |

---

## 9. 关键设计原则

- **卡片是广告牌，详情页是工具箱**：卡片专注视觉转化，安装命令等使用信息在详情页
- **数据先行**：MVP 上线前先跑一次抓取脚本填充真实数据，不用占位内容
- **登录门槛后置**：浏览和搜索完全匿名可用，只有投票和评论需要登录
