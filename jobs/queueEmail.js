const Queue = require('bull')
const sendMail = require('../utils/mail')
const queueEmailProvider = new Queue('cms_emails', 'redis://localhost:6379')
queueEmailProvider.process(async (job) => {
    const { data } = job
    await sendMail(data.to, data.subject, data.message)
})

queueEmailProvider.on('failed', (job, err) => {
    console.error(`Job failed with error ${err}`)
})

module.exports = queueEmailProvider
