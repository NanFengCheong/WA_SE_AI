'use strict';

const tf = require('tensorflow2');
const graph = tf.graph();
const session = tf.session();

graph.load('./model.pb');

// load the op by name
const op = graph.operations.get('my_variable/Assign');

// the following outputs the 1000
const res = session.run(op);