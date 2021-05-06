/// <reference types="cypress" />

const jsonp = (url) =>
  new Promise((resolve, reject) => {
    const script = document.createElement("script");

    const id = Math.random().toString(36).slice(2);
    const callbackId = `__${id}`;

    window[callbackId] = (response) => {
      delete window[callbackId];
      script.parentNode.removeChild(script);
      resolve(response);
    };

    script.src = `${url}?jsonp=${callbackId}`;
    script.addEventListener("error", () =>
      reject(new Error("JSONP request failed."))
    );
    document.body.appendChild(script);
  });

describe("fails next test", () => {
  it("first test", (done) => {
    cy.intercept(/example\.com\/random/, (req) => {
      const jsonpCallback = req.url.replace(/.+?/, "").split("=")[1];
      req.reply({
        body: `${jsonpCallback}("${Math.random().toString(36).slice(2)}")`,
        delay: 1000,
      });
    });
    cy.intercept(
      "http://localhost:3000",
      `<script>window.onload = () => (${jsonp.toString()})("https://example.com/random").then((random) => console.log(random))</script>`
    );

    cy.visit("http://localhost:3000", {
      onBeforeLoad() {
        expect(true).to.eq(true);
        done();
      },
    });
  });

  it("second test", () => {
    cy.intercept("http://localhost:3000", "<div></div>");

    cy.visit("http://localhost:3000");

    cy.window()
      .then(($autWindow) => {
        return new Promise((resolve) => {
          $autWindow.addEventListener("load", () => resolve(), { once: true });
        });
      })
      .then(() => {
        expect(true).to.eq(true);
      });
  });
});
