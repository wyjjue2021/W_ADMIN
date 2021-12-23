<div align="center">多标签页后台管理模板</div>

<div align="center">
公司的脚手架都是基于dva开发，流程冗长，不太喜欢，开发此版mobx版本Antd多页签，用的舒服。

<br />

## 特性
- 🚅: 全站使用 `React Hooks` 开发，抛弃 `Class`
- 💎: 基于 `Ant Design` 体系精心设计
- 🚀: 使用 `React/Mobx/Antd` 等前端前沿技术开发

## 特点

- 多 tab 页签➕右键菜单，提升效率
- Mobx 状态管理
- 封装实用 axios 请求
- less➕css module 样式隔离
- 列表➕分页➕多选➕搜索联动组件
- 可自定义 webpack 配置➕优化打包

- 完整项目实现及模块结构拆分；

### 目录结构

```
├── build                   // webpack配置
│   ├── webpack.common.js   // webpack通用配置
│   ├── webpack.dev.js      // webpack开发环境配置
│   └── webpack.prod.js     // webpack生产环境配置
├── dist                    // 打包输出目录
├── public                  // 项目公开目录
├── src                     // src开发目录
│   ├── assets              // 静态资源
│   ├── components          // 公共组件
│   ├── layouts             // 页面布局组件
│   ├── modules             // 公共业务模块
│   ├── pages               // 具体业务页面
│   ├── routers             // 项目路由配置
│   ├── services            // axios服务等相关
│   ├── stores              // 全局公共 mobx store
│   ├── styles              // 存放公共样式
│   ├── utils               // 工具库/通用函数
│   ├── index.html          // 入口html页面
│   └── main.js             // 项目入口文件
├── .babelrc                // babel配置
├── .editorconfig           // 项目格式配置
├── .eslintrc.js            // ESLint配置
├── .gitignore              // git 忽略配置
├── .postcssrc.js           // postcss配置
├── package.json            // 依赖包配置
└── README.md               // 项目说明
```

## CLI 构建命令

```bash
yarn install
```

### 开发环境 启动运行

```bash
yarn start
```

### 生产环境 打包构建

```bash
yarn build  //生产环境 打包构建

yarn build:report // 图形化分析打包文件大小；

yarn build:watch // 方便排查生产环境打包后文件的错误信息（文件source map）；
```

## More
