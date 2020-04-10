class Queue {
  constructor() {
    this.queue = []
  }

  enqueue(item) {
    this.queue.push(item);
  }

  dequeue() {
    var item = this.queue[0];
    this.queue = this.queue.slice(1);
    return item;
  }

  peek() {
    return this.queue[0];
  }

  get length() {
    return this.queue.length;
  }

  empty() {
    this.queue = [];
    return true;
  }
}
