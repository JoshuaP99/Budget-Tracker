//These two classes are pretty standard
//The budget is the overall and the bill 
//is what will be appended into the room array
//The addBill method also exists here and will be 
//invoked in the DOMManager

class Budget {
    constructor(name){
        this.name = name;
        this.room = [];
    }

    addBill(name, amount){
        this.room.push(new Bill(name, amount))
    }
}

class Bill {
    constructor(name, amount){
        this.name = name
        this.area = amount
    }
}


class BudgetService {
    
    //This API is from this weeks video meaning that anyone who uses it will also have their info here
    //The API is built for the houses functions but I went through and reqrote as much as possible
    //To keep my code to interact with the API
    static url = "https://ancient-taiga-31359.herokuapp.com/api/houses";

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
    
    //The methods for all the elements in the render exist here
    //Each one of the methods here exist in the HTML and the buttons invoke
    //one of the methods here in the DOMManager
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
        for (let budget of this.budgets) {
            if (budget._id == id) {
                budget.rooms.push(new Bill($(`#${budget._id}-room-name`).val(), $(`#${budget._id}-room-area`).val()));
                BudgetService.updateBudget(budget)
                    .then(() => {
                        return BudgetService.getAllBudgets();
                    })
                    .then((budgets) => this.render(budgets));
            }
        }
    }

    static deleteBill(budgetId, roomId) {
        for (let budget of this.budgets) {
            if (budget._id == budgetId) {
                for (let room of budget.rooms) {
                    if (room._id == roomId) {
                        budget.rooms.splice(budget.rooms.indexOf(room), 1);
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

    //This method will allow for all the other HTML functions to live that have been 
    //called out in the DOMManager
    //The method exists of HTML that will be prepended to the div with app class
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
                                    <input type="text" id="${budget._id}-room-name" class ="form-control" placeholder="Bill Name">
                                </div>
                                <div class="col-sm">
                                    <input type="text" id="${budget._id}-room-area" class ="form-control" placeholder="Bill Amount">
                                </div>
                            </div>
                            <button id="${budget._id}-new-bill" onclick="DOMManager.addBill('${budget._id}')" class="btn btn-primary form-control">Add Bill</button>
                        </div>
                    </div>
                </div><br>`
            );

            for (let room of budget.rooms) {
                $(`#${budget._id}`).find('.card-body').append(
                    `<p>
                        <span id="name-${room._id}"><strong>Name: </strong> ${room.name}</span>
                        <span id="name-${room._id}"><strong>Amount: </strong> ${room.area}</span>
                        <button class="btn btn-danger" onclick="DOMManager.deleteBill('${budget._id}', '${room._id}')">Delete Bill</button>`
                );
            }
        }
    }
}

//This method will allow for the creation of a budget for the API
//This is the function for the button for the first part of the HTML
$("#create-new-budget").click(() =>{
    DOMManager.createBudget($('#new-budget-name').val());
    $("#new-budget-name").val('');
});

DOMManager.getAllBudgets();
