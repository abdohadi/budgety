/* Structuring our code with modules
- UI Module
    -get input values
    -add the new items to the UI 
    -update the UI
- Data Module
    -add the new item to our data structure
    -calculate budget
- Controller Module
    -add event handler
 */



// BUDGET CONTROLLER
var budgetController = (function() {
    
    // Income class constructor
	var Income = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};

	// Expense class constructor
	var Expense = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};

	Expense.prototype.calcPercentage = function(totalIncome) {
		data.allItems.exp.forEach(function(current) {
			if (totalIncome > 0 && current.value > 0 && totalIncome > current.value) {
				current.percentage = Math.round((current.value / totalIncome) * 100);
			} else {
				current.percentage = -1;
			}
		});
	};

	var calculateTotals = function(type) {
		var sum = 0;

		data.allItems[type].forEach(function(item) {
			sum += item.value;
		});

		data.totals[type] = sum;	
	};

	// Items data
	var data = {
		allItems: {
			inc: [],
			exp: []
		},
		totals: {
			inc: 0,
			exp: 0
		},
		budget: 0,
		percentage: -1
	};

	var ID = 0;

	return {
		addItem: function(type, desc, val) {
			var newItem;

			if (type == 'inc') {
				newItem = new Income(ID, desc, val);
			} else {
				newItem = new Expense(ID, desc, val);
			}

			data.allItems[type].push(newItem);
			ID++;
			return newItem;
		},

		calculateBudget: function() {
			// Calculate income & expenses
			calculateTotals('inc');
			calculateTotals('exp');

			// Calculate the budget: income - expenses
			// if (data.totals.inc > 0 && data.totals.inc > data.totals.exp) {
				data.budget = data.totals.inc - data.totals.exp;
			// } else {
			// 	data.budget = 0;
			// }
			
			// Calculate percentage: (expenses / income) * 100  ->  if income not 0
			if (data.totals.inc > 0 && data.totals.exp > 0 && data.totals.inc > data.totals.exp) { 
				data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100); 
			} else {
				data.percentage = -1;
			}
		},

		getBudget: function() {
			return {
				totalIncome: data.totals.inc,
				totalExpenses: data.totals.exp,
				budget: data.budget,
				percentage: data.percentage
			};
		},

		deleteItem: function(type, id) {
			var ids, index;

			ids = data.allItems[type].map(function(item) {
				return item.id;
			});

			index = ids.indexOf(id);

			if (index !== -1) {
				data.allItems[type].splice(index, 1); 
			}
		},

		calculatePercentages: function() {
			data.allItems.exp.forEach(function(current) {
				current.calcPercentage(data.totals.inc);
			});
		},

		getPercentages: function() {
			var percentages = data.allItems.exp.map(function(current) {
				return current.percentage
			});

			return percentages;
		},

		getData: function() {
			return data;
		},
	};

})();



