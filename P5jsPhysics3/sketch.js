// global variables
let drawVertecies = false;
let drawConnections = true;
let drawBoundingBoxes = false;
let gravity;
let drawDebugValues = true;
// variable to define whether or not physics is run step by step instead of at the frame rate
let stepByStep = false;
let vertexID = 0;
let connectorID = 0;

// array to hold all of the world objects
let worldObjects = [];
let vertecies = [];
let connections = [];
let rigidity = 50;
let forceDampening1 = 0.98;
let forceDampening2 = 0.94;
let elasticityMultiplier = 0.5;

let mouseControlsOn = true;
let nonStaticFollowMouse = false;
let a1;
let a2

// current issues

function setup() {
  createCanvas(windowWidth, windowHeight);
  a1 = createSquareObject(700, 100, 200, 200, 0.5);
  a2 = createSquareObject(300, 700, 300, 200, 0.5);
  //worldObjects[0].vertecies[0].isStatic = true;
  a2.vertecies[0].isStatic = true;
  a2.vertecies[1].isStatic = true;
  a2.vertecies[2].isStatic = true;
  a2.vertecies[3].isStatic = true;

  // define gravity as a force class
  gravity = new force(0, 1, 5, 0, "Global", false);
  // apply gravity
  for(let i = 0; i < vertecies.length; i++){
    vertecies[i].addForce(gravity);
  }
}

function draw() {
  background(150);
  drawConditionals();
  if(stepByStep == false){
    for(let i = 0; i < worldObjects.length; i++){
      worldObjects[i].doPhysics();
    }
  }
  if(drawDebugValues == true){
    drawDebug();
  }
}

// function to draw all of the vertecies, connections, objects, etc. if the condionals are true
function drawConditionals(){
  for(let i = 0; i < worldObjects.length; i++){
    if(drawVertecies == true) worldObjects[i].drawVerteciesF();
    if(drawConnections == true) worldObjects[i].drawConnectionsF();
    if(drawBoundingBoxes == true) worldObjects[i].drawBoundingBox();
  }
}

function newVertex(x, y, s){
  if(s == undefined) s = false;
  let v =  new objectVertex(x, y, s, vertexID);
  vertecies.push(v);
  vertexID ++;
  return v;
}

function newConnection(v1, v2, e, d){
  if(d == undefined) d = true;
  let c = new vertexConnection(v1, v2, e, d);
  connections.push(c);
  return c;
}

function keyPressed(){
  for(let i = 0; i < vertecies.length; i++){
    let d = dist(mouseX, mouseY, vertecies[i].x, vertecies[i].y);
    if(d < 20 + abs(vertecies[i].moveVec.x) + abs(vertecies[i].moveVec.y)){
      if(keyCode === 70) vertecies[i].isStatic = !vertecies[i].isStatic;
      if(keyCode === 67) vertecies[i].isStatic = false;
    }
  }
  if(keyCode === 83){
    stepByStep = !stepByStep;
  }
}

function mousePressed(){
  if(stepByStep == true){
    worldObjects[0].doPhysics();
  }
}

function drawDebug(){
  let startx = 20;
  let starty = 50;
  let spacing = 20;
  text("FPS: " + round(frameRate()), startx, starty);
  text("Vertecies: " + vertecies.length, startx, starty + spacing);
  text("Connections: " + connections.length, startx, starty + spacing * 2);
  text("Objects: " + worldObjects.length, startx, starty + spacing * 3);

}

function createStringObject(startx, starty, rowSize, columnSize, spacing, rowConnectors, columnConnectors, elacticity){
  // arrays to hold the vertecies and connectors
  let vertecies = [];
  let connectors = [];
  for(let i = 0; i < rowSize; i++){
    vertecies.push([])
    for(let i2 = 0; i2 < columnSize; i2++){
      vertecies[i].push(newVertex(startx + (i* spacing), starty + (i2 * spacing), false));
    }
  } 
  for(let i = 0; i < rowSize; i++){
    for(let i2 = 0; i2 < columnSize; i2++){
      if(rowConnectors == true && i < rowSize - 1){
        connectors.push(newConnection(vertecies[i][i2], vertecies[i + 1][i2], elacticity));
      }
      if(columnConnectors == true && i2 < columnSize - 1){
        connectors.push(newConnection(vertecies[i][i2 + 1], vertecies[i][i2], elacticity));
      }
    }
  }
  let obj = new objectc(connectors);
  worldObjects.push(obj);
  return obj;
}

