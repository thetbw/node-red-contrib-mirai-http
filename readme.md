## node-red 的 qq机器人模块

### 安装
**前提条件**
* 已经部署了 mirai-console
* mirai-console 使用了 mirai-api-http 插件，详情见 [mirai-api-http](https://github.com/project-mirai/mirai-api-http)

```shell
cd ~/.node-red 
npm install node-red-contrib-mirai-http
```
> 模块讲使用payload作为消息输入，并且发送成功后原样返回 payload,可以使用catch来捕获异常

### 其他
* 帮助待完善

* chinese only