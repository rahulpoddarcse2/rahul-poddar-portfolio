CREATE TABLE IF NOT EXISTS skills(id SERIAL PRIMARY KEY, category TEXT, items TEXT);
CREATE TABLE IF NOT EXISTS projects(id SERIAL PRIMARY KEY, title TEXT, subtitle TEXT, stack TEXT, details TEXT, link TEXT);
CREATE TABLE IF NOT EXISTS experience(id SERIAL PRIMARY KEY, role TEXT, company TEXT, period TEXT, details TEXT);
CREATE TABLE IF NOT EXISTS education(id SERIAL PRIMARY KEY, degree TEXT, school TEXT, period TEXT, details TEXT);
CREATE TABLE IF NOT EXISTS certifications(id SERIAL PRIMARY KEY, name TEXT, issued TEXT);
CREATE TABLE IF NOT EXISTS messages(id SERIAL PRIMARY KEY, name TEXT, email TEXT, message TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS visits(id SERIAL PRIMARY KEY, created_at TIMESTAMPTZ DEFAULT now());

-- items are separated by |  ; bullet details are separated by newlines
INSERT INTO skills(category,items) VALUES
('Cloud Platforms','Microsoft Azure|AWS (EC2, S3, IAM, Lambda)|Cloud infrastructure'),
('Infrastructure as Code','Terraform|Modules|Variables|Reproducible provisioning'),
('CI/CD','Jenkins|GitHub Actions|Pipeline design|Build & deployment automation|Troubleshooting'),
('Containers','Docker|Docker Compose (multi-stage builds)|Kubernetes (Pods, Deployments, Services)'),
('Monitoring','Prometheus|Grafana|Dashboards|Server health metrics|Incident monitoring'),
('GitOps & VCS','Git|GitHub|Azure DevOps Repos|Branching|Pull requests|Code review'),
('Web & Ops','Nginx (reverse proxy)|HTTP/HTTPS|Runbook authoring|Cloud cost hygiene'),
('OS & Scripting','Linux (Ubuntu) administration|Bash / Shell scripting|Automation scripting'),
('Tools','JIRA|Notion');

INSERT INTO projects(title,subtitle,stack,details,link) VALUES
('Automated Preview Environments','Terraform + GitHub Actions (AWS / Azure)','Terraform|GitHub Actions|AWS|Azure',E'Designed a fully automated IaC workflow: GitHub Actions triggers Terraform on PR open to provision a cloud staging environment\nImplemented environment lifecycle management so preview environments auto-destroy on PR merge/close, eliminating idle cloud resource costs\nStandardized PR-based environment provisioning, improving deployment frequency by an estimated 30% in testing\nConfigured parameterized Terraform modules for reproducible deployments on AWS and Azure, with every change passing PR-based code review via GitHub Flow',''),
('Containerized Task Manager','Docker Compose Deployment','Docker|Docker Compose|Nginx|Linux (Ubuntu)',E'Containerized a full-stack task management app (frontend, backend, database) using Docker multi-stage builds to reduce image size\nOrchestrated multi-container deployment with Docker Compose, configuring Nginx as a reverse proxy and managing service dependencies\nDeployed and tested the containerized stack on a clean Linux (Ubuntu) host, documenting the reproducible build, run, proxy and database flow in a README','');

INSERT INTO experience(role,company,period,details) VALUES
('DevOps Engineer','DevOps Insider','Dec 2025 - Present',E'Deployed and monitored AWS (EC2, S3) cloud infrastructure alongside senior engineers, supporting containerized workloads with Docker\nMaintained CI/CD pipelines in Jenkins and GitHub Actions; troubleshot failed builds and standardized pipeline steps in team runbooks\nProvisioned and modified sandbox cloud resources with Terraform (IaC) under senior supervision, applying IaC workflows for reproducible environments\nConfigured Prometheus and Grafana dashboards to track server health metrics and participated in incident monitoring\nAuthored infrastructure setup and pipeline documentation, supporting onboarding and knowledge sharing across the team'),
('IT Support','Aliste Technology','May 2025 - Aug 2026',E'Provided first-line technical support for hardware, software and network issues\nDiagnosed and resolved user tickets within SLA and escalated complex problems\nSet up and configured systems, user accounts and access\nDocumented fixes and communicated clearly to keep user downtime low');

INSERT INTO education(degree,school,period,details) VALUES
('Bachelor of Computer Applications (BCA)','Greater Noida Institute of Technology','Jun 2023 - Jun 2026','Specialized in DevOps and Cloud Computing - coursework covering containerization, CI/CD and workflow automation; hands-on with Docker and Kubernetes on AWS and Azure.');

INSERT INTO certifications(name,issued) VALUES
('Kubernetes Certification','Dec 2025'),('Terraform Specialist Certification','Mar 2025'),
('Jenkins Certified','Mar 2026'),('Docker Certified','Jan 2026'),
('AWS Fundamentals','Apr 2026'),('Azure Data Fundamentals (Microsoft)','Nov 2023');
