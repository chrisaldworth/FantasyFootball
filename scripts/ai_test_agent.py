#!/usr/bin/env python3
"""
AI Test Agent - Intelligent automated testing system
Uses AI to analyze changes, run tests, and provide intelligent feedback
"""

import os
import sys
import subprocess
import json
import re
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from datetime import datetime
import difflib

# Try to import AI libraries (OpenAI, Anthropic, etc.)
try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    print("[AI Agent] OpenAI not available. Install with: pip install openai")

try:
    from anthropic import Anthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False


class AITestAgent:
    """AI-powered test agent that intelligently runs tests and provides feedback"""
    
    def __init__(self, project_root: str = None):
        self.project_root = Path(project_root) if project_root else Path(__file__).parent.parent
        self.test_results = []
        self.change_history = []
        self.ai_provider = self._detect_ai_provider()
        
    def _detect_ai_provider(self) -> str:
        """Detect which AI provider is available"""
        if OPENAI_AVAILABLE and os.getenv('OPENAI_API_KEY'):
            return 'openai'
        elif ANTHROPIC_AVAILABLE and os.getenv('ANTHROPIC_API_KEY'):
            return 'anthropic'
        else:
            return 'none'
    
    def analyze_changes(self, file_path: str) -> Dict:
        """Analyze what changed in a file and determine what tests to run"""
        file_path = Path(file_path)
        
        if not file_path.exists():
            return {'impact': 'unknown', 'tests': []}
        
        # Determine file type and impact
        if 'ios' in str(file_path) or file_path.suffix == '.swift':
            return {
                'impact': 'ios',
                'tests': ['ios'],
                'priority': 'high',
                'reason': 'iOS code change detected'
            }
        elif 'backend' in str(file_path) or file_path.suffix == '.py':
            return {
                'impact': 'backend',
                'tests': ['backend', 'frontend'],  # Frontend might depend on backend
                'priority': 'high',
                'reason': 'Backend code change detected'
            }
        elif 'frontend' in str(file_path) or file_path.suffix in ['.ts', '.tsx', '.js', '.jsx']:
            return {
                'impact': 'frontend',
                'tests': ['frontend', 'ios'],  # iOS uses frontend code
                'priority': 'medium',
                'reason': 'Frontend code change detected'
            }
        elif file_path.name in ['package.json', 'requirements.txt']:
            return {
                'impact': 'dependencies',
                'tests': ['all'],
                'priority': 'high',
                'reason': 'Dependency change detected - run all tests'
            }
        else:
            return {
                'impact': 'unknown',
                'tests': ['all'],
                'priority': 'low',
                'reason': 'Unknown file type - run all tests to be safe'
            }
    
    def get_ai_suggestion(self, test_results: List[Dict], error_log: str) -> str:
        """Use AI to analyze test failures and suggest fixes"""
        if self.ai_provider == 'none':
            return self._basic_analysis(test_results, error_log)
        
        # Prepare context for AI
        context = self._prepare_ai_context(test_results, error_log)
        
        if self.ai_provider == 'openai':
            return self._get_openai_suggestion(context)
        elif self.ai_provider == 'anthropic':
            return self._get_anthropic_suggestion(context)
        
        return self._basic_analysis(test_results, error_log)
    
    def _prepare_ai_context(self, test_results: List[Dict], error_log: str) -> str:
        """Prepare context for AI analysis"""
        context = f"""
Test Results Summary:
- Total tests: {len(test_results)}
- Passed: {sum(1 for r in test_results if r.get('status') == 'pass')}
- Failed: {sum(1 for r in test_results if r.get('status') == 'fail')}

Failed Tests:
"""
        for result in test_results:
            if result.get('status') == 'fail':
                context += f"- {result.get('name', 'Unknown')}: {result.get('error', 'No error message')}\n"
        
        context += f"\nError Log:\n{error_log[:2000]}\n"
        
        return context
    
    def _get_openai_suggestion(self, context: str) -> str:
        """Get AI suggestion from OpenAI"""
        try:
            client = openai.OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
            
            response = client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": """You are a senior software engineer analyzing test failures. 
                    Provide concise, actionable suggestions to fix the issues. Focus on:
                    1. Root cause analysis
                    2. Specific fixes
                    3. Prevention strategies"""},
                    {"role": "user", "content": f"Analyze these test failures and suggest fixes:\n\n{context}"}
                ],
                max_tokens=500,
                temperature=0.3
            )
            
            return response.choices[0].message.content
        except Exception as e:
            return f"AI analysis unavailable: {str(e)}. Using basic analysis instead."
    
    def _get_anthropic_suggestion(self, context: str) -> str:
        """Get AI suggestion from Anthropic Claude"""
        try:
            client = Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))
            
            message = client.messages.create(
                model="claude-3-sonnet-20240229",
                max_tokens=500,
                messages=[
                    {"role": "user", "content": f"""Analyze these test failures and suggest fixes:

