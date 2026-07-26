# PrintNow — 微信云打印小程序

基于微信原生小程序 + 微信云开发的全栈云打印平台。

## 项目结构

`
PrintNow/
├── miniprogram-user/          # 用户端小程序
│   ├── pages/
│   │   ├── index/             # 首页（介绍+快速入口）
│   │   ├── upload/            # 文件上传+页数解析
│   │   ├── config/            # 打印参数设置
│   │   ├── confirm/           # 订单确认+微信支付
│   │   ├── orders/            # 我的订单列表
│   │   ├── order-detail/      # 订单详情+状态追踪
│   │   └── mine/              # 个人中心
│   └── app.js/app.json/app.wxss
│
├── miniprogram-merchant/      # 商家端小程序
│   ├── pages/
│   │   ├── hall/              # 订单大厅（接单入口）
│   │   ├── order-detail/      # 订单详情（文件预览+状态操作）
│   │   ├── processing/        # 进行中订单
│   │   ├── history/           # 历史订单
│   │   ├── stats/             # 收益统计+图表
│   │   └── settings/          # 店铺+价格+通知设置
│   └── app.js/app.json/app.wxss
│
└── cloudfunctions/            # 云函数
    ├── parseFile/             # 解析上传文件页数
    ├── createOrder/           # 创建订单+生成取件码
    ├── wxPay/                 # 微信支付统一下单
    ├── payCallback/           # 支付成功回调
    ├── getOrders/             # 订单列表查询
    ├── updateOrderStatus/     # 商家更新订单状态
    ├── sendSubscribeMsg/      # 订阅消息推送
    └── getStats/              # 收益统计查询
`

## 快速开始

### 1. 前置条件
- 注册微信小程序（需申请两个AppID：用户端+商家端）
- 开通微信云开发
- （可选）开通微信支付商户平台

### 2. 配置修改
替换以下文件中的占位值：
- miniprogram-user/app.js → 将 env: 'printnow-xxxxxx' 替换为你的云环境ID
- miniprogram-merchant/app.js → 同上
- miniprogram-user/project.config.json → 将 ppid 替换为你的AppID
- miniprogram-merchant/project.config.json → 同上

### 3. 云函数部署
在微信开发者工具中，右键每个云函数目录 → "上传并部署：云端安装依赖"

### 4. 数据库初始化
在云开发控制台创建以下集合：
- orders — 订单表
- users — 用户表
- config — 配置表

### 5. 消息模板
在微信公众平台配置订阅消息模板，将模板ID填入 sendSubscribeMsg/index.js

## 参考项目

| 项目 | 可借鉴内容 |
|------|-----------|
| [taro-cloud-print](https://github.com/hzm0321/taro-cloud-print) (⭐64) | PDF页数解析、云存储、微信支付 |
| [BluetoothPrinter-miniprogram-uniapp](https://github.com/sbcdyb123/BluetoothPrinter-miniprogram-uniapp) (⭐29) | 打印参数UI、订单流转 |
| [wechat-miniprogram-demos](https://github.com/ruanyf/wechat-miniprogram-demos) (⭐734) | 入门教程 |

## 技术栈
- 微信原生框架 (WXML + WXSS + JavaScript)
- 微信云开发 (云函数/云数据库/云存储/云调用)
- 微信支付
- 订阅消息推送

## License
MIT
