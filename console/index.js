#!/usr/bin/env node
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const MakePlugin = require('./commands/make-plugin')
const migrationDB = require('./commands/migration')
const MakeMigration = require('./commands/make-migration')
const ActivePlugin = require('./commands/active-plugin')
const MakeModel = require('./commands/make-model')
const argv = yargs(hideBin(process.argv)).argv
const [type, ...params] = argv._

switch (type) {
    case 'make:plugin':
        if (!params.length) {
            console.log('Vui lòng chuyền param!')
            return false
        }
        new MakePlugin(params)
        break
    case 'active:plugin':
        if (!params.length) {
            console.log('Vui lòng chuyền param!')
            return false
        }
        new ActivePlugin(params)
        break
    case 'migration':
        migrationDB()
        break
    case 'make:migration':
        if (params.length < 2 || params.length > 2) {
            console.log('Argv gồm 2 phần là tên plugin và tên migration!')
            return false
        }
        new MakeMigration(params)
        break
    case 'make:model':
        if (params.length < 2 || params.length > 2) {
            console.log('Argv gồm 2 phần là tên plugin và tên model!')
            return false
        }
        new MakeModel(params)
        new MakeMigration(params)
        break
    default:
        console.log('Không tồn tại command này!')
}
