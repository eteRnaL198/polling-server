"use strict";

const MAX_TIME = 30;

class Task {
  static taskInners = [];
  constructor(name) {
    this.name = name;
    this.remaining = 0;
    this.#drawFrame();
    this.tasksElem;
    this.taskFeatureElem;
    this.state = "free"; // free → wait → progress
    this.overdue = false;
  }
  occur() {
    this.setState("wait");
  }
  wait() {
    return;
  }
  progress() {
    this.remaining -= this.remaining === 0 ? 0 : 1;
    if(this.remaining === 0) this.setState("free");
    else this.setState("wait");
  }
  #drawFrame() {
    const mainContainer = document.getElementById("main_container");
    const taskWrapper = document.createElement('div');
    taskWrapper.classList.add('task_wrapper');
    mainContainer.appendChild(taskWrapper);
    const taskFeature = document.createElement('div');
    this.taskFeatureElem = taskFeature;
    taskFeature.classList.add('task_feature');
    taskWrapper.appendChild(taskFeature);
    const taskName = document.createElement('p');
    taskName.innerHTML = this.name;
    taskName.classList.add('task_name');
    taskFeature.appendChild(taskName);
    const taskInner = document.createElement('div');
    taskInner.classList.add('task_inner');
    Task.taskInners.push(taskInner);
    taskInner.addEventListener("scroll", () => {
      Task.taskInners.forEach(otherInner => {
        otherInner.scrollLeft = taskInner.scrollLeft
      })
    });
    taskWrapper.appendChild(taskInner);
    const tasks = document.createElement('div');
    this.tasksElem = tasks;
    tasks.classList.add('tasks');
    taskInner.appendChild(tasks);
  }
  drawBar(t, isOccur) {
    const taskBar = document.createElement('div');
    taskBar.classList.add(`${isOccur ? 'task_bar-occur' : 'task_bar'}`);
    this.tasksElem.appendChild(taskBar);
    const timeLabel = document.createElement('p');
    timeLabel.classList.add('task_time');
    timeLabel.innerHTML = `${t}`;
    taskBar.appendChild(timeLabel);
  }
  drawBlockWrapper() {
    const taskBlockWrapper = document.createElement('div');
    taskBlockWrapper.classList.add('task_blockWrapper');
    return this.tasksElem.appendChild(taskBlockWrapper);
  }
  drawBlock(wrapper) {
    const taskBlock = document.createElement('div');
    taskBlock.classList.add("task_block");
    if(this.overdue) {
      taskBlock.classList.add('bgc-red');
    }
    wrapper.appendChild(taskBlock);
  }
  setState(state) {
    this.state = state;
  }
  confirmDeadline(t) {
    const overdue = this.remaining > this.calculationTime; 
    this.overdue = overdue;
    if(overdue) console.log(`${this.name} is overdue! t=${t}`);
  }
}

class PeriodicTask extends Task {
  constructor(name, period, calculationTime) {
    super(name);
    this.period = period;
    this.calculationTime = calculationTime;
    this.#drawFeature();
  }
  isOccurTime(t) {
    return t % this.period === 0 || t === 0
  }
  occur() {
    super.occur();
    this.remaining += this.calculationTime;
  }
  progress(wrapper) {
    this.drawBlock(wrapper);
    super.progress();
  }
  #drawFeature() {
    const taskPeriod = document.createElement('p');
    taskPeriod.innerHTML = `周期:${this.period}`;
    this.taskFeatureElem.appendChild(taskPeriod);
    const taskCalcTime = document.createElement('p');
    taskCalcTime.innerHTML = `計算時間:${this.calculationTime}`;
    this.taskFeatureElem.appendChild(taskCalcTime);
  }
}

class AperiodicTask extends Task {
  constructor(name, data) {
    super(name)
    this.calculationTimes = this.#initCalculationTimes(data);
    this.calculationTime = this.calculationTimes[0]
    this.occurTimes = this.#initOccurTimes(data);
  }
  isOccurTime(t) {
    return this.occurTimes.includes(t);
  }
  occur() {
    super.occur();
    this.remaining += this.calculationTime;
  }
  progress(wrapper) {
    this.drawBlock(wrapper);
    super.progress();
  }
  progress(wrapper) {
    super.progress();
    this.drawBlock(wrapper);
    if(this.state === "free") {
      this.calculationTimes = this.calculationTimes.slice(1);
      this.calculationTime = this.calculationTimes[0]; // 要素がない場合の対処
    }
  }
  #initOccurTimes(data) {
    return data.map((data) => data.occurTime);
  }
  #initCalculationTimes(data) {
    return data.map((data) => data.calculationTime);
  }
}

