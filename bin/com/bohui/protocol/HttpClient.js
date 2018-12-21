/**
 * Description: 协议发送通用类
 * User: ChenJiaLei
 * Date: 2017/12/27
 * Time: 19:30
 */

const log4js = require("koa-log4");
const logger = log4js.getLogger("FileUtil");
const xml2js = require("xml2js");
const http = require("axios");
const _ = require("underscore");
const iconv = require("iconv-lite");
const queryString = require("querystring");

const fileUtil = require("../utils/FileUtil");
const systemTask = require("../task/SystemTask");
const config = require("../../../config/config");

const sendUrl = config.sendUrl;
const sendEncoding = config.sendEncoding;
let header = {
    headers: {
        "Content-Type": "text/xml",
    }
};


/**
 * 定义协议发送通用类
 */
class HttpClient {


    /**
     * 初始化方法
     * @returns {Promise.<void>}
     */
    async init() {
        await fileUtil.readDir();
        let xmlFiles = await fileUtil.getXmlFiles();
        await systemTask.sendXmlProtocol(xmlFiles);
    }


    /**
     * 发送
     * @returns {Promise.<void>}
     */
    async send(xml) {

        try {
            console.log("发送的协议内容：\n" + xml);
            console.log("****************************************************");
            xml = iconv.encode(xml, sendEncoding);

            //执行真正的发送操作。
            http.post(sendUrl, xml, header).then((res) => {
                logger.info("send success......");
            }).catch((e) => {
                logger.error("send failed......");
            });
        } catch (e) {
            logger.error(e);
            throw e;
        }
    }


}


module.exports = new HttpClient();