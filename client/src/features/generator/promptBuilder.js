// =============================================
// PROMPT BUILDER — buildPrompt()
// All prompt template logic, boilerplate helpers,
// difficulty rules, and variety arrays.
// Extracted from main.js L1810-2177
// =============================================

export function getBoilerplate(lang) {
  const l = lang.toLowerCase();
  if (l.includes('python')) return 'def solution(input_data):\n    # Write your logic here\n    pass';
  if (l.includes('java')) return 'public class Solution {\n    public static void main(String[] args) {\n        // Read from stdin and output result\n    }\n}';
  if (l.includes('cpp') || l.includes('c++')) return '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Solution code\n    return 0;\n}';
  if (l.includes('sql')) return '-- Write your SQL query here\nSELECT * FROM table;';
  if (l.includes('javascript')) return 'function solution(input) {\n    // Implement logic\n    return null;\n}';
  if (l.includes('php')) return '<?php\n\nfunction solution($input) {\n    // Logic here\n}';
  return '// Starter code template\nfunction solution(input) {\n}';
}

export function getDifficultyRule(diff, cat) {
  const base = {
    easy: "STRICT EASY: Focus on 101-level concepts. Avoid complex nesting or abstract theories. Scenarios should be single-variable and direct.",
    medium: "STRICT MEDIUM: Scenarios should involve professional tradeoffs, modular thinking, and handling of standard edge cases (missing data, large inputs).",
    hard: "STRICT HARD: Deep-dive into architectural bottlenecks, extreme edge cases, and high-concurrency or low-latency constraints. Require synthesizing multiple advanced patterns."
  }[diff] || "";

  if (cat === 'dsa') return `${base} MANDATORY: Explicitly mention Space/Time complexity requirements.`;
  if (cat === 'frameworks') return `${base} MANDATORY: Focus on the framework's internal lifecycle and performance patterns.`;
  return base;
}

