(function() {
  const scripturelist = document.querySelector("#scripturelist");
  const TEMPLATE_ROOT = "./firstprinciples-materialdesign/lang/template";
  const modalCancelButton = document
    .querySelector("#scriptureModal")
    .querySelector("[data-dismiss=modal]");

  function onScriptureClick(e) {
    e.preventDefault();
    const scriptureKey = e.target.getAttribute("data-key");
    editScripture(scriptureKey);
  }

  function retrieveKeys() {
    const url = `${TEMPLATE_ROOT}/keys.json`;
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
            <a 
              href="#" 
              data-key="${obj.key}" 
              data-toggle="modal" 
              data-target="#scriptureModal">
              ${obj.title} 
              <i class="ml-3 fas fa-external-link-alt"></i>
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
      const url = `${TEMPLATE_ROOT}/scriptures/${obj.key}/content.xml`;
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

  async function editScripture(scriptureKey) {
    const modal = document.querySelector("#scriptureModal");
    const modalLabel = document.querySelector("#scriptureModalLabel");
    const modalBody = modal.querySelector(".modal-body");
    modalLabel.innerText = "";
    modalBody.innerHTML = "";
    let scriptureHTML = "";
    const domparser = new DOMParser();
    const url = `${TEMPLATE_ROOT}/scriptures/${scriptureKey}/content.xml`;
    const doc = await fetch(url)
      .then(r => r.text())
      .then(r => domparser.parseFromString(r, "application/xml"));
    const titleEn = doc.querySelector("passage").getAttribute("title-en");
    const bookEn = doc.querySelector("passage").getAttribute("book-en");
    const chapters = doc.querySelectorAll("chapter");
    chapters.forEach(chapter => {
      let chapterHTML = "";
      const chapterNumberEn = chapter.getAttribute("number-en");
      const verses = chapter.querySelectorAll("verse");
      chapterHTML += `<div class="form-group row chapter">`;
      chapterHTML += `  <div class="col-sm-2 pt-1"><strong>Chapter ${chapterNumberEn}</strong></div>`;
      chapterHTML += `  <div class="col-sm-3"><div class="input-group"><div class="input-group-prepend"><span class="input-group-text">Chapter:</span></div><input size="3" maxlength="3" class="form-control chapterNumberInput" type="tel" pattern=[0-9] placeholder="#"></div></div>`;
      chapterHTML += `</div>`;
      verses.forEach(verse => {
        let verseHTML = "";
        const verseNumberEn = verse.getAttribute("number-en");
        const hasJesusWords = verse.hasAttribute("jesuswords");
        const hasScriptureQuote = verse.hasAttribute("scripturequote");
        verseHTML += `<div class="form-group row verse">`;
        verseHTML += `  <div class="col-sm-2 pt-1"><strong>Verse ${verseNumberEn}</strong></div>`;
        verseHTML += `  <div class="col-sm-10"><div class="input-group mb-2"><div class="input-group-prepend"><span class="input-group-text">Verse:</span><br><input size="3" maxlength="3" class="form-control verseNumberInput" type="tel" pattern=[0-9] data-chapter-number="${chapterNumberEn}" data-verse-number="${verseNumberEn}" placeholder="#"></div></div><textarea rows="4" class="form-control verseTextInput" data-chapter-number="${chapterNumberEn}" data-verse-number="${verseNumberEn}" data-has-jesus-words="${hasJesusWords}" data-has-scripture-quote="${hasScriptureQuote}"></textarea></div>`;
        verseHTML += `</div>`;
        chapterHTML += verseHTML;
      });
      scriptureHTML += chapterHTML;
    });
    modalLabel.innerText = titleEn;
    modalBody.innerHTML = scriptureHTML;
  }

  function init() {
    fpt.setActiveNavLink("/scriptures");
    getScriptures();
  }

  init();
})();
