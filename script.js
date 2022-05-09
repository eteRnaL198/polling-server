"use strict";

const MAX_TIME = 30;

// periodic tasks
class PeriodicTask {
  deadlineTime;

  constructor(name, period, calculationTime) {
    this.name = name;
    this.calculationTime = calculationTime;
    this.occurTimes = this.createOccurTimes(period);
    this.period = period;
    this.isFailed = false;
    this.remaining = 0;
    this.progressTimes = [];
  }
  createOccurTimes(period) {
    return [...Array(Math.floor(MAX_TIME/period)+1).fill(0).map((_, index) => index*period)];
  }
  #pushProgressTimes(time) {
    this.progressTimes = [...this.progressTimes, time];
  }
  occur(deadlineTime) {
    this.#updateDeadlineTime(deadlineTime);
    this.isFailed = this.remaining !== 0 ? true : false;
    this.#setRemaining(this.calculationTime);
  }
  progress(time) {
    this.#pushProgressTimes(this.remaining > this.calculationTime ? -1*time : time);
    this.#reduceRemaining();
  }
  #updateDeadlineTime(time) {
    this.deadlineTime = time+this.period;
  }
  #setRemaining(r) {
    this.remaining += r;
  }
  #reduceRemaining() {
    this.remaining--;
  }
  // draw
}

// create tasks
const periodicTasks = [];
const periodicTask1 = new PeriodicTask("周期タスク1", 4, 1);
periodicTasks.push(periodicTask1);
const periodicTask2 = new PeriodicTask("周期タスク2", 6, 2);
periodicTasks.push(periodicTask2);
const periodicTask3 = new PeriodicTask("周期タスク3", 5, 2);
periodicTasks.push(periodicTask3);

// schedule
(() => {
  const pendingTasks = []
  for(let t=0; t<MAX_TIME; t++) {
    periodicTasks.forEach((task) => {
      if(task.occurTimes.includes(t)) {
        task.occur(t);
        pendingTasks.push(task);
      }
    })
    pendingTasks.sort((a, b) => a.period - b.period);
    if(pendingTasks[0]) {
      pendingTasks[0].progress(t);
      if(pendingTasks[0].remaining === 0) pendingTasks.shift();
    }
  }

})();

// draw periodic tasks
(() => {
  const taskInners = []
  periodicTasks.forEach((task, i) => {
    const mainContainer = document.getElementById("main_container");
    const taskWrapper = document.createElement('div');
    taskWrapper.classList.add('task_wrapper');
    mainContainer.appendChild(taskWrapper);
    const taskName = document.createElement('p');
    taskName.classList.add('task_name');
    taskName.innerHTML = task.name;
    taskWrapper.appendChild(taskName);
    const taskInner = document.createElement('div');
    taskInner.classList.add('task_inner');
    taskInners.push(taskInner);
    taskInner.addEventListener("scroll", () => syncScroll(taskInner));
    taskName.appendChild(taskInner);
    const tasks = document.createElement('div');
    tasks.classList.add('tasks');
    tasks.id = `task-${i+1}`;
    taskInner.appendChild(tasks);
    for(let t=0; t<MAX_TIME; t++) {
      const taskBar = document.createElement('div');
      taskBar.classList.add(`${task.occurTimes.includes(t) ? 'task_bar-occur' : 'task_bar'}`);
      tasks.appendChild(taskBar);
      const timeLabel = document.createElement('p');
      timeLabel.classList.add('task_time');
      timeLabel.innerHTML = `${t}`;
      taskBar.appendChild(timeLabel);
      const taskBlock = document.createElement('div');
      if(task.progressTimes.includes(t)) {
        taskBlock.classList.add("task_block-progress");
      } else if(task.progressTimes.includes(-1*t) && !task.progressTimes.includes(0)) {
        taskBlock.classList.add("task_block-progress");
        taskBlock.classList.add('bgc-red');
      } else taskBlock.classList.add("task_block");
      tasks.appendChild(taskBlock);
    }
  })

  const syncScroll = (scrolledElem) => {
    taskInners.forEach(taskInner => {
      taskInner.scrollLeft = scrolledElem.scrollLeft
    })
  }
})();