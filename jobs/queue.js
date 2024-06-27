const Queue = require('bull')
const queueProvider = new Queue('cms_queues', 'redis://localhost:6379');
queueProvider.process((job, done) => {
    // Xử lý công việc cần queue tại đây
    done()
})

queueProvider.on('failed', (job, err) => {
    console.error(`Job failed with error ${err}`)
})

module.exports = queueProvider
