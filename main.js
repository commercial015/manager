const {app,BrowserWindow,ipcMain,dialog,shell}=require('electron');
const fs=require('fs'); const path=require('path');
function dataPath(){return path.join(app.getPath('userData'),'data','smart-kisti-data.json')}
function ensure(){const p=dataPath();fs.mkdirSync(path.dirname(p),{recursive:true});if(!fs.existsSync(p))fs.writeFileSync(p,JSON.stringify({customers:[],loans:[],payments:[],dps:[],dpsPayments:[],expenses:[],incomes:[],settings:{business:'Smart Kisti Manager',phone:'',address:'',footer:'ধন্যবাদ',dailyTarget:0,theme:'dark'},logs:[]},null,2),'utf8');return p}
function win(){const w=new BrowserWindow({width:1500,height:940,minWidth:1050,minHeight:700,backgroundColor:'#07111f',webPreferences:{preload:path.join(__dirname,'preload.js'),contextIsolation:true,nodeIntegration:false}});w.loadFile('index.html');return w}
app.whenReady().then(()=>{ensure();win();app.on('activate',()=>BrowserWindow.getAllWindows().length||win())});app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit()});
ipcMain.handle('data:load',()=>JSON.parse(fs.readFileSync(ensure(),'utf8')));
ipcMain.handle('data:save',(_,data)=>{fs.writeFileSync(ensure(),JSON.stringify(data,null,2),'utf8');return true});
ipcMain.handle('data:backup',async(_,data)=>{const r=await dialog.showSaveDialog({title:'Backup Data',defaultPath:`Smart-Kisti-Backup-${new Date().toISOString().slice(0,10)}.json`,filters:[{name:'JSON',extensions:['json']}]});if(r.canceled)return false;fs.writeFileSync(r.filePath,JSON.stringify(data,null,2),'utf8');return r.filePath});
ipcMain.handle('data:restore',async()=>{const r=await dialog.showOpenDialog({properties:['openFile'],filters:[{name:'JSON',extensions:['json']}]});if(r.canceled)return null;return JSON.parse(fs.readFileSync(r.filePaths[0],'utf8'))});
ipcMain.handle('folder:open',()=>shell.openPath(path.dirname(ensure())));
ipcMain.handle('pdf:save',async(e)=>{const r=await dialog.showSaveDialog({title:'Save PDF Report',defaultPath:`Smart-Kisti-Report-${new Date().toISOString().slice(0,10)}.pdf`,filters:[{name:'PDF',extensions:['pdf']}]});if(r.canceled)return false;const w=BrowserWindow.fromWebContents(e.sender);const pdf=await w.webContents.printToPDF({printBackground:true,pageSize:'A4',margins:{marginType:'default'}});fs.writeFileSync(r.filePath,pdf);return r.filePath});
ipcMain.handle('app:info',()=>({version:app.getVersion(),dataPath:ensure()}));
