const API_KEY = "8b43d3f6ff8e4c9ea30585e9584950a1";
const API_HOST = "api.spoonacular.com";
const BASE_URL = `https://${API_HOST}`;

let currentRecipes = [];

window.onload = function () {
  fetchJoke();
};

function fetchJoke() {
  fetch(`${BASE_URL}/food/jokes/random?apiKey=${API_KEY}`)
  .then(response => response.json())
  .then(data => { document.getElementById("joke").textContent = data.text; }); {
    method: "GET",
    headers: {
      "x-rapidapi-key": API_KEY,
      "x-rapidapi-host": API_HOST,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      document.getElementById("joke").textContent = data.text;
    })
    .catch((error) => {
      document.getElementById("joke").textContent =
        "Ready to find some recipes?";
    });
}

function searchRecipes() {
  const ingredients = document.getElementById("ingredientsInput").value.trim();

  if (ingredients === "") {
    fetchRandomRecipes();
  } else {
    fetchRecipesByIngredients(ingredients);
  }
}

function fetchRecipesByIngredients(ingredients) {
  const recipesList = document.getElementById("recipesList");
  recipesList.innerHTML = '<p class="loading">Searching for recipes...</p>';

  fetch(
    `${BASE_URL}/recipes/findByIngredients?ingredients=${ingredients}&number=5&ranking=1`,
    {
      method: "GET",
      headers: {
        "x-rapidapi-key": API_KEY,
        "x-rapidapi-host": API_HOST,
      },
    }
  )
    .then((response) => response.json())
    .then((data) => {
      currentRecipes = data;
      displayRecipes(data, "ingredients");
      showPage("resultsPage");
    })
    .catch((error) => {
      recipesList.innerHTML =
        '<p class="loading">Error loading recipes. Please check your API key.</p>';
    });
}

function fetchRandomRecipes() {
  const recipesList = document.getElementById("recipesList");
  recipesList.innerHTML = '<p class="loading">Finding random recipes...</p>';

  fetch(`${BASE_URL}/recipes/random?number=5`, {
    method: "GET",
    headers: {
      "x-rapidapi-key": API_KEY,
      "x-rapidapi-host": API_HOST,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      currentRecipes = data.recipes;
      displayRecipes(data.recipes, "random");
      showPage("resultsPage");
    })
    .catch((error) => {
      recipesList.innerHTML =
        '<p class="loading">Error loading recipes. Please check your API key.</p>';
    });
}

function displayRecipes(recipes, type) {
  const recipesList = document.getElementById("recipesList");
  recipesList.innerHTML = "";

  recipes.forEach((recipe) => {
    const card = document.createElement("div");
    card.className = "recipe-card";

    let details = "";
    if (type === "ingredients") {
      details = `
                <p>Ingredients you have: ${recipe.usedIngredientCount}</p>
                <p>Missing ingredients: ${recipe.missedIngredientCount}</p>
                <p>Likes: ${recipe.likes}</p>
            `;
    } else {
      details = `
                <p>Prep time: ${recipe.preparationMinutes || "N/A"} minutes</p>
                <p>Cook time: ${recipe.cookingMinutes || "N/A"} minutes</p>
                <p>Likes: ${recipe.aggregateLikes || 0}</p>
            `;
    }

    card.innerHTML = `
            <img src="${recipe.image}" alt="${recipe.title}">
            <div class="recipe-info">
                <h3><a href="#" onclick="showRecipeDetail(${recipe.id}); return false;">${recipe.title}</a></h3>
                ${details}
            </div>
        `;

    recipesList.appendChild(card);
  });
}

function showRecipeDetail(recipeId) {
  const detailDiv = document.getElementById("recipeDetail");
  detailDiv.innerHTML = '<p class="loading">Loading recipe details...</p>';
  showPage("detailPage");

  fetch(`${BASE_URL}/recipes/${recipeId}/information`, {
    method: "GET",
    headers: {
      "x-rapidapi-key": API_KEY,
      "x-rapidapi-host": API_HOST,
    },
  })
    .then((response) => response.json())
    .then((recipe) => {
      detailDiv.innerHTML = `
            <div class="recipe-detail">
                <div class="recipe-header">
                    <img src="${recipe.image}" alt="${recipe.title}">
                    <div class="recipe-header-info">
                        <h1>${recipe.title}</h1>
                        <p>Ready in: ${recipe.readyInMinutes} minutes</p>
                        <p>Servings: ${recipe.servings}</p>
                    </div>
                </div>
                <div class="instructions">
                    <h3>Instructions:</h3>
                    <p>${
                      recipe.instructions || "No instructions available."
                    }</p>
                </div>
                <div id="ingredientsWidget" class="widget-container"></div>
                <div id="equipmentWidget" class="widget-container"></div>
            </div>
        `;

      fetchWidget(recipeId, "ingredientWidget", "ingredientsWidget");
      fetchWidget(recipeId, "equipmentWidget", "equipmentWidget");
    })
    .catch((error) => {
      detailDiv.innerHTML =
        '<p class="loading">Error loading recipe details.</p>';
    });
}

function fetchWidget(recipeId, widgetType, containerId) {
  fetch(`${BASE_URL}/recipes/${recipeId}/${widgetType}?defaultCss=true`, {
    method: "GET",
    headers: {
      "x-rapidapi-key": API_KEY,
      "x-rapidapi-host": API_HOST,
      accept: "text/html",
    },
  })
    .then((response) => response.text())
    .then((html) => {
      document.getElementById(containerId).innerHTML = html;
    })
    .catch((error) => {
      console.log("Widget loading error:", error);
    });
}

function showPage(pageId) {
  document.querySelectorAll(".page").forEach((page) => {
    page.classList.add("hidden");
  });
  document.getElementById(pageId).classList.remove("hidden");
}

function showSearchPage() {
  showPage("searchPage");
}

function showResultsPage() {
  showPage("resultsPage");
}

