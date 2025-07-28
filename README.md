AIMA Community App
This is a small demo app built with React and Vite. The project simulates a community platform with members and organizations. Members can join groups, chat with each other, and apply for opportunities posted by organizations.

Features
Register as a member or organization with optional profile photo upload; only members can upload a resume.
Email-based OTP verification during registration using Gmail.
Direct messages with invite system similar to Instagram DMs.
WhatsApp‑style group chats supporting file attachments and member invites.
Organizations can create job posts, view applicants, and message them directly.
Members have a personal dashboard to track saved and applied jobs, while
organizations get their own dashboard with basic analytics to manage postings,
applications, and any pending resumes. Recruiters can download each applicant's resume right from their dashboard. After submitting an application, members see "Application submitted successfully!" and are redirected to the jobs page. Clicking a job now opens an expanded details page with the full description and an Apply button.
Coding assessment tab for members only, with rankings shown on their profiles. The assessment works like a short quiz: members press **Start**, answer each question in order without going back, and submit at the end. About twenty questions are pulled from online sources and LeetCode problems.
Simple JSON file database served via a small Node server.
AI-powered candidate matching suggests the most relevant applicants for each posting.
Role-specific assessments with ranking metrics help evaluate candidates effectively.
Recruiter dashboards include posting management tools and analytics cards. The
Applications card can be clicked to reveal which jobs have new applicants. Selecting a job title focuses the dashboard on that posting so recruiters see only its applicants with filters and assessment scores.
Candidate profiles track skills, job preferences and peer ratings.
Peer-to-peer networking and upskilling options foster community growth.
Integration with popular communication tools like WhatsApp and email for easier follow-ups.
Members can rate each other from profiles, and organizations see suggested candidates based on skill and preference matching.
Organizations can filter applicants by skill keywords and minimum rating to quickly sort large numbers of resumes.
Organizations may create their own custom assessments and attach them to job posts.
Each built-in assessment now contains at least ten questions so recruiters get a meaningful ranking. Applicants must complete these quizzes when applying, and organizations can view scores and filter candidates by minimum assessment result. Rankings are hidden from applicants.
Getting Started
Install dependencies:
npm install
Copy `myapp/.env.example` to `myapp/.env` and add your Gmail address and app password.
The database now includes over 25 sample tech job posts so no external API keys are required. All of these listings are owned by a demo organization account (`jobs2@gmail.com`, password `IloveN001!@#`) that you can use to explore the recruiter dashboard.
Start the local database API:
npm run server
To wipe all demo data, run:
npm run reset-db
In a separate terminal, start the dev server:
npm run dev
Open http://localhost:5173 in your browser.
The app stores all data in db.json under myapp/. The server runs on port 3001 by default.
If email delivery fails during registration you can use the **Quick Verify** button on the verification page.

Testing
The project currently includes a placeholder test script:

npm test
which will simply print that no tests are implemented.

This repository was populated with features during prior pull requests, including profile pictures, expanded chat windows, DM invites, and group invite handling.
