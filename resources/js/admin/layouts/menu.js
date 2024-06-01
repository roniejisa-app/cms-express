const MENU = (() => {
    const classMenuSmall = 'menu-small'
    const toggleBtn = document.querySelector('.toggle-sidebar')
    if (!toggleBtn) return false
    const listCollapse = document.querySelectorAll('.collapse-menu')
    for (const collapse of listCollapse) {
        const handleCollapseMouseMove = function () {
            if (!document.body.classList.contains(classMenuSmall)) return false
            const ul = collapse.nextElementSibling
            ul.classList.add('show')
            const handleMouseMove = () => {
                ul.classList.add('show')
            }
            ul.addEventListener('mousemove', handleMouseMove)
            const handleMouseLeave = function (e) {
                ul.classList.remove('show')
                ul.removeEventListener('mousemove', handleMouseMove)
                ul.removeEventListener('mouseleave', handleMouseLeave)
            }
            ul.addEventListener('mouseleave', handleMouseLeave)
        }
        collapse.addEventListener('mousemove', handleCollapseMouseMove)
    }

    document.addEventListener('mousemove', (e) => {
        e.preventDefault()
        for (const collapse of listCollapse) {
            const ul = collapse.nextElementSibling
            if (
                e.target.closest('ul') === ul ||
                e.target.closest('.collapse-menu')
            )
                return
            ul.classList.remove('show')
        }
    })
    return {
        init: () => {
            toggleBtn.onclick = () => {
                document.body.classList.toggle(classMenuSmall)
                document.cookie = `smallMenu=${
                    document.body.classList.contains(classMenuSmall) ? 1 : 0
                }; path=/;`
                if (document.body.classList.contains(classMenuSmall)) {
                    for (const collapse of listCollapse) {
                        const ul = collapse.nextElementSibling
                        ul.classList.remove('show')
                    }
                }
            }
        },
    }
})()

export default MENU
