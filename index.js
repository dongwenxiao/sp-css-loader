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

    // 是否可读
    // true => .name_d3ef
    // false=> .d3ef
    var readable = query.readable

    // md5 字符串wrapper的class名长度
    var length = query.length || 5

    // class名字自定义规则
    // TODO: 目前只支持1个规则: .component__[name]__ 其他规则用到的时候再扩展
    // .component => .af2e
    // .component__header__ => .header_af2e
    var pattern = query.pattern || '.component__[name]__'

    var md5Name = md5(content)
    var customNameMd5 = ''

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
        console.log('======================>  1')

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

        console.log('======================>  2')

        var root = postcss.parse(content)
        handleBackground(root)

        return `module.exports = {
            wrapper: '${md5Name}',
            css: '${JSON.stringify(root.toString())}'
        }`
    } else if (mode === 'replace') {

        console.log('======================>  3')
            // postcss 处理每一个class名字
        var root = postcss.parse(content)
        var once = true // 处理名字只处理1次
        root.walkRules((rule, i) => {

            // console.log(rule.selectors)

            // 排除@keyframe
            if (rule.parent.type == 'atrule' && rule.parent.name == 'keyframes')
                return

            // 每个class外面加1层class
            rule.selectors = rule.selectors.map(selector => {

                // 自定义class名，eg：  .component:custom{} =>  .custom_f22fs{}

                // console.log('every=====>', selector)
                if (~selector.indexOf('__component')) {

                    console.log('-=-=-=-=-=-=-=-=-=-=-')
                    console.log(selector)

                    // 获取自定义名

                    // .component  匿名
                    // .[name]__component  自定义+匿名

                    // if (once) {
                    //     customName = selector.split('__')[1]
                    //     md5Name = customName + '_' + md5Name

                    //     // 恢复成.component
                    //     once = false
                    //     // console.log('once')
                    // }else{
                    //     // console.log('other')
                    // }

                    let name = selector.match(/.[a-z]+__component/)[0]
                    // 去下划线前部分
                    customName = name.split('__')[0]
                    // 去掉第一个点
                    if(customName.charAt(0) == '.') customName = customName.replace('.', '')
                    // 可读class名拼接md5字符串
                    customNameMd5 = customName + '_' + md5Name
                    let patten = new RegExp(name,'g')
                    let result = selector.replace(patten, '.'+customNameMd5)


                    // console.log('selector:'+selector)
                    // console.log('md5Name:'+md5Name)
                    // console.log('customName:'+customName)
                    // console.log('customNameMd5:'+customNameMd5)
                    // console.log('patten:'+patten)
                    // console.log('result:'+result)

                    return result


                    // selector = selector.replace(`__${customName}`, '')
                        // console.log(selector)
                }


                // 每个组件默认有1个.component表示当前组件，用md5值替换他
                else if (~selector.indexOf('.component')) {
                    return selector.replace(/.component/g, '.' + md5Name)
                } else {
                    return `.${md5Name} ${selector}`
                }

            })
        })

        handleBackground(root)

        // 导出md5的class名字和处理后的css文本
        // 把单引号统一处理成双引号 "" -> ''

        let fileId = customNameMd5 || md5Name
        let result = `module.exports = {
            wrapper: '${fileId}',
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
    root.walkDecls(/^(background|border)/, decl => {

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