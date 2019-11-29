(function() {
  const scripturelist = document.querySelector("#scripturelist");

  function onScriptureClick(e) {
    e.preventDefault();
    const scriptureKey = e.target.getAttribute("data-key");
    editScripture(scriptureKey);
  }

  function editScripture(scriptureKey) {
    console.log("Editing " + scriptureKey);
    // TODO
  }

  function retrieveKeys() {
    const url = "./firstprinciples-materialdesign/lang/template/keys.json";
    return new Promise((resolve, reject) => {
      fetch(url)
        .then(r => r.json())
        .then(r => resolve(r))
        .catch(error => reject(error));
    });
  }

  function getScriptures() {
    getScripturesMeta()
      .then(scripturesMeta => renderScriptures(scripturesMeta))
      .catch(error => console.error(error));
  }

  function getScripturesMeta() {
    return new Promise((resolve, reject) => {
      localforage
        .getItem("scriptures-meta")
        .then(result => {
          if (!result)
            throw new Error("scripture metadata not found in indexedDB");
          resolve(result);
        })
        .catch(() => {
          buildScripturesMeta()
            .then(result => storeScripturesMeta(result))
            .then(result => resolve(result))
            .catch(error2 => reject(error2));
        });
    });
  }

  function buildScripturesMeta() {
    return new Promise((resolve, reject) => {
      retrieveKeys()
        .then(result => retrieveScriptureFiles(result.scriptures))
        .then(result => storeScripturesMeta(result))
        .then(result => resolve(result))
        .catch(error => reject(error));
    });
  }

  function retrieveScriptureFiles(scriptureKeys) {
    return new Promise((resolve, reject) => {
      const scriptures = [];
      scriptureKeys.forEach(obj => {
        scriptures.push(retrieveScripture(obj));
      });
      showSpinner();
      Promise.all(scriptures)
        .then(scriptureObjects => resolve(scriptureObjects))
        .catch(error => reject(error));
    });
  }

  function storeScripturesMeta(scriptureObjects) {
    return new Promise((resolve, reject) => {
      localforage
        .setItem("scriptures-meta", scriptureObjects)
        .then(result => resolve(result))
        .catch(error => reject(error));
    });
  }

  function renderScriptures(scriptureObjects) {
    let refsHTML = "";

    scriptureObjects.forEach(obj => {
      refsHTML += `
        <tr>
          <td>
            <a href="#" data-key="${obj.key}">
              ${obj.title}
            </a>
          </td>
          <td class="text-center">
            ${
              obj.done
                ? '<i class="fas fa-check-circle fa-2x" style="color: green"></i>'
                : "&mdash;</i>"
            }
          </td>
        </tr>
      `;
    });
    refsHTML = `<tbody>${refsHTML}</tbody>`;
    refsHTML = `
      <thead>
        <tr>
          <th>Scripture</th>
          <th class="text-center">Done?</th>
        </tr>
      </thead>
      ${refsHTML}
    `;
    refsHTML = `<table class="table table-bordered table-striped">${refsHTML}</table>`;
    scripturelist.innerHTML = refsHTML;
    scripturelist
      .querySelectorAll("a")
      .forEach(item => item.addEventListener("click", onScriptureClick, false));
  }

  function retrieveScripture(obj) {
    return new Promise((resolve, reject) => {
      const url = `./firstprinciples-materialdesign/lang/template/scriptures/${obj.key}/content.xml`;
      fetch(url)
        .then(r => r.text())
        .then(xml => {
          const domparser = new DOMParser();
          const doc = domparser.parseFromString(xml, "application/xml");
          const scriptureReference = doc
            .querySelector("passage")
            .getAttribute("title-en");
          const scriptureObject = {
            key: obj.key,
            title: scriptureReference,
            done: false
          };
          resolve(scriptureObject);
        })
        .catch(error => reject(error));
    });
  }

  function showSpinner() {
    const spinnerHTML = `
      <div class="spinner-border text-primary" role="status">
        <span class="sr-only">Loading...</span>
      </div>
    `;
    scripturelist.innerHTML = spinnerHTML;
  }

  function init() {
    getScriptures();
  }

  init();
})();
