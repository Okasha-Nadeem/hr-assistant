import React, { useEffect, useState } from "react";
import { listJobs, createJob } from "../api";
import axios from "axios";

export default function HRDashboard(){
  const [jobs, setJobs] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [reqs, setReqs] = useState("");

  useEffect(()=>{ listJobs().then(setJobs) }, []);

  async function addJob(e:React.FormEvent){
    e.preventDefault();
    await createJob({title, description:desc, requirements:reqs});
    const j = await listJobs();
    setJobs(j);
    setTitle(""); setDesc(""); setReqs("");
  }

  return (
    <div>
      <h1>HR Dashboard</h1>
      <form onSubmit={addJob}>
        <input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
        <textarea placeholder="Description" value={desc} onChange={e=>setDesc(e.target.value)} />
        <textarea placeholder="Requirements" value={reqs} onChange={e=>setReqs(e.target.value)} />
        <button type="submit">Create Job</button>
      </form>

      <h2>Jobs</h2>
      {jobs.map(j=>(
        <div key={j.id} style={{border:"1px solid #ddd", margin:6, padding:6}}>
          <h3>{j.title}</h3>
          <p>{j.description}</p>
          <p><strong>Requirements:</strong> {j.requirements}</p>
          <a href={`/hr/job/${j.id}/applications`}>View applications (implement later)</a>
        </div>
      ))}
    </div>
  )
}
