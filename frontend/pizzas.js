// load  pizza.json
const loadPizzasData = async () => {
  const response = await fetch("http://localhost:3000/pizzas");
  const pizzasData = await response.json();
  return pizzasData;
};

let pizzasData //pizzasData is global !

const sendPizzasData = async (newPizzasData) => {
  const rawResponse = await fetch('http://localhost:3000/modify', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(newPizzasData)
  });
  const content = await rawResponse.json();
  console.log(content);
}

// create one pizza card
const pizzaComponent = (pizza) => {
  return `
    <div class="pizzaCard">
        <div class="pizzaImageName">
            <img src="${pizza.imgUrl}" class="pizzaSmallImgs">
            <div class="pizzaNameIngredients">
                <input id="${"name" + pizza.id
    }" class="inputName" type="text" value="${pizza.name
    }" disabled="true"/>
                <input id="${"ingr" + pizza.id
    }" class="inputIngred" type="text" value="${pizza.ingredients
    }" disabled="true"/>
                <input id="${"pric" + pizza.id
    }" class="inputPrice" type="number" value=${pizza.price
    } disabled="true"/> Ft
            </div>
        </div>
        <div class="addContainer">
          <button id="${"modi" + pizza.id
    }" class="modify" >
            <img class="inside" src="/public/img/edit.png">
          </button>
          <button id="${"dele" + pizza.id
    }" class="delete">
            <img class="inside" src="/public/img/delete.png">
          </button>
          <button id="${"stat" + pizza.id
    }" class="status">aktív</button>
        </div>
    </div>
        `;
};

// modify button (edit and save)
const modifyPizza = (event) => {
  const editUrl = "http://localhost:3000/public/img/edit.png";
  const saveUrl = "http://localhost:3000/public/img/save.png";
  const img = event.target.querySelector("img");
  const pizzaID = event.target.id.slice(4)
  const inputName = document.getElementById("name" + pizzaID)
  const inputIngredients = document.getElementById("ingr" + pizzaID)
  const inputPrice = document.getElementById("pric" + pizzaID)
  if (img.src === editUrl) {
    inputName.disabled = false
    inputIngredients.disabled = false
    inputPrice.disabled = false
    img.src = saveUrl;
  } else {
    inputName.disabled = true;
    inputIngredients.disabled = true;
    inputPrice.disabled = true;
    img.src = editUrl;

    for (const pizza of pizzasData) {
      if (pizza.id === pizzaID) {
        pizza.name = inputName.value
        pizza.ingredients = inputIngredients.value
        pizza.price = inputPrice.value
        sendPizzasData(pizzasData) //elküldjük a pizzasData -t a pizzas.json -be
      }
    }
  }
};

// deletePizza törli a pizza.json-ből az adott pizzát
const deletePizza = (event) => {
  let text = "Biztosan törlöd a pizzát?";
  if (confirm(text) == true) {
    const pizzaID = event.target.id.slice(4)
    let newPizzasData = []
    for (const pizza of pizzasData) {
      if (pizza.id !== pizzaID) {
        newPizzasData.push(pizza)
      }
    }
    sendPizzasData(newPizzasData)
    pizzasData = newPizzasData
    setTimeout(init, 1000)
  }
}

// statusPizza megváltoztatja a pizza státuszát (aktív/nem aktív)
const statusPizza = (event) => {
  const pizzaID = event.target.id.slice(4)
  console.log(pizzaID);
  for (const pizza of pizzasData) {
    if (pizza.id === pizzaID) {
      console.log(pizza.status)
      pizza.status = pizza.status === "aktív" ? "nem aktív" : "aktív"
      console.log(pizza.status)
      sendPizzasData(pizzasData) //elküldjük a pizzasData -t a pizzas.json -be
      document.getElementById("stat" + pizzaID).innerText = pizza.status
    }
  }
}

const newPizzaSend = async (event) => {
  const formData = new FormData();
  formData.append("id", document.getElementById("newPizzaId").value);
  formData.append("name", document.getElementById("newPizzaName").value);
  formData.append("ingredients", document.getElementById("newPizzaIngredients").value);
  formData.append("price", document.getElementById("newPizzaPrice").value);
  formData.append("status", "aktív");
  const fileField = document.querySelector('input[type="file"]');
  formData.append("imgUrl", "/public/img/" + fileField.files[0].name);
  formData.append('picture', fileField.files[0]);
  console.dir(formData)

  const response = await fetch("http://localhost:3000/newPizza", {
    method: "POST",
    body: formData,
  });
  console.log(response.status);

  document.getElementById("newPizzaId").value = ""
  document.getElementById("newPizzaName").value = ""
  document.getElementById("newPizzaIngredients").value = ""
  document.getElementById("newPizzaPrice").value = ""
  document.querySelector('input[type="file"]').value = ""

  init()
  return response.status;
}


// pizzas to screen
const init = async () => {
  // all pizzas data here
  pizzasData = await loadPizzasData();

  const pizzaCardContainer = document.querySelector("#pizzaCardContainer");
  pizzaCardContainer.innerHTML = pizzasData.map(pizzaComponent).join(" ");

  const modifyButtons = document.getElementsByClassName("modify"); //edit and save buttons
  console.log(modifyButtons);
  for (const btn of modifyButtons) {
    btn.addEventListener("click", modifyPizza);
  }
  const deleteButtons = document.getElementsByClassName("delete"); //delete buttons
  for (const btn of deleteButtons) {
    btn.addEventListener("click", deletePizza);
  }
  const statusButtons = document.getElementsByClassName("status"); //status buttons
  for (const btn of statusButtons) {
    btn.addEventListener("click", statusPizza);
  }

  document.getElementById("newPizzaButton").addEventListener("click", newPizzaSend)
};

init();

