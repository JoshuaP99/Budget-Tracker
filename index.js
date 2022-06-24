class Budget {
    constructor(name){
        this.name = name;
        this.bill = [];
    }

    addBill(name, amount){
        this.bill.push(new Bill(name, amount))
    }
}

class Bill {
    constructor(name, amount){
        this.name = name
        this.amount = amount
    }
}


class BudgetService {
    static url = "https://crudcrud.com/api/c98a96280df949e4b5cf10f93f7478e1";

    static getAllBudgets() {         
        return $.get(this.url);
    }

    static getBudgets(id) {         
        return $.get(this.url + `/${id}`);
    }

    static createBudget(budget) {    
        return $.post(this.url, budget);
    }

    static updateBudget(budget) {     
        return $.ajax({   
            url: this.url + `/${budget._id}`,   
            dataType: 'json',   
            data: JSON.stringify(budget), 
            contentType: 'application/json',
            type: 'PUT' 
        });
    }

    static deleteBudget(id) {
        return $.ajax({
            url: this.url + `/${id}`, 
            type: 'DELETE'  
        });
    }
}

class DOMManager {
    static budgets;
    
    static getAllBudgets(){
        BudgetService.getAllBudgets().then(budgets => this.render(budgets) );
        
    }
    
    static createBudget(name){
        BudgetService.createBudget(new Budget(name))
            .then(() => {
                return BudgetService.getAllBudgets();
            })
            .then((budgets) => this.render(budgets));
    }
        
    static deleteBudget(id){
        BudgetService.deleteBudget(id)
            .then(() => {
                return BudgetService.getAllBudgets();
            })
            .then((budgets) => this.render(budgets));
    }

    static addBill(id) {
       // console.log(this.budgets)
        for (let budget of this.budgets) {
            if (budget._id == id) {
                budget.bill.push(new Budget($(`#${budget._id}-bill-name`).val(), $(`#${budget._id}-bill-amount`).val()));
                BudgetService.updateBudget(budget)
                    .then(() => {
                        return BudgetService.getAllBudgets();
                    })
                    .then((budgets) => this.render(budgets));
            }
        }
    }

    static deleteBudget(budgetId, billId) {
        for (let budget of this.budgets) {
            if (budget._id == budgetId) {
                for (let bill of budget.bills) {
                    if (bill._id == billId) {
                        budget.bills.splice(budget.bill.indexOf(bill), 1);
                        BudgetService.updateBudget(budget)
                            .then(() => {
                                return BudgetService.getAllBudgets();
                            })
                            .then((budgets) => this.render(budgets));
                    }
                }
            }
        }
    }

    static render(budgets){
        this.budgets = budgets;
        console.log(this.budgets);
        $(`#app`).empty();
        for (let budget of budgets) {
            $(`#app`).prepend(
                `<div id="${budget._id}" class="card">
                    <div class="card-header">
                        <h2>${budget.name}</h2>
                        <button class="btn btn-dark" onclick="DOMManager.deleteBudget('${budget._id}')">Delete</button>
                    </div>
                    <div class="card-body">
                        <div class="card">
                            <div class="row">
                                <div class="col-sm">
                                    <input type="text" id="${budget._id}-bill-name" class ="form-control" placeholder="Bill Name">
                                </div>
                                <div class="col-sm">
                                    <input type="text" id="${budget._id}-bill-amount" class ="form-control" placeholder="Bill Amount">
                                </div>
                            </div>
                            <button id="${budget._id}-new-bill" onclick="DOMManager.addBill('${budget._id}')" class="btn btn-primary form-control">Add Bill</button>
                        </div>
                    </div>
                </div><br>`
            );
            
            console.log(budget.bills)
            for (let room of budget.bills) {
                $(`#${budget._id}`).find('.card-body').append(
                    `<p>
                        <span id="name-${bill._id}"><strong>Name: </strong> ${bill.name}</span>
                        <span id="name-${bill._id}"><strong>Amount: </strong> ${bill.amount}</span>
                        <button class="btn btn-danger" onclick="DOMManager.deleteBill('${budget._id}', '${bill._id}')">Delete Bill</button>`
                );
            }
        }
    }
}

$("#create-new-budget").click(() =>{
    DOMManager.createBudget($('#new-budget-name').val());
    $("#new-budget-name").val('');
});

DOMManager.getAllBudgets();
