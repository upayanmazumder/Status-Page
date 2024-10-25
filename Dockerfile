# Use the official Python image
FROM python:3.9

# Create app directory
WORKDIR /app

# Copy requirements.txt if available from the project root
COPY ./api/requirements.txt ./

# Install app dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire project directory contents to the app directory
COPY . .

# Define build argument
ARG PYTHON_ENV
# Set environment variable
ENV PYTHON_ENV=${PYTHON_ENV}

# Bind to the specified ports
EXPOSE 3000

# Command to run the app
CMD ["python", "api/server.py"]
