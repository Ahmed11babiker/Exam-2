$(document).ready(function () {



  let isOpen = false;

  $("#toggleSidebar").on("click", function () {
    if (!isOpen) {
      $("#sidebarMenu").addClass("open");
      $(".menu-icon").addClass("move-right");
      animateNavLinks();
      $("#menuIcon").html('<i class="fa fa-times fs-3"></i>');
      isOpen = true;
    } else {
      $("#sidebarMenu").removeClass("open");
      $(".menu-icon").removeClass("move-right");
      $(".nav-link-item").css("opacity", "0");
      $("#menuIcon").html('<i class="fa fa-bars fs-3"></i>');
      isOpen = false;
    }
  });

  
   $(window).on("load", function () {
    $("#loadingSpinnerr").fadeOut(500, function () {
      $(this).remove();
      $("body").removeClass("loading");
    });
  });


 


  function animateNavLinks() {
    $(".nav-link-item").each(function (index) {
      $(this)
        .delay(100 * index)
        .animate({ opacity: 1 }, 300);
    });
  }

  // ✅ أغلق السايدبار عند الضغط على أي رابط
  $(".nav-link-item").on("click", function () {
    $("#sidebarMenu").removeClass("open");
    $(".menu-icon").removeClass("move-right");
    $(".nav-link-item").css("opacity", "0");
    $("#menuIcon").html('<i class="fa fa-bars fs-3"></i>');
    isOpen = false;
  });

  // روابط المحتوى
  $("#searchLink").on("click", function (e) {
    e.preventDefault();
    showSpinner();
    showSearchInputs();
    hideSpinner();
    closeSidebar();
  });

  $("#categoriesLink").click(function () {
    showSpinner();
    $("#mainContent").html(
      "<h2 class='text-center'>Loading Categories...</h2>"
    );

    $.getJSON(
      "https://www.themealdb.com/api/json/v1/1/categories.php",
      function (data) {
        hideSpinner();
        displayCategories(data.categories);
      }
    );
  });

  $("#areaLink").on("click", function (e) {
    showSpinner();
    e.preventDefault();
    hideSpinner();
    fetchAreas();
    closeSidebar();
  });

  $("#ingredientsLink").on("click", function (e) {
    showSpinner();
    e.preventDefault();
    hideSpinner();
    fetchIngredients();
    closeSidebar(); // تأكد من إغلاق السايد بار إذا كانت موجودة
  });

  $("#contactLink").on("click", function (e) {
    showSpinner();
    e.preventDefault();
    hideSpinner();
    showContactForm(); // دالة لتحميل نموذج الاتصال
    closeSidebar();
  });
});

function showSpinner() {
  $("#loadingSpinner").removeClass("d-none").fadeIn(200);
}

function hideSpinner() {
  $("#loadingSpinner").fadeOut(200, function () {
    $(this).addClass("d-none");
  });
}

// دالة البحث

// inputs fields

function showSearchInputs() {
  const html = `
    <div class="container py-5">
      <div class="row mb-4 g-3">
        <div class="col-md-6">
          <input type="text" id="searchByName" class="form-control" placeholder="Search by meal name">
        </div>
        <div class="col-md-6">
          <input type="text" id="searchByLetter" class="form-control" placeholder="Search by first letter" maxlength="1">
        </div>
      </div>
      <div id="searchResults" class="row g-4"></div>
    </div>
  `;

  $("#mainContent").html(html);

  // البحث بالاسم
  $("#searchByName").on("input", function () {
    const name = $(this).val().trim();
    if (name !== "") {
      searchByName(name);
    } else {
      $("#searchResults").empty();
    }
  });

  // البحث بالحرف الأول
  $("#searchByLetter").on("input", function () {
    const letter = $(this).val().trim();
    if (/^[a-zA-Z]$/.test(letter)) {
      searchByFirstLetter(letter);
    } else {
      $("#searchResults").empty();
    }
  });
}

// search by Name

function searchByName(name) {
  showSpinner();
  $.getJSON(
    `https://www.themealdb.com/api/json/v1/1/search.php?s=${name}`,
    function (data) {
      mydisplayMeals(data.meals);
      hideSpinner();
    }
  );
}

