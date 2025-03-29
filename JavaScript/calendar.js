function loadMonth(){
var monthList = ['Январь', 'Февраль', 'Март','Апрель','Май', 'Июнь','Июль','Август','Сентябрь','Октябрь', 'Ноябрь','Декабрь'];
var newDate = new Date();
var month = newDate.getMonth();
document.getElementsByClassName('monthLine')[0].innerHTML=monthList[month];
getElement(".monthLine",0).setAttribute("month",month);
}
function badYear(y){
var badyear = 1980;
var result = false;
while(badyear <= y){
if(badyear == y){
var result = true;
}
badyear = badyear + 4;
}
if(result == true){
var day = 29;
}
else{
var day = 28;
}
return day;
}
function loadWeek(year,month,dayOne){
var feb = badYear(year);
var allDay = [31,feb,31,30,31, 30,31,31,30,31,30,31];
var thisDate = new Date();
var thisDay = thisDate.getDate();
var this_mount = parseInt(thisDate.getMonth());
var this_year  = parseInt(thisDate.getFullYear());
var d = 1;
var i = 0;
while(i <= 34){
var dateOne = new Date(year, month, d);
var dayWeek = dateOne.getDay();
var week = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];
if(dayWeek != 0){
var dayNumb = dayWeek - 1;
}
else{
var dayNumb = 6;
}
var weekNum = document.createElement('a');
if(d == thisDay){
if (month == this_mount) {
if (year==this_year) {
weekNum.setAttribute("class","dayNum thisDay");
weekNum.setAttribute("this_day","");  
}  else{
  weekNum.setAttribute("class","dayNum");
  }
}else{
  weekNum.setAttribute("class","dayNum");
  }
}
else{
weekNum.setAttribute("class","dayNum");
}

document.getElementsByClassName('dayLine')[0].appendChild(weekNum);
if(i >= dayNumb){
if(allDay[month] >= d){
weekNum.innerHTML=d;

}
d++;
}

i++;

}

}
function loadDays(month,year){
var dateOne = new Date(year, month, 1);
var dayOne = dateOne.getDay();
if(dayOne != 0){
var dayNumb = dayOne - 1;
}
else{
var dayNumb = 6;
}
loadWeek(year,month,dayNumb);
getElement(".dayNum").forEach(el => 
  el.addEventListener("click", function() {	
    selectDayToCalendar(this)
}));
document.getElementsByClassName('yearLine')[0].innerHTML=year;
getElement(".yearLine",0).setAttribute("year",year);
}

function loadCalendar(){
var menuLoader = document.getElementsByClassName('menuLoader')[0];
menuLoader.innerHTML="<div class='monthLine'></div><div class='yearLine'></div><div class='weekLine'></div><div class='dayLine'></div>";
var week = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];
var i = 0;
while(i < week.length){
var weekNum = document.createElement('a');
if(i != 6){
weekNum.setAttribute("class","weekNum");
}
else{
weekNum.setAttribute("class","weekNum weekNumLast");
}
weekNum.innerHTML=week[i];
document.getElementsByClassName('weekLine')[0].appendChild(weekNum);
i++;
}
loadMonth();
var thisDate = new Date();
var this_mount = parseInt(thisDate.getMonth());
var this_year  = parseInt(thisDate.getFullYear());
loadDays(this_mount,this_year);

getElement(".monthLine",0).addEventListener("click", function() {	
  createMountList()
});
getElement(".yearLine",0).addEventListener("click", function() {	
  createYearList()
});
}
function addCalendar(n){
menuOpenFunc(1);
var nameCal =['miniCalendar', 'nodeCalendar'];
var menu = document.getElementsByClassName('menu')[0];
var winAtr = menu.getAttribute('class');
menu.setAttribute('class',winAtr+' '+nameCal[n]);
loadCalendar();
console.log("load");

}
function calcCalendar() {
getElement(".dayLine",0).innerHTML="";
var month = parseInt(getElement(".monthLine",0).getAttribute("month"));
var year = parseInt(getElement(".yearLine",0).getAttribute("year"));
loadDays(month,year);
}
function selectDayToCalendar(day) {
  
var day_select = getElement(".selectDay",0);
if (day_select!=undefined) {
if (day_select.getAttribute("this_day")!=undefined) {
  if (day_select!=day) {
day_select.setAttribute("class","dayNum thisDay");   
  }   
} else {
if (day_select!=day) {
day_select.setAttribute("class","dayNum");    
}
}   
}
if (day.innerHTML!="") {
if (day.getAttribute("class")!="dayNum selectDay") {
day.setAttribute("class","dayNum selectDay");     
} 
}   
}
function createYearList() {
  var thisDate = new Date();
  var this_year  = parseInt(thisDate.getFullYear());
  var max_year = this_year + 35;
  createElement("mount_list","",".menuLoader");
  for (let i = this_year; i <= max_year; i++) {
  createElement("year_data","","mount_list",i);
  }
  getElement("year_data").forEach(el => 
    el.addEventListener("click", function() {	
      selectYearToCalendar(parseInt(this.innerHTML))
  }));
  
  }
function createMountList() {
var monthList = ['Январь', 'Февраль', 'Март','Апрель','Май', 'Июнь','Июль','Август','Сентябрь','Октябрь', 'Ноябрь','Декабрь']; 
createElement("mount_list","",".menuLoader");
for (let i = 0; i < monthList.length; i++) {
createElement("mount_data","mount_id="+i,"mount_list",monthList[i]);
}
getElement("mount_data").forEach(el => 
  el.addEventListener("click", function() {	
    selectMonthToCalendar(this)
}));

}
function selectMonthToCalendar(mount_data) {
var md = getElement(".monthLine",0);
md.innerHTML=mount_data.innerHTML;
md.setAttribute("month",mount_data.getAttribute("mount_id"));  
getElement("mount_list",0).remove();
calcCalendar();
}
function selectYearToCalendar(year) {
var yd = getElement(".yearLine",0); 
yd.innerHTML=year;
yd.setAttribute("year",year);
getElement("mount_list",0).remove();
calcCalendar();
}