function createSquareObject(startx, starty, w, h, elacticity){
  let v1 = newVertex(startx, starty, false);
  let v2 = newVertex(startx + w, starty, false);
  let v3 = newVertex(startx + w, starty + h, false);
  let v4 = newVertex(startx, starty + h, false);
  //let v5 = newVertex(startx + w/2, starty + h/2, false);
  let e = elacticity
  let c1 = newConnection(v1, v2, e);
  let c2 = newConnection(v2, v3, e);
  let c3 = newConnection(v3, v4, e);
  let c4 = newConnection(v4, v1, e);
  let c5 = newConnection(v1, v3, e);
  let c6 = newConnection(v2, v4, e);
  //let c7 = newConnection(v1, v5, e / 2);
  //let c8 = newConnection(v2, v5, e / 2);
  //let c9 = newConnection(v3, v5, e / 2);
  //let c10 = newConnection(v4, v5, e / 2);
  //let o1 = new objectc([c1, c2, c3, c4, c7, c8, c9, c10]);
  let o1 = new objectc([c1, c2, c3, c4, c5, c6]);
  worldObjects.push(o1);
  return o1;
}

function collc(x, y, w, h, x2, y2, w2, h2, xb, yb){
  if(xb == undefined) xb = 0;
  if(yb == undefined) yb = 0;
  x -= xb/2
  w += xb;
  y -= yb/2;
  h += yb;
  x2 -= xb/2;
  w2 += xb;
  y2 -= yb/2;
  h2 += yb;

  if(keyIsDown(72)){
    fill(200, 0, 0, 100);
    stroke(0);
    rect(x, y, w, h);
    rect(x2, y2, w2, h2);
  }

  if(x + w > x2 && x < x2 + w2 && y + h > y2 && y < y2 + h) return true;
  return false;
}

function lineline(x1, y1, x2, y2, x3, y3, x4, y4){
  // get the distance from x1, y1 to x2, y2
  let d1 = dist(x1, y1, x2, y2);

  // v1 is a new vector with a directly down magnitude
  let v1 = createVector(0, 1);

  // get the angle from x1, y1 to x2, y2
  let a1 = atan2(y1 - y2, x1 - x2);

  // rotate the vector
  v2.rotate(a1);

  let x = x1;
  let y = y1;

  // for the distance of the line, check each point on the line agains the other given line;
  for(let i = 0; i < d1; i++){
    if(pointLine(x3, y3, x4, y4, x, y) == true){
      // return the point of contact
      return [x, y];
    }
    x += v1.x;
    y += v1.y
  }

}

function pointLine(x1, y1, x2, y2, x3, y3, b, t){
  let d1 = dist(x1, y1, x2, y2);
  let d2 = dist(x3, y3, x1, y1);
  let d3 = dist(x3, y3, x2, y2);
  if(b == undefined){
    b = 1;
  }
  if(keyIsDown(72)){
    strokeWeight(3);
    stroke(200, 100, 100, 100);
    line(x1, y1, x2, y2);
    ellipse(x3, y3, 1);
  }
  if(dist(d2 + d3, 0, d1, 0) < b){
    if(t == undefined || t == "Bool") return true;
  }
  return false;
}

