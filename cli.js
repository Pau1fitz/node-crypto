#!/usr/bin/env node
const got = require('got')
const CFonts = require('cfonts')
const chalk = require('chalk')
const Table = require('cli-table3')
const inquirer = require('inquirer')
const { version } = require('./package.json')

CFonts.say('node crypto', {
	font: 'chrome',              // define the font face
	align: 'left',              // define text alignment
	colors: ['cyanBright','greenBright','white'],         // define all colors
	background: 'transparent',  // define the background color, you can also use `backgroundColor` here as key
	letterSpacing: 1,           // define letter spacing
	lineHeight: 1,              // define the line height
	space: true,                // define if the output text should have empty lines on top and on the bottom
})


const currencies = [];
const currencyList = [];

const getCrypto = async () => {
  try {
    const response = await got('https://api.coinmarketcap.com/v2/ticker/?limit=10&sort=id');
      let parsedResponse = JSON.parse(response.body).data;
      Object.values(parsedResponse).forEach(currency => {
        currencies.push({
          name: currency.name,
          abbr: currency.symbol,
          supply: currency.total_supply,
          sevenDay: currency.quotes.USD.percent_change_7d,
          price: currency.quotes.USD.price
        })  
      })
        
      const table = new Table({
        style: {head: ['yellow']},
        head: ['Name', 'Abbr', 'Supply', '7 day',  'Value']
      });
      
      currencies.forEach(currency => {
        table.push(
          [chalk.green(currency.name), chalk.cyan(currency.abbr), chalk.cyan(currency.supply),`${chalk.cyan(currency.sevenDay)}${chalk.cyan('%')}`, `${chalk.cyan('$')}${chalk.cyan(currency.price)}`]
        );

        currencyList.push(`${currency.name} - ${currency.price}`)
      }) 
      
      
      // render table
      console.log(table.toString());

      console.log(currencyList)


      inquirer
      .prompt([
        {
          type: 'list',
          name: 'theme',
          message: 'Choose a cryptocurrency?',
          choices: currencyList
        }
      ])
      .then(answers => {
        console.log(JSON.stringify(answers, null, '  '));
      });
    } catch (error) {
        console.log(error.response.body);
    }
}

getCrypto()