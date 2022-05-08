"use strict";

const MAX_TIME = 30;

// periodic tasks
class PeriodicTask {
  constructor(interval, calculationTime) {
    this.interval = interval;
    this.calculationTime = calculationTime;
  }
}

// draw periodic tasks
(() => {
  const taskInners = []
  for(let i=0; i<2; i++) {
    const mainContainer = document.getElementById("main_container");
    const taskWrapper = document.createElement('div');
    taskWrapper.classList.add('task_wrapper');
    mainContainer.appendChild(taskWrapper);
    const taskName = document.createElement('p');
    taskName.classList.add('task_name');
    taskName.innerHTML = `周期タスク${i+1}`;
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
      taskBar.classList.add(`${j % 2 === 1 ? 'task_bar' : 'task_bar-occur'}`);
      tasks.appendChild(taskBar);
      const time = document.createElement('p');
      time.classList.add('task_time');
      time.innerHTML = `${j}`;
      taskBar.appendChild(time);
      const taskBlock = document.createElement('div');
      taskBlock.classList.add(`${j % 3 === 1 ? 'task_block' : 'task_block-progress'}`);
      tasks.appendChild(taskBlock);
    }
  }

  const syncScroll = (scrolledElem) => {
    taskInners.forEach(taskInner => {
      taskInner.scrollLeft = scrolledElem.scrollLeft
    })
  }
})();