class objectVertex {
  constructor(x, y, s, id){
    // position variables
    this.x = x;
    this.y = y;

    // movement vector
    this.moveVec = createVector(0, 0);

    // boolean to describe whether the vertex can be moved with a force
    // isStatic == true not means it can not have the "setPosition" function applied to it
    this.isStatic = s;

    // variables to describe the higher level structures it is a part of including the connections and object
    this.connections = [];
    this.parentObject = undefined;

    // array of forces to be appllied to the x/y
    this.forces = [];

    // ID used commonly to ensure it is not added to an array twice
    this.id = id;
  }
  setPosition(x, y){
    // if the object is not static, update the x and y
    if(this.isStatic == false){
      this.x = x;
      this.y = y;
    }
  }
  updateMovement(){
    // if it is not static
    if(this.isStatic == false){
      // apply all of the forces in the vertex's forces array
      let divisor = (this.forces.length);
      for(let i = 0; i < this.forces.length; i++){
        let xforce = (this.forces[i].forceVector.x / divisor) * forceDampening1;
        let yforce = (this.forces[i].forceVector.y / divisor) * forceDampening1;

        if(this.forces[i].type == "Elastic"){
          xforce *= elasticityMultiplier;
          yforce *= elasticityMultiplier;
        }

        this.moveVec.x += xforce;
        this.moveVec.y += yforce;
        this.forces[i].update();
        // apply forces to other connected vertecies
        for(let i2 = 0; i2 < this.connections.length; i2++){
          // check if it is vertex one or two
          if(this.forces[i].randID = gravity.randID){
            if(this.connections[i2].vertex1.id == this.id) this.connections[i2].vertex2.addForce(this.forces[i]);
          }
        }
      }
      // updating movement also includes updating the position which is also done
      this.doVertexColiions();
      this.moveVec.x *= forceDampening2;
      this.moveVec.y *= forceDampening2;
      this.x += this.moveVec.x;
      this.y += this.moveVec.y;
    }
    // culling forces that have minimal impact and will generally only cause lag
    this.cullForces();
    let mouseTravled = dist(mouseX, mouseY, pwinMouseX, pwinMouseY);
    if(nonStaticFollowMouse == true || this.isStatic == true){
      if(mouseIsPressed && dist(this.x, this.y, mouseX, mouseY) < 50 + mouseTravled + abs(this.moveVec.x) + abs(this.moveVec.y)){
        this.x = mouseX;
        this.y = mouseY;
      }
    }
    this.x = constrain(this.x, 0, width);
    this.y = constrain(this.y, 0, height);
  }
  addForce(force1){
    // force1 because just force is used as the class name for forces
    let a = 0;
    for(let i = 0; i < this.forces.length; i++){
      if(force1.randID == this.forces[i].randID) a++;
    }
    if(a == 0){
      this.forces.push(force1);
    }
  }
  cullForces(){
    // access all of the forces
    for(let i = 0; i < this.forces.length; i++){
      // variable to eliminate permanent or necesary forces
      if(this.forces[i].temporary == true){
        // simpler refference to the force vector
        let v = this.forces[i].forceVector;
        // if the absolute value of the x momentum + the absolute value of the y momentum is less than 1
        if(abs((v.x)) + abs((v.y)) < 0.1){
          // creates an empty array
          let a = [];

          // for all of the forces again
          for(let i2 = 0; i2 < this.forces.length; i2++){
            // Push the second layer forces[i2] into the empty array unless i2 is equal to i
            // if i2 == i, the force is the one being culled currently and as such is not pushed to the new array
            if(i2 != i) a.push(this.forces[i2]);
          }
          // update the array
          this.forces = a;
        }
      }
    }
  }
  getPosition(type){
    // type is either "Vector", "Array", "x", or "y"

    // "Vector" returns the x/y position as a vector
    if(type == "Vector") return createVector(this.x, this.y);

    // "Array" returns the x/y position in an array [x, y]
    if(type == "Array") return [this.x, this.y];

    // "x" returns only the x position
    if(type == "x") return this.x;

    // "y" returns only the y position
    if(type == "y") return this.y;
  }
  drawSelf(){
    // formating
    fill(255);
    stroke(0);
    // draw a circle at the vertex x and y
    circle(this.x, this.y, 10);

    // debug mode
    if(drawDebugValues == true){
      textAlign(CENTER);
      textSize(10);
      let debugYStart = 50;
      text("x: " + this.x, this.x, this.y - debugYStart);
      text("y: " + this.y, this.x, this.y - (debugYStart-10));
      text("Static: " + this.isStatic, this.x, this.y - (debugYStart-20));
      text("ID: " + this.id, this.x, this.y - (debugYStart-30));
    }
  }
  doVertexColiions(){
    for(let i = 0; i < vertecies.length; i++){
      let b = 0;
      for(let i2 = 0; i2 < this.parentObject.vertecies.length; i2++){
        let a = this.parentObject.vertecies[i2];
        if(vertecies[i].id == a.id) b ++;
      }
      if(b == 0 && vertecies[i].id != this.id){
        let obj = vertecies[i];
        if(collc(this.x, this.y, 0, 0, obj.x, obj.y, 0, 0, 1, 1)){
          let a = atan2(this.y - obj.y, this.x - obj.x) - PI/2;
          let v1 = createVector(0, 5);
          v1.rotate(a);
          let b = 1/pow(dist(this.x, this.y, obj.x, obj.y), 2);
          if(v1.x < 0 && this.moveVec.x > 0) this.moveVec.x = -b;
          else
          if(v1.x > 0 && this.moveVec.x < 0) this.moveVec.x = b;
          if(v1.y < 0 && this.moveVec.y > 0) this.moveVec.y = -b;
          else
          if(v1.y > 0 && this.moveVec.y < 0) this.moveVec.y = b;
        }
      }
    }
    for(let i = 0; i < connections.length; i++){
        let b = 0;
        for(let i2 = 0; i2 < this.connections.length; i2++){
          let a = this.connections[i2];
          if(connections[i].id == a.id) b ++;
        }
        if(b == 0){
          let con = connections[i];
          if(pointLine(con.vertex1.x, con.vertex1.y, con.vertex2.x, con.vertex2.y, this.x, this.y) == true){
            // get the average middle point of the line by adding half of the width and height to vertex 1;
            let centerPoint = createVector(con.vertex1.x + dist(con.vertex1.x, 0, con.vertex2.x, 0), con.vertex1.y + dist(con.vertex1.y, 0, con.vertex2.y, 0));
            let a = atan2(this.y - centerPoint.y, this.x - centerPoint.x) - PI/2;
            let v1 = createVector(0, 5);
            v1.rotate(a);
            let b = 1/pow(dist(this.x, this.y, centerPoint.x, centerPoint.y) * 100, 2);
            if(v1.x < 0 && this.moveVec.x > 0) this.moveVec.x = -b;
            else
            if(v1.x > 0 && this.moveVec.x < 0) this.moveVec.x = b;
            if(v1.y < 0 && this.moveVec.y > 0) this.moveVec.y = -b;
            else
            if(v1.y > 0 && this.moveVec.y < 0) this.moveVec.y = b;
        }
      }
    }
  }
}

