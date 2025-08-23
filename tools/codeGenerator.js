import fs from 'fs-extra';
import path from 'path';

export async function codeGenerator(input) {
    try {
        // Parse the input to understand what type of code generation is needed
        const request = JSON.parse(input);
        const { type, language, description, fileName, directory, content } = request;

        let generatedCode = '';
        let targetPath = '';
        let fullPath = '';

        // Determine target directory
        if (directory) {
            targetPath = path.resolve(directory);
        } else {
            targetPath = path.resolve('./temp');
        }

        // Ensure directory exists
        await fs.ensureDir(targetPath);

        switch (type) {
            case 'html_website':
                generatedCode = generateHTMLWebsite(description);
                fullPath = path.join(targetPath, fileName || 'index.html');
                break;
            
            case 'react_project':
                return await createReactProject(description, targetPath);
            
            case 'python_script':
                generatedCode = generatePythonScript(description);
                fullPath = path.join(targetPath, fileName || 'script.py');
                break;
            
            case 'javascript':
                generatedCode = generateJavaScript(description);
                fullPath = path.join(targetPath, fileName || 'script.js');
                break;
            
            case 'custom':
                generatedCode = content || generateCustomCode(language, description);
                const extension = getFileExtension(language);
                fullPath = path.join(targetPath, fileName || `file.${extension}`);
                break;
            
            default:
                generatedCode = generateGenericCode(description, language);
                const ext = getFileExtension(language || 'txt');
                fullPath = path.join(targetPath, fileName || `generated.${ext}`);
        }

        // Write the file
        await fs.writeFile(fullPath, generatedCode, 'utf8');

        return JSON.stringify({
            success: true,
            message: `Code generated successfully`,
            filePath: fullPath,
            type: type,
            language: language,
            preview: generatedCode.length > 200 ? generatedCode.substring(0, 200) + '...' : generatedCode
        }, null, 2);

    } catch (error) {
        return JSON.stringify({
            success: false,
            error: error.message,
            message: 'Failed to generate code'
        }, null, 2);
    }
}

function generateHTMLWebsite(description) {
    const title = extractTitle(description);
    const theme = extractTheme(description);
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        header {
            background: rgba(255, 255, 255, 0.95);
            padding: 2rem;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            margin-bottom: 2rem;
            text-align: center;
        }
        
        h1 {
            color: #2c3e50;
            font-size: 2.5rem;
            margin-bottom: 1rem;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .content {
            background: rgba(255, 255, 255, 0.95);
            padding: 2rem;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            margin-bottom: 2rem;
        }
        
        .feature-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin: 2rem 0;
        }
        
        .feature-card {
            background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
            color: white;
            padding: 2rem;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            transition: transform 0.3s ease;
        }
        
        .feature-card:hover {
            transform: translateY(-5px);
        }
        
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #fd79a8 0%, #e84393 100%);
            color: white;
            padding: 1rem 2rem;
            text-decoration: none;
            border-radius: 25px;
            font-weight: bold;
            transition: all 0.3s ease;
            margin: 1rem 0;
        }
        
        .cta-button:hover {
            transform: scale(1.05);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }
        
        footer {
            text-align: center;
            padding: 2rem;
            color: white;
            font-size: 0.9rem;
        }
        
        @media (max-width: 768px) {
            h1 {
                font-size: 2rem;
            }
            
            .container {
                padding: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>${title}</h1>
            <p>Welcome to an amazing website about ${description.toLowerCase()}</p>
        </header>
        
        <main class="content">
            <h2>About ${title}</h2>
            <p>This website explores the fascinating world of ${description.toLowerCase()}. Discover amazing facts, insights, and information that will expand your knowledge and understanding.</p>
            
            <div class="feature-grid">
                <div class="feature-card">
                    <h3>🌟 Discover</h3>
                    <p>Explore comprehensive information and detailed explanations about ${description.toLowerCase()}.</p>
                </div>
                
                <div class="feature-card">
                    <h3>🔬 Learn</h3>
                    <p>Dive deep into the science and principles behind ${description.toLowerCase()}.</p>
                </div>
                
                <div class="feature-card">
                    <h3>🚀 Explore</h3>
                    <p>Navigate through interactive content and engaging materials.</p>
                </div>
            </div>
            
            <div style="text-align: center; margin: 3rem 0;">
                <a href="#" class="cta-button">Get Started</a>
                <a href="#" class="cta-button">Learn More</a>
            </div>
        </main>
        
        <footer>
            <p>&copy; 2024 ${title} Website. Generated by AI Assistant.</p>
        </footer>
    </div>

    <script>
        // Add some interactive functionality
        document.addEventListener('DOMContentLoaded', function() {
            // Smooth scrolling for anchor links
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    const target = document.querySelector(this.getAttribute('href'));
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth'
                        });
                    }
                });
            });
            
            // Add click animations to feature cards
            document.querySelectorAll('.feature-card').forEach(card => {
                card.addEventListener('click', function() {
                    this.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        this.style.transform = 'translateY(-5px)';
                    }, 150);
                });
            });
            
            console.log('Welcome to ${title}! This website was generated by AI.');
        });
    </script>
