const notify = {
    template: (type, message) => {
        document.body.querySelector('[notify]')?.remove();

        const divContainer = document.createElement('div');
        divContainer.setAttribute('notify', '');
        Object.assign(divContainer.style, {
            position: 'fixed',
            top: '30px',
            right: '30px',
            width: '300px',
            minHeight: '60px',
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden',
            zIndex: 999999
        })
        const divMessage = document.createElement('div');
        Object.assign(divMessage.style, {
            position: 'relative',
            width: '100%',
            padding:"3px",
            borderRadius: '6px'
        });
        divMessage.innerHTML = `
            <div style="display:flex;background:white;align-items:center; border-radius:6px;height:60px;border-radius:6px;box-shadow:1px 1px 2px">
                <div style="border-top-left-radius:6px;border-bottom-left-radius:6px;background:${type === 'success' ? 'green' : 'red'};width:10px;height:100%"></div>
                <div style="flex:1; padding: 0 20px;color:${type === 'success' ? 'green' : 'red'};border-top-right-radius:6px;border-bottom-right-radius:6px">${message}</div>
            </div>
        `
        divContainer.append(divMessage)
        divMessage.animate([
            {
                transform: `translateX(100%) rotate(5deg)`
            }, {
                transform: `translateX(0%)`
            }
        ], {
            duration: 400,
            fill: 'forwards',
            easing: 'ease-in-out'
        }).finished.then(item => {
            setTimeout(() => {
                divMessage.animate([
                    {
                        transform: `translateX(0%)`,
                        opacity: 1,
                    }, {
                        transform: `translateX(100%) rotate(-5deg)`,
                        opacity: 0,
                    }
                ], {
                    duration: 300,
                    fill: 'forwards',
                    easing: 'ease-in-out'
                }).finished.then(item => {
                    divContainer.remove();
                });
            }, 3000);
        });


        document.body.append(divContainer)
    },
    success: (message) => {
        notify.template('success', message);
    },
    error: (message) => {
        notify.template('error', message);
    }
}

export default notify;