class force {
  constructor(x, y, s, a, t, t1, cd, rand){
    // position variables
    this.x = x;
    this.y = y;

    // ammount the force in the vector is multiplied by
    this.strengthMultiplier = s;

    // angle at which the vector is rotated
    this.angle = a;

    // creates the force vector
    this.forceVector = createVector(this.x * this.strengthMultiplier, this.y * this.strengthMultiplier);

    // rotate the vector
    this.forceVector.rotate(this.angle);

    // define the type of force for special interactions
    this.type = t;
    if(t == undefined) this.t == "Normal";
    // Structural, Global, Impact, Elastic, Drag, Normal

    // variable to determine if the force can be culled from a vertex's forces array
    this.temporary = t1;
    if(this.temporary == true){
      this.cooldown = cd;
    }
    this.timer = 0;

    this.randforce = rand;
    if(rand == undefined){
      this.randforce = 0;
    }

    // random ID to check against other forces
    this.randID = random(0, 100);
  }
  setDirection(a){
    // update the angle 
    this.angle = a;
    // recreates the force vector in order to reset the angle
    this.forceVector = createVector(this.x * this.strengthMultiplier, this.y * this.strengthMultiplier);
    // rotates the new vector
    this.forceVector.rotate(this.angle);
  }
  setStrength(s){
    // sets the strength multiplier
    this.strengthMultiplier = s;
    // recreates the force vector to update the strength value
    this.forceVector.x = this.x * s;
    this.forceVector.y = this.y * s;
    //rotates the vector accordingly
    this.forceVector.rotate(this.angle);
  }
  getForceVector(){
    return this.forceVector();
  }
  update(){
    this.forceVector.x = (this.x + random(-this.randforce, this.randforce)) * this.strengthMultiplier;
    this.forceVector.y = (this.y + random(-this.randforce, this.randforce)) * this.strengthMultiplier;
    this.timer ++;
    if(this.timer >= this.cooldown){
      this.forceVector = createVector(0, 0);
    }
  }
}

