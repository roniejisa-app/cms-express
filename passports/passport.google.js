var GoogleStrategy = require('passport-google-oauth2').Strategy;
require('dotenv').config();
const { User, Provider, Role, ModulePermission, RoleModulePermission, Module, Permission } = require('../models/index');
const { getAllPermissionOfUser } = require('../utils/permission');

module.exports = new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback",
    passReqToCallback: true,
    scope: ["profile", "email"]
},
    async function (request, accessToken, refreshToken, profile, done) {
        const { provider, email, given_name: name } = profile;
        const [newProvider, created] = await Provider.findOrCreate({
            where: {
                name: provider
            },
            defaults: {
                name: provider,
                created_at: new Date(),
                updated_at: new Date()
            }
        });

        if (!newProvider) {
            return done(null, false, {
                message: "Provider không tồn tại!"
            });
        }

        let [user, createdUser] = await User.findOrCreate({
            where: {
                email
            },
            defaults: {
                email,
                fullname: name,
                provider_id: newProvider.id,
                status: true
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
        if (createdUser) {
            const [role, createdRole] = await Role.findOrCreate({
                where: {
                    name: "member",
                },
                defaults: {
                    name: "member",
                    created_at: new Date(),
                    updated_at: new Date(),
                }
            })
            if (role) {
                user.addRoles([role])
            }
        }

        if (!user) {
            return done(null, false, {
                message: "Đã có lỗi xảy ra. Vui lòng thử lại!"
            })
        }
        if (createdUser) {
            user = await User.findOne({
                where: {
                    id: user.id
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
            })
        }
        const permission = getAllPermissionOfUser(user);
        return done(null, user, permission);
    }
)