# Làm plugin thì phải có hướng dẫn sử dụng mới là plugin nhé 🤣

-   Cần cấu hình [type] trong quản trị thuộc kiểu [slug]
-   Kiểm tra xem đã có url dẫn dến controller hay chưa?

*   Chưa có thì thêm đoạn sau vào gần cuối trước đường dẫn 404

```
    router.get(/^\/(?!admin|grapes|api|crawler).*$/, async (req, res, next) => {
    const url = req.url.slice(1)
    const dataModule = await Link.findOne({
        where: {
            url,
        },
    })
    if (dataModule) {
        const controller = require(process.cwd() + dataModule.controller)
        if (controller[dataModule.method]) {
            return controller[dataModule.method](req, res, dataModule)
        }
        res.status(400).send('<h1>Not found</h1>')
    }
    next()
})
```
