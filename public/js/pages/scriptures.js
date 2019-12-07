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
    const referenceHTML = `
      <div class="form-group row scriptureBook mb-4">
        <div class="col-sm-2">
          <strong>Book name:</strong>
        </div>
        <div class="col-sm-9">
          <div class="mb-2">
            ${bookEn}
          </div>
          <input type="text" tabindex="1" class="form-control" name="book" id="scriptureBook" placeholder="Translation of book name..." required>
        </div>
      </div>
      <div class="form-group row scriptureReference mb-4">
        <div class="col-sm-2">
          <strong>Reference:</strong>
        </div>
        <div class="col-sm-9">
          <div class="mb-2">
            ${titleEn}
          </div>
          <input type="text" tabindex="2" class="form-control" name="reference" id="scriptureReference" placeholder="Translation of reference..." required>
        </div>
      </div>

      <p>
        <strong>Chapters &amp; Verses:</strong>
      </p>
    `;
    chapters.forEach((chapter, chapterIndex) => {
      const chapterTabIndex = chapterIndex + 3;
      let chapterHTML = "";
      const chapterNumberEn = chapter.getAttribute("number-en");
      const verses = chapter.querySelectorAll("verse");
      const versesLen = verses.length;
      chapterHTML += `<div class="form-group row chapter mb-4">
                        <div class="col-sm-2">
                          <div class="input-group">
                            <div class="input-group-prepend">
                              <span class="input-group-text">Chapter:</span>
                            </div>
                            <input size="3" maxlength="3" tabindex="${chapterTabIndex}" class="form-control chapterNumberInput" value="${chapterNumberEn}" type="tel" pattern=[0-9] placeholder="Ch. #" required>
                          </div>
                        </div>
                      </div>`;
      verses.forEach((verse, verseIndex) => {
        const tabindex = {
          verse: chapterTabIndex + versesLen + verseIndex + 1,
          text: chapterTabIndex + verseIndex + 1
        };
        let verseHTML = "";
        const verseNumberEn = verse.getAttribute("number-en");
        const hasJesusWords = verse.hasAttribute("jesuswords");
        const hasScriptureQuote = verse.hasAttribute("scripturequote");
        verseHTML += `<div class="form-group row verse mb-4">
                        <div class="col-sm-2">
                          <div class="input-group">
                            <div class="input-group-prepend">
                              <span class="input-group-text">Verse:</span>
                            </div>
                            <br><input size="3" maxlength="3" value="${verseNumberEn}" tabindex="${tabindex.verse}" class="form-control verseNumberInput" type="tel" pattern=[0-9] data-chapter-number="${chapterNumberEn}" data-verse-number="${verseNumberEn}" placeholder="V. #" required>
                          </div>
                        </div>
                        <div class="col-sm-10">
                          <textarea rows="4" class="form-control verseTextInput" tabindex="${tabindex.text}" data-chapter-number="${chapterNumberEn}" data-verse-number="${verseNumberEn}" data-has-jesus-words="${hasJesusWords}" data-has-scripture-quote="${hasScriptureQuote}" placeholder="Text of verse ${verseNumberEn}..." required></textarea>
                        </div>
                      </div>`;
        chapterHTML += verseHTML;
      });
      scriptureHTML += chapterHTML;
    });
    scriptureHTML = referenceHTML + scriptureHTML;
    modalLabel.innerText = titleEn;
    modalBody.innerHTML = scriptureHTML;
  }

  function init() {
    fpt.setActiveNavLink("/scriptures");
    getScriptures();
  }

  init();
})();
