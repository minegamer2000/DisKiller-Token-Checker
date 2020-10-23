const fs = require('fs');
const fetch = require('node-fetch');
const Package = require('../package.json');
const resultsDir = `./results ${Date.now()}/`
main();

function main() {
    if (process.cwd().split('\\')[process.cwd().split('\\').length - 1] == 'src') return console.log('[ \x1b[31mERROR\x1b[0m ] Current working directory is in src, please go up a directory.');
    if (process.cwd().split('/')[process.cwd().split('/').length - 1] == 'src') return console.log('[ \x1b[31mERROR\x1b[0m ] Current working directory is in src, please go up a directory.');
    
    if (!fs.existsSync('./tokens.txt')) {
        return console.log(`[ \x1b[31mERROR\x1b[0m ] Could not find "tokens.txt" in working directory (${process.cwd()})`);
    } else {
        console.clear();
        console.log(`\x1b[33m> Token Checker \x1b[0mv${Package.version}\n\x1b[33m> Made by minegamer2000\x1b[0m\n`);
    }
    fs.readFile('./tokens.txt', 'utf8', (error, data) => {
        let tokens = data.split('\n');
        if (tokens.indexOf('') != -1) tokens.splice('')
        if (!tokens.length) return console.log('[ \x1b[31mERROR\x1b[0m ] tokens.txt is empty.');
        tokens.forEach(t => check(t.trim()));
        if (!fs.existsSync(resultsDir)) {
            fs.mkdir(resultsDir, (error) => {if (error) throw error;})
        }
    });
    
}

function check(token) {
    if (token == '') return;
    fetch('https://discord.com/api/v8/users/@me/settings', { "headers": { "authorization": token } } )
    .then(res => res.json())
    .then(json => {
        if (json.message == '401: Unauthorized') {
            console.log(`[ \x1b[31mINVALID\x1b[0m ] ${token}`);
            fs.appendFile(`${resultsDir}invalid.txt`, `${token}\n`, (error) => {})
        } else if (json.locale) {
            console.log(`[ \x1b[32mVALID\x1b[0m ] ${token}`);
            fs.appendFile(`${resultsDir}valid.txt`, `${token}\n`, (error) => {})
        } else if (json.message = 'You need to verify your account in order to perform this action.') {
            if (json.retry_after) {
                return setTimeout(function() {check(token);}, json.retry_after * 1000);
            }
            console.log(`[ \x1b[33mLOCKED\x1b[0m ] ${token}`);
            fs.appendFile(`${resultsDir}locked.txt`, `${token}\n`, (error) => {})
            console.log(json);
        }
    })
}
