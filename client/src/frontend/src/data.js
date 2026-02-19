// =============================================
// MOCK QUESTIONS DATA
// =============================================

export const mcqQuestions = {
  easy: [
    {
      id: 1,
      question: "Which of the following is NOT a primitive data type in JavaScript?",
      options: ["String", "Boolean", "Object", "Number"],
      correct: 2,
    },
    {
      id: 2,
      question: "What does HTML stand for?",
      options: [
        "Hyper Text Markup Language",
        "High Tech Modern Language",
        "Hyper Transfer Markup Language",
        "Home Tool Markup Language",
      ],
      correct: 0,
    },
    {
      id: 3,
      question: "Which symbol is used for single-line comments in Python?",
      options: ["//", "/*", "#", "--"],
      correct: 2,
    },
    {
      id: 4,
      question: "What is the output of: print(type(3.14)) in Python?",
      options: ["<class 'int'>", "<class 'float'>", "<class 'double'>", "<class 'number'>"],
      correct: 1,
    },
    {
      id: 5,
      question: "Which data structure follows LIFO (Last In First Out) principle?",
      options: ["Queue", "Array", "Stack", "Linked List"],
      correct: 2,
    },
    {
      id: 6,
      question: "What is the time complexity of accessing an element in an array by index?",
      options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
      correct: 3,
    },
    {
      id: 7,
      question: "Which keyword is used to declare a constant in JavaScript?",
      options: ["var", "let", "const", "static"],
      correct: 2,
    },
    {
      id: 8,
      question: "What does CSS stand for?",
      options: [
        "Computer Style Sheets",
        "Cascading Style Sheets",
        "Creative Style System",
        "Colorful Style Sheets",
      ],
      correct: 1,
    },
    {
      id: 9,
      question: "Which of the following is a valid way to create a list in Python?",
      options: ["list = (1, 2, 3)", "list = {1, 2, 3}", "list = [1, 2, 3]", "list = <1, 2, 3>"],
      correct: 2,
    },
    {
      id: 10,
      question: "What is the base of the binary number system?",
      options: ["8", "10", "16", "2"],
      correct: 3,
    },
  ],
  medium: [
    {
      id: 1,
      question: "What is the time complexity of Binary Search?",
      options: ["O(n)", "O(n log n)", "O(log n)", "O(n²)"],
      correct: 2,
    },
    {
      id: 2,
      question: "Which sorting algorithm has the best average-case time complexity?",
      options: ["Bubble Sort", "Merge Sort", "Insertion Sort", "Selection Sort"],
      correct: 1,
    },
    {
      id: 3,
      question: "In object-oriented programming, what is encapsulation?",
      options: [
        "Inheriting properties from parent class",
        "Bundling data and methods that operate on data within a single unit",
        "Creating multiple forms of a method",
        "Hiding implementation details from the user",
      ],
      correct: 1,
    },
    {
      id: 4,
      question: "What does the 'this' keyword refer to in JavaScript?",
      options: [
        "The global object always",
        "The current function",
        "The object that owns the executing code",
        "The parent class",
      ],
      correct: 2,
    },
    {
      id: 5,
      question: "Which HTTP method is used to update an existing resource?",
      options: ["GET", "POST", "PUT", "DELETE"],
      correct: 2,
    },
    {
      id: 6,
      question: "What is a closure in programming?",
      options: [
        "A function that calls itself",
        "A function that has access to its outer scope even after the outer function has returned",
        "A way to close a program",
        "A method to terminate a loop",
      ],
      correct: 1,
    },
    {
      id: 7,
      question: "Which data structure is used for BFS (Breadth-First Search)?",
      options: ["Stack", "Queue", "Heap", "Tree"],
      correct: 1,
    },
    {
      id: 8,
      question: "What is the space complexity of a recursive Fibonacci function without memoization?",
      options: ["O(1)", "O(n)", "O(log n)", "O(2^n)"],
      correct: 1,
    },
    {
      id: 9,
      question: "Which design pattern ensures only one instance of a class exists?",
      options: ["Factory", "Observer", "Singleton", "Decorator"],
      correct: 2,
    },
    {
      id: 10,
      question: "What is the difference between == and === in JavaScript?",
      options: [
        "No difference",
        "=== checks value only, == checks type only",
        "== checks value and type, === checks value only",
        "=== checks both value and type, == checks value with type coercion",
      ],
      correct: 3,
    },
  ],
  hard: [
    {
      id: 1,
      question: "What is the time complexity of Dijkstra's algorithm using a min-heap?",
      options: ["O(V²)", "O(E log V)", "O(V log E)", "O(E + V)"],
      correct: 1,
    },
    {
      id: 2,
      question: "In a balanced BST with n nodes, what is the height?",
      options: ["O(n)", "O(n²)", "O(log n)", "O(√n)"],
      correct: 2,
    },
    {
      id: 3,
      question: "Which of the following is true about the CAP theorem?",
      options: [
        "A distributed system can guarantee all three: Consistency, Availability, and Partition tolerance",
        "A distributed system can only guarantee two of the three: Consistency, Availability, Partition tolerance",
        "CAP theorem only applies to relational databases",
        "Partition tolerance is optional in distributed systems",
      ],
      correct: 1,
    },
    {
      id: 4,
      question: "What is the output of: [1,2,3].reduce((acc, val) => acc * val, 1) in JavaScript?",
      options: ["6", "1", "3", "undefined"],
      correct: 0,
    },
    {
      id: 5,
      question: "Which algorithm is used in garbage collection for detecting circular references?",
      options: ["DFS", "BFS", "Mark-and-Sweep", "Dijkstra"],
      correct: 2,
    },
    {
      id: 6,
      question: "What is tail call optimization?",
      options: [
        "Optimizing the first call in a recursive function",
        "Reusing the current stack frame for a tail-recursive call instead of creating a new one",
        "A technique to speed up loop iterations",
        "Caching the result of recursive calls",
      ],
      correct: 1,
    },
    {
      id: 7,
      question: "In the context of databases, what does ACID stand for?",
      options: [
        "Atomicity, Consistency, Isolation, Durability",
        "Accuracy, Consistency, Integrity, Durability",
        "Atomicity, Concurrency, Isolation, Data",
        "Accuracy, Concurrency, Integrity, Data",
      ],
      correct: 0,
    },
    {
      id: 8,
      question: "What is the worst-case time complexity of QuickSort?",
      options: ["O(n log n)", "O(n)", "O(n²)", "O(log n)"],
      correct: 2,
    },
    {
      id: 9,
      question: "Which of the following is NOT a characteristic of a microservices architecture?",
      options: [
        "Services are independently deployable",
        "Each service has its own database",
        "All services share a single monolithic codebase",
        "Services communicate via APIs",
      ],
      correct: 2,
    },
    {
      id: 10,
      question: "What does the 'volatile' keyword do in Java?",
      options: [
        "Makes a variable constant",
        "Ensures a variable is always read from and written to main memory, not CPU cache",
        "Prevents a method from being overridden",
        "Makes a variable thread-local",
      ],
      correct: 1,
    },
  ],
};

