const fs = require('fs')
const path=require('path')



function getFileContentByPath(filePath) {
    const fileContent=fs.readFileSync(filePath, 'utf-8');
    return fileContent
}

function getFileDependencies(fileContent) {
    let reg = /require\(['"](.+?)['"]\)/g;
    let result = null;
    let dependencies = [];
    while(result = reg.exec(fileContent)) {
        dependencies.push(result[1]);
    }
    return dependencies;
}

let ID = 0;

function createAsset(absolutePath) {
    
    const fileContent=getFileContentByPath(absolutePath)
    return{
        path:absolutePath,
        id:ID++,
        code:(require)=>eval(`${fileContent}`),
        dependencies:getFileDependencies(fileContent)
    }
}



function createGraph(enterPath) {
    const EnterAsset=createAsset(enterPath)
    const queue=[EnterAsset]
    
    // 以 EnterAsset 为起点，收集模块依赖,令 queue 不断增长
    for(let asset of queue){
        const dirName=path.dirname(asset.path)
        asset.dependencies.forEach(relativePath=>{
            const absolutePath=path.join(dirName,relativePath)
            console.log(absolutePath);
            const newAsset=createAsset(absolutePath)
            queue.push(newAsset)
        })
    }
    return queue
}


const queue=createGraph('./src/index.js')
console.log(queue);











