// global variables
let drawVertecies = false;
let drawConnections = true;
let drawBoundingBoxes = false;
let gravity;
let drawDebugValues = true;
// variable to define whether or not physics is run step by step instead of at the frame rate
let stepByStep = false;
let vertexID = 0;

// array to hold all of the world objects
let worldObjects = [];
let vertecies = [];
let connections = [];
let rigidity = 50;
let forceDampening = 0.1;

function setup() {
  createCanvas(windowWidth, windowHeight);

  createObject(400, 50, 10, 1, 1, true, true, 10);
  worldObjects[0].vertecies[0].isStatic = true;


  // define gravity as a force class
  gravity = new force(0, 1, 0.9, 0, "Global", false);
  // apply gravity
  for(let i = 0; i < vertecies.length; i++){
    vertecies[i].addForce(gravity);
  }
}

function draw() {
  background(150);
  drawConditionals();
  if(stepByStep == false){
    worldObjects[0].doPhysics();
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
  if(s == undefined){
    s = false;
  }
  let v =  new objectVertex(x, y, s, vertexID);
  vertecies.push(v);
  vertexID ++;
  return v;
}

function newConnection(v1, v2, e){
  let c = new vertexConnection(v1, v2, e);
  connections.push(c);
  return c;
}

function mousePressed(){
  if(stepByStep == true){
    worldObjects[0].doPhysics();
  }
}

function createObject(startx, starty, rowSize, columnSize, spacing, rowConnectors, columnConnectors, elacticity){
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
      let divisor = (this.forces.length)
      for(let i = 0; i < this.forces.length; i++){
        this.moveVec.x += (this.forces[i].forceVector.x / divisor) * forceDampening;
        this.moveVec.y += (this.forces[i].forceVector.y / divisor) * forceDampening;
        this.forces[i].update();
        // apply forces to other connected vertecies
        for(let i2 = 0; i2 < this.connections.length; i2++){
          // check if it is vertex one or two
          if(this.forces[i].randID = gravity.randID){
            if(this.connections[i2].vertex1.id == this.id) this.connections[i2].vertex2.addForce(this.forces[i]);
            else this.connections[i2].vertex1.addForce(this.forces[i]);
          }
        }
      }
      // updating movement also includes updating the position which is also done
      // if it is not static
      this.x += this.moveVec.x;
      this.y += this.moveVec.y;
    }
    // culling forces that have minimal impact and will generally only cause lag
    this.cullForces();
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
      text("y: " + this.x, this.x, this.y - (debugYStart-10));
      text("Static: " + this.isStatic, this.x, this.y - (debugYStart-20));
      text("ID: " + this.id, this.x, this.y - (debugYStart-30));
    }
  }
}

class force {
  constructor(x, y, s, a, t, t1, cd){
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
    this.timer ++;
    if(this.timer >= this.cooldown){
      this.forceVector = createVector(0, 0);
    }
  }
}

class vertexConnection {
  constructor(v1, v2, e){
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
    stroke(0);
    strokeWeight(1);
    line(this.vertex1.x, this.vertex1.y, this.vertex2.x, this.vertex2.y);
  }
  checkForces(){
    // get tjhe distance between points
    let d1 = this.getCurrentDistance();

    // if it is grater than the base length of the connection
    if(d1 > this.baseLength + 20){
      // call the apply forces function.
      this.applyForces(d1, 1);
    }
    if(d1 < this.baseLength - 20){
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
    let forceMult = pow(1/(d1 - this.baseLength), -1) / (this.elasticity);
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
      for(let i2 = 0; i2 < this.vertecies.length; i2++){
        if(connections[i].vertex1.id == this.vertecies[i2].id) a++;
      }

      // pushes the vertex
      a = 0;
      if(a == 0) this.vertecies.push(connections[i].vertex1);

      // again checks the ID against the other IDs
      for(let i2 = 0; i2 < this.vertecies.length; i2++){
        if(connections[i].vertex2.id == this.vertecies[i2].id) a++;
      }

      // pushes the vertex
      if(a == 0) this.vertecies.push(connections[i].vertex2);
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