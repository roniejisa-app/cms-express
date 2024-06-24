// async newField(name, check = false, key) {
//     this[key] = await p.text({
//         message: name,
//     })
//     if (typeof this[key] === 'symbol') return false
//     if (!check) return

//     if (check) {
//         this.checkPathPlugin = fs.existsSync(
//             'platform/plugins/' + this[key]
//         )
//     }

//     if (check && this.checkPathPlugin) {
//         await p.outro(
//             color.red(`Plugin ${color.cyan(this[key])} đã tồn tại!`)
//         )
//         return await this.newField(name, check, key)
//     }
// }