const {URL} = require('url');
const browser = global.__BROWSER__;

// if Object.fromEntries was supported
// this would be cleaner
const fromEntries = (
  Object.fromEntries || function(iterable) {
    return Array.from(iterable).reduce(
      (obj, [key, value]) => {
        obj[key] = value;
        return obj;
      },
      {}
    );
  }
);

jest.setTimeout(20000); // increase timeout

describe("let's intercept requests", () => {
  let page;

  describe('pixel tracking', () => {
    beforeEach(async () => {
      page = await browser.newPage();

      await page.goto('http://localhost:3000', {
        waitUntil: 'domcontentloaded'
      });
    });

    it('should trigger a pixel tracking when button is clicked',
      async () => {
        const pixelTracking = new Promise((resolve) => {
          page.on('request', (request) => {
            const url = request.url();

            if (!url.includes('pixel-tracking')) {
              return;
            }

            resolve();
          });
        });

        await page.click('#enterprise-btn');

        return expect(pixelTracking).resolves
          .toBeUndefined();
    });

    it('should track expected data', async () => {
      const pixelTracking = new Promise((resolve) => {
        page.on('request', (request) => {
          const url = request.url();

          if (!url.includes('pixel-tracking')) {
            return;
          }

          resolve(
            fromEntries(
              new URL(url).searchParams.entries()
            )
          );
        });
      });

      await page.click('#enterprise-btn');

      expect(await pixelTracking).toEqual(
        expect.objectContaining({
          action: 'click',
          target: 'enterprise-btn',
          'some-other-things': 'to-track',
          time: expect.any(String)
        })
      );
    });
  });

  describe('example filling forms', () => {
    beforeEach(async () => {
      page = await browser.newPage();

      await page.goto('http://localhost:3000', {
        waitUntil: 'domcontentloaded'
      });

      await page.click('#enterprise-btn');
      
      // beware, animations can affect page.click and page.type
      // behaviour
      await new Promise((resolve) => setTimeout(resolve, 500));
    });

    it('should post the contents of the form', async () => {
      const request = new Promise((resolve) => {
        page.on('request', (request) => {
          const url = request.url();

          if (!url.includes('contact')) {
            return;
          }

          resolve(
            JSON.parse(
              request.postData()
            )
          );
        });
      });

      const expectedEmail = 'rick.sanchez@cp-137.dimension';
      const expectedDetails = `Look around you, Morty.
        Do you really think this wuh-world is real?`;

      // you can set field values using evaluate
      await page.evaluate(
        (email) => {
          document.getElementById('enterprise__email').value = email;
        },
        expectedEmail
      );

      // or by using type
      await page.type('#enterprise__details', expectedDetails);
      
      // or with delay
      // await page.type('selector', 'text', {delay: 20});

      await page.click('#enterprise__contact');

      expect(await request).toEqual({
        email: expectedEmail,
        details: expectedDetails
      });
    });
  });

  describe('example of intercept', () => {
    beforeEach(async () => {
      page = await browser.newPage();
    });

    it('should return a success message', async () => {
      await page.setRequestInterception(true);

      page.on('request', (interceptedRequest) => {
        const url = interceptedRequest.url();

        if (!url.includes('contact')) {
          interceptedRequest.continue();
          return;
        }

        interceptedRequest.respond({
          status: 200,
          contentType: 'text/plain',
          body: 'Wubba Lubba dub-dub'
        }); 
      });

      await page.goto('http://localhost:3000', {
        waitUntil: 'domcontentloaded'
      });

      await page.click('#enterprise-btn');

      // wait for animation before clicking
      await page.waitForSelector('#exampleModal', {visible: true})

      await page.click('#enterprise__contact');
      
      expect(
        await page.waitForSelector(
          '#enterprise__success', {visible: true}
        )
      ).toBeDefined();
    });

    it('should return a error message', async () => {
      await page.setRequestInterception(true);

      page.on('request', (interceptedRequest) => {
        const url = interceptedRequest.url();

        if (!url.includes('contact')) {
          interceptedRequest.continue();
          return;
        }

        interceptedRequest.respond({
          status: 404,
          contentType: 'text/plain',
          body: `Nobody exists on purpose.
            Nobody belongs anywhere...
            Come watch TV!
          `
        }); 
      });

      await page.goto('http://localhost:3000', {
        waitUntil: 'domcontentloaded'
      });

      await page.click('#enterprise-btn');

      // wait for animation before clicking
      await page.waitForSelector(
        '#exampleModal', {visible: true}
      )

      await page.click('#enterprise__contact');
      
      expect(
        await page.waitForSelector(
          '#enterprise__error', {visible: true}
        )
      ).toBeDefined();
    });
  });
});
