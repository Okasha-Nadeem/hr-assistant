import React, { useEffect, useState } from "react";
import { getQuestions, applyToJob } from "../api";
import { useSearchParams } from "react-router-dom";

export default function Apply() {
  const [searchParams] = useSearchParams();
  const jobId = Number(searchParams.get("job") || 0);
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<{question:string, answer:string}[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (!jobId) return;
    getQuestions(jobId).then((qs) => {
      setQuestions(qs);
      setAnswers(qs.map((q: string) => ({question: q, answer: ""})));
    });
  }, [jobId]);

  function setAns(i:number, val:string){
    const arr = [...answers];
    arr[i].answer = val;
    setAnswers(arr);
  }

  async function submit(e:React.FormEvent){
    e.preventDefault();
    if(!file) return alert("Upload CV");
    const fd = new FormData();
    fd.append("job_id", String(jobId));
    fd.append("applicant_name", name);
    fd.append("applicant_email", email);
    fd.append("answers_json", JSON.stringify(answers));
    fd.append("resume", file);
    const res = await applyToJob(fd);
    setResult(res);
  }

  return (
    <div>
      <h1>Apply to Job #{jobId}</h1>
      {!questions.length ? <p>Loading questions...</p> : (
        <form onSubmit={submit}>
          <div>
            <label>Name</label><br/>
            <input value={name} onChange={e=>setName(e.target.value)} />
          </div>
          <div>
            <label>Email</label><br/>
            <input value={email} onChange={e=>setEmail(e.target.value)} />
          </div>
          <div>
            <label>Upload CV (pdf/docx)</label><br/>
            <input type="file" accept=".pdf,.docx" onChange={e=> setFile(e.target.files?.[0] ?? null)} />
          </div>
          {questions.map((q, i) => (
            <div key={i}>
              <p>{q}</p>
              <textarea value={answers[i]?.answer ?? ""} onChange={e=>setAns(i, e.target.value)} />
            </div>
          ))}
          <button type="submit">Submit Application</button>
        </form>
      )}
      {result && (
        <div style={{marginTop:20}}>
          <h3>AI Evaluation:</h3>
          <pre>{result.ai_evaluation}</pre>
        </div>
      )}
    </div>
  );
}