// search by Letter
function searchByFirstLetter(letter) {
  showSpinner()
  $.getJSON(
    `https://www.themealdb.com/api/json/v1/1/search.php?f=${letter}`,
    function (data) {
      mydisplayMeals(data.meals);
      hideSpinner()
    }
  );
}

function mydisplayMeals(meals) {
  let html = "";

  if (meals && meals.length > 0) {
    meals.forEach((meal) => {
      html += `
        <div class="col-md-4">
          <div class="card meal-card" data-meal-id="${meal.idMeal}" style="cursor:pointer;">
            <img src="${meal.strMealThumb}" class="card-img-top" alt="${meal.strMeal}">
            <div class="card-body text-center">
              <h5 class="card-title">${meal.strMeal}</h5>
            </div>
          </div>
        </div>
      `;
    });
  } else {
    html = `<div class="text-center text-danger">No meals found.</div>`;
  }

  $("#searchResults").html(html);
}

// Display Categoiers

function displayMeals(meals) {
  let html = "<div class='row'>";
  meals.forEach((meal) => {
    html += `
      <div class="col-md-4 mb-4">
        <div class="meal-card position-relative overflow-hidden" data-meal-id="${meal.idMeal}" style="cursor:pointer;">
          <img src="${meal.strMealThumb}" class="card-img-top" alt="${meal.strMeal}">
          <div class="meal-overlay d-flex align-items-end justify-content-center">
            <h5 class="text-white mb-3">${meal.strMeal}</h5>
          </div>
        </div>
      </div>
    `;
  });
  html += "</div>";

  // سنستخدم فقط searchResults حتى لا نحذف هيكل الصفحة
  $("#mainContent").html(html);
}

// show mealss details
function showMealDetails(mealId) {
  $("#mainContent").html(
    "<h2 class='text-center'>Loading Meal Details...</h2>"
  );

  $.getJSON(
    `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`,
    function (data) {
      const meal = data.meals[0];
      let ingredients = "";
      for (let i = 1; i <= 20; i++) {
        if (meal[`strIngredient${i}`]) {
          ingredients += `<li>${meal[`strIngredient${i}`]} - ${
            meal[`strMeasure${i}`]
          }</li>`;
        }
      }

      const detailsHTML = `
      <div class="container mt-4">
        <div class="row">
          <!-- Left side: Image and Name -->
          <div class="col-md-4">
            <img src="${meal.strMealThumb}" class="img-fluid" alt="${meal.strMeal}" style="border-radius: 10px;">
            <h3 class="text-center mt-3">${meal.strMeal}</h3>
          </div>

          <!-- Right side: Description, Ingredients, and Instructions -->
          <div class="col-md-8">
            <h5 class="text-muted">${meal.strArea} - ${meal.strCategory}</h5>
            <h6>Ingredients:</h6>
            <ul class="list-unstyled">${ingredients}</ul>
            <h6>Instructions:</h6>
            <p>${meal.strInstructions}</p>
            <div class="d-flex justify-content-start">
              <a href="${meal.strYoutube}" target="_blank" class="btn btn-danger mr-2">
                <i class="fab fa-youtube"></i> Watch Video
              </a>
              <a href="${meal.strSource}" target="_blank" class="btn btn-info">
                <i class="fas fa-link"></i> Source
              </a>
            </div>
          </div>
        </div>
      </div>
    `;
      $("#mainContent").html(detailsHTML);
    }
  );
}

// ...............
// Event when user clicks a category card
$(document).on("click", ".category-card", function () {
  const category = $(this).data("category");
  $("#mainContent").html(
    `<h2 class='text-center'>Meals in Category: ${category}</h2>`
  );

  showSpinner();

  $.getJSON(
    `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`,

    function (data) {
      displayMeals(data.meals);
      hideSpinner();
    }
  );
});

