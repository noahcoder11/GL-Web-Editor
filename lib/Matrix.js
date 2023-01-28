class Matrix {
  constructor(args){
    this.args = args || [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ]
  }
  
  static multiply(m1, m2){
    var out = new Matrix()
    m1 = m1.args
    m2 = m2.args

    out.args = GPUFunctions.matrixMultiply(m1, m2);

    return out
  }

  static translation(vector) {
    let out = new Matrix()

    out.args[12] = vector.x
    out.args[13] = vector.y
    out.args[14] = vector.z

    return out
  }

  static rotation(vector) {
    var out = new Matrix()

    out.args = [
        Math.cos(vector.y)*Math.cos(vector.z), Math.cos(vector.y)*Math.sin(vector.z), Math.sin(vector.y), 0,
        Math.sin(vector.x)*-Math.sin(vector.y)*Math.cos(vector.z)+Math.cos(vector.x)*-Math.sin(vector.z), Math.sin(vector.x)*-Math.sin(vector.y)*Math.sin(vector.z)+Math.cos(vector.x)*Math.cos(vector.z), Math.sin(vector.x)*Math.cos(vector.y), 0,
        Math.cos(vector.x)*-Math.sin(vector.y)*Math.cos(vector.z)+(-Math.sin(vector.x)*-Math.sin(vector.z)), Math.cos(vector.x)*-Math.sin(vector.y)*Math.sin(vector.z)-Math.sin(vector.x)*Math.cos(vector.z), Math.cos(vector.x)*Math.cos(vector.y), 0,
        0, 0, 0, 1
    ]

    return out
  }

  static clone(matrix){
    return new Matrix(matrix.args)
  }

  static projection(FOV, a, zMin, zMax){
    var ang = Math.tan((FOV * .5) * Math.PI / 180)
    
    return new Matrix([
      0.5 / ang, 0, 0, 0,
      0, 0.5 * a / ang, 0, 0,
      0, 0, -(zMax + zMin) / (zMax - zMin), -1,
      0, 0, (-2 * zMax * zMin) / (zMax - zMin), 0
    ])
  }
  
  translate(vector){
    Matrix.translate(this, vector)
  }
  
  rotate(vector){
    Matrix.rotate(this, vector)
  }
  
  clone(){
    return Matrix.clone(this)
  }
}