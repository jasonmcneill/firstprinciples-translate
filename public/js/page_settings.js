(function() {
  // DOM Handles:
  const langDropdown = document.querySelector("#lang");
  const bibleLangDropdown = document.querySelector("#bibleversion_lang");
  const formSettings = document.querySelector("#form-settings");

  // Methods:

  function onSubmit(e) {
    console.log("Form submitted", e);
    e.preventDefault();
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

  function init() {
    retrieveAndPopulateLanguages();
  }

  // Listeners:
  langDropdown.addEventListener("change", onSelectLanguage, false);
  formSettings.addEventListener("click", onSubmit, false);

  // Initialize:
  init();
})();