$(document).on("click", ".meal-card", function () {
  const mealId = $(this).data("meal-id");

  $("#mainContent").html(
    "<h2 class='text-center'>Loading Meal Details...</h2>"
  );
  showSpinner();
  $.getJSON(
    `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`,
    function (data) {
      const meal = data.meals[0];

      const ingredients = [];
      for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        if (ingredient && ingredient.trim() !== "") {
          ingredients.push(
            `<li class="list-group-item">${measure} ${ingredient}</li>`
          );
        }
      }

      const html = `
      <div class="container py-4">
        <div class="row">
          <div class="col-md-4">
            <img src="${
              meal.strMealThumb
            }" class="img-fluid rounded mb-3" alt="${meal.strMeal}">
            <h4>${meal.strMeal}</h4>
            <p><strong>Category:</strong> ${meal.strCategory}</p>
            <p><strong>Area:</strong> ${meal.strArea}</p>
            <a href="${
              meal.strYoutube
            }" target="_blank" class="btn btn-danger mb-3">Watch on YouTube</a>
          </div>
          <div class="col-md-8">
            <h5>Instructions</h5>
            <p>${meal.strInstructions}</p>
            <h5>Ingredients</h5>
            <ul class="list-group">
              ${ingredients.join("")}
            </ul>
          </div>
        </div>
      </div>
    `;

      $("#mainContent").html(html);
      hideSpinner();
    }
  );
});

// ...........Category Display
function displayCategories(categories) {
  let html = "<div class='row'>";
  categories.forEach((category) => {
    html += `
      <div class="col-md-4 mb-4">
        <div class="card h-100 shadow-sm category-card" data-category="${
          category.strCategory
        }" style="cursor:pointer;">
          <img src="${category.strCategoryThumb}" class="card-img-top" alt="${
      category.strCategory
    }">
          <div class="card-body">
            <h5 class="card-title text-center">${category.strCategory}</h5>
            <p class="card-text small text-muted text-center">${category.strCategoryDescription.substring(
              0,
              100
            )}...</p>
          </div>
        </div>
      </div>
    `;
  });
  html += "</div>";
  $("#mainContent").html(html);
}

// Areas

$(document).ready(function () {
  fetchDefaultMeals();

  // عند اختيار منطقة معينة
  $(document).on("click", ".area-card", function () {
    const area = $(this).data("area");
    showSpinner();
    fetchMealsByArea(area);
    hideSpinner();
  });

  $(document).on("click", ".meal-card", function () {
    const mealID = $(this).data("meal-id");
    showSpinner();
    getMealDetails(mealID);
    hideSpinner();
  });

  $("#areaLink").on("click", function (e) {
    showSpinner();
    e.preventDefault();
    fetchAreas();
    hideSpinner();
    closeSidebar();
  });
});

// جلب المناطق المتاحة من API
function fetchAreas() {
  $.getJSON(
    "https://www.themealdb.com/api/json/v1/1/list.php?a=list",
    function (data) {
      let areas = data.meals;
      let html = "<div class='row'>";
      areas.forEach((area) => {
        html += `
        <div class="col-md-4 mb-4">
          <div class="card area-card" data-area="${area.strArea}" style="cursor:pointer;">
            <div class="card-body text-center">
              <h5 class="card-title">${area.strArea}</h5>
            </div>
          </div>
        </div>
      `;
      });
      html += "</div>";
      $("#mainContent").html(html);
    }
  );
}

function fetchDefaultMeals() {
  $.getJSON(
    "https://www.themealdb.com/api/json/v1/1/search.php?s=",
    function (data) {
      let meals = data.meals;
      let html = "<div class='row'>";
      meals.slice(0, 12).forEach((meal) => {
        html += `
        <div class="col-md-4 mb-4">
           <div class="meal-card position-relative overflow-hidden" data-meal-id="${meal.idMeal}" style="cursor:pointer;">
            <img src="${meal.strMealThumb}" class="card-img-top" alt="${meal.strMeal}">
            <div class="meal-overlay d-flex align-items-end justify-content-center">
              <h5 class="text-white mb-3">${meal.strMeal}</h5>
            </div>
          </div>
        </div>
      `;
      });
      html += "</div>";
      $("#mainContent").html(html);
    }
  );
}

