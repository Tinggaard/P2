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

  expect(iterator.next().value).toStrictEqual([1, 2, 3]);
  expect(iterator.next().value).toStrictEqual([2, 1, 3]);
});
