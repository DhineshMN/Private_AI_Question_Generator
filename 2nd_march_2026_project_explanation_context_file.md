# AI Question Generator: Project Context & Architectural Enhancement Guide (March 2026)

This document serves as deep contextual background for external Large Language Models (LLMs) such as Gemini 3.1 Pro, GPT-5.2, Grok 4.2, and Claude 4.6 Opus. **The goal is to analyze the current architecture and suggest state-of-the-art (SOTA), high-performance implementations using the latest AI agents, multi-LLM orchestration, and reasoning systems available as of March 2026.**

---

## 1. Project Overview

We have built a full-stack internal tool called the **AI Question Generator**, designed for Subject Matter Experts (SMEs) at L&T EduTech. It empowers SMEs to generate exam-quality Multiple Choice Questions (MCQ) and Coding challenges across diverse computer science topics, frameworks, and stacks.

### Current Tech Stack
-   **Frontend:** Vanilla JS (ESM), HTML5, CSS3, Vite 7.x
-   **Backend:** Node.js, Express.js 5.x
-   **Database:** MongoDB via Mongoose 9.x
-   **Current AI Provider:** Groq Cloud API (utilizing Llama 3.3 70B Versatile, Llama 3.1 8B, and Mixtral 8x7B)

### Core User Flow
1.  SMEs log into the Admin Hub and register their API keys mapping to their specific SME Profile.
2.  In the "Question Generator" tab, they select parameters: Question Type (MCQ/Coding), Category (Languages, Stacks, Frameworks, etc.), Subtopic, Difficulty (Easy, Medium, Hard), and requested Count.
3.  The frontend constructs a comprehensive, context-heavy prompt (injecting randomized industry focus, tech persona, coding boilerplate, and strict architectural rules for framework questions).
4.  The prompt is sent directly to the Groq API from the Vite client `main.js` using the standard `chat/completions` endpoint.
5.  A self-healing retry loop intercepts the JSON response, forcefully extracts the JSON from any conversational markdown, and validates that the exact `count` of questions was generated.
6.  Questions are rendered for preview and can be persisted to the MongoDB instance.

---

## 2. The Current AI Generation API Implementation

Currently, the generation logic is entirely linear, single-shot, and client-side executed. 

### Current Prompting Strategy
We use highly structured System and User prompts. 
-   **System Prompt:** `You are an expert technical SME and software architect. You output ONLY valid JSON... YOU MUST GENERATE EXACTLY [count] QUESTIONS.`
-   **User Prompt:** We inject dynamic personas (e.g., *Performance-obsessed Tech Lead*), industry flavors (e.g., *FinTech, SpaceTech*), and strict output schemas. For coding questions, we provide language-specific starter templates. For framework questions (e.g., React, Angular), we force a 20+ file enterprise directory structure in ASCII tree format.

### Limitations of Current Approach
1.  **Single-Shot Brittleness:** The LLM is asked to dream up the scenario, write the code, generate the constraints, and format the JSON all in one sequential generation block. This sometimes leads to shortened code snippets, logic gaps, or failing to hit the exact requested count (triggering our retry loop).
2.  **No Fact-Checking/Reflection:** There is no "judge" validating if the generated Python code actually works, or if the MCQ options have two accidentally correct answers.
3.  **Single LLM Dependency:** It relies entirely on one model at a time. Llama 3.3 70B is fast, but a smaller model could be used for simple parsing, and a massive reasoning model for the core logic.
4.  **No Memory or Context Graphs:** The generator doesn't remember what questions it generated in the previous session, potentially leading to repetitive topics across the Question Bank.

---

## 3. The Objective: Upgrading to SOTA (March 2026)

We want to drastically improve the **Performance, Hallucination Reduction, and Token Cost Efficiency** of this generation pipeline. 

I want to know how to transition from a linear, single-prompt approach to an advanced, multi-agent AI system. 

### Areas of Interest for Enhancement:

#### A. AI Agent Frameworks
What are the absolute best frameworks as of March 2026 for building autonomous reasoning chains? 
-   *E.g., LangGraph, CrewAI, Microsoft AutoGen, Agno, LlamaIndex Workflows, Vellum AI.*
-   How should we structure an agentic team for this? (e.g., an "Ideation Agent", a "Coding Agent", and a "QA Judge Agent").

#### B. Multi-LLM Orchestration
To optimize for cost and speed, how can we route tasks?
-   Can we use a fast, cheap model (like Llama-3-8B on Groq) to draft the initial MCQ concepts, and then use a heavier, intelligent model (like GPT-5.2, Claude 4.6 Opus) to refine them and write the deep technical "Smart Explanations"?
-   What orchestration layers facilitate this dynamic routing best?

#### C. LLM-as-a-Judge & Reflection
How do we implement a robust "Judge" agent?
-   We need an automated step where Generated Question X is critiqued by a separate LLM evaluation prompt: "Is this question technically accurate? Does the starter code compile? Is the difficulty accurately calibrated to 'Hard'?"
-   If it fails the judge, how should the architecture loop back to fix it before showing the human SME?

#### D. Context Graphs & Memory
How can we utilize Context/Knowledge Graphs to ensure that when an SME asks for 5 "Advanced React Hooks" questions, the system checks the MongoDB question bank, understands what has *already* been written, and generates truly novel edge cases?

#### E. Code Execution Sandboxing 
Currently, we rely entirely on the LLM "knowing" the code works. What are the best 2026 methods for an Agent to dynamically fire up a secure Docker sandbox, write a unit test for its own generated question, run it, and read the terminal output to prove the challenge is solvable before returning the JSON?

---

## 4. Prompt for External AI

*When feeding this document into models like Gemini 3.1 Pro, GPT-5.2, or Claude 4.6 Opus, please append the following instruction:*

> **"You have read the architectural context and limitations of the 'AI Question Generator' project. Based on the absolute state-of-the-art AI capabilities available in March 2026, provide a detailed, highly technical roadmap for transforming this single-shot generation API into a robust Multi-Agent Orchestration pipeline. 
> 
> Specifically address:
> 1. Which exact agent frameworks (e.g., LangGraph, CrewAI) you recommend for this Node/JS/Python ecosystem and why.
> 2. How to design the 'Agent Workflow' (draw an ASCII flowchart of the Ideator -> Coder -> Judge -> Formatter steps).
> 3. How to implement the routing between cheap/fast models and expensive/reasoning models to minimize token costs while maximizing quality and zero hallucinations.
> 4. Concrete techniques for injecting Context Graphs so the AI knows what questions already exist in the database.
> 5. How to integrate live code-execution tools so the agent can test its own coding questions before finalizing the JSON.
> 
> Be incredibly specific, deep, and forward-thinking. Provide architectural pattern examples."**
