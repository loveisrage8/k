const zerorpc = require("zerorpc");
const $ = require('jquery');
const { ipcRenderer } = require('electron')
let client = new zerorpc.Client({heartbeatInterval: 60 * 60 * 24 * 30 * 12, timeout: 60 * 60 * 24 * 30 * 12})// 1 Year
let bots_load = 0
let selected_bot = 0
const bots_n = {'AcceptFollowers':1, 'AppealBot':2, 'PostDeleter':3, 'AutoPoster':4, 'DMDeleter':5, 'ReportBot':6, 'AutoDM':7, 'UnfollowerBot':8, 'PostSpammer':9, 'AutoPosterFree': 41, 'AutoDMFree': 71}
const bots_free_n = 2

function sendToPython(id, func, parameters) {
  client.connect("tcp://127.0.0.1:4242")

  var gRes = null;

  client.invoke(func, parameters, (error, res) => {
    if(error) {
      return error;
    } else {
      let curr_iframe = null
      if (id != null){
        if (typeof(id) == 'object'){
          let master_iframe = document.getElementById("frame_"+id[0]);
          curr_iframe = master_iframe.contentWindow.document.getElementById("frame_"+id[1]);
        } else {
          curr_iframe = document.getElementById("frame_"+id);
        }
        let event = new CustomEvent("api-response", {"detail": {"res": res, "name": func}});
        curr_iframe.contentWindow.document.dispatchEvent(event);
      }
    }
  })
}

sendToPython(null, "freeBots", []);

//Server for get input requests from bots
var server = new zerorpc.Server({
    inputFromPY: function(frameid, botname, text, isapi, reply) {
      let curr_iframe = null
      if (frameid != 'None'){
        let master_iframe = document.getElementById("frame_"+bots_n[botname]);
        curr_iframe = master_iframe.contentWindow.document.getElementById("frame_"+frameid);
      } else {
        curr_iframe = document.getElementById("frame_"+bots_n[botname]);
      }

      let event = new CustomEvent("api-response", {"detail": {"res": text, "name": "inputFromPY", "api": isapi}});
      curr_iframe.contentWindow.document.dispatchEvent(event);
      reply(null, true)

    },
});
server.bind("tcp://127.0.0.1:5454");
server.on("error", function(error) {
    console.error("RPC server error:", error);
});

//Receiving print requests from bots
ipcRenderer.on('print-bot', (event, message) => {
  let curr_iframe = null
  if (message.id != undefined){
    let master_iframe = document.getElementById("frame_"+bots_n[message.botname]);
    curr_iframe = master_iframe.contentWindow.document.getElementById("frame_"+message.id);
  } else {
    curr_iframe = document.getElementById("frame_"+bots_n[message.botname]);
  }
  let reevent = new CustomEvent("api-response", {"detail": {"name": "consoleOut", "res": message.output}});
  curr_iframe.contentWindow.document.dispatchEvent(reevent);
})

client.connect("tcp://127.0.0.1:4242");

function jsKeyValidation(key, botName, group) {

  for (obj of document.getElementsByClassName('btn_free')) {
    obj.style.display = 'None'
  }



  group.children[0].style.display = 'None'
  group.children[1].style.display = 'None'
  group.children[2].style.display = 'None'
  group.children[3].style.display = 'None'
  group.children[4].style.display = 'None'
  // group.children[5].style.visibility = ''
  group.parentElement.lastElementChild.style.visibility = ''

  document.getElementById('leftPanel').classList.add('disabled')
  client.invoke("validateKey", [key, botName], (error, res) => {
    if(error) {
      console.error(error)
    } else {
      console.log(res)
      group.children[4].innerText = res
      switch (res) {
        case "Program was already unlocked":
        case "Program has been successfully unlocked":
          document.getElementById("btn_"+bots_n[botName]).children[0].classList.add('hasKey');
          document.getElementById("btn_"+bots_n[botName]).children[0].classList.add('keyValid');
          document.getElementById("btn_"+bots_n[botName]).children[0].style.cssText = "color: rgba(255, 255, 255, 1) !important;";
          group.style.display = 'None'
          group.parentElement.children[0].style.display = 'None'
          if(selected_bot==bots_n[botName]){

            let curr_iframe = document.getElementById("frame_"+bots_n[botName]);
            curr_iframe.style.display = '';
            group.parentElement.style.display = 'none';

            let event = new CustomEvent("iframe-focus", {"detail": "enabled"});
            curr_iframe.contentWindow.document.dispatchEvent(event);
          }
          break;
        default:
          document.getElementById("btn_"+group.parentElement.id.slice(4)).children[0].style.cssText = "color: rgba(255, 255, 255, 0.5) !important;";
      }

      group.children[0].style.display = ''
      group.children[1].style.display = ''
      group.children[2].style.display = ''
      group.children[3].style.display = ''
      group.children[4].style.display = ''
      // group.children[5].style.visibility = 'hidden'
      group.parentElement.lastElementChild.style.visibility = 'hidden'
    }

    for (obj of document.getElementsByClassName('btn_free')) {
      obj.style.display = ''
    }


    document.getElementById('leftPanel').classList.remove('disabled')
  })
}

