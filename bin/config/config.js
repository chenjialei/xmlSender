/**
 * Description: 配置文件
 * User: ChenJiaLei
 * Date: 2017/12/29
 * Time: 14:30
 */

const Config = {

    //读取的文件路径
    defaultDir: "C:/Users/ChenJiaLei/Desktop/新建文件夹/xml/",

    //读取的编码格式
    readEncoding: "gb2312",

    //发送的编码格式
    sendEncoding: "utf-8",

    //发送地址
    sendUrl: "http://172.17.35.17:8081/defaultReceive/Receive",

    //发送的时间间隔（秒）
    sendInterval: 0.01
};


module.exports = Config;