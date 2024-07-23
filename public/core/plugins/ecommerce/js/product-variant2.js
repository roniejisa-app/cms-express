const h=()=>Math.random().toString(36).toString(36).substring(2)+new Date().getTime().toString(36).substring(2),d=function(s=!1){const t=document.createElement("div");return t.className="item",t.innerHTML=`<div class="image" style="display:${s?"flex":"none"}">
                            <svg class="theme-arco-icon theme-arco-icon-file_image index__uploadIcon--9CPqD"
                                width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M10.6664 7.83334C11.4947 7.83334 12.1662 7.16185 12.1662 6.33353C12.1662 5.5052 11.4947 4.83371 10.6664 4.83371C9.8381 4.83371 9.16661 5.5052 9.16661 6.33353C9.16661 7.16185 9.8381 7.83334 10.6664 7.83334Z"
                                    fill-opacity="1"></path>
                                <path
                                    d="M1.33423 4.33377C1.33423 3.22934 2.22955 2.33401 3.33398 2.33401H12.6662C13.7706 2.33401 14.6659 3.22934 14.6659 4.33377V11.6662C14.6659 12.7706 13.7706 13.666 12.6662 13.666H3.33398C2.22955 13.666 1.33423 12.7706 1.33423 11.6662V4.33377ZM3.33398 3.66719C2.96584 3.66719 2.6674 3.96563 2.6674 4.33377V8.84411L3.96551 7.546C4.6915 6.82001 5.86858 6.82001 6.59458 7.546L11.3814 12.3328H12.6662C13.0343 12.3328 13.3328 12.0344 13.3328 11.6662V4.33377C13.3328 3.96563 13.0343 3.66719 12.6662 3.66719H3.33398ZM2.6674 11.6662C2.6674 12.0344 2.96584 12.3328 3.33398 12.3328H9.49598L5.65188 8.4887C5.44652 8.28334 5.11356 8.28334 4.9082 8.4887L2.6674 10.7295V11.6662Z"
                                    fill-opacity="1"></path>
                            </svg>
                            <span class="index__uploadHint--ZZSk8">Upload image</span>
                        </div>
                        <div class="content">
                            <div class="content-info">
                                <input type="text" placeholder="Add another value" />
                                <div class="action">
                                    <svg delete-item
                                        class="theme-arco-icon theme-arco-icon-delete w-16 h-16 mr-16 text-gray-3 fill-current cursor-pointer"
                                        width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M7.08333 6.62728C7.26743 6.62728 7.41667 6.77652 7.41667 6.96061V10.9606C7.41667 11.1447 7.26743 11.2939 7.08333 11.2939H6.58333C6.39924 11.2939 6.25 11.1447 6.25 10.9606V6.96061C6.25 6.77652 6.39924 6.62728 6.58333 6.62728H7.08333zM9.41667 11.2939C9.60076 11.2939 9.75 11.1447 9.75 10.9606V6.96061C9.75 6.77652 9.60076 6.62728 9.41667 6.62728H8.91667C8.73257 6.62728 8.58333 6.77652 8.58333 6.96061V10.9606C8.58333 11.1447 8.73257 11.2939 8.91667 11.2939H9.41667z"
                                            fill-opacity="1"></path>
                                        <path
                                            d="M5.41667 2.62728C5.41667 1.75283 6.12555 1.04395 7 1.04395H9C9.87445 1.04395 10.5833 1.75283 10.5833 2.62728V3.29395H13.6667C13.8508 3.29395 14 3.44318 14 3.62728V4.29395C14 4.47804 13.8508 4.62728 13.6667 4.62728H12.9776L12.4171 12.3868C12.3935 12.7147 12.373 12.9988 12.3374 13.2326C12.2997 13.4802 12.2383 13.7245 12.1044 13.9573C11.9038 14.3064 11.6024 14.5868 11.2397 14.7619C10.9979 14.8786 10.7498 14.9222 10.5 14.942C10.2643 14.9606 9.97955 14.9606 9.65082 14.9606H6.34901C6.02029 14.9606 5.73548 14.9606 5.49975 14.942C5.25003 14.9222 5.00194 14.8786 4.76007 14.7619C4.39741 14.5868 4.09603 14.3064 3.89535 13.9573C3.76151 13.7245 3.70013 13.4802 3.66242 13.2326C3.62682 12.9988 3.60631 12.7147 3.58264 12.3868L3.02223 4.62728H2.33333C2.14924 4.62728 2 4.47804 2 4.29395V3.62728C2 3.44318 2.14924 3.29395 2.33333 3.29395H5.41667V2.62728ZM4.35904 4.62728L4.91074 12.2663C4.9367 12.6257 4.95386 12.8565 4.98056 13.0318C5.00602 13.1991 5.03321 13.2614 5.05131 13.2929C5.11821 13.4092 5.21867 13.5027 5.33955 13.561C5.37227 13.5768 5.43635 13.5994 5.605 13.6128C5.78179 13.6268 6.01328 13.6273 6.3736 13.6273H9.62619C9.98651 13.6273 10.218 13.6268 10.3948 13.6128C10.5634 13.5994 10.6275 13.5768 10.6602 13.561C10.7811 13.5027 10.8816 13.4092 10.9485 13.2929C10.9666 13.2614 10.9938 13.1991 11.0192 13.0318C11.0459 12.8565 11.0631 12.6257 11.089 12.2663L11.6408 4.62728H4.35904ZM9.41667 2.62728C9.41667 2.39716 9.23012 2.21061 9 2.21061H7C6.76988 2.21061 6.58333 2.39716 6.58333 2.62728V3.29395H9.41667V2.62728Z"
                                            fill-opacity="1"></path>
                                    </svg>
                                    <svg drag-item fill="none" stroke="currentColor" stroke-width="4"
                                        viewBox="0 0 48 48" aria-hidden="true" focusable="false"
                                        class="w-16 h-16 text-gray-3 fill-current cursor-move theme-arco-icon theme-arco-icon-drag-dot-vertical">
                                        <path fill="currentColor" stroke="none"
                                            d="M17 8h2v2h-2V8ZM17 23h2v2h-2v-2ZM17 38h2v2h-2v-2ZM29 8h2v2h-2V8ZM29 23h2v2h-2v-2ZM29 38h2v2h-2v-2Z">
                                        </path>
                                        <path
                                            d="M17 8h2v2h-2V8ZM17 23h2v2h-2v-2ZM17 38h2v2h-2v-2ZM29 8h2v2h-2V8ZM29 23h2v2h-2v-2ZM29 38h2v2h-2v-2Z">
                                        </path>
                                    </svg>
                                </div>
                            </div>
                        </div>`,t},v=function(){const s=document.createElement("div");return s.className="variant-item",s.innerHTML=`<div class="product-variant-items">
            <div class="product-variant-header">
                <div class="variant-item-top">
                    <span class="text-required">*</span>
                    <span class="text-variant-name">Variation Name</span>
                    <div class="tooltip">
                        <svg class="theme-arco-icon theme-arco-icon-question_circle" width="1em" height="1em" viewBox="0 0 16 16" fill="var(--theme-arco-color-text-3)" xmlns="http://www.w3.org/2000/svg" style="stroke: unset">
                            <path d="M7.11875 9.35063V7.5968L7.71608 7.5648C8.49475 7.5328 9.00787 7.10843 9.00787 6.45996 9.00787 5.81149 8.56942 5.45729 7.89742 5.45729 7.24675 5.45729 6.72008 5.77596 6.60275 6.49063L5.16675 6.25729C5.34808 4.93463 6.42542 4.16663 8.01475 4.16663 9.51088 4.16663 10.5654 5.05196 10.5654 6.41729 10.5654 7.51596 9.8403 8.30435 8.70808 8.51863V9.35063H7.11875zM6.87341 10.908C6.87341 10.332 7.31075 9.89463 7.89742 9.89463 8.48408 9.89463 8.91075 10.332 8.91075 10.908 8.91075 11.4733 8.48408 11.9106 7.89742 11.9106 7.31075 11.9106 6.87341 11.4733 6.87341 10.908z" fill-opacity="1"></path>
                            <path d="M0.666748 7.99996C0.666748 3.94987 3.94999 0.666626 8.00008 0.666626C12.0502 0.666626 15.3334 3.94987 15.3334 7.99996C15.3334 12.05 12.0502 15.3333 8.00008 15.3333C3.94999 15.3333 0.666748 12.05 0.666748 7.99996ZM8.00008 14C11.3138 14 14.0001 11.3137 14.0001 7.99996C14.0001 4.68625 11.3138 1.99996 8.00008 1.99996C4.68637 1.99996 2.00008 4.68625 2.00008 7.99996C2.00008 11.3137 4.68637 14 8.00008 14Z" fill-opacity="1"></path>
                        </svg>
                        <ul class="tooltip-show">
                            <li>
                                You can add up to 3 variations (such as
                                color, size, etc.).
                            </li>
                            <li>
                                Set the most important variation as the
                                first one and add corresponding product
                                image for different variations instead
                                of using the same image for all of them.
                            </li>
                        </ul>
                    </div>
                </div>
                <div class="variant-item-action">
                    ${p()}
                </div>
            </div>
            <div>
                <div class="group-product-variant">
                    <input type="text" placeholder="Select or enter a variation" variant-item="">
                    <div class="option-suggestion">
                        <ul>
                            <li>Color</li>
                            <li>Size</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div variant-options>
                <div class="variant-item-top">
                    <span class="text-required">*</span>
                    <span class="text-variant-name">Options</span>
                    <div class="tooltip">
                        <svg class="theme-arco-icon theme-arco-icon-question_circle" width="1em" height="1em" viewBox="0 0 16 16" fill="var(--theme-arco-color-text-3)" xmlns="http://www.w3.org/2000/svg" style="stroke: unset">
                            <path d="M7.11875 9.35063V7.5968L7.71608 7.5648C8.49475 7.5328 9.00787 7.10843 9.00787 6.45996 9.00787 5.81149 8.56942 5.45729 7.89742 5.45729 7.24675 5.45729 6.72008 5.77596 6.60275 6.49063L5.16675 6.25729C5.34808 4.93463 6.42542 4.16663 8.01475 4.16663 9.51088 4.16663 10.5654 5.05196 10.5654 6.41729 10.5654 7.51596 9.8403 8.30435 8.70808 8.51863V9.35063H7.11875zM6.87341 10.908C6.87341 10.332 7.31075 9.89463 7.89742 9.89463 8.48408 9.89463 8.91075 10.332 8.91075 10.908 8.91075 11.4733 8.48408 11.9106 7.89742 11.9106 7.31075 11.9106 6.87341 11.4733 6.87341 10.908z" fill-opacity="1"></path>
                            <path d="M0.666748 7.99996C0.666748 3.94987 3.94999 0.666626 8.00008 0.666626C12.0502 0.666626 15.3334 3.94987 15.3334 7.99996C15.3334 12.05 12.0502 15.3333 8.00008 15.3333C3.94999 15.3333 0.666748 12.05 0.666748 7.99996ZM8.00008 14C11.3138 14 14.0001 11.3137 14.0001 7.99996C14.0001 4.68625 11.3138 1.99996 8.00008 1.99996C4.68637 1.99996 2.00008 4.68625 2.00008 7.99996C2.00008 11.3137 4.68637 14 8.00008 14Z" fill-opacity="1"></path>
                        </svg>
                        <ul class="tooltip-show">
                            <li>Capitalize the first letter of each word (except conjunctions, articles,
                                prepositions).</li>
                            <li>Set the most important variation as the first one and add corresponding product
                                image for different variations instead of using the same image for all of them.
                            </li>
                        </ul>
                    </div>
                </div>
                <div class="items">
                    <div class="item">
                        <div class="content">
                            <div class="content-info">
                                <input type="text" placeholder="Add another value">
                                <div class="action">
                                    <svg delete-item="" class="theme-arco-icon theme-arco-icon-delete w-16 h-16 mr-16 text-gray-3 fill-current cursor-pointer" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M7.08333 6.62728C7.26743 6.62728 7.41667 6.77652 7.41667 6.96061V10.9606C7.41667 11.1447 7.26743 11.2939 7.08333 11.2939H6.58333C6.39924 11.2939 6.25 11.1447 6.25 10.9606V6.96061C6.25 6.77652 6.39924 6.62728 6.58333 6.62728H7.08333zM9.41667 11.2939C9.60076 11.2939 9.75 11.1447 9.75 10.9606V6.96061C9.75 6.77652 9.60076 6.62728 9.41667 6.62728H8.91667C8.73257 6.62728 8.58333 6.77652 8.58333 6.96061V10.9606C8.58333 11.1447 8.73257 11.2939 8.91667 11.2939H9.41667z" fill-opacity="1"></path>
                                        <path d="M5.41667 2.62728C5.41667 1.75283 6.12555 1.04395 7 1.04395H9C9.87445 1.04395 10.5833 1.75283 10.5833 2.62728V3.29395H13.6667C13.8508 3.29395 14 3.44318 14 3.62728V4.29395C14 4.47804 13.8508 4.62728 13.6667 4.62728H12.9776L12.4171 12.3868C12.3935 12.7147 12.373 12.9988 12.3374 13.2326C12.2997 13.4802 12.2383 13.7245 12.1044 13.9573C11.9038 14.3064 11.6024 14.5868 11.2397 14.7619C10.9979 14.8786 10.7498 14.9222 10.5 14.942C10.2643 14.9606 9.97955 14.9606 9.65082 14.9606H6.34901C6.02029 14.9606 5.73548 14.9606 5.49975 14.942C5.25003 14.9222 5.00194 14.8786 4.76007 14.7619C4.39741 14.5868 4.09603 14.3064 3.89535 13.9573C3.76151 13.7245 3.70013 13.4802 3.66242 13.2326C3.62682 12.9988 3.60631 12.7147 3.58264 12.3868L3.02223 4.62728H2.33333C2.14924 4.62728 2 4.47804 2 4.29395V3.62728C2 3.44318 2.14924 3.29395 2.33333 3.29395H5.41667V2.62728ZM4.35904 4.62728L4.91074 12.2663C4.9367 12.6257 4.95386 12.8565 4.98056 13.0318C5.00602 13.1991 5.03321 13.2614 5.05131 13.2929C5.11821 13.4092 5.21867 13.5027 5.33955 13.561C5.37227 13.5768 5.43635 13.5994 5.605 13.6128C5.78179 13.6268 6.01328 13.6273 6.3736 13.6273H9.62619C9.98651 13.6273 10.218 13.6268 10.3948 13.6128C10.5634 13.5994 10.6275 13.5768 10.6602 13.561C10.7811 13.5027 10.8816 13.4092 10.9485 13.2929C10.9666 13.2614 10.9938 13.1991 11.0192 13.0318C11.0459 12.8565 11.0631 12.6257 11.089 12.2663L11.6408 4.62728H4.35904ZM9.41667 2.62728C9.41667 2.39716 9.23012 2.21061 9 2.21061H7C6.76988 2.21061 6.58333 2.39716 6.58333 2.62728V3.29395H9.41667V2.62728Z" fill-opacity="1"></path>
                                    </svg>
                                    <svg drag-item="" fill="none" stroke="currentColor" stroke-width="4" viewBox="0 0 48 48" aria-hidden="true" focusable="false" class="w-16 h-16 text-gray-3 fill-current cursor-move theme-arco-icon theme-arco-icon-drag-dot-vertical">
                                        <path fill="currentColor" stroke="none" d="M17 8h2v2h-2V8ZM17 23h2v2h-2v-2ZM17 38h2v2h-2v-2ZM29 8h2v2h-2V8ZM29 23h2v2h-2v-2ZM29 38h2v2h-2v-2Z">
                                        </path>
                                        <path d="M17 8h2v2h-2V8ZM17 23h2v2h-2v-2ZM17 38h2v2h-2v-2ZM29 8h2v2h-2V8ZM29 23h2v2h-2v-2ZM29 38h2v2h-2v-2Z">
                                        </path>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div>
            <button type="button" variant-done>Xong</button>
        </div>`,s},p=function(){return`<svg delete-variant class="theme-arco-icon theme-arco-icon-delete w-16 h-16 mr-16 text-gray-3 fill-current cursor-pointer" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.08333 6.62728C7.26743 6.62728 7.41667 6.77652 7.41667 6.96061V10.9606C7.41667 11.1447 7.26743 11.2939 7.08333 11.2939H6.58333C6.39924 11.2939 6.25 11.1447 6.25 10.9606V6.96061C6.25 6.77652 6.39924 6.62728 6.58333 6.62728H7.08333zM9.41667 11.2939C9.60076 11.2939 9.75 11.1447 9.75 10.9606V6.96061C9.75 6.77652 9.60076 6.62728 9.41667 6.62728H8.91667C8.73257 6.62728 8.58333 6.77652 8.58333 6.96061V10.9606C8.58333 11.1447 8.73257 11.2939 8.91667 11.2939H9.41667z" fill-opacity="1"></path>
                <path d="M5.41667 2.62728C5.41667 1.75283 6.12555 1.04395 7 1.04395H9C9.87445 1.04395 10.5833 1.75283 10.5833 2.62728V3.29395H13.6667C13.8508 3.29395 14 3.44318 14 3.62728V4.29395C14 4.47804 13.8508 4.62728 13.6667 4.62728H12.9776L12.4171 12.3868C12.3935 12.7147 12.373 12.9988 12.3374 13.2326C12.2997 13.4802 12.2383 13.7245 12.1044 13.9573C11.9038 14.3064 11.6024 14.5868 11.2397 14.7619C10.9979 14.8786 10.7498 14.9222 10.5 14.942C10.2643 14.9606 9.97955 14.9606 9.65082 14.9606H6.34901C6.02029 14.9606 5.73548 14.9606 5.49975 14.942C5.25003 14.9222 5.00194 14.8786 4.76007 14.7619C4.39741 14.5868 4.09603 14.3064 3.89535 13.9573C3.76151 13.7245 3.70013 13.4802 3.66242 13.2326C3.62682 12.9988 3.60631 12.7147 3.58264 12.3868L3.02223 4.62728H2.33333C2.14924 4.62728 2 4.47804 2 4.29395V3.62728C2 3.44318 2.14924 3.29395 2.33333 3.29395H5.41667V2.62728ZM4.35904 4.62728L4.91074 12.2663C4.9367 12.6257 4.95386 12.8565 4.98056 13.0318C5.00602 13.1991 5.03321 13.2614 5.05131 13.2929C5.11821 13.4092 5.21867 13.5027 5.33955 13.561C5.37227 13.5768 5.43635 13.5994 5.605 13.6128C5.78179 13.6268 6.01328 13.6273 6.3736 13.6273H9.62619C9.98651 13.6273 10.218 13.6268 10.3948 13.6128C10.5634 13.5994 10.6275 13.5768 10.6602 13.561C10.7811 13.5027 10.8816 13.4092 10.9485 13.2929C10.9666 13.2614 10.9938 13.1991 11.0192 13.0318C11.0459 12.8565 11.0631 12.6257 11.089 12.2663L11.6408 4.62728H4.35904ZM9.41667 2.62728C9.41667 2.39716 9.23012 2.21061 9 2.21061H7C6.76988 2.21061 6.58333 2.39716 6.58333 2.62728V3.29395H9.41667V2.62728Z" fill-opacity="1"></path>
            </svg>`};class m{constructor(t){this.variantId=h(),this.variantOptions=[],this.variantStore={},this.element=t,this.productVariantSwitch=this.element.querySelector("[switch-product-variant] input"),this.productNoVariant=this.element.querySelector("[product-no-variant]"),this.productVariant=this.element.querySelector("[product-has-variant]"),this.productVariantOptions=this.element.querySelector("[product-variant-options]"),this.variantList=this.element.querySelector("[product-variant-list]"),this.addVariant=this.productVariant.querySelector("[add-variant]"),this.variantItemAction=this.element.querySelector("[variant-item-action]"),this.updateVariant=this.element.querySelector("[update-variant]")}toggleVariant(){this.productVariantSwitch.addEventListener("change",t=>{this.productVariantSwitch.checked?(this.productNoVariant.style.display="none",this.productVariant.style.display="block"):(this.productNoVariant.style.display="flex",this.productVariant.style.display="none")})}getItems(){this.lengthItems=this.variantList.children.length;let t=0;for(let e of this.variantList.children){if(this.lengthItems>=1,!this.variantOptions.some(({variantItemId:i})=>i===e.dataset.id)){const i=new u(e,this.variantId);this.addEvent(i),this.variantOptions.push(i)}t++}this.buildData()}addEvent(t){document.addEventListener(`change-name-${this.variantId}-${t.variantItemId}`,e=>{this.renameKeys(e.detail.old,e.detail.new)})}checkLength(){return!(this.variantOptions.length>=3)}addItem(){this.addVariant.onclick=()=>{if(!this.checkLength())return!1;const t=v();this.variantList.append(t),this.getItems(),this.checkLength()||(this.addVariant.style.display="none")}}createTable(){this.table=document.createElement("table"),this.table.className="table",this.tableHead=document.createElement("thead"),this.tableHead.innerHTML=`<tr>
        ${this.variantOptions.map(t=>`<th>${t.name??"Variantion Name"}</th>`).join("")}
        <th>Retail price</th>
        <th>Quantity</th>
        <th>Seller SKU</th>
        </tr>`,this.body=document.createElement("tbody"),this.body.innerHTML=`<tr>
            <td colspan="100%" class="text-center">No available SKUs</td>
        </tr>`,this.table.append(this.tableHead,this.body),this.productVariantOptions.append(this.table)}buildData(){this.updateVariant.onclick=()=>{this.initializeVariants()}}generateVariants(){const t=i=>{if(i.length===0)return[[]];const a=i[0],n=i.slice(1),r=t(n),o=[];return a.options.forEach(l=>{r.forEach(c=>{o.push([l,...c])})}),o};return t(this.variantOptions).map(i=>{const a={};return this.variantOptions.forEach((n,r)=>{a[n.name]=i[r]}),a})}initializeVariants(){const t=this.generateVariants();this.variantStore={},t.forEach(e=>{const i=JSON.stringify(e);this.variantStore[i]={price:0,quantity:0,sku:""}})}renameKeys(t,e){const i={};Object.keys(this.variantStore).forEach(a=>{const n=JSON.parse(a);n.hasOwnProperty(t)&&(n[e]=n[t],delete n[t]),i[JSON.stringify(n)]=this.variantStore[a]}),this.variantStore=i}}class u{constructor(t,e){this.variantId=e,this.variantItemId=h(),this.item=t,this.item.dataset.id=this.variantItemId,this.name=null,this.options=[],this.init()}init(){var t;this.inputHasImage=this.item.querySelector("[has-image]"),this.hasImageChecked=((t=this.inputHasImage)==null?void 0:t.checked)||!1,this.itemOptions=this.item.querySelector("[variant-options] .items"),this.inputVariantItem=this.item.querySelector("[variant-item]"),this.name=this.inputVariantItem.value,this.initName(),this.initOptions(),this.configHasImage()}initName(){let t=null;this.inputVariantItem.onchange=()=>{clearTimeout(t),t=setTimeout(()=>{document.dispatchEvent(new CustomEvent("change-name-"+this.variantId+"-"+this.variantItemId,{detail:{old:this.name,new:this.inputVariantItem.value}})),this.name=this.inputVariantItem.value},1e3)}}getVariantItems(){this.itemOptions=this.item.querySelector("[variant-options] .items")}configHasImage(){this.inputHasImage&&(this.inputHasImage.onchange=()=>{this.getVariantItems(),this.hasImageChecked=this.inputHasImage.checked;for(const t of this.itemOptions.children){const e=t.querySelector(".image");e.style.display=this.hasImageChecked?"flex":"none"}})}getName(){}initOptions(){let t=null;Array.from(this.itemOptions.children).forEach((e,i)=>{const a=e.querySelector("input");let n=null;t=a,a.oninput=()=>{clearTimeout(n),n=setTimeout(()=>{a.value!=""&&t===a&&(this.itemOptions.append(d(this.hasImageChecked)),this.initOptions()),this.pushOption(i,a.value)},1e3)}})}pushOption(t,e){this.options[t]=e}}const C=document.querySelectorAll("[product-variant]");for(const s of C){const t=new m(s);t.toggleVariant(),t.addItem(),t.getItems(),t.createTable(),t.buildData()}
