'use strict';

const puppeteer = require('puppeteer');
const select = require('puppeteer-select');
var request = require('request');


async function selectFields(page, id_input, data_selecionada) {
  // console.log('data_selecionada :', data_selecionada);
  await page.focus(id_input);
  const selector = id_input;
  await page.evaluate(
    ({ id_input }) => {
      var input = document.querySelector(id_input);
      input.value = '';
    },
    { id_input },
  );
  await page.waitForSelector(selector);
  await page.keyboard.type(data_selecionada);

  //   await page.keyboard.type(data_selecionada);
  await page.keyboard.press('Enter');
  await page.waitFor(200);
}

async function getPrice(page) {
  await page.waitFor(200);
  let preco = await page.evaluate(() => {
    var campo = document.querySelector('div.fare-details').children;
    let valores = {};
    // let child = {};
    for (let index = 0; index < campo.length; index++) {
      const element = campo[index];
      let propertyName = '';
      console.log('element:', element.textContent);
      for (let j = 0; j < element.children.length; j++) {
        const node = element.children[j];
        if (node.className === 'text') {
          valores[node.innerText] = '';
          propertyName = node.innerText;
        } else if (node.className === 'value')
          valores[propertyName] = node.innerText;
      }
      // valores.push(valores);
    }
    return valores;
  });
  // console.log('preco:', preco);
  let valor_total = Number(preco['Valor total'].replace(/[^0-9\,]+/g, '')
    .replace(/[^0-9]+/g, '.'));
  // let teste = preco['Valor total'];
  // console.log('valor_total:', valor_total);
  return [valor_total, preco];
}

async function selectDepartureCity(
  page,
  id_campo,
  cidade,
  classe_campo,
  cidade_completa,
) {
  // console.log('cidade_completa ', cidade_completa);
  // console.log('classe_campo ', classe_campo);
  await page.focus(id_campo);
  await page.keyboard.type(cidade);
  await page.focus(classe_campo);
  // await page.evaluate(({classe_campo, cidade_completa }) => {
  //     [...document.querySelectorAll(classe_campo)].
  // find(element => element.textContent == cidade_completa).click();
  //   }, {classe_campo, cidade_completa});

  const element = await select(page).getElement(
    `${classe_campo}:contains(${cidade_completa})`,
  );
  await element.click();
  // var news = await page.evaluate(({classe_campo, cidade_completa,page }) => {
  // //     console.log('dentro ', classe_campo)
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
  // //             console.log('node :', node);
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
  // // console.log('cities :', news);
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
// // console.log('error  2222222222:', error);

// }
// }

(async () => {
  console.clear();
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const from = 'Natal';
  const destination = 'Salvador';
  const departure_date = '22/02/2020';
  const return_date = '25/02/2020';

  await page.goto('https://www.voegol.com.br/pt');
  //   await main_teste(page);
  // console.log('22pornyo');
  await page.waitForSelector('#header-chosen-origin');
  // console.log('pornyo');
  //   await page.focus('#header-chosen-origin');
  await selectDepartureCity(
    page,
    '#header-chosen-origin',
    from,
    '.active-result',
    'Natal - NAT',
  );
  // await page.screenshot({ path: 'example1 .png' });

  await selectDepartureCity(
    page,
    '#header-chosen-destiny',
    destination,
    '.active-result',
    'Salvador - SSA',
  );

  // await page.screenshot({ path: 'example 2.png' });

  await selectFields(page, '#datepickerGo', departure_date);
  // await page.screenshot({ path: 'example 3.png' });

  await selectFields(page, '#datepickerBack', return_date);
  // await page.screenshot({ path: 'example 4.png' });

  await selectFields(page, '#number-adults', '2');
  // await selectFields(page, '#number-kids', '1');
  await page.click('button#btn-box-buy');
  await page.waitForSelector('div.fare-details');
  let valor = await getPrice(page);
  let valor_total = valor[0];
  let preco = valor[1];
  const users = ['692585166', '748527644'];
  console.log('valor_total:', valor_total);
  if (valor_total < 600) {
    let string_valor = Object.keys(preco)
      .filter(e => e !== '')
      .map(key => key + ': ' + preco[key])
      .join(' \n');
    string_valor += `\nFrom: ${from} To: ${destination} 
    ${departure_date}  ${return_date}`;
    let bot_token = process.env.TELEGRAM_TOKEN;
    // let bot_chatID = '748527644';
    for (let i = 0; i < users.length; i++) {
      const bot_chatID = users[i];
      let send_text =
        'https://api.telegram.org/bot' +
        bot_token +
        '/sendMessage?chat_id=' +
        bot_chatID + '&parse_mode=Markdown&text=' +
        encodeURI(string_valor);
      // console.log('send_text :', send_text);
      // let response = request.get(send_text);
      request.get(send_text);
      // console.log('response :', response);
      ;
    }
  }
  browser.close();
})();
