const TOOLTIP = (() => {
    const tooltips = document.querySelectorAll('[tooltip]')
    return {
        init: () => {
            let tooltipEl = document.createElement('div')
            tooltipEl.className = 'tooltip'
            Object.assign(tooltipEl.style, {
                position: 'absolute',
                top: 0,
                left: 0,
                background: '#000',
                color: '#fff',
                padding: '5px 10px',
                borderRadius: '5px',
                fontSize: '12px',
                opacity: 0,
                transition: 'opacity 300ms ease-in-out',
                pointerEvents: 'none',
                zIndex: 9999,
                whiteSpace: 'nowrap',
                maxWidth: '200px',
                visibility: 'hidden',
                textAlign: 'center',
                boxShadow: '1px 1px 3px #333',
                userSelect: 'none',
            })
            document.body.appendChild(tooltipEl)

            for (const tooltip of tooltips) {
                tooltip.addEventListener('mouseenter', (e) => {
                    tooltipEl.innerHTML = ''
                    const text = tooltip.getAttribute('tooltip')
                    const rect = tooltip.getBoundingClientRect()
                    Object.assign(tooltipEl.style, {
                        visibility: 'visible',
                        opacity: 1,
                        top: rect.top + rect.height + 5 + 'px',
                        left:
                            rect.left +
                            rect.width / 2 -
                            tooltipEl.offsetWidth / 2 +
                            'px',
                    })
                    tooltipEl.innerHTML = text
                })

                tooltip.addEventListener('mouseleave', (e) => {
                    Object.assign(tooltipEl.style, {
                        visibility: 'hidden',
                        opacity: 0,
                    })
                })
            }
        },
    }
})()
export default TOOLTIP
