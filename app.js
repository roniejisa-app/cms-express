require('dotenv').config()
require('module-alias/register')
const i18n = require('i18n')
const session = require('express-session')
var express = require('express')
const cors = require('cors')
var expressEjsLayout = require('express-ejs-layouts')
var path = require('path')
var { sync } = require('glob')
var cookieParser = require('cookie-parser')
const flash = require('connect-flash')
var logger = require('morgan')
// Tối ưu http
const helmet = require('helmet')
// Cấu hình cache file
const compression = require('compression')
var indexRouter = require('./routes/index')
var authRouter = require('./routes/auth')
var adminRouter = require('./routes/admin/admin')
var chatRouter = require('./routes/chat')
var apiRouter = require('./routes/api/api')
var customRouter = require('./routes/custom')
var crawlerRouter = require('./routes/crawler')
const passport = require('passport')
const {
    User,
    Role,
    ModulePermission,
    RoleModulePermission,
    Module,
    Permission,
} = require('./models/index')
const passportLocal = require('./passports/passport.local')
const authMiddleware = require('./middlewares/auth.middleware')
const permissionMiddleware = require('@middlewares/permission.middleware')
const adminMiddleware = require('@middlewares/admin.middleware')
const passportGoogle = require('./passports/passport.google')
const validateMiddleware = require('./middlewares/validate.middleware')
const moduleListener = require('./listeners/module')
//Import load alias
const loadAlias = require('./alias/load')
const loadInstance = require("./system/loadInstance");

const Cache = require('./utils/cache')
const { CACHE_USER_LOGGED } = require('./constants/cache')
const cache = require('./utils/cache')
const loadService = require('./services/load')
const loadListener = require('./listeners/load')
var app = express()
app.use(
    session({
        secret: 'roniejisa-cms-express-js-mongodb-nodejs-postgresql',
        resave: false,
        saveUninitialized: true,
    })
)
//Đăng ký listener
moduleListener()
//Đăng ký aliases
loadAlias(app)
//Đăng ký các service phục vụ bảng quản trị,...
loadInstance(app)
app.use(
    cors({
        origin: process.env.DOMAIN_ORIGIN,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        preflightContinue: false,
        optionsSuccessStatus: 204,
    })
)
// Flash session
app.use(flash())

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

//Set layout
app.use(expressEjsLayout)
app.set('layout', 'layouts/layout')
app.use(logger('dev'))
app.use(
    express.json({
        limit: '10tb',
    })
)
app.use(express.urlencoded({ extended: false, limit: '10tb' }))
app.use(cookieParser())

const oneYear = 365 * 24 * 60 * 60 * 1000 // 1 year in milliseconds
app.use(
    express.static(path.join(__dirname, 'public'), {
        maxAge: oneYear,
        etag: true,
    })
)
app.use(compression())
// Đăng ký cho sử dụng các link vào
app.use(
    helmet({
        contentSecurityPolicy: false,
        // contentSecurityPolicy: {
        //     directives: {
        //         'img-src': [
        //             "'self'",
        //             'https://cdn.jsdelivr.net',
        //             'https://picsum.photos',
        //             'https://fastly.picsum.photos',
        //             'blob:',
        //             'https://www.svgrepo.com',
        //             'data:',
        //         ],
        //         'script-src': [
        //             "'self'",
        //             'https://cdn.jsdelivr.net',
        //             'https://cdn.tailwindcss.com/',
        //         ],
        //     },
        // },
    })
)
app.use(passport.initialize())
app.use(passport.session())

// Đăng ký các service trong plugin tại đây nhưng không được vượt validate
loadService(app)
// Đăng ký các listener
loadListener(app)
app.use(async (req, res, next) => {
    const langCurrent = await cache.get('lang', 'en')
    const { lang } = req.cookies
    const { lang: queryLang } = req.query
    const setLang = queryLang || langCurrent || lang || 'en'
    i18n.setLocale(setLang)
    res.cookie('lang', setLang, {
        maxAge: 365 * 24 * 60 * 60 * 1000,
    })
    next()
})

passport.serializeUser(function (user, done) {
    done(null, user.id)
})

passport.deserializeUser(async function (id, done) {
    const user = await Cache.findOrCreate(CACHE_USER_LOGGED + id, async () => {
        const user = await User.findOne({
            where: {
                id,
            },
            include: {
                model: Role,
                as: 'roles',
                include: {
                    model: RoleModulePermission,
                    as: 'roleModulePermissions',
                    include: {
                        model: ModulePermission,
                        as: 'modulePermission',
                        include: [
                            {
                                model: Module,
                                where: {
                                    active: true,
                                },
                                as: 'module',
                            },
                            {
                                model: Permission,
                                as: 'permission',
                            },
                        ],
                    },
                },
            },
        })
        return user
    })
    done(null, user)
})

passport.use('local', passportLocal)
passport.use('google', passportGoogle)

app.use(validateMiddleware)
app.use('/', indexRouter)
app.use('/', authRouter)
app.use('/', chatRouter)

// Đăng ký các file trong plugin tại đây nhưng không được vượt validate
let routeFiles = sync(process.cwd() + '/platform/plugins/*/routes/*').filter(
    (file) => {
        return (
            file.indexOf('.') !== 0 &&
            file.slice(-3) === '.js' &&
            file.indexOf('admin.js') === -1
        )
    }
)

for (let i = 0; i < routeFiles.length; i++) {
    const router = require(path.join(process.cwd(), routeFiles[i]))
    app.use('/', router)
}
app.use('/api', apiRouter)
app.use(customRouter)
// Nếu muốn fake thì phải comment lại middleware này
// app.use(authMiddleware, permissionMiddleware, adminMiddleware)
// Đăng ký các file trong plugin tại đây nhưng không được vượt validate
let adminFiles = sync(process.cwd() + '/platform/plugins/*/routes/*').filter(
    (file) => {
        return (
            file.indexOf('.') !== 0 &&
            file.slice(-3) === '.js' &&
            file.indexOf('admin.js') !== -1
        )
    }
)
for (let i = 0; i < adminFiles.length; i++) {
    const router = require(path.join(process.cwd(), adminFiles[i]))
    app.use(process.env.VITE_AP, router)
}
app.use(process.env.VITE_AP, adminRouter)
app.use('/crawler', crawlerRouter)

app.use((error, req, res, next) => {
    // logError('Lỗi trong file: ' + error)
    switch (error.code) {
        case 'LIMIT_UNEXPECTED_FILE':
            return res.json({
                status: 400,
                message: 'Chỉ được upload tối đa 50 File vào 1 thời điểm',
            })
    }
})

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (process.env.DEVELOPMENT == true) {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        return res.render('error', {
            message: err.message,
            error: err,
            layout:false,
            req
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {},
        layout:false,
        req,
    });
});

module.exports = app
