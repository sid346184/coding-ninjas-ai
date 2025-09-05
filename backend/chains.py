from langchain.prompts import PromptTemplate
from langchain_groq import ChatGroq
import os
from dotenv import load_dotenv
load_dotenv()

llm = ChatGroq(
    model="deepseek-r1-distill-llama-70b",
    temperature=0.7,  # Lower temperature for more consistent outputs
    max_tokens=None,
    reasoning_format="parsed",  # Using parsed format for structured output
    timeout=None,
    max_retries=2,
)
evaluation_prompt = PromptTemplate.from_template("""
You are an Excel interviewer evaluating a candidate's answer. 
Generate a response in this EXACT format and structure (note the double curly braces):

{{
  "score": <number between 0 and 100>,
  "feedback": "<one or two sentences of specific, constructive feedback>"
}}

Question: {question}
Expected Answer: {expected}
Candidate Answer: {candidate}

Scoring Guidelines:
- Score should be a single number between 0-100
- 90-100: Excellent answer with complete understanding
- 70-89: Good answer with minor omissions
- 50-69: Partial understanding with gaps
- Below 50: Significant misunderstanding or incomplete
- 0: Completely incorrect or unrelated answer

Focus on:
1. Accuracy of technical concepts
2. Completeness of the answer
3. Clarity of explanation
4. Practical understanding

Remember: Return ONLY the JSON object with score and feedback. No other text or formatting.""")

def evaluate_answer(question, expected, candidate):
    chain = evaluation_prompt | llm
    response = chain.invoke({
        "question": question,
        "expected": expected,
        "candidate": candidate
    }).content
    
    try:
        # Try to parse as JSON directly first
        import json
        clean_json = json.loads(response)
        return clean_json
    except json.JSONDecodeError:
        # If that fails, try to extract JSON from the response
        import re
        json_match = re.search(r'\{[^{]*"score":\s*(\d+|\d+\.\d+|\d+-\d+)[^}]*\}', response)
        if json_match:
            try:
                extracted_json = json.loads(json_match.group())
                # Handle score ranges if present
                score = str(extracted_json.get('score', '0'))
                if '-' in score:
                    score = float(score.split('-')[1])  # Take the higher value
                else:
                    score = float(score)
                return {
                    "score": score,
                    "feedback": extracted_json.get('feedback', 'No feedback provided')
                }
            except (json.JSONDecodeError, ValueError):
                pass
        
        # If all parsing attempts fail, return a default response
        return {
            "score": 0,
            "feedback": f"Error processing evaluation. Raw response: {response[:200]}..."
        }
