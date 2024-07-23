import{a as l}from"./utils.js";const x=(()=>{const e=document.querySelector(".cms-loading");if(e)return{show(...t){if(t.length>0)for(const o of t)o.style.pointerEvents="none";e.classList.add("show")},hide(...t){if(t.length>0)for(const o of t)o.style.pointerEvents=null;e.classList.remove("show")}}})(),g={template:(e,t)=>{var r;(r=document.body.querySelector("[notify]"))==null||r.remove();const o=document.createElement("div");o.setAttribute("notify",""),Object.assign(o.style,{position:"fixed",top:"30px",right:"30px",width:"300px",minHeight:"60px",display:"flex",alignItems:"center",overflow:"hidden",zIndex:999999});const n=document.createElement("div");Object.assign(n.style,{position:"relative",width:"100%",padding:"3px",borderRadius:"6px"}),n.innerHTML=`
            <div style="display:flex;background:white;align-items:center; border-radius:6px;height:60px;border-radius:6px;box-shadow:1px 1px 2px">
                <div style="border-top-left-radius:6px;border-bottom-left-radius:6px;background:${e==="success"?"green":"red"};width:10px;height:100%"></div>
                <div style="flex:1; padding: 0 20px;color:${e==="success"?"green":"red"};border-top-right-radius:6px;border-bottom-right-radius:6px">${t}</div>
            </div>
        `,o.append(n),n.animate([{transform:"translateX(100%) rotate(5deg)"},{transform:"translateX(0%)"}],{duration:400,fill:"forwards",easing:"ease-in-out"}).finished.then(a=>{setTimeout(()=>{n.animate([{transform:"translateX(0%)",opacity:1},{transform:"translateX(100%) rotate(-5deg)",opacity:0}],{duration:300,fill:"forwards",easing:"ease-in-out"}).finished.then(d=>{o.remove()})},3e3)}),document.body.append(o)},success:e=>{g.template("success",e)},error:e=>{g.template("error",e)}},s={endpoint:"",headers:{},body:{},params:{},options:{},setHeaders:(e,t)=>{s.headers[e]=t},setBody:(e,t)=>{s.body[e]=t},buildData:(e,t)=>{if(t==="json")return JSON.stringify(e);if(t==="formData"){const o=new FormData;for(const[n,r]of Object.entries(e))r instanceof FileList?Array.from(r).forEach(a=>{o.append(n,a)}):o.append(n,r);return o}else{let o=[];for(const[n,r]of Object.entries(e))o.push(`${n}=${r}`);return o=o.join("&"),o}},setParam:(e,t)=>{s.params[e]=t},send:async(e,t,o=null,n="json")=>{let r="";const a={headers:s.headers};n==="json"?a.headers["Content-Type"]="application/json":n==="form"?a.headers["Content-Type"]="application/x-www-form-urlencoded":n==="formData"&&delete a.headers["Content-Type"],o&&(e==="GET"||n==="form"||n==="formData"?a.body=s.buildData(o,n):a.body=JSON.stringify(o)),Object.entries(s.params).length&&(r+="?"+s.buildData(s.params)),a.method=e;try{const d=await fetch(`${s.getEndpoint()}${t}${r}`,a),f=await d.json();return{error:!1,response:d,data:f}}catch(d){return{error:{status:100,message:d.message}}}},getEndpoint:()=>s.endpoint,setEndpoint:e=>{s.endpoint=e},get:async(e,t=null,o="json")=>s.send("GET",e,t,o),post:async(e,t,o="json")=>s.send("POST",e,t,o),patch:async(e,t,o="json")=>s.send("PATCH",e,t,o)};window.addEventListener("DOMContentLoaded",function(){document!=null&&document.querySelector('meta[name="csrf-token"]')&&s.setHeaders("X-CSRF-TOKEN",document.querySelector('meta[name="csrf-token"]').getAttribute("content"))});class q{constructor(t){this.el=t,this.id=t.dataset.id,this.init()}init(){this.el.onclick=async()=>{const t=document.createElement("div");x.show();const{response:o,data:n}=await s.get(`https://localhost:9999/nimda/sale-costs/${this.id}`),r=JSON.parse(n.cost.data);t.className="modal-cost",t.innerHTML=`
                <div class="modal-content">
                    <div class="modal-header">
                        <input placeholder="Giá nhập" cost/>
                        <input placeholder="Giá bán" price/>
                        <button type="button" calculator>Tính toán</button>
                    </div>
                    <div class="modal-body">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Loại chi phí</th>
                                    <th>Chi phí</th>
                                    <th>Theo kiểu</th>
                                    <th>Kết quả</th>
                                </tr>
                            </thead>
                            <tbody>
                                
                                    ${r.map(({name:i,value:c,type:p})=>`
                                        <tr>
                                            <td>${i}</td>
                                            <td data-value="${c}">${c}</td>
                                            <td data-type="${p}">${p==="percent"?"%":"Số tiền"}</td>
                                            <td data-expense>
                                                <span class="icon-loading"></span>
                                            </td>
                                        </tr>
                                        `).join("")}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colspan="3">Tổng chi phí phát sinh</td>
                                    <td total-expense class="text-danger">
                                        <span class="icon-loading"></span>
                                    </td>
                                </tr>
                                <tr>
                                    <td colspan="3">Lợi nhuận</td>
                                    <td total-profit>
                                        <span class="icon-loading"></span>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    <div class="modal-footer">
                        
                    </div>
                </div>
            `,document.body.append(t),x.hide(),t.querySelector("[profit]");const a=t.querySelector("[price]"),d=t.querySelector("[cost]"),f=t.querySelector("[calculator]"),w=t.querySelector("tbody"),b=t.querySelector("tfoot");a.oninput=()=>{const i=l(a.value);a.value=i},d.oninput=()=>{const i=l(d.value);d.value=i},f.onclick=()=>{const i=d.value.replaceAll(",",""),c=a.value.replaceAll(",",""),p=b.querySelector("[total-expense]"),h=b.querySelector("[total-profit]");if(!i||!c)return g.error("Vui lòng nhập đủ thông tin");let m=+i;for(let y of w.children){const S=y.querySelector("[data-expense]"),E=y.querySelector("[data-value]").dataset.value,T=y.querySelector("[data-type]").dataset.type;let u=E;T==="percent"&&(u=+(u*c/100)),S.innerHTML=l(u),m+=u}const v=c-m;p.innerHTML=l(m),h.innerHTML=l(v),v<0?h.className="bg-danger":h.className="bg-success"},t.onclick=i=>{i.preventDefault(),i.target===t&&t.remove()}}}}const j=document.querySelectorAll("[cost-view]");for(const e of j)new q(e);
