/**
 * 服务器的配置文件
 */
module.exports = function (RED) {
    function MiraiServerConfigNode(n) {
        RED.nodes.createNode(this, n);
        //服务器url
        this.server_url = n.server_url;
        //服务器key
        this.server_key = n.server_key;
        //当前主qq的qq号
        this.main_bot_id = n.server_main_bot_id;
    }

    RED.nodes.registerType("mirai-server-config", MiraiServerConfigNode);
}