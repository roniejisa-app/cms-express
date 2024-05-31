const { Job } = require('@models/index');
module.exports = {
    add: async (name, data) => {
        const jobContent = JSON.stringify({
            name, data
        })

        const job = await Job.create({
            content: jobContent
        })
    }
}