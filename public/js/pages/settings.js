(function() {
  // DOM Handles:
  const langDropdown = document.querySelector("#lang");
  const formSettings = document.querySelector("#form-settings");
  let allBibleVersions = [];

  // Methods:

  function onSubmit(e) {
    validate(e);
    const name = document.querySelector("#name").value;
    const email = document.querySelector("#email").value;
    const lang = document.querySelector("#lang").selectedOptions[0].value;
    const langName = document.querySelector("#lang").selectedOptions[0]
      .innerText;
    const bibleVersion = document.querySelector("#bibleversion")
      .selectedOptions[0].value;
    const bibleVersionName = document.querySelector("#bibleversion")
      .selectedOptions[0].innerText;
    const saveObject = {
      translator: {
        name: name,
        email: email
      },
      lang: {
        name: langName,
        code: lang
      },
      bibleVersion: {
        name: bibleVersionName,
        code: bibleVersion
      }
    };
    localStorage.removeItem("settings");
    localStorage.setItem("settings", JSON.stringify(saveObject));
    toastPopup("Your settings have been saved.", "Saved");
  }

  function onSelectLanguage(e) {
    const selectedLanguage = e.target.selectedOptions[0].value;
    filterBibleVersionLanguages(selectedLanguage);
  }

  function filterBibleVersionLanguages(languageSelected) {
    const bibleVersionGroup = document.querySelector(
      "#bibleversion_lang_group"
    );
    const bibleVersionDropdown = document.querySelector("#bibleversion");
    const versionsForThisLanguage = allBibleVersions.filter(
      version => version.lang === languageSelected
    );
    let newOptions = "<option value='' selected>(Select)</option>";
    bibleVersionGroup.classList.add("d-none");
    bibleVersionDropdown.innerHTML = "";
    if (versionsForThisLanguage.length === 0) return;
    versionsForThisLanguage.forEach(item => {
      newOptions += `<option value=${item.code}>${item.name}</option>`;
    });
    bibleVersionDropdown.innerHTML = newOptions;
    bibleVersionGroup.classList.remove("d-none");
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
    const languagesURL = "firstprinciples-materialdesign/languages.json";
    return new Promise((resolve, reject) => {
      fetch(languagesURL)
        .then(response => response.json())
        .then(response => {
          resolve(response);
        })
        .catch(error => reject(error));
    });
  }

  function getBibleVersions() {
    return new Promise((resolve, reject) => {
      const translationsURL = "/js/json/bible-translations.json";
      fetch(translationsURL)
        .then(response => response.json())
        .then(response => {
          resolve(response);
        })
        .catch(error => reject(error));
    });
  }

  function populateBibleVersionLanguages(versions) {
    const bibleVersionDropdown = document.querySelector("#bibleversion");
    const versionsQuantity = versions.length;
    const defaultEl = document.createElement("option");
    defaultEl.textContent = "(Select)";
    defaultEl.value = "";
    bibleVersionDropdown.appendChild(defaultEl);
    for (let i = 0; i < versionsQuantity; i++) {
      const opt = versions[i];
      const el = document.createElement("option");
      el.textContent = opt.name;
      el.value = opt.code;
      el.setAttribute("data-lang", opt.lang);
      bibleVersionDropdown.appendChild(el);
    }
  }

  function populateLanguages(r) {
    const translatedLanguages = r[0];
    const allLanguages = r[1];
    allBibleVersions = r[2].translations;
    const untranslatedLanguages = allLanguages.filter(language => {
      let isTranslated = false;
      translatedLanguages.forEach(translated => {
        if (translated.iso === language.code) {
          isTranslated = true;
        }
      });
      return !isTranslated;
    });
    const untranslatedLanguagesWithBibleVersions = untranslatedLanguages.filter(
      language => {
        let hasABibleVersion = false;
        for (let i = 0; i < allBibleVersions.length; i++) {
          const versionCode = allBibleVersions[i].lang;
          const languageCode = language.code;
          if (versionCode === languageCode) {
            hasABibleVersion = true;
          }
        }
        return hasABibleVersion;
      }
    );
    const bibleVersionsAvailable = allBibleVersions.filter(version => {
      let shouldIncludeVersion = false;
      for (let i = 0; i < untranslatedLanguagesWithBibleVersions.length; i++) {
        const bibleVersionLang = version.lang;
        const untranslatedLang = untranslatedLanguagesWithBibleVersions[i].code;
        if (bibleVersionLang === untranslatedLang) {
          shouldIncludeVersion = true;
        }
      }
      return shouldIncludeVersion;
    });
    const untranslatedLanguagesQuantity =
      untranslatedLanguagesWithBibleVersions.length;
    const defaultEl = document.createElement("option");
    defaultEl.textContent = "(Select)";
    defaultEl.value = "";
    langDropdown.appendChild(defaultEl);
    populateBibleVersionLanguages(bibleVersionsAvailable);
    for (let i = 0; i < untranslatedLanguagesQuantity; i++) {
      const opt = untranslatedLanguagesWithBibleVersions[i];
      const el = document.createElement("option");
      el.textContent = opt.name;
      el.value = opt.code;
      langDropdown.appendChild(el);
    }
  }

  function retrieveAndPopulateLanguages() {
    const translatedLanguages = getTranslatedLanguages();
    const allLanguages = getAllLanguages();
    const bibleVersions = getBibleVersions();
    Promise.all([translatedLanguages, allLanguages, bibleVersions])
      .then(response => {
        populateLanguages(response);
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

  function toastPopup(message, textHeadline, textMuted) {
    const toast = document.querySelector(".toast");
    let headline = textHeadline || "";
    let headtinytext = textMuted || "";
    if (!message) return;
    toast.querySelector(".toast-body").innerText = message;
    toast.querySelector(".mr-auto").innerText = headline;
    toast.querySelector(".text-muted").innerText = headtinytext;
    $(".toast").toast("show");
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
    if (bibleVersion.selectedOptions[0].value.length === 0) {
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
    $(".toast").toast({
      animation: true,
      autohide: true,
      delay: 5000
    });
  }

  // Listeners:
  langDropdown.addEventListener("change", onSelectLanguage, false);
  formSettings.addEventListener("submit", onSubmit, false);

  // Initialize:
  init();
})();
