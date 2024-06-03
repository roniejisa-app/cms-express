export const style = `
*{
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    max-width: 100%;
}

ol, ul {
    padding-left: 1.5em;
}

.container{
    max-height: 600px;
    position: relative;
    overflow: auto;
    box-shadow: rgb(231, 231, 231) 0px 0px 0px 0.1em inset;
    border-radius: 6px;
    padding-bottom: 20px;
}
.toolbar {
    display: flex;
    align-items: center;
    padding: 10px;
    gap: 12px;
    flex-wrap: wrap;
    position: sticky;
    top: 0;
    left: 0;
    background: white;
    box-shadow: rgb(231, 231, 231) 0px 0px 0px 0.1em inset;
    border-radius: 6px;
}
.toolbar-group{
    display: flex;
    gap: 2px;
}
.toolbar select{
    border: none;
    background: none;
    border-radius: 6px;
    border: 1px solid #ccc;
    padding: 3px 5px;
}
.toolbar button {
    border: none;
    background: none;
    cursor: pointer;
    border-radius: 6px;
    padding: 3px 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid #ffffff; 
    transition: border-color 300ms ease, background-color 300ms ease;
}

.createLink.active,
.toolbar button.active{
    border-color: var(--color-main);
}

.createLink.active svg,
.toolbar button.active svg{
    fill: var(--color-main);
}

.toolbar button svg {
    transition: fill 300ms ease;
    width: 1rem;
    height: 1rem;
}
.content{
    word-break: break-word;
    min-height: 200px;
    outline: none;
    padding-bottom:30px;
    border-radius: 6px;
    padding:12px 15px;
}
input[type="color"]{
    background: none;
    border: none;
    max-width: 24px;
    min-height: 24px;
    cursor: pointer;
}

input[type="color" i]::-webkit-color-swatch {
    border-radius: 50%;
}
.createLink,
.insertImage{
    position: relative;
    cursor: pointer;
    border-radius: 6px;
    padding: 3px 5px;
    display: flex;
    align-items: center;
    border : 1px solid transparent;
}

.createLink svg,
.insertImage svg{
    width: 20px;
    height: 20px;
}

.insertImage ul{
    position: absolute;
    list-style: none;
    background: white;
    border: 1px solid #ccc;
    border-radius: 6px;
    margin: 0;
    box-shadow: rgb(231, 231, 231) 0px 0px 0px 0.1em inset;
    max-height: 200px;
    overflow-y: auto;
    top: 100%;
    min-width: 160px;
    right:0;
    padding-left:0;
    opacity: 0;
    visibility: hidden;
    transition: opacity 300ms ease, visibility 300ms ease;
}
.insertImage:hover ul{
    opacity: 1;
    visibility: visible;
}
.insertImage ul li{
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    padding: 6px 12px;
    transition: background 300ms ease, color 300ms ease;
}
.insertImage ul li *{
    pointer-events: none
}
.insertImage ul li:hover{
    background: var(--color-main);
    color: white;
}
.insertImage ul li svg{
    transition: fill 300ms ease;
}
.insertImage ul li:hover svg{
    fill: white
}
.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 10000;
    display: flex;
    justify-content: center;
    align-items: center;
}
.modal .modal-dialog{
    background: white;
    padding: 20px;
    border-radius: 6px;
    max-width: 400px;
    width: 100%;
}
.modal .modal-dialog .modal-header{
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.modal .modal-dialog .modal-header .close{
    cursor: pointer;
    border-radius: 50%;
    padding: 3px;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 24px;
    height: 24px;
    background: var(--color-main);
    color: var(--color-box);
    border: 1px solid var(--color-main);
    transition: background 300ms ease, color 300ms ease;
}

.modal .modal-dialog .modal-header .close:hover{
    background: var(--color-box);
    color: var(--color-main);
}

.modal form .form-group{
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin-bottom: 10px;
}

.modal form .form-group textarea,
.modal form .form-group input,
.modal form .form-group select{
    width: 100%;
    border: 1px solid #ccc;
    border-radius: 6px;
    padding: 8px 12px;
}

.modal form button{
    margin-top: 10px;
    width: 100%;
    border: 1px solid var(--color-main);
    border-radius: 6px;
    padding: 3px 5px;
    background: var(--color-main);
    color: var(--color-box);
    cursor: pointer;
    transition: background 300ms ease, color 300ms ease;
}

.modal form button:hover{
    background: var(--color-box);
    color: var(--color-main);
}
`
