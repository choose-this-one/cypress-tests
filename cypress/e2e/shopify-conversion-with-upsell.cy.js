describe('akeero', () => {

  const defaultTimeout = 3000

  const ShopifyGlobal = {
    checkout: {
      order_id: 4811144659027,
      customer_id: 5817326993491,
      total_price: "54.99",
      currency: "GBP",
      orders_count: 1
    }
  }

  const headerOptions = ["Devs wanna dev.", "Header 1", "Header 2"];
  const subheaderOptions = [
    "You didn’t become a coder to spend your time setting everything up. Our lo-config code is 10x faster, safer, and works out of the box.",
    "Subheader 1",
    "Subheader 2",
  ]

  beforeEach(() => {
    cy.task("db:drop", null, { timeout: defaultTimeout })
    // await cy.task("db:seed", {
    //   fixtureFile: "akeero",
    //   testName: "test1",
    // })

    cy.task("db:load-json", {
      jsonDir: "akeero-shopify-conversion",
    }, { timeout: defaultTimeout })

    cy.clearAllCookies()
    cy.window().then((win) => {
      win.console.clear()
    })
    cy.viewport(1000, 1200)
  })

  // WITH COOKIES
  it(`
  Visit shopify landing page.
  Visiting shopify conversion page once.
  Should record 1 view, 1 conversion with same variation id cookie
`, () => {

    cy.visit('https://demo.localhost/shopify-landing-page.html')
    cy.get('[cypress-id="header"]').then(($element) => {
      const text = $element.text();
      expect(headerOptions).to.include(text.trim())
    })
    cy.get('[cypress-id="subheader"]').then(($element) => {
      let text = $element.text()
      text = text.replace(/\s+/g, ' ')

      expect(subheaderOptions).to.include(text.trim())
    })

    cy.visit('https://demo.localhost/shopify-conversion.html', {
      onBeforeLoad: (win) => {
        win.Shopify = ShopifyGlobal
      },
    })
    cy.getCookie("gro-view-id").then(conversionCookie => {
      const variationId = conversionCookie.value

      cy.wait(1000)

      cy.task("db:get", null, { timeout: defaultTimeout }).then(data => {
        expect(data?.variationViewsNum).to.equal(1)
        expect(data?.variationConversionsNum).to.equal(1)

        const variationConversion = data.variationConversions?.[0]
        const variationView = data.variationViews?.[0]
        // expecting the see the variation ID of the anomaly
        expect(variationConversion.variationId).to.equal(variationId)
        expect(variationView.variationId).to.equal(variationId)

        expect(variationConversion?.meta?.shopify?.orderId).to.equal(4811144659027)
        expect(variationConversion?.meta?.shopify?.customerId).to.equal(5817326993491)
        expect(variationConversion?.meta?.shopify?.totalPrice).to.equal("54.99")
        expect(variationConversion?.meta?.shopify?.currency).to.equal("GBP")
        expect(variationConversion?.meta?.shopify?.ordersCount).to.equal(1)
      })
    })

  })

  it(`
  Visit shopify landing page.
  Visiting shopify conversion page 2 times.
  Should record 1 view, 1 conversion with same variation id cookie
`, () => {

    cy.visit('https://demo.localhost/shopify-landing-page.html')
    cy.get('[cypress-id="header"]').then(($element) => {
      const text = $element.text();
      expect(headerOptions).to.include(text.trim())
    })
    cy.get('[cypress-id="subheader"]').then(($element) => {
      let text = $element.text()
      text = text.replace(/\s+/g, ' ')

      expect(subheaderOptions).to.include(text.trim())
    })

    cy.visit('https://demo.localhost/shopify-conversion.html', {
      onBeforeLoad: (win) => {
        win.Shopify = ShopifyGlobal
      },
    })
    cy.visit('https://demo.localhost/shopify-conversion.html', {
      onBeforeLoad: (win) => {
        win.Shopify = ShopifyGlobal
      },
    })
    cy.getCookie("gro-view-id").then(conversionCookie => {
      const variationId = conversionCookie.value

      cy.wait(1000)

      cy.task("db:get", null, { timeout: defaultTimeout }).then(data => {
        expect(data?.variationViewsNum).to.equal(1)
        expect(data?.variationConversionsNum).to.equal(1)

        const variationConversion = data.variationConversions?.[0]
        const variationView = data.variationViews?.[0]
        // expecting the see the variation ID of the anomaly
        expect(variationConversion.variationId).to.equal(variationId)
        expect(variationView.variationId).to.equal(variationId)

        expect(variationConversion?.meta?.shopify?.orderId).to.equal(4811144659027)
        expect(variationConversion?.meta?.shopify?.customerId).to.equal(5817326993491)
        expect(variationConversion?.meta?.shopify?.totalPrice).to.equal("54.99")
        expect(variationConversion?.meta?.shopify?.currency).to.equal("GBP")
        expect(variationConversion?.meta?.shopify?.ordersCount).to.equal(1)
      })
    })

  })

  // WITHOUT COOKIES
  it(`
    Visiting shopify conversion page once.
    No variation cookie.
    Should record 1 conversion under the anomaly variation.
  `, () => {
    cy.visit('https://demo.localhost/shopify-conversion.html', {
      onBeforeLoad: (win) => {
        win.Shopify = ShopifyGlobal
      },
    })

    cy.wait(1000)

    cy.task("db:get", null, { timeout: defaultTimeout }).then(data => {
      expect(data?.variationConversionsNum).to.equal(1)
      const variationConversion = data.variationConversions?.[0]

      expect(variationConversion?.variationId).to.equal("64b5481b2fd32342c0a00dd2")
      expect(variationConversion?.meta?.shopify?.orderId).to.equal(4811144659027)
      expect(variationConversion?.meta?.shopify?.customerId).to.equal(5817326993491)
      expect(variationConversion?.meta?.shopify?.totalPrice).to.equal("54.99")
      expect(variationConversion?.meta?.shopify?.currency).to.equal("GBP")
      expect(variationConversion?.meta?.shopify?.ordersCount).to.equal(1)
    })
  })

  it(`
    Visiting shopify conversion page twice.
    No variation cookie.
    Should record 1 conversion under the anomaly variation.
  `, () => {
    cy.visit('https://demo.localhost/shopify-conversion.html', {
      onBeforeLoad: (win) => {
        win.Shopify = ShopifyGlobal
      },
    })
    cy.visit('https://demo.localhost/shopify-conversion.html', {
      onBeforeLoad: (win) => {
        win.Shopify = ShopifyGlobal
      },
    })

    cy.wait(1000)

    cy.task("db:get", null, { timeout: defaultTimeout }).then(data => {
      expect(data?.variationConversionsNum).to.equal(1)
      const variationConversion = data.variationConversions?.[0]
      // expecting the see the variation ID of the anomaly
      expect(variationConversion.variationId).to.equal("64b5481b2fd32342c0a00dd2")

      expect(variationConversion?.meta?.shopify?.orderId).to.equal(4811144659027)
      expect(variationConversion?.meta?.shopify?.customerId).to.equal(5817326993491)
      expect(variationConversion?.meta?.shopify?.totalPrice).to.equal("54.99")
      expect(variationConversion?.meta?.shopify?.currency).to.equal("GBP")
      expect(variationConversion?.meta?.shopify?.ordersCount).to.equal(1)

    })
  })

})