//arg is the button from the bots on the left in index, if key is stored text white
function jsIsKeyStored(btn_obj) {
  document.getElementById('leftPanel').classList.add('disabled')
  client.invoke("isKeyStored", btn_obj.innerText.replace(' ',''), (error, res) => {
    if(error) {
      console.error(error)
    } else {
      console.log(res)
      if(!res){
        btn_obj.style.cssText = "color: rgba(255, 255, 255, 0.5) !important;";
      } else {
        btn_obj.classList.add('hasKey');
      }
    }
    bots_load += 1;
    if (bots_load == Object.keys(bots_n).length-bots_free_n) $(".loader-wrapper").fadeOut("fast");
    document.getElementById('leftPanel').classList.remove('disabled')
  })
}

//Detect Enter Key press
for (i = 1; i <= Object.keys(bots_n).length-bots_free_n; i++ ){
  document.getElementById("tab_"+i).children[1].children[0].addEventListener("keypress", function(e) {
      var key = e.which || e.keyCode || 0;

      if (key === 13) {
          jsKeyValidation(this.value, this.parentElement.parentElement.children[0].innerText.replace(' ',''), this.parentElement);
      }

  });
}

//Scan for keys
for (i = 1; i <= Object.keys(bots_n).length-bots_free_n; i++ ){
  btn_obj = document.getElementById("btn_"+i).children[0]
  jsIsKeyStored(btn_obj)

}

function browseBots(n){
  if(document.getElementById("leftPanel").classList.contains('disabled')) return false;
  selected_bot = n


  document.getElementById("tab_free").style.display = "none";
  document.getElementById("tab_0").style.display = "none";

  for (var key of Object.keys(bots_n)){
    try {
      if(bots_n[key]==n){
        document.getElementById("btn_"+n).className = "container botLink-active";
      }else{

        let curr_iframe = document.getElementById("frame_"+bots_n[key]);
        curr_iframe.style.display = 'None';

        let event = new CustomEvent("iframe-focus", {"detail": "disabled"});
        curr_iframe.contentWindow.document.dispatchEvent(event);

        document.getElementById("btn_"+bots_n[key]).className = "container botLink";
      }
    } catch {}
  }

  try {
    let group_arg = document.getElementById("tab_"+n).children[1].children[0].parentElement;
    group_arg.style.display = ''
    group_arg.parentElement.children[0].style.display = ''
    if(document.getElementById("btn_"+n).children[0].classList.contains('hasKey')){
      if(document.getElementById("btn_"+n).children[0].classList.contains('keyValid')){

        group_arg.children[0].style.display = 'None'
        group_arg.children[1].style.display = 'None'
        group_arg.children[2].style.display = 'None'
        group_arg.children[3].style.display = 'None'
        group_arg.children[4].style.display = 'None'
        // group.children[5].style.visibility = ''
        group_arg.parentElement.lastElementChild.style.visibility = ''

        document.getElementById("btn_"+n).children[0].style.cssText = "color: rgba(255, 255, 255, 1) !important;";
        group_arg.style.display = 'None'
        group_arg.parentElement.children[0].style.display = 'None'
        if(selected_bot==bots_n[document.getElementById("btn_"+n).innerText.replace(' ','')]){

          let curr_iframe = document.getElementById("frame_"+n);
          curr_iframe.style.display = '';
          group_arg.parentElement.style.display = 'none';

          let event = new CustomEvent("iframe-focus", {"detail": "enabled"});
          curr_iframe.contentWindow.document.dispatchEvent(event);
        }
        group_arg.children[0].style.display = ''
        group_arg.children[1].style.display = ''
        group_arg.children[2].style.display = ''
        group_arg.children[3].style.display = ''
        group_arg.children[4].style.display = ''
        // group.children[5].style.visibility = 'hidden'
        group_arg.parentElement.lastElementChild.style.visibility = 'hidden'

      } else{
        jsKeyValidation('', document.getElementById("btn_"+n).innerText.replace(' ',''), group_arg);
      }

    }

    for (var key of Object.keys(bots_n)){
      try{
        document.getElementById("tab_"+bots_n[key]).style.display = "none";
      } catch{}

    }
    document.getElementById("tab_"+n).style.display = "block";
  } catch(error) {console.error(error)}


  //sendToPython('testPrint', null);
  //sendToPython('getReportReasons', null);
}

//reportBot.dispatchEvent(new Event('submit'));


function selectFreeBot(n){
  document.getElementById('leftPanel').classList.add('disabled')
  for (i = 0; i <= Object.keys(bots_n).length-bots_free_n; i++ ){
    document.getElementById("tab_"+i).style.display = "none";
  }
  for (var key of Object.keys(bots_n)) {
    try {
      document.getElementById("btn_"+bots_n[key]).className = "container botLink";
    } catch { }

    let curr_iframe = document.getElementById("frame_"+bots_n[key]);
    curr_iframe.style.display = 'None';

    let status_e = 'disabled'

    if(bots_n[key]==n){
      status_e = 'enabled'
    }
    let event = new CustomEvent("iframe-focus", {"detail": status_e});
    curr_iframe.contentWindow.document.dispatchEvent(event);
  }

  document.getElementById("tab_free").style.display = "block";

  let curr_iframe = document.getElementById("frame_"+n);
  curr_iframe.style.display = '';


  document.getElementById('leftPanel').classList.remove('disabled')


}

const customTitlebar = require('custom-electron-titlebar');

let titleBar = new customTitlebar.Titlebar({
	backgroundColor: customTitlebar.Color.fromHex('#4495E5'),
  icon: "./static/img/kekbots.png",
  drag: true,
  minimizable: true,
  maximizable: false,
  closeable: true,
  shadow: false,
  unfocusEffect: false,
  enableMnemonics: false
});
