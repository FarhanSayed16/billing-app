@echo off
cd /d d:\Billing-App

echo Removing all files from git cache...
git rm -r --cached .

echo Adding .gitignore...
git add .gitignore

echo Committing changes...
git commit -m "Remove all files from tracking except .gitignore"

echo Checking git status...
git status --short

echo Done! Only .gitignore should be tracked now.
