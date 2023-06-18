import { chromium } from 'playwright';

// Generar resultados de google

async function getResultsFromGoogle(query, browser){
    // const browser = await chromium.launch();
     const page = await browser.newPage();
     await page.goto('https://www.google.com/');
     await page.waitForSelector('input[name="q"]')
     await page.type('input[name="q"]', query);
     await page.keyboard.press('Enter');
     await page.waitForNavigation({waitUntil:'networkidle'})

     // Generar listado de resultados 
     const listadoResultados = await page.evaluate(()=>{
        let resultados = [];
        document.querySelectorAll('div[data-header-feature] div a').forEach((anchor, index)=>{
            resultados.push({
                index: index,
                title: anchor.innerText,
                url: anchor.href,
            });
        });

        return resultados;

     });

     // await browser.close();
     // console.log(listadoResultados);
     return listadoResultados;

}

// Consultar-visitar resultados y extraer informacion

async function visitResultsAndGetContent(resultado, browser){

    const page = await browser.newPage();
    await page.goto(resultado.url);
    await page.waitForLoadState('domecontentloaded');

    const content = await page.evaluate(()=>{
        const rawText = document.querySelector('main')?.
        innerText || document.querySelector('body')?.innerText;

        return rawText;
    });

    // console.log(content);
    return content;
}

async function startScripping(query){
    const browser = await chromium.launch();

    const allText = [];

    const listadoResultados = await getResultsFromGoogle(query, browser);

    // Sincrono
    /*listadoResultados.forEach(resultado =>{
        visitResultsAndGetContent(resultado, browser);
    });*/

    // Asincrono
    for await(const url of listadoResultados){
        const contenido = await visitResultsAndGetContent(url,browser);
        allText.push(contenido);
    }

    console.log(allText);
    await browser.close();

    // visitResultsAndGetContent(listadoResultados);
}

// const text =  await startScripping('nodejs');
// startScripping('nodejs');

let queryTerminal = process.argv.slice(2)[0];
startScripping(queryTerminal);