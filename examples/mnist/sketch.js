let mnist;

// traininf var
let train_index = 0;

// testing var
let test_index = 0;
let total_tests = 0;
let total_correct = 0;

// NN
let nn;

// Current training image
let train_image;

// Drawn image
let user_digit;
let user_has_drawing = false;

// html elements
let user_guess_ele;
let percent_ele;


function setup() {

  // Canvas NN and other graphics
  createCanvas(400, 200).parent('container');
  nn = new NeuralNetwork(784, 64, 10);
  user_digit = createGraphics(200, 200);
  user_digit.pixelDensity(1);

  // Training image
  train_image = createImage(28, 28);

  // html Labels
  user_guess_ele = select('#user_guess');
  percent_ele = select('#percent');

  // Load Dataset
  loadMNIST(function(data) {
    mnist = data;
    console.log(mnist);
  });

}


function train(show) {

  let inputs = [];

  // Show the current training image
  if (show) {
    train_image.loadPixels();
  }

  // Extract each pixel value
  for (let i = 0; i < 784; i++) {
    let bright = mnist.train_images[train_index][i];
    inputs[i] = bright / 255;
    if (show) {
      let index = i * 4;
      train_image.pixels[index + 0] = bright;
      train_image.pixels[index + 1] = bright;
      train_image.pixels[index + 2] = bright;
      train_image.pixels[index + 3] = 255;
    }
  }

  // Update pixels
  if (show) {
    train_image.updatePixels();
    image(train_image, 200, 0, 200, 200);
  }

  // Do the neural network stuff;
  let label = mnist.train_labels[train_index];
  let targets = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  targets[label] = 1;

  // console.log(inputs);
  // console.log(targets);

  //console.log(train_index);

  // Predict the current number
  let prediction = nn.predict(inputs);
  let guess = findMax(prediction);

  // Train
  nn.train(inputs, targets);
  train_index = (train_index + 1) % mnist.train_labels.length;
}


function testing() {

  let inputs = [];

  // Extract each pixel value  
  for (let i = 0; i < 784; i++) {
    let bright = mnist.test_images[test_index][i];
    inputs[i] = bright / 255;
  }

  // Corresponding label
  let label = mnist.test_labels[test_index];

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

  // If finish notify and restart
  if (test_index == mnist.test_labels.length) {
    test_index = 0;
    console.log('finished test set');
    console.log(percent);
    total_tests = 0;
    total_correct = 0;
  }

}


function guessUserDigit() {

  // Get current pixels
  let img = user_digit.get();
  if(!user_has_drawing) {
    user_guess_ele.html('_');
    return img;
  }

  // Save pixels in an array
  let inputs = [];

  // resize to 28 / 28 pix
  img.resize(28, 28);
  img.loadPixels();
  
  // 
  for (let i = 0; i < 784; i++) {
    inputs[i] = img.pixels[i * 4] / 255;
  }

  // Run the array through the NN
  let prediction = nn.predict(inputs);
  let guess = findMax(prediction);

  // Output result
  user_guess_ele.html(guess);
  return img;
  
}


function draw() {
  background(0);

  let user = guessUserDigit();
  //image(user, 0, 0);


  if (mnist) {

    // Show training image 1 time out of 5
    let total1 = 5;
    for (let i = 0; i < total1; i++) {
      if (i == total1 - 1) {
        train(true);
      } else {
        train(false);
      }
    }

    // Test 1 time out of 25
    let total2 = 25;
    for (let i = 0; i < total2; i++) {
      testing();
    }

  }

  image(user_digit, 0, 0);

  if (mouseIsPressed) {
    user_has_drawing = true;
    user_digit.stroke(255);
    user_digit.strokeWeight(16);
    user_digit.line(mouseX, mouseY, pmouseX, pmouseY);
  }
}

function keyPressed() {
  if (key == ' ') {
    user_has_drawing = false;
    user_digit.background(0);
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