// fetchMealsByArea
function fetchMealsByArea(area) {
  $.getJSON(
    `https://www.themealdb.com/api/json/v1/1/filter.php?a=${area}`,
    function (data) {
      const meals = data.meals;
      let html = "<div class='row'>";
      meals.forEach((meal) => {
        html += `
        <div class="col-md-4 mb-4">
           <div class="meal-card position-relative overflow-hidden" data-meal-id="${meal.idMeal}" style="cursor:pointer;">
            <img src="${meal.strMealThumb}" class="card-img-top" alt="${meal.strMeal}">
            <div class="meal-overlay d-flex align-items-end justify-content-center">
              <h5 class="text-white mb-3">${meal.strMeal}</h5>
            </div>
          </div>
        </div>
      `;
      });
      html += "</div>";
      $("#mainContent").html(html);
    }
  );
}

// .....getMealDetails.........

function getMealDetails(mealID) {
  $.getJSON(
    `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealID}`,
    function (data) {
      const meal = data.meals[0];

      let ingredients = "";
      for (let i = 1; i <= 20; i++) {
        let ingredient = meal[`strIngredient${i}`];
        let measure = meal[`strMeasure${i}`];
        if (ingredient && ingredient.trim() !== "") {
          ingredients += `<li class="badge bg-info text-dark me-1 mb-1 p-2">${measure} ${ingredient}</li>`;
        }
      }

      const tags = meal.strTags ? meal.strTags.split(",") : [];

      let tagsHTML = "";
      if (tags.length > 0) {
        tags.forEach((tag) => {
          tagsHTML += `<li class="badge bg-danger me-1 mb-1 p-2">${tag}</li>`;
        });
      }

      const html = `
      <div class="container">
        <div class="row align-items-start">
          <div class="col-md-4 mb-4 text-center">
            <img src="${
              meal.strMealThumb
            }" class="img-fluid rounded shadow" alt="${meal.strMeal}">
            <h2 class="mt-3">${meal.strMeal}</h2>
          </div>
          <div class="col-md-8">
            <h4><i class="fas fa-info-circle text-primary me-2"></i>Instructions</h4>
            <p>${meal.strInstructions}</p>
            <h5><i class="fas fa-map-marker-alt text-success me-2"></i>Area: ${
              meal.strArea
            }</h5>
            <h5><i class="fas fa-tag text-warning me-2"></i>Category: ${
              meal.strCategory
            }</h5>
            <h5><i class="fas fa-utensils text-secondary me-2"></i>Ingredients:</h5>
            <ul class="list-unstyled d-flex flex-wrap">
              ${ingredients}
            </ul>
            ${
              tagsHTML
                ? `<h5><i class="fas fa-tags text-danger me-2"></i>Tags:</h5><ul class="list-unstyled d-flex flex-wrap">${tagsHTML}</ul>`
                : ""
            }
            <div class="mt-3">
              <a href="${
                meal.strSource
              }" target="_blank" class="btn btn-outline-primary me-2"><i class="fas fa-link"></i> Source</a>
              <a href="${
                meal.strYoutube
              }" target="_blank" class="btn btn-outline-danger"><i class="fab fa-youtube"></i> YouTube</a>
            </div>
          </div>
        </div>
      </div>
    `;

      $("#mainContent").html(html);
    }
  );
}

// ...............ingredient............

$(document).on("click", ".ingredient-card", function () {
  const ingredient = $(this).data("ingredient");
  fetchMealsByIngredient(ingredient);
});

function fetchMealsByIngredient(ingredient) {
  $.getJSON(
    `https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`,
    function (data) {
      const meals = data.meals;
      let html = "<div class='row'>";
      meals.forEach((meal) => {
        html += `
        <div class="col-md-3 mb-4">
           <div class="meal-card position-relative overflow-hidden" data-meal-id="${meal.idMeal}" style="cursor:pointer;">
            <img src="${meal.strMealThumb}" class="card-img-top" alt="${meal.strMeal}">
            <div class="meal-overlay d-flex align-items-end justify-content-center">
              <h5 class="text-white mb-3">${meal.strMeal}</h5>
            </div>
          </div>
        </div>
      `;
      });
      html += "</div>";
      $("#mainContent").html(html);
    }
  );
}

