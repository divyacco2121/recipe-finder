const BASE_URL = 'www.themealdb.com/api/json/v1/1/search.php?s=Arrabiata';  // Test key '1' baked in—no signup!

let currentRecipes = [];

window.onload = function () {
  fetchJoke();
};

function fetchJoke() {
  // TheMealDB doesn't have jokes, so we'll skip or mock one for fun
  document.getElementById("joke").textContent = "Why did the chef quit? The food wasn't cutting it! Ready to find some recipes?";
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

  // Filter by main ingredient (e.g., "chicken")
  fetch(`${BASE_URL}filter.php?i=${ingredients}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.meals && data.meals.length > 0) {
        currentRecipes = data.meals;
        displayRecipes(data.meals, "ingredients");
      } else {
        recipesList.innerHTML = '<p class="loading">No recipes found. Try something else!</p>';
      }
      showPage("resultsPage");
    })
    .catch((error) => {
      recipesList.innerHTML = '<p class="loading">Error loading recipes. Check your connection.</p>';
    });
}

function fetchRandomRecipes() {
  const recipesList = document.getElementById("recipesList");
  recipesList.innerHTML = '<p class="loading">Finding random recipes...</p>';

  // Get 5 random (loop for multiples since API does one at a time)
  Promise.all(Array(5).fill().map(() => fetch(`${BASE_URL}random.php`)))
    .then((responses) => Promise.all(responses.map(r => r.json())))
    .then((dataArray) => {
      currentRecipes = dataArray.map(d => d.meals[0]);  // Extract meal from each
      displayRecipes(currentRecipes, "random");
      showPage("resultsPage");
    })
    .catch((error) => {
      recipesList.innerHTML = '<p class="loading">Error loading recipes. Check your connection.</p>';
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
                <p>Category: ${recipe.strCategory || "N/A"}</p>
                <p>Area: ${recipe.strArea || "N/A"}</p>
            `;
    } else {
      details = `
                <p>Category: ${recipe.strCategory || "N/A"}</p>
                <p>Area: ${recipe.strArea || "N/A"}</p>
            `;
    }

    card.innerHTML = `
            <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}">
            <div class="recipe-info">
                <h3><a href="#" onclick="showRecipeDetail('${recipe.idMeal}'); return false;">${recipe.strMeal}</a></h3>
                ${details}
            </div>
        `;

    recipesList.appendChild(card);
  });
}

function showRecipeDetail(mealId) {
  const detailDiv = document.getElementById("recipeDetail");
  detailDiv.innerHTML = '<p class="loading">Loading recipe details...</p>';
  showPage("detailPage");

  fetch(`${BASE_URL}lookup.php?i=${mealId}`)
    .then((response) => response.json())
    .then((data) => {
      const recipe = data.meals[0];
      detailDiv.innerHTML = `
            <div class="recipe-detail">
                <div class="recipe-header">
                    <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}">
                    <div class="recipe-header-info">
                        <h1>${recipe.strMeal}</h1>
                        <p>Category: ${recipe.strCategory}</p>
                        <p>Area: ${recipe.strArea}</p>
                    </div>
                </div>
                <div class="instructions">
                    <h3>Instructions:</h3>
                    <p>${recipe.strInstructions || "No instructions available."}</p>
                </div>
                <div class="widget-container">
                    <h3>Ingredients:</h3>
                    <ul>
                        ${Array.from({length: 20}, (_, i) => {
                          const ing = recipe[`strIngredient${i+1}`];
                          const meas = recipe[`strMeasure${i+1}`];
                          return ing ? `<li>${meas} ${ing}</li>` : '';
                        }).join('')}
                    </ul>
                </div>
            </div>
        `;
    })
    .catch((error) => {
      detailDiv.innerHTML = '<p class="loading">Error loading recipe details.</p>';
    });
}

// Remove fetchWidget since no widgets—ingredients now in details

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

