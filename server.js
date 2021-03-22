var http = require('http')
var fs = require('fs')
var url = require('url')
var port = process.argv[2]
var qiniu = require("qiniu");
if (!port) {
    console.log('请指定端口号好不啦？\nnode server.js 8888 这样不会吗？')
    process.exit(1)
}

var server = http.createServer(function(request, response) {
    var parsedUrl = url.parse(request.url, true)
    var pathWithQuery = request.url
    var queryString = ''
    if (pathWithQuery.indexOf('?') >= 0) { queryString = pathWithQuery.substring(pathWithQuery.indexOf('?')) }
    var path = parsedUrl.pathname
    var query = parsedUrl.query
    var method = request.method

    /******** 从这里开始看，上面不要看 ************/

    console.log('有个傻子发请求过来啦！路径（带查询参数）为：' + pathWithQuery)

    if (path === '/uptoken') {
        response.statusCode = 200;
        response.setHeader("Access-Control-Allow-Origin", "*");
        // 读取文件 得到accesskey,secreKey
        var json = fs.readFileSync('./qiniu-key.json');
        let config = JSON.parse(json);
        let { accessKey, secretKey } = config;
        var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
        var options = {
            scope: "自己在qiniu文件中",
        };
        var putPolicy = new qiniu.rs.PutPolicy(options);
        var uploadToken = putPolicy.uploadToken(mac);

        // 处理浏览器限制 data问题
        response.removeHeader("Data");
        response.write({
            "uptoken": `${uploadToken}`
        });
        response.end();
    }
    /******** 代码结束，下面不要看 ************/
});

server.listen(port)
console.log('监听 ' + port + ' 成功\n请用在空中转体720度然后用电饭煲打开 http://localhost:' + port)