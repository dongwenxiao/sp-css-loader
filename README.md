# wrapper-css-loader
把css内容加载对象并且用md5值做为外壳包装原有全部class，一般和postcss配合使用。
如:
```
{
    test: /\.css$/,
    loader: 'wrapper-css-loader?length=4!postcss-loader'
}
```
处理结果
```
// 导入样式
import css from './style.css'

/*
css 值如下
{
    wrapper: '9033df94d33a368c3b73',
    css: '.9033df94d33a368c3b73 .component { color: blue }'
}
*/
```

## 例子说明

使用前
```
.component {
    color: blue
}
```
使用后
```
.9033df94d33a368c3b73 .component {
    color: blue
}
```
## 参数设置

### length

```
wrapper-css-loader?length=4
```
> length 设置包装class名字的长度，
> 结果是 ```.9033 .component```

### wrapper

```
wrapper-css-loader?wrapper=true // 外面用class包装，适用于组件样式
wrapper-css-loader?wrapper=false // 外面不用包装，适用于全局样式

```

```
// 可以这样处理全局样式，把css扩展名特殊化，例如: .css -> .gcss 
{
    test: /\.gcss$/,
    loader: 'wrapper-css-loader?length=3&wrapper=false!postcss-loader'
}
```

## 注意

* length 必须大于1
* 在css文件中不能使用 ```@import```  [在postcss中加入postcss-import插件可以支持]
* css文本处理时候会自动把单引号处理成双引号``` '' -> "" ```


