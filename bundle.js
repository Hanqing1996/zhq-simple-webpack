const fs = require('fs')
const path=require('path')

const path2ID={}
// 改写 exports 对象
exports={}
// 改写 require 方法
require=(relativePath)=>{
    const code=path2ID[relativePath]
    exec(code)
}

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
    
    const asset={
        path:absolutePath,
        id:ID++,
        code:`function(require, exports, module) {
            ${fileContent}
        }`,
        dependencies:getFileDependencies(fileContent)
    }
    
    
    return asset
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
            path2ID[relativePath]=newAsset.id
            queue.push(newAsset)
        })
    }
    return queue
}


const graph=createGraph('./src/index.js')

function createBundle(graph) {
    let modules = '';
    
    graph.forEach(mod => {
        modules += `${mod.id}:
          ${mod.code},
        `;
    });
    
    let mapping=''
    for(let [key,value] of Object.entries(path2ID)){
        mapping+=`${key}:${value},`
    }
    
    const result = `(function(modules){
        function exec(id) {
          let fn = modules[id];
          console.log(fn, mapping)
          let module = { exports: {} };
        
          fn && fn(require, module.exports, module);
        
          function require(path) {
            //根据模块路径，返回模块执行的结果
            return exec(mapping[path]);
          }
        
          return module.exports;
        }
        
        exec(0)
      })(
        {${modules}},{${mapping}}
      )`
    console.log(result);
    
    // 将转译后的文件内容放入 dist 目录下
    fs.writeFileSync('./dist/bundle.js', result);
}

createBundle(graph)