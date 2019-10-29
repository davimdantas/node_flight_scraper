const puppeteer = require("puppeteer");
const select = require("puppeteer-select");
var request = require("request");


async function selectFields(page, id_input, data_selecionada) {
  console.log("data_selecionada :", data_selecionada);
  await page.focus(id_input);
  const selector = id_input;
  await page.evaluate(
    ({ id_input }) => {
      var input = document.querySelector(id_input);
      input.value = "";
    },
    { id_input }
  );
  await page.waitForSelector(selector);
  await page.keyboard.type(data_selecionada);

  //   await page.keyboard.type(data_selecionada);
  await page.keyboard.press("Enter");
  await page.waitFor(200);
}

async function getPrice(page) {
  await page.waitFor(200);
  preco = await page.evaluate(() => {
    var campo = document.querySelector("div.fare-details");
    return campo.textContent;
  });
  console.log("preco :", preco);

  let bot_token = process.env.TELEGRAM_TOKEN;
  let bot_chatID = "748527644";
  send_text =
  "https://api.telegram.org/bot" +
  bot_token +
  "/sendMessage?chat_id=" +
  bot_chatID + '&parse_mode=Markdown&text='+ encodeURI(preco);
  console.log('send_text :', send_text);
  let response = request.get(send_text);
  console.log('response :', response);
  ;
}

async function selectDepartureCity(
  page,
  id_campo,
  cidade,
  classe_campo,
  cidade_completa
) {
  console.log("cidade_completa ", cidade_completa);
  console.log("classe_campo ", classe_campo);
  await page.focus(id_campo);
  await page.keyboard.type(cidade);
  await page.focus(classe_campo);
  // await page.evaluate(({classe_campo, cidade_completa }) => {
  //     [...document.querySelectorAll(classe_campo)].find(element => element.textContent == cidade_completa).click();
  //   }, {classe_campo, cidade_completa});

  const element = await select(page).getElement(
    `${classe_campo}:contains(${cidade_completa})`
  );
  await element.click();
  // var news = await page.evaluate(({classe_campo, cidade_completa,page }) => {
  //     console.log('dentro ', classe_campo)
  //     var titleNodeList = document.querySelectorAll(classe_campo);
  //     // let elements = Array.from(document.querySelectorAll(classe_campo));
  //     // let links = elements.map(element => {
  //     //     return element
  //     // })
  //     // return links;
  //     let teste;
  //     for (let i = 0; i < titleNodeList.length; i++) {
  //         const node = titleNodeList[i];
  //         if (node.textContent == cidade_completa) {
  //             teste = node;
  //             console.log('node :', node);
  //             page.click(node)

  //             setTimeout(() => {

  //             }, 100);
  //         }

  //     }
  // },{classe_campo, cidade_completa, page })
  // const cities = await page.evaluate((classe_campo) => {
  //     let elements = Array.from(document.querySelectorAll(classe_campo));
  //     return elements
  // }
  // )
  // news.click()
  // console.log('cities :', news);
  // cities = await page.querySelectorAll(classe_campo)
  //     , elements =>
  //   elements.map(element => element.innerText == `${cidade_completa}`)
  // );
  // chosen_index = cities.index(True);
  // departure_city = await page.querySelectorAll(classe_campo);
  // await departure_city[chosen_index].click();
}

// async function main_teste(page) {
// try {

// } catch (error) {
// console.log('error  2222222222:', error);

// }
// }

(async () => {
  console.clear();
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("https://www.voegol.com.br/pt");
  //   await main_teste(page);
  console.log("22pornyo");
  await page.waitForSelector("#header-chosen-origin");
  console.log("pornyo");
  //   await page.focus("#header-chosen-origin");
  await selectDepartureCity(
    page,
    "#header-chosen-origin",
    "Rio de",
    ".active-result",
    "Rio de Janeiro - Galeão - GIG"
  );
  await page.screenshot({ path: "example1 .png" });

  await selectDepartureCity(
    page,
    "#header-chosen-destiny",
    "Natal",
    ".active-result",
    "Natal - NAT"
  );

  await page.screenshot({ path: "example 2.png" });

  await selectFields(page, "#datepickerGo", "25/12/2019");
  await page.screenshot({ path: "example 3.png" });

  await selectFields(page, "#datepickerBack", "02/02/2020");
  await page.screenshot({ path: "example 4.png" });

  await selectFields(page, "#number-adults", "1");
  await selectFields(page, "#number-kids", "1");
  // # await page.screenshot({'path': 'example.png'})
  console.log("title ", await page.title());
  await page.click("button#btn-box-buy"),
    await page.waitForSelector("div.fare-details");
  await getPrice(page);
  browser.close();
})();
