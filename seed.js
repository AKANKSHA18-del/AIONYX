require('dotenv').config();
const db = require('../config/db');
const bcrypt = require('bcrypt');

const seedContents = async () => {
    try {
        console.log('Connected to the Neon PostgreSQL database');

        // Clean existing data
        console.log('Cleaning existing data...');
        await db.query('DELETE FROM questions');
        await db.query('DELETE FROM sections');
        await db.query('DELETE FROM students');
        await db.query('DELETE FROM admin');

        // Seed Admin
        console.log('Seeding Admin...');
        const adminPassword = await bcrypt.hash('admin123', 10);
        await db.query('INSERT INTO admin (email, password) VALUES ($1, $2)', ['admin@algomaster.com', adminPassword]);

        // Seed Sections
        console.log('Seeding Sections...');
        await db.query(`INSERT INTO sections (section_name) VALUES ('Stacks & Queues')`);
        await db.query(`INSERT INTO sections (section_name) VALUES ('Heaps & Priority Queues')`);
        await db.query(`INSERT INTO sections (section_name) VALUES ('Binary Search')`);

        const sectionsRes = await db.query('SELECT id, section_name FROM sections');
        console.log('Available sections:', sectionsRes.rows);

        const findSectionId = (name) => {
            const section = sectionsRes.rows.find(s => s.section_name.toLowerCase() === name.toLowerCase());
            if (!section) throw new Error(`Section "${name}" not found in database`);
            return section.id;
        };

        const arraysId = findSectionId('Arrays & Strings');
        const dpId = findSectionId('Dynamic Programming');
        const linkedListId = findSectionId('Linked Lists');
        const treeId = findSectionId('Trees & Graphs');
        const stackId = findSectionId('Stacks & Queues');
        const heapId = findSectionId('Heaps & Priority Queues');
        const searchId = findSectionId('Binary Search');

        console.log('Seeding Problems...');

        // Problems for Arrays
        await db.query(`
            INSERT INTO questions (section_id, title, leetcode_url, difficulty, procedure, solution_python, solution_java, solution_cpp, key_insights)
            VALUES ($1, 'Two Sum', 'https://leetcode.com/problems/two-sum/', 'Easy',
            'Use a Hash Map to store values and their indices. Iterating through once, check if the complement (target - current) exists in the map.',
            'def twoSum(nums, target):\n    prevMap = {}\n    for i, n in enumerate(nums):\n        diff = target - n\n        if diff in prevMap:\n            return [prevMap[diff], i]\n        prevMap[n] = i',
            'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> prevMap = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int diff = target - nums[i];\n            if (prevMap.containsKey(diff)) {\n                return new int[] { prevMap.get(diff), i };\n            }\n            prevMap.put(nums[i], i);\n        }\n        return new int[] {};\n    }\n}',
            'class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        unordered_map<int, int> prevMap;\n        for (int i = 0; i < nums.size(); i++) {\n            int diff = target - nums[i];\n            if (prevMap.count(diff)) {\n                return {prevMap[diff], i};\n            }\n            prevMap[nums[i]] = i;\n        }\n        return {};\n    }\n};',
            'Hash Map provides O(1) lookups.')
        `, [arraysId]);

        // Problems for DP
        await db.query(`
            INSERT INTO questions (section_id, title, leetcode_url, difficulty, procedure, solution_python, solution_java, solution_cpp, key_insights)
            VALUES ($1, 'Climbing Stairs', 'https://leetcode.com/problems/climbing-stairs/', 'Easy',
            'This is a variation of Fibonacci. To reach step n, you can come from n-1 or n-2.',
            'def climbStairs(n):\n    if n <= 2: return n\n    one, two = 1, 2\n    for i in range(3, n + 1):\n        temp = one + two\n        one = two\n        two = temp\n    return two',
            'class Solution {\n    public int climbStairs(int n) {\n        if (n <= 2) return n;\n        int one = 1, two = 2;\n        for (int i = 3; i <= n; i++) {\n            int temp = one + two;\n            one = two;\n            two = temp;\n        }\n        return two;\n    }\n}',
            'class Solution {\npublic:\n    int climbStairs(int n) {\n        if (n <= 2) return n;\n        int one = 1, two = 2;\n        for (int i = 3; i <= n; i++) {\n            int temp = one + two;\n            one = two;\n            two = temp;\n        }\n        return two;\n    }\n};',
            'Space optimization reduces requirement to two variables.')
        `, [dpId]);

        // Problems for Trees
        await db.query(`
            INSERT INTO questions (section_id, title, leetcode_url, difficulty, procedure, solution_python, solution_java, solution_cpp, key_insights)
            VALUES ($1, 'Invert Binary Tree', 'https://leetcode.com/problems/invert-binary-tree/', 'Easy',
            'Recursively swap the left and right children of every node in the tree.',
            'def invertTree(root):\n    if not root: return None\n    root.left, root.right = invertTree(root.right), invertTree(root.left)\n    return root',
            'class Solution {\n    public TreeNode invertTree(TreeNode root) {\n        if (root == null) return null;\n        TreeNode temp = root.left;\n        root.left = invertTree(root.right);\n        root.right = invertTree(temp);\n        return root;\n    }\n}',
            'class Solution {\npublic:\n    TreeNode* invertTree(TreeNode* root) {\n        if (!root) return nullptr;\n        TreeNode* temp = root->left;\n        root->left = invertTree(root->right);\n        root->right = invertTree(temp);\n        return root;\n    }\n};',
            'Depth First Search approach.')
        `, [treeId]);

        // New Questions - Search
        await db.query(`
            INSERT INTO questions (section_id, title, leetcode_url, difficulty, procedure, solution_python, solution_java, solution_cpp, key_insights)
            VALUES ($1, 'Binary Search', 'https://leetcode.com/problems/binary-search/', 'Easy',
            'Use two pointers (low, high) and find the midpoint. Narrow the search range based on a comparison.',
            'def search(nums, target):\n    l, r = 0, len(nums) - 1\n    while l <= r:\n        m = (l + r) // 2\n        if nums[m] == target: return m\n        if nums[m] < target: l = m + 1\n        else: r = m - 1\n    return -1',
            'class Solution {\n    public int search(int[] nums, int target) {\n        int l = 0, r = nums.length - 1;\n        while(l <= r) {\n            int m = l + (r - l) / 2;\n            if(nums[m] == target) return m;\n            if(nums[m] < target) l = m + 1;\n            else r = m - 1;\n        }\n        return -1;\n    }\n}',
            'class Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        int l = 0, r = nums.size() - 1;\n        while(l <= r) {\n            int m = l + (r - l) / 2;\n            if(nums[m] == target) return m;\n            if(nums[m] < target) l = m + 1;\n            else r = m - 1;\n        }\n        return -1;\n    }\n};',
            'Splits search space in half each iteration.')
        `, [searchId]);

        // Stacks
        await db.query(`
            INSERT INTO questions (section_id, title, leetcode_url, difficulty, procedure, solution_python, solution_java, solution_cpp, key_insights)
            VALUES ($1, 'Valid Parentheses', 'https://leetcode.com/problems/valid-parentheses/', 'Easy',
            'Push opening brackets onto a stack. When a closing bracket is found, pop and verify it matches the latest opening bracket.',
            'def isValid(s):\n    stack = []\n    m = {")":"(", "}":"{", "]":"["}\n    for c in s:\n        if c in m:\n            if not stack or stack.pop() != m[c]: return False\n        else: stack.append(c)\n    return not stack',
            'class Solution {\n    public boolean isValid(String s) {\n        Stack<Character> stack = new Stack<>();\n        for(char c : s.toCharArray()) {\n            if(c == "(") stack.push(")");\n            else if(c == "{") stack.push("}");\n            else if(c == "[") stack.push("]");\n            else if(stack.isEmpty() || stack.pop() != c) return false;\n        }\n        return stack.isEmpty();\n    }\n}',
            'class Solution {\npublic:\n    bool isValid(string s) {\n        stack<char> st;\n        for(char c : s) {\n            if(c == "(" || c == "{" || c == "[") st.push(c);\n            else {\n                if(st.empty()) return false;\n                if(c == ")" && st.top() != "(") return false;\n                if(c == "}" && st.top() != "{") return false;\n                if(c == "]" && st.top() != "[") return false;\n                st.pop();\n            }\n        }\n        return st.empty();\n    }\n};',
            'LIFO property of stacks is ideal for nesting.')
        `, [stackId]);

        console.log('Seeding complete!');
        process.exit();
    } catch (err) {
        console.error('Seed Error:', err);
        process.exit(1);
    }
};

seedContents();
