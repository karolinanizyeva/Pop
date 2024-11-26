let font;
let sentence = "this is just a very long sentence and it does not serve any purpose and it does not make any sense, this is literally just a long pointless sentence moving in a circle.";
let textPoints = [];
let textSwirling = true; // Track if text is swirling or has been clicked
let swirlCenter; // Center of swirl
let swirlRadius = 300; // Distance from center to start swirling
let ellipseSize = 0; // Ellipse size for animation
let ellipseAnimating = false; // Track if ellipse is animating
let ellipseScalingUp = true; // Track scaling direction
let animationSpeed = 5; // Speed of ellipse animation

let soundEffect;

function preload() {
  font = loadFont("Trends.ttf");
  soundEffect = loadSound("pop!.mp3");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont(font);
  swirlCenter = createVector(width / 2, height / 2);

  // Create positions for each character in the sentence
  let xOffset = -swirlRadius; // Starting x position
  let yOffset = height / 2; // Starting y position
  for (let i = 0; i < sentence.length; i++) {
    let char = sentence[i];
    let angle = map(i, 0, sentence.length, 0, TWO_PI * 4); // Map to a swirl effect
    let distance = map(i, 0, sentence.length, swirlRadius, 0); // Spiral inward

    let targetX = swirlCenter.x + cos(angle) * distance;
    let targetY = swirlCenter.y + sin(angle) * distance;

    textPoints.push(new Interact(char, xOffset + i * 14, yOffset, targetX, targetY));
  }
}

function draw() {
  background(173, 216, 230); // Baby blue background (RGB for LightBlue)

  // Animate and draw the ellipse
  if (ellipseAnimating) {
    if (ellipseScalingUp) {
      ellipseSize = lerp(ellipseSize, swirlRadius * 2.5, 0.1); // Smooth scaling up
      if (ellipseSize > swirlRadius * 2.45) {
        ellipseSize = swirlRadius * 2.5; // Snap to final size
        ellipseScalingUp = false;
      }
    }

    if (ellipseSize > 0) {
      noStroke();
      fill(0, 0, 128, 200); // Navy blue (RGB for Navy) with some transparency
      ellipse(swirlCenter.x, swirlCenter.y, ellipseSize, ellipseSize);
    }
  }

  // Update and display text
  let allReachedTarget = true; // Check if all characters have reached their targets
  for (let i = 0; i < textPoints.length; i++) {
    let pt = textPoints[i];
    pt.update();
    pt.show();

    if (!pt.hasReachedTarget()) {
      allReachedTarget = false;
    }
  }

  // Start ellipse animation once all text points reach their targets
  if (allReachedTarget && textSwirling) {
    ellipseAnimating = true;
  }

  // Shrink ellipse if clicked
  if (!ellipseScalingUp && textSwirling === false) {
    ellipseSize = lerp(ellipseSize, 0, 0.1); // Smooth scaling down
    if (ellipseSize < 1) {
      ellipseAnimating = false; // Stop drawing when scaled down fully
    }
  }
}

// Handle mouse click
function mousePressed() {
  if (ellipseAnimating && ellipseSize > swirlRadius * 2.4) {
    let distanceFromCenter = dist(mouseX, mouseY, swirlCenter.x, swirlCenter.y);
    if (distanceFromCenter < ellipseSize / 2) {
      soundEffect.play();
      textSwirling = false; // Stop swirling and shrink the ellipse
      for (let pt of textPoints) {
        pt.explode(); // Trigger particle effect
      }
    }
  }
}

// Interact class handles each text point behavior
class Interact {
  constructor(char, startX, startY, targetX, targetY) {
    this.char = char; // Character to display
    this.start = createVector(startX, startY); // Starting position
    this.pos = createVector(startX, startY); // Current position
    this.target = createVector(targetX, targetY); // Target swirl position
    this.vel = createVector();
    this.acc = createVector();
    this.maxSpeed = 6;
    this.maxForce = 0.2;
    this.exploding = false; // Track if it's exploding
    this.explodeSpeed = p5.Vector.random2D().mult(random(5, 15)); // Random explosion
    this.reachedTarget = false;
  }

  // Swirl toward center or explode on click
  update() {
    if (textSwirling) {
      // Move towards the target swirl position
      let desired = p5.Vector.sub(this.target, this.pos);
      let d = desired.mag();
      if (d < 1) {
        this.reachedTarget = true; // Mark as reached
        return;
      }
      let speed = this.maxSpeed;
      if (d < 50) speed = map(d, 0, 50, 0, this.maxSpeed); // Slow down near center
      desired.setMag(speed);
      let steer = p5.Vector.sub(desired, this.vel);
      steer.limit(this.maxForce);
      this.applyForce(steer);
    } else if (this.exploding) {
      // Particle explosion
      this.pos.add(this.explodeSpeed);
    }

    this.pos.add(this.vel);
    this.vel.add(this.acc);
    this.acc.mult(0);
  }

  // Check if text point has reached target
  hasReachedTarget() {
    return this.reachedTarget;
  }

  // Apply force to the point
  applyForce(force) {
    this.acc.add(force);
  }

  // Trigger the explosion effect
  explode() {
    this.exploding = true;
    this.explodeSpeed = p5.Vector.random2D().mult(random(5, 15)); // Randomize explosion further
  }

  // Display the character
  show() {
    noStroke();
    fill(255); // White text
    textSize(24); // Increase font size for better visibility
    push();
    translate(this.pos.x, this.pos.y);
    text(this.char, 0, 0); // Draw character at position
    pop();
  }
}

// Handle resizing the canvas dynamically
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  swirlCenter = createVector(width / 2, height / 2); // Recalculate swirl center
}