</body>
</html>`;
}

async function createReactProject(description, targetPath) {
    const projectName = extractProjectName(description);
    const projectPath = path.join(targetPath, projectName);
    
    // Copy React template
    const templatePath = path.resolve('./boilerplates/react-template');
    await fs.copy(templatePath, projectPath);
    
    // Customize App.tsx based on description
    const customAppContent = generateReactApp(description);
    await fs.writeFile(path.join(projectPath, 'src/App.tsx'), customAppContent);
    
    // Update package.json
    const packageJson = await fs.readJson(path.join(projectPath, 'package.json'));
    packageJson.name = projectName.toLowerCase().replace(/\s+/g, '-');
    packageJson.description = `React application about ${description}`;
    await fs.writeJson(path.join(projectPath, 'package.json'), packageJson, { spaces: 2 });
    
    return JSON.stringify({
        success: true,
        message: `React project created successfully`,
        projectPath: projectPath,
        name: projectName,
        type: 'react_project',
        nextSteps: [
            `cd ${projectPath}`,
            'npm install',
            'npm run dev'
        ]
    }, null, 2);
}

function generateReactApp(description) {
    const componentName = 'App';
    const title = extractTitle(description);
    
    return `import React, { useState, useEffect } from 'react';
import './App.css';

function ${componentName}() {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1 className={\`title \${isLoaded ? 'fade-in' : ''}\`}>
          ${title}
        </h1>
        <p className="subtitle">
          Exploring the fascinating world of ${description.toLowerCase()}
        </p>
        <div className="time-display">
          Current Time: {currentTime}
        </div>
      </header>

      <main className="main-content">
        <section className="hero-section">
          <div className="hero-content">
            <h2>Welcome to ${title}</h2>
            <p>
              This React application was automatically generated to showcase 
              information about ${description.toLowerCase()}. Explore the features 
              and discover amazing content!
            </p>
            <button 
              className="cta-button"
              onClick={() => alert('Welcome to ${title}!')}
            >
              Get Started
            </button>
          </div>
        </section>

        <section className="features-section">
          <h3>Features</h3>
          <div className="features-grid">
            <div className="feature-card">
              <h4>🚀 Modern React</h4>
              <p>Built with the latest React features and TypeScript</p>
            </div>
            <div className="feature-card">
              <h4>⚡ Fast Development</h4>
              <p>Powered by Vite for lightning-fast development</p>
            </div>
            <div className="feature-card">
              <h4>🎨 Beautiful Design</h4>
              <p>Responsive and modern user interface</p>
            </div>
          </div>
        </section>

        <section className="content-section">
          <h3>About ${description}</h3>
          <p>
            This section would contain detailed information about ${description.toLowerCase()}.
            The content can be customized based on your specific requirements and needs.
          </p>
          <div className="interactive-demo">
            <h4>Interactive Demo</h4>
            <button onClick={() => setIsLoaded(!isLoaded)}>
              Toggle Animation
            </button>
            <div className={\`demo-box \${isLoaded ? 'active' : ''}\`}>
              <p>This is an interactive element that demonstrates React state management.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="app-footer">
        <p>&copy; 2024 ${title}. Generated by AI Assistant.</p>
      </footer>
    </div>
  );
}

export default ${componentName};`;
}

function generatePythonScript(description) {
    return `#!/usr/bin/env python3
"""
${extractTitle(description)} - Python Script
Generated by AI Assistant

Description: ${description}
"""

import sys
import datetime
import json
from typing import Dict, List, Any

class ${extractTitle(description).replace(/\s+/g, '')}:
    """
    A Python class for ${description.toLowerCase()}
    """
    
    def __init__(self):
        self.created_at = datetime.datetime.now()
        self.data = {}
        self.version = "1.0.0"
        
    def run(self):
        """Main execution method"""
        print(f"🚀 Starting ${extractTitle(description)}...")
        print(f"📅 Created at: {self.created_at}")
        print(f"📝 Description: ${description}")
        
        # Demonstrate various Python features
        self.demonstrate_features()
        self.process_data()
        self.display_results()
        
    def demonstrate_features(self):
        """Demonstrate Python features"""
        print("\\n🔧 Demonstrating Python features:")
        
        # List comprehension
        numbers = [x**2 for x in range(1, 11)]
        print(f"Squares 1-10: {numbers}")
        
        # Dictionary operations
        info = {
            "topic": "${description}",
            "language": "Python",
            "features": ["OOP", "List Comprehensions", "F-strings", "Type Hints"]
        }
        print(f"Project Info: {json.dumps(info, indent=2)}")
        
        # Generator function
        def fibonacci(n):
            a, b = 0, 1
            for _ in range(n):
                yield a
                a, b = b, a + b
        
        fib_sequence = list(fibonacci(10))
        print(f"Fibonacci sequence: {fib_sequence}")
        
    def process_data(self):
        """Process and analyze data"""
        print("\\n📊 Processing data...")
        
        sample_data = [
            {"name": "Item 1", "value": 10, "category": "A"},
            {"name": "Item 2", "value": 25, "category": "B"},
            {"name": "Item 3", "value": 15, "category": "A"},
            {"name": "Item 4", "value": 30, "category": "B"},
        ]
        
        # Data analysis
        total_value = sum(item["value"] for item in sample_data)
        avg_value = total_value / len(sample_data)
        
        category_counts = {}
        for item in sample_data:
            category = item["category"]
            category_counts[category] = category_counts.get(category, 0) + 1
        
        self.data = {
            "total_items": len(sample_data),
            "total_value": total_value,
            "average_value": avg_value,
            "category_distribution": category_counts
        }
        
    def display_results(self):
        """Display processed results"""
        print("\\n📈 Results:")
        for key, value in self.data.items():
            print(f"  {key}: {value}")
        
    def save_results(self, filename: str = "results.json"):
        """Save results to a file"""
        try:
            with open(filename, 'w') as f:
                json.dump(self.data, f, indent=2)
            print(f"\\n💾 Results saved to {filename}")
        except Exception as e:
            print(f"\\n❌ Error saving results: {e}")

def main():
    """Main function"""
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()
        if command == "--help":
            print("Usage: python script.py [--help | --save]")
            print("  --help: Show this help message")
            print("  --save: Save results to file")
            return
    
    # Create and run the application
    app = ${extractTitle(description).replace(/\s+/g, '')}()
    app.run()
    
    # Save results if requested
    if len(sys.argv) > 1 and sys.argv[1].lower() == "--save":
        app.save_results()
    
    print("\\n✅ Script completed successfully!")

if __name__ == "__main__":
    main()`;
}

function generateJavaScript(description) {
    return `/**
 * ${extractTitle(description)} - JavaScript Implementation
 * Generated by AI Assistant
 * 
 * Description: ${description}
 */

class ${extractTitle(description).replace(/\s+/g, '')} {
    constructor() {
        this.createdAt = new Date();
        this.data = {};
        this.version = "1.0.0";
        
        console.log(\`🚀 ${extractTitle(description)} initialized\`);
    }
    
    async run() {
        console.log(\`📅 Created at: \${this.createdAt.toISOString()}\`);
        console.log(\`📝 Description: ${description}\`);
        
        await this.demonstrateFeatures();
        await this.processData();
        this.displayResults();
    }
    
    async demonstrateFeatures() {
        console.log('\\n🔧 Demonstrating JavaScript features:');
        
        // Array methods
        const numbers = Array.from({length: 10}, (_, i) => (i + 1) ** 2);
        console.log(\`Squares 1-10: \${numbers}\`);
        
        // Object destructuring and spread
        const info = {
            topic: "${description}",
            language: "JavaScript",
            features: ["ES6+", "Async/Await", "Classes", "Arrow Functions"]
        };
        console.log('Project Info:', JSON.stringify(info, null, 2));
        
        // Promise simulation
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        console.log('⏳ Simulating async operation...');
        await delay(100);
        console.log('✅ Async operation completed');
        
        // Map and filter operations
        const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        const processedData = data
            .filter(n => n % 2 === 0)
            .map(n => n * 3)
            .reduce((sum, n) => sum + n, 0);
        console.log(\`Processed data result: \${processedData}\`);
    }
    
    async processData() {
        console.log('\\n📊 Processing data...');
        
        const sampleData = [
            {name: "Item 1", value: 10, category: "A"},
            {name: "Item 2", value: 25, category: "B"},
            {name: "Item 3", value: 15, category: "A"},
            {name: "Item 4", value: 30, category: "B"},
        ];
        
        // Data analysis using modern JavaScript
        const totalValue = sampleData.reduce((sum, item) => sum + item.value, 0);
        const avgValue = totalValue / sampleData.length;
        
        const categoryDistribution = sampleData.reduce((acc, item) => {
            acc[item.category] = (acc[item.category] || 0) + 1;
            return acc;
        }, {});
        
        this.data = {
            totalItems: sampleData.length,
            totalValue,
            averageValue: avgValue,
            categoryDistribution
        };
    }
    
    displayResults() {
        console.log('\\n📈 Results:');
        Object.entries(this.data).forEach(([key, value]) => {
            console.log(\`  \${key}: \${JSON.stringify(value)}\`);
        });
    }
    
    saveResults(filename = 'results.json') {
        try {
            const fs = require('fs');
            fs.writeFileSync(filename, JSON.stringify(this.data, null, 2));
            console.log(\`\\n💾 Results saved to \${filename}\`);
        } catch (error) {
            console.log(\`\\n❌ Error saving results: \${error.message}\`);
        }
    }
}

// Utility functions
const utils = {
    formatDate: (date) => date.toLocaleDateString(),
    formatTime: (date) => date.toLocaleTimeString(),
    randomNumber: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
    capitalizeWords: (str) => str.replace(/\\b\\w/g, l => l.toUpperCase())
};

// Main execution
async function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--help')) {
        console.log('Usage: node script.js [--help | --save]');
        console.log('  --help: Show this help message');
        console.log('  --save: Save results to file');
        return;
    }
    
    const app = new ${extractTitle(description).replace(/\s+/g, '')}();
    await app.run();
    
    if (args.includes('--save')) {
        app.saveResults();
    }
    
    console.log('\\n✅ Script completed successfully!');
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ${extractTitle(description).replace(/\s+/g, '')}, utils };
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}`;
}

function generateCustomCode(language, description) {
    switch (language?.toLowerCase()) {
        case 'css':
            return generateCSS(description);
        case 'sql':
            return generateSQL(description);
        case 'json':
            return generateJSON(description);
        case 'yaml':
        case 'yml':
            return generateYAML(description);
        default:
            return generateGenericCode(description, language);
    }
}

function generateCSS(description) {
    return `/* ${extractTitle(description)} - CSS Styles */
/* Generated by AI Assistant */

:root {
    --primary-color: #3498db;
    --secondary-color: #2ecc71;
    --accent-color: #e74c3c;
    --text-color: #2c3e50;
    --background-color: #ecf0f1;
    --border-radius: 8px;
    --box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    --transition: all 0.3s ease;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Arial', sans-serif;
    line-height: 1.6;
    color: var(--text-color);
    background-color: var(--background-color);
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

/* ${description} specific styles */
.main-header {
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    color: white;
    text-align: center;
    padding: 2rem;
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
    margin-bottom: 2rem;
}

.content-section {
    background: white;
    padding: 2rem;
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
    margin-bottom: 2rem;
    transition: var(--transition);
}

.content-section:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.btn {
    display: inline-block;
    padding: 12px 24px;
    background-color: var(--primary-color);
    color: white;
    text-decoration: none;
    border: none;
    border-radius: var(--border-radius);
    cursor: pointer;
    transition: var(--transition);
    font-size: 16px;
}

.btn:hover {
    background-color: var(--secondary-color);
    transform: scale(1.05);
}

@media (max-width: 768px) {
    .container {
        padding: 10px;
    }
    
    .main-header {
        padding: 1rem;
    }
}`;
}

function generateSQL(description) {
    return `-- ${extractTitle(description)} - SQL Database Schema
-- Generated by AI Assistant

-- Create database
CREATE DATABASE IF NOT EXISTS ${extractTitle(description).replace(/\s+/g, '_').toLowerCase()}_db;
USE ${extractTitle(description).replace(/\s+/g, '_').toLowerCase()}_db;

-- Main table for ${description}
CREATE TABLE IF NOT EXISTS main_data (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    value DECIMAL(10, 2),
    status ENUM('active', 'inactive', 'pending') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO categories (name, description) VALUES
('Category A', 'First category for ${description}'),
('Category B', 'Second category for ${description}'),
('Category C', 'Third category for ${description}');

INSERT INTO main_data (name, description, category, value, status) VALUES
('Sample Item 1', 'First sample item for ${description}', 'Category A', 99.99, 'active'),
('Sample Item 2', 'Second sample item for ${description}', 'Category B', 149.99, 'active'),
('Sample Item 3', 'Third sample item for ${description}', 'Category A', 79.99, 'inactive');

-- Useful queries
-- Get all active items
SELECT * FROM main_data WHERE status = 'active';

-- Get items by category with totals
SELECT 
    category,
    COUNT(*) as item_count,
    SUM(value) as total_value,
    AVG(value) as average_value
FROM main_data 
WHERE status = 'active'
GROUP BY category;

-- Get recent items
SELECT * FROM main_data 
ORDER BY created_at DESC 
LIMIT 10;`;
}

function generateJSON(description) {
    return JSON.stringify({
        name: extractTitle(description),
        description: description,
        version: "1.0.0",
        type: "data_structure",
        created_at: new Date().toISOString(),
        data: {
            items: [
                {
                    id: 1,
                    name: "Sample Item 1",
                    category: "primary",
                    value: 100,
                    active: true
                },
                {
                    id: 2,
                    name: "Sample Item 2", 
                    category: "secondary",
                    value: 200,
                    active: true
                }
            ],
            metadata: {
                total_items: 2,
                categories: ["primary", "secondary"],
                last_updated: new Date().toISOString()
            }
        },
        configuration: {
            debug: false,
            api_endpoint: "https://api.example.com",
            timeout: 5000,
            retry_attempts: 3
        }
    }, null, 2);
}

function generateYAML(description) {
    return `# ${extractTitle(description)} - YAML Configuration
# Generated by AI Assistant

name: ${extractTitle(description).replace(/\s+/g, '-').toLowerCase()}
description: "${description}"
version: "1.0.0"
type: configuration

metadata:
  created_at: "${new Date().toISOString()}"
  generator: "AI Assistant"
  language: "YAML"

configuration:
  debug: false
  environment: development
  api:
    endpoint: "https://api.example.com"
    timeout: 5000
    retry_attempts: 3
    headers:
      Content-Type: "application/json"
      Accept: "application/json"

data:
  items:
    - id: 1
      name: "Sample Item 1"
      category: primary
      value: 100
      active: true
      tags:
        - important
        - featured
    
    - id: 2
      name: "Sample Item 2"
      category: secondary
      value: 200
      active: true
      tags:
        - standard
        - popular

categories:
  primary:
    display_name: "Primary Category"
    description: "Main category for ${description}"
    color: "#3498db"
  
  secondary:
    display_name: "Secondary Category"  
    description: "Secondary category for ${description}"
    color: "#2ecc71"

settings:
  pagination:
    page_size: 20
    max_pages: 100
  
  features:
    search: true
    filtering: true
    sorting: true
    export: true`;
}

function generateGenericCode(description, language) {
    return `/*
 * ${extractTitle(description)}
 * Language: ${language || 'Generic'}
 * Generated by AI Assistant
 * 
 * Description: ${description}
 */

// This is a generic code template for ${description}
// Customize this code based on your specific requirements

function main() {
    console.log("Starting ${extractTitle(description)}...");
    console.log("Description: ${description}");
    
    // Add your implementation here
    const result = processData();
    displayResults(result);
    
    console.log("Completed successfully!");
}

function processData() {
    // Implement your data processing logic
    return {
        status: "success",
        message: "Data processed for ${description}",
        timestamp: new Date().toISOString()
    };
}

function displayResults(result) {
    console.log("Results:", JSON.stringify(result, null, 2));
}

// Execute main function
main();`;
}

// Helper functions
function extractTitle(description) {
    // Extract a title from the description
    const words = description.split(' ');
    if (words.length <= 3) {
        return words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
    return words.slice(0, 3).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function extractProjectName(description) {
    return extractTitle(description).replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-').toLowerCase();
}

function extractTheme(description) {
    // Simple theme extraction based on keywords
    const techKeywords = ['tech', 'technology', 'programming', 'code', 'software'];
    const scienceKeywords = ['science', 'physics', 'chemistry', 'biology', 'research'];
    const businessKeywords = ['business', 'marketing', 'finance', 'management'];
    
    const lowerDesc = description.toLowerCase();
    
    if (techKeywords.some(keyword => lowerDesc.includes(keyword))) {
        return 'technology';
    } else if (scienceKeywords.some(keyword => lowerDesc.includes(keyword))) {
        return 'science';
    } else if (businessKeywords.some(keyword => lowerDesc.includes(keyword))) {
        return 'business';
    }
    
    return 'general';
}

function getFileExtension(language) {
    const extensions = {
        'javascript': 'js',
        'python': 'py',
        'html': 'html',
        'css': 'css',
        'json': 'json',
        'yaml': 'yml',
        'yml': 'yml',
        'sql': 'sql',
        'typescript': 'ts',
        'jsx': 'jsx',
        'tsx': 'tsx',
        'php': 'php',
        'java': 'java',
        'cpp': 'cpp',
        'c': 'c',
        'csharp': 'cs',
        'ruby': 'rb',
        'go': 'go',
        'rust': 'rs',
        'swift': 'swift',
        'kotlin': 'kt',
        'scala': 'scala',
        'xml': 'xml',
        'markdown': 'md',
        'text': 'txt'
    };
    
    return extensions[language?.toLowerCase()] || 'txt';
}
