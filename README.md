# 玩具桌面植物小队

一个面向儿童、偏玩具桌面风格的浏览器塔防原型。项目使用 TypeScript、Vite、Phaser 和 Three.js，把可玩的 2D 防线棋盘与轻量 3D 桌面动效结合在一起。

这是一个私人同人原型项目，不隶属于 Plants vs. Zombies、PopCap 或 EA。项目刻意不使用官方受保护的游戏美术、音频、名称和 UI 素材。素材来源与处理说明记录在 [docs/asset-sources.md](docs/asset-sources.md)。

## 功能

- 三个可游玩关卡，支持轻松和普通两种难度。
- 植物卡牌包含向日葵、豌豆射手、坚果墙、寒冰射手和土豆雷。
- 完整防线流程：阳光经济、卡牌冷却、敌人波次、胜利、失败、重开和关卡推进。
- Phaser 游戏画布配合 DOM HUD 覆盖层。
- Three.js 表现层用于阳光硬币、波次警告、种植反馈、通关徽章和棋盘景深动效。
- 使用 Web Audio 生成轻量音效，并提供声音开关。
- 提供减少动态效果选项，方便获得更柔和的视觉体验。
- 使用 Vitest 覆盖规则、HUD、素材映射、音频和表现层辅助逻辑。

## 快速开始

安装依赖：

```bash
npm ci
```

启动本地开发服务：

```bash
npm run dev
```

默认访问地址：

```text
http://127.0.0.1:5173/
```

如果 `5173` 已被占用，Vite 会自动改用下一个可用端口，并在终端里显示实际地址。

构建生产版本：

```bash
npm run build
```

运行测试：

```bash
npm test
```

## 项目结构

- `src/game/`：游戏规则、场景代码、素材映射、音频和 Three.js 表现层辅助逻辑。
- `src/ui/`：DOM HUD 覆盖层，包括控制按钮、提示文案和状态面板。
- `src/assets/`：项目使用的本地、生成式和开放许可视觉素材。
- `docs/`：素材来源、路线图和实现计划记录。
- `output/`：本地验证输出，目前主要是 Playwright 截图。该目录已被 Git 忽略，运行、构建和测试都不需要它。

## 许可证

代码使用 MIT 许可证，详见 [LICENSE](LICENSE)。

素材可能有各自的来源和使用说明。若要在本原型之外复用素材，请先查看 [docs/asset-sources.md](docs/asset-sources.md)。
