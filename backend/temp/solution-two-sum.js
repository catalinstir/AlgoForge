const fs = require('fs');

function main() {
    let data;
    try {
        data = fs.readFileSync('input.txt', 'utf8');
    } catch (err) {
        console.error("Failed to open input.txt");
        return 1;
    }

    const lines = data.trim().split('\n');

    // First line: array of numbers
    const nums = lines[0].trim().split(/\s+/).map(Number);

    // Second line: target number
    const target = parseInt(lines[1], 10);

    // Solve using a hash map
    const numMap = new Map();

    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (numMap.has(complement)) {
            console.log(numMap.get(complement), i);
            return 0;
        }
        numMap.set(nums[i], i);
    }

    return 0;
}

main();