function fetchIngredients() {
  $.getJSON(
    "https://www.themealdb.com/api/json/v1/1/list.php?i=list",
    function (data) {
      const ingredients = data.meals.slice(0, 20); // عرض أول 20 مكون فقط
      let html = "<div class='row'>";

      ingredients.forEach((ingredient) => {
        html += `
        <div class="col-md-3 mb-4">
          <div class="card ingredient-card h-100 p-3 text-center" data-ingredient="${
            ingredient.strIngredient
          }" style="cursor: pointer;">
            <i class="fas fa-carrot fa-3x text-success mb-3"></i>
            <h5>${ingredient.strIngredient}</h5>
            <p class="text-muted small">${
              ingredient.strDescription?.split(" ").slice(0, 20).join(" ") ||
              "No description"
            }</p>
          </div>
        </div>
      `;
      });

      html += "</div>";
      $("#mainContent").html(html);
    }
  );
}

// .........Validation
function nameValidation() {
  return /^[a-zA-Z ]{3,}$/.test($("#nameInput").val());
}

function emailValidation() {
  return /^[\w.-]+@[\w.-]+\.\w{2,}$/.test($("#emailInput").val());
}

function phoneValidation() {
  return /^(\+?\d{1,3}[- ]?)?\d{10}$/.test($("#phoneInput").val());
}

function ageValidation() {
  const age = parseInt($("#ageInput").val());
  return age >= 10 && age <= 100;
}

function passwordValidation() {
  return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(
    $("#passwordInput").val()
  );
}

function repasswordValidation() {
  return $("#passwordInput").val() === $("#repasswordInput").val();
}

function validateForm() {
  $("#nameAlert").toggleClass("d-none", nameValidation());
  $("#emailAlert").toggleClass("d-none", emailValidation());
  $("#phoneAlert").toggleClass("d-none", phoneValidation());
  $("#ageAlert").toggleClass("d-none", ageValidation());
  $("#passwordAlert").toggleClass("d-none", passwordValidation());
  $("#repasswordAlert").toggleClass("d-none", repasswordValidation());

  const allValid =
    nameValidation() &&
    emailValidation() &&
    phoneValidation() &&
    ageValidation() &&
    passwordValidation() &&
    repasswordValidation();

  $("#submitBtn").prop("disabled", !allValid);
}

// input Events
$("input").on("input", validateForm);

function showContactForm() {
  const html = `
    <div class="container py-5">
      <h2 class="text-center mb-4">Contact Us</h2>
      <div class="row g-4">
        <div class="col-md-6">
          <input id="nameInput" type="text" class="form-control" placeholder="Name">
          <small class="text-danger d-none" id="nameAlert">Enter a valid name (at least 3 letters)</small>
        </div>
        <div class="col-md-6">
          <input id="emailInput" type="email" class="form-control" placeholder="Email">
          <small class="text-danger d-none" id="emailAlert">Enter a valid email</small>
        </div>
        <div class="col-md-6">
          <input id="phoneInput" type="text" class="form-control" placeholder="Phone">
          <small class="text-danger d-none" id="phoneAlert">Enter a valid phone number</small>
        </div>
        <div class="col-md-6">
          <input id="ageInput" type="number" class="form-control" placeholder="Age">
          <small class="text-danger d-none" id="ageAlert">Age must be between 10 and 100</small>
        </div>
        <div class="col-md-6">
          <input id="passwordInput" type="password" class="form-control" placeholder="Password">
          <small class="text-danger d-none" id="passwordAlert">Password must contain at least 1 letter, 1 number, and be 6+ chars</small>
        </div>
        <div class="col-md-6">
          <input id="repasswordInput" type="password" class="form-control" placeholder="Re-enter Password">
          <small class="text-danger d-none" id="repasswordAlert">Passwords do not match</small>
        </div>
      </div>

      <div class="text-center mt-4">
        <button id="submitBtn" class="btn btn-success px-5" disabled>Submit</button>
      </div>
      <div id="successAlertContainer" class="text-center my-3"></div>

    </div>
  `;

  $("#mainContent").html(html);

  // ربط التحقق بعد إدخال النموذج مباشرة
  $("input").on("input", validateForm);
}

$(document).on("click", "#submitBtn", function () {
  if ($("#submitBtn").prop("disabled") === false) {
    $("#successAlertContainer").html(`
      <div class="alert alert-success" role="alert">
        Your message has been sent successfully!
      </div>
    `);
  }
});



