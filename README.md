- タスクを作成する
- 発生時刻は予め決まっているとする
- polling Serverは1つとする
- (MAX_TIMEを伸ばせば実行範囲を延長できる)
- deadline以降に実行されたタスクを赤色で示す

- スケジュール成功例
  - 周期タスク1
    - 周期 4, 計算時間 1
  - 周期タスク2
    - 周期 6, 計算時間 2
  - 非周期タスク
    - 発生時刻 2, 計算時間 2
    - 発生時刻 8, 計算時間 1
    - 発生時刻 12, 計算時間 2
    - 発生時刻 19, 計算時間 1
  - Polling Server
    - 周期 5, 容量 2

スケジュール失敗例
const periodicTask1 = new PeriodicTask("周期タスク1", 4, 1);
const periodicTask2 = new PeriodicTask("周期タスク2", 6, 2);
const periodicTask3 = new PeriodicTask("周期タスク3", 5, 2);
