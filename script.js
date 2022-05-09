"use strict";

const MAX_TIME = 30;

// periodic tasks
class PeriodicTask {
  progressTimes = [];
  deadlineTime;
  remaining;

  constructor(name, interval, calculationTime) {
    this.name = name;
    this.calculationTime = calculationTime;
    this.occurTimes = this.createOccurTimes(interval);
    // this.interval = interval;
    // this.deadline = interval;
  }
  createOccurTimes(interval) {
    return [...Array(Math.floor(MAX_TIME/interval)+1).fill(0).map((_, index) => index*interval)];
  }
  #pushProgressTimes(time) {
    this.progressTimes = [...this.progressTimes, time];
  }
  occur(deadlineTime) {
    this.#updateDeadLineTime(deadlineTime);
    this.#setRemaining(this.calculationTime)
  }
  progress(time) {
    this.#pushProgressTimes(time);
    this.#reduceRemaining();
  }
  #updateDeadLineTime(time) {
    this.deadlineTime = time;
  }
  #setRemaining(r) {
    this.remaining = r;
  }
  #reduceRemaining() {
    this.remaining--;
  }
  // draw
}

const periodicTasks = [];
const periodicTask1 = new PeriodicTask("周期タスク1", 4, 1);
periodicTasks.push(periodicTask1);
const periodicTask2 = new PeriodicTask("周期タスク2", 6, 2);
periodicTasks.push(periodicTask2);

// schedule
(() => {
  const pendingTasks = []
  for(let i=0; i<MAX_TIME; i++) {
    periodicTasks.forEach((task) => {
      if(task.occurTimes.includes(i)) {
        task.occur(i);
        pendingTasks.push(task);
      }
    })
    pendingTasks.sort((a, b) => a.deadlineTime - b.deadlineTime);
    if(pendingTasks[0]) {
      pendingTasks[0].progress(i);
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
    for(let j=0; j<MAX_TIME; j++) {
      const taskBar = document.createElement('div');
      taskBar.classList.add(`${task.occurTimes.includes(j) ? 'task_bar-occur' : 'task_bar'}`);
      tasks.appendChild(taskBar);
      const time = document.createElement('p');
      time.classList.add('task_time');
      time.innerHTML = `${j}`;
      taskBar.appendChild(time);
      const taskBlock = document.createElement('div');
      taskBlock.classList.add(`${task.progressTimes.includes(j) ? 'task_block-progress' : 'task_block'}`);
      tasks.appendChild(taskBlock);
    }
  })

  const syncScroll = (scrolledElem) => {
    taskInners.forEach(taskInner => {
      taskInner.scrollLeft = scrolledElem.scrollLeft
    })
  }
})();