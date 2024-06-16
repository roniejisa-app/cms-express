require('dotenv').config()
require('module-alias/register')
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
    Link,
} = require('./models/index')
const passportLocal = require('./passports/passport.local')
const authMiddleware = require('./middlewares/auth.middleware')
const passportGoogle = require('./passports/passport.google')
const validateMiddleware = require('./middlewares/validate.middleware')
const moduleListener = require('./listeners/module')
//Import load alias
const loadAlias = require('./alias/load')
const Cache = require('./utils/cache')
const { CACHE_USER_LOGGED } = require('./constants/cache')
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
app.use(
    cors({
        origin: '*',
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
        contentSecurityPolicy: {
            directives: {
                'img-src': [
                    "'self'",
                    'https://cdn.jsdelivr.net',
                    'https://picsum.photos',
                    'https://fastly.picsum.photos',
                    'blob:',
                    'https://www.svgrepo.com',
                    'data:',
                ],
                'script-src': [
                    "'self'",
                    'https://cdn.jsdelivr.net',
                    'https://cdn.tailwindcss.com/',
                ],
            },
        },
    })
)
app.use(passport.initialize())
app.use(passport.session())

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
// Đăng ký các file tại đây
let files = sync(process.cwd() + '/platform/plugins/*/routes/*').filter(
    (file) => {
        return file.indexOf('.') !== 0 && file.slice(-3) === '.js'
    }
)
for (let i = 0; i < files.length; i++) {
    const router = require(path.join(files[i]))
    app.use('/', router)
}
app.use(authMiddleware)
app.use('/admin', adminRouter)
app.use('/crawler', crawlerRouter)
app.use('/api', apiRouter)
app.use('/', customRouter)

app.use((error, req, res, next) => {
    switch (error.code) {
        case 'LIMIT_UNEXPECTED_FILE':
            return res.json({
                status: 400,
                message: 'Chỉ được upload tối đa 50 File vào 1 thời điểm',
            })
    }
})

// error handler
app.use((err, req, res, next) => {
    console.error(err.stack) // Ghi log lỗi ra console
    res.status(err.status || 500).json({
        error: {
            message: err.message || 'Internal Server Error',
            status: err.status || 500,
        },
    })
})

module.exports = app
