#!/usr/bin/env node
const got = require('got')
const CFonts = require('cfonts')
const chalk = require('chalk')
const Table = require('cli-table3')
const inquirer = require('inquirer')
const ora = require('ora')
const logSymbols = require('log-symbols')
const { version } = require('./package.json')

CFonts.say('node crypto', {
	font: 'chrome',
	align: 'left',
	colors: ['cyanBright','greenBright','white'],
	background: 'transparent',
	letterSpacing: 1,
	lineHeight: 1,
	space: true,
})

const spinner = ora({
  spinner: 'circleHalves',
  text: '🌎  Fetching currencies....',
  interval: 100
})

spinner.start()
const currencyList = []

const getCrypto = async () => {
  try {
    const response = await got('https://api.coinmarketcap.com/v2/listings/?limit=10&sort=id');
      spinner.succeed()
      let parsedResponse = JSON.parse(response.body).data
      Object.values(parsedResponse).forEach(currency => {
        currencyList.push(`${currency.id} - ${chalk.bold(currency.name)} - ${currency.symbol}`)
      })

      inquirer.prompt([{
        type: 'list',
        name: 'theme',
        message: '💰  Choose a cryptocurrency?',
        choices: currencyList
      }]).then(answers => {
        
        const spinner = ora({
          spinner: 'circleHalves',
          text: '🚚  Delivering currency....',
          interval: 100
        })

        spinner.start()

        const id = answers.theme.split(' ')[0];
        (async () => {
          
          const response = await got(`https://api.coinmarketcap.com/v2/ticker/${id}/`);
          let parsedResponse = JSON.parse(response.body).data
          let maxSupply =  parsedResponse.max_supply === null ? '0' : parsedResponse.max_supply
          let sevenDay = parsedResponse.quotes.USD.percent_change_7d === null ? '0' : `${parsedResponse.quotes.USD.percent_change_7d}%`

          let currency = [
            chalk.cyan(parsedResponse.name),
            chalk.cyan(parsedResponse.symbol),
            chalk.cyan(parsedResponse.rank),
            chalk.cyan(parsedResponse.total_supply),
            chalk.cyan(maxSupply),
            chalk.cyan(sevenDay),
            chalk.cyan(`$${parsedResponse.quotes.USD.price}`)
          ]

          spinner.succeed()

          const table = new Table({
            chars: {
              'top': '═', 
              'top-mid': '╤', 
              'top-left': '╔', 
              'top-right': '╗',
              'bottom': '═', 
              'bottom-mid': '╧',
              'bottom-left': '╚', 
              'bottom-right': '╝', 
              'left': '║', 
              'left-mid': '╟',
              'right': '║', 
              'right-mid': '╢'
            },
            style: {
              head: ['yellow'],
              border: ['cyan']
            },
            head: ['Name', 'Symbol', 'Rank', 'Total Supply', 'Max Supply', 'Seven Day Change', 'Price']
          });
        
          // table is an Array, so you can `push`, `unshift`, `splice` and friends
          table.push(
            currency
          );

          console.log(`${logSymbols.success} 💵  Show me the money....`)

          CFonts.say(parsedResponse.name, {
            font: 'chrome',
            align: 'left',
            colors: ['cyanBright','greenBright','white'],
            background: 'transparent',
            letterSpacing: 1,
            lineHeight: 1,
            space: true,
          })

        
          console.log(table.toString())

          getCrypto()

        })()
      });

    } catch (error) {
        console.log(error.response.body);
    }
}

getCrypto()