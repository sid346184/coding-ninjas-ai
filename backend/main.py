import json
import uuid
from fastapi import FastAPI
from pydantic import BaseModel
from chains import evaluate_answer
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://coding-ninjas-ai.vercel.app"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


with open("questions.json") as f:
    QUESTIONS = json.load(f)    

sessions = {}

class AnswerRequest(BaseModel):
    session_id: str
    answer: str

@app.post("/start-interview")
def start_interview():
    session_id = str(uuid.uuid4())
    sessions[session_id] = {"current_q": 0, "answers": [], "evaluations": []}
    return {"session_id": session_id, "question": QUESTIONS[0]["question"]}

@app.post("/answer")
def answer_question(req: AnswerRequest):
    session = sessions[req.session_id]
    q_idx = session["current_q"]
    question_data = QUESTIONS[q_idx]

    evaluation = evaluate_answer(
        question_data["question"],
        question_data["answer"],
        req.answer
    )
    
    try:
        if isinstance(evaluation, str):
            import re
            json_match = re.search(r'\{.*\}', evaluation)
            if json_match:
                eval_json = json.loads(json_match.group())
            else:
                raise ValueError("No JSON found in evaluation")
        else:
            eval_json = evaluation

        score_str = str(eval_json.get("score", "0"))
        if "-" in score_str:
            score = float(score_str.split("-")[1])  # Take the higher value
        else:
            score = float(score_str)

        eval_json["score"] = score
        session["answers"].append(req.answer)
        session["evaluations"].append(eval_json)
    except (json.JSONDecodeError, ValueError) as e:
        print(f"Error processing evaluation: {str(e)}")
        eval_json = {
            "score": 0,
            "feedback": "Could not process evaluation"
        }
        session["answers"].append(req.answer)
        session["evaluations"].append(eval_json)

    session["current_q"] += 1
    if session["current_q"] < len(QUESTIONS):
        next_q = QUESTIONS[session["current_q"]]["question"]
        return {"evaluation": eval_json, "next_question": next_q}
    else:
        return {"evaluation": eval_json, "done": True}

@app.get("/summary/{session_id}")
def get_summary(session_id: str):
    session = sessions[session_id]
    
    total_score = 0
    feedback_points = []
    
    for idx, eval_str in enumerate(session["evaluations"]):
        try:
            if isinstance(eval_str, str):
                import re
                json_match = re.search(r'\{.*\}', eval_str)
                if json_match:
                    eval_data = json.loads(json_match.group())
                else:
                    raise ValueError("No JSON found in evaluation string")
            else:
                eval_data = eval_str

            score_str = str(eval_data.get("score", "0"))
            if "-" in score_str:
                score = float(score_str.split("-")[1])  # Take the higher value
            else:
                score = float(score_str)

            feedback = eval_data.get("feedback", "")
            total_score += score
            feedback_points.append(f"Q{idx + 1} ({score}/100): {feedback}")
        except (json.JSONDecodeError, ValueError) as e:
            print(f"Error processing evaluation for Q{idx + 1}: {str(e)}")
            feedback_points.append(f"Q{idx + 1} (0/100): Could not process evaluation")
    
    avg_score = round(total_score / len(session["evaluations"]) if session["evaluations"] else 0, 2)
    
    avg_score = round(total_score / len(session["evaluations"]) if session["evaluations"] else 0, 2)
    
    overall_rating = "Outstanding" if avg_score >= 90 else \
                    "Excellent" if avg_score >= 80 else \
                    "Good" if avg_score >= 70 else \
                    "Fair" if avg_score >= 60 else "Needs Improvement"
    
    overall_feedback = f"Final Score: {avg_score}/100 - {overall_rating}\n\n"
    overall_feedback += "Detailed Feedback:\n" + "\n".join(feedback_points)
    
    return {
        "answers": session["answers"],
        "evaluations": session["evaluations"],
        "final_score": avg_score,
        "overall_feedback": overall_feedback
    }
