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
    this.state = this.setState("free");
    this.overdue = false;
  }
  progress() {
    this.remaining--;
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
  setState(state) {
    this.state = state;
  }
  isOverdue() {
    this.overdue = this.remaining > this.calculationTime
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
    this.remaining += this.calculationTime;
  }
  #drawFeature() {
    const taskPeriod = document.createElement('p');
    taskPeriod.innerHTML = `周期:${this.period}`;
    this.taskFeatureElem.appendChild(taskPeriod);
    const taskCalcTime = document.createElement('p');
    taskCalcTime.innerHTML = `計算時間:${this.calculationTime}`;
    this.taskFeatureElem.appendChild(taskCalcTime);
  }
  drawBlock(wrapper) {
    const taskBlock = document.createElement('div');
    taskBlock.classList.add("task_block");
    if(this.overdue) {
      taskBlock.classList.add('bgc-red');
    }
    wrapper.appendChild(taskBlock);
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
    this.remaining += this.calculationTime;
  }
  progress() {
    super.progress();
    if(this.remaining == 0) {
      this.calculationTimes = this.calculationTimes.slice(1);
      this.calculationTime = this.calculationTimes[0];
    }
  }
  #initOccurTimes(data) {
    return data.map((data) => data.occurTime);
  }
  #initCalculationTimes(data) {
    return data.map((data) => data.calculationTime);
  }
  drawBar(t, isOccur) {
    super.drawBar(t, isOccur);
    // 小さく発生タスク数描画
  }
  drawBlock(wrapper) {
    const taskBlock = document.createElement('div');
    taskBlock.classList.add("task_block");
    if(this.overdue) {
      taskBlock.classList.add('bgc-red');
    }
    wrapper.appendChild(taskBlock);
  }
}

class PollingServer extends Task {
  constructor(name, period, capacity) {
    super(name);
    this.period = period;
    this.capacity = capacity;
    this.#drawFeature();
  }
  isOccurTime(t) {
    return t % this.period === 0 || t === 0
  }
  occur() {
    this.remaining = this.capacity;
  }
  progress(task) {
    // if(task.remaining > 0) {
      super.progress();
      // task.progress();
    // }
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
    // if(i=0 && this.state === "progress") {
    //   taskBlock.classList.add('bgc-gray');
    // }
    let innerHtml = "";
    const height = 100 / this.capacity;
    for(let i=0; i<this.remaining; i++) {
      innerHtml += `<div class="task_block" style="height:${height}%"></div>`
    }
    wrapper.innerHTML = innerHtml;
  }
}

// create tasks
const AllTasks = [];
const periodicTask1 = new PeriodicTask("周期タスク1", 4, 1);
AllTasks.push(periodicTask1);
const periodicTask2 = new PeriodicTask("周期タスク2", 6, 2);
AllTasks.push(periodicTask2);
// const periodicTask3 = new PeriodicTask("周期タスク3", 5, 2);
// AllTasks.push(periodicTask3);
// const aperiodicTask = new AperiodicTask("非周期タスク", [
//   {occurTime: 2, calculationTime: 2}, 
//   {occurTime: 8, calculationTime: 1},
//   {occurTime: 12, calculationTime: 2}, 
//   {occurTime: 19, calculationTime: 1}
// ]);
// AllTasks.push(aperiodicTask);
const pollingServer = new PollingServer("Polling Server", 4, 3);
AllTasks.push(pollingServer);

// schedule
(() => {
  const pendingTasks = [];
  for(let t=0; t<MAX_TIME; t++) {
    AllTasks.forEach((task) => {
      task.setState("free");
      if(task.isOccurTime(t)) {
        task.occur();
        task.drawBar(t, true);
        pendingTasks.push(task);
      } else {
        task.drawBar(t, false)
      }
    })
    pendingTasks.sort((a, b) => a.period - b.period);
      while(pendingTasks[0] && pendingTasks[0].remaining === 0) {
        pendingTasks.shift();
      }
      if(pendingTasks[0]) pendingTasks[0].setState("progress");
    AllTasks.forEach((task) => {
      task.isOverdue();
      if(task.overdue) console.log(`${task.name} is overdue! t=${t}`);
      const wrapper = task.drawBlockWrapper();
      if(task.state === "progress") {
        task.progress();
        task.drawBlock(wrapper);
      } else if(task.state === "wait") {
        task.drawBlock(wrapper)
      }
    })
  }
})();
