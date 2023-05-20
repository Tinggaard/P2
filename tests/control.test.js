/* eslint no-undef: 0 */
import { Task } from '../src/control.js';

test('Create Task object', () => {
  const weights = [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
  ];
  const task = new Task(5, weights);
  const iterator = task.getNextCombination();
  console.log(iterator);

  expect(iterator.next().value).toStrictEqual([1, 2]);
  expect(iterator.next().value).toStrictEqual([2, 1]);
});

test('Test total subtask count', () => {
  const weights = [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
  ];
  const task = new Task(5, weights);
  const iterator = task.getNextCombination();
  let i = 0;

  // count up all the subtasks
  while (!iterator.next().done) {
    i++;
  }

  expect(i).toBe(task.subtaskAmount);
});
