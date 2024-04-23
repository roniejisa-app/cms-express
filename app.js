require('dotenv').config();
const session = require('express-session');
var express = require('express');
var expressEjsLayout = require('express-ejs-layouts');
var path = require('path');
var { globSync } = require('glob');
var cookieParser = require('cookie-parser');
const flash = require('connect-flash');
var logger = require('morgan');
var indexRouter = require('./routes/index');
var authRouter = require("./routes/auth");
var adminRouter = require('./routes/admin');
var chatRouter = require('./routes/chat');
var apiRouter = require('./routes/api');
const passport = require('passport');
const { User, Role, ModulePermission, RoleModulePermission, Module, Permission } = require('./models/index');
// const { getAllPermissionOfUser } = require('./utils/permission');
const passportLocal = require("./passports/passport.local");
const authMiddleware = require("./middlewares/auth.middleware");
const passportGoogle = require('./passports/passport.google');
const validateMiddleware = require("./middlewares/validate.middleware");
const moduleListener = require('./listeners/module');
var app = express();
app.use(session({
    secret: "f8",
    resave: false,
    saveUninitialized: true
}))
moduleListener();
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(async function (id, done) {
    const user = await User.findOne({
        where: {
            id
        },
        include: {
            model: Role,
            as: "roles",
            include: {
                model: RoleModulePermission,
                as: 'roleModulePermissions',
                include: {
                    model: ModulePermission,
                    as: 'modulePermission',
                    include: [
                        {
                            model: Module,
                            as: 'module'
                        }, {
                            model: Permission,
                            as: 'permission'
                        }
                    ]
                }
            }
        }
    });
    done(null, user);
});

passport.use('local', passportLocal)
passport.use('google', passportGoogle)

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressEjsLayout);
app.set('layout', 'layouts/layout');
app.use(logger('dev'));
app.use(express.json({
    limit: "10tb"
}));
app.use(express.urlencoded({ extended: false, limit: '10tb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(validateMiddleware);
app.use('/', indexRouter);
app.use('/', authRouter);
app.use('/', chatRouter);
// Đăng ký các file tại đây
let files = globSync(process.cwd() + "/platform/*/routes/*").filter(file => {
    return (
        file.indexOf('.') !== 0 &&
        file.slice(-3) === '.js'
    );
})
for (let i = 0; i < files.length; i++) {
    const router = require(path.join(process.cwd(), files[i]));
    app.use('/', router);
}
// app.use(authMiddleware);
app.use('/admin', adminRouter);
app.use('/api', apiRouter);




app.use((error, req, res, next) => {
    switch (error.code) {
        case 'LIMIT_UNEXPECTED_FILE':
            return res.json({
                status: 100,
                message: "Chỉ được upload tối đa 50 File vào 1 thời điểm"
            })
    }
    console.log(error);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
