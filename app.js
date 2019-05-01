"use strict";

// * intentionally not using prototypes in 'classes' to define methods

var app = function() {
  var currentCategory = { name: "", exercises: [] };

  var btnNewCateogry = document.getElementById("btnDodajKategoriju");
  var tbNewCategoryName = document.getElementById("tbKategorijaNaziv");
  var ulCategories = document.querySelector("ul.kategorije");
  var btnNewExercise = document.getElementById("btnDodajVjezbu");
  var tbNewExerciseName = document.getElementById("tbVjezbaNaziv");
  var tbNewExerciseReps = document.getElementById("tbVjezbaPonavljanja");
  var taNewExerciseDesc = document.getElementById("taVjezbaOpis");
  var ulExercises = document.querySelector("ul.vjezbe");
  var spanCategory = document.getElementById("trenutna-kategorija");

  var Category = function(name, exercises, data) {
    var self = this;

    this.name = name || data.name;
    this.exercises =
      exercises ||
      (data &&
        data.exercises &&
        data.exercises.map(function(eData) {
          return new Exercise(null, null, null, eData);
        })) ||
      [];

    // clears previous UI and "redraw":
    var setCurrentCategoryAndRender = function() {
      ulExercises.innerHTML = "";
      currentCategory = self;
      window.location.hash = "#" + currentCategory.name;
      spanCategory.innerHTML = currentCategory.name;

      self.exercises.forEach(function(ex) {
        ulExercises.appendChild(ex.createExerciseElement());
      });
    };

    this.setCurrentCategoryAndRender = setCurrentCategoryAndRender;

    this.createCategoryElement = function() {
      var anchor = document.createElement("a");
      anchor.href = "#" + self.name;
      anchor.innerHTML = self.name;
      anchor.onclick = self.setCurrentCategoryAndRender;

      var btnRemoveCategory = document.createElement("input");
      btnRemoveCategory.type = "button";
      btnRemoveCategory.value = "Ukloni";
      btnRemoveCategory.onclick = function(btnSender) {
        var categoryToRemove = btnSender.target.previousSibling.innerHTML;
        categoriesDb().removeByNameAndSave(categoryToRemove);
        btnSender.target.parentElement.remove();
      };

      var li = document.createElement("li");
      li.appendChild(anchor);
      li.appendChild(btnRemoveCategory);

      return li;
    };
  };

  var Exercise = function(name, reps, description, data) {
    var self = this;

    this.name = name || (data && data.name) || "";
    this.reps = reps || (data && data.reps) || 1;
    this.description = description || (data && data.description) || "";

    this.createExerciseElement = function() {
      var h4Name = document.createElement("h4");
      h4Name.innerHTML = self.name;
      h4Name.classList = "naziv";

      var btnRemoveExercise = document.createElement("input");
      btnRemoveExercise.type = "button";
      btnRemoveExercise.value = "Ukloni";
      btnRemoveExercise.classList = "btn-ukloni-vjezbu";
      btnRemoveExercise.onclick = function(btnSender) {
        var exerciseToRemove = btnSender.target.previousSibling.innerHTML
          .toLowerCase()
          .trim();
        var removeOnIndex = currentCategory.exercises.findIndex(function(ex) {
          return ex.name.toLowerCase().trim() == exerciseToRemove;
        });

        currentCategory.exercises.splice(removeOnIndex, removeOnIndex + 1);
        categoriesDb().saveCategory(currentCategory);

        btnSender.target.parentElement.parentElement.remove();
      };

      var clearfix = document.createElement("div");
      clearfix.classList = "clearfix";

      var nameAndBtnDiv = document.createElement("div");

      nameAndBtnDiv.appendChild(h4Name);
      nameAndBtnDiv.appendChild(btnRemoveExercise);
      nameAndBtnDiv.appendChild(clearfix);

      var repsDiv = document.createElement("div");
      repsDiv.classList = "broj-ponavljanja";
      repsDiv.innerHTML = self.reps + "x";

      var descPara = document.createElement("p");
      descPara.classList = "opis";
      descPara.innerHTML = self.description;

      var li = document.createElement("li");
      li.classList = "vjezba";
      li.appendChild(nameAndBtnDiv);
      li.appendChild(repsDiv);
      li.appendChild(descPara);

      return li;
    };
  };

  btnNewCateogry.onclick = function() {
    if (tbNewCategoryName.value.trim().length < 1) {
      alert("Niste unijeli naziv kategorije.");
      return;
    }

    if (categoriesDb().existsByName(tbNewCategoryName.value)) {
      alert("Kategorija s odabranim nazivom već postoji.");
      return;
    }

    var isFirstCategory = categoriesDb().getAll().length == 0;

    var newCategory = categoriesDb().saveCategory(
      new Category(tbNewCategoryName.value)
    );
    ulCategories.appendChild(newCategory.createCategoryElement());

    tbNewCategoryName.value = "";
    ulCategories.scrollTo(0, ulCategories.scrollHeight);

    if (isFirstCategory) {
      newCategory.setCurrentCategoryAndRender();
    }
  };

  btnNewExercise.onclick = function() {
    if (currentCategory.name == "") {
      alert("Za dodavanje vježbe mora postojati kategorija i biti trenutno odabrana.");
      return;
    }

    var newExerciseName = tbNewExerciseName.value.toLowerCase().trim();

    if (newExerciseName.length < 1) {
      alert("Niste unijeli naziv vježbe.");
      return;
    }

    var exerciseExists = currentCategory.exercises.some(function(ex) {
      return ex.name.toLowerCase().trim() == newExerciseName;
    });

    if (exerciseExists) {
      alert("Vježba s odabranim nazivom već postoji u trenutnoj kategoriji.");
      return;
    }

    var newExercise = new Exercise(
      tbNewExerciseName.value,
      tbNewExerciseReps.value,
      taNewExerciseDesc.value
    );

    currentCategory.exercises.push(newExercise);
    categoriesDb().saveCategory(currentCategory);
    ulExercises.appendChild(newExercise.createExerciseElement());

    tbNewExerciseReps.value = 1;
    tbNewExerciseName.value = taNewExerciseDesc.value = "";

    ulExercises.scrollTo(0, ulExercises.scrollHeight);
  };

  var categoriesDb = function() {
    var categoriesJson = localStorage.getItem("categories");
    var _categories = [];

    if (categoriesJson) {
      _categories = JSON.parse(categoriesJson).map(function(cData) {
        return new Category(null, null, cData);
      });
    }

    var _saveToStorage = function() {
      localStorage.setItem("categories", JSON.stringify(_categories));
      return _categories;
    };

    var _categoryExistsByName = function(categoryName) {
      categoryName = categoryName && categoryName.toLowerCase().trim();

      return _categories.some(function(cat) {
        return cat.name.toLowerCase().trim() == categoryName;
      });
    };

    var _getCategoryByName = function(categoryName) {
      categoryName = categoryName && categoryName.toLowerCase().trim();

      return _categories.find(function(cat) {
        return cat.name.toLowerCase().trim() == categoryName;
      });
    };

    return {
      getAll: function() {
        return _categories;
      },
      saveCategory: function(category) {
        if (category) {
          var existingCategory = _getCategoryByName(category.name);

          if (existingCategory) {
            existingCategory.exercises = category.exercises;
          } else {
            _categories.push(category);
          }

          _saveToStorage();
          console.log("Saved new category: ", category);
        }

        return category;
      },
      removeByNameAndSave: function(categoryName) {
        categoryName = categoryName && categoryName.toLowerCase().trim();

        var removeOnIndex = _categories.findIndex(function(c) {
          return c.name.toLowerCase().trim() == categoryName;
        });

        _categories.splice(removeOnIndex, removeOnIndex + 1);
        _saveToStorage();

        if (_categories.length == 0) {
          currentCategory = { name: "", exercises: [] };
          spanCategory.innerHTML = "";
        }

        if (currentCategory.name == categoryName) {
          _categories[0].setCurrentCategoryAndRender();
        }

        console.log("Category '" + categoryName + "' removed.");
      },
      existsByName: _categoryExistsByName
    };
  };

  // initialize program:
  var allCategories = categoriesDb().getAll();
  var firstCategory = allCategories[0];

  if (firstCategory) {
    firstCategory.setCurrentCategoryAndRender();

    allCategories.forEach(function(c) {
      ulCategories.appendChild(c.createCategoryElement());
    });
  }
};

window.addEventListener("DOMContentLoaded", app);