class vertexConnection {
  constructor(v1, v2, e, d){
    // describe the vertecies as their own sepperate variables
    this.vertex1 = v1;    
    this.vertex2 = v2;    

    // update the vertex connections array
    this.vertex1.connections.push(this);
    this.vertex2.connections.push(this);

    // describes how much or how little the connection will pull on the vertecies
    // high elacticity = low force OR force is divided by elacticity
    this.elasticity = e;

    // describes the initial length between the vertecies and the initial target distance
    this.baseLength = dist(v1.x, v1.y, v2.x, v2.y);

    this.id = connectorID;
    connectorID ++;
    this.doCols = d;
  }
  getCurrentDistance(){
    // returns the distance from vertex one to vertex 2
    return dist(this.vertex1.x, this.vertex1.y, this.vertex2.x, this.vertex2.y);
  }
  getForceAxis1(){
    // returns the arctangent angle between the vertecies in radians
    return atan2(this.vertex1.y - this.vertex2.y, this.vertex1.x -this.vertex2.x) + PI/2;
  }
  getForceAxis2(){
    // returns the arctangent angle between the vertecies in radians
    return atan2(this.vertex2.y - this.vertex1.y, this.vertex2.x -this.vertex1.x) + PI/2;
  }
  drawSelf(){    
    let d1 = this.getCurrentDistance();
    let distDistance = d1 - this.baseLength
    let forceMult;
    forceMult = distDistance / this.elasticity;
    strokeWeight(3);
    stroke(map(forceMult, 0, 100, 0, 255), 100, 100);
    line(this.vertex1.x, this.vertex1.y, this.vertex2.x, this.vertex2.y);
    stroke(0);
    strokeWeight(1);
  }
  checkForces(){
    // get tjhe distance between points
    let d1 = this.getCurrentDistance();

    // if it is grater than the base length of the connection
    if(d1 > this.baseLength){
      // call the apply forces function.
      this.applyForces(d1, 1);
    }
    if(d1 < this.baseLength){
      // call the apply forces function.
      this.applyForces(d1, 2);
    }
  }
  applyForces(d, type){
    // carried over current distance so as to no run the same function an exsessive ammount
    let d1 = d;
    // get the current angle at which the two are
    let a1 = this.getForceAxis1();
    let a2 = this.getForceAxis2();

    // ammount of time the force remains active
    let lifespan = 0;

    // variable to store the strength of the force
    // current distance - the base distance in order to get the current distance to the target distance
    // divide this by the elacticity to give more control
    let distDistance = d1 - this.baseLength
    let forceMult;
    forceMult = distDistance / this.elasticity;
    let positiveForce;
    let negativeForce;

    if(type == 1){
      positiveForce = new force(0, 1, forceMult, a1, "Elastic", true, lifespan);
      negativeForce = new force(0, 1, forceMult, a2, "Elastic", true, lifespan);
    } else 
    if(type == 2){
      positiveForce = new force(0, 1, forceMult, a1, "Elastic", true, lifespan);
      negativeForce = new force(0, 1, forceMult, a2, "Elastic", true, lifespan);
    }

    this.vertex1.addForce(positiveForce);
    this.vertex2.addForce(negativeForce);
    if(this.doCols == true) this.doCollisions();
  }
  doCollisions(){
    for(let i = 0; i < vertecies.length; i++){
      // if the coliding vertecies are not the ones it is connected to
      if(vertecies[i].id != this.vertex1.id && vertecies[i].id != this.vertex2.id){
        // if the vertecies are actually coliding with the line
        if(pointLine(this.vertex1.x, this.vertex1.y, this.vertex2.x, this.vertex2.y, vertecies[i].x, vertecies[i].y, 50) == true){
          // get the average center
          let d1 = dist(this.vertex1.x, 0, this.vertex2.x, 0) / 2;
          if(this.vertex1.x > this.vertex2.x) d1 = -d1;

          let d2 = dist(this.vertex1.y, 0, this.vertex2.y, 0) /2;
          if(this.vertex1.y > this.vertex2.y) d2 = -d2;

          let centerPoint = createVector(this.vertex1.x + d1, this.vertex1.y + d2);

          let a = atan2(vertecies[i].y - centerPoint.y, vertecies[i].x - centerPoint.x) - PI/2;
          let v1 = createVector(0, 1);
          v1.rotate(a);

          let b = 1/pow(dist(vertecies[i].x, vertecies[i].y, centerPoint.x, centerPoint.y) / 100, 2);

          if(v1.x > 0){
            if(this.vertex1.moveVec.x <= 0) this.vertex1.moveVec.x = -b;
            if(this.vertex2.moveVec.x <= 0) this.vertex2.moveVec.x = -b;
          }
          if(v1.x < 0){
            if(this.vertex1.moveVec.x >= 0) this.vertex1.moveVec.x = b;
            if(this.vertex2.moveVec.x >= 0) this.vertex2.moveVec.x = b;
          }
          if(v1.y > 0){
            if(this.vertex1.moveVec.y <= 0) this.vertex1.moveVec.y = -b;
            if(this.vertex2.moveVec.y <= 0) this.vertex2.moveVec.y = -b;
          }
          if(v1.y < 0){
            if(this.vertex1.moveVec.y >= 0) this.vertex1.moveVec.y = b;
            if(this.vertex2.moveVec.y >= 0) this.vertex2.moveVec.y = b;
          }
        }
      }
    }
  }
}