{context}

Provide:
1. Root cause
2. Specific fixes
3. Prevention tips"""}
                ]
            )
            
            return message.content[0].text
        except Exception as e:
            return f"AI analysis unavailable: {str(e)}. Using basic analysis instead."
    
    def _basic_analysis(self, test_results: List[Dict], error_log: str) -> str:
        """Basic analysis without AI"""
        failed = [r for r in test_results if r.get('status') == 'fail']
        
        if not failed:
            return "✅ All tests passed!"
        
        suggestions = []
        
        # Analyze common patterns
        if any('timeout' in str(r.get('error', '')).lower() for r in failed):
            suggestions.append("⚠️  Timeout errors detected. Check network connectivity or increase timeout values.")
        
        if any('import' in str(r.get('error', '')).lower() for r in failed):
            suggestions.append("⚠️  Import errors detected. Check dependencies are installed correctly.")
        
        if any('syntax' in str(r.get('error', '')).lower() for r in failed):
            suggestions.append("⚠️  Syntax errors detected. Check code for typos or missing brackets.")
        
        if any('ios' in str(r.get('name', '')).lower() for r in failed):
            suggestions.append("⚠️  iOS test failures. Ensure Xcode is properly configured and simulator is available.")
        
        return "\n".join(suggestions) if suggestions else "Review error logs for details."
    
    def run_tests(self, test_types: List[str]) -> Tuple[bool, List[Dict]]:
        """Run tests and collect results"""
        results = []
        all_passed = True
        
        for test_type in test_types:
            print(f"\n🧪 Running {test_type} tests...")
            
            try:
                # Run test agent script
                result = subprocess.run(
                    ["./scripts/test_agent.sh", test_type],
                    cwd=self.project_root,
                    capture_output=True,
                    text=True,
                    timeout=300  # 5 minute timeout
                )
                
                status = 'pass' if result.returncode == 0 else 'fail'
                all_passed = all_passed and (result.returncode == 0)
                
                results.append({
                    'type': test_type,
                    'status': status,
                    'output': result.stdout,
                    'error': result.stderr if result.returncode != 0 else None,
                    'timestamp': datetime.now().isoformat()
                })
                
                if status == 'pass':
                    print(f"✅ {test_type} tests passed")
                else:
                    print(f"❌ {test_type} tests failed")
                    print(result.stderr[:500])  # Show first 500 chars of error
                    
            except subprocess.TimeoutExpired:
                results.append({
                    'type': test_type,
                    'status': 'fail',
                    'error': 'Test timeout (exceeded 5 minutes)',
                    'timestamp': datetime.now().isoformat()
                })
                all_passed = False
            except Exception as e:
                results.append({
                    'type': test_type,
                    'status': 'fail',
                    'error': str(e),
                    'timestamp': datetime.now().isoformat()
                })
                all_passed = False
        
        return all_passed, results
    
    def intelligent_test(self, changed_files: List[str] = None) -> Dict:
        """Intelligently determine and run tests based on changes"""
        print("🤖 AI Test Agent - Intelligent Testing")
        print("=" * 60)
        
        # If no files specified, run all tests
        if not changed_files:
            print("ℹ️  No specific changes detected. Running all tests...")
            all_passed, results = self.run_tests(['all'])
        else:
            # Analyze changes
            print(f"📊 Analyzing {len(changed_files)} changed file(s)...")
            
            test_plan = set()
            for file_path in changed_files:
                analysis = self.analyze_changes(file_path)
                print(f"  {file_path}: {analysis['reason']} (Priority: {analysis['priority']})")
                test_plan.update(analysis['tests'])
            
            # Convert 'all' to specific test types
            if 'all' in test_plan:
                test_types = ['backend', 'frontend', 'ios']
            else:
                test_types = list(test_plan)
            
            print(f"\n🎯 Test Plan: {', '.join(test_types)}")
            all_passed, results = self.run_tests(test_types)
        
        # Get AI suggestions if tests failed
        suggestions = None
        if not all_passed:
            print("\n🤖 Analyzing failures with AI...")
            error_log = "\n".join([r.get('error', '') for r in results if r.get('error')])
            suggestions = self.get_ai_suggestion(results, error_log)
            print(f"\n💡 AI Suggestions:\n{suggestions}")
        
        return {
            'success': all_passed,
            'results': results,
            'suggestions': suggestions,
            'timestamp': datetime.now().isoformat()
        }
    
    def watch_and_test(self):
        """Watch for file changes and intelligently run tests"""
        print("👀 AI Test Agent - Watch Mode")
        print("Watching for changes... (Press Ctrl+C to stop)")
        
        try:
            import watchdog
            from watchdog.observers import Observer
            from watchdog.events import FileSystemEventHandler
            
            class TestHandler(FileSystemEventHandler):
                def __init__(self, agent):
                    self.agent = agent
                    self.last_test = datetime.now()
                
                def on_modified(self, event):
                    if event.is_directory:
                        return
                    
                    # Throttle: don't test more than once per 5 seconds
                    if (datetime.now() - self.last_test).seconds < 5:
                        return
                    
                    file_path = event.src_path
                    # Only watch source files
                    if any(ext in file_path for ext in ['.py', '.swift', '.ts', '.tsx', '.js', '.jsx']):
                        print(f"\n📝 Change detected: {file_path}")
                        self.agent.intelligent_test([file_path])
                        self.last_test = datetime.now()
            
            event_handler = TestHandler(self)
            observer = Observer()
            
            # Watch relevant directories
            observer.schedule(event_handler, str(self.project_root / 'backend' / 'app'), recursive=True)
            observer.schedule(event_handler, str(self.project_root / 'frontend' / 'src'), recursive=True)
            observer.schedule(event_handler, str(self.project_root / 'frontend' / 'ios'), recursive=True)
            
            observer.start()
            
            try:
                while True:
                    import time
                    time.sleep(1)
            except KeyboardInterrupt:
                observer.stop()
            
            observer.join()
            
        except ImportError:
            print("⚠️  watchdog not installed. Install with: pip install watchdog")
            print("Falling back to polling mode...")
            # Fallback to polling
            self._poll_and_test()
    
    def _poll_and_test(self):
        """Fallback polling-based watch"""
        import time
        last_mtime = {}
        
        while True:
            try:
                for root, dirs, files in os.walk(self.project_root):
                    # Skip node_modules, venv, etc.
                    if any(skip in root for skip in ['node_modules', 'venv', '.git', '__pycache__']):
                        continue
                    
                    for file in files:
                        if any(file.endswith(ext) for ext in ['.py', '.swift', '.ts', '.tsx', '.js', '.jsx']):
                            file_path = os.path.join(root, file)
                            mtime = os.path.getmtime(file_path)
                            
                            if file_path not in last_mtime or mtime > last_mtime[file_path]:
                                if file_path in last_mtime:  # Don't test on first scan
                                    print(f"\n📝 Change detected: {file_path}")
                                    self.intelligent_test([file_path])
                                last_mtime[file_path] = mtime
                
                time.sleep(2)
            except KeyboardInterrupt:
                break


def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description='AI Test Agent - Intelligent automated testing')
    parser.add_argument('mode', choices=['test', 'watch', 'analyze'], 
                       help='Mode: test (run tests), watch (watch for changes), analyze (analyze specific files)')
    parser.add_argument('--files', nargs='+', help='Specific files to analyze/test')
    parser.add_argument('--project-root', help='Project root directory')
    
    args = parser.parse_args()
    
    agent = AITestAgent(project_root=args.project_root)
    
    if args.mode == 'test':
        if args.files:
            agent.intelligent_test(args.files)
        else:
            agent.intelligent_test()
    elif args.mode == 'watch':
        agent.watch_and_test()
    elif args.mode == 'analyze':
        if args.files:
            for file in args.files:
                analysis = agent.analyze_changes(file)
                print(f"\n{file}:")
                print(f"  Impact: {analysis['impact']}")
                print(f"  Tests needed: {', '.join(analysis['tests'])}")
                print(f"  Priority: {analysis['priority']}")
                print(f"  Reason: {analysis['reason']}")


if __name__ == '__main__':
    main()

