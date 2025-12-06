"""
AI Chatbot Service - Code review assistant.
"""

from datetime import datetime
from typing import Dict, List, Any


class CodeReviewChatbot:
    """AI-powered code review assistant."""
    
    def __init__(self, project_id: str):
        self.project_id = project_id
        self.conversation_history: List[Dict] = []
        self.context: Dict[str, Any] = {}
        
    async def load_context(self):
        """Load project context for the chatbot."""
        from services.db import db
        
        project = await db.get_project(self.project_id)
        if project:
            self.context["project"] = {
                "name": project.get("name", "Unknown"),
                "repo_url": project.get("repo_url", "")
            }
        
        metrics = await db.get_metrics(self.project_id)
        if metrics:
            sorted_metrics = sorted(metrics, key=lambda x: x.get("risk_score", 0), reverse=True)
            self.context["top_files"] = [
                {"path": m.get("path", ""), "risk": m.get("risk_score", 0)}
                for m in sorted_metrics[:5]
            ]
            self.context["total_files"] = len(metrics)
        
        smells = await db.get_smells(self.project_id)
        if smells:
            self.context["total_smells"] = len(smells)
            self.context["recent_issues"] = [
                {"type": s.get("type", ""), "path": s.get("path", ""), "message": s.get("message", "")}
                for s in smells[:10]
            ]
            
            # Count by severity
            self.context["critical_issues"] = sum(1 for s in smells if s.get("severity") == "critical")
            self.context["high_issues"] = sum(1 for s in smells if s.get("severity") == "high")
        
        # Calculate quality score
        risks = await db.get_risks(self.project_id)
        if risks:
            avg_risk = sum(r.get("risk_score", 0) for r in risks) / len(risks)
            self.context["quality_score"] = max(0, 100 - avg_risk)
    
    async def chat(self, message: str, file_context: str = None) -> Dict[str, Any]:
        """Process a chat message and return a response."""
        if not self.context:
            await self.load_context()
        
        # Generate response based on message patterns
        response = self._generate_response(message)
        
        self.conversation_history.append({"role": "user", "content": message})
        self.conversation_history.append({"role": "assistant", "content": response})
        
        return {
            "success": True,
            "response": response,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    def _generate_response(self, message: str) -> str:
        """Generate a helpful response based on the message."""
        message_lower = message.lower()
        
        if any(word in message_lower for word in ["quality", "score", "health"]):
            score = self.context.get("quality_score", "N/A")
            issues = self.context.get("total_smells", 0)
            return f"""📊 **Project Quality Overview**

Your current quality score is **{score:.1f}%** with **{issues}** total issues detected.

**Breakdown:**
- Critical Issues: {self.context.get("critical_issues", 0)}
- High Priority: {self.context.get("high_issues", 0)}
- Total Files Analyzed: {self.context.get("total_files", 0)}

**Recommendation:** Focus on fixing critical issues first, as they often indicate security vulnerabilities or major bugs."""
        
        if any(word in message_lower for word in ["risk", "risky", "dangerous"]):
            top_files = self.context.get("top_files", [])
            if top_files:
                files_list = "\n".join([f"- `{f['path']}` (Risk: {f['risk']:.0f}%)" for f in top_files])
                return f"""⚠️ **Highest Risk Files**

These files need the most attention:

{files_list}

**Why these files?** They have high complexity, potential security issues, or code smells that increase bug probability."""
            return "No risk data available. Try analyzing a repository first."
        
        if any(word in message_lower for word in ["fix", "solve", "resolve", "how to"]):
            issues = self.context.get("recent_issues", [])
            if issues:
                issue = issues[0]
                return f"""🔧 **Fixing Issues**

Your most recent issue is:
- **Type:** {issue['type']}
- **File:** `{issue['path']}`
- **Issue:** {issue['message'][:200]}

**General Fix Strategies:**
1. **For complexity issues:** Break large functions into smaller, focused ones
2. **For security issues:** Validate inputs, use parameterized queries, avoid eval()
3. **For code smells:** Apply SOLID principles and design patterns
4. **For duplication:** Extract common code into shared utilities

Would you like specific help with any of these issues?"""
            return "No issues found to fix. Your code looks clean!"
        
        if any(word in message_lower for word in ["issue", "problem", "bug", "smell"]):
            issues = self.context.get("recent_issues", [])[:5]
            if issues:
                issues_list = "\n".join([f"- [{i['type']}] `{i['path']}`: {i['message'][:80]}..." for i in issues])
                return f"""🐛 **Recent Issues**

Here are the most recent issues found:

{issues_list}

Total issues: {self.context.get('total_smells', 0)}"""
            return "No issues found in your codebase. Great job!"
        
        if any(word in message_lower for word in ["hello", "hi", "hey", "help"]):
            return """👋 **Hello! I'm Deep Lynctus AI**

I'm your code review assistant. I can help you with:

🔍 **Analysis**
- "What's my code quality score?"
- "Which files are most risky?"
- "Show me the main issues"

🔧 **Fixes**
- "How do I fix these issues?"
- "What should I prioritize?"
- "Explain this code smell"

📈 **Insights**
- "How has quality changed?"
- "What patterns do you see?"
- "Suggest improvements"

Just ask me anything about your codebase!"""
        
        # Default response
        return f"""I understand you're asking about: *"{message}"*

Based on your project analysis:

📊 **Quick Stats:**
- Files Analyzed: {self.context.get("total_files", "N/A")}
- Issues Found: {self.context.get("total_smells", "N/A")}
- Quality Score: {self.context.get("quality_score", "N/A"):.1f}%

Try asking me:
- "What are the riskiest files?"
- "How can I improve code quality?"
- "Explain the critical issues"

I'm here to help you write better code! 🚀"""
    
    def clear_history(self):
        self.conversation_history = []


_chatbot_sessions: Dict[str, CodeReviewChatbot] = {}


async def get_chatbot(project_id: str) -> CodeReviewChatbot:
    if project_id not in _chatbot_sessions:
        chatbot = CodeReviewChatbot(project_id)
        await chatbot.load_context()
        _chatbot_sessions[project_id] = chatbot
    return _chatbot_sessions[project_id]


async def chat_with_assistant(project_id: str, message: str, file_context: str = None) -> Dict[str, Any]:
    chatbot = await get_chatbot(project_id)
    return await chatbot.chat(message, file_context)


async def clear_chat_session(project_id: str):
    if project_id in _chatbot_sessions:
        _chatbot_sessions[project_id].clear_history()
