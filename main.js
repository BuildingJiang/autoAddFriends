var shell = require('shelljs');
var fs = require('fs');
var DOMParser = require('xmldom').DOMParser;

var currentAllNodes=null;

function getTime() {
    return new Date().toLocaleString();
}

function sleep(milliSeconds) { 
    var startTime = new Date().getTime(); 
    while (new Date().getTime() < startTime + milliSeconds);
 };

function refreshNodes(){
	var result =  shell.exec('adb shell uiautomator dump /sdcard/dump.xml');
	var i = 1;
	while(result.stdout == ''){
		console.log(getTime()+'============第'+i+'次获取页面失败！！！===========')
		result =  shell.exec('adb shell uiautomator dump /sdcard/dump.xml');
		i++;
	}
	console.log(getTime()+'============第'+i+'获取页面成功！！！===========')
	shell.exec('adb pull /sdcard/dump.xml data/dump.xml')

	var xml = fs.readFileSync('data/dump.xml', 'utf8');
	var doc = new DOMParser().parseFromString(xml,'text/xml');
	currentAllNodes=doc.getElementsByTagName('node')
}

function clickByDesc(text){
	console.log(getTime()+'============正在点击:'+text+'============')
	var views=findViewByDesc(text);
	if (views.length>0) {
		var bounds=views[0].getAttribute('bounds');
		result=bounds.match(/(\d+)/g);
		var x1=parseFloat(result[0]);
		var y1=parseFloat(result[1]);
		var x2=parseFloat(result[2]);
		var y2=parseFloat(result[3]);
		var centerX=x1+(x2-x1)/2;
		var centerY=y1+(y2-y1)/2;
		console.log('center,centerY:'+centerX+' '+centerY)
		shell.exec('adb shell input tap '+centerX+' '+centerY)
	}
}

function clickByText(text){
	console.log(getTime()+'============正在点击:'+text+'============')
	var views=findViewByText(text);
	if (views.length>0) {
		var bounds=views[0].getAttribute('bounds');
		result=bounds.match(/(\d+)/g);
		var x1=parseFloat(result[0]);
		var y1=parseFloat(result[1]);
		var x2=parseFloat(result[2]);
		var y2=parseFloat(result[3]);
		var centerX=x1+(x2-x1)/2;
		var centerY=y1+(y2-y1)/2;
		console.log('center,centerY:'+centerX+' '+centerY)
		shell.exec('adb shell input tap '+centerX+' '+centerY)
	}
}


function clickById(id){
	var views=findViewById(id);
	if (views.length>0) {
		var bounds=views[0].getAttribute('bounds');
		result=bounds.match(/(\d+)/g);
		var x1=parseFloat(result[0]);
		var y1=parseFloat(result[1]);
		var x2=parseFloat(result[2]);
		var y2=parseFloat(result[3]);
		var centerX=x1+(x2-x1)/2;
		var centerY=y1+(y2-y1)/2;
		shell.exec('adb shell input tap '+centerX+' '+centerY)
	}
}

function findViewByDesc(text){
	views=new Array();
	for(var i=0;i<currentAllNodes.length;i++){
		if (currentAllNodes.item(i).getAttribute('content-desc')==text) {
			views.push(currentAllNodes.item(i));
		}
	}
	return views;
}

function findViewByText(text){
	views=new Array();
	for(var i=0;i<currentAllNodes.length;i++){
		if (currentAllNodes.item(i).getAttribute('text')==text) {
			views.push(currentAllNodes.item(i));
		}
	}
	return views;
}

function findNickClass(clazz){
	var nickName = '';
	for(var i=0;i<currentAllNodes.length;i++){
		var className = currentAllNodes.item(i).getAttribute('class');
		if (className == clazz) {
			nickName = currentAllNodes.item(i).getAttribute('text');
			break;
		}
	}
	return nickName;
}


function findViewById(id){
	views=new Array();
	for(var i=0;i<currentAllNodes.length;i++){
		var fullId=currentAllNodes.item(i).getAttribute('resource-id');
		var viewId=fullId.substring(fullId.indexOf('/')+1);
		if (viewId==id) {
			views.push(currentAllNodes.item(i));
		}
	}
	return views;
}
function inputText(text){
	shell.exec('adb shell input text '+text);
}
function tap(x,y){
	shell.exec('adb shell input tap '+x+' '+y)
}


function pressKey(keycode){
	shell.exec('adb shell input keyevent '+keycode)
}

function init(){
	console.log(getTime()+"============开始初始化============")
	refreshNodes()
	console.log(getTime()+"============点击+号============")
	clickByDesc('更多功能按钮')
	refreshNodes()
	console.log(getTime()+"============点击添加朋友============")
	sleep(1000)
	clickByText('添加朋友')
	refreshNodes()
	console.log(getTime()+"============初始化结束============")
}

