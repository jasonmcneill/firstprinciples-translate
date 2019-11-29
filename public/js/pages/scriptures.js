(function() {
  // Handles
  const domparser = new DOMParser();
  const scripturelist = document.querySelector("#scripturelist");
  const spinnerHTML = `
    <div class="spinner-border text-primary" role="status">
      <span class="sr-only">Loading...</span>
    </div>
  `;

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
    retrieveKeys()
      .then(r => retrieveScriptures(r.scriptures))
      .catch(error => console.error(error));
  }

  function retrieveScriptures(scriptureKeys) {
    const scriptures = [];
    scriptureKeys.forEach(obj => {
      scriptures.push(retrieveScripture(obj));
    });
    scripturelist.innerHTML = spinnerHTML;
    let refsHTML = "";
    Promise.all(scriptures).then(scriptureObjects => {
      localStorage.setItem("scriptures-meta", JSON.stringify(scriptureObjects));
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
        .forEach(item =>
          item.addEventListener("click", onScriptureClick, false)
        );
    });
  }

  function retrieveScripture(obj) {
    return new Promise((resolve, reject) => {
      const url = `./firstprinciples-materialdesign/lang/template/scriptures/${obj.key}/content.xml`;
      fetch(url)
        .then(r => r.text())
        .then(xml => {
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

  function init() {
    getScriptures();
  }

  init();
})();
