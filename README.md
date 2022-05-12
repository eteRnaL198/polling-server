タスクを作成する
MAX_TIMEを伸ばせば実行範囲を延長できる
deadline以降に実行されたタスクを赤色で示す
発生時刻は予め決まっているとする

スケジュール失敗例
const periodicTask1 = new PeriodicTask("周期タスク1", 4, 1);
const periodicTask2 = new PeriodicTask("周期タスク2", 6, 2);
const periodicTask3 = new PeriodicTask("周期タスク3", 5, 2);
