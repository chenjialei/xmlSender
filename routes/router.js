/**
 * Description: 总路由配置
 * User: ChenJiaLei
 * Date: 2017/10/30
 * Time: 14:53
 */

const fs = require("fs");
const path = require("path");
const log4js = require("koa-log4");
const logger = log4js.getLogger("Router");
const multer = require("koa-multer");
const Router = require("koa-router");

const uploadImagePath = "./../uploadTemplate/images";

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadImagePath);
    },
    filename: function (req, file, cb) {
        cb(null, "logo_" + Date.now() + ".jpg");
    }
});

const upload = multer({storage: storage});

//添加路由
function addMapping(router, mapping, prefix="") {
    for (let url in mapping) {
        logger.info("url:" + url);
        if (url.startsWith("GET ") || url.startsWith("get ")) {
            let path = prefix + url.substring(4);
            router.get(path, mapping[url]);
        } else if (url.startsWith("POST ") || url.startsWith("post ")) {
            let path = prefix + url.substring(5);
            if (typeof mapping[url] == "function") {
                router.post(path, mapping[url]);
            }
            if (typeof mapping[url] == "object") {
                logger.debug(path + "接口支持一个名称为" + mapping[url].fieldName + "表单单文件上传。");
                router.post(path, upload.single(mapping[url].fieldName), mapping[url].action);
            }
        } else if (url.startsWith("PUT ") || url.startsWith("put ")) {
            let path = prefix + url.substring(4);
            router.put(path, mapping[url]);
        } else if (url.startsWith("DELETE ") || url.startsWith("delete ")) {
            let path = prefix + url.substring(7);
            router.del(path, mapping[url]);
        } else {
            console.log(`invalid URL: ${url}`);
        }
    }
}
//读取文件，加载路由
async function addControllers(router, dir,prefix) {

    let controller_path = path.join(__dirname + "/" + dir);
    try {
        fs.readdirSync(controller_path).filter((f) => {
            return f.endsWith(".js");
        }).forEach(async (f) => {
            let mapping = require(controller_path + "/" + f);
            await addMapping(router, mapping,prefix);
        });
    } catch (e) {
        logger.error("项目路由信息加载失败！");
        logger.error(e);
    }
    //
    // if(typeof next=="function"){
    //     await next();
    // }
}

//导出，供其他文件使用
module.exports = function (mappingDir = ["controller", "protocol"], baseDir = "../bin/com/bohui/",prefix="/api") {

    let rootRouter = new Router();
    if (mappingDir instanceof Array) {
        for (let item of mappingDir) {
            if(item=="protocol"){
                //接收协议的入口，不需要追加前缀
                addControllers(rootRouter, baseDir + item,"").then(showResult(item,""));
                break;
            }
            //请求处理相关，需要追加前缀
            addControllers(rootRouter, baseDir + item,prefix).then(showResult(item,prefix));
        }
    } else {
        throw TypeError("确实参数，路由信息扫描失败！");
    }
    return rootRouter.routes();
};

function showResult(item,prefix){
    let prefixMessage=prefix?"统一追加的前缀prefix="+prefix:"没有追加统一的前缀。"
    logger.info(item+"下的路由信息扫描成功！"+prefixMessage);
}

