var postcss = require('postcss')
var loaderUtils = require("loader-utils")
var md5 = require('md5')

var collection = []
var sameIndex = 0

module.exports = function(content) {


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

    // 去重
    var flag = true
    while (flag) {
        flag = !!~collection.indexOf(md5Name)
        if (flag) {
            md5Name += (sameIndex + '')
            sameIndex++
        }
    }

    var customName = ''

    //
    if (mode === 'wrapper') {

        // postcss 处理每一个class名字
        var root = postcss.parse(content)
        root.walkRules((rule, i) => {

            // 排除@keyframe
            if (rule.parent.type == 'atrule' && rule.parent.name == 'keyframes')
                return

            /* 这段代码未测试，后续如果用，可开启并测试一下 */
            // // 每个class外面加1层class
            // rule.selectors = rule.selectors.map(selector => {

            //     // 自定义class名，eg：  .component:custom{} =>  .custom_f22fs{}
            //     if (~selector.indexOf('.component:')) {
            //         // 获取自定义名
            //         customName = selector.split(':')[1] 
            //         md5Name = customName + '_' + md5Name
            //         // 恢复成.component
            //         selector = '.component'
            //     }

            //     // 如果是全局css，则不做wrapper处理
            //     return `.${md5Name} ${selector}`
            // })
        })

        handleBackground(root)

        // 导出md5的class名字和处理后的css文本
        // 把单引号统一处理成双引号 "" -> ''
        return `module.exports = {
            wrapper: '${md5Name}',
            css: '${JSON.stringify(root.toString())}'
        }`
    } else if (mode === 'none') {

        var root = postcss.parse(content)
        handleBackground(root)

        return `module.exports = {
            wrapper: '${md5Name}',
            css: '${JSON.stringify(root.toString())}'
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

                // 自定义class名，eg：  .component:custom{} =>  .custom_f22fs{}
                if (~selector.indexOf('.component:')) {
                    // 获取自定义名
                    customName = selector.split(':')[1] 
                    md5Name = customName + '_' + md5Name
                    // 恢复成.component
                    selector = '.component'
                }


                // 每个组件默认有1个.component表示当前组件，用md5值替换他
                if (~selector.indexOf('.component')) {
                    return selector.replace(/.component/g, '.' + md5Name)
                } else {
                    return `.${md5Name} ${selector}`
                }

            })
        })

        handleBackground(root)

        // 导出md5的class名字和处理后的css文本
        // 把单引号统一处理成双引号 "" -> ''
        let result = `module.exports = {
            wrapper: '${md5Name}',
            css: '${root.toString()}'
        }`

        // result = result.replace(/\r\n/gi, '').replace(/\n/gi, '')
        result = result
            .replace(/(\r\n)|(\n)|(\/\*[\S\s]+?\*\/)|(\/\/)|(\s*;\s*(})\s*)|(\s*([{},;:])\s*)/gi, '$6$8')
            .replace(/\s{2,}/gi, ' ')

        return result
    } else {

    }

    collection.push(md5Name)
}

function handleBackground(root) {

    // 处理背景图片
    root.walkDecls(/^background/, decl => {

        // 匹配到background中的url()
        var matches = decl.value.match(/url\((.*?)\)/)

        if (matches && matches.length > 1) {
            var v = matches[1]

            decl.value = decl.value.replace(v, (m) => {

                // 双引号变单引号
                m = m.replace(/\"/g, '\'')
                if (m.indexOf('\'') < 0) {
                    m = `\'${m}\'`
                }

                return "' +  require(" + m + ") + '"
            })
        }
    })
}