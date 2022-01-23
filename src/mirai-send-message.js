const axios = require('axios').default;

/**
 * 创建 axios 实例
 * @param {IXMLDOMNode} node
 * @return {AxiosInstance}
 */
function createAxiosInstance(done, node) {
    let instance = axios.create();
    //注册全局错误处理
    instance.interceptors.response.use((response) => {
        if (response.data.code !== 0) {
            let errorMsg = "request error:" + response.data['msg']
            throw new Error(errorMsg);
        }
        return response
    }, error => {
        let errorMsg = "request error:" + error;
        throw new Error(errorMsg)
    })
    return instance;
}


module.exports = function (RED) {
    function MiraiSendMessageNode(config) {
        RED.nodes.createNode(this, config, "");
        let node = this;
        let serverConfig = RED.nodes.getNode(config.server);
        let target = config.target;
        let target_type = config.target_type;
        let send_type = config.send_type;

        node.on('input', async function (msg, send, done) {
            let request = createAxiosInstance(done, node);
            try {
                let message = msg.payload;
                this.status({fill: "green", shape: "dot", text: "start verify server"});
                this.log("start send mirai message,config is " + JSON.stringify(config));
                this.log("mirai server config:" + JSON.stringify(serverConfig));
                //校验key
                this.log("start verify key");
                let verifyResult = await request.post(serverConfig.server_url + "/verify", {verifyKey: serverConfig.server_key});
                let session = verifyResult.data.session;
                //绑定实例
                this.status({fill: "green", shape: "dot", text: "bind instance by " + serverConfig.main_bot_id});
                this.log("start bind instance by " + serverConfig.main_bot_id);
                await request.post(serverConfig.server_url + "/bind", {
                    sessionKey: session,
                    qq: serverConfig.main_bot_id
                })
                //开始发送消息
                this.status({fill: "green", shape: "dot", text: "send message"});
                //不同的发送类型
                let targetUrl = target_type === "group" ? "/sendGroupMessage" : "/sendFriendMessage";
                //消息类型
                let sendMessage = send_type == "text" ? [{type: "Plain", text: message}] : message;

                this.log("send message to " + target + ":" + JSON.stringify(sendMessage));
                await request.post(serverConfig.server_url + targetUrl, {
                    sessionKey: session,
                    target: target,
                    messageChain: sendMessage
                });
                this.status({fill: "green", shape: "dot", text: "release instance"});
                //销毁实例
                this.log("start release instance");
                await request.post(serverConfig.server_url + "/release", {
                    sessionKey: session,
                    qq: serverConfig.main_bot_id
                });
                //清除节点的状态
                this.status({});
                this.log("send mirai message success");
                send(msg)
                if (done) {
                    done();
                }
            } catch (e) {
                node.status({fill: "red", shape: "dot", text: e})
                if (done) {
                    done(e);
                }
                this.error(e)
            }

        });
    }

    RED.nodes.registerType("mirai-send-message", MiraiSendMessageNode);
}