class PollingServer extends Task {
  constructor(name, period, capacity, aperiodicTask) {
    super(name);
    this.period = period;
    this.capacity = capacity;
    this.#drawFeature();
    this.aperiodicTask = aperiodicTask;
  }
  isOccurTime(t) {
    return t % this.period === 0 || t === 0
  }
  occur() {
    this.remaining = this.capacity;
    if(this.aperiodicTask.state === "wait") this.setState("wait");
  }
  wait(wrapper) {
    this.drawBlock(wrapper);
  }
  progress(wrapper) {
    this.drawBlock(wrapper);
    super.progress();
    this.aperiodicTask.setState("progress");
  }
  #drawFeature() {
    const taskPeriod = document.createElement('p');
    taskPeriod.innerHTML = `周期:${this.period}`;
    this.taskFeatureElem.appendChild(taskPeriod);
    const taskCalcTime = document.createElement('p');
    taskCalcTime.innerHTML = `容量:${this.capacity}`;
    this.taskFeatureElem.appendChild(taskCalcTime);
  }
  drawBlock(wrapper) {
    let innerHtml = "";
    const height = 100 / this.capacity;
    for(let i=0; i<this.remaining; i++) {
      if(i === 0 && this.state === "progress") {
        innerHtml += `<div class="task_block bgc-gray" style="height:${height}%"></div>`
      } else {
        innerHtml += `<div class="task_block" style="height:${height}%"></div>`
      }
    }
    wrapper.innerHTML = innerHtml;
  }
}

// class Scheduler {
//   constructor(t) {
//     this.maxTime = t;
//     this.allTasks = [];
//   }
//   pushAllTasks(task) {
//     this.allTasks = [...this.allTasks, task];
//   }
//   schedule() {
//     for(let t=0; t<this.maxTime; t++) {
//     }
//   }
// }

// create tasks
const allTasks = [];
const periodicTasks = [];
const periodicTask1 = new PeriodicTask("周期タスク1", 4, 1);
allTasks.push(periodicTask1);
periodicTasks.push(periodicTask1);
const periodicTask2 = new PeriodicTask("周期タスク2", 6, 2);
// const periodicTask2 = new PeriodicTask("周期タスク2", 6, 3);
allTasks.push(periodicTask2);
periodicTasks.push(periodicTask2);
// const periodicTask3 = new PeriodicTask("周期タスク3", 5, 2);
// allTasks.push(periodicTask3);
const aperiodicTask = new AperiodicTask("非周期タスク", [
  {occurTime: 2, calculationTime: 2}, 
  {occurTime: 8, calculationTime: 1},
  {occurTime: 12, calculationTime: 2}, 
  {occurTime: 19, calculationTime: 1}
]);
const pollingServer = new PollingServer("Polling Server", 5, 2, aperiodicTask);
allTasks.push(pollingServer);
periodicTasks.push(pollingServer);
allTasks.push(aperiodicTask);

// schedule
(() => {
  // const pendingTasks = [];
  for(let t=0; t<MAX_TIME; t++) {
    allTasks.forEach((task) => {
      if(task.isOccurTime(t)) {
        task.occur();
        task.drawBar(t, true);
        // pendingTasks.push(task);
      } else {
        task.drawBar(t, false);
      }
    })
    const priorityTask = periodicTasks.filter((task) => task.state === "wait").sort((a, b) => a.period - b.period)[0];
    if(priorityTask) priorityTask.setState("progress");
    // pendingTasks.sort((a, b) => a.period - b.period);
    // while(pendingTasks[0] && pendingTasks[0].state === "free") {
    //   pendingTasks.shift();
    // }
    // if(pendingTasks[0] && pendingTasks[0].state === "wait") {
    //   pendingTasks[0].setState("progress");
    // }
    allTasks.forEach((task) => {
      task.confirmDeadline(t);
      const wrapper = task.drawBlockWrapper();
      console.log(task.name, task.state, task.remaining, t);
      if(task.state === "progress") {
        task.progress(wrapper);
      } else if(task.state === "wait") {
        task.wait(wrapper);
      }
    })
  }
})();
