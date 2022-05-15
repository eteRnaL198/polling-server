const configInputElems = document.getElementsByClassName("config_input");
const [
  execTime, 
  periodicPeriod, 
  periodicCalc,
  aperiodicTime,
  aperiodicCalc,
  pollPeriod,
  pollCapa
] = Array.from(configInputElems);
const execButton = document.getElementById("execute");

execTime.value = 100;
aperiodicTime.value = 0;
aperiodicCalc.value = 100;

for(let i=0; i<10; i++) {
  periodicPeriod.value = 20;
  periodicCalc.value = 2*(i+1);
  for(let j=0; j<10; j++) {
    pollPeriod.value = 10;
    pollCapa.value = j+1;
    execButton.click();
    const backButton = document.getElementsByClassName("schedule_button")[0];
    backButton.click();
  }
}