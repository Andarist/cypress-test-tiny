/// <reference types="cypress" />
import { createElement as h, Fragment } from "react";
import { renderToString } from "react-dom/server";

describe("scroll position", () => {
  it("should not be moved when clicking on a visible element", () => {
    cy.intercept(
      "http://localhost:3000",
      renderToString(
        h(Fragment, {
          children: [
            h("style", {
              dangerouslySetInnerHTML: {
                __html: "* { box-sizing: border-box; }",
              },
            }),
            h("div", {
              style: {
                backgroundColor: "hotpink",
                width: 400,
                height: 600,
                overflow: "scroll",
              },
              children: Array.from({ length: 30 }).map((_, i) =>
                h("div", {
                  style: { width: "100%", padding: 20, display: "flex" },
                  children: [
                    h("button", {
                      style: { width: "50%", height: 25, margin: "auto" },
                      children: [i],
                    }),
                  ],
                })
              ),
            }),
          ],
        })
      )
    );

    cy.visit("http://localhost:3000");

    cy.get("button")
      .its(5)
      .then(($button) => {
        const container = Cypress.dom.getFirstScrollableParent($button).get(0);
        container.scrollTop = 100;
        // https://user-images.githubusercontent.com/9800850/113896646-6ba38a80-97ca-11eb-8dfb-25d1192beda1.png
        expect(container.scrollTop).to.eq(100, "scrollTop");
        expect($button.get(0).textContent).to.eq("5", "button text");
        expect(Cypress.dom.isVisible($button)).to.eq(true, "button is visible");
      })
      .click()
      .then(($button) => {
        const container = Cypress.dom.getFirstScrollableParent($button).get(0);
        // https://user-images.githubusercontent.com/9800850/113896866-9ee61980-97ca-11eb-88e2-672415603c8f.png
        expect(container.scrollTop).to.eq(100, "scrollTop");
      });
  });
});
