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

class Question {
    constructor(question, answersArray, correctAnswerIndex) {
        this.question = question
        this.answersArray = answersArray
        this.correctAnswerIndex = correctAnswerIndex
    }
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
    const question1 = new Question("What's do")
    const answer = await askQuestion('Bạn muốn dùng chức năng gì?', [
        'make:plugin',
        'active:plugin',
        'make:migration',
        'make:model',
        'make:model:mongodb',
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
        case 'make:model:mongodb':
            if (params.length < 2 || params.length > 2) {
                console.log(`Argv gồm 2 phần là tên plugin và tên model!`)
            }
            new MakeModelMongoDB(params)
        default:
            console.log('Không tồn tại command này!')
    }
}

function text(message, validate) {
    p.log('Vui lòng nhập kiểu dữ liệu phù hợp:')
}

main()
