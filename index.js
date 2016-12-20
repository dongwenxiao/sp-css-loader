var postcss = require('postcss')
var loaderUtils = require("loader-utils")
var md5 = require('md5')

module.exports = function (content) {

    this.cacheable && this.cacheable()

    // md5后，class名字长度
    // 默认5个字符
    var query = loaderUtils.parseQuery(this.query)
    var length = query.length || 5
    var md5Name = md5(content).substr(0, length)

    // postcss 处理每一个class名字
    var root = postcss.parse(content)
    root.walkRules((rule, i) => {

        // 排除@keyframe
        if (rule.parent.type == 'atrule' && rule.parent.name == 'keyframes')
            return

        // 每个class外面加1层class
        rule.selectors = rule.selectors.map(selector => {
            return `.${md5Name} ${selector}`
        })
    })

    // 导出md5的class名字和处理后的css文本
    return `module.exports = {
        wapper: '${md5Name}',
        css: '${JSON.stringify(root.toString())}'
    }`
}