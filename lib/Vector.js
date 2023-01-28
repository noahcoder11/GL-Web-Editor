class Vector {
    constructor(...args) {
        // The values of the vector
        this.args = args
    }
    
    // Determines the largest of a given input of vectors
    static largest(...args) {
        var largest = Vector.fromDimension(0);
        for(let item of args){
            if(item.dimension > largest.dimension){
                largest = item
            }
        }
        
        return largest
    }
    
    // Creates a zero vector with a given dimension
    static fromDimension(dim) {
        return new Vector(...Array(dim).fill(0))
    }
    
    // Clones a vector
    static clone(v) {
        return new Vector(...v.args)
    }
    
    // Adds two vectors
    static add(v1, v2) {
        let largest = Vector.largest(v1, v2)
        let result = Vector.fromDimension(largest.dimension)
        for(let i = 0;i < largest.dimension;i++){
            result.args[i] = (v1.args[i]||0) + (v2.args[i]||0)
        }
        
        return result
    }
    
    // Subtracts two vectors
    static subtract(v1, v2) {
        let largest = Vector.largest(v1, v2)
        let result = Vector.fromDimension(largest.dimension)
        for(let i = 0;i < largest.dimension;i++){
            result.args[i] = (v1.args[i]||0) + (v2.args[i]||0)
        }
        
        return result
    }
    
    // Multiplies two vectors
    static multiply(v1, v2) {
        let largest = Vector.largest(v1, v2)
        let result = Vector.fromDimension(largest.dimension)
        for(let i = 0;i < largest.dimension;i++){
            result.args[i] = (v1.args[i]||0) * (v2.args[i]||0)
        }
        
        return result
    }
    
    // Divides two vectors
    static divide(v1, v2) {
        let largest = Vector.largest(v1, v2)
        let result = Vector.fromDimension(largest.dimension)
        for(let i = 0;i < largest.dimension;i++){
            result.args[i] = (v1.args[i]||0) / (v2.args[i]||0)
        }
        
        return result
    }
    
    // Getst he remainder of two divided vectors
    static modulos(v1, v2) {
        let largest = Vector.largest(v1, v2)
        let result = Vector.fromDimension(largest.dimension)
        for(let i = 0;i < largest.dimension;i++){
            result.args[i] = (v1.args[i]||0) % (v2.args[i]||0)
        }
        
        return result
    }
    
    // Applies a given function to a vector
    static applyFunction(v, f) {
        let result = Vector.clone(v)
        
        for(let i = 0;i < result.dimension;i++){
            result.args[i] = f(result.args[i])
        }
        
        return result
    }
    
    // Multiplies a vector by a scalar
    static scale(v, s) {
        let result = Vector.clone(v)
        for(let i = 0;i < result.dimension;i++){
            result.args[i] *= s
        }
        
        return result
    }
    
    // Takes the dot product of two vectors
    static dot(v1, v2) {
        let result = 0
        let largest = Vector.largest(v1, v2)
        
        for(var i = 0;i < largest.dimension;i++){
            result += (v1.args[i]||0) * (v2.args[i]||0)
        }
        
        return result
    }
    
    // Takes the 3-dimensional dot product of two vectors
    static cross3D(v1, v2) {
        return new Vector(
            v1.y * v2.z - v1.z * v2.y,
            v1.z * v2.x - v1.x * v2.z,
            v1.x * v2.y - v1.y * v2.x,
        )
    }
    
    // Normalizes a vector
    static normalize(v){
        if(!v.magnitude){
            println(Error("Magnitude cannot be zero!"))
        }
        return Vector.scale(v, 1/v.magnitude)
    }
    
    // Get shortcuts for dimension, mmagnitude, x, y, z, w, etc...
    get dimension() {
        return this.args.length
    }
    
    get x(){
        return this.args[0]
    }
    
    get y(){
        return this.args[1]
    }
    
    get z(){
        return this.args[2]
    }
    
    get w(){
        return this.args[3]
    }
    
    get r(){
        return this.args[0]
    }
    
    get g(){
        return this.args[1]
    }
    
    get b(){
        return this.args[2]
    }
    
    get a(){
        return this.args[3]
    }
  
    set x(v){
        this.args[0] = v
    }
    
    set y(v){
        this.args[1] = v
    }
    
    set z(v){
        this.args[2] = v
    }
    
    set w(v){
        this.args[3] = v
    }
    
    set r(v){
        this.args[0] = v
    }
    
    set g(v){
        this.args[1] = v
    }
    
    set b(v){
        this.args[2] = v
    }
    
    set a(v){
        this.args[3] = v
    }
    
    get magnitude(){
        return Math.sqrt(Vector.dot(this, this))
    }
    
    get normalized(){
        return Vector.normalize(this)
    }
    
    // Instance specific methods that are the same but they alter the original vector and only take one vector as an argument.
    add(v) {
        this.args = Vector.add(this, v).args
    }
    
    subtract(v) {
        this.args = Vector.subtract(this, v).args
    }
    
    multiply(v) {
        this.args = Vector.multiply(this, v).args
    }
    
    divide(v) {
        this.args = Vector.divide(this, v).args
    }
    
    modulos(v) {
        this.args = Vector.modulos(this, v).args
    }
    
    scale(s) {
        this.args = Vector.scale(this, s).args
    }
    
    dot(v) {
        this.args = Vector.dot(this, v).args
    }
    
    cross3D(v) {
        this.args = Vector.cross3D(this, v).args
    }
    
    applyFunction(f) {
        this.args = Vector.applyFunction(this, f).args
    }
    
    set(...args){
        this.args = args
    }
  }