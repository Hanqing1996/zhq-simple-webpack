const fs = require('fs')
let fileContent = fs.readFileSync('./src/index.js', 'utf-8');

const indexFunction=()=>{
    eval(`${fileContent}`)
}

indexFunction();