export function buildPrompt(topic, type, difficulty, count, category, subtopic, smeName) {
  const isMcq = type === 'mcq';

  const difficultyContext = {
    easy: 'Objective: Foundational mastery. Difficulty: O(1) or O(N). Focus on basic syntax, elementary control flow, and standard library usage.',
    medium: 'Objective: Engineering proficiency. Difficulty: O(N) or O(N log N). Focus on data structures (Trees, Linked Lists, HashMaps), intermediate algorithms, and modular design.',
    hard: 'Objective: Architectural excellence. Difficulty: O(log N) or niche optimal solutions. Focus on advanced DP, Graph theory, concurrency, low-level optimizations, and complex system design.'
  }[difficulty] || 'General technical excellence';

  const isFramework = (category === 'stacks' || category === 'frameworks' || ['react', 'angular', 'vue', 'next', 'django', 'flask', 'spring', 'express', 'laravel', 'rails', 'stack', 'framework'].some(f => topic.toLowerCase().includes(f)));

  const industries = ['FinTech (Banking, Trading)', 'HealthTech (Telemedicine, Records)', 'E-commerce (Marketplaces, B2B)', 'Cybersecurity (Threat Detection)', 'GameDev (Multiplayer, Physics)', 'SaaS (ERP, CRM Systems)', 'EdTech (LMS, Learning Analytics)', 'Logistics (Supply Chain, Fleet)', 'Robotics (Control, Computer Vision)', 'Web3 (DeFi, DAOs)', 'AI/ML (Large Language Models, Gen AI)', 'GreenTech (Energy Monitoring)', 'SpaceTech (Satellite Data)', 'AgriTech (Precision Farming)', 'GovTech (Public Services)', 'SocialMedia (Content Feeds, Graph)', 'AdTech (Real-time Bidding)', 'AutoTech (Autonomous Driving)', 'TravelTech (Booking Engines)', 'FoodTech (Delivery Logistics)'];
  const perspectives = ['Performance-obsessed Tech Lead', 'Security-first Cloud Architect', 'Developer Experience (DX) Advocate', 'Scalability Engineer', 'Budget-conscious Startup CTO', 'Legacy System Modernization Specialist', 'Accessibility Expert (WCAG)', 'Machine Learning Engineer', 'SRE / DevOps Lead', 'Open Source Maintainer', 'Data Integrity Specialist', 'Microservices Expert'];
  const focuses = ['Edge Cases & Error Handling', 'Memory Efficiency & Footprint', 'Maintainability & Clean Code', 'Security & Input Sanitization', 'High-throughput Scalability', 'Advanced Design Patterns', 'Unit Testing Coverage & Quality', 'Cross-browser / Platform Compatibility', 'Network Latency & Optimization', 'State Management Efficiency', 'Concurrency & Race Conditions', 'Schema / Typings Robustness'];
  const taskTypes = ['Bug Fix / Debugging (Finding the Root Cause)', 'Feature Implementation From Scratch', 'Performance Optimization / Refactoring (O-notation improvement)', 'Data Processing / Transformation Pipelines', 'Security Hardening (Encryption, Auth)', 'Architecture Setup (Modular Design)', 'API Integration (Third-party, Internal)', 'UI/UX Polish (Animations, Responsiveness)', 'Database Schema Migration', 'Micro-interaction Implementation'];
  const complexityModifiers = ["Include an additional constraint regarding time complexity.", "Add a requirement for a specific design pattern to be mentioned in the strategy.", "Describe a specific error scenario that must be handled.", "Frame the input as a stream of data rather than a static list.", "Assume the environment has strictly limited memory (e.g., 64MB)."];

  const flavour = industries[Math.floor(Math.random() * industries.length)];
  const persona = perspectives[Math.floor(Math.random() * perspectives.length)];
  const techFocus = focuses[Math.floor(Math.random() * focuses.length)];
  const challengeType = taskTypes[Math.floor(Math.random() * taskTypes.length)];
  const modifier = complexityModifiers[Math.floor(Math.random() * complexityModifiers.length)];
  const variationId = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;

  const diffRule = getDifficultyRule(difficulty, category);
  const categoryRules = {
    'languages': "Focus on language-specific syntax, standard library features, memory management, and idiomatic patterns.",
    'subjects': "Focus on core computer science foundations like Operating Systems, DBMS, Computer Networks, or Software Engineering.",
    'stacks': "Focus on full-stack integration, environment configuration, database connectivity, and end-to-end data flow.",
    'frameworks': "Focus on framework-specific lifecycles, component design, state management, and production-level best practices."
  }[category] || "Focus on professional technical standards and real-world application.";

  if (isMcq) {
    return `Your Persona: ${persona}. 
Topic: "${topic}". 
Industry Focus: ${flavour}. 
Technical Emphasis: ${techFocus}.
VARIATION ID: ${variationId}.

Generate ${count} MCQ questions. REQUIREMENTS:
- CATEGORY ALIGNMENT: This is for the "${category.toUpperCase()}" category. ${categoryRules}
- DIFFICULTY CALIBRATION: ${diffRule}
- Use your Persona to influence the wording and scenario.
- Focus on the Technical Emphasis where relevant.
- Technically perfect, zero ambiguity
- Detailed "Smart Explanations" that explain "Why A is right" AND "Why others are wrong"
- Professional tone, similar to AWS/GCP certification exams
- NOVELTY MANDATE: Forbidden to use common "Introduction to [Topic]" questions.
- VARIATION SEED: ${Date.now()}-${Math.random()}-${Math.floor(Math.random() * 1000000)}

Return ONLY a JSON object:
  {
    "questions": [
      {
        "question": "Question text?",
        "options": ["A", "B", "C", "D"],
        "correct": 0,
        "explanation": "Expert walkthrough..."
      }
    ]
  }`;
  }

  // Coding prompt
  if (isFramework) {
    // Framework / stack questions: multi-file project with tree structure
    return `Your Persona: ${persona}.
Context: ${topic}.
Scenario Context: ${flavour}.
Technical Emphasis: ${techFocus}.
Challenge Type: ${challengeType}.
Complexity: ${difficulty.toUpperCase()} (${difficultyContext}). VARIATION ID: ${variationId}.

Generate ${count} MULTI-FILE framework challenge(s). QUALITY STANDARDS:
1. CATEGORY ALIGNMENT: \"${category.toUpperCase()}\" category — ${categoryRules}
2. DESCRIPTION (single Markdown string): Context / Task / Technical Goal sections.
3. EXAMPLES: 2-3 with Input, Output, Detailed Explanation.
4. CONSTRAINTS: Real framework-level technical constraints list.
5. MULTI-FILE STARTER CODE (CRITICAL):
   - Return starterCode as a JSON OBJECT where each key is a relative file path (e.g. "src/app/app.component.ts") and each value is the minimal skeleton code for that file.
   - Include 3-6 real files that a developer would actually edit for this challenge.
   - LOGIC STRIPPING RULE: Only provide class/function/interface signatures with a single TODO comment per function. NO implementation logic.
   - Use correct file extensions for the framework (e.g. .ts for Angular, .jsx for React, .vue for Vue, .py for Django).
6. PROJECT STRUCTURE: A plain-text ASCII tree string showing the full file structure.
7. DIFFICULTY: ${diffRule}
8. COMPLEXITY MODIFIER: ${modifier}
9. VARIATION SEED: ${Date.now()}-${Math.random()}

Return ONLY a JSON object:
  {
    "questions": [
      {
        "title": "Problem Title",
        "description": "Clear Markdown string explaining the full challenge.",
        "starterCode": {
          "src/app/app.component.ts": "import { Component } from '@angular/core';\\n\\n@Component({ selector: 'app-root', templateUrl: './app.component.html' })\\nexport class AppComponent {\\n  // TODO: Implement lifecycle optimization\\n}",
          "src/app/analytics.service.ts": "import { Injectable } from '@angular/core';\\n\\n@Injectable({ providedIn: 'root' })\\nexport class AnalyticsService {\\n  // TODO: Implement data tracking\\n}"
        },
        "projectStructure": "project-root\\n├── src/\\n│   ├── app/\\n│   │   ├── app.component.ts\\n│   │   └── analytics.service.ts\\n│   └── main.ts\\n└── package.json",
        "input": "Input description",
        "output": "Expected output description",
        "examples": [
          { "input": "...", "output": "...", "explanation": "Detailed walkthrough" }
        ],
        "testCases": [
          { "input": "...", "output": "...", "hidden": false },
          { "input": "...", "output": "...", "hidden": true }
        ],
        "timeLimit": "60",
        "constraints": ["Constraint 1", "Constraint 2"],
        "hints": ["Hint 1", "Hint 2"]
      }
    ]
  }`;
  }

  // Default coding prompt for DSA / languages / subjects (single-file)
  return `Your Persona: ${persona}.
Context: ${topic}.
Scenario Context: ${flavour}.
Technical Emphasis: ${techFocus}.
Challenge Type: ${challengeType}.
Complexity: ${difficulty.toUpperCase()} (${difficultyContext}). VARIATION ID: ${variationId}.

Generate ${count} challenge(s). CRYSTAL CLEAR QUALITY STANDARDS:
1. CATEGORY ALIGNMENT: This is for the \"${category.toUpperCase()}\" category. ${categoryRules}
2. PROBLEM DESCRIPTION (STRING ONLY):
  - MUST be a single string using Markdown.
  - Learner should understand EXACTLY what to do from this description alone.
   - Separate into "Context", "Task", and "Technical Goal".
   - Use Markdown strictly (ticks for variable names, bold for emphasis).
3. EXAMPLES (MANDATORY 2-3):
  - Every example MUST have: 'Input', 'Output', and a 'Detailed Explanation' of how the result was derived.
4. CONSTRAINTS (MANDATORY):
  - Provide a technical constraints list (e.g., Array length, Value ranges).
5. STARTER CODE (ABSOLUTE MINIMALIST SKELETON):
  - Provide VALID and FUNCTIONAL signature/template.
   - LOGIC STRIPPING RULE (MANDATORY): DO NOT provide even a single line of logic inside functions or classes.
   - ONLY provide the 'def', 'class', or 'interface' declaration and a single TODO comment.
6. NOVELTY & RANDOMIZATION (CRITICAL):
   - DIFFICULTY CALIBRATION: ${diffRule}
   - COMPLEXITY MODIFIER: ${modifier}
   - VARIATION SEED: ${Date.now()}-${Math.random()}

Return ONLY a JSON object:
  {
    "questions": [
      {
        "title": "Problem Title",
        "description": "Clear Markdown string explaining everything.",
        "starterCode": "def solution(input_data):\\n    # TODO: Implement\\n    pass",
        "input": "Input details",
        "output": "Output details",
        "examples": [
          { "input": "...", "output": "...", "explanation": "Detailed walkthrough" }
        ],
        "testCases": [
          { "input": "...", "output": "...", "hidden": false },
          { "input": "...", "output": "...", "hidden": true }
        ],
        "timeLimit": "60",
        "constraints": ["Constraint 1", "Constraint 2"],
        "hints": ["Hint 1", "Hint 2"]
      }
    ]
  }`;
}

