const { ipcRenderer } = require('electron')

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

ipcRenderer.on('update-data', (event, progressObj) => {
  document.getElementById("wholebar").style.display = ""
  out = document.getElementById("updateText");
  bar = document.getElementById("progressbar");
  let log_message = (progressObj.bytesPerSecond / 1000000).toFixed(2)+" MB/s";
  log_message = log_message + '     (' + (progressObj.transferred / 1000000).toFixed(2)+" MB" + "/" + (progressObj.total / 1000000).toFixed(2)+" MB" + ')';
  bar.style.width = progressObj.percent + '%';
  //bar.innerText = progressObj.percent.toFixed() + '%';
  bar.style.fill = "rgba(102, 95, 238, .9)";
  out.innerText = log_message;
})
ipcRenderer.on('update-ready', (event, unused) => {
  // document.getElementById("updateText").innerText = "Successfully downloaded update.";
  // document.getElementById("wholebar").style.display = "none";
  // document.getElementById("btn_update").style.display = "";
  // document.getElementById("btn_later").style.display = "";

  btnUpdate()
})

ipcRenderer.on('update-msg', (event, msg) =>{
  document.getElementById("updateText").innerText = msg
});

async function btnUpdate(){
  document.getElementById("updateText").innerText = "Successfully downloaded update.";
  document.getElementById("wholebar").style.display = "none";
  await sleep(1000);
  ipcRenderer.send('update-command', true)
}

function btnLater(){
  ipcRenderer.send('update-command', false)
}