function add_friend(name){
	sleep(1000)
	refreshNodes()
	var wxasj = findViewByText('微信号/手机号');
	//console.log(wxasj.length)
	if(wxasj.length == 0){
		console.log("==========返回啊！！！！！！！！！==========")
		pressKey(4)    //返回
		refreshNodes()
	}
	console.log(getTime()+"开始搜索---------------------------------------->"+name)
	sleep(500)
    clickByText('微信号/手机号')
	console.log(getTime()+"开输入---------------------------------------->"+name)
	sleep(500)
	inputText(name)
	refreshNodes()
	console.log(getTime()+'--------------点击搜索---------------')
	sleep(500)
	clickByText('搜索:'+name)
	refreshNodes()
	sleep(500)
	var  operationsFrequent = findViewByText('操作过于频繁，请稍后再试')
	var views=findViewByText('添加到通讯录')
	if(operationsFrequent.length>0){
		console.log("-------------------"+getTime()+"操作过于频繁，已停止操作！-------------------------");
		console.log("-------------------"+getTime()+"已经添加到 "+name+" -------------------------");
		sleep(99999999999999999)
		return
	}else if (views.length>0) {
	    console.log("==========点击设置备注和标签==========")
		clickByText('设置备注和标签')
		refreshNodes()
		//判断是否包含‘税务、会计等信息’
		var nickName = findNickClass('android.widget.EditText');
		var remark = findViewByText('添加到通讯录')
		console.log("==========昵称"+nickName+"==========")
		
		//sleep(999999999999)
		if(nickName != '' && remark.length > 0 && (nickName.indexOf('税') != -1 || nickName.indexOf('会计') != -1  || nickName.indexOf('注册') != -1 || nickName.indexOf('代理') != -1  ||  nickName.indexOf('财') != -1 || nickName.indexOf('账') != -1)){
			pressKey(4)    //返回
			pressKey(4)    //返回
			pressKey(4)    //返回
			return;
		}
		
		console.log("==========点击添加更多备注信息==========")
		clickByText('添加更多备注信息')
		inputText(name)
		clickByText('保存')
		refreshNodes()
		sleep(500)
		clickByText('添加到通讯录')
		refreshNodes()
		sleep(500)
		var sendBtns=findViewByText('发送')
		//var sendMessageBtns=findViewByText('发消息')
		if (sendBtns.length>0 ) {
			clickByText('发送')
			sleep(500)
			refreshNodes()
			sleep(500)
			var sendBtns2=findViewByText('发送')
			if (sendBtns2.length>0 ) {
				pressKey(4)    //返回
				sleep(500)
				pressKey(4)    //返回
				sleep(500)
				pressKey(4)    //返回
				sleep(500)
				pressKey(4)    //返回
				console.log("-------------------"+getTime()+"打招呼过于频繁，已停止操作 ！-------------------------");
				
				console.log("-------------------"+getTime()+"已经添加到 "+name+" -------------------------");
				
				sleep(99999999999999999)
				return;
			}
		}
		console.log(getTime()+"------"+name+":好友申请，发送成功");
		success.push(name);
		pressKey(4)    //返回
		pressKey(4)    //返回
	}else{
		sleep(500)
		var sendMsg=findViewByText('发消息');
		if (sendMsg.length>0) {
			console.log(getTime()+"---------"+name+":已经是好友无需再次添加");
			pressKey(4)    //返回
			pressKey(4)    //返回
		}else{
			sleep(500)
			var notExist=findViewByText('该用户不存在');
			var noDisplay=findViewByText('被搜帐号状态异常，无法显示');
			if (notExist.length>0||noDisplay.length>0) {
				pressKey(4)    //返回
				console.log(getTime()+"--------"+name+":用户不存在或，用户账号状态异常");
			}
		}
		failed.push(name);
	}
}


var success=new Array();
var failed=new Array();
function main(){
	init();
	var readline = require('readline');  
	var fs = require('fs');  
	var os = require('os');  
	var fRead = fs.createReadStream('data/name.txt');

	const rl = readline.createInterface({
	  input: fRead
	});
	rl.on('line', (line) => {
		add_friend(line);
	});
	rl.on('close', (line) => {
	  	pressKey(4)    //返回
		pressKey(4)    //返回
		console.log("--------------------"+getTime()+"----------------------");
		console.log('所有账号已处理完成,成功：'+success.length+'个，失败：'+failed.length+'个');

		console.log('添加成功的账号如下:')
		for(var i=0;i<success.length;i++){
			console.log(success[i]);
		}

		console.log('------------------------------------------');
		console.log('添加失败的账号如下:')
		for(var i=0;i<failed.length;i++){
			console.log(failed[i]);
		}
	});
	
}

main();



