# wapper-css-loader
把css内容加载对象并且用md5值做为外壳包装原有全部class，一般和postcss配合使用。
如:
```
{
    test: /\.css$/,
    loader: 'wapper-css-loader?length=4!postcss-loader'
}
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

```
wapper-css-loader?length=4
```
> length 设置包装class名字的长度，
> 结果是 ```.9033 .component```



## 注意

在css文件中不能使用 ```@import```
