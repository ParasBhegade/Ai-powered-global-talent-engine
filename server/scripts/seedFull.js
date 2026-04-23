/**
 * seedFull.js — Complete data seed for 20 career paths
 * Adds: missing paths, skills for new paths, 10 aptitude questions per path, 3 tutorials per path
 * Run: node server/scripts/seedFull.js
 * Safe to re-run — skips existing data
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const CareerPath = require('../models/CareerPath');
const Skill = require('../models/Skill');
const AptitudeQuestion = require('../models/AptitudeQuestion');
const Tutorial = require('../models/Tutorial');

// ─── Full 20 Paths ────────────────────────────────────────────────────────────
const ALL_PATHS = [
  { name: 'Web Developer', description: 'Build interactive, responsive websites and web applications using modern frontend technologies.' },
  { name: 'Backend Developer', description: 'Design and implement server-side logic, APIs, and database integrations for scalable applications.' },
  { name: 'Full Stack Developer', description: 'Work across the entire stack — from UI to backend to deployment — delivering complete web solutions.' },
  { name: 'Data Analyst', description: 'Transform raw data into actionable insights using statistical analysis, SQL, and visualization tools.' },
  { name: 'AI & ML Engineer', description: 'Build and deploy machine learning models and intelligent systems using Python and deep learning frameworks.' },
  { name: 'Cyber Security Specialist', description: 'Protect systems and networks from threats through ethical hacking, penetration testing, and security auditing.' },
  { name: 'Software Engineer', description: 'Design robust, scalable software solutions applying computer science fundamentals and design patterns.' },
  { name: 'UI/UX Designer', description: 'Craft intuitive user experiences through research, wireframing, prototyping, and design system creation.' },
  { name: 'QA Tester', description: 'Ensure software quality through manual and automated testing, performance testing, and bug tracking.' },
  { name: 'Mobile App Developer', description: 'Build high-performance native and cross-platform mobile applications for iOS and Android.' },
  { name: 'Cloud Engineer', description: 'Architect and manage cloud infrastructure on AWS, Azure, or GCP with a focus on scalability and security.' },
  { name: 'DevOps Engineer', description: 'Automate CI/CD pipelines, manage containers, and bridge development and operations teams.' },
  { name: 'Database Administrator', description: 'Design, optimize, and maintain relational and NoSQL databases for performance, integrity, and security.' },
  { name: 'Network Engineer', description: 'Design and maintain computer networks, configure routers and switches, and ensure network security.' },
  { name: 'System Administrator', description: 'Manage Linux/Windows servers, automate system tasks, and ensure uptime and security.' },
  { name: 'Game Developer', description: 'Create immersive games using Unity or Unreal Engine, combining programming, physics, and 3D graphics.' },
  { name: 'Blockchain Developer', description: 'Build decentralized applications and smart contracts on blockchain platforms like Ethereum.' },
  { name: 'Data Scientist', description: 'Apply statistics, machine learning, and data engineering to extract insights from large datasets.' },
  { name: 'AI Prompt Engineer', description: 'Design, evaluate, and optimize prompts for large language models to build AI-powered products.' },
  { name: 'IoT Engineer', description: 'Build connected IoT systems combining embedded hardware, wireless protocols, and cloud platforms.' },
];

// ─── Skills (for paths that may be missing skills) ────────────────────────────
const SKILLS = {
  'Cloud Engineer': [
    { skillName: 'AWS / Azure / GCP', category: 'Cloud', weight: 95 },
    { skillName: 'Terraform / Infrastructure as Code', category: 'IaC', weight: 88 },
    { skillName: 'Kubernetes', category: 'Containers', weight: 85 },
    { skillName: 'Networking & VPCs', category: 'Network', weight: 80 },
    { skillName: 'CI/CD Pipelines', category: 'DevOps', weight: 82 },
    { skillName: 'Cloud Security & IAM', category: 'Security', weight: 78 },
    { skillName: 'Serverless Architecture', category: 'Architecture', weight: 72 },
    { skillName: 'Cost Optimization', category: 'Cloud', weight: 65 },
  ],
  'Database Administrator': [
    { skillName: 'SQL (PostgreSQL, MySQL)', category: 'Database', weight: 95 },
    { skillName: 'Database Design & Normalization', category: 'Design', weight: 92 },
    { skillName: 'Query Optimization & Indexing', category: 'Performance', weight: 88 },
    { skillName: 'Backup & Recovery', category: 'Operations', weight: 85 },
    { skillName: 'NoSQL (MongoDB, Redis)', category: 'Database', weight: 75 },
    { skillName: 'Replication & Clustering', category: 'Architecture', weight: 80 },
    { skillName: 'Database Security', category: 'Security', weight: 78 },
    { skillName: 'ETL Processes', category: 'Data', weight: 70 },
  ],
  'Network Engineer': [
    { skillName: 'TCP/IP & Networking Protocols', category: 'Protocols', weight: 95 },
    { skillName: 'Routing & Switching (CCNA level)', category: 'Network', weight: 92 },
    { skillName: 'Firewalls & VPNs', category: 'Security', weight: 88 },
    { skillName: 'Network Monitoring Tools', category: 'Tools', weight: 80 },
    { skillName: 'Wireless Networking', category: 'Network', weight: 75 },
    { skillName: 'DNS & DHCP', category: 'Services', weight: 78 },
    { skillName: 'Network Troubleshooting', category: 'Operations', weight: 85 },
    { skillName: 'SDN & Network Automation', category: 'Automation', weight: 65 },
  ],
  'System Administrator': [
    { skillName: 'Linux System Administration', category: 'OS', weight: 95 },
    { skillName: 'Windows Server', category: 'OS', weight: 88 },
    { skillName: 'Shell Scripting (Bash/PowerShell)', category: 'Scripting', weight: 85 },
    { skillName: 'Active Directory & LDAP', category: 'Directory', weight: 80 },
    { skillName: 'Virtualization (VMware/Hyper-V)', category: 'Virtualization', weight: 78 },
    { skillName: 'Backup & Disaster Recovery', category: 'Operations', weight: 82 },
    { skillName: 'Network Configuration', category: 'Network', weight: 75 },
    { skillName: 'Security Hardening', category: 'Security', weight: 72 },
  ],
  'Game Developer': [
    { skillName: 'Unity / Unreal Engine', category: 'Engine', weight: 95 },
    { skillName: 'C# / C++ Programming', category: 'Language', weight: 92 },
    { skillName: 'Game Physics & Math', category: 'CS Fundamentals', weight: 85 },
    { skillName: '3D Modeling Basics (Blender)', category: 'Art', weight: 70 },
    { skillName: 'Game Design Principles', category: 'Design', weight: 80 },
    { skillName: 'Shader Programming', category: 'Graphics', weight: 72 },
    { skillName: 'Multiplayer & Networking', category: 'Network', weight: 75 },
    { skillName: 'Performance Optimization', category: 'Performance', weight: 78 },
  ],
  'Blockchain Developer': [
    { skillName: 'Solidity & Smart Contracts', category: 'Language', weight: 95 },
    { skillName: 'Ethereum & Web3.js', category: 'Platform', weight: 90 },
    { skillName: 'Decentralized App (DApp) Development', category: 'Architecture', weight: 88 },
    { skillName: 'Cryptography Fundamentals', category: 'Security', weight: 82 },
    { skillName: 'Consensus Mechanisms', category: 'Blockchain', weight: 78 },
    { skillName: 'NFT & DeFi Protocols', category: 'Blockchain', weight: 72 },
    { skillName: 'Node.js with Blockchain APIs', category: 'Backend', weight: 75 },
    { skillName: 'Security Auditing for Smart Contracts', category: 'Security', weight: 80 },
  ],
  'Data Scientist': [
    { skillName: 'Python (Pandas, Scikit-learn)', category: 'Language', weight: 95 },
    { skillName: 'Statistical Modeling', category: 'Math', weight: 90 },
    { skillName: 'Machine Learning', category: 'ML', weight: 92 },
    { skillName: 'Data Visualization (Seaborn, Plotly)', category: 'Visualization', weight: 82 },
    { skillName: 'SQL & Database Querying', category: 'Database', weight: 80 },
    { skillName: 'Feature Engineering', category: 'Data', weight: 85 },
    { skillName: 'Deep Learning (TensorFlow/Keras)', category: 'Deep Learning', weight: 78 },
    { skillName: 'Big Data (Spark, Hadoop)', category: 'Big Data', weight: 70 },
  ],
  'AI Prompt Engineer': [
    { skillName: 'Prompt Design & Engineering', category: 'AI', weight: 95 },
    { skillName: 'LLM Understanding (GPT, Claude)', category: 'AI', weight: 92 },
    { skillName: 'Python for AI Scripting', category: 'Language', weight: 80 },
    { skillName: 'Retrieval Augmented Generation (RAG)', category: 'AI', weight: 85 },
    { skillName: 'Fine-tuning & RLHF', category: 'AI', weight: 78 },
    { skillName: 'AI Ethics & Bias Mitigation', category: 'Ethics', weight: 72 },
    { skillName: 'API Integration (OpenAI, Groq)', category: 'API', weight: 88 },
    { skillName: 'Chain-of-Thought Techniques', category: 'AI', weight: 82 },
  ],
  'IoT Engineer': [
    { skillName: 'Embedded C / Python (MicroPython)', category: 'Language', weight: 92 },
    { skillName: 'IoT Protocols (MQTT, CoAP)', category: 'Protocols', weight: 90 },
    { skillName: 'Microcontrollers (ESP32, Raspberry Pi)', category: 'Hardware', weight: 88 },
    { skillName: 'Cloud IoT Platforms (AWS IoT, Azure IoT)', category: 'Cloud', weight: 80 },
    { skillName: 'Sensor Integration', category: 'Hardware', weight: 85 },
    { skillName: 'Edge Computing', category: 'Architecture', weight: 75 },
    { skillName: 'IoT Security', category: 'Security', weight: 78 },
    { skillName: 'Data Streaming & Analytics', category: 'Data', weight: 70 },
  ],
};

// ─── Aptitude Questions (10 per path) ─────────────────────────────────────────
const QUESTIONS = {
  'Web Developer': [
    { question: 'Which HTML tag is used to define an internal style sheet?', optionA: '<style>', optionB: '<css>', optionC: '<script>', optionD: '<link>', correctOption: 'A' },
    { question: 'Which CSS property controls the text size?', optionA: 'font-weight', optionB: 'text-size', optionC: 'font-size', optionD: 'text-style', correctOption: 'C' },
    { question: 'What does DOM stand for?', optionA: 'Document Object Model', optionB: 'Data Object Management', optionC: 'Display Object Mechanism', optionD: 'Document Oriented Module', correctOption: 'A' },
    { question: 'Which JavaScript method is used to select an element by ID?', optionA: 'document.querySelector()', optionB: 'document.getElementById()', optionC: 'document.getElement()', optionD: 'document.selectById()', correctOption: 'B' },
    { question: 'What is the purpose of the `viewport` meta tag in HTML?', optionA: 'Sets the page title', optionB: 'Controls the page layout on mobile browsers', optionC: 'Links external CSS files', optionD: 'Defines the character set', correctOption: 'B' },
    { question: 'Which CSS display value makes elements sit side by side?', optionA: 'block', optionB: 'inline-block', optionC: 'flex', optionD: 'Both B and C', correctOption: 'D' },
    { question: 'What does `async` do to a JavaScript function?', optionA: 'Makes it run synchronously', optionB: 'Makes it return a Promise', optionC: 'Prevents it from running', optionD: 'Removes error handling', correctOption: 'B' },
    { question: 'Which HTTP status code means "Not Found"?', optionA: '200', optionB: '301', optionC: '404', optionD: '500', correctOption: 'C' },
    { question: 'What does CSS Flexbox `justify-content: space-between` do?', optionA: 'Centers items', optionB: 'Distributes items with equal space between them', optionC: 'Aligns items to the top', optionD: 'Stretches items to fill the container', correctOption: 'B' },
    { question: 'Which attribute makes an HTML input field required?', optionA: 'mandatory', optionB: 'required', optionC: 'validate', optionD: 'must-fill', correctOption: 'B' },
  ],
  'Backend Developer': [
    { question: 'Which HTTP method is used to update a resource partially?', optionA: 'PUT', optionB: 'POST', optionC: 'PATCH', optionD: 'DELETE', correctOption: 'C' },
    { question: 'What is middleware in Express.js?', optionA: 'A database connection tool', optionB: 'A function that runs between the request and the response', optionC: 'A front-end rendering engine', optionD: 'A testing framework', correctOption: 'B' },
    { question: 'Which status code indicates a successful resource creation?', optionA: '200', optionB: '201', optionC: '204', optionD: '301', correctOption: 'B' },
    { question: 'What is the purpose of JWT in APIs?', optionA: 'Data compression', optionB: 'Stateless authentication', optionC: 'Database querying', optionD: 'Caching responses', correctOption: 'B' },
    { question: 'What does "stateless" mean in REST APIs?', optionA: 'The server stores session data', optionB: 'Each request contains all information needed; no server-side session', optionC: 'The client has no state', optionD: 'Responses are cached forever', correctOption: 'B' },
    { question: 'What is the role of an ORM?', optionA: 'Optimizes network calls', optionB: 'Maps object-oriented code to relational database tables', optionC: 'Renders HTML templates', optionD: 'Manages file uploads', correctOption: 'B' },
    { question: 'Which database is best suited for storing hierarchical JSON-like documents?', optionA: 'PostgreSQL', optionB: 'MySQL', optionC: 'MongoDB', optionD: 'Redis', correctOption: 'C' },
    { question: 'What does "rate limiting" prevent in an API?', optionA: 'Too many database connections', optionB: 'Abuse by limiting requests per time period per client', optionC: 'Cross-Site Scripting attacks', optionD: 'Slow query execution', correctOption: 'B' },
    { question: 'What is the purpose of environment variables in a Node.js app?', optionA: 'Store UI component state', optionB: 'Configure runtime settings without hardcoding them in source', optionC: 'Define CSS styles', optionD: 'Cache API responses', correctOption: 'B' },
    { question: 'Which command installs all dependencies from package.json?', optionA: 'npm start', optionB: 'npm init', optionC: 'npm install', optionD: 'npm build', correctOption: 'C' },
  ],
  'Full Stack Developer': [
    { question: 'In MERN stack, what does the "E" stand for?', optionA: 'Electron', optionB: 'Express.js', optionC: 'Ember.js', optionD: 'Elastic', correctOption: 'B' },
    { question: 'What is CORS and why is it needed?', optionA: 'A database indexing strategy', optionB: 'A browser security mechanism that restricts cross-origin HTTP requests', optionC: 'A CSS preprocessor', optionD: 'A server-side rendering technique', correctOption: 'B' },
    { question: 'Which React hook manages side effects like API calls?', optionA: 'useState', optionB: 'useRef', optionC: 'useEffect', optionD: 'useCallback', correctOption: 'C' },
    { question: 'What is the purpose of a `.env` file?', optionA: 'Store environment-specific configuration', optionB: 'Define CSS variables', optionC: 'List npm packages', optionD: 'Configure the database schema', correctOption: 'A' },
    { question: 'What does `useState` return in React?', optionA: 'A DOM element', optionB: 'A stateful value and a function to update it', optionC: 'A ref object', optionD: 'A memoized callback', correctOption: 'B' },
    { question: 'Which tool is commonly used to run a Node.js server locally?', optionA: 'Apache', optionB: 'Nginx', optionC: 'nodemon', optionD: 'PM2', correctOption: 'C' },
    { question: 'In MongoDB, what is a "collection" equivalent to in SQL?', optionA: 'A row', optionB: 'A column', optionC: 'A table', optionD: 'A database', correctOption: 'C' },
    { question: 'What is the Virtual DOM in React?', optionA: 'A browser feature', optionB: 'A lightweight copy of the real DOM used to optimize rendering', optionC: 'A server-side rendered HTML template', optionD: 'A CSS grid system', correctOption: 'B' },
    { question: 'Which method is used to make RESTful API calls in modern JavaScript?', optionA: 'XMLHttpRequest()', optionB: 'fetch()', optionC: 'ajax()', optionD: 'request()', correctOption: 'B' },
    { question: 'What does "JWT" stand for?', optionA: 'JSON Web Token', optionB: 'Java Web Transfer', optionC: 'JavaScript Workflow Tool', optionD: 'JSON Wrapper Type', correctOption: 'A' },
  ],
  'Data Analyst': [
    { question: 'Which SQL clause is used to filter grouped data?', optionA: 'WHERE', optionB: 'HAVING', optionC: 'FILTER', optionD: 'GROUP FILTER', correctOption: 'B' },
    { question: 'What does a NULL value represent in a database?', optionA: 'Zero', optionB: 'An empty string', optionC: 'Missing or unknown value', optionD: 'False', correctOption: 'C' },
    { question: 'Which Python library is primarily used for data manipulation?', optionA: 'NumPy', optionB: 'Matplotlib', optionC: 'Pandas', optionD: 'Seaborn', correctOption: 'C' },
    { question: 'What chart type is best for showing distribution of a dataset?', optionA: 'Line chart', optionB: 'Pie chart', optionC: 'Histogram', optionD: 'Scatter plot', correctOption: 'C' },
    { question: 'What does "standard deviation" measure?', optionA: 'The middle value in a dataset', optionB: 'The spread of data around the mean', optionC: 'The most frequent value', optionD: 'The sum of all values', correctOption: 'B' },
    { question: 'Which SQL function counts only non-NULL values in a column?', optionA: 'SUM()', optionB: 'AVG()', optionC: 'COUNT(*)', optionD: 'COUNT(column_name)', correctOption: 'D' },
    { question: 'What is a pivot table used for?', optionA: 'Querying a relational database', optionB: 'Summarizing and reorganizing data for analysis', optionC: 'Creating 3D charts', optionD: 'Running Python scripts', correctOption: 'B' },
    { question: 'Which type of join returns all rows from both tables even if there is no match?', optionA: 'INNER JOIN', optionB: 'LEFT JOIN', optionC: 'FULL OUTER JOIN', optionD: 'CROSS JOIN', correctOption: 'C' },
    { question: 'What is data normalization?', optionA: 'Removing all NULL values', optionB: 'Scaling data to a common range', optionC: 'Aggregating data for reports', optionD: 'Sorting data alphabetically', correctOption: 'B' },
    { question: 'Which Pandas method displays the first 5 rows of a DataFrame?', optionA: 'df.tail()', optionB: 'df.info()', optionC: 'df.head()', optionD: 'df.describe()', correctOption: 'C' },
  ],
  'AI & ML Engineer': [
    { question: 'Which algorithm is used for classification problems?', optionA: 'Linear Regression', optionB: 'K-Means', optionC: 'Logistic Regression', optionD: 'PCA', correctOption: 'C' },
    { question: 'What is overfitting in machine learning?', optionA: 'Model performs well on training data but poorly on unseen data', optionB: 'Model trains too slowly', optionC: 'Model has too few parameters', optionD: 'Model performs well on test data only', correctOption: 'A' },
    { question: 'What does "gradient descent" do?', optionA: 'Visualizes data', optionB: 'Iteratively minimizes the loss function by adjusting model weights', optionC: 'Normalizes the dataset', optionD: 'Splits data into train/test sets', correctOption: 'B' },
    { question: 'Which activation function is commonly used in the output layer for binary classification?', optionA: 'ReLU', optionB: 'Tanh', optionC: 'Sigmoid', optionD: 'Softmax', correctOption: 'C' },
    { question: 'What is a confusion matrix used for?', optionA: 'Visualizing neural network layers', optionB: 'Evaluating classification model performance', optionC: 'Showing data correlations', optionD: 'Reducing model parameters', correctOption: 'B' },
    { question: 'Which Python library is most commonly used for deep learning?', optionA: 'Scikit-learn', optionB: 'Pandas', optionC: 'TensorFlow / PyTorch', optionD: 'Matplotlib', correctOption: 'C' },
    { question: 'What does "feature engineering" mean?', optionA: 'Building neural network architectures', optionB: 'Deploying models to production', optionC: 'Transforming raw data into meaningful input features for models', optionD: 'Selecting the best model', correctOption: 'C' },
    { question: 'What is a hyperparameter?', optionA: 'A parameter learned during training', optionB: 'A configuration set before training that controls model behavior', optionC: 'A data point in the dataset', optionD: 'A layer in a neural network', correctOption: 'B' },
    { question: 'Which technique is used to prevent overfitting by randomly disabling neurons during training?', optionA: 'Batch normalization', optionB: 'L2 regularization', optionC: 'Dropout', optionD: 'Data augmentation', correctOption: 'C' },
    { question: 'What does NLP stand for?', optionA: 'Natural Language Processing', optionB: 'Neural Logic Programming', optionC: 'Network Layer Protocol', optionD: 'Numeric Linear Prediction', correctOption: 'A' },
  ],
  'Cyber Security Specialist': [
    { question: 'What does "SQL Injection" allow an attacker to do?', optionA: 'Crash the web server', optionB: 'Execute arbitrary SQL commands on the database', optionC: 'Steal CSS files', optionD: 'Modify JavaScript', correctOption: 'B' },
    { question: 'What is a "brute force attack"?', optionA: 'Physically breaking into a server room', optionB: 'Trying all possible combinations to crack a password', optionC: 'Sending large amounts of traffic to a server', optionD: 'Intercepting network packets', correctOption: 'B' },
    { question: 'Which encryption type uses the same key for both encryption and decryption?', optionA: 'Asymmetric encryption', optionB: 'Hashing', optionC: 'Symmetric encryption', optionD: 'Public key encryption', correctOption: 'C' },
    { question: 'What is a firewall?', optionA: 'An antivirus software', optionB: 'A network security system that monitors and controls incoming/outgoing traffic', optionC: 'A type of malware', optionD: 'A data backup system', correctOption: 'B' },
    { question: 'What is XSS (Cross-Site Scripting)?', optionA: 'A server misconfiguration', optionB: 'Injecting malicious scripts into web pages viewed by other users', optionC: 'A denial of service attack', optionD: 'A man-in-the-middle attack', correctOption: 'B' },
    { question: 'What does "phishing" involve?', optionA: 'Exploiting software vulnerabilities', optionB: 'Tricking users into revealing sensitive information through deceptive communications', optionC: 'Port scanning', optionD: 'DNS hijacking', correctOption: 'B' },
    { question: 'What is the purpose of a VPN?', optionA: 'Speed up internet connection', optionB: 'Encrypt internet traffic and mask the user\'s IP address', optionC: 'Block malware downloads', optionD: 'Monitor network traffic', correctOption: 'B' },
    { question: 'What is "penetration testing"?', optionA: 'Testing software performance under load', optionB: 'Authorized simulated attack on a system to find vulnerabilities', optionC: 'Testing database queries', optionD: 'Running automated unit tests', correctOption: 'B' },
    { question: 'Which protocol provides secure communication over the internet?', optionA: 'HTTP', optionB: 'FTP', optionC: 'HTTPS (via TLS/SSL)', optionD: 'SMTP', correctOption: 'C' },
    { question: 'What is "two-factor authentication" (2FA)?', optionA: 'Using two different passwords', optionB: 'Verifying identity with two separate authentication methods', optionC: 'Logging in from two devices', optionD: 'Encrypting data twice', correctOption: 'B' },
  ],
  'Software Engineer': [
    { question: 'What is the time complexity of binary search?', optionA: 'O(n)', optionB: 'O(n²)', optionC: 'O(log n)', optionD: 'O(1)', correctOption: 'C' },
    { question: 'What is a stack data structure?', optionA: 'FIFO: First In, First Out', optionB: 'LIFO: Last In, First Out', optionC: 'Random access structure', optionD: 'Priority-based structure', correctOption: 'B' },
    { question: 'What does the "S" in SOLID principles stand for?', optionA: 'Syntax', optionB: 'System', optionC: 'Single Responsibility Principle', optionD: 'Serialization', correctOption: 'C' },
    { question: 'What is the purpose of the "Observer" design pattern?', optionA: 'Caching data', optionB: 'Define a one-to-many dependency so when one object changes, dependents are notified', optionC: 'Managing database connections', optionD: 'Sorting algorithms', correctOption: 'B' },
    { question: 'What is "Big O notation" used for?', optionA: 'Describing software architecture', optionB: 'Measuring the runtime or space complexity of an algorithm', optionC: 'Writing pseudocode', optionD: 'Documenting APIs', correctOption: 'B' },
    { question: 'Which data structure is used to implement BFS (Breadth-First Search)?', optionA: 'Stack', optionB: 'Queue', optionC: 'Tree', optionD: 'Linked List', correctOption: 'B' },
    { question: 'What is polymorphism in OOP?', optionA: 'Using many programming languages', optionB: 'The ability of different objects to be treated as instances of the same class', optionC: 'Hiding internal data', optionD: 'Creating multiple databases', correctOption: 'B' },
    { question: 'What is the difference between a process and a thread?', optionA: 'A thread is heavier than a process', optionB: 'A thread shares memory with other threads in the same process; a process has its own memory', optionC: 'Processes run on the GPU; threads on the CPU', optionD: 'They are the same thing', correctOption: 'B' },
    { question: 'What is unit testing?', optionA: 'Testing the entire application end-to-end', optionB: 'Testing individual functions or components in isolation', optionC: 'Testing performance under load', optionD: 'Integration testing between services', correctOption: 'B' },
    { question: 'Which version control command merges another branch into the current one?', optionA: 'git clone', optionB: 'git rebase', optionC: 'git merge', optionD: 'git pull origin', correctOption: 'C' },
  ],
  'UI/UX Designer': [
    { question: 'What is a wireframe?', optionA: 'A high-fidelity interactive prototype', optionB: 'A low-fidelity schematic showing layout and structure', optionC: 'A finished design with colors and fonts', optionD: 'A user flow diagram', correctOption: 'B' },
    { question: 'What does "affordance" mean in UX design?', optionA: 'The cost of a design project', optionB: 'A design quality that suggests how an element should be used', optionC: 'The time to complete a task', optionD: 'A color theory concept', correctOption: 'B' },
    { question: 'What is the F-pattern in UX?', optionA: 'A way to arrange navigation', optionB: 'The scanning pattern users typically follow when reading web content', optionC: 'A font selection method', optionD: 'A color palette pattern', correctOption: 'B' },
    { question: 'What is A/B testing in UX?', optionA: 'Testing with two different user groups at different times', optionB: 'Comparing two design versions with real users to determine which performs better', optionC: 'Alternating between light and dark modes', optionD: 'Testing two different programming languages', correctOption: 'B' },
    { question: 'What WCAG level is considered the minimum acceptable accessibility standard?', optionA: 'Level A', optionB: 'Level AA', optionC: 'Level AAA', optionD: 'Level B', correctOption: 'B' },
    { question: 'What is a "design system"?', optionA: 'A single Figma file', optionB: 'A collection of reusable components and guidelines ensuring design consistency', optionC: 'A user research document', optionD: 'A project management tool', correctOption: 'B' },
    { question: 'What is the purpose of user personas in UX design?', optionA: 'To define color palettes', optionB: 'To represent target users and guide design decisions based on their needs', optionC: 'To document code specifications', optionD: 'To create marketing campaigns', correctOption: 'B' },
    { question: 'Which principle states that users can only process 7±2 chunks of information at once?', optionA: 'Hick\'s Law', optionB: 'Fitts\'s Law', optionC: 'Miller\'s Law', optionD: 'Jakob\'s Law', correctOption: 'C' },
    { question: 'What is the role of "contrast" in visual design?', optionA: 'Making elements the same color', optionB: 'Creating visual hierarchy and ensuring readability', optionC: 'Reducing the number of elements on screen', optionD: 'Aligning elements to a grid', correctOption: 'B' },
    { question: 'What is "user journey mapping" used for?', optionA: 'Mapping geographic user locations', optionB: 'Visualizing the steps a user takes to accomplish a goal', optionC: 'Documenting database schemas', optionD: 'Charting company revenue', correctOption: 'B' },
  ],
  'QA Tester': [
    { question: 'What is regression testing?', optionA: 'Testing new features only', optionB: 'Re-testing previously passed tests after code changes to ensure nothing broke', optionC: 'Performance testing under load', optionD: 'Static code analysis', correctOption: 'B' },
    { question: 'What is a "test case"?', optionA: 'A bug report', optionB: 'A set of conditions to determine if a feature works as expected', optionC: 'A deployment checklist', optionD: 'A code review comment', correctOption: 'B' },
    { question: 'What is "black box testing"?', optionA: 'Testing with full knowledge of the source code', optionB: 'Testing without knowledge of internal code, focusing only on inputs and outputs', optionC: 'Testing only database interactions', optionD: 'Running tests in a dark environment', correctOption: 'B' },
    { question: 'What does Selenium automate?', optionA: 'Unit tests', optionB: 'Web browser interactions for automated testing', optionC: 'API endpoint testing', optionD: 'Load testing', correctOption: 'B' },
    { question: 'What is the purpose of a "smoke test"?', optionA: 'Testing all edge cases', optionB: 'A quick check to ensure the build is stable enough for further testing', optionC: 'Performance testing under stress', optionD: 'Security vulnerability testing', correctOption: 'B' },
    { question: 'In Agile, during which phase is testing typically performed?', optionA: 'Only after development is complete', optionB: 'Throughout each sprint alongside development', optionC: 'Only in the release phase', optionD: 'Before development starts', correctOption: 'B' },
    { question: 'What is "boundary value analysis"?', optionA: 'Testing only the most common inputs', optionB: 'Testing at the edges of valid input ranges', optionC: 'Testing all possible input combinations', optionD: 'Analyzing code coverage', correctOption: 'B' },
    { question: 'Which tool is commonly used for API testing?', optionA: 'Selenium', optionB: 'JMeter', optionC: 'Postman', optionD: 'Cucumber', correctOption: 'C' },
    { question: 'What does "test coverage" measure?', optionA: 'How many testers are on the team', optionB: 'The percentage of code executed during testing', optionC: 'How many bugs were found', optionD: 'The duration of testing', correctOption: 'B' },
    { question: 'What is a "bug life cycle"?', optionA: 'The time it takes to find a bug', optionB: 'The stages a bug goes through from discovery to closure', optionC: 'The number of bugs in a sprint', optionD: 'The process of writing test cases', correctOption: 'B' },
  ],
  'Mobile App Developer': [
    { question: 'What is the main advantage of React Native over native development?', optionA: 'Better performance than native', optionB: 'Write once, deploy to both iOS and Android', optionC: 'Direct access to all hardware APIs', optionD: 'No need for JavaScript knowledge', correctOption: 'B' },
    { question: 'What is "state management" in mobile apps?', optionA: 'Managing app installations', optionB: 'Handling and sharing application data across components efficiently', optionC: 'Managing device battery state', optionD: 'Controlling network connections', correctOption: 'B' },
    { question: 'What is APK in Android development?', optionA: 'A programming language', optionB: 'Android Package — the installer file format for Android apps', optionC: 'A testing framework', optionD: 'A UI component library', correctOption: 'B' },
    { question: 'What is "deep linking" in mobile apps?', optionA: 'Connecting to a deep database', optionB: 'URLs that navigate users directly to specific content within an app', optionC: 'Linking large files across devices', optionD: 'A network protocol for mobile', correctOption: 'B' },
    { question: 'What does "responsive layout" mean in mobile development?', optionA: 'Fast-loading UI', optionB: 'A layout that adapts to different screen sizes and orientations', optionC: 'A server-rendered interface', optionD: 'An offline-capable app', correctOption: 'B' },
    { question: 'What is the purpose of push notifications?', optionA: 'To upload data to a server', optionB: 'To deliver real-time messages to users even when the app is not open', optionC: 'To push app updates automatically', optionD: 'To sync contacts', correctOption: 'B' },
    { question: 'Which language is used for native iOS development?', optionA: 'Java', optionB: 'Kotlin', optionC: 'Swift', optionD: 'Dart', correctOption: 'C' },
    { question: 'What is Expo in the context of React Native?', optionA: 'A testing tool', optionB: 'A framework and platform that simplifies React Native development', optionC: 'A native UI library', optionD: 'An app store submission tool', correctOption: 'B' },
    { question: 'What is the difference between stateful and stateless widgets?', optionA: 'Stateful widgets are heavier', optionB: 'Stateful widgets can rebuild in response to state changes; stateless cannot', optionC: 'Stateless widgets use more memory', optionD: 'They are the same in Flutter', correctOption: 'B' },
    { question: 'What is "local storage" on a mobile device used for?', optionA: 'Storing remote API data only', optionB: 'Persisting data on the device without a network connection', optionC: 'Caching images from the internet', optionD: 'Managing app permissions', correctOption: 'B' },
  ],
  'Cloud Engineer': [
    { question: 'What does "IaaS" stand for in cloud computing?', optionA: 'Infrastructure as a Service', optionB: 'Integration as a Service', optionC: 'Internet as a Solution', optionD: 'Intelligent Application System', correctOption: 'A' },
    { question: 'What is an S3 bucket in AWS?', optionA: 'A virtual machine', optionB: 'An object storage service for storing files and data', optionC: 'A serverless function', optionD: 'A managed database', correctOption: 'B' },
    { question: 'What is auto-scaling?', optionA: 'Automatically writing code', optionB: 'Automatically adjusting compute resources based on demand', optionC: 'Scaling a database schema', optionD: 'Increasing network bandwidth manually', correctOption: 'B' },
    { question: 'What does IAM stand for in AWS?', optionA: 'Internet Access Management', optionB: 'Identity and Access Management', optionC: 'Infrastructure Access Module', optionD: 'Integrated Application Manager', correctOption: 'B' },
    { question: 'What is a CDN (Content Delivery Network) used for?', optionA: 'Compressing database tables', optionB: 'Distributing content globally to reduce latency', optionC: 'Managing API endpoints', optionD: 'Scaling backend servers', correctOption: 'B' },
    { question: 'What is "serverless computing"?', optionA: 'Running apps without internet', optionB: 'Cloud execution model where the provider manages servers and users only pay per function execution', optionC: 'Running apps on physical hardware only', optionD: 'Eliminating all backend logic', correctOption: 'B' },
    { question: 'What is Terraform used for?', optionA: 'Application monitoring', optionB: 'Infrastructure as Code — provisioning cloud resources declaratively', optionC: 'Container runtime management', optionD: 'Automated testing', correctOption: 'B' },
    { question: 'What is a VPC in cloud computing?', optionA: 'Virtual Private Cloud — an isolated section of the cloud with your own network', optionB: 'Valid Pod Container', optionC: 'Virtual Process Core', optionD: 'Verified Platform Certificate', correctOption: 'A' },
    { question: 'Which service runs containerized applications in Kubernetes on AWS?', optionA: 'EC2', optionB: 'Lambda', optionC: 'EKS (Elastic Kubernetes Service)', optionD: 'RDS', correctOption: 'C' },
    { question: 'What is the benefit of multi-region deployment?', optionA: 'Reduced code complexity', optionB: 'Higher availability and disaster recovery across geographic locations', optionC: 'Lower infrastructure costs', optionD: 'Simpler DNS configuration', correctOption: 'B' },
  ],
  'DevOps Engineer': [
    { question: 'What is a Docker container?', optionA: 'A virtual machine', optionB: 'A lightweight, portable package that includes an app and its dependencies', optionC: 'A cloud storage service', optionD: 'A monitoring agent', correctOption: 'B' },
    { question: 'What is CI/CD?', optionA: 'Code Inspection / Code Delivery', optionB: 'Continuous Integration / Continuous Deployment', optionC: 'Container Infrastructure / Container Deployment', optionD: 'Cloud Integration / Cloud Delivery', correctOption: 'B' },
    { question: 'What is a Kubernetes Pod?', optionA: 'A Docker image', optionB: 'The smallest deployable unit in Kubernetes, housing one or more containers', optionC: 'A Kubernetes cluster', optionD: 'A load balancer', correctOption: 'B' },
    { question: 'What does "infrastructure as code" mean?', optionA: 'Writing app logic in infrastructure languages', optionB: 'Managing and provisioning infrastructure through machine-readable config files', optionC: 'Replacing developers with sysadmins', optionD: 'Automating QA tests', correctOption: 'B' },
    { question: 'What is the purpose of a `.gitlab-ci.yml` or `.github/workflows` file?', optionA: 'Define database schemas', optionB: 'Define CI/CD pipeline stages and jobs', optionC: 'Store environment variables', optionD: 'Configure Docker networking', correctOption: 'B' },
    { question: 'What is Prometheus used for in DevOps?', optionA: 'Container orchestration', optionB: 'Metrics collection and monitoring', optionC: 'Secret management', optionD: 'Log aggregation', correctOption: 'B' },
    { question: 'What does "blue-green deployment" mean?', optionA: 'Deploying to Blue and Green cloud providers', optionB: 'Running two production environments to switch traffic with zero downtime', optionC: 'Coloring server nodes for identification', optionD: 'A Docker networking mode', correctOption: 'B' },
    { question: 'What is the role of an Ansible playbook?', optionA: 'Running load tests', optionB: 'Defining configuration management tasks to automate server setup', optionC: 'Scheduling database backups', optionD: 'Monitoring container health', correctOption: 'B' },
    { question: 'What is a "helm chart" in Kubernetes?', optionA: 'A monitoring dashboard', optionB: 'A package manager for Kubernetes applications', optionC: 'A container security policy', optionD: 'A network topology diagram', correctOption: 'B' },
    { question: 'What is "shift left" in DevOps?', optionA: 'Moving servers to the left rack', optionB: 'Integrating testing and security earlier in the development lifecycle', optionC: 'Shifting traffic from one region to another', optionD: 'Moving deployment to the end of the sprint', correctOption: 'B' },
  ],
  'Database Administrator': [
    { question: 'What is database normalization?', optionA: 'Backing up the database', optionB: 'Organizing data to reduce redundancy and improve integrity', optionC: 'Scaling the database horizontally', optionD: 'Compressing database files', correctOption: 'B' },
    { question: 'What is an index in a database?', optionA: 'A foreign key', optionB: 'A data structure that speeds up data retrieval on a column', optionC: 'A primary key constraint', optionD: 'A backup of a table', correctOption: 'B' },
    { question: 'What does ACID stand for in databases?', optionA: 'Atomicity, Consistency, Isolation, Durability', optionB: 'Application, Code, Integration, Data', optionC: 'Automated, Centralized, Indexed, Dynamic', optionD: 'Authentication, Caching, Indexing, Deletion', correctOption: 'A' },
    { question: 'What is a foreign key?', optionA: 'A key from another database', optionB: 'A field that references the primary key of another table', optionC: 'An encrypted primary key', optionD: 'A key used for external API access', correctOption: 'B' },
    { question: 'What is a stored procedure?', optionA: 'A saved API endpoint', optionB: 'A precompiled set of SQL statements stored in the database', optionC: 'A database backup file', optionD: 'A table constraint', correctOption: 'B' },
    { question: 'What is the purpose of a transaction in SQL?', optionA: 'To speed up queries', optionB: 'To group operations so they either all succeed or all fail', optionC: 'To create new tables', optionD: 'To manage user permissions', correctOption: 'B' },
    { question: 'What does "sharding" mean in databases?', optionA: 'Encrypting sensitive data', optionB: 'Horizontally partitioning data across multiple database instances', optionC: 'Creating database replicas', optionD: 'Compressing database indexes', correctOption: 'B' },
    { question: 'What is the difference between DELETE and TRUNCATE?', optionA: 'TRUNCATE is slower', optionB: 'DELETE removes specific rows and can be rolled back; TRUNCATE removes all rows faster and cannot be rolled back', optionC: 'They are identical', optionD: 'DELETE works only on NoSQL databases', correctOption: 'B' },
    { question: 'What is pg_dump used for in PostgreSQL?', optionA: 'Monitoring performance', optionB: 'Creating a backup of a PostgreSQL database', optionC: 'Running SQL queries', optionD: 'Configuring replication', correctOption: 'B' },
    { question: 'What is a materialized view?', optionA: 'A view that is computed at query time', optionB: 'A precomputed and stored result of a query for performance', optionC: 'A view with row-level security', optionD: 'A view that cannot be updated', correctOption: 'B' },
  ],
  'Network Engineer': [
    { question: 'What does TCP stand for?', optionA: 'Transfer Control Protocol', optionB: 'Transmission Control Protocol', optionC: 'Technical Communication Protocol', optionD: 'Terminal Connection Port', correctOption: 'B' },
    { question: 'What is the purpose of a subnet mask?', optionA: 'Encrypting network traffic', optionB: 'Dividing an IP network into sub-networks', optionC: 'Assigning dynamic IP addresses', optionD: 'Filtering network packets', correctOption: 'B' },
    { question: 'Which protocol resolves IP addresses to MAC addresses?', optionA: 'DNS', optionB: 'DHCP', optionC: 'ARP', optionD: 'ICMP', correctOption: 'C' },
    { question: 'What does a router do?', optionA: 'Connects devices within the same network', optionB: 'Forwards data packets between different networks', optionC: 'Assigns IP addresses to devices', optionD: 'Encrypts network traffic', correctOption: 'B' },
    { question: 'What is BGP used for?', optionA: 'Assigning IP addresses', optionB: 'Routing between different autonomous systems on the internet', optionC: 'Encrypting VPN traffic', optionD: 'Monitoring bandwidth usage', correctOption: 'B' },
    { question: 'What is the default port for HTTPS?', optionA: '80', optionB: '8080', optionC: '443', optionD: '22', correctOption: 'C' },
    { question: 'What is NAT (Network Address Translation)?', optionA: 'A type of firewall', optionB: 'A method to map private IP addresses to a public IP address', optionC: 'A routing algorithm', optionD: 'A network monitoring tool', correctOption: 'B' },
    { question: 'What is the OSI model?', optionA: 'A software architecture pattern', optionB: 'A 7-layer conceptual framework for how network communication works', optionC: 'An internet service provider standard', optionD: 'A wireless networking protocol', correctOption: 'B' },
    { question: 'What does VLAN stand for?', optionA: 'Very Local Area Network', optionB: 'Virtual Local Area Network', optionC: 'Virtual Link Access Node', optionD: 'Verified LAN Architecture', correctOption: 'B' },
    { question: 'What is a DMZ (Demilitarized Zone) in networking?', optionA: 'An area with no internet access', optionB: 'A network segment that sits between the internal network and the internet, hosting public-facing services', optionC: 'A type of VPN tunnel', optionD: 'A wireless access point', correctOption: 'B' },
  ],
  'System Administrator': [
    { question: 'What command lists files and directories in Linux?', optionA: 'dir', optionB: 'ls', optionC: 'list', optionD: 'show', correctOption: 'B' },
    { question: 'What does `chmod 755` do to a file in Linux?', optionA: 'Deletes the file', optionB: 'Gives owner full permissions, and group/others read + execute permissions', optionC: 'Makes the file read-only', optionD: 'Changes the file ownership', correctOption: 'B' },
    { question: 'What is cron used for in Linux?', optionA: 'Managing user accounts', optionB: 'Scheduling automated tasks at specified times', optionC: 'Monitoring CPU usage', optionD: 'Managing disk partitions', correctOption: 'B' },
    { question: 'What does SSH stand for?', optionA: 'Secure Shell', optionB: 'System Shell Handler', optionC: 'Secure Shared Host', optionD: 'System Security Hub', correctOption: 'A' },
    { question: 'What is the purpose of `/etc/hosts` in Linux?', optionA: 'Storing user passwords', optionB: 'Mapping hostnames to IP addresses locally before DNS resolution', optionC: 'Configuring network interfaces', optionD: 'Defining system environment variables', correctOption: 'B' },
    { question: 'What does the `top` command do in Linux?', optionA: 'Shows folder hierarchy', optionB: 'Displays real-time running processes and resource usage', optionC: 'Lists installed packages', optionD: 'Shows disk usage', correctOption: 'B' },
    { question: 'What is the purpose of Active Directory?', optionA: 'Managing web server configurations', optionB: 'Centralized identity and access management for Windows networks', optionC: 'Routing network traffic', optionD: 'Monitoring server performance', correctOption: 'B' },
    { question: 'What does RAID 1 do?', optionA: 'Stripes data across multiple disks for speed', optionB: 'Mirrors data across two disks for redundancy', optionC: 'Combines stripping and parity for fault tolerance', optionD: 'Stores data on a single disk', correctOption: 'B' },
    { question: 'What is the purpose of a sudoers file in Linux?', optionA: 'Storing system logs', optionB: 'Defining which users can run commands with elevated privileges', optionC: 'Configuring network settings', optionD: 'Managing cron jobs', correctOption: 'B' },
    { question: 'What command shows disk usage in Linux?', optionA: 'du -sh', optionB: 'ls -l', optionC: 'ps aux', optionD: 'cat /proc/cpu', correctOption: 'A' },
  ],
  'Game Developer': [
    { question: 'What is a game loop?', optionA: 'A bug that causes infinite repetition', optionB: 'The core cycle that updates game state and renders frames continuously', optionC: 'A level design concept', optionD: 'A scripting language feature', correctOption: 'B' },
    { question: 'What is a sprite in 2D game development?', optionA: 'A type of shader', optionB: 'A 2D image or animation used to represent game objects', optionC: 'A physics engine', optionD: 'A sound effect', correctOption: 'B' },
    { question: 'What does "frame rate" (FPS) mean in games?', optionA: 'Frames of animation in a sprite', optionB: 'The number of frames rendered per second, determining smoothness', optionC: 'The number of players per session', optionD: 'The file size per frame', correctOption: 'B' },
    { question: 'What is a "collider" in Unity?', optionA: 'A rendering component', optionB: 'An invisible shape that defines the physical boundary for collision detection', optionC: 'A shader for visual effects', optionD: 'An animation controller', correctOption: 'B' },
    { question: 'What is a "prefab" in Unity?', optionA: 'A pre-built shader', optionB: 'A reusable template for game objects that can be instantiated multiple times', optionC: 'A type of animation', optionD: 'A physics component', correctOption: 'B' },
    { question: 'What is the role of a game physics engine?', optionA: 'Rendering 3D graphics', optionB: 'Simulating realistic physical interactions like gravity, collision, and motion', optionC: 'Managing audio playback', optionD: 'Scripting NPC behavior', correctOption: 'B' },
    { question: 'What does "LOD" (Level of Detail) mean in game development?', optionA: 'The difficulty level of a game', optionB: 'Reducing mesh complexity of distant objects to improve performance', optionC: 'The number of levels in a game', optionD: 'A lighting technique', correctOption: 'B' },
    { question: 'What language does Unity primarily use for scripting?', optionA: 'Java', optionB: 'Python', optionC: 'C#', optionD: 'Lua', correctOption: 'C' },
    { question: 'What is a "shader" in game development?', optionA: 'A sound processing program', optionB: 'A program that determines how pixels and vertices are rendered on the GPU', optionC: 'A collision detection algorithm', optionD: 'A game design document', correctOption: 'B' },
    { question: 'What is "pathfinding" in games?', optionA: 'Finding cheat codes', optionB: 'An algorithm that allows characters to navigate around obstacles to reach a target', optionC: 'A network routing technique', optionD: 'A level design process', correctOption: 'B' },
  ],
  'Blockchain Developer': [
    { question: 'What is a blockchain?', optionA: 'A type of database managed by a single company', optionB: 'A distributed, immutable ledger of transactions shared across a network', optionC: 'A cryptographic hashing algorithm', optionD: 'A programming language for finance', correctOption: 'B' },
    { question: 'What is a smart contract?', optionA: 'A contract signed digitally', optionB: 'Self-executing code deployed on the blockchain that runs automatically when conditions are met', optionC: 'An encrypted PDF contract', optionD: 'A multi-party payment agreement', correctOption: 'B' },
    { question: 'What language is primarily used to write Ethereum smart contracts?', optionA: 'Python', optionB: 'JavaScript', optionC: 'Solidity', optionD: 'C++', correctOption: 'C' },
    { question: 'What is a "wallet" in blockchain?', optionA: 'A physical storage device', optionB: 'Software that stores cryptographic keys for accessing blockchain accounts', optionC: 'A banking app', optionD: 'A smart contract repository', correctOption: 'B' },
    { question: 'What is "Proof of Work"?', optionA: 'A method to verify employee credentials', optionB: 'A consensus mechanism where miners solve computational puzzles to validate transactions', optionC: 'A blockchain privacy feature', optionD: 'A smart contract deployment process', correctOption: 'B' },
    { question: 'What is a "gas fee" in Ethereum?', optionA: 'A fee for running Ethereum nodes', optionB: 'The computational cost paid to process transactions and run smart contracts on Ethereum', optionC: 'A cryptocurrency exchange fee', optionD: 'A fee for purchasing Ether', correctOption: 'B' },
    { question: 'What does DeFi stand for?', optionA: 'Decentralized Finance', optionB: 'Digital File Infrastructure', optionC: 'Defined Financial Index', optionD: 'Distributed Fiat Integration', correctOption: 'A' },
    { question: 'What is an NFT?', optionA: 'A new funding token', optionB: 'A Non-Fungible Token — a unique digital asset verified on a blockchain', optionC: 'A network file transfer protocol', optionD: 'A smart contract standard', correctOption: 'B' },
    { question: 'What tool is used to develop and test Ethereum smart contracts locally?', optionA: 'Node.js', optionB: 'Truffle / Hardhat', optionC: 'Django', optionD: 'Docker', correctOption: 'B' },
    { question: 'What is a "51% attack"?', optionA: 'Stealing 51% of a company\'s tokens', optionB: 'When a single entity controls more than half of the network\'s mining power, enabling transaction manipulation', optionC: 'A hacking technique on smart contracts', optionD: 'A blockchain governance vote', correctOption: 'B' },
  ],
  'Data Scientist': [
    { question: 'What is the bias-variance tradeoff?', optionA: 'A tradeoff between model accuracy and training speed', optionB: 'The balance between underfitting (high bias) and overfitting (high variance)', optionC: 'A tradeoff between data size and model complexity', optionD: 'A tradeoff between precision and recall', correctOption: 'B' },
    { question: 'What is cross-validation used for?', optionA: 'Checking data for missing values', optionB: 'Evaluating model performance on unseen data to prevent overfitting', optionC: 'Validating user input in web forms', optionD: 'Comparing two versions of a machine learning algorithm', correctOption: 'B' },
    { question: 'What does "precision" measure in a classification model?', optionA: 'How many actual positives were correctly identified', optionB: 'Of all predicted positives, how many were actually positive', optionC: 'Overall accuracy of the model', optionD: 'The model\'s training time', correctOption: 'B' },
    { question: 'What is principal component analysis (PCA) used for?', optionA: 'Classification of images', optionB: 'Dimensionality reduction while preserving variance', optionC: 'Training neural networks faster', optionD: 'Feature selection via regularization', correctOption: 'B' },
    { question: 'What is an ROC curve?', optionA: 'A graph of model training loss over time', optionB: 'A plot of true positive rate vs false positive rate at various classification thresholds', optionC: 'A measure of data distribution', optionD: 'A visualization of decision tree splits', correctOption: 'B' },
    { question: 'What is "ensemble learning"?', optionA: 'Training a model on multiple GPUs', optionB: 'Combining multiple models to produce better predictions than any single model', optionC: 'Using the same model on multiple datasets', optionD: 'Mixing supervised and unsupervised learning', correctOption: 'B' },
    { question: 'What does "SMOTE" address in machine learning?', optionA: 'Model complexity', optionB: 'Class imbalance by synthetically generating minority class samples', optionC: 'Slow training speed', optionD: 'Missing feature values', correctOption: 'B' },
    { question: 'What is a random forest?', optionA: 'A decision tree with random features', optionB: 'An ensemble of decision trees trained on random subsets of data', optionC: 'A natural language model', optionD: 'A clustering algorithm', correctOption: 'B' },
    { question: 'What is the purpose of train/test split?', optionA: 'To speed up model training', optionB: 'To evaluate model performance on data it has never seen during training', optionC: 'To reduce data preprocessing time', optionD: 'To balance class distribution', correctOption: 'B' },
    { question: 'What library provides `train_test_split` in Python?', optionA: 'Pandas', optionB: 'NumPy', optionC: 'Scikit-learn', optionD: 'TensorFlow', correctOption: 'C' },
  ],
  'AI Prompt Engineer': [
    { question: 'What is "prompt engineering"?', optionA: 'Building hardware for AI systems', optionB: 'Designing and refining input prompts to get desired outputs from AI language models', optionC: 'Training machine learning models', optionD: 'Writing AI system code in Python', correctOption: 'B' },
    { question: 'What is "zero-shot prompting"?', optionA: 'Prompting without any examples', optionB: 'Using zero tokens in a prompt', optionC: 'Prompting with maximum context length', optionD: 'A technique to reduce hallucinations', correctOption: 'A' },
    { question: 'What is "few-shot prompting"?', optionA: 'Limiting token output', optionB: 'Providing a small number of examples in the prompt to guide model behavior', optionC: 'Running the model for fewer iterations', optionD: 'Prompting with lower temperature', correctOption: 'B' },
    { question: 'What does "temperature" control in an LLM?', optionA: 'The computational heat of the GPU', optionB: 'The randomness/creativity of model outputs', optionC: 'The speed of inference', optionD: 'The length of the response', correctOption: 'B' },
    { question: 'What is "hallucination" in the context of LLMs?', optionA: 'Visual distortions in image generation', optionB: 'When a model generates confident but factually incorrect information', optionC: 'Slow model response times', optionD: 'Token limit exceeded errors', correctOption: 'B' },
    { question: 'What is RAG (Retrieval Augmented Generation)?', optionA: 'A way to train smaller models', optionB: 'Combining a retrieval system with an LLM to provide factual, up-to-date answers', optionC: 'A prompt compression technique', optionD: 'A method to reduce inference costs', correctOption: 'B' },
    { question: 'What is the "system prompt" in an LLM API?', optionA: 'Server configuration instructions', optionB: 'Instructions that define the model\'s role, behavior, and constraints for the entire conversation', optionC: 'The first user message in a chat', optionD: 'API authentication credentials', correctOption: 'B' },
    { question: 'What does "chain-of-thought prompting" do?', optionA: 'Links multiple API calls together', optionB: 'Encourages the model to reason step-by-step before giving a final answer', optionC: 'Chains multiple prompts into a single token', optionD: 'Reduces the length of model responses', correctOption: 'B' },
    { question: 'What is a "token" in the context of LLMs?', optionA: 'A security access key', optionB: 'A unit of text (word or sub-word) that the model processes', optionC: 'A cryptocurrency used to pay for AI', optionD: 'A model parameter', correctOption: 'B' },
    { question: 'What is "fine-tuning" an LLM?', optionA: 'Adjusting inference temperature', optionB: 'Further training a pretrained model on a specific dataset to specialize its behavior', optionC: 'Optimizing prompt length', optionD: 'Selecting the best model architecture', correctOption: 'B' },
  ],
  'IoT Engineer': [
    { question: 'What does IoT stand for?', optionA: 'Internet of Technology', optionB: 'Internet of Things', optionC: 'Integration of Technology', optionD: 'Interconnected Operating Terminals', correctOption: 'B' },
    { question: 'What protocol is most commonly used for IoT messaging?', optionA: 'HTTP', optionB: 'FTP', optionC: 'MQTT', optionD: 'SMTP', correctOption: 'C' },
    { question: 'What is an ESP32?', optionA: 'A cloud computing service', optionB: 'A low-cost microcontroller with WiFi and Bluetooth for IoT projects', optionC: 'A type of IoT protocol', optionD: 'A sensor for measuring pressure', correctOption: 'B' },
    { question: 'What is "edge computing" in IoT?', optionA: 'Computing done at data centers', optionB: 'Processing data near the source (device/edge) instead of a central cloud server', optionC: 'A network security feature', optionD: 'A type of wireless protocol', correctOption: 'B' },
    { question: 'What is a "digital twin"?', optionA: 'A backup copy of a database', optionB: 'A virtual replica of a physical device or system used for monitoring and simulation', optionC: 'Two identical IoT sensors', optionD: 'A redundant server setup', correctOption: 'B' },
    { question: 'What does "OTA" mean in IoT?', optionA: 'One Time Authentication', optionB: 'Over-The-Air update — delivering firmware updates wirelessly to devices', optionC: 'Optional Terminal Access', optionD: 'Output Transfer Adapter', correctOption: 'B' },
    { question: 'Which communication protocol is used for short-range, low-power IoT devices?', optionA: 'WiFi', optionB: 'Bluetooth Low Energy (BLE)', optionC: 'Ethernet', optionD: '5G', correctOption: 'B' },
    { question: 'What is a sensor in an IoT system?', optionA: 'A processing unit', optionB: 'A device that detects physical properties and converts them to digital signals', optionC: 'A network gateway', optionD: 'A cloud dashboard', correctOption: 'B' },
    { question: 'What is a "gateway" in IoT architecture?', optionA: 'A cloud storage service', optionB: 'A device that bridges IoT devices and the internet/cloud', optionC: 'A sensor node', optionD: 'An OTA server', correctOption: 'B' },
    { question: 'What security concern is critical in IoT deployments?', optionA: 'UI design consistency', optionB: 'Device authentication, encryption, and firmware security to prevent unauthorized access', optionC: 'Database normalization', optionD: 'Network bandwidth costs', correctOption: 'B' },
  ],
};

// ─── Tutorials (3 per path) ───────────────────────────────────────────────────
const TUTORIALS = {
  'Web Developer': [
    { title: 'HTML & CSS Full Course for Beginners', url: 'https://www.youtube.com/watch?v=qz0aGYrrlhU', summary: 'Complete HTML and CSS fundamentals for building modern websites.' },
    { title: 'JavaScript Full Course', url: 'https://www.youtube.com/watch?v=jS4aFq5-91M', summary: 'Master JavaScript from scratch with practical examples.' },
    { title: 'React.js Full Course 2024', url: 'https://www.youtube.com/watch?v=CgkZ7MvWUAA', summary: 'Build modern UIs with React hooks and component architecture.' },
  ],
  'Backend Developer': [
    { title: 'Node.js and Express Full Course', url: 'https://www.youtube.com/watch?v=Oe421EPjeBE', summary: 'Build REST APIs with Node.js, Express, and MongoDB.' },
    { title: 'REST API Design Best Practices', url: 'https://www.youtube.com/watch?v=7nm1pYuKAhY', summary: 'Learn industry-standard REST API design patterns and conventions.' },
    { title: 'JWT Authentication Tutorial', url: 'https://www.youtube.com/watch?v=mbsmsi7l3r4', summary: 'Implement secure JWT-based authentication in your backend.' },
  ],
  'Full Stack Developer': [
    { title: 'MERN Stack Full Course', url: 'https://www.youtube.com/watch?v=mrHNSanmqQ4', summary: 'Build a complete full stack app with MongoDB, Express, React, Node.' },
    { title: 'React + Node.js Authentication', url: 'https://www.youtube.com/watch?v=9jld3M8tGGY', summary: 'Implement full stack auth with JWT, bcrypt, and React context.' },
    { title: 'Docker for Full Stack Developers', url: 'https://www.youtube.com/watch?v=Kyx2PsuwomE', summary: 'Containerize your full stack app for consistent deployments.' },
  ],
  'Data Analyst': [
    { title: 'Pandas Full Tutorial for Data Analysis', url: 'https://www.youtube.com/watch?v=vmEHCJofslg', summary: 'Master Pandas for data manipulation, cleaning, and analysis.' },
    { title: 'SQL for Data Analysis', url: 'https://www.youtube.com/watch?v=HXV3zeQKqGY', summary: 'Write powerful SQL queries for analytical workloads.' },
    { title: 'Tableau for Beginners', url: 'https://www.youtube.com/watch?v=TPMlZxRRaBQ', summary: 'Create interactive dashboards and visualizations in Tableau.' },
  ],
  'AI & ML Engineer': [
    { title: 'Machine Learning Course - Stanford (Andrew Ng)', url: 'https://www.youtube.com/watch?v=PPLop4L2eGk', summary: 'The gold standard ML course covering supervised and unsupervised learning.' },
    { title: 'PyTorch for Deep Learning - Full Course', url: 'https://www.youtube.com/watch?v=c36lUUr864M', summary: 'Build and train deep neural networks using PyTorch.' },
    { title: 'NLP with Transformers (HuggingFace)', url: 'https://www.youtube.com/watch?v=00GKzGyWFEs', summary: 'Apply state-of-the-art NLP models using HuggingFace Transformers.' },
  ],
  'Cyber Security Specialist': [
    { title: 'Ethical Hacking Full Course', url: 'https://www.youtube.com/watch?v=fNzpcB7ODxQ', summary: 'Learn ethical hacking, penetration testing, and security fundamentals.' },
    { title: 'Network Security Tutorial', url: 'https://www.youtube.com/watch?v=E03gh1zufl8', summary: 'Understand firewalls, IDS/IPS, VPNs, and secure network design.' },
    { title: 'Web Application Security (OWASP Top 10)', url: 'https://www.youtube.com/watch?v=t0F7fe5Alwg', summary: 'Protect web apps from the most critical security vulnerabilities.' },
  ],
  'Software Engineer': [
    { title: 'Data Structures and Algorithms Full Course', url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM', summary: 'Master DSA concepts for technical interviews and system design.' },
    { title: 'System Design for Interviews', url: 'https://www.youtube.com/watch?v=i53Gi_K3o7I', summary: 'Design scalable systems: load balancers, databases, caching, and more.' },
    { title: 'Design Patterns Explained', url: 'https://www.youtube.com/watch?v=v9ejT8FO-7I', summary: 'Understand Gang of Four design patterns with practical examples.' },
  ],
  'UI/UX Designer': [
    { title: 'Figma Tutorial for Beginners - Full Course', url: 'https://www.youtube.com/watch?v=FTFaQWZBqQ8', summary: 'Master Figma for UI design, prototyping, and design systems.' },
    { title: 'UX Design Process - Google UX Design', url: 'https://www.youtube.com/watch?v=tMHO40oK4R8', summary: 'Learn user research, wireframing, and usability testing.' },
    { title: 'Design Systems Course', url: 'https://www.youtube.com/watch?v=wIuVvCuiJhU', summary: 'Build and document scalable design systems for products.' },
  ],
  'QA Tester': [
    { title: 'Software Testing Full Course', url: 'https://www.youtube.com/watch?v=sO8eGL6SFsA', summary: 'Learn manual testing, test cases, and bug reporting fundamentals.' },
    { title: 'Selenium WebDriver Tutorial', url: 'https://www.youtube.com/watch?v=j7VZsCCnptM', summary: 'Automate browser testing with Selenium WebDriver in Java.' },
    { title: 'API Testing with Postman', url: 'https://www.youtube.com/watch?v=VywxIQ2ZXw4', summary: 'Test REST APIs effectively using Postman collections and environments.' },
  ],
  'Mobile App Developer': [
    { title: 'React Native Full Course 2024', url: 'https://www.youtube.com/watch?v=0-S5a0eXPoc', summary: 'Build cross-platform mobile apps with React Native and Expo.' },
    { title: 'Flutter & Dart Full Course', url: 'https://www.youtube.com/watch?v=1ukSR1GRtMU', summary: 'Create beautiful mobile apps for iOS and Android using Flutter.' },
    { title: 'Swift for iOS Development', url: 'https://www.youtube.com/watch?v=comQ1-x2a1Q', summary: 'Learn Swift and SwiftUI to build native iOS applications.' },
  ],
  'Cloud Engineer': [
    { title: 'AWS Cloud Practitioner Full Course', url: 'https://www.youtube.com/watch?v=SOTamWNgDKc', summary: 'Get started with AWS core services for the cloud practitioner certification.' },
    { title: 'Terraform Tutorial for Beginners', url: 'https://www.youtube.com/watch?v=7xngnjfIlK4', summary: 'Provision cloud infrastructure as code with Terraform.' },
    { title: 'Kubernetes Full Course', url: 'https://www.youtube.com/watch?v=X48VuDVv0do', summary: 'Master Kubernetes for container orchestration at scale.' },
  ],
  'DevOps Engineer': [
    { title: 'DevOps with Docker and Kubernetes', url: 'https://www.youtube.com/watch?v=Wvf0mBNGjXY', summary: 'Build and deploy containerized applications with Docker and Kubernetes.' },
    { title: 'CI/CD with GitHub Actions', url: 'https://www.youtube.com/watch?v=R8_veQiYBjI', summary: 'Automate your build, test, and deploy pipeline using GitHub Actions.' },
    { title: 'Ansible for Beginners', url: 'https://www.youtube.com/watch?v=goclfp6a2IQ', summary: 'Automate server configuration and deployments with Ansible playbooks.' },
  ],
  'Database Administrator': [
    { title: 'PostgreSQL Full Course for Beginners', url: 'https://www.youtube.com/watch?v=qw--VYLpxG4', summary: 'Learn PostgreSQL from scratch including queries, indexes, and optimization.' },
    { title: 'MySQL Performance Tuning', url: 'https://www.youtube.com/watch?v=zIdz98pPJiE', summary: 'Optimize MySQL queries, indexes, and configuration for performance.' },
    { title: 'MongoDB Complete Tutorial', url: 'https://www.youtube.com/watch?v=ExcRbA7fy5o', summary: 'Master MongoDB CRUD, aggregation, and schema design.' },
  ],
  'Network Engineer': [
    { title: 'Networking Fundamentals Full Course', url: 'https://www.youtube.com/watch?v=qiQR5rTSshw', summary: 'TCP/IP, OSI model, routing, switching, and network design.' },
    { title: 'Cisco CCNA Full Course', url: 'https://www.youtube.com/watch?v=rv3QK2UquxM', summary: 'Prepare for CCNA with hands-on routing and switching concepts.' },
    { title: 'Wireshark Full Tutorial', url: 'https://www.youtube.com/watch?v=lb1Dw0elw0Q', summary: 'Capture and analyze network traffic for troubleshooting and security.' },
  ],
  'System Administrator': [
    { title: 'Linux Administration Full Course', url: 'https://www.youtube.com/watch?v=wBp0Rb-ZJak', summary: 'Master Linux system administration for servers and production environments.' },
    { title: 'Bash Scripting Full Course', url: 'https://www.youtube.com/watch?v=tK9Oc6AEnR4', summary: 'Automate system tasks with powerful Bash shell scripts.' },
    { title: 'Windows Server Administration', url: 'https://www.youtube.com/watch?v=pzJ1FZIbupM', summary: 'Set up and manage Windows Server with Active Directory and Group Policy.' },
  ],
  'Game Developer': [
    { title: 'Unity Tutorial for Beginners - Full Course', url: 'https://www.youtube.com/watch?v=gB1F9G0JXOo', summary: 'Build your first 2D and 3D games in Unity with C#.' },
    { title: 'Unreal Engine 5 Beginners Tutorial', url: 'https://www.youtube.com/watch?v=k-zMkzmduqI', summary: 'Create stunning games with Unreal Engine 5 and Blueprints.' },
    { title: 'Game Design Fundamentals', url: 'https://www.youtube.com/watch?v=G8AT01tuyrk', summary: 'Learn core game design principles, mechanics, and player psychology.' },
  ],
  'Blockchain Developer': [
    { title: 'Solidity & Ethereum Full Course', url: 'https://www.youtube.com/watch?v=M576WGiDBdQ', summary: 'Write and deploy smart contracts on Ethereum using Solidity.' },
    { title: 'Web3.js Full Tutorial', url: 'https://www.youtube.com/watch?v=t3wM5903ty0', summary: 'Build decentralized applications interacting with the Ethereum blockchain.' },
    { title: 'Hardhat Tutorial for DApp Development', url: 'https://www.youtube.com/watch?v=9Qpi80dQsGU', summary: 'Set up a professional Ethereum development environment with Hardhat.' },
  ],
  'Data Scientist': [
    { title: 'Python for Data Science Full Course', url: 'https://www.youtube.com/watch?v=LHBE6Q9XlzI', summary: 'Learn Python, NumPy, Pandas, and Matplotlib for data science workflows.' },
    { title: 'Scikit-learn Machine Learning Tutorial', url: 'https://www.youtube.com/watch?v=0B5eIE_1vpU', summary: 'Apply classification, regression, and clustering with Scikit-learn.' },
    { title: 'Statistical Analysis with Python', url: 'https://www.youtube.com/watch?v=VCKkO9bI9fs', summary: 'Master statistics and hypothesis testing for data science.' },
  ],
  'AI Prompt Engineer': [
    { title: 'Prompt Engineering Guide - Full Course', url: 'https://www.youtube.com/watch?v=dOxUroR57xs', summary: 'Master techniques for crafting effective prompts for LLMs like GPT-4.' },
    { title: 'LangChain Full Course for Beginners', url: 'https://www.youtube.com/watch?v=lG7Uxts9SXs', summary: 'Build LLM-powered applications with LangChain and OpenAI.' },
    { title: 'RAG (Retrieval Augmented Generation) Tutorial', url: 'https://www.youtube.com/watch?v=sVcwVQRHIc8', summary: 'Build AI systems that retrieve and use real data to reduce hallucinations.' },
  ],
  'IoT Engineer': [
    { title: 'Arduino Full Course for Beginners', url: 'https://www.youtube.com/watch?v=09zfRaLEasY', summary: 'Learn embedded programming and hardware interfacing with Arduino.' },
    { title: 'Raspberry Pi IoT Projects', url: 'https://www.youtube.com/watch?v=RpseX2ylEuw', summary: 'Build real IoT projects using Raspberry Pi and Python.' },
    { title: 'MQTT Protocol Tutorial for IoT', url: 'https://www.youtube.com/watch?v=EIxdz-2rhLs', summary: 'Use MQTT for lightweight IoT messaging between devices and the cloud.' },
  ],
};

// ─── Main Seeder ──────────────────────────────────────────────────────────────
async function main() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-talent');
  console.log('Connected to MongoDB\n');

  // Step 1: Ensure all 20 paths exist
  console.log('--- Step 1: Ensuring 20 career paths ---');
  const pathMap = {};
  for (const p of ALL_PATHS) {
    let existing = await CareerPath.findOne({ name: p.name });
    if (!existing) {
      existing = await CareerPath.create(p);
      console.log(`  Created: ${p.name}`);
    } else {
      console.log(`  Exists:  ${p.name}`);
    }
    pathMap[p.name] = existing._id;
  }

  // Step 2: Seed skills for any path missing them
  console.log('\n--- Step 2: Seeding missing skills ---');
  for (const [pathName, skills] of Object.entries(SKILLS)) {
    const pathId = pathMap[pathName];
    if (!pathId) continue;
    const count = await Skill.countDocuments({ careerPath: pathId });
    if (count === 0) {
      await Skill.insertMany(skills.map(s => ({ ...s, careerPath: pathId })));
      console.log(`  Added ${skills.length} skills for: ${pathName}`);
    } else {
      console.log(`  Skills exist for: ${pathName} (${count})`);
    }
  }

  // Step 3: Seed aptitude questions (10 per path)
  console.log('\n--- Step 3: Seeding aptitude questions ---');
  for (const [pathName, questions] of Object.entries(QUESTIONS)) {
    const pathId = pathMap[pathName];
    if (!pathId) { console.log(`  Path not found: ${pathName}`); continue; }
    const count = await AptitudeQuestion.countDocuments({ careerPath: pathId });
    if (count === 0) {
      await AptitudeQuestion.insertMany(questions.map(q => ({ ...q, careerPath: pathId })));
      console.log(`  Added ${questions.length} questions for: ${pathName}`);
    } else {
      console.log(`  Questions exist for: ${pathName} (${count})`);
    }
  }

  // Step 4: Seed tutorials (3 per path)
  console.log('\n--- Step 4: Seeding tutorials ---');
  for (const [pathName, tutorials] of Object.entries(TUTORIALS)) {
    const pathId = pathMap[pathName];
    if (!pathId) { console.log(`  Path not found: ${pathName}`); continue; }
    const count = await Tutorial.countDocuments({ careerPath: pathId });
    if (count === 0) {
      await Tutorial.insertMany(tutorials.map(t => ({ ...t, careerPath: pathId })));
      console.log(`  Added ${tutorials.length} tutorials for: ${pathName}`);
    } else {
      console.log(`  Tutorials exist for: ${pathName} (${count})`);
    }
  }

  // Summary
  const [totalPaths, totalSkills, totalQ, totalT] = await Promise.all([
    CareerPath.countDocuments(),
    Skill.countDocuments(),
    AptitudeQuestion.countDocuments(),
    Tutorial.countDocuments()
  ]);
  console.log(`\nDone! DB now has: ${totalPaths} paths, ${totalSkills} skills, ${totalQ} questions, ${totalT} tutorials`);
  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