class objectc {
  constructor(connections){
    // arary of vertex connections
    this.connections = connections;

    // array of vertecies
    this.vertecies = [];

    // filled by adding all of the vertecies within the given connections
    for(let i = 0; i < connections.length; i++){
      
      let a = 0;
      // checks if the ID is the same as another vertex in the list
      for(let i2 = 0; i2 < this.vertecies.length; i2++) if(connections[i].vertex1.id == this.vertecies[i2].id) a++;
      // pushes the vertex
      if(a == 0) this.vertecies.push(connections[i].vertex1);


      a = 0;
      // again checks the ID against the other IDs
      for(let i2 = 0; i2 < this.vertecies.length; i2++) if(connections[i].vertex2.id == this.vertecies[i2].id) a++;
      // pushes the vertex
      if(a == 0) this.vertecies.push(connections[i].vertex2);

    }

    // apply self to vertecies as the "this.parentObject" variable
    for(let i = 0; i < this.vertecies.length; i++){
      this.vertecies[i].parentObject = this;
    }

    // create it's own bounding box
    this.boundingBox = new objectBoundingBox(this);
  }
  drawVerteciesF(){
    // F because there is a conditional "drawVertecies"
    for(let i = 0; i < this.vertecies.length; i++){
      this.vertecies[i].drawSelf();
  }
  }
  drawBoundingBox(){
    this.boundingBox.drawSelf();
  }
  drawConnectionsF(){
    // F because there is a conditional "DrawConnections"
    for(let i = 0 ; i< this.connections.length; i++){
      this.connections[i].drawSelf();
    }
  }
  doPhysics(){
    for(let i = 0; i < this.vertecies.length; i++){
      this.vertecies[i].updateMovement();
    }
    for(let i = 0; i < this.connections.length; i++){
      this.connections[i].checkForces();
    }
    this.boundingBox.updateSelf();
  }
}

class objectBoundingBox {
  constructor(obj){
    // initial definitions are opposite of desired outcome
    // for loop itterates and does if x < this.minx, this,minx = x
    // for this, the initial values are the opposite of the given name

    this.minx = 10000;
    this.miny = 10000;
    this.maxx = -10000;
    this.maxy = -10000;

    this.object = obj;

    // itterates over and does if ___ < this.min__ then this.min__ = ____
    for(let i = 0; i < obj.vertecies.length; i++){
      if(obj.vertecies[i].x < this.minx){
        this.minx = obj.vertecies[i].x;
      }
      if(obj.vertecies[i].y < this.miny){
        this.miny = obj.vertecies[i].y;
      }
      if(obj.vertecies[i].x > this.maxx){
        this.maxx = obj.vertecies[i].x;
      }
      if(obj.vertecies[i].y > this.maxy){
        this.maxy = obj.vertecies[i].y;
      }
    }

    // get the distance between the minimum and maximum values for easier refference
    this.w = dist(this.minx, 0, this.maxx, 0);
    this.h = dist(this.miny, 0, this.maxy, 0);
  }
  updateSelf(){
    // updates itself by re-creating itself that runs the necesary code to update itself
    
    // initial definitions are opposite of desired outcome
    // for loop itterates and does if x < this.minx, this,minx = x
    // for this, the initial values are the opposite of the given name

    this.minx = 10000;
    this.miny = 10000;
    this.maxx = -10000;
    this.maxy = -10000;

    // itterates over and does if ___ < this.min__ then this.min__ = ____
    for(let i = 0; i < this.object.vertecies.length; i++){
      if(this.object.vertecies[i].x < this.minx){
        this.minx = this.object.vertecies[i].x;
      }
      if(this.object.vertecies[i].y < this.miny){
        this.miny = this.object.vertecies[i].y;
      }
      if(this.object.vertecies[i].x > this.maxx){
        this.maxx = this.object.vertecies[i].x;
      }
      if(this.object.vertecies[i].y > this.maxy){
        this.maxy = this.object.vertecies[i].y;
      }
    }

    // get the distance between the minimum and maximum values for easier refference
    this.w = dist(this.minx, 0, this.maxx, 0);
    this.h = dist(this.miny, 0, this.maxy, 0);
  }
  drawSelf(){
    // fill with a transparent red
    fill(200, 0, 0, 100);
    rect(this.minx, this.miny, this.w, this.h);
  }
}
