const prettier = require("prettier");
const browser = global.__BROWSER__;

describe("let's build a basic puppeteer test", () => {
  let page;

  beforeEach(async () => {
    page = await browser.newPage();
    await page.goto("http://localhost:3000", {
      // see puppeteer docs api for more options
      // https://bit.ly/2PCSEVa

      // 'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2'
      // waitUntil: string | string []
      waitUntil: "domcontentloaded"
    });
  });

  it("should render the free tier", async () => {
    const html = await page.$eval(
      ".card-deck .card:nth-child(1)",
      elem => elem.outerHTML
    );

    expect(
      prettier.format(html, {
        parser: "babylon",
        printWidth: 50
      })
    ).toMatchInlineSnapshot(`
"<div class=\\"card mb-4 shadow-sm\\">
  <div class=\\"card-header\\">
    <h4 class=\\"my-0 font-weight-normal\\">Free</h4>
  </div>
  <div class=\\"card-body\\">
    <h1 class=\\"card-title pricing-card-title\\">
      $0 <small class=\\"text-muted\\">/ mo</small>
    </h1>
    <ul class=\\"list-unstyled mt-3 mb-4\\">
      <li>10 users included</li>
      <li>2 GB of storage</li>
      <li>Email support</li>
      <li>Help center access</li>
    </ul>
    <button
      type=\\"button\\"
      class=\\"btn btn-lg btn-block btn-outline-primary\\"
      disabled=\\"\\"
    >
      Sign up for free
    </button>
  </div>
</div>;
"
`);
  });

  it("should render the pro tier", async () => {
    const html = await page.$eval(
      ".card-deck .card:nth-child(2)",
      elem => elem.outerHTML
    );

    expect(
      prettier.format(html, {
        parser: "babylon",
        printWidth: 50
      })
    ).toMatchInlineSnapshot(`
"<div class=\\"card mb-4 shadow-sm\\">
  <div class=\\"card-header\\">
    <h4 class=\\"my-0 font-weight-normal\\">Pro</h4>
  </div>
  <div class=\\"card-body\\">
    <h1 class=\\"card-title pricing-card-title\\">
      $15 <small class=\\"text-muted\\">/ mo</small>
    </h1>
    <ul class=\\"list-unstyled mt-3 mb-4\\">
      <li>20 users included</li>
      <li>10 GB of storage</li>
      <li>Priority email support</li>
      <li>Help center access</li>
    </ul>
    <button
      type=\\"button\\"
      class=\\"btn btn-lg btn-block btn-primary\\"
      disabled=\\"\\"
    >
      Get started
    </button>
  </div>
</div>;
"
`);
  });

  it("should render the enterprise tier", async () => {
    const html = await page.$eval(
      ".card-deck .card:nth-child(3)",
      elem => elem.outerHTML
    );

    expect(
      prettier.format(html, {
        parser: "babylon",
        printWidth: 50
      })
    ).toMatchInlineSnapshot(`
"<div class=\\"card mb-4 shadow-sm\\">
  <div class=\\"card-header\\">
    <h4 class=\\"my-0 font-weight-normal\\">
      Enterprise
    </h4>
  </div>
  <div class=\\"card-body\\">
    <h1 class=\\"card-title pricing-card-title\\">
      $29 <small class=\\"text-muted\\">/ mo</small>
    </h1>
    <ul class=\\"list-unstyled mt-3 mb-4\\">
      <li>30 users included</li>
      <li>15 GB of storage</li>
      <li>Phone and email support</li>
      <li>Help center access</li>
    </ul>
    <button
      id=\\"enterprise-btn\\"
      type=\\"button\\"
      class=\\"btn btn-lg btn-block btn-primary\\"
      data-toggle=\\"modal\\"
      data-target=\\"#exampleModal\\"
    >
      Contact us
    </button>
  </div>
</div>;
"
`);
  });
});
