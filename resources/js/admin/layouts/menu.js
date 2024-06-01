const MENU = (() => {
    const menu = document.querySelector('.menu-admin')
    const toggleBtn = document.querySelector('.toggle-sidebar')
    if(!menu) return false;
    return {
        init: () => {
            toggleBtn.onclick = (e) => {
                menu.classList.toggle('show')
                document.cookie = `smallMenu=${
                    menu.classList.contains('show') ? 1 : 0
                }; path=/;`
            }
        },
    }
})()

export default MENU
