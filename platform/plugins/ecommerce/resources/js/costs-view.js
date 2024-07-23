import LOADING from "../../../../../resources/js/admin/layouts/loading";
import notify from "../../../../../resources/js/utils/notify";
import request from "../../../../../resources/js/utils/request";
import { getPrice } from "../../../../../resources/js/utils/utils";

class CostView{
    constructor(button){
        this.el = button;
        this.id = button.dataset.id
        this.init()
    }
    init(){
        this.el.onclick =async () => {
            const modal = document.createElement("div");
            LOADING.show();
            const {response, data} = await request.get(import.meta.env.VITE_BU + import.meta.env.VITE_AP+`/sale-costs/${this.id}`);
            const dataCost = JSON.parse(data.cost.data);
            modal.className = "modal-cost";
            modal.innerHTML = `
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
                                
                                    ${dataCost.map(({name,value,type}) => {
                                        return `
                                        <tr>
                                            <td>${name}</td>
                                            <td data-value="${value}">${value}</td>
                                            <td data-type="${type}">${type === "percent" ? '%' : 'Số tiền'}</td>
                                            <td data-expense>
                                                <span class="icon-loading"></span>
                                            </td>
                                        </tr>
                                        `
                                    }).join("")}
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
            `
            document.body.append(modal);
            LOADING.hide();
            const profit = modal.querySelector("[profit]"); 
            const priceIp = modal.querySelector("[price]");
            const costIp = modal.querySelector("[cost]");
            const buttonCalculator = modal.querySelector("[calculator]");
            const tbody = modal.querySelector("tbody");
            const tfoot = modal.querySelector("tfoot");
            priceIp.oninput = () => {
                const string = getPrice(priceIp.value);
                priceIp.value = string; 
            }
            
            costIp.oninput = () => {
                const string = getPrice(costIp.value);
                costIp.value = string; 
            }

            buttonCalculator.onclick = () => {
                const costData = costIp.value.replaceAll(",","");
                const priceData = priceIp.value.replaceAll(",","");
                const totalExpenseEl = tfoot.querySelector("[total-expense]")
                const totalProfitEl = tfoot.querySelector("[total-profit]")
                if(!costData || !priceData){
                    return notify.error("Vui lòng nhập đủ thông tin");
                }
                let totalExpense = +costData;
                for(let itemTr of tbody.children){
                    const dataExpense = itemTr.querySelector("[data-expense]");
                    const dataValue = itemTr.querySelector("[data-value]").dataset.value;
                    const dataType = itemTr.querySelector("[data-type]").dataset.type;
                    let expense = dataValue
                    if(dataType === "percent"){
                        expense = +(expense * priceData / 100)
                    }
                    dataExpense.innerHTML = getPrice(expense)
                    totalExpense += expense;                    
                }
                const profit = priceData - totalExpense;
                totalExpenseEl.innerHTML = getPrice(totalExpense)
                totalProfitEl.innerHTML = getPrice(profit)
                if(profit < 0){
                    totalProfitEl.className = "bg-danger"
                }else{
                    totalProfitEl.className = "bg-success"
                }
            }
            
            modal.onclick = (e) => {
                e.preventDefault();
                if(e.target === modal){
                    modal.remove();
                }
            }
        }
    }
}

const costViews = document.querySelectorAll("[cost-view]");
for(const costViewButton of costViews){
    new CostView(costViewButton);
}