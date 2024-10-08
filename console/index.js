#!/usr/bin/env node

const MakePlugin = require('./commands/make-plugin')
const migrationDB = require('./commands/migration')
const MakeMigration = require('./commands/make-migration')
const ActivePlugin = require('./commands/active-plugin')
const MakeModel = require('./commands/make-model')
const MakeModelMongoDB = require('./commands/make-model-mongodb')

const p = require('@clack/prompts')
const color = require('picocolors')
async function askQuestion(question, answers) {
    const options = []
    answers.forEach((answer) => {
        options.push({ value: answer, label: answer })
    })

    const answer = await p.select({
        message: question,
        initialValue: '1',
        options: options,
    })
    return answer
}

async function main() {
    console.clear()
    p.intro(
        `${color.bgMagenta(
            color.black(
                ' Welcome. Let us find out how much of a CLI expert you REALLY are. '
            )
        )}`
    )
    const answer = await askQuestion('Bạn muốn dùng chức năng gì?', [
        'make:plugin',
        'active:plugin',
        'make:migration',
        'make:model',
        'make:model:mongodb',
        'migration',
    ])
    await types(answer)
}
// const argv = yargs(hideBin(process.argv)).argv
// const [type, ...params] = argv._

async function types(type) {
    switch (type) {
        case 'make:plugin':
            new MakePlugin()
            break
        case 'active:plugin':
            new ActivePlugin()
            break
        case 'migration':
            migrationDB()
            break
        case 'make:migration':
            new MakeMigration()
            break
        case 'make:model':
            new MakeModel()
            break
        case 'make:model:mongodb':
            new MakeModelMongoDB()
            break;
        default:
            p.outro(color.red('Type not found!'))
            return;
    }
}
main()
