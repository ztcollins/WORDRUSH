let mode; //beginning vs. game
let a; //start button
let storedKeys;
let wordArray;
let currLetter;
let currWord;
let gameOver;
let score;
let lettersCorrect;
let totalLetters;
const api_words = "https://random-word-api.herokuapp.com/word?number=100";

//progressbar borrowed from: https://editor.p5js.org/slow_izzm/sketches/ulYIeOZnA
let progressBar;

//loading spinner borrowed from: https://codepen.io/mrwolferinc/pen/wvmKgeL
let spinnerSize = 90;
let spinnerSpeed = 10;
let spinnerColor;

const getData = async _ => {
  const response = await fetch(api_words);
  const data = await response.json();
  
  console.log(data)

  wordArray = data
}

function setup() { 
  
  //fetch random words from public api
  getData().then(() => {
    
    //create start screen with start button
    a = createButton("Start");
    a.mousePressed(updatemode);
    
    //style the button
    a.size(200, 100);
    a.position(width*0.4, height*0.4);
    a.style("font-family", "Courier New");
    a.style("font-size", "48px");
    a.style('background-color', "palegreen");
    spinnerColor = color("black");
  });
  
  //setup based on progressBar
  createCanvas(windowWidth, windowHeight);
  colorMode(HSL, 360, 1, 1, 1);
  background("black");
  
  spinnerColor = color("palegreen");
  
  
  //initialize words and keys
  storedKeys="";
  
  //setup starting values
  currWord = 0;
  currLetter = 0;
  score = 0;
  mode = 0;
  lettersCorrect = 0;
  totalLetters = 0;
  gameOver = false;
  
  
  //style the texts
  
  fill('palegreen');
  textFont('Courier New', 80);
  textStyle(BOLD)
  text("WORD RUSH", width*0.3, height*0.3)
  
  textFont('Courier New', 20);
  text("RULES:", width*0.2, height*0.6)
  textStyle(NORMAL)
  text("Type the words before the bar fills to increase your score!", width*0.2, height*0.65)
  text("The higher your score gets, the faster the bar will fill.", width*0.2, height*0.7)
  text("Once the bar is full, the game is over. Good luck!", width*0.2, height*0.75)
  text("NOTE: words are random! (fetched from random word api)", width*0.2, height*0.9)
  
  //create new progress bar
  progressBar = new ProgressBar(width * 0.1, width * 0.9, height * 0.2,height * 0.2, 5000);
} 

function draw() {
  //mode != 0 means game starts.
  if(mode != 0) {
    background("black");
    textFont('Courier New', 60);
    //text(storedKeys, 200, 250)

    //diplay current word to type
    text(">",width*0.1, height*0.5)
    text(wordArray[currWord].substring(currLetter, wordArray[currWord].length),width*0.15, height*0.5)
    
    //display letter line
    stroke("green")
    strokeWeight(5)
    line(width*0.15+5, height*0.505, width*0.15+30, height*0.505)
    strokeWeight(0)
    
    //display current score
    text("Score: "+score,width*0.1, height*0.6)
    if(totalLetters == 0) {
      text("Accuracy: 0%", width*0.1, height*0.7)
    }
    else {
      text("Accuracy: " + ((lettersCorrect/totalLetters) * 100).toFixed(1)+"%", width*0.1, height*0.7)
    }

    //end game
    if(progressBar.isFinished()) {
      background("black");
      textSize(80)
      text("GAME OVER", width*0.3, height*0.4);
      textSize(40)
      text("SCORE: " + score, width*0.15, height*0.6)
      if(totalLetters == 0) {
        text("ACCURACY: 0%", width*0.15, height*0.65)
      }
      else {
        text("ACCURACY: " + ((lettersCorrect/totalLetters) * 100).toFixed(1)+"%", width*0.15, height*0.65)
      }
      text("WORDS TYPED:", width*0.15, height*0.7)
      textSize(20)
      textWrap(WORD)
      text(storedKeys, width*0.15, height*0.75, width*0.85, height*0.9)
      gameOver = true;
    }

    progressBar.render();
  }
  else {
    //render the loading circle
    let step = frameCount % (spinnerSpeed * 7.25);
    let angle = map(step, 0, spinnerSpeed * 7.25, 0, TWO_PI);

    push();
    translate(width*0.49, height*0.445);
    rotate(angle);
    noFill();
    stroke(spinnerColor);
    strokeWeight(spinnerSize / 10);
    strokeCap(SQUARE);
    arc(0, 0, spinnerSize - (spinnerSize / 20), spinnerSize - (spinnerSize / 20), 0, PI + HALF_PI, OPEN);
    pop();
  }
}
  
function keyPressed() {
  if(gameOver) {
    return;
  }

  
  //display key history & add if it is the current
  let isCorrect = false;
  if(key == wordArray[currWord][currLetter]) {
    storedKeys += key;
    isCorrect = true;
    lettersCorrect++;
  }
  totalLetters++;
  
  //increment
  if(isCorrect) {
    currLetter++;
    //finish word
    if(wordArray[currWord][currLetter] == wordArray[currWord][-1]) {
      
      //finished array
      if(wordArray[currWord] == wordArray[wordArray.length-1]) {
          currLetter = 0;
          currWord = 0;
          storedKeys = "";
      }
      else {
          currWord++;
          currLetter = 0;
          storedKeys += ", ";
      }
      
      score++;
      progressBar.increaseSpeed();
      progressBar.reset();
    }
  }
} 

function updatemode() {
  mode = mode + 1;
  a.remove();
  progressBar.reset();
}

class ProgressBar {
  constructor(_x1, _x2, _y1, _y2, _spd) {
    this.pBar = {
      curr: millis(),
      newCurr: 0,
      x1: _x1,
      x2: _x2,
      y1: _y1,
      y2: _y2,
      spd: _spd,
      col: 100
    }
  }

  update() {
    this.pBar.curr >= this.pBar.x2 ?
      this.pBar.curr = this.pBar.x2 :
      this.pBar.curr = map(millis(), this.pBar.newCurr, this.pBar.newCurr + this.pBar.spd, this.pBar.x1, this.pBar.x2);

    return this;
  }

  fillBar() {
    stroke(this.pBar.col, 1, 0.8, 1);
    strokeWeight(50);
    line(this.pBar.x1, this.pBar.y1, this.pBar.curr, this.pBar.y2);
    //DONT STROKE ME!
    stroke(0, 0, 0, 0);
    strokeWeight(0);

    return this;
  }

  display() {
    stroke(this.pBar.col, 1, 0.75, 0.3);
    strokeWeight(50);
    line(this.pBar.x1, this.pBar.y1, this.pBar.x2, this.pBar.y2);
    //DONT STROKE ME!
    stroke(0, 0, 0, 0);
    strokeWeight(0);

    return this;
  }

  render() {
    return this.update().display().fillBar();
  }
  
  //these 3 functions are added (not from the source)
  
  isFinished() {
    if(this.pBar.curr >= this.pBar.x2) {
      return true;
    }
    else {
      return false;
    }
  }
  
  reset() {
    this.pBar.newCurr = millis()
  }
  
  increaseSpeed() {
    this.pBar.spd -= 100;
  }
  
}