(function() {
  // DOM Handles:
  const langDropdown = document.querySelector("#lang");
  const bibleLangDropdown = document.querySelector("#bibleversion_lang");
  const formSettings = document.querySelector("#form-settings");

  // Methods:

  function onSubmit(e) {
    validate(e);
  }

  function onSelectLanguage(e) {
    populateBibleVersionLanguage(e);
  }

  function getAllLanguages() {
    return new Promise((resolve, reject) => {
      fetch("/js/json/ISO-639-1-language.json")
        .then(r => r.json())
        .then(r => {
          resolve(r);
        })
        .catch(error => reject(error));
    });
  }

  function getTranslatedLanguages() {
    return new Promise((resolve, reject) => {
      fetch("firstprinciples-materialdesign/languages.json")
        .then(r => r.json())
        .then(r => {
          resolve(r);
        })
        .catch(error => reject(error));
    });
  }

  function populateBibleVersionLanguage(e) {
    let response = "";
    if (e.target.value.length === 2) {
      response = ` for ${e.target.selectedOptions[0].innerText}`;
    }
    bibleLangDropdown.innerText = response;
  }

  function populateLanguages(r) {
    const translatedLanguages = r[0];
    const allLanguages = r[1];
    const untranslatedLanguages = allLanguages.filter(language => {
      let isTranslated = false;
      translatedLanguages.forEach(translated => {
        if (translated.iso === language.code) {
          isTranslated = true;
        }
      });
      return !isTranslated;
    });
    const untranslatedLanguagesQuantity = untranslatedLanguages.length;
    const defaultEl = document.createElement("option");
    defaultEl.textContent = "(Select)";
    defaultEl.value = "";
    langDropdown.appendChild(defaultEl);
    for (let i = 0; i < untranslatedLanguagesQuantity; i++) {
      const opt = untranslatedLanguages[i];
      const el = document.createElement("option");
      el.textContent = opt.name;
      el.value = opt.code;
      langDropdown.appendChild(el);
    }
  }

  function retrieveAndPopulateLanguages() {
    const translatedLanguages = getTranslatedLanguages();
    const allLanguages = getAllLanguages();
    Promise.all([translatedLanguages, allLanguages])
      .then(r => {
        populateLanguages(r);
      })
      .catch(error => console.error(error));
  }

  function resetValidation() {
    const formFields = document.querySelectorAll("input[type=text], select");
    formFields.forEach(item => {
      item.classList.remove("is-invalid");
      item.classList.remove("is-valid");
    });
  }

  function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  function validate(e) {
    let errorCount = 0;
    resetValidation();

    // Name
    const name = document.querySelector("#name");
    if (name.value.trim().length === 0) {
      errorCount++;
      name.classList.add("is-invalid");
    }

    // E-mail
    const email = document.querySelector("#email");
    const emailError = email.parentElement.querySelector(".invalid-feedback");
    const isValidEmailFormat = validateEmail(email.value);
    emailError.innerText = "Please input your e-mail address.";
    if (email.value.length === 0) {
      errorCount++;
      email.classList.add("is-invalid");
    } else if (isValidEmailFormat === false) {
      errorCount++;
      emailError.innerText =
        "Please check your e-mail address for proper formatting.";
      email.classList.add("is-invalid");
    } else {
      email.classList.remove("is-invalid");
    }

    // Translating into language
    const lang = document.querySelector("#lang");
    if (lang.selectedOptions[0].value.length === 0) {
      errorCount++;
      lang.classList.add("is-invalid");
    }

    // Bible version
    const bibleVersion = document.querySelector("#bibleversion");
    if (bibleVersion.value.length === 0) {
      errorCount++;
      bibleVersion.classList.add("is-invalid");
    }

    // Final check
    if (errorCount >= 1) {
      e.preventDefault();
    } else {
      e.preventDefault();
    }
  }

  function init() {
    retrieveAndPopulateLanguages();
  }

  // Listeners:
  langDropdown.addEventListener("change", onSelectLanguage, false);
  formSettings.addEventListener("submit", onSubmit, false);

  // Initialize:
  init();
})();
