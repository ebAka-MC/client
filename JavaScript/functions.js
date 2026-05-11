
//grade func
function getElement(x, y) {
  let element;
  
  if (y === undefined) {
    element = document.querySelectorAll(x);
  } else {
    element = document.querySelectorAll(x)[y];
  }
  
  // Добавляем метод searchEl, если запрошен один элемент (не NodeList)
  if (element && y !== undefined) {
    element.searchEl = function(selector) {
      return this.querySelectorAll(selector);
    };
  }
  
  return element;
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

function removeElement(e,n) {
document.querySelectorAll(e)[n].remove();
}

function getElementTo(tags, elements) {
var el = elements.querySelectorAll(tags)[0];
return el;   
}






