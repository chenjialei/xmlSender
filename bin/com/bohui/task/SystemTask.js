/**
 * Description: 定时任务
 * User: ChenJiaLei
 * Date: 2017/12/27
 * Time: 20:00
 */

const logger = require("koa-log4").getLogger("SystemTask");
const http = require("axios");
const schedule = require("node-schedule");
const path = require("path");
const fs = require("fs");
const childProcess = require("child_process");
const os = require("os");
const iconv = require("iconv-lite");
const xml2js = require("xml2js");
const _ = require("underscore");

const fileUtil = require("../utils/FileUtil");
const config = require("../../../config/config");

const sendInterval = config.sendInterval;
const readEncoding = config.readEncoding;

const constant = {
    second: 1001,//秒
    minute: 1005,//每分钟
    hour: 1010,//小时
};

class SystemTask {

    constructor(xmlIndex = 0, unit = constant.second) {
        this.xmlIndex = xmlIndex;
        this.unit = unit;
    }

    /**
     * 设置定时任务的时间间隔
     * @param interval
     * @param unit
     * @returns {Promise.<Array>}
     */
    async createTable(interval, unit = constant.second) {
        let result = [];
        switch (unit) {
            case constant.minute://传入的参数是分钟，需要将每一个小时等分
            case constant.second://传入参数是秒，需要每一秒等分，算法相同
                let count = 60 / interval;
                for (let index = 0; index < count; index++) {
                    result.push(index * interval);
                }
                break;
        }
        return result;
    }

    /**
     * 发送协议的方法
     * @param xmlFiles
     * @param interval
     * @param url
     * @returns {Promise.<void>}
     */
    async sendXmlProtocol(xmlFiles) {
        try {
            /*let interval = sendInterval;

             let second = await this.createTable(interval, this.unit);

             //设定定时器规则
             let rule = new schedule.RecurrenceRule();
             rule.second = second;

             let job = schedule.scheduleJob(rule, async () => {
             let xmlPath = xmlFiles[this.xmlIndex];
             console.log("文件路径：" + xmlPath);

             let xml = await fileUtil.readFile(xmlPath);
             xml = iconv.decode(xml, readEncoding);
             console.log("xml文件内容：\n" + xml);

             await fileUtil.dealXml(xml);

             this.xmlIndex++;
             if (this.xmlIndex >= xmlFiles.length) {
             console.log("所有文件已读取完毕。。。");
             job.cancel();
             }
             });*/

            setTimeout(async () => {
                await this.scheduleJob(xmlFiles);
            }, 0);

        } catch (e) {
            logger.error(e);
            throw e;
        }
    }


    async scheduleJob(xmlFiles) {
        try {
            let xmlPath = xmlFiles[this.xmlIndex];
            console.log("文件路径：" + xmlPath);

            let xml = await fileUtil.readFile(xmlPath);
            xml = iconv.decode(xml, readEncoding);
            console.log("xml文件内容：\n" + xml);

            await fileUtil.dealXml(xml);

            this.xmlIndex++;

            if (this.xmlIndex >= xmlFiles.length) {
                console.log("所有文件已读取完毕。。。");
                console.log("xml个数：" + fileUtil.count);
            } else {
                setTimeout(async () => {
                    await this.scheduleJob(xmlFiles);
                }, 1000 * sendInterval);
            }
        } catch (e) {
            logger.error(e);
            throw e;
        }
    }


}


module.exports = new SystemTask();