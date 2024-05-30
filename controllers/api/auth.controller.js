const { User, UserToken } = require('../../models')
const {
    createToken,
    createRefreshToken,
    hashToken,
} = require('../../utils/jwt')
const bcrypt = require('bcrypt')

const authController = {
    login: async (req, res) => {
        console.log(req.body)
        const { email, password } = req.body
        const user = await User.findOne({ where: { email } })
        if (!user) {
            return res.status(401).json({
                errors: {
                    status: 401,
                    message: 'Tài khoản hoặc mật khẩu không đúng',
                },
            })
        }

        if (!bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({
                errors: {
                    status: 401,
                    message: 'Mật khẩu không chính xác',
                },
            })
        }

        // Tạo JWT
        const token = createToken(user)
        const refreshToken = createRefreshToken(user)

        const hashedToken = hashToken(refreshToken)
        await UserToken.create({
            user_id: user.id,
            refresh_token: hashedToken,
            user_agent: req.headers['user-agent'],
            ip_address: req.ip.replace('::ffff:', ''),
        })

        return res.status(200).json({
            status: 200,
            message: 'Đăng nhập thành công!',
            data: {
                access_token: token,
                refresh_token: refreshToken,
            },
        })
    },
    refreshToken: async (req, res) => {
        const { refreshToken } = req.body
        if (!refreshToken) {
            return res.status(401).json({
                errors: {
                    status: 401,
                    message: 'Unauthorized',
                },
            })
        }
        const hashedToken = hashToken(refreshToken)

        const dataUserToken = await UserToken.findOne({
            where: {
                refresh_token: hashedToken,
            },
            include: {
                model: User,
                as: 'user',
            },
        })
        if (!dataUserToken) {
            return res.status(401).json({
                errors: {
                    status: 401,
                    message: 'Unauthorized',
                },
            })
        }

        const token = createToken(dataUserToken.user)
        const newRefreshToken = createRefreshToken(dataUserToken.user)
        const newHashedToken = hashToken(newRefreshToken)
        await UserToken.update(
            { refresh_token: newHashedToken },
            {
                where: {
                    id: dataUserToken.id,
                },
            }
        )

        return res.status(200).json({
            status: 200,
            message: 'Refresh token thành công',
            data: {
                access_token: token,
                refresh_token: newRefreshToken,
            },
        })
    },
    profile: async (req, res) => {
        const { id } = req.verified
        const user = await User.findOne({
            attributes: ['fullname', 'email', 'avatar'],
            where: {
                id: id,
            },
        })
        const userData = { ...user.dataValues }
        console.log()
        return res.status(200).json({
            status: 200,
            message: 'Success',
            data: {
                ...userData,
                avatar:
                    'https://localhost:3000/' +
                    JSON.parse(userData.avatar).path_absolute,
            },
        })
    },
}

module.exports = authController
