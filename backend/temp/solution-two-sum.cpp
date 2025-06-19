#include <iostream>
#include <fstream>
#include <vector>
#include <string>
#include <algorithm>
#include <sstream>
#include <unordered_map>
#include <map>
#include <set>
#include <queue>
#include <stack>
#include <climits>
#include <cmath>

using namespace std;

int main() {
    ifstream input("input.txt");
    if (!input.is_open()) {
        cerr << "Failed to open input.txt" << endl;
        return 1;
    }

    string line;
    getline(input, line);
    istringstream iss(line);
    vector<int> nums;
    int num;
    while (iss >> num) {
        nums.push_back(num);
    }

    // Read the target
    int target;
    input >> target;

    // Solve using hash map
    unordered_map<int, int> map;
    for (int i = 0; i < nums.size(); i++) {
        int complement = target - nums[i];
        if (map.find(complement) != map.end()) {
            cout << map[complement] << " " << i << endl;
            return 0;
        }
        map[nums[i]] = i;
    }

    return 0;
}
