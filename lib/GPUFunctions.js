class GPUFunctions {
    static GPU = new GPU();

    static matrixMultiply = GPUFunctions.GPU.createKernel(function(a, b) {
        let sum = 0;
        for (let i = 0; i < 4; i++) {
            sum += a[this.thread.y][i] * b[i][this.thread.x];
        }
        return sum;
    }).setOutput([4, 4]);
}