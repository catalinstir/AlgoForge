def main():
    try:
        with open("input.txt", "r") as file:
            # Read the first line and parse numbers
            line = file.readline()
            nums = list(map(int, line.strip().split()))

            # Read the target value
            target_line = file.readline()
            target = int(target_line.strip())

    except FileNotFoundError:
        print("Failed to open input.txt")
        return 1
    except Exception as e:
        print(f"Error reading input.txt: {e}")
        return 1

    # Solve using a hash map (dictionary)
    num_map = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in num_map:
            print(num_map[complement], i)
            return 0
        num_map[num] = i

    return 0

if __name__ == "__main__":
    main()
