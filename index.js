var postcss = require('postcss')
var loaderUtils = require("loader-utils")
var md5 = require('md5')

module.exports = function (content) {

    this.cacheable && this.cacheable()

    content = content.replace(/\'/g, '\"')
    
    // md5后，class名字长度
    // 默认5个字符
    var query = loaderUtils.parseQuery(this.query)

    // replace|wrapper|none
    // replace 是否把样式替换md5值，替换 .page => .c2d3
    // wrapper 是把样式外包一层， .page => .c2d3 .page
    // none 是什么都不做，md5仍然做  .page => .page
    var mode = query.mode

    // md5 字符串wrapper的class名长度
    var length = query.length || 5
    
    var md5Name = md5(content)

    // 强制第一位是字母
    var firstChat = md5Name.match(/[a-zA-Z]{1}/)[0]
    
    // md5 后去掉length-1个字符
    var otherChats = md5Name.substr(0, length - 1)

    // 以字符开通的class名
    md5Name = firstChat + otherChats

    // 强制第一位是字母
    // var chars = 'a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z'
    // chars = chars.split(',').concat(chars.toUpperCase().split(','))
    // var firstChat = chars[Math.floor(Math.random() * chars.length)]

    if(mode === 'wrapper') {
        
        // postcss 处理每一个class名字
        var root = postcss.parse(content)
        root.walkRules((rule, i) => {

            // 排除@keyframe
            if (rule.parent.type == 'atrule' && rule.parent.name == 'keyframes')
                return

            // 每个class外面加1层class
            rule.selectors = rule.selectors.map(selector => {
                // 如果是全局css，则不做wrapper处理
                return `.${md5Name} ${selector}`
            })
        })

        // 导出md5的class名字和处理后的css文本
        // 把单引号统一处理成双引号 "" -> ''
        return `module.exports = {
            wrapper: '${md5Name}',
            css: '${JSON.stringify(root.toString())}'
        }`
    } else if(mode === 'none') {
        return `module.exports = {
            wrapper: '${md5Name}',
            css: '${JSON.stringify(content)}'
        }`
    } else if (mode === 'replace') {
        // postcss 处理每一个class名字
        var root = postcss.parse(content)
        root.walkRules((rule, i) => {

            // 排除@keyframe
            if (rule.parent.type == 'atrule' && rule.parent.name == 'keyframes')
                return

            // 每个class外面加1层class
            rule.selectors = rule.selectors.map(selector => {
                // 每个组件默认有1个.component表示当前组件，用md5值替换他
                return selector.replace(/.component/g, '.' + md5Name)
            })
        })

        // 导出md5的class名字和处理后的css文本
        // 把单引号统一处理成双引号 "" -> ''
        return `module.exports = {
            wrapper: '${md5Name}',
            css: '${JSON.stringify(root.toString())}'
        }`
    } else {

    }
}