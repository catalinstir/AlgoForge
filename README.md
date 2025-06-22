# Web Project - AlgoForge

Simple web app for code challenges using the MERN stack.

This app uses Docker containers for safely executing code. Follow these steps for setting up the execution environment:
## 1. Install Docker on your server:
   - [Docker installation guide](https://docs.docker.com/get-docker/)

## 2. Pull the required Docker images:
   ```bash
   docker pull node:16-alpine
   docker pull python:3.9-alpine
   docker pull gcc:11.2
