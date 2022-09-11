const mealsEle = document.getElementById("meals");
const favouriteContainer = document.getElementById("fav-meals");
const mealPopup = document.getElementById("meal-popup");
const popupCloseBtn = document.getElementById("close-popup");
const mealInfoEl = document.getElementById("meal-info");

const searchTerm = document.getElementById("search-term");
const searchBtn = document.getElementById("search");

getRandomMeal();
fetchFavMeals();

async function getRandomMeal() {
  const resp = await fetch(
    "https://www.themealdb.com/api/json/v1/1/random.php"
  );

  // response fetched, got the promise response

  const respData = await resp.json();
  // converted it to json

  const randomMeal = respData.meals[0];
  // it is an object which contains array of length 1

  addMeal(randomMeal, true);

  // console.log(randomMeal)
}

async function getMealById(id) {
  const resp = await fetch(
    "https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + id
  );

  const respData = await resp.json();

  const meal = respData.meals[0];
  return meal;
}

async function getMealBySearch(term) {
  const resp = await fetch(
    "https://www.themealdb.com/api/json/v1/1/search.php?s=" + term
  );

  const respData = await resp.json();

  const meals = respData.meals;

  return meals;
}

function addMeal(mealData, random = false) {
  const meal = document.createElement("div");
  meal.classList.add("meal");

  meal.innerHTML = `
  <div class='add-meal-container'>
    <div class="meal-header">
    ${random ? `<span class="random">Random Recipe</span>` : " "}
    <img src="${mealData.strMealThumb}"
        alt="${mealData.strMeal}">
    </div>
    <div class="meal-body">
        <h3>${mealData.strMeal}</h3>
        
        </div>
    <div class='button-container'> <button class="fav-btn">
    <i class="fa-solid fa-heart"></i>
    </button> </div>
    </div>`;

  // const btn = meal.querySelector(".meal-body .fav-btn");
  const btn = meal.querySelector(".fav-btn");

  btn.addEventListener("click", () => {
    if (btn.classList.contains("active")) {
      removeMealFromLS(mealData.idMeal);
      btn.classList.remove("active");
    } else {
      addMealToLS(mealData.idMeal);
      btn.classList.toggle("active");
    }

    // clean the container
    favouriteContainer.innerHTML = "";
    fetchFavMeals();
  });

  const popup = meal.querySelector(".meal-body");
  const popupTwo = meal.querySelector(".meal-header");

  popup.addEventListener("click", () => {
    showMealInfo(mealData);
  });
  popupTwo.addEventListener("click", () => {
    showMealInfo(mealData);
  });

  mealsEle.appendChild(meal);
}

function addMealToLS(mealId) {
  const mealIds = getMealsFromLS();

  localStorage.setItem("mealIds", JSON.stringify([...mealIds, mealId]));
}

function removeMealFromLS(mealId) {
  const mealIds = getMealsFromLS();

  localStorage.setItem(
    "mealIds",
    JSON.stringify(mealIds.filter((id) => id !== mealId))
  );
}

function getMealsFromLS() {
  const mealIds = JSON.parse(localStorage.getItem("mealIds"));

  return mealIds === null ? [] : mealIds;
}

async function fetchFavMeals() {
  // clean the container
  favouriteContainer.innerHTML = "";

  const mealIds = getMealsFromLS();

  const meals = [];

  let i = 0;
  for (i = 0; i < mealIds.length; i++) {
    const mealId = mealIds[i];

    let meal = await getMealById(mealId);

    addMealToFav(meal);
  }

  if (i === 0) {
    favouriteContainer.innerHTML = `No recipes to show! Click on &nbsp<i class="fa-solid fa-heart"></i> to save your favourite recipe!`;
  }
}

function addMealToFav(mealData) {
  const favMeal = document.createElement("li");

  favMeal.innerHTML = `
    <li>
      <div class='curr-fav-meal'>
        <img
            src="${mealData.strMealThumb}"
            alt="${mealData.strMeal}">
            <span>${mealData.strMeal}</span>
        </img>
      </div>
      <div>
        <button class="clear"><i class="fa-solid fa-xmark"></i></button>
      </div>
    </li>`;

  const clearBtn = favMeal.querySelector(".clear");

  clearBtn.addEventListener("click", () => {
    removeMealFromLS(mealData.idMeal);

    fetchFavMeals();
  });

  const popupFavMeal = favMeal.querySelector(".curr-fav-meal");

  popupFavMeal.addEventListener("click", () => {
    showMealInfo(mealData);
  });

  favouriteContainer.appendChild(favMeal);
}

searchBtn.addEventListener("click", async (e) => {
  // clean container
  // mealsEle dom element
  mealsEle.innerHTML = "";

  const search = searchTerm.value;

  if (search.length > 0) {
    const meals = await getMealBySearch(search);

    if (meals) {
      meals.forEach((meal) => {
        addMeal(meal);
      });
    }
  } else {
    getRandomMeal();
  }
});

popupCloseBtn.addEventListener("click", () => {
  mealPopup.classList.add("hidden");
});

function showMealInfo(mealData) {
  // clean it up
  mealInfoEl.innerHTML = "";

  // update the meal info
  const mealEl = document.createElement("div");

  // get ingredients and measures. there are 20 ingredients in data
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    if (mealData["strIngredient" + i]) {
      ingredients.push(
        `${mealData["strIngredient" + i]} - ${mealData["strMeasure" + i]}`
      );
    } else {
      break;
    }
  }

  mealEl.innerHTML = `
  <h1>${mealData.strMeal}</h1>
  <img src="${mealData.strMealThumb}" alt="{mealData.strMeal}">
  <p>${mealData.strInstructions}</p>
  <h3>Ingredients</h3>
  <ul>
    ${ingredients.map((ing) => `<li>${ing}</li>`).join("")}
  </ul>
  `;

  // show the popup
  mealPopup.classList.remove("hidden");

  mealInfoEl.appendChild(mealEl);
}
