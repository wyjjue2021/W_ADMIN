
//获取参数的工具箱
const _loaderUtils = require("loader-utils");

const _schemaUtils = require("schema-utils");

//获取文件标识
const mime = require("mime");

const schema = {
    type: "object",
    properties: {
        limit: {
            type: ["number", "string"]
        },
    }
};

function getFilePath(buffer) {
    //生成一个新的图片, 添加到最终资源中, 并返回路径 

    //interpolateName获取文件的hash值，并插入值,生成唯一的文件名
    var filename = _loaderUtils.interpolateName(this, "[contenthash:5].[ext]", {
        content: buffer
    })
    // emitFile 能够让开发者更方便的输出一个 file 文件，这是 webpack 特有的方法，使用的方法也很直接
    //发射文件，会在dist目录下面生成一个文件
    this.emitFile(filename, buffer)
    return filename;
}

function loader(source) {

    //获取参数
    let options = (0, _loaderUtils.getOptions)(this);

    (0, _schemaUtils.validate)(schema, options, 'img-loader');

    const { limit = 0 } = options
    //获取图片的类型
    const mimetype = mime.getType(this.resourcePath);
    //如果文件大小小于limit,则使用base64
    if (source.length < limit) {
        //组装base64
        let base64 = `data:${mimetype};base64,${source.toString('base64')}`;
        //最后必须修改文件的路径
        return `module.exports = ${JSON.stringify(base64)}`;
    } else {
        //使用file-loader
        src = getFilePath.call(this, source);
        return `module.exports=\`${src}\``;
    }
}

loader.raw = true; //把文件转成二进制流


module.exports = loader;
