"use strict";

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
    const container = document.getElementById("schedule");
    const taskWrapper = document.createElement('div');
    taskWrapper.classList.add('task_wrapper');
    container.appendChild(taskWrapper);
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
  confirmDeadline() {
    const overdue = this.remaining > this.calculationTime;
    this.overdue = overdue;
    return overdue ? 1 : 0;
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
      if(this.calculationTimes) this.calculationTime = this.calculationTimes[0];
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
    if(this.aperiodicTask.remaining === 1) this.setState("free");
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

const getTaskFeature = (unitElem) => {
  const taskFeature = {
    name: "",
    feature: [],
  }
  Array.from(unitElem.children).forEach((child, i) => {
    if(i === 0) {
      taskFeature.name = child.innerHTML;
    } else if(child.className !== "config_buttonWrapper") {
      const feature = {
        time: 0,
        calcOrCapa: 0,
      };
      feature.time = parseInt(child.children[0].children[1].value);
      feature.calcOrCapa = parseInt(child.children[1].children[1].value);
      taskFeature.feature.push(feature);
    }
  });
  return taskFeature;
}

const getTasks = () => {
  const periodicUnits = document.getElementsByClassName("config_periodic");
  let periodicFeatures = [];
  periodicFeatures = Array.from(periodicUnits).map((unitElem) => (
    getTaskFeature(unitElem)
  ))
  const aperiodicUnit = document.getElementById("config_aperiodic");
  const aperiodicFeature = getTaskFeature(aperiodicUnit);
  const pollingServerUnit = document.getElementById("config_pollingServer");
  const pollingServerFeature = getTaskFeature(pollingServerUnit);
  return [periodicFeatures, aperiodicFeature, pollingServerFeature];
}

const createTasks = (periodicFeatures, aperiodicFeature, pollingServerFeature) => {
  const allTasks = [];
  const periodicTasks = [];
  periodicFeatures.forEach((feature) => {
    const newTask = new PeriodicTask(feature.name, feature.feature[0].time, feature.feature[0].calcOrCapa);
    allTasks.push(newTask);
    periodicTasks.push(newTask);
  })
  const newAperiodicFeatures = aperiodicFeature.feature.map(feature => (
    { occurTime: feature.time, calculationTime: feature.calcOrCapa }
  ))
  const aperiodicTask = new AperiodicTask(aperiodicFeature.name, newAperiodicFeatures);
  const pollingServer = new PollingServer(
    pollingServerFeature.name, 
    pollingServerFeature.feature[0].time,
    pollingServerFeature.feature[0].calcOrCapa,
    aperiodicTask);
  allTasks.push(pollingServer);
  periodicTasks.push(pollingServer);
  allTasks.push(aperiodicTask);
  return [allTasks, periodicTasks];
}

const schedule = (execTime, allTasks, periodicTasks) => {
  let overdueFlag = 0;
  for(let t=0; t<execTime; t++) {
    allTasks.forEach((task) => {
      if(task.isOccurTime(t)) {
        task.occur();
        task.drawBar(t, true);
      } else {
        task.drawBar(t, false);
      }
    })
    const priorityTask = periodicTasks.filter((task) => task.state === "wait").sort((a, b) => a.period - b.period)[0];
    if(priorityTask) priorityTask.setState("progress");
    allTasks.forEach((task) => {
      overdueFlag += task.confirmDeadline();
      const wrapper = task.drawBlockWrapper();
      if(task.state === "progress") {
        task.progress(wrapper);
      } else if(task.state === "wait") {
        task.wait(wrapper);
      }
    })
  }
  if(overdueFlag > 0) {
    const message = periodicTasks.reduce((prev, task) => {
      if(task.calculationTime) {
        return `${prev} ${task.name}, C:${task.calculationTime/task.period}`;
      } else {
        return `${prev} ${task.name}, C:${task.capacity/task.period}`;
      }
    }, "")
    console.log(`schedule failed, ${message}`);
  }
};

// 実行・戻るボタン
(() => {
  const config = document.getElementById("config");
  const scheduleElem = document.getElementById("schedule");
  const backButton = document.createElement('button');
  backButton.classList.add('schedule_button');
  backButton.innerHTML = '戻る';
  backButton.addEventListener('click', () => {
    config.classList.remove('hidden');
    scheduleElem.classList.add('hidden');
    while(scheduleElem.children.length > 0) {
      scheduleElem.removeChild(scheduleElem.children[0]);
    }
  });
  scheduleElem.appendChild(backButton);
  const execButton = document.getElementById("execute");
  execButton.addEventListener("click", () => {
    const [periodicFeatures, aperiodicFeature, pollingServerFeature] = getTasks();
    const [allTasks, periodicTasks] = createTasks(periodicFeatures, aperiodicFeature, pollingServerFeature);
    const execTime = document.getElementById("config_execTime").value;
    schedule(execTime, allTasks, periodicTasks);
    scheduleElem.appendChild(backButton);
    config.classList.add('hidden');
    scheduleElem.classList.remove('hidden');
  });
})();


// 追加・削除ボタン
(() => {
  const addPeriodicTaskButton = document.getElementById("add_periodicTask");
  const periodicTaskButtonWrapper = document.getElementById("periodicTaskButton_wrapper");
  let taskNum = 1;
  addPeriodicTaskButton.addEventListener("click", () => {
    taskNum++;
    const periodicUnit = document.createElement("div");
    periodicUnit.classList.add("config_unit");
    periodicUnit.classList.add("config_periodic");
    periodicUnit.innerHTML = `
      <p class="config_name">周期タスク${taskNum}</p>
      <div class="config_feature">
        <div>
          <p>周期</p>
          <input type="text" class="config_input">
        </div>
        <div>
          <p>計算時間</p>
          <input type="text" class="config_input">
        </div>
      </div>
    `;
    periodicTaskButtonWrapper.parentNode.insertBefore(periodicUnit, periodicTaskButtonWrapper);
  });
  const removePeriodicTaskButton = document.getElementById("remove_periodicTask");
  removePeriodicTaskButton.addEventListener("click", () => {
    periodicTaskButtonWrapper.parentNode.removeChild(periodicTaskButtonWrapper.parentNode.children[taskNum]);
    taskNum--;
  })

  const aperiodicTaskFeature = document.getElementsByClassName("aperiodicTaskFeatures")[0];
  const addAperiodicTaskFeatureButton = document.getElementById("add_aperiodicTaskFeature");
  addAperiodicTaskFeatureButton.addEventListener("click", () => {
    const newFeature = document.createElement("div");
    newFeature.classList.add("config_feature");
    newFeature.classList.add("aperiodicTaskFeature");
    newFeature.innerHTML = `
      <div>
        <p>発生時刻</p>
        <input type="text" class="config_input config_aperiodicTask_occurTime">
      </div>
      <div>
        <p>計算時間</p>
        <input type="text" class="config_input config_aperiodicTask_calculationTime">
      </div>
    `;
    aperiodicTaskFeature.parentNode.insertBefore(newFeature, addAperiodicTaskFeatureButton.parentNode);
  })
  const removeAperiodicTaskFeatureButton = document.getElementById("remove_aperiodicTaskFeature");
  removeAperiodicTaskFeatureButton.addEventListener("click", () => {
    aperiodicTaskFeature.parentNode.removeChild(aperiodicTaskFeature.parentNode.children[aperiodicTaskFeature.parentNode.children.length-2]);
  });
})();