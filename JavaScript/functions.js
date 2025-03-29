
//grade func
function getElement(x,y) {
if(y == undefined) {
var el = document.querySelectorAll(x); 
}else {
var el = document.querySelectorAll(x)[y]; 
}
return el;   
}
function createElement(name, attributes, apend,inner) {
var new_el = document.createElement(name);
if(attributes != "") {
var arr_atr = attributes.split("&");
var arr_len = arr_atr.length;
for(var i=0;i<arr_len;i++){
var get_atr = arr_atr[i].split("=");	
var name = get_atr[0];
var data = get_atr[1];
new_el.setAttribute(name,data);
}    
} 
if(apend != undefined){
getElement(apend,0).appendChild(new_el);   
}else{
return new_el;
}
if(inner != undefined){
new_el.innerHTML=inner;
}
return new_el;
}

function elementAttribute(el,pos,name) {
var atr = getElement(el,pos).getAttribute(name);
return atr;  
}

function removeElement(e,n) {
document.querySelectorAll(e)[n].remove();
}

function setElementImage(el,size,position,url) {
getElement(el,0).setAttribute("style","background-image:url('"+url+"');background-repeat:no-repeat;background-position:"+position+";background-size:"+size+";");    
}

function getElementToElement(tags, elements) {
var el = elements.querySelectorAll(tags)[0];
return el;   
}



