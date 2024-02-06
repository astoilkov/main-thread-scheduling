export default function simulateWork(): void {
    // a 5x5 matrix
    const matrixA = [
        [1, 2, 3, 4, 5],
        [4, 5, 6, 7, 8],
        [7, 8, 9, 10, 11],
        [7, 8, 9, 10, 11],
        [7, 8, 9, 10, 11],
    ]
    const matrixB = [
        [1, 2, 3, 4, 5],
        [4, 5, 6, 7, 8],
        [7, 8, 9, 10, 11],
        [7, 8, 9, 10, 11],
        [7, 8, 9, 10, 11],
    ]
    for (let i = 0; i < 5000; i++) {
        matrixMultiplication(matrixA, matrixB)
    }
}

function matrixMultiplication(matrix1: number[][], matrix2: number[][]) {
    const result = []
    const rows1 = matrix1.length
    const cols1 = matrix1[0]!.length
    const cols2 = matrix2[0]!.length

    for (let i = 0; i < rows1; i++) {
        result[i] = []
        for (let j = 0; j < cols2; j++) {
            // @ts-ignore
            result[i][j] = 0
            for (let k = 0; k < cols1; k++) {
                // @ts-ignore
                result[i][j] += matrix1[i][k] * matrix2[k][j]
            }
        }
    }

    return result
}
