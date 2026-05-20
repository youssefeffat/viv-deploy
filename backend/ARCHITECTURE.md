# Backend Architecture & AI Development Guide

Welcome to the backend for our application! We use a clean, layered architecture with **FastAPI** and **Supabase**. This structure keeps our code organized, easy to read, and simple to fix. 

This document explains how our system works and exactly how to use AI to build new features safely without causing code conflicts.

---

## 1. How Our Folders Work (The Anatomy of a Feature)

Think of every feature (like `UserManagement` or `Authentication`) as having a specific set of jobs. We split these jobs into separate folders so they don't get mixed up.

* **`Schemas/` (The Bouncers)**
    * **What it does:** Uses Pydantic to check the data coming in and going out. It ensures that if a user sends an email, it actually looks like an email.
    * **Rule:** No database or logic code goes here. Just data shapes.
* **`Routes/` (The Receptionists)**
    * **What it does:** Defines the actual URLs (like `/users/create`). It takes the incoming request, sends it to the Controller, and returns the final answer to the user.
    * **Rule:** Keep this file very thin. It should only call the Controller.
* **`Controllers/` (The Brains)**
    * **What it does:** This is where the actual "business rules" live. All error handling (like returning a "404 Not Found") happens here.
    * **Rule:** Controllers don't talk to the database directly. They ask the *Repository* to do it.
* **`Repositories/` (The Database Workers)**
    * **What it does:** This handles all direct communication with Supabase. 
        * **`Interfaces/`:** An abstract list of rules (e.g., "Every user repository must have a `create_user` function").
        * **`Implementations/`:** The actual Supabase code that does the saving and fetching.
* **`dependencies.py` (The Tool Provider)**
    * **What it does:** Provides the routes with the tools they need (like checking auth tokens or handing the route a copy of the database repository).
* **`config.py` (The Settings Hub)**
    * **What it does:** Reads our `.env` file safely so our app has access to secret keys.

---

## 2. Team Git & Collaboration Rules

To avoid Git merge conflicts when multiple developers are working at the same time, everyone must follow these 3 rules:

1. **The Morning Sync:** Every time you start working, pull the latest changes from the `main` branch into your current feature branch.
2. **The 1-Line `main.py` Rule:** When registering your new route in `main.py`, ONLY add the 1-2 lines required (e.g., `app.include_router(...)`). Never reformat or rewrite the whole file.
3. **Database Warnings:** If your feature requires adding new tables or columns to `database_schema.sql`, you MUST announce this to the team chat so others are aware of the change.

---

## 3. Phase 1: Planning the Feature (The AI Product Manager)

Before you write any code, you need a clear plan. Do not guess the rules. Use an AI to help you fill out our Standard Feature Template.

**Instructions:** Open your AI tool, paste the prompt below, and type in your rough idea.

> **System Role & Context**
> You are an expert Technical Product Manager. My team uses a strict "Feature Description Template" to plan backend features before we code them. Please explain things simply and help me catch edge cases I might have missed.
> 
> **The Task**
> I am going to give you a rough idea for a new backend feature. Your job is to help me translate my rough idea into a perfectly filled-out template. 
> 
> **My Rough Idea:**
> [INSERT YOUR ROUGH IDEA HERE]
> 
> **Your Instructions:**
> Step 1: Ask Clarifying Questions. Do not write the template immediately. First, look at my rough idea and ask me 2 to 4 quick, specific questions to fill in the blanks (e.g., security, edge cases, error handling).
> Step 2: Generate the Template. Once I answer your questions, generate the final text using EXACTLY the 6 sections below:
> 
> 1. Feature Name:
> 2. Objective (The "Why"):
> 3. Step-by-Step Logic (The "How"):
> 4. Data Inputs & Outputs:
> 5. Business Rules & Validations:
> 6. Permissions & Security:
> 
> Acknowledge these instructions and start with Step 1 based on my rough idea!

---

## 4. Phase 2: Coding the Feature (The AI Super Prompt)

Once you have your completed 6-section template from Phase 1, you are ready to code. 

**Instructions:** Open a fresh AI chat. Copy everything below, paste your completed template into the bracketed area, and make sure you attach or provide the `database_schema.sql` file to the chat.

> **System Role & Context**
> You are a highly capable AI assistant specialized in FastAPI and Python. You are helping me build a new feature for our backend. Please explain your code clearly and simply. We use a strict layered architecture to maintain clean code. The stack is FastAPI, Pydantic, and Supabase. 
> 
> **Our Architecture & Coding Rules:**
> 1. Schemas/: Pydantic models for validation (data shapes only, no logic).
> 2. Repositories/Interfaces/: Abstract classes defining database operations.
> 3. Repositories/Implementations/: Concrete classes that interact with Supabase.
> 4. Controllers/: Business logic. Calls repositories, NEVER calls the DB directly. All error handling (e.g., HTTPExceptions) should be raised here.
> 5. Routes/: FastAPI endpoints. Very thin. Validates input via Schemas, calls Controllers.
> 6. dependencies.py: Dependency injection (e.g., auth tokens, repo implementations).
> 7. main.py (Strict Git Rule): NEVER rewrite the entire main.py file. Only provide the exact 1-2 lines needed to import and register the new router.
> *Formatting Rule:* Always give me the full file code for layers 1-6. Never use placeholders like `// rest of code here`. Provide the exact file path above every code block.
> 
> **The Feature Request:**
> I need to build the following feature:
> [PASTE YOUR COMPLETED 6-SECTION FEATURE TEMPLATE HERE]
> 
> **Your Step-by-Step Instructions:**
> Do not write the final code immediately. We must go step-by-step. You must wait for my approval after Steps 1, 2, and 3.
> 
> * Step 1: Global Context Analysis. Review our global files (requirements.txt, main.py, config.py). Acknowledge the libraries and configuration we use. Do not suggest new libraries unless absolutely necessary.
> * Step 2: Database Check. Read the provided `database_schema.sql` file. If the feature requires database modifications, suggest the exact SQL code to update the schema first. Wait for my approval.
> * Step 3: Architecture Plan. Write a brief plan showing which files will be created/modified across our layers. Point out any risks to existing code. Wait for my approval.
> * Step 4: Step-by-Step Code Generation. Give me the full code one file at a time (Schemas -> Interfaces -> Implementations -> Controllers -> Routes -> dependencies.py). Self-Review: Internally verify that no DB logic is in the Controllers, and no business logic is in the Routes.
> * Step 5: Testing & Team Handoff. Provide a simple example of how to test this new route (e.g., a curl command or JSON body). Finally, if Step 2 required a database change, explicitly remind me to announce this change to my team to prevent Git conflicts on the .sql file.
> 
> Please acknowledge these instructions, confirm you have read the architecture rules, and start exactly at Step 1.