// UI CONTROLLER
var UIController = (function() {

	var DOMstrings = {
		inputType: '.add__type',
		inputDescription: '.add__description',
		inputValue: '.add__value',
		addBtn: '.add__btn',
		incomeContainer: '.income__list',
		expenseContainer: '.expenses__list',
		budgetLabel: '.budget__value',
		incomeLabel: '.budget__income--value',
		expensesLabel: '.budget__expenses--value',
		percentageLabel: '.budget__expenses--percentage',
		container: '.container',
		itemPercentageLable: '.item__percentage',
		DateLabel: '.budget__title--month'
	};

	var formatNumber = function(num, type) {
		/*
		* 29848.2228 -> 29,848.22 
		* 234929848.2228 -> 234,929,848.22
		* 2043 -> 2,043.00
		* + 2,043.00 or - 2,043.00
		*/
		var int, dec, finalNum, j, count, len;

		num = ((Math.abs(num)).toFixed(2)).split('.');
		int = num[0];
		dec = num[1];

		finalNum = '';
		j = 0;
		count = 3;
		len = int.length;
		for (var i = 0; i <= Math.floor(len / 3); ++i) {
			if ((j + 3) > len) {
				count = len - j;
				j = len;
			} else {
				j += 3;
			}

			var end = (len % 3 == 0 ? Math.floor(len / 3) - 1 : Math.floor(len / 3));
			finalNum = (i < end ? "," : "") + int.substr(len - j, count) + finalNum;
		}

		return (type == 'inc' ? "+" : "-") + " " + finalNum + "." + dec; 
	};
    
	return {
		getDOMstrings: function() {
			return DOMstrings;
		},

		getInput: function() {
			return {
				type: document.querySelector(DOMstrings.inputType).value,	// will be either inc or exp
				description: document.querySelector(DOMstrings.inputDescription).value,
				value: document.querySelector(DOMstrings.inputValue).value
			};
		},

		addListItem: function(obj, type) {
			var html, element;

			// Create HTML string with placeholder text
			if (type === 'inc') {
				element = DOMstrings.incomeContainer;

				html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
			} else {
				element = DOMstrings.expenseContainer;

				html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
			}

			// Place the placeholder text with some actual data
			html = html.replace('%id%', obj.id);
			html = html.replace('%description%', obj.description);
			html = html.replace('%value%', formatNumber(obj.value, type));

			// Insert the html into the DOM
			document.querySelector(element).insertAdjacentHTML('beforeend', html);
		},

		clearFields: function() {
			var fields;

			fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
			fields.forEach(function(element) {
				element.value = '';
			});

			fields[0].focus();
		},

		displayBudget: function(obj) {
			var budgetType = (obj.totalExpenses > obj.totalIncome) ? 'exp' : 'inc';
			document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, budgetType);
			document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalIncome, 'inc');
			document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExpenses, 'exp');

			var percentage = '---';
			if (obj.percentage > 0) {
				percentage = obj.percentage + '%'; 
			}

			document.querySelector(DOMstrings.percentageLabel).textContent = percentage;
		},

		deleteListItem: function(selectorID) {
			var item = document.getElementById(selectorID);
			item.parentNode.removeChild(item);
		},

		displayPercentages: function(percentages) {
			var fields = document.querySelectorAll(DOMstrings.itemPercentageLable);

			var nodeListForEach = function(list, callback) {
				for (var i = 0; i < fields.length; ++i) {
					callback(list[i], i);
				}
			}

			nodeListForEach(fields, function(field, index) {
				var percentage = '---';
				if (percentages[index] > 0) {
					percentage = percentages[index] + '%'; 
				}

				field.textContent = percentage;
			});
		},

		displayDate: function() {
			var now, month, year, months;

			now = new Date();
			months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'Augest', 'September', 'October', 'November', 'December'];
			month = now.getMonth();
			year = now.getFullYear();

			document.querySelector(DOMstrings.DateLabel).textContent = months[month] + ', ' + year;
		},

		changedType: function() {
			var fields = document.querySelectorAll(DOMstrings.inputType + "," + DOMstrings.inputDescription + "," + DOMstrings.inputValue);
			fields.forEach(function(field) {
				field.classList.toggle('red-focus');
			});

			document.querySelector(DOMstrings.addBtn).classList.toggle('red');
		},

		resetType: function() {
			var type = document.querySelector(DOMstrings.inputType);
			type.lastElementChild.removeAttribute('selected');
			type.firstElementChild.setAttribute('selected', 'selected');
		}
	};

})();



// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {

	var setupEventListeners = function() {
		var DOM = UICtrl.getDOMstrings();

		document.querySelector(DOM.addBtn).addEventListener('click', ctrlAddItem);

		document.addEventListener('keypress', function(e) {
			if (e.keyCode === 13 || e.which === 13) {
				ctrlAddItem();
			}
		});

		document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);	// using event delegation

		document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
	};

	var updateBudget = function() {
		// Calculate the budget
		budgetCtrl.calculateBudget();

		// Get the budget object contains (totalIncome, totalExpenses, budget, percentage)
		var budget = budgetCtrl.getBudget();

		// Display the budget on the UI
		UICtrl.displayBudget(budget);
	};

	var updatePercentages = function() {
		// Calculate percentages
		budgetCtrl.calculatePercentages();

		// Get the percentages fromt the budget controller
		var percentages = budgetCtrl.getPercentages();

		// Update the UI with the new percentages
		UICtrl.displayPercentages(percentages);
	};

	var ctrlAddItem = function() {
		var input, newItem;

		// 1. Get the input values
		input = UICtrl.getInput();

		if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
			// 2. Add the item to the budget controller
			newItem = budgetController.addItem(input.type, input.description, parseFloat(input.value));

			// 3. Add the item to UI
			UICtrl.addListItem(newItem, input.type);

			// 4. Clear the fields
			UICtrl.clearFields();

			// 5. Calculate & update the budget
			updateBudget();

			// 6. Calculate & update the percentages
			updatePercentages();
		}
	};

	var ctrlDeleteItem = function(e) {
		var itemID, splitID, itemType, ID;

		itemID = e.target.parentNode.parentNode.parentNode.parentNode.id;
		splitID = itemID.split('-');
		itemType = splitID[0];
		ID = parseInt(splitID[1]); 	

		if (itemType == "inc" || itemType == "exp") {
			// 1. Delete the item from the data structure
			budgetCtrl.deleteItem(itemType, ID);

			// 2. Delete the item from the UI
			UICtrl.deleteListItem(itemID);

			// 3. Update and show the new budget
			updateBudget();

			// 4. Calculate & update the percenatages
			updatePercentages();
		}
	};

	return {
		init: function() {
			UICtrl.resetType();

			UICtrl.displayDate();

			UICtrl.displayBudget({
				totalIncome: 0,
				totalExpenses: 0,
				budget: 0,
				percentage: -1
			});

			setupEventListeners();
		},

		testing: function() {
			console.log(budgetCtrl.getData());
		}
	};

})(budgetController, UIController);


controller.init();