export const codingProblems = {
  easy: [
    {
      id: 1,
      title: "Two Sum",
      difficulty: "Easy",
      tags: ["Array", "Hash Map"],
      description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
      examples: [
        { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "nums[0] + nums[1] = 2 + 7 = 9" },
        { input: "nums = [3,2,4], target = 6", output: "[1,2]" },
      ],
      constraints: [
        "2 ≤ nums.length ≤ 10⁴",
        "-10⁹ ≤ nums[i] ≤ 10⁹",
        "-10⁹ ≤ target ≤ 10⁹",
        "Only one valid answer exists.",
      ],
      starterCode: {
        python: `def twoSum(nums, target):
    # Write your solution here
    pass

# Test
print(twoSum([2, 7, 11, 15], 9))`,
        java: `import java.util.*;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your solution here
        return new int[]{};
    }
    
    public static void main(String[] args) {
        Solution sol = new Solution();
        System.out.println(Arrays.toString(sol.twoSum(new int[]{2,7,11,15}, 9)));
    }
}`,
        cpp: `#include <bits/stdc++.h>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    // Write your solution here
    return {};
}

int main() {
    vector<int> nums = {2, 7, 11, 15};
    auto result = twoSum(nums, 9);
    cout << "[" << result[0] << "," << result[1] << "]" << endl;
    return 0;
}`,
        c: `#include <stdio.h>
#include <stdlib.h>

int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    // Write your solution here
    *returnSize = 2;
    int* result = (int*)malloc(2 * sizeof(int));
    return result;
}

int main() {
    int nums[] = {2, 7, 11, 15};
    int returnSize;
    int* result = twoSum(nums, 4, 9, &returnSize);
    printf("[%d, %d]\\n", result[0], result[1]);
    return 0;
}`,
      },
    },
  ],
  medium: [
    {
      id: 1,
      title: "Longest Substring Without Repeating Characters",
      difficulty: "Medium",
      tags: ["String", "Sliding Window", "Hash Map"],
      description: `Given a string \`s\`, find the length of the longest substring without repeating characters.

A substring is a contiguous non-empty sequence of characters within a string.`,
      examples: [
        { input: 's = "abcabcbb"', output: "3", explanation: 'The answer is "abc", with the length of 3.' },
        { input: 's = "bbbbb"', output: "1", explanation: 'The answer is "b", with the length of 1.' },
        { input: 's = "pwwkew"', output: "3", explanation: 'The answer is "wke", with the length of 3.' },
      ],
      constraints: [
        "0 ≤ s.length ≤ 5 × 10⁴",
        "s consists of English letters, digits, symbols and spaces.",
      ],
      starterCode: {
        python: `def lengthOfLongestSubstring(s):
    # Write your solution here
    pass

# Test
print(lengthOfLongestSubstring("abcabcbb"))
print(lengthOfLongestSubstring("bbbbb"))`,
        java: `class Solution {
    public int lengthOfLongestSubstring(String s) {
        // Write your solution here
        return 0;
    }
    
    public static void main(String[] args) {
        Solution sol = new Solution();
        System.out.println(sol.lengthOfLongestSubstring("abcabcbb"));
    }
}`,
        cpp: `#include <bits/stdc++.h>
using namespace std;

int lengthOfLongestSubstring(string s) {
    // Write your solution here
    return 0;
}

int main() {
    cout << lengthOfLongestSubstring("abcabcbb") << endl;
    return 0;
}`,
        c: `#include <stdio.h>
#include <string.h>

int lengthOfLongestSubstring(char* s) {
    // Write your solution here
    return 0;
}

int main() {
    printf("%d\\n", lengthOfLongestSubstring("abcabcbb"));
    return 0;
}`,
      },
    },
  ],
  hard: [
    {
      id: 1,
      title: "Median of Two Sorted Arrays",
      difficulty: "Hard",
      tags: ["Array", "Binary Search", "Divide and Conquer"],
      description: `Given two sorted arrays \`nums1\` and \`nums2\` of size \`m\` and \`n\` respectively, return the median of the two sorted arrays.

The overall run time complexity should be **O(log(m+n))**.`,
      examples: [
        { input: "nums1 = [1,3], nums2 = [2]", output: "2.00000", explanation: "merged array = [1,2,3] and median is 2." },
        { input: "nums1 = [1,2], nums2 = [3,4]", output: "2.50000", explanation: "merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5." },
      ],
      constraints: [
        "nums1.length == m",
        "nums2.length == n",
        "0 ≤ m ≤ 1000",
        "0 ≤ n ≤ 1000",
        "1 ≤ m + n ≤ 2000",
        "-10⁶ ≤ nums1[i], nums2[i] ≤ 10⁶",
      ],
      starterCode: {
        python: `def findMedianSortedArrays(nums1, nums2):
    # Write your solution here
    pass

# Test
print(findMedianSortedArrays([1, 3], [2]))
print(findMedianSortedArrays([1, 2], [3, 4]))`,
        java: `class Solution {
    public double findMedianSortedArrays(int[] nums1, int[] nums2) {
        // Write your solution here
        return 0.0;
    }
    
    public static void main(String[] args) {
        Solution sol = new Solution();
        System.out.println(sol.findMedianSortedArrays(new int[]{1,3}, new int[]{2}));
    }
}`,
        cpp: `#include <bits/stdc++.h>
using namespace std;

double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {
    // Write your solution here
    return 0.0;
}

int main() {
    vector<int> nums1 = {1, 3}, nums2 = {2};
    cout << findMedianSortedArrays(nums1, nums2) << endl;
    return 0;
}`,
        c: `#include <stdio.h>

double findMedianSortedArrays(int* nums1, int m, int* nums2, int n) {
    // Write your solution here
    return 0.0;
}

int main() {
    int nums1[] = {1, 3}, nums2[] = {2};
    printf("%.5f\\n", findMedianSortedArrays(nums1, 2, nums2, 1));
    return 0;
}`,
      },
    },
  ],
};
