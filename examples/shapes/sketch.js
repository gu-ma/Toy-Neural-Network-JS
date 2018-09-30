// traininf var
let train_index = 0;
let train_duration = 3 * 10000;

// testing var
let test_index = 0;
let total_tests = 0;
let total_correct = 0;

// NN
let nn;

// Current training & testing image
let train_image;
let test_image;

// Drawn image
let user_shape;
let user_has_drawing = false;

// html stuff
let user_guess_ele;
let percent_ele;
let lr_slider;

// Drawing and stuff
let fg_color;
let bg_color;


function setup() {

  // Canvas
  createCanvas(700, 280).parent('container');
  pixelDensity(1);

  // Drawing etc...
  fg_color = color(255, 255, 255);
  bg_color = color(0, 0, 0);

  // Shape
  user_shape = createGraphics(280, 280);
  user_shape.background(bg_color);

  // Training image
  train_image = createImage(28, 28);

  // NN
  nn = new NeuralNetwork(784, 64, 3);

  // html Labels
  user_guess_ele = select('#user_guess');
  percent_ele = select('#percent');

  // html slider
  lr_slider = createSlider(0.01, 0.5, 0.1, 0.01);
  lr_slider.position(20, 300);


}


// 0 = rectangle, 1 = triangle, 2 = ellipse
// return label
function drawShape(coord_x, coord_y, max_size, type) {

  // Create shape 
  // let s = floor(random(max_size));
  // let x = coord_x + floor(random(max_size - s));
  // let y = coord_y + floor(random(max_size - s));
  let s = floor(random(max_size-20, max_size-4));
  let x = coord_x + max_size/2 - s/2;
  let y = coord_y + max_size/2 - s/2;

  // Draw background
  noStroke();
  fill(bg_color);
  rect(coord_x, coord_y, max_size, max_size);
  stroke(fg_color);

  // Draw shape
  switch (type) {

    case 0:
      rect(x, y, s, s);
      return 0;

    case 1:
      triangle(x + s / 2, y, x, y + s, x + s, y + s);
      return 1;

    case 2:
      ellipseMode(CORNER);
      ellipse(x, y, s, s);
      return 2;

  }

}


function train(show) {

  let inputs = [];
  
  // Draw shape
  let label = drawShape(0, 0, 28, train_index % 3);

  // Get pixels
  train_image = get(0, 0, 28, 28);
  train_image.loadPixels();

  // Extract each pixel value
  for (let i = 0; i < 784; i++) {
    // We just get the R value
    inputs[i] = train_image.pixels[i * 4] / 255;
  }

  // Show the current training image
  if (show) {
    image(train_image, 28, 0, 112, 112);
  }

  // Do the neural network stuff;
  let targets = [0, 0, 0];
  targets[label] = 1;

  // Predict the current number
  // let prediction = nn.predict(inputs);
  // let guess = findMax(prediction);

  // Train
  nn.train(inputs, targets);
  train_index = (train_index + 1) % train_duration;

  if (train_index % 1000 == 0 ) {
    console.log(inputs);
    console.log(targets);
    console.log(train_index);
    console.log(nn.weights_ih);
  }

}


function testing(show) {

  let inputs = [];

  // Draw shape
  let label = drawShape(0, 112, 28, floor(random(3)));

  // Get pixels
  test_image = get(0, 112, 28, 28);
  test_image.loadPixels();

  // Extract each pixel value
  for (let i = 0; i < 784; i++) {
    // We just get the R value
    inputs[i] = test_image.pixels[i * 4] / 255;
  }

  // Show the current testing image
  if (show) {
    image(test_image, 28, 112, 112, 112);
  }

  // Generate prediction
  let prediction = nn.predict(inputs);
  let guess = findMax(prediction);

  // Check prediction accuracy
  total_tests++;
  if (guess == label) {
    total_correct++;
  }

  // Update accuracy score
  let percent = 100 * (total_correct / total_tests);
  percent_ele.html(nf(percent, 2, 2) + '%');

  // Increment test n#
  test_index++;


}


function guessShape() {

  // Get current pixels
  let img = user_shape.get();
  if (!user_has_drawing) {
    user_guess_ele.html('_');
    return img;
  }

  // Save pixels in an array
  let inputs = [];

  // resize to 28 / 28 pix
  img.resize(28, 28);
  img.loadPixels();

  for (let i = 0; i < 784; i++) {
    inputs[i] = img.pixels[i * 4] / 255;
  }

  // Show the current drawned image resized for reference
  image(img, 420, 0, 112, 112);

  // Run the array through the NN
  let prediction = nn.predict(inputs);
  let guess = findMax(prediction);

  // Output result
  switch (guess) {
    case 0: 
      user_guess_ele.html('square'); 
      break;
    case 1: 
      user_guess_ele.html('triangle');
      break;
    case 2: 
      user_guess_ele.html('circle');
      break;
  }

  // user_guess_ele.html(guess);
  return img;

}


function draw() {
  background(50);    

  let user = guessShape();

  // Show training image 1 time out of 10
  // Try to play with this number
  let total1 = 10;
  for (let i = 0; i < total1; i++) {
    if (i == total1 - 1) {
      train(true);
    } else {
      train(false);
    }
  }

  // Try to play with this number
  let total2 = 20;
  for (let i = 0; i < total2; i++) {
    if (i == total2 - 1) {
      testing(true);
    } else {
      testing(false);
    }
  }

  // Create image to draw the shape
  image(user_shape, 140, 0);

  if (mouseIsPressed) {
    user_has_drawing = true;
    user_shape.stroke(255);
    user_shape.strokeWeight(8);
    user_shape.line(mouseX-140, mouseY, pmouseX-140, pmouseY);
  }

  // Change the learning rate
  nn.setLearningRate(lr_slider.value());

}


function keyPressed() {
  if (key == ' ') {
    user_has_drawing = false;
    user_shape.background(bg_color);
  }
}


// Max value in an Array
function findMax(arr) {
  let record = 0;
  let index = 0;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] > record) {
      record = arr[i];
      index = i;
    }
  }
  return index;

}