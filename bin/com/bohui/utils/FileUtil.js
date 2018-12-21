/**
 * Description: 文件通用工具类
 * User: ChenJiaLei
 * Date: 2017/12/26
 * Time: 19:46
 */


const log4js = require("koa-log4");
const logger = log4js.getLogger("FileUtil");
const fs = require("fs");
const path = require("path");
const config = require("../../../config/config");

let defaultDir = config.defaultDir;
let xmlArray;
let httpClient;


class FileUtil {

    constructor(xmlFile = []) {
        this.xmlFiles = xmlFile;
        this.count = 0;
    }

    async getXmlFiles() {
        return this.xmlFiles;
    }

    /**
     * 读取xml文件里的内容
     * @param filePath
     * @returns {Promise.<*>}
     */
    async readFile(filePath) {
        try {
            let xml = await fs.readFileSync(filePath);
            return xml;
        } catch (e) {
            logger.error(e);
        }
    }

    /**
     * 读取文件夹里包含的所有文件
     * @returns {Promise.<void>}
     */
    async readDir(fileDir) {
        try {
            if (!fileDir) {
                fileDir = defaultDir;
            }

            //同步读取文件夹里的文件
            let files = await fs.readdirSync(fileDir);

            //递归获取下面所有的xml文件
            files.forEach(async (file) => {
                if (file.indexOf(".xml") >= 0) {
                    //表明是xml文件
                    let filePath = fileDir + "/" + file;
                    this.xmlFiles.push(filePath);
                } else {
                    fileDir = defaultDir + "/" + file;
                    await this.readDir(fileDir);
                }
            });

        } catch (e) {
            logger.error(e);
        }
    }


    /**
     * 对xml文件进行处理。
     */
    async dealXml(xml) {
        xmlArray = [];
        await this.subXml(xml);

        httpClient = require("../protocol/HttpClient");

        await xmlArray.forEach(async (childXml) => {
            this.count ++;

            //调用发送方法
            await httpClient.send(childXml).catch((e) => {
                logger.error(e);
                throw e;
            });
        });
    }


    /**
     * 截取xml
     * @param xml
     * @returns {Promise.<void>}
     */
    async subXml(xml) {
        let msgEndIndex = xml.indexOf("</Msg>") + 6;

        //当前的xml内容
        let currentXml = xml.substring(0, msgEndIndex);
        xmlArray.push(currentXml);

        //截取xml剩下的部分
        let restXml = xml.substring(msgEndIndex, xml.length);
        if (restXml.indexOf("\n") === 0) {
            restXml = restXml.substring(1, restXml.length);
        }
        if (restXml.length > 0) {
            //递归算法
            await this.subXml(restXml);
        }
    }
}

module.exports = new FileUtil();