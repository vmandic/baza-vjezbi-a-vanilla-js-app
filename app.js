"use strict";

var app = function() {
  var btnNewCateogry = document.getElementById("btnDodajKategoriju");
  var tbNewCategoryName = document.getElementById("tbKategorijaNaziv");
  var ulCategories = document.querySelector("ul.kategorije");
  var btnNewExercise = document.getElementById("btnDodajVjezbu");
  var tbNewExerciseName = document.getElementById("tbVjezbaNaziv");
  var tbNewExerciseReps = document.getElementById("tbVjezbaPonavljanja");
  var taNewExerciseDesc = document.getElementById("taVjezbaOpis");
  var ulExercises = document.querySelector("ul.vjezbe");
  var spanCategory = document.getElementById("trenutna-kategorija");

  var Category = function(name, exercises) {
    if (!name || name.length < 1) {
      throw new Error("Invalid category name");
    }
    var self = this;
    this.name = name;
    this.exercises = exercises || [];

    // clears previous UI and "redraw":
    var setCurrentCategoryAndRenderToUi = function() {
      ulExercises.innerHTML = "";
      currentCategory = self;
      spanCategory.innerHTML = currentCategory.name;

      self.exercises.forEach(function(ex) {
        var exElement = ex.createExerciseElement();
        ulExercises.appendChild(exElement);
      });
    };

    this.renderToUi = setCurrentCategoryAndRenderToUi;

    this.createCategoryElement = function() {
      var anchor = document.createElement("a");
      anchor.href = "#" + name;
      anchor.innerHTML = name;
      anchor.onclick = setCurrentCategoryAndRenderToUi;

      var btnRemoveCategory = document.createElement("input");
      btnRemoveCategory.type = "button";
      btnRemoveCategory.value = "Ukloni";
      btnRemoveCategory.onclick = function(btnSender) {
        var categoryToRemove = btnSender.target.previousSibling.innerHTML;
        var removeOnIndex = categories.findIndex(function(c) {
          return c.name == categoryToRemove;
        });

        if (currentCategory == categoryToRemove) {
          ulExercises.innerHTML = "";
          spanCategory.innerHTML = "";
        }

        categories.splice(removeOnIndex, removeOnIndex + 1);
        btnSender.target.parentElement.remove();
      };

      var li = document.createElement("li");
      li.appendChild(anchor);
      li.appendChild(btnRemoveCategory);

      return li;
    };
  };

  var Exercise = function(name, reps, description) {
    if (!name || name.length < 1) {
      throw new Error("Invalid exercise name");
    }

    this.name = name;
    this.reps = reps;
    this.description = description;

    this.createExerciseElement = function() {
      var h4Name = document.createElement("h4");
      h4Name.innerHTML = name;
      h4Name.classList = "naziv";

      var btnRemoveExercise = document.createElement("input");
      btnRemoveExercise.type = "button";
      btnRemoveExercise.value = "Ukloni";
      btnRemoveExercise.classList = "btn-ukloni-vjezbu";
      btnRemoveExercise.onclick = function(btnSender) {
        var exerciseToRemove = btnSender.target.previousSibling.innerHTML;
        var removeOnIndex = currentCategory.exercises.findIndex(function(ex) {
          return ex.name == exerciseToRemove;
        });

        currentCategory.exercises.splice(removeOnIndex, removeOnIndex + 1);
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
      repsDiv.innerHTML = reps + "x";

      var descPara = document.createElement("p");
      descPara.classList = "opis";
      descPara.innerHTML = description;

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

    var exerciseExist = categories.some(function(cat) {
      cat.name.toLowerCase().trim() ==
        tbNewCategoryName.value.toLowerCase().trim();
    });

    if (exerciseExist) {
      alert("Kategorija s odabranim nazivom već postoji.");
      return;
    }

    var newCategory = new Category(tbNewCategoryName.value);

    categories.push(newCategory);
    ulCategories.appendChild(newCategory.createCategoryElement());
  };

  btnNewExercise.onclick = function() {
    if (tbNewExerciseName.value.trim().length < 1) {
      alert("Niste unijeli naziv vježbe.");
      return;
    }

    var exerciseExists = currentCategory.exercises.some(function(ex) {
      return (
        ex.name.toLowerCase().trim() ==
        tbNewExerciseName.value.toLowerCase().trim()
      );
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
    ulExercises.appendChild(newExercise.createExerciseElement());
  };

  // initialize the application and UI:
  var currentCategory = {};
  var categories = [
    new Category("Ruke", [
      new Exercise("vježba 1", 3, "Lorem ipsum..."),
      new Exercise("vježba 2", 2, "Lorem ipsum...")
    ]),
    new Category("Noge", [
      new Exercise("vježba 3", 3, "Lorem ipsum..."),
      new Exercise("vježba 4", 15, "Lorem ipsum..."),
      new Exercise("vježba 5", 4, "Lorem ipsum...")
    ]),
    new Category("Prsa", [
      new Exercise("vježba 6", 10, "Lorem ipsum..."),
      new Exercise("vježba 7", 20, "Lorem ipsum...")
    ])
  ];

  currentCategory = categories[0];
  currentCategory.renderToUi();

  categories.forEach(function(c) {
    ulCategories.appendChild(c.createCategoryElement());
  });
};

window.addEventListener("DOMContentLoaded", app);
